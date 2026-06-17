import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, isCuid } from '@/lib/validations'
import { z } from 'zod'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// GET /api/admin/shipping/rates - List all shipping rates (with zone info)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const { searchParams } = request.nextUrl
    const zoneId = searchParams.get('zoneId')

    const rates = await db.shippingRate.findMany({
      where: zoneId ? { zoneId } : undefined,
      orderBy: [{ zoneId: 'asc' }, { order: 'asc' }],
      include: {
        zone: { select: { name: true, code: true } },
      },
    })

    return NextResponse.json({ rates })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('List shipping rates error:', error)
    return NextResponse.json({ error: 'Gagal memuat tarif pengiriman' }, { status: 500 })
  }
}

const createRateSchema = z.object({
  zoneId: z.string().min(1),
  courier: z.string().min(1).max(50),
  service: z.string().min(1).max(50),
  serviceLabel: z.string().min(1).max(200),
  firstKg: z.number().int().min(0),
  nextKg: z.number().int().min(0),
  etd: z.string().max(100).optional().default('-'),
  active: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
})

// POST /api/admin/shipping/rates - Create a new shipping rate
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const data = await validateBody(request, createRateSchema)
    if (data instanceof NextResponse) return data

    const rate = await db.shippingRate.create({ data })

    return NextResponse.json({ rate }, { status: 201 })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Create shipping rate error:', error)
    if (String(error).includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Tarif untuk kurir dan layanan ini sudah ada di zona tersebut' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Gagal membuat tarif pengiriman' }, { status: 500 })
  }
}
