import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/store-config'

export const dynamic = 'force-dynamic'

/**
 * Upload a single image file (FormData) to Cloudinary.
 *
 * Used by the admin ImageUploader component's drag & drop / file picker flow.
 * The frontend posts `multipart/form-data` with fields:
 *   - file:   File (the image)
 *   - folder: string (optional, defaults to 'grosirpj')
 *
 * Returns: { url: string, publicId: string }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    // Parse multipart form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Request bukan multipart/form-data yang valid' },
        { status: 400 }
      )
    }

    const file = formData.get('file')
    const folder = (formData.get('folder') as string) || 'grosirpj'

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'File tidak ditemukan dalam request' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File kosong' },
        { status: 400 }
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `Ukuran file terlalu besar. Maksimal ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
        },
        { status: 413 }
      )
    }

    // Validate MIME type (allowlist)
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        {
          error: `Format file tidak didukung: ${file.type || 'unknown'}. Gunakan JPG, PNG, WebP, atau GIF.`,
        },
        { status: 415 }
      )
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert to base64 data URI for Cloudinary upload
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await uploadImage(base64, folder)

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()

    console.error('[upload] File upload failed:', error)
    return NextResponse.json(
      { error: 'Gagal upload gambar. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
