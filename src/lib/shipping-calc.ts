/**
 * Shared shipping cost calculation utility.
 * Used by both the /api/shipping/calculate route (for frontend display)
 * and the /api/orders route (for server-side verification of shipping cost).
 */

import { db } from '@/lib/db'

/**
 * Calculate shipping cost from the rate table.
 * This is the SERVER-SIDE source of truth for shipping costs.
 *
 * @param province - Province name (e.g. "DKI Jakarta", "Jawa Barat")
 * @param courier - Courier code (e.g. "jne", "jnt", "sicepat")
 * @param service - Service code (e.g. "REG", "YES", "EZ")
 * @param weightGrams - Total weight in grams
 * @returns The calculated cost in Rupiah, or null if no matching rate found
 */
export async function calculateShippingCost(
  province: string,
  courier: string,
  service: string,
  weightGrams: number
): Promise<number | null> {
  try {
    // Find the zone that contains this province
    const zones = await db.shippingZone.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })

    const zone = zones.find((z) => {
      const provinceList = z.provinces
        .split(',')
        .map((p) => p.trim().toLowerCase())
      return provinceList.includes(province.toLowerCase())
    })

    if (!zone) return null

    // Find the exact rate for this courier + service + zone
    const rate = await db.shippingRate.findFirst({
      where: {
        zoneId: zone.id,
        courier: courier.toLowerCase(),
        service: service,
        active: true,
      },
    })

    if (!rate) return null

    // Formula: firstKg + (ceil(weight / 1000) - 1) * nextKg (minimum 1kg)
    const kgCount = Math.max(1, Math.ceil(weightGrams / 1000))
    return rate.firstKg + (kgCount - 1) * rate.nextKg
  } catch (error) {
    // If the shipping tables don't exist yet (e.g. fresh Turso DB),
    // the query will throw. Return null to allow fallback to client cost.
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('does not exist') || msg.includes('no such table') || msg.includes('SQLITE_ERROR')) {
      console.warn('[shipping] Shipping tables not found — returning null (tables may not exist yet)')
      return null
    }
    // Re-throw unexpected errors
    throw error
  }
}

/**
 * Verify a client-submitted shipping cost against the rate table.
 * Returns the verified cost (from rate table) if a matching rate exists,
 * or null if no matching rate found (meaning the client's cost cannot be verified).
 *
 * Tolerance: If the client cost differs by more than 20% from the calculated cost,
 * we use the calculated cost instead (to prevent manipulation while allowing for
 * slight rate variations).
 *
 * @param province - Destination province name
 * @param courier - Courier code from client
 * @param service - Service code from client
 * @param weightGrams - Total weight in grams
 * @param clientCost - The shipping cost submitted by the client
 * @returns Object with verified cost and whether it was adjusted
 */
export async function verifyShippingCost(
  province: string,
  courier: string,
  service: string,
  weightGrams: number,
  clientCost: number
): Promise<{ cost: number; adjusted: boolean; source: 'calculated' | 'client' | 'manual' }> {
  // Manual override: if courier is "manual", trust the client cost (admin/seller set it)
  if (courier === 'manual' || !courier || !service) {
    return { cost: clientCost, adjusted: false, source: 'manual' }
  }

  // No province provided — can't verify, but allow client cost as fallback
  if (!province) {
    return { cost: clientCost, adjusted: false, source: 'client' }
  }

  // Try to calculate from rate table (handles missing tables gracefully)
  let calculatedCost: number | null = null
  try {
    calculatedCost = await calculateShippingCost(province, courier, service, weightGrams)
  } catch (error) {
    // If calculation fails (e.g. tables don't exist), fall back to client cost
    console.warn('[shipping] calculateShippingCost failed, using client cost:', error)
    return { cost: clientCost, adjusted: false, source: 'client' }
  }

  if (calculatedCost === null) {
    // No matching rate found in table — trust client cost as fallback
    // This handles edge cases like new couriers not yet in the rate table
    // or shipping tables that haven't been seeded yet
    console.warn(
      `[shipping] No rate found for province="${province}" courier="${courier}" service="${service}" — using client cost ${clientCost}`
    )
    return { cost: clientCost, adjusted: false, source: 'client' }
  }

  // Verify: if client cost is within 20% of calculated, use calculated cost
  // This prevents manipulation while accommodating slight rate variations
  const difference = Math.abs(clientCost - calculatedCost)
  const tolerance = calculatedCost * 0.2

  if (difference <= tolerance) {
    // Client cost is close enough — use the calculated (server) cost
    return { cost: calculatedCost, adjusted: clientCost !== calculatedCost, source: 'calculated' }
  }

  // Client cost differs significantly — always use server-calculated cost
  console.warn(
    `[shipping] Cost mismatch: client=${clientCost} calculated=${calculatedCost} province="${province}" courier="${courier}" service="${service}" — using calculated cost`
  )
  return { cost: calculatedCost, adjusted: true, source: 'calculated' }
}

/**
 * Map courier code to display name.
 */
export function getCourierName(courier: string): string {
  const names: Record<string, string> = {
    jne: 'JNE',
    jnt: 'J&T',
    sicepat: 'SiCepat',
    anteraja: 'AnterAja',
    ninja: 'Ninja Xpress',
    pos: 'POS Indonesia',
    tiki: 'TIKI',
    wahana: 'Wahana',
    rpx: 'RPX',
    pahala: 'Pahala Kencana',
    sentana: 'Sentana',
    jx: 'JX Express',
    sap: 'SAP Express',
    idl: 'IDL',
    lion: 'Lion Parcel',
  }
  return names[courier] || courier.toUpperCase()
}
