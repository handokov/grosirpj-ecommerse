import { NextResponse } from 'next/server'
import { getWABotStatus } from '@/lib/whatsapp-notify'
import { requireAdmin, isAuthError } from '@/lib/auth-guard'

// GET - Check WhatsApp bot status (admin only)
// Exposes internal service status — must be protected.
export async function GET() {
  try {
    await requireAdmin()

    const status = await getWABotStatus()
    return NextResponse.json(status)
  } catch (error) {
    if (isAuthError(error)) return error.toResponse()
    console.error('[wa-bot] Status check error:', error)
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
