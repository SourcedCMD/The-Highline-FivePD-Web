import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import { checkIsStaff } from '@/lib/discord-bot'
import type { DiscordUser } from '@/lib/auth'

/**
 * Reads the signed session cookie and returns it only if valid AND the
 * session says the user is staff. Used to gate read access to staff pages/routes.
 */
export async function getStaffSession(): Promise<DiscordUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('discord-session')?.value
  const session = verifySessionToken<DiscordUser>(token)
  if (!session || !session.isStaff) return null
  return session
}

/**
 * Same as getStaffSession, but re-checks the staff role live against Discord
 * instead of trusting the (up to 7-day-old) session cookie. Use this before
 * any staff action that changes data (accepting/denying applications,
 * opening/closing departments), so a removed staff member is cut off immediately
 * instead of waiting for their session to expire.
 */
export async function getFreshStaffSession(): Promise<DiscordUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('discord-session')?.value
  const session = verifySessionToken<DiscordUser>(token)
  if (!session) return null

  const isStaff = await checkIsStaff(session.id)
  if (!isStaff) return null
  return session
}
