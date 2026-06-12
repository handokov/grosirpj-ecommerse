import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create a Prisma client based on environment.
 * - If TURSO_DATABASE_URL + TURSO_AUTH_TOKEN are set → use Turso (production)
 * - Otherwise → use local SQLite (development)
 *
 * Uses require() for dynamic imports to prevent bundling issues
 * and ensures the adapter is only loaded when actually needed.
 */
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    // Use require() for dynamic loading — only loaded at runtime when Turso is configured
    // This prevents the adapter from being bundled into client code
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }

  // Local SQLite for development
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

/**
 * Lazy-initialized Prisma client singleton.
 * Uses globalThis to survive hot reloads in development.
 */
export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// For convenience — lazy getter that initializes on first access
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb()
    const value = (client as Record<string, unknown>)[prop as string]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
