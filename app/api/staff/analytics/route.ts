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

// GET /api/staff/analytics - summary counts for the staff dashboard
export async function GET(request: NextRequest) {
  const staff = await getStaffSession()
  if (!staff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const supabase = supabaseAdmin()
  const { data: applications, error } = await supabase
    .from('applications')
    .select('department_id, department_name, status, submitted_at')

  if (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }

  const rows = applications ?? []
  const total = rows.length
  const byStatus: Record<string, number> = {}
  const byDepartment: Record<string, { name: string; total: number; pending: number; accepted: number; denied: number }> = {}

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1

    if (!byDepartment[row.department_id]) {
      byDepartment[row.department_id] = {
        name: row.department_name,
        total: 0,
        pending: 0,
        accepted: 0,
        denied: 0,
      }
    }
    byDepartment[row.department_id].total += 1
    if (row.status === 'pending') byDepartment[row.department_id].pending += 1
    if (row.status === 'accepted') byDepartment[row.department_id].accepted += 1
    if (row.status === 'denied') byDepartment[row.department_id].denied += 1
  }

  // Applications submitted in the last 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const last7Days = rows.filter((r) => new Date(r.submitted_at).getTime() >= weekAgo).length

  return NextResponse.json({
    total,
    byStatus,
    byDepartment,
    last7Days,
  })
}
