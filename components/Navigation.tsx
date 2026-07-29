'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getSession, logout } from '@/lib/auth'
import type { DiscordUser } from '@/lib/auth'

export default function Navigation() {
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const session = await getSession()
      setUser(session)
      setLoading(false)
    }
    loadUser()

    // Check for session updates
    const interval = setInterval(loadUser, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="text-2xl font-bold text-white">
                TH
              </Link>
            </motion.div>
            <div className="hidden md:flex space-x-6">
              {[
                { href: '/', label: 'HOME' },
                { href: '/forums', label: 'FORUMS' },
                { href: '/departments', label: 'DEPARTMENTS' },
                { href: '/store', label: 'STORE' },
                { href: '/rules', label: 'RULES' },
              ].map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Link href={link.href} className="text-gray-300 hover:text-white transition">
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {user.isStaff && (
                  <Link
                    href="/staff"
                    className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 px-3 py-1.5 rounded transition"
                  >
                    Staff Panel
                  </Link>
                )}
                <Link href="/profile" className="text-gray-300 hover:text-white transition">
                  {user.username || user.email}
                </Link>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/api/auth/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  SIGN IN
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
