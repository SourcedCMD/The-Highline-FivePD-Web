import { NextRequest, NextResponse } from 'next/server'
import { getFreshStaffSession } from '@/lib/require-staff'
import { updateApplicationStatus } from '@/lib/application-sync'

// PATCH /api/staff/applications/:id  body: { status: 'accepted' | 'denied' | 'pending' | 'closed' }
// Goes through the same shared sync helper the Discord dropdown uses, so a change
// made here also updates (and edits) the linked Discord message automatically.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const staff = await getFreshStaffSession()
  if (!staff) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
  }

  const body = await request.json()
  const { status } = body

  const result = await updateApplicationStatus(params.id, status, staff.username)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ application: result.application })
}
