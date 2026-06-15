import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { validateBody, uploadUrlSchema } from '@/lib/validations'
import { requireAdmin, isAdminError } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

/**
 * Download an image from a URL and upload it to Cloudinary.
 * Used for importing images from external sources (e.g., Shopee).
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const data = await validateBody(request, uploadUrlSchema)
    if (data instanceof NextResponse) return data

    // Only allow http/https
    const parsedUrl = new URL(data.url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs allowed' }, { status: 400 })
    }

    // Block SSRF: prevent access to internal/private IPs and metadata endpoints
    const hostname = parsedUrl.hostname
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) || // Only block 172.16.x.x through 172.31.x.x
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname.startsWith('fd') || // IPv6 unique local
      hostname.startsWith('fe80') || // IPv6 link-local
      hostname === '0.0.0.0' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 })
    }

    // Download the image
    const response = await fetch(data.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to download image: ${response.status}` }, { status: 400 })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 })
    }

    // Convert to base64
    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResult = await uploadImage(base64, data.folder)

    return NextResponse.json({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    })
  } catch (error) {
    console.error('Upload URL error:', error)
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Download timed out' }, { status: 408 })
    }
    return NextResponse.json({ error: 'Failed to upload image from URL' }, { status: 500 })
  }
}
