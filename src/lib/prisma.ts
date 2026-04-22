import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  // mariadb driver requires mariadb:// scheme — rewrite mysql:// if needed
  const rawUrl = process.env.DATABASE_URL!
  const normalizedUrl = rawUrl.replace(/^mysql:\/\//, 'mariadb://')
  const pool = mariadb.createPool(normalizedUrl)
  const adapter = new PrismaMariaDb(pool)
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
