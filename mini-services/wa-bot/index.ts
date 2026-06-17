/**
 * GrosirPJ WhatsApp Bot — Self-hosted using Baileys
 * 
 * This mini-service connects to WhatsApp Web and provides an HTTP API
 * to send messages. The Next.js app calls this service instead of
 * third-party APIs like Fonnte.
 * 
 * How it works:
 * 1. Start this service → it generates a QR code
 * 2. Scan the QR code with WhatsApp (same number as GrosirPJ)
 * 3. The service stays connected and can send messages via HTTP API
 * 4. Session is saved so you don't need to re-scan every restart
 * 
 * API Endpoints:
 * - GET  /status       → Check connection status
 * - GET  /qr           → Get QR code as text (for initial pairing)
 * - POST /send         → Send a message { target, message }
 * - POST /send-batch   → Send multiple messages { messages: [{ target, message }] }
 * 
 * Port: 3002
 */

import { makeWASocket, useMultiFileAuthState, DisconnectReason, type BaileysEventMap } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'
import pino from 'pino'

// ─── Config ───────────────────────────────────────────────
const PORT = 3002
const AUTH_FOLDER = './auth_info_baileys'

// ─── State ────────────────────────────────────────────────
let sock: ReturnType<typeof makeWASocket> | null = null
let connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
let lastQR: string | null = null
let lastQRTime: number = 0

// ─── Logger ───────────────────────────────────────────────
const logger = pino({
  level: 'silent', // Set to 'info' for debugging, 'silent' for production
})

// ─── Message Queue ────────────────────────────────────────
// If disconnected, queue messages and send when reconnected
interface QueuedMessage {
  target: string
  message: string
  retries: number
  queuedAt: number
}
const messageQueue: QueuedMessage[] = []
const MAX_RETRIES = 3

async function processQueue() {
  if (connectionStatus !== 'connected' || !sock) return

  while (messageQueue.length > 0) {
    const msg = messageQueue.shift()!
    try {
      const jid = await resolveJid(msg.target)
      await sock.sendMessage(jid, { text: msg.message })
      console.log(`✅ Sent message to ${msg.target}`)
    } catch (err) {
      console.error(`❌ Failed to send to ${msg.target}:`, err)
      if (msg.retries < MAX_RETRIES) {
        messageQueue.push({ ...msg, retries: msg.retries + 1 })
      }
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
}

/**
 * Resolve a phone number to a WhatsApp JID.
 * Handles formats: 62812..., 0812..., +62812...
 */
async function resolveJid(phone: string): Promise<string> {
  // Clean the phone number
  let clean = phone.replace(/[^0-9]/g, '')

  // Convert 08xx to 628xx (Indonesian format)
  if (clean.startsWith('08')) {
    clean = '62' + clean.slice(1)
  }
  // Remove leading + if any
  if (clean.startsWith('62')) {
    // Already in international format
  } else if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1)
  }

  // Check if number is registered on WhatsApp
  const [result] = await sock!.onWhatsApp(clean + '@s.whatsapp.net')
  if (result?.exists) {
    return result.jid
  }

  // Try with @s.whatsapp.net suffix anyway
  return clean + '@s.whatsapp.net'
}

