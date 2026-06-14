import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.RAJAONGKIR_API_KEY
const BASE_URL = process.env.RAJAONGKIR_BASE_URL || 'https://api.rajaongkir.com/starter'

// Cache cities for 24 hours
let citiesCache: { data: unknown; timestamp: number } | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface City {
  city_id: string
  province_id: string
  province: string
  type: string
  city_name: string
  postal_code: string
}

async function getCities(): Promise<City[]> {
  // Return from cache if valid
  if (citiesCache && Date.now() - citiesCache.timestamp < CACHE_DURATION) {
    return citiesCache.data as City[]
  }

  if (!API_KEY) {
    return []
  }

  try {
    const res = await fetch(`${BASE_URL}/city`, {
      headers: { key: API_KEY },
      next: { revalidate: 86400 },
    })
    const data = await res.json()

    if (data.rajaongkir?.status?.code === 200) {
      const cities = data.rajaongkir.results as City[]
      citiesCache = { data: cities, timestamp: Date.now() }
      return cities
    }

    return []
  } catch (error) {
    console.error('RajaOngkir cities error:', error)
    return []
  }
}

// GET /api/ongkir/cities?q=search
export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'RajaOngkir API key not configured. Please add RAJAONGKIR_API_KEY to .env', cities: [] },
      { status: 200 }
    )
  }

  try {
    const search = request.nextUrl.searchParams.get('q')?.toLowerCase().trim() || ''
    const allCities = await getCities()

    if (!allCities.length) {
      return NextResponse.json({ cities: [], error: 'Could not fetch cities from RajaOngkir' })
    }

    // Filter cities by search query
    const filtered = search
      ? allCities.filter(
          (c) =>
            c.city_name.toLowerCase().includes(search) ||
            c.province.toLowerCase().includes(search) ||
            c.type.toLowerCase().includes(search)
        )
      : allCities.slice(0, 50) // Return first 50 if no search

    const results = filtered.slice(0, 50).map((c) => ({
      id: c.city_id,
      name: `${c.type} ${c.city_name}`,
      province: c.province,
      postalCode: c.postal_code,
    }))

    return NextResponse.json({ cities: results })
  } catch (error) {
    console.error('Cities search error:', error)
    return NextResponse.json({ cities: [], error: 'Failed to search cities' }, { status: 500 })
  }
}
