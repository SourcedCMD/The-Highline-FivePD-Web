'use client'

import PageTransition from '@/components/PageTransition'
import { motion } from 'framer-motion'

export default function StorePage() {
  const storeItems = [
    {
      id: 1,
      name: 'Starter Package',
      price: '$9.99',
      description: 'Perfect for new players getting started',
      features: ['VIP Access', 'Starting Money', 'Custom Vehicle'],
    },
    {
      id: 2,
      name: 'Premium Package',
      price: '$19.99',
      description: 'Enhanced experience with premium benefits',
      features: ['VIP Access', 'Premium Vehicle', 'Custom Clothing', 'Priority Support'],
    },
    {
      id: 3,
      name: 'Elite Package',
      price: '$39.99',
      description: 'Ultimate package for dedicated players',
      features: ['VIP Access', 'Elite Vehicle', 'Custom Clothing', 'Priority Support', 'Exclusive Items', 'Elite Badge'],
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

  const itemVariants = {
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">Store</h1>
            <p className="text-xl text-gray-400">
              Support the server and unlock exclusive benefits
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {storeItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                <p className="text-3xl font-bold text-blue-400 mb-4">{item.price}</p>
                <p className="text-gray-400 mb-6">{item.description}</p>
                <ul className="space-y-2 mb-6">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Purchase Now
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
