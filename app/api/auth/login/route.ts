import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Auto-detect redirect URI from request if not set in env
  const baseUrl = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 
    `${request.nextUrl.protocol}//${request.nextUrl.host}/api/auth/callback/discord`
  
  // Discord OAuth URL
  const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize')
  discordAuthUrl.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!)
  discordAuthUrl.searchParams.set('redirect_uri', baseUrl)
  discordAuthUrl.searchParams.set('response_type', 'code')
  discordAuthUrl.searchParams.set('scope', 'identify email')

  return NextResponse.redirect(discordAuthUrl.toString())
}
