import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAdmin } from '@/lib/auth-guard'

// ─── Zone Definitions ────────────────────────────────────────────────
const zones = [
  { code: 'JABODETABEK', name: 'Jabodetabek', provinces: 'DKI Jakarta', order: 1 },
  { code: 'JAWA_BARAT', name: 'Jawa Barat', provinces: 'Jawa Barat', order: 2 },
  { code: 'JAWA_TENGAH', name: 'Jawa Tengah & DIY', provinces: 'Jawa Tengah, DI Yogyakarta', order: 3 },
  { code: 'JAWA_TIMUR', name: 'Jawa Timur', provinces: 'Jawa Timur', order: 4 },
  {
    code: 'SUMATERA', name: 'Sumatera',
    provinces: 'Aceh, Sumatera Utara, Sumatera Barat, Riau, Kepulauan Riau, Jambi, Sumatera Selatan, Bangka Belitung, Bengkulu, Lampung',
    order: 5,
  },
  { code: 'BALI_NTB', name: 'Bali & NTB', provinces: 'Bali, Nusa Tenggara Barat', order: 6 },
  {
    code: 'KALIMANTAN', name: 'Kalimantan',
    provinces: 'Kalimantan Barat, Kalimantan Tengah, Kalimantan Selatan, Kalimantan Timur, Kalimantan Utara',
    order: 7,
  },
  {
    code: 'SULAWESI', name: 'Sulawesi',
    provinces: 'Sulawesi Utara, Gorontalo, Sulawesi Tengah, Sulawesi Barat, Sulawesi Selatan, Sulawesi Tenggara',
    order: 8,
  },
  {
    code: 'TIMUR', name: 'Indonesia Timur',
    provinces: 'Nusa Tenggara Timur, Maluku, Maluku Utara, Papua, Papua Barat',
    order: 9,
  },
]

// ─── Rate Definitions ─────────────────────────────────────────────────
const ratesByZone: Record<string, Array<{
  courier: string; service: string; serviceLabel: string; firstKg: number; nextKg: number; etd: string; order: number
}>> = {
  JABODETABEK: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 18000, nextKg: 3000, etd: '1-2 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 28000, nextKg: 5000, etd: '1 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 15000, nextKg: 3000, etd: '1-2 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 16000, nextKg: 2500, etd: '1-2 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 17000, nextKg: 3000, etd: '2-3 hari', order: 5 },
  ],
  JAWA_BARAT: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 22000, nextKg: 4000, etd: '1-2 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 35000, nextKg: 6000, etd: '1 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 20000, nextKg: 4000, etd: '1-2 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 20000, nextKg: 3500, etd: '1-2 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 20000, nextKg: 3500, etd: '2-3 hari', order: 5 },
  ],
  JAWA_TENGAH: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 25000, nextKg: 5000, etd: '2-3 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 38000, nextKg: 7000, etd: '1-2 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 22000, nextKg: 5000, etd: '2-3 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 22000, nextKg: 4000, etd: '2-3 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 22000, nextKg: 4000, etd: '3-4 hari', order: 5 },
  ],
  JAWA_TIMUR: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 28000, nextKg: 6000, etd: '2-3 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 42000, nextKg: 8000, etd: '1-2 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 25000, nextKg: 6000, etd: '2-3 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 25000, nextKg: 5000, etd: '2-3 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 25000, nextKg: 5000, etd: '3-4 hari', order: 5 },
  ],
  SUMATERA: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 35000, nextKg: 8000, etd: '3-5 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 55000, nextKg: 10000, etd: '2-3 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 30000, nextKg: 7000, etd: '3-5 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 30000, nextKg: 6000, etd: '3-5 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 30000, nextKg: 6000, etd: '4-6 hari', order: 5 },
  ],
  BALI_NTB: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 32000, nextKg: 7000, etd: '3-4 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 50000, nextKg: 9000, etd: '2-3 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 28000, nextKg: 6000, etd: '3-4 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 28000, nextKg: 5000, etd: '3-4 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 28000, nextKg: 5000, etd: '4-5 hari', order: 5 },
  ],
  KALIMANTAN: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 45000, nextKg: 10000, etd: '4-6 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 65000, nextKg: 12000, etd: '2-4 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 38000, nextKg: 9000, etd: '4-6 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 38000, nextKg: 8000, etd: '4-6 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 35000, nextKg: 8000, etd: '5-7 hari', order: 5 },
  ],
  SULAWESI: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 50000, nextKg: 11000, etd: '4-6 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 70000, nextKg: 13000, etd: '2-4 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 42000, nextKg: 10000, etd: '4-6 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 42000, nextKg: 9000, etd: '4-6 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 38000, nextKg: 9000, etd: '5-7 hari', order: 5 },
  ],
  TIMUR: [
    { courier: 'jne', service: 'REG', serviceLabel: 'JNE REGULER', firstKg: 60000, nextKg: 15000, etd: '5-10 hari', order: 1 },
    { courier: 'jne', service: 'YES', serviceLabel: 'JNE YES', firstKg: 85000, nextKg: 18000, etd: '3-5 hari', order: 2 },
    { courier: 'jnt', service: 'EZ', serviceLabel: 'J&T EZ', firstKg: 50000, nextKg: 13000, etd: '5-10 hari', order: 3 },
    { courier: 'sicepat', service: 'REG', serviceLabel: 'SiCepat REG', firstKg: 50000, nextKg: 12000, etd: '5-10 hari', order: 4 },
    { courier: 'pos', service: 'KILAT', serviceLabel: 'POS Kilat Khusus', firstKg: 45000, nextKg: 12000, etd: '7-14 hari', order: 5 },
  ],
}

