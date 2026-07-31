import { NextRequest, NextResponse } from 'next/server'
import { verifyKey } from 'discord-interactions'
import { updateApplicationStatus } from '@/lib/application-sync'

// Discord interaction type/response constants (see Discord docs)
const InteractionType = { PING: 1, MESSAGE_COMPONENT: 3 }
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  UPDATE_MESSAGE: 7,
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature-ed25519')
  const timestamp = request.headers.get('x-signature-timestamp')
  const rawBody = await request.text()

  const publicKey = process.env.DISCORD_PUBLIC_KEY
  if (!publicKey || !signature || !timestamp) {
    return NextResponse.json({ error: 'Bad request signature' }, { status: 401 })
  }

  const isValid = verifyKey(rawBody, signature, timestamp, publicKey)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 })
  }

  const interaction = JSON.parse(rawBody)

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG })
  }

  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId: string = interaction.data?.custom_id ?? ''

    if (!customId.startsWith('app_status_')) {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Unrecognized action.', flags: 64 },
      })
    }

    // Only guild members with the staff role can act on this - Discord includes
    // the invoking member's roles directly on the interaction, no extra API call needed
    const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID
    const memberRoles: string[] = interaction.member?.roles ?? []
    const isStaff = !!staffRoleId && memberRoles.includes(staffRoleId)

    if (!isStaff) {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "You don't have permission to review applications.",
          flags: 64, // ephemeral - only the clicker sees this
        },
      })
    }

    const applicationId = customId.replace('app_status_', '')
    const chosenStatus: string = interaction.data?.values?.[0]
    const reviewer =
      interaction.member?.user?.username ?? interaction.member?.nick ?? 'Unknown Staff'

    const result = await updateApplicationStatus(applicationId, chosenStatus, reviewer)

    if (!result.ok) {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Failed to update: ${result.error}`, flags: 64 },
      })
    }

    // Re-build the message from the freshly updated row and edit it in place
    const { buildApplicationMessage } = await import('@/lib/application-embed')
    const { embeds, components } = buildApplicationMessage(result.application)

    return NextResponse.json({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: { embeds, components },
    })
  }

  return NextResponse.json({ error: 'Unhandled interaction type' }, { status: 400 })
}
