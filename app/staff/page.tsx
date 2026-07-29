import Link from 'next/link'
import { getStaffSession } from '@/lib/require-staff'
import StaffDashboard from '@/components/StaffDashboard'

export default async function StaffPage() {
  const staff = await getStaffSession()

  if (!staff) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-400 max-w-md">
          The staff panel is only available to members with the staff role in our Discord server.
        </p>
        <Link href="/" className="text-blue-400 hover:text-blue-300">
          ← Back to Home
        </Link>
      </div>
    )
  }

  return <StaffDashboard staffUsername={staff.username} />
}
