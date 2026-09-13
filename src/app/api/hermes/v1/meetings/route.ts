import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyHermesAuth } from '@/lib/hermes-auth';
import { summarizeMeetingNotes } from '@/lib/deepseek';

export async function POST(req: NextRequest) {
  const isAuthorized = await verifyHermesAuth(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide valid X-Hermes-Key header or Bearer token.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { leadId, title = 'Meeting Logged by Hermes Agent', rawNotes } = body;

    if (!rawNotes) {
      return NextResponse.json({ error: 'rawNotes is required' }, { status: 400 });
    }

    let leadName = '';
    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (lead) leadName = lead.name;
    }

    // AI summarize notes
    const aiResult = await summarizeMeetingNotes(rawNotes, leadName);

    const meeting = await prisma.meeting.create({
      data: {
        title,
        leadId: leadId || null,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60 * 1000),
        locationType: 'WHATSAPP_CALL',
        status: 'COMPLETED',
        rawNotes,
        aiSummary: aiResult.summary,
        actionItems: JSON.stringify(aiResult.actionItems),
      },
    });

    if (leadId) {
      const nextFollowUp = new Date();
      nextFollowUp.setDate(nextFollowUp.getDate() + aiResult.suggestedNextFollowUpDays);

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          lastContactDate: new Date(),
          nextFollowUpDate: nextFollowUp,
          nextFollowUpGoal: aiResult.followUpAgenda,
          activities: {
            create: {
              type: 'HERMES_SYNC',
              content: `Hermes Agent logged meeting notes. AI extracted ${aiResult.actionItems.length} action items.`,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      aiSummary: aiResult.summary,
      actionItems: aiResult.actionItems,
      suggestedNextFollowUpDays: aiResult.suggestedNextFollowUpDays,
    });
  } catch (error: any) {
    console.error('Hermes meeting logging error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
