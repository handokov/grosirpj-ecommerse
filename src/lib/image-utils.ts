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

/**
 * Get optimized image URL
 * - Cloudinary URLs get transformation parameters
 * - Local paths stay as-is (Next.js Image handles optimization)
 *
 * Crop strategy: `c_fill` when both width & height are specified (Cloudinary crops
 * server-side → consistent aspect ratio, smaller files). `c_limit` otherwise
 * (just resize down, keep aspect ratio).
 */
export function getOptimizedImageUrl(
  path: string,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  // If already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // If it's a Cloudinary URL, add transformations
    if (path.includes('res.cloudinary.com')) {
      const transforms: string[] = [];
      if (options?.width) transforms.push(`w_${options.width}`);
      if (options?.height) transforms.push(`h_${options.height}`);
      if (options?.quality) transforms.push(`q_${options.quality}`);
      if (options?.format) transforms.push(`f_${options.format}`);
      else transforms.push('f_auto');
      // Use c_fill when both dimensions known (consistent crop), else c_limit (no crop)
      if (options?.width && options?.height) {
        transforms.push('c_fill');
      } else {
        transforms.push('c_limit');
      }

      const transformStr = transforms.join(',');
      return path.replace('/image/upload/', `/image/upload/${transformStr}/`);
    }
    return path;
  }

  // Local path - just return as-is, Next.js Image will optimize
  return path;
}
