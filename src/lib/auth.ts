import { cookies } from 'next/headers'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export interface SessionUser {
  id: string
  email: string
  name: string
  slug: string
}

const SESSION_COOKIE = 'user_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Create a session for a user
 */
export async function createSession(userId: string): Promise<string> {
  // Generate a simple session token
  const sessionToken = Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64')
  
  // Set cookie
  cookies().set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
  
  return sessionToken
}

/**
 * Get current session user
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const sessionToken = cookies().get(SESSION_COOKIE)?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Decode session token to get user ID
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const userId = decoded.split(':')[0]
    
    if (!userId) {
      return null
    }
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId, active: true },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
      },
    })
    
    return user
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

/**
 * Verify user credentials and return user if valid
 */
export async function verifyCredentials(
  usernameOrEmail: string,
  password: string
): Promise<SessionUser | null> {
  try {
    // Find user by email or slug
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail.toLowerCase() },
          { slug: usernameOrEmail.toLowerCase() },
        ],
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        password: true,
      },
    })
    
    if (!user) {
      return null
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      return null
    }
    
    // Return user without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
    }
  } catch (error) {
    console.error('Credentials verification error:', error)
    return null
  }
}

/**
 * Destroy current session
 */
export async function destroySession(): Promise<void> {
  cookies().delete(SESSION_COOKIE)
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return session
}

