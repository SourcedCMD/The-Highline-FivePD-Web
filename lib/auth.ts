export interface DiscordUser {
  id: string
  username: string
  email: string
  avatar: string | null
  discriminator: string
  verified: boolean
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
