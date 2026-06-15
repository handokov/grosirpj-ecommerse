import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, CLOUDINARY_FOLDER_PRODUCTS, CLOUDINARY_FOLDER_BANNERS } from '@/lib/store-config'
import { requireAdmin, isAdminError } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

// Allowed folders for upload
const ALLOWED_FOLDERS = [CLOUDINARY_FOLDER_PRODUCTS, CLOUDINARY_FOLDER_BANNERS]

/**
 * Upload an image file to Cloudinary.
 * Used for uploading images from the admin product form.
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || CLOUDINARY_FOLDER_PRODUCTS

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validate folder — must be one of the allowed Cloudinary folders
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { error: 'Folder tidak valid. Gunakan folder yang diizinkan.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10MB.' },
        { status: 400 }
      )
    }

    // Convert to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await uploadImage(base64, folder)

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
