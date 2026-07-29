export interface DiscordUser {
  id: string
  username: string
  email: string
  avatar: string | null
  discriminator: string
  verified: boolean
  isStaff: boolean
  bio?: string | null
}

export async function getSession(): Promise<DiscordUser | null> {
  if (typeof window === 'undefined') return null

  try {
    const response = await fetch('/api/auth/session')
    const data = await response.json()
    return data.user
  } catch {
    return null
  }
}

export async function logout() {
  if (typeof window === 'undefined') return

  try {
    await fetch('/api/auth/session', { method: 'DELETE' })
    window.location.href = '/'
  } catch {
    window.location.href = '/'
  }
}

/**
 * Server-only helper. Reads and verifies the signed session cookie.
 * Use inside API routes / server components - never import this in client components.
 */
export async function getServerSession(): Promise<DiscordUser | null> {
  const { cookies } = await import('next/headers')
  const { verifySessionToken } = await import('./session')

  const cookieStore = await cookies()
  const token = cookieStore.get('discord-session')?.value
  return verifySessionToken<DiscordUser>(token)
}
