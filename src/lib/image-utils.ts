/**
 * Extract the first image URL from a comma-separated string of image URLs.
 * Database stores images as "url1,url2,url3" — we only use the first one.
 */
export function getFirstImageUrl(src: string | null | undefined): string {
  if (!src) return ''
  const trimmed = src.trim()
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean)
    return parts[0] || ''
  }
  return trimmed
}

/**
 * Get all image URLs from a comma-separated string.
 * Useful for image galleries.
 */
export function getAllImageUrls(src: string | null | undefined): string[] {
  if (!src) return []
  return src.split(',').map(s => s.trim()).filter(Boolean)
}
