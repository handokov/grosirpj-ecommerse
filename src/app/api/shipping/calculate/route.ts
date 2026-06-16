import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { getCourierName } from '@/lib/shipping-calc'

// Cache this route for 5 minutes
export const revalidate = 300

// GET /api/shipping/calculate?province=DKI Jakarta&weight=2500
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const province = searchParams.get('province')?.trim()
    const weightParam = searchParams.get('weight')
    const weight = weightParam ? parseInt(weightParam, 10) : 1000

    // Validate required params
    if (!province) {
      return NextResponse.json(
        { error: 'Parameter "province" wajib diisi' },
        { status: 400 }
      )
    }

    // Validate weight is a positive integer
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { error: 'Parameter "weight" harus berupa angka positif' },
        { status: 400 }
      )
    }

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

    if (!zone) {
      return NextResponse.json({
        zone: null,
        weight,
        results: [],
        message: `Zona pengiriman untuk provinsi "${province}" belum tersedia. Silakan hubungi admin untuk informasi lebih lanjut.`,
      })
    }

    // Get all active rates for this zone
    const rates = await db.shippingRate.findMany({
      where: { zoneId: zone.id, active: true },
      orderBy: { order: 'asc' },
    })

    if (rates.length === 0) {
      return NextResponse.json({
        zone: { code: zone.code, name: zone.name },
        weight,
        results: [],
        message: 'Belum ada tarif pengiriman untuk zona ini.',
      })
    }

    // Calculate cost for each rate
    // Formula: firstKg + (Math.ceil(weight / 1000) - 1) * nextKg (minimum 1kg)
    const kgCount = Math.ceil(weight / 1000)
    const calculatedRates = rates.map((rate) => ({
      courier: rate.courier,
      courierName: getCourierName(rate.courier),
      services: [
        {
          code: rate.service,
          label: rate.serviceLabel,
          cost: rate.firstKg + (kgCount - 1) * rate.nextKg,
          etd: rate.etd,
          firstKg: rate.firstKg,
          nextKg: rate.nextKg,
        },
      ],
    }))

    // Group by courier
    const grouped = calculatedRates.reduce<
      Record<
        string,
        {
          courier: string
          courierName: string
          services: (typeof calculatedRates)[number]['services']
        }
      >
    >((acc, item) => {
      if (!acc[item.courier]) {
        acc[item.courier] = {
          courier: item.courier,
          courierName: item.courierName,
          services: [],
        }
      }
      acc[item.courier].services.push(...item.services)
      return acc
    }, {})

    const results = Object.values(grouped)

    return NextResponse.json({
      zone: { code: zone.code, name: zone.name },
      weight,
      results,
    })
  } catch (error) {
    console.error('Shipping calculate error:', error)
    return apiError('Gagal menghitung ongkos kirim', 500)
  }
}
