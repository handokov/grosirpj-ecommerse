import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params

    // Validate order number format
    if (!/^GPJ-\d{8}-\d{4,8}[A-Z]?$/.test(orderNumber)) {
      return NextResponse.json({ error: 'Nomor order tidak valid' }, { status: 400 })
    }

    // Find the order
    const order = await db.order.findFirst({
      where: { orderNumber, deletedAt: null },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    // Don't allow upload if already paid
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Pesanan sudah dibayar' }, { status: 400 })
    }

    // Don't allow upload if cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Pesanan sudah dibatalkan' }, { status: 400 })
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File bukti pembayaran wajib diupload' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
    }

    // Convert to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await uploadImage(base64, 'grosirpj/payment-proofs')

    // Update order
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        paymentProof: result.url,
      },
    })

    return NextResponse.json({
      success: true,
      paymentProof: updatedOrder.paymentProof,
      uploadedAt: updatedOrder.updatedAt,
    })
  } catch (error) {
    console.error('Upload payment proof error:', error)
    return NextResponse.json({ error: 'Gagal mengupload bukti pembayaran' }, { status: 500 })
  }
}
