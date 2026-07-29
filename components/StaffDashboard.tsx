'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

interface Application {
  id: string
  department_id: string
  department_name: string
  user_id: string
  user_email: string
  username: string
  age: number
  experience: string
  why_join: string
  what_can_you_bring: string
  availability: string
  previous_experience: string | null
  submitted_at: string
  status: string
  reviewed_by: string | null
  reviewed_at: string | null
  notes: string | null
}

interface DepartmentStatus {
  department_id: string
  is_open: boolean
}

// Keep in sync with the department/staff-job/server-application ids used in app/forums/page.tsx
const ALL_DEPARTMENTS = [
  { id: 'sast', name: 'California Highway Patrol' },
  { id: 'bcso', name: 'Los Angeles Sheriffs Department' },
  { id: 'lspd', name: 'Los Angeles Police Department' },
  { id: 'safr', name: 'California Fire Department' },
  { id: 'cc', name: 'Certified Civilian' },
  { id: 'event-team', name: 'Event Team' },
  { id: 'support-team', name: 'Support Team' },
  { id: 'appeals-team', name: 'Appeals Team' },
  { id: 'chat-moderation', name: 'Chat Moderation' },
  { id: 'store-team', name: '24/7 Store Team' },
  { id: 'staff-team', name: 'Staff Team' },
  { id: 'dev-team', name: 'Development Team' },
]

type Tab = 'applications' | 'departments' | 'analytics'

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  accepted: 'bg-green-900/50 text-green-300 border-green-700',
  denied: 'bg-red-900/50 text-red-300 border-red-700',
  closed: 'bg-gray-800 text-gray-400 border-gray-700',
}

export default function StaffDashboard({ staffUsername }: { staffUsername: string }) {
  const [tab, setTab] = useState<Tab>('applications')

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Staff Panel</h1>
            <p className="text-gray-400">Signed in as {staffUsername}</p>
          </div>

          <div className="flex gap-2 mb-8 border-b border-gray-800">
            {(['applications', 'departments', 'analytics'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 capitalize border-b-2 transition ${
                  tab === t
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'applications' && <ApplicationsTab />}
          {tab === 'departments' && <DepartmentsTab />}
          {tab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </PageTransition>
  )
}

function ApplicationsTab() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [deptFilter, setDeptFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actioning, setActioning] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (deptFilter !== 'all') params.set('department', deptFilter)

    const res = await fetch(`/api/staff/applications?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setApplications(data.applications ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, deptFilter])

  const updateStatus = async (id: string, status: string) => {
    setActioning(id)
    try {
      const res = await fetch(`/api/staff/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id || statusFilter === 'all'))
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        )
      }
    } finally {
      setActioning(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="denied">Denied</option>
          <option value="closed">Closed</option>
          <option value="all">All Statuses</option>
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Departments</option>
          {ALL_DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-400">No applications match these filters.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              layout
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-medium">
                    {app.username} <span className="text-gray-500">→</span> {app.department_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Submitted {new Date(app.submitted_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs uppercase tracking-wide border rounded px-3 py-1 ${
                    statusStyles[app.status] ?? statusStyles.pending
                  }`}
                >
                  {app.status}
                </span>
              </button>

              {expandedId === app.id && (
                <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-3 text-sm">
                  <p><span className="text-gray-400">Age:</span> {app.age}</p>
                  <p><span className="text-gray-400">Experience:</span> {app.experience}</p>
                  <p><span className="text-gray-400">Why join:</span> {app.why_join}</p>
                  <p><span className="text-gray-400">What they bring:</span> {app.what_can_you_bring}</p>
                  <p><span className="text-gray-400">Availability:</span> {app.availability}</p>
                  {app.previous_experience && (
                    <p><span className="text-gray-400">Previous experience:</span> {app.previous_experience}</p>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      disabled={actioning === app.id}
                      onClick={() => updateStatus(app.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition"
                    >
                      Accept
                    </button>
                    <button
                      disabled={actioning === app.id}
                      onClick={() => updateStatus(app.id, 'denied')}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition"
                    >
                      Deny
                    </button>
                    <button
                      disabled={actioning === app.id}
                      onClick={() => updateStatus(app.id, 'closed')}
                      className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition"
                    >
                      Close
                    </button>
                    {app.status !== 'pending' && (
                      <button
                        disabled={actioning === app.id}
                        onClick={() => updateStatus(app.id, 'pending')}
                        className="bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition"
                      >
                        Reopen as Pending
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function DepartmentsTab() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/staff/departments')
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, boolean> = {}
        for (const d of data.departments as DepartmentStatus[]) {
          map[d.department_id] = d.is_open
        }
        setStatuses(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggle = async (departmentId: string) => {
    const current = statuses[departmentId] ?? true
    const next = !current
    setSaving(departmentId)
    setStatuses((prev) => ({ ...prev, [departmentId]: next }))
    try {
      await fetch('/api/staff/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, isOpen: next }),
      })
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <p className="text-gray-400">Loading departments...</p>

  return (
    <div className="space-y-3">
      {ALL_DEPARTMENTS.map((d) => {
        const isOpen = statuses[d.id] ?? true
        return (
          <div
            key={d.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-gray-400">
                Applications are currently {isOpen ? 'open' : 'closed'}
              </p>
            </div>
            <button
              disabled={saving === d.id}
              onClick={() => toggle(d.id)}
              className={`px-4 py-2 rounded text-sm transition disabled:opacity-50 ${
                isOpen
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isOpen ? 'Close Applications' : 'Open Applications'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function AnalyticsTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/staff/analytics')
      if (res.ok) setData(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-gray-400">Loading analytics...</p>
  if (!data) return <p className="text-gray-400">Failed to load analytics.</p>

  const cards = [
    { label: 'Total Applications', value: data.total },
    { label: 'Pending', value: data.byStatus.pending ?? 0 },
    { label: 'Accepted', value: data.byStatus.accepted ?? 0 },
    { label: 'Denied', value: data.byStatus.denied ?? 0 },
    { label: 'Last 7 Days', value: data.last7Days },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">By Department</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="py-2 pr-4">Department</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Pending</th>
              <th className="py-2 pr-4">Accepted</th>
              <th className="py-2 pr-4">Denied</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.byDepartment).map(([id, stats]: [string, any]) => (
              <tr key={id} className="border-b border-gray-900">
                <td className="py-2 pr-4">{stats.name}</td>
                <td className="py-2 pr-4">{stats.total}</td>
                <td className="py-2 pr-4">{stats.pending}</td>
                <td className="py-2 pr-4">{stats.accepted}</td>
                <td className="py-2 pr-4">{stats.denied}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
