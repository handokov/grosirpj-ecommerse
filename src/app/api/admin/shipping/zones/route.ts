import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, isCuid } from '@/lib/validations'
import { z } from 'zod'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// GET /api/admin/shipping/zones - List all shipping zones
export async function GET() {
  try {
    const session = await requireAdmin()

    const zones = await db.shippingZone.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { rates: true } },
      },
    })

    return NextResponse.json({ zones })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('List shipping zones error:', error)
    return NextResponse.json({ error: 'Gagal memuat zona pengiriman' }, { status: 500 })
  }
}

const createZoneSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  provinces: z.string().min(1),
  order: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
})

// POST /api/admin/shipping/zones - Create a new shipping zone
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const data = await validateBody(request, createZoneSchema)
    if (data instanceof NextResponse) return data

    const zone = await db.shippingZone.create({ data })

    return NextResponse.json({ zone }, { status: 201 })
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('Create shipping zone error:', error)
    return NextResponse.json({ error: 'Gagal membuat zona pengiriman' }, { status: 500 })
  }
}
