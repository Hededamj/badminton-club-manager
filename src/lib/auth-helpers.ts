import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * Get session with club info. Returns null if not authenticated or no club.
 */
export async function getSessionWithClub() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.currentClubId) {
    return null
  }
  return session
}

/**
 * Require user to be authenticated and have a club.
 * Returns session or null.
 */
export async function requireClubMember() {
  return await getSessionWithClub()
}

/**
 * Require user to be ADMIN or OWNER in current club.
 * Returns session or null.
 */
export async function requireClubAdmin() {
  const session = await getSessionWithClub()
  if (!session) return null

  const role = session.user.currentClubRole
  if (role !== 'OWNER' && role !== 'ADMIN') {
    return null
  }
  return session
}

/**
 * Require user to be OWNER in current club.
 * Returns session or null.
 */
export async function requireClubOwner() {
  const session = await getSessionWithClub()
  if (!session) return null

  if (session.user.currentClubRole !== 'OWNER') {
    return null
  }
  return session
}

/**
 * Get current club ID from session.
 * Returns clubId or null.
 */
export async function getCurrentClubId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.currentClubId || null
}

/**
 * Check if user has admin access (ADMIN or OWNER) in current club.
 */
export async function hasClubAdminAccess(): Promise<boolean> {
  const session = await getSessionWithClub()
  if (!session) return false

  const role = session.user.currentClubRole
  return role === 'OWNER' || role === 'ADMIN'
}
