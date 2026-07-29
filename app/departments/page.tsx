'use client'

import PageTransition from '@/components/PageTransition'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DepartmentsPage() {
  const departments = [
    {
      id: 'sast',
      name: 'California Highway Patrol',
      icon: '🚔',
      description: 'The California Highway Patrol ensures that everything is smoothly running safe and sound.',
      responsibilities: ['Highway patrol', 'Traffic enforcement', 'State-wide law enforcement'],
      members: 0,
    },
    {
      id: 'bcso',
      name: 'Los Angeles Sheriffs Department',
      icon: '👮',
      description: 'The Los Angeles Sheriffs Department is the primary law enforcement agency in Los Angeles County.',
      responsibilities: ['County patrol', 'Rural law enforcement', 'Community safety'],
      members: 0,
    },
    {
      id: 'lspd',
      name: 'Los Angeles Police Department',
      icon: '🚓',
      description: 'The Los Angeles Police Department is the primary law enforcement agency in Los Angeles.',
      responsibilities: ['Urban patrol', 'Crime prevention', 'City law enforcement'],
      members: 0,
    },
    {
      id: 'safr',
      name: 'California Fire Department',
      icon: '🚒',
      description: 'The California Fire Department is the primary fire and rescue service in California.',
      responsibilities: ['Fire suppression', 'Medical emergencies', 'Rescue operations'],
      members: 0,
    },
    {
      id: 'cc',
      name: 'Certified Civilian',
      icon: '👤',
      description: 'Certified Civilians are the backbone of the community.',
      responsibilities: ['Community activities', 'Business operations', 'Civilian roleplay'],
      members: 0,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">Departments</h1>
            <p className="text-xl text-gray-400">
              Explore our various departments and find where you belong
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {departments.map((dept) => (
              <motion.div
                key={dept.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="text-5xl">{dept.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{dept.name}</h2>
                    <p className="text-gray-400 text-sm mb-4">{dept.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Responsibilities:</h3>
                  <ul className="space-y-1">
                    {dept.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-xs text-gray-400 flex items-center">
                        <span className="text-blue-400 mr-2">→</span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-400">{dept.members} Active Members</span>
                  <Link
                    href="/forums"
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
                  >
                    View Forum →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
