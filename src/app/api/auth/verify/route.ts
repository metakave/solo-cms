import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('solocrm_auth_token')?.value;
  const isAuthenticated = verifyAuthToken(token);

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
