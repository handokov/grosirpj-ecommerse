import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Verify that the current request is from an authenticated admin user.
 * Returns the session if valid, or a 401 NextResponse if not.
 * 
 * Usage in API routes:
 * ```ts
 * const session = await requireAuth()
 * if (session instanceof NextResponse) return session // unauthorized
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
 * Type guard to check if requireAuth() returned a session (not an error response)
 */
export function isAuthError(result: Awaited<ReturnType<typeof requireAuth>>): result is NextResponse {
  return result instanceof NextResponse
}
