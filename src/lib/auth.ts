import crypto from 'crypto';

export const CRM_PASSCODE = process.env.CRM_PASSCODE || '163216';
const AUTH_SECRET = process.env.CRM_AUTH_SECRET || 'solocrm-security-secret-key-2026';

export function verifyPasscode(inputPasscode: string): boolean {
  if (!inputPasscode) return false;
  return inputPasscode.trim() === CRM_PASSCODE.trim();
}

export function generateAuthToken(): string {
  const hash = crypto.createHmac('sha256', AUTH_SECRET).update(CRM_PASSCODE).digest('hex');
  return `solocrm_session_${hash}`;
}

export function verifyAuthToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = generateAuthToken();
  return token === expected;
}
