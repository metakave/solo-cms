import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { summarizeMeetingNotes } from '@/lib/deepseek';

export async function POST(req: NextRequest) {
  try {
    const { meetingId, rawNotes, leadId } = await req.json();

    if (!rawNotes || rawNotes.trim() === '') {
      return NextResponse.json({ success: false, error: 'rawNotes is required' }, { status: 400 });
    }

    let leadName = '';
    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (lead) leadName = lead.name;
    }

    const aiResult = await summarizeMeetingNotes(rawNotes, leadName);

    // If meetingId was provided, update the meeting in the database
    if (meetingId) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          rawNotes,
          aiSummary: aiResult.summary,
          actionItems: JSON.stringify(aiResult.actionItems),
          status: 'COMPLETED',
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
                type: 'MEETING_HELD',
                content: `Meeting completed. AI extracted ${aiResult.actionItems.length} action items. Next follow-up: in ${aiResult.suggestedNextFollowUpDays} days.`,
              },
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true, aiResult });
  } catch (error: any) {
    console.error('Error in AI meeting summarizer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
