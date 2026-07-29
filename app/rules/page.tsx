'use client'

import PageTransition from '@/components/PageTransition'
import { motion } from 'framer-motion'

export default function RulesPage() {
  const ruleCategories = [
    {
      id: 1,
      title: 'General Rules',
      rules: [
        'Respect all players and staff members at all times',
        'No harassment, discrimination, or toxic behavior',
        'Keep all communication appropriate and professional',
        'No exploiting, cheating, or using unauthorized mods',
        'Follow all server guidelines and instructions from staff',
      ],
    },
    {
      id: 2,
      title: 'Roleplay Rules',
      rules: [
        'Stay in character at all times during roleplay scenarios',
        'No RDM (Random Deathmatch) or VDM (Vehicle Deathmatch)',
        'No powergaming or metagaming',
        'Always value your life and make realistic decisions',
        'Follow realistic response times and actions',
      ],
    },
    {
      id: 3,
      title: 'Department Rules',
      rules: [
        'Maintain professionalism while representing your department',
        'Follow chain of command and department procedures',
        'No corruption or abuse of authority',
        'Complete required training before assuming duties',
        'Active participation is required to maintain position',
      ],
    },
    {
      id: 4,
      title: 'Discord & Forum Rules',
      rules: [
        'Follow Discord Terms of Service',
        'No spamming or excessive posting',
        'Keep discussions relevant to appropriate channels',
        'Respect moderator decisions and warnings',
        'No advertising other servers without permission',
      ],
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

  const categoryVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  const ruleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">Server Rules</h1>
            <p className="text-xl text-gray-400">
              Please read and follow all rules to ensure a positive experience for everyone
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {ruleCategories.map((category) => (
              <motion.div
                key={category.id}
                variants={categoryVariants}
                className="bg-gray-800 rounded-lg p-8 border border-gray-700"
              >
                <h2 className="text-3xl font-bold mb-6 text-blue-400">{category.title}</h2>
                <motion.ul
                  variants={ruleVariants}
                  className="space-y-3"
                >
                  {category.rules.map((rule, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start text-gray-300"
                    >
                      <span className="text-red-400 mr-3 mt-1">•</span>
                      <span>{rule}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
