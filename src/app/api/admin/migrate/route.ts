import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// POST - Run schema migrations for Turso production DB
// Call this endpoint manually after deploying schema changes.
// This is separated from the order creation path to avoid timeouts.
// ADMIN ONLY — modifies database schema.
export async function POST() {
  try {
    await requireAdmin()

    const results: string[] = []

    // ─── Step 1: Ensure tables exist ─────────────────────────
    const tableSQLs = [
      `CREATE TABLE IF NOT EXISTS "ShippingZone" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "provinces" TEXT NOT NULL,
        "active" BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "ShippingRate" (
        "id" TEXT PRIMARY KEY,
        "zoneId" TEXT NOT NULL,
        "courier" TEXT NOT NULL,
        "service" TEXT NOT NULL,
        "firstKg" INTEGER NOT NULL,
        "nextKg" INTEGER NOT NULL,
        "etd" TEXT DEFAULT '',
        "active" BOOLEAN DEFAULT true,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ]

    for (const sql of tableSQLs) {
      try {
        await db.$executeRawUnsafe(sql)
        results.push(`✓ Table ensured: ${sql.match(/"(\w+)"/)?.[1] || 'unknown'}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('already exists')) {
          results.push(`✓ Table already exists: ${sql.match(/"(\w+)"/)?.[1] || 'unknown'}`)
        } else {
          results.push(`⚠ Table creation warning: ${msg.slice(0, 100)}`)
        }
      }
    }

    // ─── Step 2: Add missing columns ─────────────────────────
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
      'ALTER TABLE "OrderItem" ADD COLUMN color TEXT',
      'ALTER TABLE "OrderItem" ADD COLUMN variant TEXT',
      // Product table
      'ALTER TABLE "Product" ADD COLUMN deletedAt DATETIME',
      'ALTER TABLE "Product" ADD COLUMN supplierName TEXT',
      'ALTER TABLE "Product" ADD COLUMN supplierLink TEXT',
      'ALTER TABLE "Product" ADD COLUMN supplierPhone TEXT',
      // Product table — variant feature (colors + custom variant)
      'ALTER TABLE "Product" ADD COLUMN colors TEXT',
      'ALTER TABLE "Product" ADD COLUMN variantName TEXT',
      'ALTER TABLE "Product" ADD COLUMN variants TEXT',
      // CartItem table — variant feature
      'ALTER TABLE "CartItem" ADD COLUMN color TEXT',
      'ALTER TABLE "CartItem" ADD COLUMN variant TEXT',
    ]

    let migrated = 0
    let alreadyExisted = 0
    for (const sql of migrations) {
      try {
        await db.$executeRawUnsafe(sql)
        migrated++
        results.push(`✓ Migrated: ${sql.match(/ADD COLUMN (\w+)/)?.[1] || sql}`)
      } catch (alterErr) {
        const msg = alterErr instanceof Error ? alterErr.message : String(alterErr)
        if (msg.includes('duplicate') || msg.includes('already exists')) {
          alreadyExisted++
        } else {
          results.push(`⚠ Migration failed: ${sql} — ${msg.slice(0, 100)}`)
        }
      }
    }

    if (alreadyExisted > 0) {
      results.push(`✓ ${alreadyExisted} columns already existed (no migration needed)`)
    }
    if (migrated > 0) {
      results.push(`✓ Successfully migrated ${migrated} new columns`)
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete. ${migrated} new columns added, ${alreadyExisted} already existed.`,
      details: results,
    })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('[migrate] Migration failed:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
    }, { status: 500 })
  }
}

// GET - Check migration status (lightweight check)
// ADMIN ONLY — exposes database schema information.
export async function GET() {
  try {
    await requireAdmin()

    const checks: { column: string; exists: boolean }[] = []

    // Check key columns with a single lightweight query
    const columnsToCheck = [
      { table: 'Order', column: 'courier' },
      { table: 'Order', column: 'destinationCity' },
      { table: 'OrderItem', column: 'productName' },
      { table: 'Product', column: 'deletedAt' },
      // Variant feature columns (added in commit abe6231)
      { table: 'Product', column: 'colors' },
      { table: 'Product', column: 'variantName' },
      { table: 'Product', column: 'variants' },
      { table: 'Product', column: 'supplierName' },
      { table: 'OrderItem', column: 'color' },
      { table: 'OrderItem', column: 'variant' },
      { table: 'CartItem', column: 'color' },
      { table: 'CartItem', column: 'variant' },
    ]

    for (const check of columnsToCheck) {
      try {
        await db.$queryRawUnsafe(`SELECT ${check.column} FROM "${check.table}" LIMIT 0`)
        checks.push({ column: `${check.table}.${check.column}`, exists: true })
      } catch {
        checks.push({ column: `${check.table}.${check.column}`, exists: false })
      }
    }

    // Check shipping tables
    const tablesToCheck = ['ShippingZone', 'ShippingRate']
    for (const table of tablesToCheck) {
      try {
        await db.$queryRawUnsafe(`SELECT id FROM "${table}" LIMIT 0`)
        checks.push({ column: `${table} (table)`, exists: true })
      } catch {
        checks.push({ column: `${table} (table)`, exists: false })
      }
    }

    const allOk = checks.every(c => c.exists)

    return NextResponse.json({
      status: allOk ? 'ok' : 'needs_migration',
      checks,
      message: allOk
        ? 'All schema migrations are up to date.'
        : 'Some columns/tables are missing. Run POST /api/admin/migrate to fix.',
    })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    return NextResponse.json({
      status: 'error',
      error: 'Internal error',
    }, { status: 500 })
  }
}
