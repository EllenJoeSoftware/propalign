import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function buildClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // Normalize the scheme so the mariadb client recognizes it.
  const normalizedUrl = rawUrl.replace(/^mysql:\/\//, 'mariadb://');

  // PrismaMariaDb is a factory that takes a mariadb PoolConfig or a
  // connection string. The string form decodes the password correctly even
  // when it contains URL-encoded reserved characters like "%40".
  const adapter = new PrismaMariaDb(normalizedUrl);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });
}

const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
