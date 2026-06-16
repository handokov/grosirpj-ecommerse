import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadImage } from '@/lib/cloudinary'
import { CLOUDINARY_FOLDER_PRODUCTS, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/store-config'

// POST /api/orders/[orderNumber]/payment-proof — Upload bukti pembayaran
// Public endpoint — user hanya perlu nomor invoice untuk upload
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params

    // Validate order number format
    if (!/^GPJ-\d{8}-\d{4,6}[A-Z]?$/.test(orderNumber)) {
      return NextResponse.json({ error: 'Nomor order tidak valid' }, { status: 400 })
    }

    // Find the order
    const order = await db.order.findFirst({
      where: { orderNumber, deletedAt: null },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    // Only allow upload if order is not cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order sudah dibatalkan' }, { status: 400 })
    }

    // Already paid — no need to upload proof again
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Pembayaran sudah dikonfirmasi' }, { status: 400 })
    }

    // Parse FormData (file upload)
    const formData = await request.formData()
    const file = formData.get('paymentProof') as File | null
    const paymentNotes = formData.get('paymentNotes') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Foto bukti pembayaran wajib diupload' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File terlalu besar. Maksimal ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary in payment-proofs folder
    const uploadResult = await uploadImage(base64, 'grosirpj/payment-proofs')

    // Update order with payment proof
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        paymentProof: uploadResult.url,
        paymentNotes: paymentNotes?.trim() || null,
        paymentStatus: 'unpaid', // Keep unpaid until admin confirms
      },
    })

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.orderNumber,
      paymentProof: updatedOrder.paymentProof,
      paymentStatus: updatedOrder.paymentStatus,
    })
  } catch (error) {
    console.error('Upload payment proof error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupload bukti pembayaran. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
