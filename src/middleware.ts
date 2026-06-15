import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicPaths = ['/admin/login', '/api/auth']

// ===== Simple in-memory rate limiter for middleware =====
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function checkRateLimit(
  ip: string,
  windowMs: number,
  maxRequests: number
): boolean {
  // Cleanup
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now
    for (const [key, log] of rateLimitStore) {
      if (now > log.resetTime) rateLimitStore.delete(key)
    }
  }

  const existing = rateLimitStore.get(ip)
  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  existing.count++
  return existing.count <= maxRequests
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ===== Rate limiting for auth endpoints =====
  if (pathname.startsWith('/api/auth') && pathname.includes('callback')) {
    const ip = getClientIp(request)
    if (!checkRateLimit(ip, 60_000, 5)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      ))
    }
  }

  // ===== Rate limiting for public order endpoints =====
  if (pathname === '/api/orders' && request.method === 'POST') {
    const ip = getClientIp(request)
    if (!checkRateLimit(ip, 60_000, 3)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Terlalu banyak order dibuat. Coba lagi dalam 1 menit.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      ))
    }
  }

  // Order lookup by orderNumber (GET /api/orders/GPJ-XXXXXXXX-XXXX)
  if (pathname.match(/^\/api\/orders\/GPJ-/) && request.method === 'GET') {
    const ip = getClientIp(request)
    if (!checkRateLimit(ip, 60_000, 10)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Terlalu banyak request. Coba lagi dalam 1 menit.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      ))
    }
  }

  // ===== Rate limiting for ongkir =====
  if (pathname.startsWith('/api/ongkir')) {
    const ip = getClientIp(request)
    const limit = pathname.includes('/cost') ? 10 : 20
    if (!checkRateLimit(ip, 60_000, limit)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Terlalu banyak request ongkir. Coba lagi dalam 1 menit.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      ))
    }
  }

  // ===== Rate limiting for search =====
  if (pathname === '/api/search') {
    const ip = getClientIp(request)
    if (!checkRateLimit(ip, 60_000, 20)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Terlalu banyak pencarian. Coba lagi dalam 1 menit.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      ))
    }
  }

  // Skip middleware for non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Allow public admin paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Check for session token
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) {
    // API routes return 401
    if (pathname.startsWith('/api/admin')) {
      return addSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }
    // Page routes redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return addSecurityHeaders(NextResponse.redirect(loginUrl))
  }

  return addSecurityHeaders(NextResponse.next())
}

// Expand matcher to include public API routes that need rate limiting
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*',
    '/api/orders/:path*',
    '/api/ongkir/:path*',
    '/api/search',
  ],
}
