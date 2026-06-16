import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { validateBody, uploadUrlSchema } from '@/lib/validations'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'
import { MAX_FILE_SIZE } from '@/lib/store-config'

export const dynamic = 'force-dynamic'

// Maximum download size for URL imports (same as file upload limit)
const MAX_DOWNLOAD_SIZE = MAX_FILE_SIZE // 10MB

/**
 * Check if a hostname resolves to a private/internal IP address.
 * Prevents SSRF attacks via DNS rebinding, IPv6-mapped IPv4, etc.
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  if (
    ip === '127.0.0.1' ||
    ip === '0.0.0.0' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  ) {
    return true
  }

  // IPv6 loopback and private
  if (ip === '::1' || ip === '::' || ip.startsWith('fd') || ip.startsWith('fe80')) {
    return true
  }

  // IPv6-mapped IPv4 (e.g., ::ffff:127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    const ipv4 = ip.slice(7)
    return isPrivateIP(ipv4)
  }

  return false
}

/**
 * Download an image from a URL and upload it to Cloudinary.
 * Used for importing images from external sources (e.g., Shopee).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const data = await validateBody(request, uploadUrlSchema)
    if (data instanceof NextResponse) return data

    // Only allow http/https
    const parsedUrl = new URL(data.url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs allowed' }, { status: 400 })
    }

    // Block SSRF: prevent access to internal/private IPs and metadata endpoints
    const hostname = parsedUrl.hostname.toLowerCase()

    // Block known private hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.localhost')
    ) {
      return NextResponse.json({ error: 'URL tidak diizinkan' }, { status: 400 })
    }

    // Resolve DNS and check the actual IP to prevent DNS rebinding
    try {
      const { lookup } = await import('dns')
      const resolvedIP = await new Promise<string>((resolve, reject) => {
        lookup(hostname, (err, address) => {
          if (err) reject(err)
          else resolve(address)
        })
      })

      if (isPrivateIP(resolvedIP)) {
        return NextResponse.json({ error: 'URL tidak diizinkan' }, { status: 400 })
      }
    } catch {
      // DNS resolution failed — could be an invalid domain
      return NextResponse.json({ error: 'URL tidak dapat di-resolve' }, { status: 400 })
    }

    // Download the image — DO NOT follow redirects (prevent redirect-based SSRF)
    const response = await fetch(data.url, {
      redirect: 'manual', // Don't follow redirects automatically
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    // Handle redirects manually — check each redirect URL
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const redirectUrl = response.headers.get('location')
      if (redirectUrl) {
        // Recursively validate the redirect URL by re-calling this endpoint logic
        // For safety, just reject redirects — admin should provide direct image URLs
        return NextResponse.json(
          { error: 'Redirect tidak diizinkan. Gunakan URL gambar langsung.' },
          { status: 400 }
        )
      }
    }

    if (!response.ok) {
      return NextResponse.json({ error: `Gagal mengunduh gambar: ${response.status}` }, { status: 400 })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL tidak mengarah ke gambar' }, { status: 400 })
    }

    // Check Content-Length header before downloading (prevent OOM from huge files)
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_DOWNLOAD_SIZE) {
      return NextResponse.json(
        { error: `File terlalu besar. Maksimal ${Math.round(MAX_DOWNLOAD_SIZE / 1024 / 1024)}MB` },
        { status: 400 }
      )
    }

    // Download with size tracking to prevent OOM
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: 'Gagal membaca response' }, { status: 500 })
    }

    const chunks: Uint8Array[] = []
    let totalSize = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      totalSize += value.byteLength
      if (totalSize > MAX_DOWNLOAD_SIZE) {
        reader.cancel()
        return NextResponse.json(
          { error: `File terlalu besar. Maksimal ${Math.round(MAX_DOWNLOAD_SIZE / 1024 / 1024)}MB` },
          { status: 400 }
        )
      }
      chunks.push(value)
    }

    // Combine chunks into a single buffer
    const buffer = Buffer.concat(chunks)
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResult = await uploadImage(base64, data.folder)

    return NextResponse.json({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Upload URL error:', error)
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Download timed out' }, { status: 408 })
    }
    return NextResponse.json({ error: 'Gagal mengunggah gambar dari URL' }, { status: 500 })
  }
}
