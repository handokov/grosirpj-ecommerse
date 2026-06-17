// ===== Shared TypeScript types for GrosirPJ =====
// Extracted from useStore.ts, admin pages, and orders pages
// to eliminate code duplication across the codebase.

// ---------- Product Types ----------

/**
 * Product as seen by the storefront / public API.
 * Used in useStore, product cards, search, etc.
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  wholesalePrice: number;
  minOrder: number;
  stock: number;
  images: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  rating: number;
  reviewCount: number;
  sold: number;
  featured: boolean;
  tags: string | null;
  weight: string | null;
  sizes: string | null;
  colors: string | null;
  variantName: string | null;
  variants: string | null;
}

/**
 * Minimal product shape stored in the wishlist.
 * A subset of Product — enough to render wishlist cards without re-fetching.
 * Both Product (full) and ProductCard's prop shape are assignable to this,
 * so the wishlist can be toggled from either a full Product or a partial card.
 */
export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  images: string;
  price: number;
  wholesalePrice: number;
  minOrder: number;
  sold: number;
  rating: number;
  featured?: boolean;
  categoryName?: string;
  categorySlug?: string;
}

/**
 * Product as seen in the admin dashboard.
 * Extends the base Product with supplier info and a full category object.
 * Used in admin product detail/edit pages.
 */
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  wholesalePrice: number;
  minOrder: number;
  stock: number;
  images: string;
  categoryId: string;
  featured: boolean;
  tags: string | null;
  weight: string | null;
  sizes: string | null;
  colors: string | null;
  variantName: string | null;
  variants: string | null;
  supplierName: string | null;
  supplierLink: string | null;
  supplierPhone: string | null;
  category: { name: string; slug: string };
}

// ---------- Cart Types ----------

export interface CartItemType {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  variant?: string;
}

// ---------- Category Types ----------

/**
 * Category as seen by the storefront / public API.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
}

/**
 * Category as seen in the admin dashboard.
 * Includes product count for display purposes.
 */
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  order: number;
  _count: { products: number };
}

// ---------- Image Types ----------

export interface UploadedImage {
  url: string;
  publicId: string;
  file?: File;
  preview?: string;
}

// ---------- Order Types ----------

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethod = 'whatsapp' | 'transfer' | 'cod';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  variant: string | null;
  price: number;
  productName: string;
  productImage: string;
  product?: {
    name: string;
    images: string;
    supplierName: string | null;
    supplierLink: string | null;
    supplierPhone: string | null;
    variantName?: string | null;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddr: string | null;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentProof: string | null;
  paymentNotes: string | null;
  paidAt: string | null;
  totalAmount: number;
  shippingCost: number;
  courier: string | null;
  courierService: string | null;
  destinationCity: string | null;
  note: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ---------- Banner Types ----------

/**
 * Banner as seen in the admin dashboard.
 * Used for homepage carousel management.
 */
export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
