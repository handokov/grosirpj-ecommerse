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
 * IMPORTANT: The adapter export name is case-sensitive!
 * @prisma/adapter-libsql v7 exports `PrismaLibSql` (lowercase 'ql'), NOT `PrismaLibSQL`.
 */
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const libsqlModule = require('@prisma/adapter-libsql')

      // Try both export names for compatibility (v7 uses PrismaLibSql)
      const PrismaLibSql = libsqlModule.PrismaLibSql || libsqlModule.PrismaLibSQL

      if (!PrismaLibSql) {
        console.error('[db] ERROR: PrismaLibSql not found in @prisma/adapter-libsql. Available exports:', Object.keys(libsqlModule))
        // Fall through to local SQLite
      } else {
        const adapter = new PrismaLibSql({
          url: tursoUrl,
          authToken: tursoToken,
        })

        return new PrismaClient({ adapter })
      }
    } catch (err) {
      console.error('[db] ERROR: Failed to create Turso adapter:', err)
      // Fall through to local SQLite
    }
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
    const value = (client as unknown as Record<string, unknown>)[prop as string]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
