import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Verify that the current request is from an authenticated user.
 * Returns the session if valid, or throws an error response if not.
 *
 * Usage in API routes:
 * ```ts
 * const session = await requireAuth()
 * // session is guaranteed to be a valid Session object here
 * ```
 */
export async function requireAuth() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      throw new AuthError('Unauthorized', 401)
    }
    return session
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('Unauthorized', 401)
  }
}

/**
 * Verify that the current request is from an authenticated admin user.
 * Checks both authentication and admin role.
 * Returns the session if valid, or throws an error response if not.
 *
 * Usage in API routes:
 * ```ts
 * const session = await requireAdmin()
 * // session is guaranteed to be a valid admin Session object here
 * ```
 */
export async function requireAdmin() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      throw new AuthError('Unauthorized', 401)
    }
    const role = (session.user as unknown as { role: string }).role
    if (role !== 'admin') {
      throw new AuthError('Forbidden — admin access required', 403)
    }
    return session
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('Unauthorized', 401)
  }
}

/**
 * Custom error class for authentication/authorization failures.
 * Can be converted to a NextResponse using toResponse().
 */
export class AuthError extends Error {
  status: number

  constructor(message: string, status: number = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }

  toResponse() {
    return NextResponse.json({ error: this.message }, { status: this.status })
  }
}

/**
 * Check if an error is an AuthError and return the appropriate NextResponse.
 * Use this in catch blocks of API route handlers.
 *
 * Usage:
 * ```ts
 * try {
 *   const session = await requireAdmin()
 *   // ... do admin stuff
 * } catch (error) {
 *   if (isAuthError(error)) return error.toResponse()
 *   return NextResponse.json({ error: 'Internal error' }, { status: 500 })
 * }
 * ```
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}
