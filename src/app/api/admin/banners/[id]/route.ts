import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-guard'
import { updateBannerSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'

// GET single banner
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

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
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const result = updateBannerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const data = result.data

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.link !== undefined && { link: data.link || null }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.active !== undefined && { active: data.active }),
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
  // Auth check
  const auth = await requireAuth()
  if (isAuthError(auth)) return auth

  try {
    const { id } = await params
    await db.banner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json({ error: 'Gagal menghapus banner' }, { status: 500 })
  }
}
