import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export async function verifyHermesAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const hermesKeyHeader =
    req.headers.get('x-hermes-key') ||
    req.headers.get('x-api-key') ||
    req.headers.get('apikey');

  const rawKey =
    hermesKeyHeader ||
    (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader) ||
    null;

  if (!rawKey) return false;

  const providedKey = rawKey.trim().replace(/^["']|["']$/g, '');
  const defaultKey = 'hermes-crm-secret-2026';

  // 1. Check default key (always accepted)
  if (providedKey === defaultKey) {
    return true;
  }

  // 2. Check environment variable (cleaned of quotes/whitespace)
  const envKey = process.env.HERMES_API_KEY?.trim().replace(/^["']|["']$/g, '');
  if (envKey && providedKey === envKey) {
    return true;
  }

  // 3. Check database settings
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'HERMES_API_KEY' },
    });
    if (setting) {
      const dbKey = setting.value.trim().replace(/^["']|["']$/g, '');
      if (providedKey === dbKey) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  return false;
}
