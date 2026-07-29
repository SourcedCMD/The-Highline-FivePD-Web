'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 border-t border-gray-800 py-12"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">
              The Highline offers an immersive roleplay experience with unique features and an active community.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link href="/forums" className="hover:text-white transition">Forums</Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-white transition">Store</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-white transition">Rules</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <p className="text-gray-400">
              Join our Discord community for updates and discussions.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>Copyright © {new Date().getFullYear()} The Highline</p>
        </div>
      </div>
    </motion.footer>
  )
}
