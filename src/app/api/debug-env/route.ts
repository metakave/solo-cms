import { NextResponse } from 'next/server';

export async function GET() {
  const keys = Object.keys(process.env).filter(
    (k) =>
      k.includes('POSTGRES') ||
      k.includes('DATABASE') ||
      k.includes('NEON') ||
      k.includes('STORAGE') ||
      k.includes('PRISMA') ||
      k.includes('HERMES') ||
      k.includes('DEEPSEEK') ||
      k.includes('VERCEL')
  );

  return NextResponse.json({
    keys,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0),
    hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_PRISMA_URL.length > 0),
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL && process.env.POSTGRES_URL.length > 0),
  });
}
