import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicCreateOrderSchema, isCuid } from '@/lib/validations'
import { verifyShippingCost } from '@/lib/shipping-calc'

// ─── Auto-migrate missing columns in Turso production DB ─────────────
// When we deploy new schema changes (new columns), the Turso DB may not
// have them yet. This function adds missing columns before order creation.
// Uses a module-level flag so it only runs once per cold start.

let schemaEnsured = false

async function ensureSchemaColumns() {
  if (schemaEnsured) return

  try {
    // Check Order table columns
    const orderCols = await db.$queryRawUnsafe<{ name: string }[]>(
      "PRAGMA table_info('Order')"
    )
    const orderColNames = new Set(orderCols.map(c => c.name))

    const orderMigrations: string[] = []

    if (!orderColNames.has('courier')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN courier TEXT')
    }
    if (!orderColNames.has('courierService')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN courierService TEXT')
    }
    if (!orderColNames.has('destinationCity')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN destinationCity TEXT')
    }
    if (!orderColNames.has('note')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN note TEXT')
    }
    if (!orderColNames.has('paymentProof')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN paymentProof TEXT')
    }
    if (!orderColNames.has('paymentNotes')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN paymentNotes TEXT')
    }
    if (!orderColNames.has('paidAt')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN paidAt DATETIME')
    }
    if (!orderColNames.has('deletedAt')) {
      orderMigrations.push('ALTER TABLE "Order" ADD COLUMN deletedAt DATETIME')
    }

    for (const sql of orderMigrations) {
      await db.$executeRawUnsafe(sql)
    }
    if (orderMigrations.length > 0) {
      console.log(`[orders] Auto-migrated ${orderMigrations.length} Order columns`)
    }

    // Check OrderItem table columns
    const itemCols = await db.$queryRawUnsafe<{ name: string }[]>(
      "PRAGMA table_info('OrderItem')"
    )
    const itemColNames = new Set(itemCols.map(c => c.name))

    const itemMigrations: string[] = []

    if (!itemColNames.has('productName')) {
      itemMigrations.push('ALTER TABLE "OrderItem" ADD COLUMN productName TEXT')
    }
    if (!itemColNames.has('productImage')) {
      itemMigrations.push('ALTER TABLE "OrderItem" ADD COLUMN productImage TEXT')
    }

    for (const sql of itemMigrations) {
      await db.$executeRawUnsafe(sql)
    }
    if (itemMigrations.length > 0) {
      console.log(`[orders] Auto-migrated ${itemMigrations.length} OrderItem columns`)
    }

    // Check Product table columns
    const productCols = await db.$queryRawUnsafe<{ name: string }[]>(
      "PRAGMA table_info('Product')"
    )
    const productColNames = new Set(productCols.map(c => c.name))

    const productMigrations: string[] = []

    if (!productColNames.has('deletedAt')) {
      productMigrations.push('ALTER TABLE "Product" ADD COLUMN deletedAt DATETIME')
    }
    if (!productColNames.has('supplierName')) {
      productMigrations.push('ALTER TABLE "Product" ADD COLUMN supplierName TEXT')
    }
    if (!productColNames.has('supplierLink')) {
      productMigrations.push('ALTER TABLE "Product" ADD COLUMN supplierLink TEXT')
    }
    if (!productColNames.has('supplierPhone')) {
      productMigrations.push('ALTER TABLE "Product" ADD COLUMN supplierPhone TEXT')
    }

    for (const sql of productMigrations) {
      await db.$executeRawUnsafe(sql)
    }
    if (productMigrations.length > 0) {
      console.log(`[orders] Auto-migrated ${productMigrations.length} Product columns`)
    }

    schemaEnsured = true
  } catch (err) {
    // Log but don't crash — the order might still work if columns already exist
    console.warn('[orders] Schema migration warning:', err)
    // Mark as ensured to avoid retrying on every request
    schemaEnsured = true
  }
}

