'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
}

/**
 * Placeholder component for when image fails to load or src is empty
 */
function ImagePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
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

/**
 * Extract the first image URL from a comma-separated string of image URLs.
 * Database stores images as "url1,url2,url3" — we only use the first one.
 */
function getFirstImageUrl(src: string): string {
  if (!src) return '';
  const trimmed = src.trim();
  // If it contains commas, split and take the first URL
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    return parts[0] || '';
  }
  return trimmed;
}

/**
 * Optimized product image using Next.js Image component.
 * - Handles comma-separated image URLs (takes the first one)
 * - Cloudinary URLs get transformation parameters for auto WebP/AVIF
 * - Local images served via Next.js Image optimization
 * - Error fallback with placeholder
 */
export default function ProductImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 768px) 50vw, 25vw',
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  // If src is empty or error occurred, show placeholder
  if (!src || error) {
    return <ImagePlaceholder className={className} />;
  }

  // Get the first image from comma-separated URLs
  const firstImage = getFirstImageUrl(src);

  if (!firstImage) {
    return <ImagePlaceholder className={className} />;
  }

  // Build optimized URL
  const imageSrc = getOptimizedImageUrl(firstImage, {
    width: 600,
    quality: 'auto',
  });

  // Determine if it's an external URL (Cloudinary) or local path
  const isExternal = imageSrc.startsWith('http://') || imageSrc.startsWith('https://');

  // Determine fill vs explicit dimensions
  const hasExplicitSize = className?.includes('h-') || className?.includes('w-');

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={!hasExplicitSize}
      width={hasExplicitSize ? 600 : undefined}
      height={hasExplicitSize ? 600 : undefined}
      className={className}
      loading={priority ? 'eager' : loading}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
      unoptimized={isExternal}
    />
  );
}

/**
 * Get optimized image URL
 * - Cloudinary URLs get transformation parameters
 * - Local paths stay as-is (Next.js Image handles optimization)
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

      const transformStr = transforms.join(',');
      return path.replace('/image/upload/', `/image/upload/${transformStr}/`);
    }
    return path;
  }

  // Local path - just return as-is, Next.js Image will optimize
  return path;
}

/**
 * Get all image URLs from a comma-separated string.
 * Useful for image galleries.
 */
export function getAllImageUrls(src: string): string[] {
  if (!src) return [];
  return src.split(',').map(s => s.trim()).filter(Boolean);
}
