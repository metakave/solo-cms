import { NextRequest, NextResponse } from 'next/server';
import { verifyPasscode, generateAuthToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passcode } = body;

    if (!passcode || !verifyPasscode(String(passcode))) {
      return NextResponse.json(
        { success: false, error: 'Invalid passcode. Please try again.' },
        { status: 401 }
      );
    }

    const token = generateAuthToken();
    const response = NextResponse.json({ success: true, message: 'Authentication successful' });

    // Set secure HTTP-only cookie for 30 days
    response.cookies.set('solocrm_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
