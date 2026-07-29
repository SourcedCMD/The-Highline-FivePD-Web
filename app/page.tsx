'use client'

import PageTransition from '@/components/PageTransition'
import { motion } from 'framer-motion'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl font-bold mb-6"
            >
              THE HIGHLINE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl max-w-3xl mx-auto leading-relaxed"
            >
              Welcome to The Highline, a vMenu/DOJ-based server offering immersive roleplay experiences! Join a close-knit community with custom resources and scripts, and explore roles in departments like Staff, BCSO, and LSPD. Our transparent ranking system ensures fair growth, and your feedback helps shape the server. Become part of our dynamic, welcoming community today!
            </motion.p>
          </motion.div>

          {/* Community Pictures */}
          <div className="mb-20">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-3xl font-bold text-center mb-8"
            >
              Pictures from our Community
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <motion.div
                  key={num}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-gray-800 rounded-lg aspect-square flex items-center justify-center text-gray-500 hover:bg-gray-700 transition cursor-pointer"
                >
                  Community {num}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
