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
  maxRequests: number,
  endpoint: string = ''
): boolean {
  // Cleanup
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now
    for (const [key, log] of rateLimitStore) {
      if (now > log.resetTime) rateLimitStore.delete(key)
    }
  }

  // Use endpoint-specific key to allow different limits per endpoint per IP
  const key = endpoint ? `${ip}:${endpoint}` : ip
  const existing = rateLimitStore.get(key)
  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
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
  // Add Permissions-Policy to restrict browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

function rateLimitResponse(message: string, retryAfter: string): NextResponse {
  return addSecurityHeaders(NextResponse.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': retryAfter } }
  ))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)

  // ===== Rate limiting for auth endpoints =====
  if (pathname.startsWith('/api/auth') && pathname.includes('callback')) {
    if (!checkRateLimit(ip, 60_000, 5, 'auth')) {
      return rateLimitResponse('Terlalu banyak percobaan login. Coba lagi dalam 1 menit.', '60')
    }
  }

  // ===== Rate limiting for public order creation =====
  if (pathname === '/api/orders' && request.method === 'POST') {
    if (!checkRateLimit(ip, 60_000, 3, 'order-create')) {
      return rateLimitResponse('Terlalu banyak order dibuat. Coba lagi dalam 1 menit.', '60')
    }
  }

  // Order lookup by orderNumber
  if (pathname.match(/^\/api\/orders\/GPJ-/) && request.method === 'GET') {
    if (!checkRateLimit(ip, 60_000, 10, 'order-lookup')) {
      return rateLimitResponse('Terlalu banyak request. Coba lagi dalam 1 menit.', '60')
    }
  }

  // ===== Rate limiting for ongkir =====
  if (pathname.startsWith('/api/ongkir')) {
    const limit = pathname.includes('/cost') ? 10 : 20
    if (!checkRateLimit(ip, 60_000, limit, 'ongkir')) {
      return rateLimitResponse('Terlalu banyak request ongkir. Coba lagi dalam 1 menit.', '60')
    }
  }

  // ===== Rate limiting for search =====
  if (pathname === '/api/search') {
    if (!checkRateLimit(ip, 60_000, 20, 'search')) {
      return rateLimitResponse('Terlalu banyak pencarian. Coba lagi dalam 1 menit.', '60')
    }
  }

  // ===== Rate limiting for product listing (including search) =====
  if (pathname === '/api/products' && request.method === 'GET') {
    if (!checkRateLimit(ip, 60_000, 30, 'products')) {
      return rateLimitResponse('Terlalu banyak request. Coba lagi dalam 1 menit.', '60')
    }
  }

  // ===== Rate limiting for product detail =====
  if (pathname === '/api/products/detail' && request.method === 'GET') {
    if (!checkRateLimit(ip, 60_000, 60, 'product-detail')) {
      return rateLimitResponse('Terlalu banyak request. Coba lagi dalam 1 menit.', '60')
    }
  }

  // ===== Rate limiting for categories =====
  if (pathname === '/api/categories' && request.method === 'GET') {
    if (!checkRateLimit(ip, 60_000, 60, 'categories')) {
      return rateLimitResponse('Terlalu banyak request. Coba lagi dalam 1 menit.', '60')
    }
  }

  // ===== Rate limiting for admin API mutation endpoints =====
  if (pathname.startsWith('/api/admin') && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    if (!checkRateLimit(ip, 60_000, 100, 'admin-mutation')) {
      return rateLimitResponse('Terlalu banyak operasi admin. Coba lagi dalam 1 menit.', '60')
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

// Expand matcher to include all public API routes that need rate limiting
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*',
    '/api/orders/:path*',
    '/api/ongkir/:path*',
    '/api/search',
    '/api/products',
    '/api/products/detail',
    '/api/categories',
  ],
}