/**
 * Ensure shipping tables exist in the database.
 * Uses raw SQL via $executeRawUnsafe so it works even if Prisma
 * hasn't been push/migrated yet (e.g. fresh Turso DB).
 */
async function ensureTablesExist() {
  // Create ShippingZone table
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ShippingZone" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "code" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "provinces" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create unique index on code if not exists
  try {
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ShippingZone_code_key" ON "ShippingZone"("code")
    `)
  } catch {
    // Index may already exist, ignore
  }

  // Create index on active
  try {
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ShippingZone_active_idx" ON "ShippingZone"("active")
    `)
  } catch {
    // ignore
  }

  // Create index on order
  try {
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ShippingZone_order_idx" ON "ShippingZone"("order")
    `)
  } catch {
    // ignore
  }

  // Create ShippingRate table
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ShippingRate" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "zoneId" TEXT NOT NULL,
      "courier" TEXT NOT NULL,
      "service" TEXT NOT NULL,
      "serviceLabel" TEXT NOT NULL,
      "firstKg" INTEGER NOT NULL,
      "nextKg" INTEGER NOT NULL,
      "etd" TEXT NOT NULL DEFAULT '-',
      "active" BOOLEAN NOT NULL DEFAULT true,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("zoneId") REFERENCES "ShippingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)

  // Create unique constraint on zoneId+couier+service
  try {
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ShippingRate_zoneId_courier_service_key" ON "ShippingRate"("zoneId", "courier", "service")
    `)
  } catch {
    // Index may already exist, ignore
  }

  // Create indexes
  try {
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShippingRate_zoneId_idx" ON "ShippingRate"("zoneId")`)
  } catch { /* ignore */ }
  try {
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShippingRate_active_idx" ON "ShippingRate"("active")`)
  } catch { /* ignore */ }
  try {
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShippingRate_courier_idx" ON "ShippingRate"("courier")`)
  } catch { /* ignore */ }

  console.log('[seed] Tables ensured')
}

// POST /api/admin/shipping/seed — Seed shipping zones & rates (admin only)
export async function POST() {
  try {
    await requireAdmin()

    // Step 0: Ensure tables exist (critical for Turso/production)
    await ensureTablesExist()

    // Step 1: Delete existing data (rates first due to FK constraint)
    let deletedRates = { count: 0 }
    let deletedZones = { count: 0 }

    try {
      deletedRates = await db.shippingRate.deleteMany()
      deletedZones = await db.shippingZone.deleteMany()
    } catch (delErr) {
      console.warn('[seed] Delete warning:', delErr)
    }

    // Step 2: Create zones
    const createdZones: Record<string, string> = {}

    for (const zone of zones) {
      const created = await db.shippingZone.create({
        data: {
          code: zone.code,
          name: zone.name,
          provinces: zone.provinces,
          order: zone.order,
          active: true,
        },
      })
      createdZones[zone.code] = created.id
    }

    // Step 3: Create rates using createMany for performance
    let totalRates = 0

    for (const zone of zones) {
      const zoneId = createdZones[zone.code]
      const rates = ratesByZone[zone.code]
      if (!rates || !zoneId) continue

      const result = await db.shippingRate.createMany({
        data: rates.map(rate => ({
          zoneId,
          courier: rate.courier,
          service: rate.service,
          serviceLabel: rate.serviceLabel,
          firstKg: rate.firstKg,
          nextKg: rate.nextKg,
          etd: rate.etd,
          active: true,
          order: rate.order,
        })),
      })
      totalRates += result.count
    }

    return NextResponse.json({
      success: true,
      message: 'Shipping zones & rates seeded successfully',
      summary: {
        zonesCreated: zones.length,
        ratesCreated: totalRates,
        zonesDeleted: deletedZones.count,
        ratesDeleted: deletedRates.count,
      },
    })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()

    // Return detailed error info for debugging
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error('[seed] Shipping seed error:', errorMessage)

    // Detect common issues and return helpful messages
    if (errorMessage.includes('does not exist') || errorMessage.includes('no such table')) {
      return NextResponse.json({
        error: 'Tabel database belum ada. Coba lagi — sistem akan membuat tabel otomatis.',
        detail: errorMessage,
      }, { status: 500 })
    }

    if (errorMessage.includes('Unique constraint') || errorMessage.includes('UNIQUE')) {
      return NextResponse.json({
        error: 'Data ongkir sudah ada. Tekan tombol seed untuk reset dan isi ulang.',
        detail: errorMessage,
      }, { status: 409 })
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('Timed out')) {
      return NextResponse.json({
        error: 'Database timeout. Coba lagi dalam beberapa saat.',
        detail: errorMessage,
      }, { status: 504 })
    }

    return NextResponse.json({
      error: 'Gagal seed data ongkir',
      detail: errorMessage,
    }, { status: 500 })
  }
}
