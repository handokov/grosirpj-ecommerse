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
 * It's a Factory class with a .connect() method that returns the actual adapter.
 * PrismaClient v6 calls adapter.connect() internally when provided.
 */
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql')

    // PrismaLibSql is a Factory — PrismaClient calls .connect() internally
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoToken,
    })

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
