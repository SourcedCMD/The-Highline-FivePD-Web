import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { verifySessionToken } from '@/lib/session'
import type { DiscordUser } from '@/lib/auth'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getVerifiedSession(): Promise<DiscordUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('discord-session')?.value
  return verifySessionToken<DiscordUser>(token)
}

// GET /api/profile - current user's profile info + their applications
export async function GET(request: NextRequest) {
  const session = await getVerifiedSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const supabase = supabaseAdmin()

  const [{ data: userRow }, { data: applications }] = await Promise.all([
    supabase.from('users').select('*').eq('discord_id', session.id).single(),
    supabase
      .from('applications')
      .select('*')
      .eq('user_id', session.id)
      .order('submitted_at', { ascending: false }),
  ])

  return NextResponse.json({
    profile: userRow ?? null,
    applications: applications ?? [],
  })
}

// PATCH /api/profile - update editable profile fields (currently: bio)
export async function PATCH(request: NextRequest) {
  const session = await getVerifiedSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json()
  const bio = typeof body.bio === 'string' ? body.bio.slice(0, 500) : null

  const supabase = supabaseAdmin()
  const { error } = await supabase
    .from('users')
    .update({ bio, updated_at: new Date().toISOString() })
    .eq('discord_id', session.id)

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
