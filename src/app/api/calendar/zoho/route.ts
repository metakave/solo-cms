import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchZohoCalendarEvents } from '@/lib/ical-parser';

export async function GET() {
  try {
    // 1. Check if Zoho Calendar iCal URL is set
    let icalUrl = process.env.ZOHO_CALENDAR_ICAL_URL;
    if (!icalUrl) {
      const setting = await prisma.setting.findUnique({
        where: { key: 'ZOHO_CALENDAR_ICAL_URL' },
      });
      icalUrl = setting?.value;
    }

    // 2. Fetch external Zoho events if URL configured
    const zohoEvents = icalUrl ? await fetchZohoCalendarEvents(icalUrl) : [];

    // 3. Fetch local CRM scheduled meetings
    const localMeetings = await prisma.meeting.findMany({
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            phone: true,
            serviceType: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const formattedLocal = localMeetings.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.rawNotes || '',
      startTime: m.startTime,
      endTime: m.endTime,
      location: m.locationType,
      meetUrl: m.meetUrl,
      source: 'LOCAL' as const,
      lead: m.lead,
      status: m.status,
    }));

    // Merge and sort
    const allEvents = [...formattedLocal, ...zohoEvents].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return NextResponse.json({
      success: true,
      hasZohoSync: Boolean(icalUrl && icalUrl.trim() !== ''),
      events: allEvents,
      zohoCount: zohoEvents.length,
      crmCount: formattedLocal.length,
    });
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { icalUrl } = await req.json();

    if (icalUrl === undefined) {
      return NextResponse.json({ success: false, error: 'icalUrl is required' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'ZOHO_CALENDAR_ICAL_URL' },
      update: { value: icalUrl.trim() },
      create: { key: 'ZOHO_CALENDAR_ICAL_URL', value: icalUrl.trim() },
    });

    return NextResponse.json({
      success: true,
      message: 'Zoho Calendar iCal subscription updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating Zoho calendar settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
