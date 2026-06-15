import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Verify that the current request is from an authenticated user.
 * Returns the session if valid, or a 401 NextResponse if not.
 * 
 * Usage in API routes:
 * ```ts
 * const session = await requireAuth()
 * if (isAuthError(session)) return session // unauthorized
 * ```
 */
export async function requireAuth() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return session
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

/**
 * Type guard to check if requireAuth() returned an error response (not a session)
 */
export function isAuthError(result: Awaited<ReturnType<typeof requireAuth>>): result is NextResponse<{ error: string }> {
  return result instanceof NextResponse
}

/**
 * Verify that the current request is from an authenticated admin user.
 * Checks both authentication and admin role.
 * Returns the session if valid, or a 401/403 NextResponse if not.
 * 
 * Usage in API routes:
 * ```ts
 * const session = await requireAdmin()
 * if (isAdminError(session)) return session // unauthorized or forbidden
 * ```
 */
export async function requireAdmin() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const role = (session.user as unknown as { role: string }).role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 })
    }
    return session
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

/**
 * Type guard to check if requireAdmin() returned an error response (not a session)
 */
export function isAdminError(result: Awaited<ReturnType<typeof requireAdmin>>): result is NextResponse<{ error: string }> {
  return result instanceof NextResponse
}
