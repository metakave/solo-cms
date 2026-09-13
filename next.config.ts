import type { NextConfig } from "next";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.SOLOCRM_PRISMA_DATABASE_URL ||
    process.env.SOLOCRM_DATABASE_URL ||
    process.env.SOLOCRM_POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    "";
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
