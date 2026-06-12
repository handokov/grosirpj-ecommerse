import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

/**
 * Get optimized image URL from Cloudinary
 * Falls back to local path if Cloudinary is not configured
 */
export function getImageUrl(
  path: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  }
): string {
  // If the path is already a full URL (Cloudinary or external), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // If Cloudinary is configured, use Cloudinary URL
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const publicId = path.replace(/^\/images\//, 'grosirpj/')
    const transforms: string[] = []

    if (options?.width) transforms.push(`w_${options.width}`)
    if (options?.height) transforms.push(`h_${options.height}`)
    if (options?.quality) transforms.push(`q_${options.quality}`)
    if (options?.format) transforms.push(`f_${options.format}`)
    else transforms.push('f_auto')

    transforms.push('c_limit') // Don't upscale

    const transformStr = transforms.join(',')
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`
  }

  // Fallback to local path
  return path
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'grosirpj'
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file as string, {
    folder,
    resource_type: 'auto',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadImages(
  files: { buffer: Buffer; name: string }[],
  folder: string = 'grosirpj'
): Promise<{ url: string; publicId: string }[]> {
  const results = await Promise.all(
    files.map(async (file) => {
      const base64 = `data:image/png;base64,${file.buffer.toString('base64')}`
      return uploadImage(base64, folder)
    })
  )
  return results
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch {
    return false
  }
}
