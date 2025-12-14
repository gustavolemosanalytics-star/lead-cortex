import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Parse the DATABASE_URL for connection options
function parseConnectionString(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
  }
}

const connectionOptions = parseConnectionString(process.env.DATABASE_URL || '')

const adapter = new PrismaMariaDb({
  host: connectionOptions.host,
  port: connectionOptions.port,
  user: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  connectionLimit: 5,
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
