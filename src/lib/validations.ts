import { z, type ZodSchema } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Validate a request body against a Zod schema.
 * Returns the parsed data on success, or a 400 NextResponse on failure.
 *
 * Usage:
 * ```ts
 * const data = await validateBody(request, schema)
 * if (data instanceof NextResponse) return data // validation failed
 * // data is now typed as schema output
 * ```
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T | NextResponse> {
  const body = await request.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
      { status: 400 }
    )
  }
  return result.data
}

/**
 * Format Zod error issues into a flat string array.
 * Useful for logging or returning in error responses.
 */
export function formatZodError(error: z.ZodError): string[] {
  return error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
}

// ===== PRODUCT SCHEMAS =====

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(200),
  description: z.string().max(5000).optional().default(''),
  price: z.coerce.number().positive('Harga harus lebih dari 0'),
  wholesalePrice: z.coerce.number().positive('Harga grosir harus lebih dari 0'),
  minOrder: z.coerce.number().int().min(1, 'Minimal order 1').optional().default(1),
  stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  images: z.string().min(1, 'Minimal 1 gambar produk').optional().default(''),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  featured: z.boolean().optional().default(false),
  tags: z.string().optional().default(''),
  weight: z.string().optional().default(''),
  sizes: z.string().optional().default(''),
  supplierName: z.string().nullable().optional(),
  supplierLink: z.string().nullable().optional(),
  supplierPhone: z.string().nullable().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.coerce.number().positive().optional(),
  wholesalePrice: z.coerce.number().positive().optional(),
  minOrder: z.coerce.number().int().min(1).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  images: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  featured: z.boolean().optional(),
  tags: z.string().optional(),
  weight: z.string().optional(),
  sizes: z.string().optional(),
  supplierName: z.string().nullable().optional(),
  supplierLink: z.string().nullable().optional(),
  supplierPhone: z.string().nullable().optional(),
})

// ===== CATEGORY SCHEMAS =====

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  description: z.string().optional().default(''),
  icon: z.string().optional().default(''),
  image: z.string().optional().default(''),
  order: z.number().int().min(0).optional().default(0),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  order: z.number().int().min(0).optional(),
})

// ===== ORDER SCHEMAS =====

const orderStatusEnum = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'])
const paymentStatusEnum = z.enum(['unpaid', 'paid', 'refunded'])
const paymentMethodEnum = z.enum(['whatsapp', 'transfer', 'cod'])

export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  paymentMethod: paymentMethodEnum.optional(),
  note: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddr: z.string().optional(),
})

export const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi'),
  customerPhone: z.string().min(1, 'No. telepon wajib diisi').regex(/^(\+62|62|0)[0-9]{8,13}$/, 'Format nomor telepon tidak valid'),
  customerEmail: z.string().email().optional().default(''),
  customerAddr: z.string().optional().default(''),
  paymentMethod: paymentMethodEnum.optional().default('whatsapp'),
  note: z.string().optional().default(''),
  totalAmount: z.coerce.number().positive('Total harus lebih dari 0'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1),
    size: z.string().optional().default(''),
    price: z.coerce.number().positive(),
  })).min(1, 'Minimal 1 item'),
})

// Public order creation (from buyer checkout) — NO price from client!
// Price is calculated server-side from the database to prevent manipulation.
export const publicCreateOrderSchema = z.object({
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi').max(200),
  customerPhone: z.string().min(1, 'No. telepon wajib diisi').max(50).regex(/^(\+62|62|0)[0-9]{8,13}$/, 'Format nomor telepon tidak valid'),
  customerEmail: z.string().email().optional().default(''),
  customerAddr: z.string().max(500).optional().default(''),
  note: z.string().max(1000).optional().default(''),
  shippingCost: z.coerce.number().min(0).optional().default(0),
  courier: z.string().max(100).optional().default(''),
  courierService: z.string().max(200).optional().default(''),
  destinationCity: z.string().max(200).optional().default(''),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID wajib'),
    quantity: z.coerce.number().int().min(1, 'Minimal 1 item').max(9999),
    size: z.string().max(50).optional().default(''),
  })).min(1, 'Minimal 1 item').max(50, 'Maksimal 50 item per order'),
})

// ===== BANNER SCHEMAS =====

export const createBannerSchema = z.object({
  title: z.string().min(1, 'Judul banner wajib diisi').max(200),
  image: z.string().min(1, 'Gambar banner wajib diisi'),
  link: z.string().nullable().optional(),
  order: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
})

export const updateBannerSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  image: z.string().optional(),
  link: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export const bulkUpdateBannerSchema = z.object({
  banners: z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().min(0),
    active: z.boolean(),
  })).min(1),
})

// ===== UPLOAD SCHEMAS =====

export const uploadUrlSchema = z.object({
  url: z.string().url('URL tidak valid'),
  folder: z.enum(['grosirpj/products', 'grosirpj/banners']).optional().default('grosirpj/products'),
})
