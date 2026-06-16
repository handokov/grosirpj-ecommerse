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
    // Quick check: if 'courier' column exists in Order table, assume all columns are already migrated.
    // This avoids running 14 ALTER TABLE statements on every cold start.
    try {
      await db.$queryRawUnsafe('SELECT courier FROM "Order" LIMIT 0')
      // If we get here, the column exists — all good, skip migration
      schemaEnsured = true
      return
    } catch {
      // Column doesn't exist — need to migrate
    }

    // List of ALTER TABLE statements to run.
    // Each will fail silently if the column already exists ("duplicate column name").
    const migrations = [
      // Order table
      'ALTER TABLE "Order" ADD COLUMN courier TEXT',
      'ALTER TABLE "Order" ADD COLUMN courierService TEXT',
      'ALTER TABLE "Order" ADD COLUMN destinationCity TEXT',
      'ALTER TABLE "Order" ADD COLUMN note TEXT',
      'ALTER TABLE "Order" ADD COLUMN paymentProof TEXT',
      'ALTER TABLE "Order" ADD COLUMN paymentNotes TEXT',
      'ALTER TABLE "Order" ADD COLUMN paidAt DATETIME',
      'ALTER TABLE "Order" ADD COLUMN deletedAt DATETIME',
      // OrderItem table
      'ALTER TABLE "OrderItem" ADD COLUMN productName TEXT',
      'ALTER TABLE "OrderItem" ADD COLUMN productImage TEXT',
      // Product table
      'ALTER TABLE "Product" ADD COLUMN deletedAt DATETIME',
      'ALTER TABLE "Product" ADD COLUMN supplierName TEXT',
      'ALTER TABLE "Product" ADD COLUMN supplierLink TEXT',
      'ALTER TABLE "Product" ADD COLUMN supplierPhone TEXT',
    ]

    let migrated = 0
    for (const sql of migrations) {
      try {
        await db.$executeRawUnsafe(sql)
        migrated++
      } catch (alterErr) {
        // "duplicate column name" or "already exists" means column is there — OK
        const msg = alterErr instanceof Error ? alterErr.message : String(alterErr)
        if (!msg.includes('duplicate') && !msg.includes('already exists')) {
          console.warn(`[orders] Migration failed: ${sql} — ${msg}`)
        }
      }
    }

    if (migrated > 0) {
      console.log(`[orders] Auto-migrated ${migrated} columns`)
    }

    schemaEnsured = true
  } catch (err) {
    console.warn('[orders] Schema migration warning:', err)
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
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    const order = await db.$transaction(async (tx) => {
      // Fetch all products INSIDE the transaction for consistent reads
      const productIds = data.items.map(item => item.productId)
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          deletedAt: null,
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

      const productMap = new Map(products.map(p => [p.id, p]))

      const orderItems: { productId: string; quantity: number; size: string; price: number; productName: string; productImage: string }[] = []
      let totalAmount = 0
      const errors: string[] = []

      for (const item of data.items) {
        const product = productMap.get(item.productId)

        if (!product) {
          errors.push(`Produk tidak ditemukan atau sudah dihapus`)
          continue
        }

        if (product.stock <= 0) {
          errors.push(`Produk ${product.name} sudah habis`)
          continue
        }

        if (item.quantity < product.minOrder) {
          errors.push(`Minimal order untuk ${product.name} adalah ${product.minOrder}`)
          continue
        }

        if (item.quantity > product.stock) {
          errors.push(`Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})`)
          continue
        }

        const unitPrice = item.quantity >= product.minOrder ? product.wholesalePrice : product.price
        totalAmount += unitPrice * item.quantity

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
        throw Object.assign(new Error(errors.join('. ')), { statusCode: 400 })
      }

      if (orderItems.length === 0) {
        throw Object.assign(new Error('Tidak ada item yang valid untuk dipesan'), { statusCode: 400 })
      }

      // ===== SERVER-SIDE SHIPPING COST VERIFICATION =====
      let totalWeightGrams = 0
      for (const item of orderItems) {
        const product = productMap.get(item.productId)
        const weightStr = product?.weight || '250'
        const parsed = parseWeight(weightStr)
        totalWeightGrams += parsed * item.quantity
      }
      if (totalWeightGrams === 0) totalWeightGrams = 250

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

      // Count today's orders INSIDE the transaction
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayCount = await tx.order.count({ where: { createdAt: { gte: todayStart } } })

      // Generate unique order number
      const { randomInt } = await import('crypto')
      let orderNumber = ''
      let attempts = 0
      do {
        const seq = String(todayCount + 1 + attempts).padStart(4, '0')
        const rand = String(randomInt(0, 10000)).padStart(4, '0')
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

      // ===== DEDUCT STOCK & INCREMENT SOLD =====
      for (const item of orderItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity }, deletedAt: null },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        })
        if (updated.count === 0) {
          throw Object.assign(
            new Error('Stok tidak mencukupi. Pesanan lain baru saja menghabiskan stok ini.'),
            { statusCode: 409 }
          )
        }
      }

      return newOrder
    })

    // Strip supplier info from response
    const safeOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product ? { name: item.product.name, images: item.product.images } : { name: item.productName, images: item.productImage },
      })),
    }

    return NextResponse.json({ order: safeOrder }, { status: 201 })
  } catch (error) {
    // Log FULL error details for debugging (visible in Vercel logs)
    const errorType = error?.constructor?.name || 'Unknown'
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : ''
    console.error(`[orders] CREATE ORDER FAILED: type=${errorType} message="${errorMessage}"`)
    if (errorStack) console.error(`[orders] Stack: ${errorStack}`)

    // Log the full Prisma error if available
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code?: string; meta?: unknown }
      console.error(`[orders] Prisma error code: ${prismaError.code}, meta:`, prismaError.meta)
    }

    // Check if this is a controlled validation error with statusCode
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      return NextResponse.json({ error: error.message }, { status: statusCode })
    }

    // Detect specific errors and give helpful messages
    if (errorMessage.includes('no such column') || errorMessage.includes('SQLITE_ERROR')) {
      return NextResponse.json({
        error: 'Sistem sedang diperbarui. Silakan coba lagi dalam 1-2 menit.',
        debug: errorMessage,
      }, { status: 503 })
    }

    if (errorMessage.includes('does not exist') || errorMessage.includes('no such table')) {
      return NextResponse.json({
        error: 'Sistem sedang diperbarui. Silakan coba lagi dalam 1-2 menit.',
        debug: errorMessage,
      }, { status: 503 })
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('Timed out')) {
      return NextResponse.json({
        error: 'Server sedang sibuk. Silakan coba lagi.',
      }, { status: 504 })
    }

    // Return error with debug info temporarily for production debugging
    return NextResponse.json({
      error: 'Gagal membuat pesanan. Silakan coba lagi.',
      debug: errorMessage,
    }, { status: 500 })
  }
}

/**
 * Parse product weight string to grams.
 */
function parseWeight(weightStr: string): number {
  if (!weightStr || typeof weightStr !== 'string') return 250

  const normalized = weightStr.trim().toLowerCase()

  const kgMatch = normalized.match(/^([\d.]+)\s*kg$/)
  if (kgMatch) {
    const val = parseFloat(kgMatch[1])
    return isNaN(val) ? 250 : Math.round(val * 1000)
  }

  const gMatch = normalized.match(/^([\d.]+)\s*g$/)
  if (gMatch) {
    const val = parseFloat(gMatch[1])
    return isNaN(val) ? 250 : Math.round(val)
  }

  const numVal = parseFloat(normalized)
  if (!isNaN(numVal) && numVal > 0) {
    return numVal < 10 ? Math.round(numVal * 1000) : Math.round(numVal)
  }

  return 250
}
