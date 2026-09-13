import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { draftFollowUpMessage } from '@/lib/deepseek';
import { generateWhatsAppLink, getDefaultFollowUpTemplate } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const { leadId, customGoal, tone = 'FRIENDLY_PROFESSIONAL' } = await req.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const goal = customGoal || lead.nextFollowUpGoal || 'Check on project milestones and next steps';

    // Generate message using DeepSeek AI or fallback
    const message = await draftFollowUpMessage(
      {
        name: lead.name,
        company: lead.company,
        serviceType: lead.serviceType,
        dealValue: lead.dealValue,
        stage: lead.stage,
        notes: lead.notes,
        tags: lead.tags,
      },
      goal,
      tone
    );

    const waLink = lead.phone ? generateWhatsAppLink(lead.phone, message) : null;
    const defaultTemplate = getDefaultFollowUpTemplate(lead.name, lead.serviceType);

    return NextResponse.json({
      success: true,
      message,
      waLink,
      phone: lead.phone,
      defaultTemplate,
    });
  } catch (error: any) {
    console.error('Error generating follow-up draft:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
