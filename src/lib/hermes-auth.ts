import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export async function verifyHermesAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const hermesKeyHeader = req.headers.get('x-hermes-key');

  const providedKey =
    hermesKeyHeader ||
    (authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null);

  if (!providedKey) return false;

  // Check env first
  if (process.env.HERMES_API_KEY && providedKey === process.env.HERMES_API_KEY) {
    return true;
  }

  // Check database settings
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'HERMES_API_KEY' },
    });
    return setting ? setting.value === providedKey : false;
  } catch {
    return false;
  }
}
