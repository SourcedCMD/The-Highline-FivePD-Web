import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFreshStaffSession } from '@/lib/require-staff'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const ALLOWED_STATUSES = ['pending', 'accepted', 'denied', 'closed']

// PATCH /api/staff/applications/:id  body: { status: 'accepted' | 'denied' | 'pending' | 'closed', notes?: string }
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const staff = await getFreshStaffSession()
  if (!staff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const body = await request.json()
  const { status, notes } = body

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase
    .from('applications')
    .update({
      status,
      notes: typeof notes === 'string' ? notes.slice(0, 1000) : undefined,
      reviewed_by: staff.username,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }

  return NextResponse.json({ application: data })
}