// POST - Create order from public checkout (generates invoice)
export async function POST(request: NextRequest) {
  try {
    // Auto-migrate missing columns in production (Turso)
    await ensureSchemaColumns()

    // Safely parse JSON body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 })
    }

    // Validate input with Zod (NO price from client!)
    const result = publicCreateOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const data = result.data

    // Validate product IDs are CUIDs (prevent injection)
    for (const item of data.items) {
      if (!isCuid(item.productId)) {
        return NextResponse.json({ error: 'Product ID tidak valid' }, { status: 400 })
      }
    }

    // ===== EVERYTHING INSIDE TRANSACTION FOR ATOMICITY =====
    // Stock validation AND deduction must happen in the same transaction
    // to prevent race conditions where stock changes between validation and deduction.
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    const order = await db.$transaction(async (tx) => {
      // Fetch all products INSIDE the transaction for consistent reads
      const productIds = data.items.map(item => item.productId)
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          deletedAt: null, // Exclude soft-deleted products
        },
        select: {
          id: true,
          wholesalePrice: true,
          price: true,
          minOrder: true,
          stock: true,
          name: true,
          images: true,
          weight: true,
        },
      })

      // Build a lookup map
      const productMap = new Map(products.map(p => [p.id, p]))

      // Validate each item and calculate prices server-side
      const orderItems: { productId: string; quantity: number; size: string; price: number; productName: string; productImage: string }[] = []
      let totalAmount = 0
      const errors: string[] = []

      for (const item of data.items) {
        const product = productMap.get(item.productId)

        if (!product) {
          errors.push(`Produk tidak ditemukan atau sudah dihapus`)
          continue
        }

        // Check if in stock
        if (product.stock <= 0) {
          errors.push(`Produk ${product.name} sudah habis`)
          continue
        }

        // Check min order
        if (item.quantity < product.minOrder) {
          errors.push(`Minimal order untuk ${product.name} adalah ${product.minOrder}`)
          continue
        }

        // Check stock
        if (item.quantity > product.stock) {
          errors.push(`Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})`)
          continue
        }

        // Use wholesale price if quantity meets min order, otherwise retail price
        const unitPrice = item.quantity >= product.minOrder ? product.wholesalePrice : product.price
        totalAmount += unitPrice * item.quantity

        // Extract first image from product's images field
        const firstImage = product.images ? product.images.split(',')[0].trim() : ''

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: unitPrice,
          productName: product.name,
          productImage: firstImage,
        })
      }

      if (errors.length > 0) {
        // Throw to rollback transaction — these are validation errors
        throw Object.assign(new Error(errors.join('. ')), { statusCode: 400 })
      }

      if (orderItems.length === 0) {
        throw Object.assign(new Error('Tidak ada item yang valid untuk dipesan'), { statusCode: 400 })
      }

      // ===== SERVER-SIDE SHIPPING COST VERIFICATION =====
      // Calculate total weight from products (weight field is String, parse carefully)
      let totalWeightGrams = 0
      for (const item of orderItems) {
        const product = productMap.get(item.productId)
        const weightStr = product?.weight || '250'
        const parsed = parseWeight(weightStr)
        totalWeightGrams += parsed * item.quantity
      }
      // Minimum weight: 250g if all products have no weight set
      if (totalWeightGrams === 0) totalWeightGrams = 250

      // Verify shipping cost against rate table
      // Use destinationProvince for zone lookup (more accurate than city name)
      const clientShippingCost = data.shippingCost ?? 0
      const verification = await verifyShippingCost(
        data.destinationProvince || data.destinationCity || '',
        data.courier || '',
        data.courierService || '',
        totalWeightGrams,
        clientShippingCost
      )
      const shippingCost = verification.cost

      if (verification.adjusted) {
        console.log(
          `[orders] Shipping cost adjusted: client=${clientShippingCost} → server=${shippingCost} (${verification.source})`
        )
      }

      totalAmount += shippingCost

      // Count today's orders INSIDE the transaction to prevent race conditions
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayCount = await tx.order.count({ where: { createdAt: { gte: todayStart } } })

      // Generate unique order number with crypto-safe random
      const { randomInt } = await import('crypto')
      let orderNumber = ''
      let attempts = 0
      do {
        const seq = String(todayCount + 1 + attempts).padStart(4, '0')
        const rand = String(randomInt(0, 10000)).padStart(4, '0') // 4-digit crypto-safe random
        orderNumber = `GPJ-${dateStr}-${seq}${rand}`
        attempts++
        if (attempts > 10) {
          throw Object.assign(new Error('Gagal membuat nomor order unik. Coba lagi.'), { statusCode: 503 })
        }
      } while (await tx.order.findUnique({ where: { orderNumber } }))

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          customerAddr: data.customerAddr,
          status: 'pending',
          paymentMethod: 'transfer',
          paymentStatus: 'unpaid',
          totalAmount,
          shippingCost,
          courier: data.courier,
          courierService: data.courierService,
          destinationCity: data.destinationCity,
          note: data.note,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
        },
      })

      // ===== DEDUCT STOCK & INCREMENT SOLD (atomic within transaction) =====
      for (const item of orderItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity }, deletedAt: null },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        })
        if (updated.count === 0) {
          // Stock was consumed by another concurrent order — rollback entire transaction
          throw Object.assign(
            new Error('Stok tidak mencukupi. Pesanan lain baru saja menghabiskan stok ini.'),
            { statusCode: 409 } // 409 Conflict
          )
        }
      }

      return newOrder
    })

    // Strip supplier info from response (buyer-facing)
    const safeOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product ? { name: item.product.name, images: item.product.images } : { name: item.productName, images: item.productImage },
      })),
    }

    return NextResponse.json({ order: safeOrder }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)

    // Check if this is a controlled validation error with statusCode
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      return NextResponse.json({ error: error.message }, { status: statusCode })
    }

    // Return more detailed error for debugging (but not internal details)
    const errMsg = error instanceof Error ? error.message : String(error)

    // Detect common Turso/column errors and give helpful message
    if (errMsg.includes('no such column') || errMsg.includes('SQLITE_ERROR')) {
      console.error('[orders] Missing column error — ensureSchemaColumns may have failed:', errMsg)
      return NextResponse.json({
        error: 'Sistem sedang diperbarui. Silakan coba lagi dalam 1-2 menit.',
      }, { status: 503 })
    }

    // Generic error — never expose internal details to client
    return NextResponse.json({ error: 'Gagal membuat pesanan. Silakan coba lagi.' }, { status: 500 })
  }
}

/**
 * Parse product weight string to grams.
 * Handles various formats: "250", "250g", "1.5kg", "1 kg", "0.5", etc.
 * Returns weight in grams. Defaults to 250g if unparseable.
 */
function parseWeight(weightStr: string): number {
  if (!weightStr || typeof weightStr !== 'string') return 250

  const normalized = weightStr.trim().toLowerCase()

  // Try "Xkg" format
  const kgMatch = normalized.match(/^([\d.]+)\s*kg$/)
  if (kgMatch) {
    const val = parseFloat(kgMatch[1])
    return isNaN(val) ? 250 : Math.round(val * 1000)
  }

  // Try "Xg" format
  const gMatch = normalized.match(/^([\d.]+)\s*g$/)
  if (gMatch) {
    const val = parseFloat(gMatch[1])
    return isNaN(val) ? 250 : Math.round(val)
  }

  // Try plain number (assume grams)
  const numVal = parseFloat(normalized)
  if (!isNaN(numVal) && numVal > 0) {
    // If number < 10, assume kg; if >= 10, assume grams
    return numVal < 10 ? Math.round(numVal * 1000) : Math.round(numVal)
  }

  return 250 // Default: 250g
}
