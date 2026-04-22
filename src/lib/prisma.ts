import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  mariaPool: mariadb.Pool
}

function getPool(): mariadb.Pool {
  if (globalForPrisma.mariaPool) return globalForPrisma.mariaPool

  const rawUrl = process.env.DATABASE_URL!
  const normalizedUrl = rawUrl.replace(/^mysql:\/\//, 'mariadb://')

  const pool = mariadb.createPool({
    uri: normalizedUrl,
    connectionLimit: 5,       // keep small for serverless
    acquireTimeout: 10000,
    connectTimeout: 10000,
    idleTimeout: 30000,
    resetAfterUse: false,
  })

  globalForPrisma.mariaPool = pool
  return pool
}

function createPrismaClient(): PrismaClient {
  const pool = getPool()
  const adapter = new PrismaMariaDb(pool)
  return new PrismaClient({ adapter })
}

// Reuse across hot-reloads in dev and across invocations in prod
const prisma = globalForPrisma.prisma ?? createPrismaClient()
globalForPrisma.prisma = prisma

export default prisma
