import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

    // Store Discord session in cookie
    const cookieStore = await cookies()
    const sessionData = {
      id: discordUser.id,
      username: discordUser.username,
      email: email,
      avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
      discriminator: discordUser.discriminator,
      verified: discordUser.verified || false,
    }

    cookieStore.set('discord-session', JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

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