// ─── WhatsApp Connection ──────────────────────────────────
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We handle QR display ourselves
    logger,
    defaultQueryTimeoutMs: 60000,
    connectTimeoutMs: 60000,
    browser: ['GrosirPJ Bot', 'Chrome', '1.0.0'],
  })

  connectionStatus = 'connecting'

  sock.ev.on('connection.update', async (update: BaileysEventMap['connection.update']) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      lastQR = qr
      lastQRTime = Date.now()
      console.log('\n📱 Scan QR code ini dengan WhatsApp GrosirPJ:')
      console.log('─'.repeat(50))
      qrcode.generate(qr, { small: true })
      console.log('─'.repeat(50))
      console.log('⏰ QR code valid selama ~60 detik\n')
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      connectionStatus = 'disconnected'
      console.log('❌ Connection closed:', statusCode, shouldReconnect ? '(will reconnect)' : '(logged out)')

      if (shouldReconnect) {
        console.log('🔄 Reconnecting in 3 seconds...')
        setTimeout(() => connectToWhatsApp(), 3000)
      }
    } else if (connection === 'open') {
      connectionStatus = 'connected'
      lastQR = null
      console.log('✅ WhatsApp connected! Ready to send messages.\n')
      // Process any queued messages
      processQueue()
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

// ─── HTTP Server ──────────────────────────────────────────
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    // GET /status — Check connection status
    if (req.method === 'GET' && url.pathname === '/status') {
      return Response.json({
        status: connectionStatus,
        queued: messageQueue.length,
        timestamp: new Date().toISOString(),
      }, { headers: corsHeaders })
    }

    // GET /qr — Get QR code for pairing
    if (req.method === 'GET' && url.pathname === '/qr') {
      if (connectionStatus === 'connected') {
        return Response.json({
          status: 'connected',
          message: 'WhatsApp already connected. No QR needed.',
        }, { headers: corsHeaders })
      }

      if (!lastQR) {
        return Response.json({
          status: connectionStatus,
          message: 'QR code not yet generated. Wait a moment and try again.',
        }, { status: 503, headers: corsHeaders })
      }

      // QR expires after 60 seconds
      const qrAge = Date.now() - lastQRTime
      if (qrAge > 60000) {
        return Response.json({
          status: connectionStatus,
          message: 'QR code expired. Restart the service to generate a new one.',
        }, { status: 410, headers: corsHeaders })
      }

      return Response.json({
        status: connectionStatus,
        qr: lastQR,
        expiresIn: Math.max(0, 60 - Math.floor(qrAge / 1000)),
      }, { headers: corsHeaders })
    }

    // POST /send — Send a single message
    if (req.method === 'POST' && url.pathname === '/send') {
      const body = await req.json() as { target?: string; message?: string }

      if (!body.target || !body.message) {
        return Response.json({
          error: 'Missing required fields: target, message',
        }, { status: 400, headers: corsHeaders })
      }

      if (connectionStatus !== 'connected') {
        // Queue the message for later
        messageQueue.push({
          target: body.target,
          message: body.message,
          retries: 0,
          queuedAt: Date.now(),
        })
        return Response.json({
          queued: true,
          status: connectionStatus,
          message: 'WhatsApp not connected. Message queued for later delivery.',
          queueLength: messageQueue.length,
        }, { status: 202, headers: corsHeaders })
      }

      try {
        const jid = await resolveJid(body.target)
        await sock!.sendMessage(jid, { text: body.message })
        return Response.json({
          success: true,
          target: body.target,
        }, { headers: corsHeaders })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        // Queue for retry
        messageQueue.push({
          target: body.target,
          message: body.message,
          retries: 0,
          queuedAt: Date.now(),
        })
        return Response.json({
          success: false,
          error: errorMsg,
          queued: true,
        }, { status: 500, headers: corsHeaders })
      }
    }

    // POST /send-batch — Send multiple messages
    if (req.method === 'POST' && url.pathname === '/send-batch') {
      const body = await req.json() as { messages?: { target: string; message: string }[] }

      if (!body.messages || !Array.isArray(body.messages)) {
        return Response.json({
          error: 'Missing required field: messages (array)',
        }, { status: 400, headers: corsHeaders })
      }

      const results: { target: string; success: boolean; error?: string }[] = []

      for (const msg of body.messages) {
        if (connectionStatus === 'connected' && sock) {
          try {
            const jid = await resolveJid(msg.target)
            await sock.sendMessage(jid, { text: msg.message })
            results.push({ target: msg.target, success: true })
            await new Promise(r => setTimeout(r, 500)) // Rate limit
          } catch (err) {
            results.push({ target: msg.target, success: false, error: String(err) })
          }
        } else {
          messageQueue.push({ target: msg.target, message: msg.message, retries: 0, queuedAt: Date.now() })
          results.push({ target: msg.target, success: false, error: 'Queued (not connected)' })
        }
      }

      return Response.json({ results }, { headers: corsHeaders })
    }

    // 404 for unknown routes
    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[wa-bot] Request error:', errorMsg)
    return Response.json({ error: errorMsg }, { status: 500, headers: corsHeaders })
  }
}

// ─── Start ────────────────────────────────────────────────
console.log('🤖 GrosirPJ WhatsApp Bot starting...')
console.log(`📡 HTTP API on port ${PORT}`)

// Start HTTP server
Bun.serve({
  port: PORT,
  fetch: handleRequest,
})

console.log(`✅ HTTP server listening on port ${PORT}`)

// Connect to WhatsApp
connectToWhatsApp()
