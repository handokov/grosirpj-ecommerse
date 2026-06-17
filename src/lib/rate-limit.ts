/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window counter per IP address.
 * 
 * Usage:
 * ```ts
 * const rateLimitResult = rateLimit(request, { windowMs: 60_000, maxRequests: 10 })
 * if (rateLimitResult) return rateLimitResult // 429 response
 * ```
 */

interface RateLimitOptions {
  /** Time window in milliseconds (default: 60_000 = 1 minute) */
  windowMs?: number
  /** Max requests per window (default: 10) */
  maxRequests?: number
  /** Custom message for 429 response */
  message?: string
}

interface RequestLog {
  count: number
  resetTime: number
}

// In-memory store: Map<IP, RequestLog>
const store = new Map<string, RequestLog>()

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, log] of store) {
    if (now > log.resetTime) store.delete(key)
  }
}

/**
 * Check rate limit for a request. Returns a 429 NextResponse if rate limited, null if OK.
 */
export function rateLimit(
  request: Request,
  options: RateLimitOptions = {}
): Response | null {
  cleanup()

  const {
    windowMs = 60_000,
    maxRequests = 10,
    message = 'Terlalu banyak request. Coba lagi dalam beberapa saat.',
  } = options

  // Get client IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const now = Date.now()
  const existing = store.get(ip)

  if (!existing || now > existing.resetTime) {
    // New window
    store.set(ip, { count: 1, resetTime: now + windowMs })
    return null
  }

  existing.count++

  if (existing.count > maxRequests) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000)
    return new Response(
      JSON.stringify({ error: message, retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    )
  }

  return null
}

// ===== Preset configurations =====

/** Login/auth attempts: 5 per minute */
export function rateLimitAuth(request: Request) {
  return rateLimit(request, { windowMs: 60_000, maxRequests: 5, message: 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.' })
}

/** Order creation: 3 per minute */
export function rateLimitOrderCreate(request: Request) {
  return rateLimit(request, { windowMs: 60_000, maxRequests: 3, message: 'Terlalu banyak order dibuat. Coba lagi dalam 1 menit.' })
}

/** Shipping cost calculation: 10 per minute */
export function rateLimitOngkir(request: Request) {
  return rateLimit(request, { windowMs: 60_000, maxRequests: 10, message: 'Terlalu banyak request ongkir. Coba lagi dalam 1 menit.' })
}

/** City search: 20 per minute */
export function rateLimitSearch(request: Request) {
  return rateLimit(request, { windowMs: 60_000, maxRequests: 20, message: 'Terlalu banyak pencarian. Coba lagi dalam 1 menit.' })
}

/** General API: 30 per minute */
export function rateLimitGeneral(request: Request) {
  return rateLimit(request, { windowMs: 60_000, maxRequests: 30, message: 'Terlalu banyak request. Coba lagi dalam 1 menit.' })
}
