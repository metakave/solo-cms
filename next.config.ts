import type { NextConfig } from "next";

// Ensure DATABASE_URL is mapped from Vercel Postgres variables if needed
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_DATABASE_URL ||
    "";
}

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      "",
  },
};

export default nextConfig;
