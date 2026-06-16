import { NextResponse } from 'next/server'
import { getWABotStatus } from '@/lib/whatsapp-notify'

// GET - Check WhatsApp bot status
export async function GET() {
  try {
    const status = await getWABotStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('[wa-bot] Status check error:', error)
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
