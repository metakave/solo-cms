import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};

    for (const s of settings) {
      // Obfuscate secret keys for safety
      if (s.key === 'DEEPSEEK_API_KEY') {
        settingsMap[s.key] = s.value ? `${s.value.substring(0, 4)}...${s.value.substring(s.value.length - 4)}` : '';
        settingsMap['DEEPSEEK_CONFIGURED'] = Boolean(s.value && s.value.length > 5) ? 'true' : 'false';
      } else {
        settingsMap[s.key] = s.value;
      }
    }

    if (process.env.DEEPSEEK_API_KEY) {
      settingsMap['DEEPSEEK_CONFIGURED'] = 'true';
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { DEEPSEEK_API_KEY, HERMES_API_KEY, ZOHO_CALENDAR_ICAL_URL } = body;

    if (DEEPSEEK_API_KEY !== undefined && DEEPSEEK_API_KEY !== '') {
      await prisma.setting.upsert({
        where: { key: 'DEEPSEEK_API_KEY' },
        update: { value: DEEPSEEK_API_KEY.trim() },
        create: { key: 'DEEPSEEK_API_KEY', value: DEEPSEEK_API_KEY.trim() },
      });
    }

    if (HERMES_API_KEY !== undefined && HERMES_API_KEY !== '') {
      await prisma.setting.upsert({
        where: { key: 'HERMES_API_KEY' },
        update: { value: HERMES_API_KEY.trim() },
        create: { key: 'HERMES_API_KEY', value: HERMES_API_KEY.trim() },
      });
    }

    if (ZOHO_CALENDAR_ICAL_URL !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'ZOHO_CALENDAR_ICAL_URL' },
        update: { value: ZOHO_CALENDAR_ICAL_URL.trim() },
        create: { key: 'ZOHO_CALENDAR_ICAL_URL', value: ZOHO_CALENDAR_ICAL_URL.trim() },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Settings save error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
