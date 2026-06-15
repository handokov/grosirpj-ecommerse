import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateBody, createBannerSchema, bulkUpdateBannerSchema } from '@/lib/validations'

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
    const data = await validateBody(request, createBannerSchema)
    if (data instanceof NextResponse) return data

    const banner = await db.banner.create({
      data: {
        title: data.title,
        image: data.image,
        link: data.link || null,
        order: data.order,
        active: data.active,
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
    const data = await validateBody(request, bulkUpdateBannerSchema)
    if (data instanceof NextResponse) return data

    for (const b of data.banners) {
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
