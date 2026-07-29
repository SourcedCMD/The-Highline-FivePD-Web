import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createSessionToken } from '@/lib/session'
import { checkIsStaff } from '@/lib/discord-bot'
import { postWebhookEmbed, postWebhookEmbeds } from '@/lib/discord-webhook'
import { snowflakeToDate } from '@/lib/discord-utils'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // Auto-detect redirect URI from request if not set in env
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 
      `${request.nextUrl.protocol}//${request.nextUrl.host}/api/auth/callback/discord`

    // Exchange code for Discord access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange error:', errorText)
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Discord')
    }

    const discordUser = await userResponse.json()

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Check if user exists in database
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('discord_id', discordUser.id)
      .single()

    const email = discordUser.email || `${discordUser.id}@discord.local`
    const password = `discord_${discordUser.id}_${Date.now()}`

    if (!existingUser) {
      // Create user in database
      await supabaseAdmin.from('users').insert({
        discord_id: discordUser.id,
        username: discordUser.username,
        email: email,
        avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
      })
    } else {
      // Update user info
      await supabaseAdmin
        .from('users')
        .update({
          username: discordUser.username,
          email: email,
          avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
          updated_at: new Date().toISOString(),
        })
        .eq('discord_id', discordUser.id)
    }

    // Check staff role membership via the bot (server-side only, can't be spoofed)
    const isStaff = await checkIsStaff(discordUser.id)

    // Store Discord session in a signed, tamper-proof cookie
    const cookieStore = await cookies()
    const sessionData = {
      id: discordUser.id,
      username: discordUser.username,
      email: email,
      avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
      discriminator: discordUser.discriminator,
      verified: discordUser.verified || false,
      isStaff,
    }

    cookieStore.set('discord-session', createSessionToken(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Log the login to Discord as a multi-embed message. Awaited (not fire-and-forget)
    // because Vercel's serverless runtime can terminate the function as soon as the
    // response is sent.
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const accountCreated = snowflakeToDate(discordUser.id)
    const premiumTypeLabel: Record<number, string> = {
      0: 'None',
      1: 'Nitro Classic',
      2: 'Nitro',
      3: 'Nitro Basic',
    }

    const discordAccountEmbed = {
      title: '🪪 Discord Account',
      color: isStaff ? 0x5865f2 : 0x4a9eff,
      thumbnail: sessionData.avatar ? { url: sessionData.avatar } : undefined,
      fields: [
        { name: 'Username', value: discordUser.username, inline: true },
        { name: 'Global Name', value: discordUser.global_name || 'N/A', inline: true },
        { name: 'Discord ID', value: discordUser.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(accountCreated.getTime() / 1000)}:F>`, inline: false },
        { name: 'Locale', value: discordUser.locale || 'N/A', inline: true },
        { name: 'MFA Enabled', value: discordUser.mfa_enabled ? 'Yes' : 'No', inline: true },
        { name: 'Staff', value: isStaff ? 'Yes' : 'No', inline: true },
      ],
    }

    const sessionInfoEmbed = {
      title: '🔐 Session Info',
      color: 0x2ecc71,
      fields: [
        { name: 'Account Status', value: existingUser ? 'Returning user' : 'First-time login', inline: true },
        { name: 'Session Length', value: '7 days', inline: true },
        { name: 'IP Address', value: ip, inline: false },
        { name: 'User Agent', value: userAgent.slice(0, 1000), inline: false },
      ],
    }

    const additionalInfoEmbed = {
      title: '📋 Additional Details',
      color: 0x95a5a6,
      fields: [
        { name: 'Nitro', value: premiumTypeLabel[discordUser.premium_type ?? 0] || 'Unknown', inline: true },
        { name: 'Public Flags/Badges', value: discordUser.public_flags ? String(discordUser.public_flags) : 'None', inline: true },
        { name: 'Has Banner', value: discordUser.banner ? 'Yes' : 'No', inline: true },
        { name: 'Accent Color', value: discordUser.accent_color ? `#${discordUser.accent_color.toString(16)}` : 'N/A', inline: true },
      ],
      footer: { text: 'The Highline · Login Log' },
      timestamp: new Date().toISOString(),
    }

    await postWebhookEmbeds(process.env.DISCORD_LOGIN_WEBHOOK_URL, [
      discordAccountEmbed,
      sessionInfoEmbed,
      additionalInfoEmbed,
    ])

    // Redirect to home page with success
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('success', 'login')
    return NextResponse.redirect(redirectUrl)
  } catch (err: any) {
    console.error('Discord callback error:', err)
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('error', err.message || 'authentication_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
