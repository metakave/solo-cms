import { PrismaClient } from '@prisma/client';

// Map Vercel-prefixed Postgres variables (e.g. SOLOCRM_PRISMA_DATABASE_URL, SOLOCRM_DATABASE_URL)
const dbUrl =
  process.env.SOLOCRM_PRISMA_DATABASE_URL ||
  process.env.SOLOCRM_DATABASE_URL ||
  process.env.SOLOCRM_POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  undefined;

if (dbUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
