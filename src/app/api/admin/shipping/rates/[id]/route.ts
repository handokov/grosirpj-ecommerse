import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, isCuid } from '@/lib/validations'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/admin/shipping/rates/[id] - Get a single shipping rate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const rate = await db.shippingRate.findUnique({
      where: { id },
      include: { zone: { select: { name: true, code: true } } },
    })

    if (!rate) {
      return NextResponse.json({ error: 'Tarif tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ rate })
  } catch (error) {
    console.error('Get shipping rate error:', error)
    return NextResponse.json({ error: 'Gagal memuat tarif pengiriman' }, { status: 500 })
  }
}

const updateRateSchema = z.object({
  courier: z.string().min(1).max(50).optional(),
  service: z.string().min(1).max(50).optional(),
  serviceLabel: z.string().min(1).max(200).optional(),
  firstKg: z.number().int().min(0).optional(),
  nextKg: z.number().int().min(0).optional(),
  etd: z.string().max(100).optional(),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  zoneId: z.string().min(1).optional(),
})

// PUT /api/admin/shipping/rates/[id] - Update a shipping rate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    const data = await validateBody(request, updateRateSchema)
    if (data instanceof NextResponse) return data

    const rate = await db.shippingRate.update({
      where: { id },
      data,
    })

    return NextResponse.json({ rate })
  } catch (error) {
    console.error('Update shipping rate error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate tarif pengiriman' }, { status: 500 })
  }
}

// DELETE /api/admin/shipping/rates/[id] - Delete a shipping rate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { id } = await params
    await db.shippingRate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete shipping rate error:', error)
    return NextResponse.json({ error: 'Gagal menghapus tarif pengiriman' }, { status: 500 })
  }
}
