import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all banners (admin)
export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({ error: 'Gagal mengambil data banner' }, { status: 500 })
  }
}

// POST create banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, image, link, order, active } = body

    if (!title || !image) {
      return NextResponse.json({ error: 'Judul dan gambar wajib diisi' }, { status: 400 })
    }

    const banner = await db.banner.create({
      data: {
        title,
        image,
        link: link || null,
        order: order ?? 0,
        active: active ?? true,
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json({ error: 'Gagal membuat banner' }, { status: 500 })
  }
}

// PUT update banner order (bulk)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { banners } = body as { banners: { id: string; order: number; active: boolean }[] }

    for (const b of banners) {
      await db.banner.update({
        where: { id: b.id },
        data: { order: b.order, active: b.active },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating banners:', error)
    return NextResponse.json({ error: 'Gagal mengupdate banner' }, { status: 500 })
  }
}
