import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/date';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    const where: any = {};
    if (leadId) where.leadId = leadId;

    const meetings = await prisma.meeting.findMany({
      where,
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

    return NextResponse.json({ success: true, meetings });
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      leadId,
      startTime,
      endTime,
      locationType = 'ZOHO_MEETING',
      meetUrl,
      rawNotes,
    } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Title, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        leadId: leadId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        locationType,
        meetUrl: meetUrl || null,
        rawNotes: rawNotes || null,
      },
      include: {
        lead: true,
      },
    });

    if (leadId) {
      await prisma.activityLog.create({
        data: {
          leadId,
          type: 'NOTE',
          content: `Meeting scheduled: "${title}" on ${formatDateTime(startTime)}`,
        },
      });
    }

    return NextResponse.json({ success: true, meeting }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
