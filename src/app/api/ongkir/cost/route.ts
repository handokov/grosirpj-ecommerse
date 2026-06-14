import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.RAJAONGKIR_API_KEY
const BASE_URL = process.env.RAJAONGKIR_BASE_URL || 'https://api.rajaongkir.com/starter'
const ORIGIN_CITY_ID = process.env.RAJAONGKIR_ORIGIN_CITY_ID || '153' // Default: Jakarta

// Supported couriers for Starter plan
const COURIERS = ['jne', 'pos', 'tiki']

interface CostResult {
  code: string
  name: string
  costs: {
    service: string
    description: string
    cost: {
      value: number
      etd: string
      note: string
    }[]
  }[]
}

// POST /api/ongkir/cost
// Body: { destination: string, weight: number, courier?: string }
export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'RajaOngkir API key not configured', results: [] },
      { status: 200 }
    )
  }

  try {
    const body = await request.json()
    const { destination, weight, courier } = body

    if (!destination) {
      return NextResponse.json({ error: 'Destination city is required', results: [] }, { status: 400 })
    }

    const totalWeight = Math.max(weight || 1000, 100) // Minimum 100g, default 1kg

    // If specific courier requested, only fetch that one
    const couriersToFetch = courier ? [courier] : COURIERS

    // Fetch costs from all couriers in parallel
    const costPromises = couriersToFetch.map(async (c) => {
      try {
        const res = await fetch(`${BASE_URL}/cost`, {
          method: 'POST',
          headers: {
            key: API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            origin: ORIGIN_CITY_ID,
            destination: String(destination),
            weight: String(totalWeight),
            courier: c,
          }),
        })

        const data = await res.json()

        if (data.rajaongkir?.status?.code === 200) {
          return data.rajaongkir.results[0] as CostResult | null
        }
        return null
      } catch {
        return null
      }
    })

    const results = await Promise.all(costPromises)
    const validResults = results.filter(Boolean) as CostResult[]

    // Format results for frontend
    const formatted = validResults.map((r) => ({
      courier: r.code,
      courierName: r.name,
      services: r.costs.map((c) => ({
        code: c.service,
        description: c.description,
        cost: c.cost[0]?.value || 0,
        etd: c.cost[0]?.etd || '-',
        note: c.cost[0]?.note || '',
      })),
    }))

    return NextResponse.json({ results: formatted })
  } catch (error) {
    console.error('Ongkir cost error:', error)
    return NextResponse.json({ error: 'Failed to calculate shipping cost', results: [] }, { status: 500 })
  }
}
