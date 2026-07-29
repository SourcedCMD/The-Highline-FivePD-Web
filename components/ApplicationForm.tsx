'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import type { DiscordUser } from '@/lib/auth'

interface ApplicationFormProps {
  department: {
    id: string
    name: string
    icon: string
    description: string
    category: string
  }
  user: DiscordUser | null
  onBack: () => void
}

export default function ApplicationForm({ department, user, onBack }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    age: '',
    experience: '',
    whyJoin: '',
    whatCanYouBring: '',
    availability: '',
    previousExperience: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: department.id,
          departmentName: department.name,
          userId: user?.id || '',
          userEmail: user?.email || '',
          username: user?.username || user?.email || '',
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      setSuccess(true)
      setTimeout(() => {
        onBack()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
            >
              ✅
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              Application Submitted!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400"
            >
              Your application has been received and will be reviewed soon.
            </motion.p>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 text-blue-400 hover:text-blue-300 transition"
        >
          ← Back to Forums
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-lg p-8 border border-gray-700"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-4xl">{department.icon}</div>
            <div>
              <h1 className="text-3xl font-bold">{department.name} Application</h1>
              <p className="text-gray-400 mt-2">{department.description}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded p-4 mb-6 text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                required
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium mb-2">
                Roleplay Experience *
              </label>
              <textarea
                id="experience"
                name="experience"
                required
                rows={4}
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Describe your roleplay experience"
              />
            </div>

            <div>
              <label htmlFor="whyJoin" className="block text-sm font-medium mb-2">
                Why do you want to join {department.name}? *
              </label>
              <textarea
                id="whyJoin"
                name="whyJoin"
                required
                rows={4}
                value={formData.whyJoin}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Explain why you want to join this department"
              />
            </div>

            <div>
              <label htmlFor="whatCanYouBring" className="block text-sm font-medium mb-2">
                What can you bring to {department.name}? *
              </label>
              <textarea
                id="whatCanYouBring"
                name="whatCanYouBring"
                required
                rows={4}
                value={formData.whatCanYouBring}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="What skills, qualities, or contributions can you bring?"
              />
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium mb-2">
                Availability *
              </label>
              <textarea
                id="availability"
                name="availability"
                required
                rows={3}
                value={formData.availability}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="When are you typically available to play?"
              />
            </div>

            <div>
              <label htmlFor="previousExperience" className="block text-sm font-medium mb-2">
                Previous Department/Staff Experience (Optional)
              </label>
              <textarea
                id="previousExperience"
                name="previousExperience"
                rows={3}
                value={formData.previousExperience}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="List any previous department or staff positions you've held"
              />
            </div>

            <div className="flex space-x-4">
              <motion.button
                type="button"
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded transition"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded transition"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
      </div>
    </PageTransition>
  )
}
