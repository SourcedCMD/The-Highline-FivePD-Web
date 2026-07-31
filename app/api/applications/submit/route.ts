import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { sendBotMessage } from '@/lib/discord-bot'
import { buildApplicationMessage, type ApplicationRow } from '@/lib/application-embed'
import { postWebhookEmbed } from '@/lib/discord-webhook'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies()
    const token = cookieStore.get('discord-session')?.value
    const session = verifySessionToken<{ id: string }>(token)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      department,
      departmentName,
      userId,
      userEmail,
      username,
      age,
      experience,
      whyJoin,
      whatCanYouBring,
      availability,
      previousExperience,
    } = body

    // Validate required fields
    if (!department || !userId || !age || !experience || !whyJoin || !whatCanYouBring || !availability) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Block submission if a staff member has closed this department's applications
    const { data: deptStatus } = await supabase
      .from('department_status')
      .select('is_open')
      .eq('department_id', department)
      .maybeSingle()

    if (deptStatus && deptStatus.is_open === false) {
      return NextResponse.json(
        { error: 'Applications for this department are currently closed' },
        { status: 403 }
      )
    }

    const { data: inserted, error: dbError } = await supabase
      .from('applications')
      .insert({
        department_id: department,
        department_name: departmentName,
        user_id: userId,
        user_email: userEmail,
        username: username,
        age: parseInt(age),
        experience,
        why_join: whyJoin,
        what_can_you_bring: whatCanYouBring,
        availability,
        previous_experience: previousExperience || null,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (dbError || !inserted) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save application to database' },
        { status: 500 }
      )
    }

    const applicationRow = inserted as ApplicationRow
    const { embeds, components } = buildApplicationMessage(applicationRow)
    const channelId = process.env.DISCORD_APPLICATIONS_CHANNEL_ID

    if (channelId && process.env.DISCORD_BOT_TOKEN) {
      // Posted by the bot (not the webhook) so the dropdown can receive interactions
      const message = await sendBotMessage(channelId, { embeds, components })

      if (message?.id) {
        await supabase
          .from('applications')
          .update({ discord_message_id: message.id, discord_channel_id: channelId })
          .eq('id', applicationRow.id)
      }
    } else if (process.env.DISCORD_WEBHOOK_URL) {
      // Fallback: bot isn't configured yet, so post via the plain webhook.
      // No interactive dropdown in this mode - just a notification.
      await postWebhookEmbed(process.env.DISCORD_WEBHOOK_URL, embeds[0])
      await postWebhookEmbed(process.env.DISCORD_WEBHOOK_URL, embeds[1])
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
