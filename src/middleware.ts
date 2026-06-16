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

  // HSTS — force HTTPS for 1 year (Vercel always serves over HTTPS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // Content-Security-Policy — defense-in-depth against XSS and data injection.
  // Next.js requires 'unsafe-inline' for scripts/styles (hydration bootstrap).
  // External origins restricted to a strict whitelist (Cloudinary for images).
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
  response.headers.set('Content-Security-Policy', csp)

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

// Expand matcher to cover ALL routes so security headers (CSP, HSTS, etc.)
// are applied everywhere — including the homepage and product pages.
// Static assets and Next.js internals are excluded for performance.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|images/|logo-sm.png|logo.svg|logo.png|sw.js|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}
