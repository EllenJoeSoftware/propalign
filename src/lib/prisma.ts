import { PrismaClient } from '@prisma/client'
import { PrismaMysql } from '@prisma/adapter-mysql2'
import mysql from 'mysql2'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const pool = mysql.createPool(process.env.DATABASE_URL!)
  const adapter = new PrismaMysql(pool)
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
