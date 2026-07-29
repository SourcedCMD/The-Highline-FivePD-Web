'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import { getSession } from '@/lib/auth'
import type { DiscordUser } from '@/lib/auth'

interface Application {
  id: string
  department_id: string
  department_name: string
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  notes: string | null
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  accepted: 'bg-green-900/50 text-green-300 border-green-700',
  denied: 'bg-red-900/50 text-red-300 border-red-700',
  closed: 'bg-gray-800 text-gray-400 border-gray-700',
}

export default function ProfilePage() {
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const session = await getSession()
      setUser(session)

      if (session) {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setApplications(data.applications ?? [])
          setBio(data.profile?.bio ?? '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveBio = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-300">You need to sign in to view your profile.</p>
        <Link href="/api/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-6 bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-20 h-20 rounded-full" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
                {user.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="text-gray-400">{user.email}</p>
              {user.isStaff && (
                <span className="inline-block mt-2 text-xs bg-blue-900/50 text-blue-300 border border-blue-700 rounded px-2 py-1">
                  Staff Member
                </span>
              )}
            </div>
          </motion.div>

          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <label htmlFor="bio" className="block text-sm font-medium mb-2 text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community a bit about yourself..."
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500 mb-3"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveBio}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && <span className="text-green-400 text-sm">Saved!</span>}
            </div>
          </motion.div>

          {/* Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-8 border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
            {applications.length === 0 ? (
              <p className="text-gray-400">
                You haven&apos;t submitted any applications yet.{' '}
                <Link href="/forums" className="text-blue-400 hover:text-blue-300">
                  Browse departments
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-gray-900 border border-gray-700 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium">{app.department_name}</p>
                      <p className="text-sm text-gray-400">
                        Submitted {new Date(app.submitted_at).toLocaleDateString()}
                      </p>
                      {app.reviewed_at && (
                        <p className="text-xs text-gray-500">
                          Reviewed {new Date(app.reviewed_at).toLocaleDateString()}
                          {app.reviewed_by ? ` by ${app.reviewed_by}` : ''}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wide border rounded px-3 py-1 w-fit ${
                        statusStyles[app.status] ?? statusStyles.pending
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
