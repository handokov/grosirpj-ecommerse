import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET active banners (public)
export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        image: true,
        link: true,
        order: true,
      },
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching public banners:', error)
    return NextResponse.json([])
  }
}
