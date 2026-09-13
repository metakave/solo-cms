import { PrismaClient } from '@prisma/client';

const getDatabaseUrl = (): string | undefined => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_DATABASE_URL ||
    undefined
  );
};

const dbUrl = getDatabaseUrl();
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
