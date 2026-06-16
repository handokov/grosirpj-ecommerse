import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

// Cache this route for 5 minutes (provinces rarely change)
export const revalidate = 300

// GET /api/shipping/provinces - List all Indonesian provinces and their zones
export async function GET() {
  try {
    const zones = await db.shippingZone.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })

    // Build a flat list of province → zone mappings
    const provinces: { name: string; zoneCode: string; zoneName: string }[] = []

    for (const zone of zones) {
      const provinceList = zone.provinces
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      for (const provinceName of provinceList) {
        provinces.push({
          name: provinceName,
          zoneCode: zone.code,
          zoneName: zone.name,
        })
      }
    }

    // Sort alphabetically by province name
    provinces.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ provinces })
  } catch (error) {
    console.error('Shipping provinces error:', error)
    return apiError('Gagal memuat daftar provinsi', 500)
  }
}
