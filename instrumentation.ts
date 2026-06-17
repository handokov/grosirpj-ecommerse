/**
 * Next.js Instrumentation — runs once on server startup (runtime only).
 * Auto-migrates Turso/libSQL database columns that may be missing.
 *
 * This is needed because Prisma schema changes (new columns) are not
 * automatically reflected in the Turso remote database.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

let migrationDone = false

async function runMigrations() {
  if (migrationDone) return

  try {
    const { db } = await import('@/lib/db')

    // ===== OrderItem: add productName and productImage if missing =====
    try {
      const orderItemCols = await db.$queryRawUnsafe("PRAGMA table_info('OrderItem')") as Array<{ name: string }>
      const colNames = orderItemCols.map(c => c.name)

      if (!colNames.includes('productName')) {
        await db.$executeRawUnsafe("ALTER TABLE OrderItem ADD COLUMN productName TEXT NOT NULL DEFAULT ''")
        console.log('[migration] ✅ Added productName to OrderItem')
      }
      if (!colNames.includes('productImage')) {
        await db.$executeRawUnsafe("ALTER TABLE OrderItem ADD COLUMN productImage TEXT NOT NULL DEFAULT ''")
        console.log('[migration] ✅ Added productImage to OrderItem')
      }
    } catch (e) {
      console.error('[migration] ⚠️ OrderItem migration error:', e)
    }

    // ===== Order: add missing columns =====
    try {
      const orderCols = await db.$queryRawUnsafe("PRAGMA table_info('Order')") as Array<{ name: string }>
      const orderColNames = orderCols.map(c => c.name)

      const orderNewCols = [
        { name: 'deletedAt', sql: 'ALTER TABLE "Order" ADD COLUMN deletedAt DATETIME' },
        { name: 'note', sql: 'ALTER TABLE "Order" ADD COLUMN note TEXT' },
        { name: 'courier', sql: 'ALTER TABLE "Order" ADD COLUMN courier TEXT' },
        { name: 'courierService', sql: 'ALTER TABLE "Order" ADD COLUMN courierService TEXT' },
        { name: 'destinationCity', sql: 'ALTER TABLE "Order" ADD COLUMN destinationCity TEXT' },
      ]

      for (const col of orderNewCols) {
        if (!orderColNames.includes(col.name)) {
          await db.$executeRawUnsafe(col.sql)
          console.log(`[migration] ✅ Added ${col.name} to Order`)
        }
      }
    } catch (e) {
      console.error('[migration] ⚠️ Order migration error:', e)
    }

    // ===== Product: add missing columns =====
    try {
      const productCols = await db.$queryRawUnsafe("PRAGMA table_info('Product')") as Array<{ name: string }>
      const productColNames = productCols.map(c => c.name)

      const productNewCols = [
        { name: 'deletedAt', sql: 'ALTER TABLE Product ADD COLUMN deletedAt DATETIME' },
        { name: 'supplierName', sql: 'ALTER TABLE Product ADD COLUMN supplierName TEXT' },
        { name: 'supplierLink', sql: 'ALTER TABLE Product ADD COLUMN supplierLink TEXT' },
        { name: 'supplierPhone', sql: 'ALTER TABLE Product ADD COLUMN supplierPhone TEXT' },
      ]

      for (const col of productNewCols) {
        if (!productColNames.includes(col.name)) {
          await db.$executeRawUnsafe(col.sql)
          console.log(`[migration] ✅ Added ${col.name} to Product`)
        }
      }
    } catch (e) {
      console.error('[migration] ⚠️ Product migration error:', e)
    }

    migrationDone = true
    console.log('[migration] ✅ Auto-migration check complete')
  } catch (error) {
    // Don't crash the server — just log the error
    console.error('[migration] ❌ Auto-migration failed (non-fatal):', error)
    migrationDone = true // Don't retry on every request
  }
}

export async function register() {
  // Only run on server runtime — NOT during build
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Run migration asynchronously — don't block server startup
    runMigrations().catch(() => {})
  }
}
