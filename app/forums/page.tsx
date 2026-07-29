'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import { getSession } from '@/lib/auth'
import DepartmentCard from '@/components/DepartmentCard'
import ApplicationForm from '@/components/ApplicationForm'
import type { DiscordUser } from '@/lib/auth'

const departments = [
  {
    id: 'sast',
    name: 'California Highway Patrol',
    icon: '🚔',
    description: 'The California Highway Patrol ensures that everything is smoothly running safe and sound.',
    category: 'Department Applications',
  },
  {
    id: 'bcso',
    name: 'Los Angeles Sheriffs Department',
    icon: '👮',
    description: 'The Los Angeles Sheriffs Department is the primary law enforcement agency in Los Angeles County.',
    category: 'Department Applications',
  },
  {
    id: 'lspd',
    name: 'Los Angeles Police Department',
    icon: '🚓',
    description: 'The Los Angeles Police Department is the primary law enforcement agency in Los Angeles.',
    category: 'Department Applications',
  },
  {
    id: 'safr',
    name: 'California Fire Department',
    icon: '🚒',
    description: 'The California Fire Department is the primary fire and rescue service in California.',
    category: 'Department Applications',
  },
  {
    id: 'cc',
    name: 'Certified Civilian',
    icon: '👤',
    description: 'Certified Civilians are the backbone of the community.',
    category: 'Department Applications',
  },
]

const staffJobs = [
  {
    id: 'event-team',
    name: 'Event Team',
    icon: '🎉',
    description: 'The Event Team makes the server poppin!',
    category: 'Staff Job Applications',
  },
  {
    id: 'support-team',
    name: 'Support Team',
    icon: '💬',
    description: 'The Support Team is a group of individuals that share the common goal of helping members of our community with any questions or concerns they may have.',
    category: 'Staff Job Applications',
  },
  {
    id: 'appeals-team',
    name: 'Appeals Team',
    icon: '⚖️',
    description: 'The Appeals Team makes sure our community is top notch with the best Roleplayers!',
    category: 'Staff Job Applications',
  },
  {
    id: 'chat-moderation',
    name: 'Chat Moderation',
    icon: '💼',
    description: 'Chat Moderation makes sure that our chats are active and safe.',
    category: 'Staff Job Applications',
  },
  {
    id: 'store-team',
    name: '24/7 Store Team',
    icon: '🏪',
    description: 'The 24/7 Staff Job',
    category: 'Staff Job Applications',
  },
]

const serverApplications = [
  {
    id: 'staff-team',
    name: 'Staff Team',
    icon: '🛡️',
    description: 'Staff Members are the defenders of the community.',
    category: 'Server Applications',
  },
  {
    id: 'dev-team',
    name: 'Development Team',
    icon: '💻',
    description: 'The Development Team is a group that operates to improve the server experience.',
    category: 'Server Applications',
  },
]

const appeals = [
  {
    id: 'ingame-ban',
    name: 'In-Game Ban',
    icon: '🔨',
    description: 'Appeal an in-game ban.',
    category: 'Appeals',
  },
  {
    id: 'anticheat-ban',
    name: 'Anti-Cheat Ban',
    icon: '🛡️',
    description: 'Appeal an anti-cheat ban.',
    category: 'Appeals',
  },
  {
    id: 'global-ban',
    name: 'Global Ban',
    icon: '🌐',
    description: 'Appeal A Global Ban.',
    category: 'Appeals',
  },
  {
    id: 'blacklist',
    name: 'Blacklist',
    icon: '🚫',
    description: 'Appeal A Blacklist.',
    category: 'Appeals',
  },
]

export default function ForumsPage() {
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const session = await getSession()
      setUser(session)
      setLoading(false)
    }
    loadUser()

    const interval = setInterval(loadUser, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (selectedDepartment) {
    const dept = [...departments, ...staffJobs, ...serverApplications].find(d => d.id === selectedDepartment)
    return (
      <ApplicationForm
        department={dept!}
        user={user}
        onBack={() => setSelectedDepartment(null)}
      />
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-center"
          >
            Forums
          </motion.h1>

          {/* Department Applications */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6">Department Applications</h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onClick={() => {
                    if (user) {
                      setSelectedDepartment(dept.id)
                    } else {
                      window.location.href = '/api/auth/login'
                    }
                  }}
                  disabled={!user}
                />
              ))}
            </motion.div>
          </motion.section>

          {/* Staff Job Applications */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6">Staff Job Applications</h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {staffJobs.map((job) => (
                <DepartmentCard
                  key={job.id}
                  department={job}
                  onClick={() => {
                    if (user) {
                      setSelectedDepartment(job.id)
                    } else {
                      window.location.href = '/api/auth/login'
                    }
                  }}
                  disabled={!user}
                />
              ))}
            </motion.div>
          </motion.section>

          {/* Server Applications */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6">Server Applications</h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {serverApplications.map((app) => (
                <DepartmentCard
                  key={app.id}
                  department={app}
                  onClick={() => {
                    if (user) {
                      setSelectedDepartment(app.id)
                    } else {
                      window.location.href = '/api/auth/login'
                    }
                  }}
                  disabled={!user}
                />
              ))}
            </motion.div>
          </motion.section>

          {/* Appeals */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6">Appeals</h2>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {appeals.map((appeal) => (
                <DepartmentCard
                  key={appeal.id}
                  department={appeal}
                  onClick={() => {
                    if (user) {
                      setSelectedDepartment(appeal.id)
                    } else {
                      window.location.href = '/api/auth/login'
                    }
                  }}
                  disabled={!user}
                />
              ))}
            </motion.div>
          </motion.section>
        </div>
      </div>
    </PageTransition>
  )
}
