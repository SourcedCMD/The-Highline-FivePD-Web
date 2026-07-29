'use client'

import { motion } from 'framer-motion'

interface DepartmentCardProps {
  department: {
    id: string
    name: string
    icon: string
    description: string
    category: string
  }
  onClick: () => void
  disabled?: boolean
}

export default function DepartmentCard({ department, onClick, disabled }: DepartmentCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-gray-800 rounded-lg p-6 text-left hover:bg-gray-700 transition
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border border-gray-700 hover:border-gray-600
      `}
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{department.icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{department.name}</h3>
          <p className="text-gray-400 text-sm">{department.description}</p>
          <div className="mt-4 text-xs text-gray-500">0 Active Members</div>
        </div>
      </div>
    </motion.button>
  )
}
