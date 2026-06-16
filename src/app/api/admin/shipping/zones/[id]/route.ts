import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, isCuid } from '@/lib/validations'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/admin/shipping/zones/[id] - Get a single shipping zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const zone = await db.shippingZone.findUnique({
      where: { id },
      include: { rates: { orderBy: { order: 'asc' } } },
    })

    if (!zone) {
      return NextResponse.json({ error: 'Zona tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ zone })
  } catch (error) {
    console.error('Get shipping zone error:', error)
    return NextResponse.json({ error: 'Gagal memuat zona pengiriman' }, { status: 500 })
  }
}

const updateZoneSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  provinces: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

// PUT /api/admin/shipping/zones/[id] - Update a shipping zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const data = await validateBody(request, updateZoneSchema)
    if (data instanceof NextResponse) return data

    const zone = await db.shippingZone.update({
      where: { id },
      data,
    })

    return NextResponse.json({ zone })
  } catch (error) {
    console.error('Update shipping zone error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate zona pengiriman' }, { status: 500 })
  }
}

// DELETE /api/admin/shipping/zones/[id] - Delete a shipping zone (and its rates)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    // Cascade delete will remove associated rates
    await db.shippingZone.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete shipping zone error:', error)
    return NextResponse.json({ error: 'Gagal menghapus zona pengiriman' }, { status: 500 })
  }
}
