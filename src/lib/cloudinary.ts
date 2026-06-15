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
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'grosirpj'
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file as string, {
    folder,
    resource_type: 'image',
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
