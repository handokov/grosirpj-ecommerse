// Centralized store configuration
// Change these values in one place to update across the entire site

// WhatsApp number (without + prefix, with country code)
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '6281281756262';

// Bank account info
export const BCA_REKENING = process.env.NEXT_PUBLIC_BCA_REKENING || '4130327970';

// WhatsApp deep link
export function getWhatsAppLink(message?: string): string {
  const encoded = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${WA_NUMBER}${encoded ? `?text=${encoded}` : ''}`;
}

// Store info
export const STORE_NAME = 'GrosirPJ';
export const STORE_TAGLINE = 'Harga OK Kualitas OK';

// Image upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

// Cloudinary folders
export const CLOUDINARY_FOLDER_PRODUCTS = 'grosirpj/products';
export const CLOUDINARY_FOLDER_BANNERS = 'grosirpj/banners';
