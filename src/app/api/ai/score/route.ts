import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreLeadWithAI } from '@/lib/deepseek';

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId is required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const insight = await scoreLeadWithAI({
      name: lead.name,
      company: lead.company,
      serviceType: lead.serviceType,
      dealValue: lead.dealValue,
      stage: lead.stage,
      notes: lead.notes,
      tags: lead.tags,
    });

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        aiScore: insight.score,
        priority: insight.priority,
        aiPriorityReason: insight.reasoning,
        aiDossier: insight.dossierMarkdown,
        nextFollowUpGoal: insight.suggestedAction,
        activities: {
          create: {
            type: 'AI_SCORED',
            content: `DeepSeek AI recalculated priority: ${insight.priority} (${insight.score}/100).`,
          },
        },
      },
    });

    return NextResponse.json({ success: true, insight, lead: updatedLead });
  } catch (error: any) {
    console.error('Error running AI scoring:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
