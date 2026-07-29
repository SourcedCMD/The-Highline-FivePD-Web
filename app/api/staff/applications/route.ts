import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStaffSession } from '@/lib/require-staff'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET /api/staff/applications?status=pending&department=lspd
export async function GET(request: NextRequest) {
  const staff = await getStaffSession()
  if (!staff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const status = request.nextUrl.searchParams.get('status')
  const department = request.nextUrl.searchParams.get('department')

  const supabase = supabaseAdmin()
  let query = supabase.from('applications').select('*').order('submitted_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (department && department !== 'all') query = query.eq('department_id', department)

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }

  return NextResponse.json({ applications: data ?? [] })
}
