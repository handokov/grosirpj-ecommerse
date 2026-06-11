'use client';

import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

/**
 * Smart image component that works with both local and Cloudinary images.
 * - If src is a full URL (Cloudinary), uses it directly with optimization
 * - If src is a local path, serves from /public
 * - Includes error fallback
 */
export default function ProductImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
}: ProductImageProps) {
  const [error, setError] = useState(false);

  // Build optimized URL
  const imageSrc = getOptimizedImageUrl(src, {
    width: 600,
    quality: 'auto',
  });

  // Fallback placeholder on error
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <div className="text-center p-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p className="text-xs text-gray-400 mt-1">Gambar tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setError(true)}
    />
  );
}

/**
 * Get optimized image URL
 * - Cloudinary URLs get transformation parameters
 * - Local paths stay as-is
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
      transforms.push('c_limit');

      // Insert transforms into the URL
      const transformStr = transforms.join(',');
      return path.replace('/image/upload/', `/image/upload/${transformStr}/`);
    }
    return path;
  }

  // Local path - check if Cloudinary is configured for production
  const cloudName = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME 
    : process.env.CLOUDINARY_CLOUD_NAME;

  if (cloudName) {
    const publicId = path.replace(/^\/images\//, 'grosirpj/');
    const transforms: string[] = [];
    if (options?.width) transforms.push(`w_${options.width}`);
    if (options?.height) transforms.push(`h_${options.height}`);
    if (options?.quality) transforms.push(`q_${options.quality}`);
    transforms.push('f_auto');
    transforms.push('c_limit');

    const transformStr = transforms.join(',');
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
  }

  // Fallback to local path
  return path;
}
