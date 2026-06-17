import { NextRequest, NextResponse } from 'next/server'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import { requireAdmin, isAdminError } from '@/lib/auth-guard'
import { db } from '@/lib/db'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string()
    .min(8, 'Password baru minimal 8 karakter')
    .max(128, 'Password baru maksimal 128 karakter')
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Password baru harus mengandung huruf dan angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isAdminError(session)) return session

  try {
    const body = await request.json()
    const result = changePasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) },
        { status: 400 }
      )
    }
    const { currentPassword, newPassword } = result.data

    // Get user from DB with password
    const userId = (session.user as unknown as { id: string }).id
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 })
    }

    // Hash new password with 12 rounds (current OWASP recommendation)
    const hashedPassword = await hash(newPassword, 12)

    // Update password in database
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Gagal mengubah password' }, { status: 500 })
  }
}
