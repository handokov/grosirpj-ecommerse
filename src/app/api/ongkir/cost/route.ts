import { NextRequest, NextResponse } from 'next/server'

const CEKONGKIR_API_URL = process.env.CEKONGKIR_API_URL || 'http://localhost:3000'
const ORIGIN_CITY_ID = process.env.CEKONGKIR_ORIGIN_CITY_ID || ''

// Supported couriers - now with 11 couriers instead of just 3!
const ALL_COURIERS = ['jne', 'tiki', 'pos', 'jnt', 'sicepat', 'anteraja', 'wahana', 'ninja', 'lion', 'gosend', 'grab']

interface CostService {
  serviceCode: string
  serviceName: string
  description: string | null
  estimated: string | null
  cost: number
}

interface CostResult {
  courier: { code: string; name: string }
  services: CostService[]
}

// POST /api/ongkir/cost
// Body: { destination: string, weight: number, courier?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { destination, weight, courier } = body

    if (!destination) {
      return NextResponse.json({ error: 'Destination city is required', results: [] }, { status: 400 })
    }

    if (!ORIGIN_CITY_ID) {
      return NextResponse.json(
        { error: 'CEKONGKIR_ORIGIN_CITY_ID not configured. Please set it in .env', results: [] },
        { status: 200 }
      )
    }

    const totalWeight = Math.max(weight || 1000, 100) // Minimum 100g, default 1kg

    // Determine which couriers to check
    const courierCodes = courier ? [courier] : ALL_COURIERS

    try {
      const res = await fetch(`${CEKONGKIR_API_URL}/api/cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originCityId: ORIGIN_CITY_ID,
          destinationCityId: String(destination),
          weight: totalWeight,
          courierCodes,
        }),
      })

      const data = await res.json()

      if (data.status === 'ok' && data.data?.results) {
        // Format CekOngkir response to match the existing ShippingCalculator interface
        const formatted = data.data.results.map((r: CostResult) => ({
          courier: r.courier.code,
          courierName: r.courier.name,
          services: r.services.map((s: CostService) => ({
            code: s.serviceCode,
            description: s.serviceName,
            cost: s.cost,
            etd: s.estimated || '-',
            note: s.description || '',
          })),
        }))

        return NextResponse.json({ results: formatted })
      }

      return NextResponse.json({ results: [], error: data.message || 'Failed to get shipping costs' })
    } catch (fetchError) {
      console.error('CekOngkir cost fetch error:')
      return NextResponse.json(
        { error: 'CekOngkir API is not reachable. Make sure the CekOngkir app is running.', results: [] },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Ongkir cost error:')
    return NextResponse.json({ error: 'Failed to calculate shipping cost', results: [] }, { status: 500 })
  }
}
