import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStaffSession, getFreshStaffSession } from '@/lib/require-staff'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/staff/departments - list open/closed status for every department seen so far
export async function GET(request: NextRequest) {
  const staff = await getStaffSession()
  if (!staff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const supabase = supabaseAdmin()
  const { data, error } = await supabase.from('department_status').select('*')

  if (error) {
    console.error('Failed to fetch department status:', error)
    return NextResponse.json({ error: 'Failed to fetch department status' }, { status: 500 })
  }

  return NextResponse.json({ departments: data ?? [] })
}

// PATCH /api/staff/departments  body: { departmentId: string, isOpen: boolean }
export async function PATCH(request: NextRequest) {
  const staff = await getFreshStaffSession()
  if (!staff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const body = await request.json()
  const { departmentId, isOpen } = body

  if (!departmentId || typeof isOpen !== 'boolean') {
    return NextResponse.json({ error: 'departmentId and isOpen are required' }, { status: 400 })
  }

  const supabase = supabaseAdmin()
  const { error } = await supabase.from('department_status').upsert({
    department_id: departmentId,
    is_open: isOpen,
    updated_at: new Date().toISOString(),
    updated_by: staff.username,
  })

  if (error) {
    console.error('Failed to update department status:', error)
    return NextResponse.json({ error: 'Failed to update department status' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
