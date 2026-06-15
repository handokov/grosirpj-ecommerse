import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { validateBody, uploadUrlSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

/**
 * Download an image from a URL and upload it to Cloudinary.
 * Used for importing images from external sources (e.g., Shopee).
 */
export async function POST(request: NextRequest) {
  try {
    const data = await validateBody(request, uploadUrlSchema)
    if (data instanceof NextResponse) return data

    // Only allow http/https
    const parsedUrl = new URL(data.url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 })
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
