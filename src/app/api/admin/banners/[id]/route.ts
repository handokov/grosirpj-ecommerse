import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single banner
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const banner = await db.banner.findUnique({ where: { id } })
    if (!banner) {
      return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json({ error: 'Gagal mengambil data banner' }, { status: 500 })
  }
}

// PUT update banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, image, link, order, active } = body

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(image !== undefined && { image }),
        ...(link !== undefined && { link: link || null }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json({ error: 'Gagal mengupdate banner' }, { status: 500 })
  }
}

// DELETE banner
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.banner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json({ error: 'Gagal menghapus banner' }, { status: 500 })
  }
}
