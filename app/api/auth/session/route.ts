import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { verifySessionToken } from '@/lib/session'
import type { DiscordUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('discord-session')?.value
  const session = verifySessionToken<DiscordUser>(token)

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  // Attach bio from the database (kept out of the cookie so it can be edited without re-login)
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data } = await supabaseAdmin
      .from('users')
      .select('bio')
      .eq('discord_id', session.id)
      .single()

    return NextResponse.json({ user: { ...session, bio: data?.bio ?? null } }, { status: 200 })
  } catch {
    return NextResponse.json({ user: session }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('discord-session')
  return NextResponse.json({ success: true }, { status: 200 })
}
