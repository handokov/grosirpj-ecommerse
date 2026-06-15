import { NextRequest, NextResponse } from 'next/server'

const CEKONGKIR_API_URL = process.env.CEKONGKIR_API_URL || 'http://localhost:3000'

// Cache cities for 24 hours
let citiesCache: { data: unknown; timestamp: number } | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface City {
  id: string
  name: string
  type: string
  province: string
  label: string
}

async function getCities(): Promise<City[]> {
  // Return from cache if valid
  if (citiesCache && Date.now() - citiesCache.timestamp < CACHE_DURATION) {
    return citiesCache.data as City[]
  }

  try {
    const res = await fetch(`${CEKONGKIR_API_URL}/api/city`, {
      cache: 'no-store',
    })
    const data = await res.json()

    if (data.status === 'ok' && Array.isArray(data.data)) {
      const cities = data.data as City[]
      citiesCache = { data: cities, timestamp: Date.now() }
      return cities
    }

    return []
  } catch (error) {
    console.error('CekOngkir cities error:')
    return []
  }
}

// GET /api/ongkir/cities?q=search
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('q')?.toLowerCase().trim() || ''
    const allCities = await getCities()

    if (!allCities.length) {
      return NextResponse.json({ cities: [], error: 'Could not fetch cities from CekOngkir' })
    }

    // Filter cities by search query
    const filtered = search
      ? allCities.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.province.toLowerCase().includes(search) ||
            c.type.toLowerCase().includes(search)
        )
      : allCities.slice(0, 50) // Return first 50 if no search

    const results = filtered.slice(0, 50).map((c) => ({
      id: c.id,
      name: `${c.type} ${c.name}`,
      province: c.province,
      postalCode: '',
    }))

    return NextResponse.json({ cities: results })
  } catch (error) {
    console.error('Cities search error:')
    return NextResponse.json({ cities: [], error: 'Failed to search cities' }, { status: 500 })
  }
}
