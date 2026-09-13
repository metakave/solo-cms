import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyHermesAuth } from '@/lib/hermes-auth';
import { scoreLeadWithAI } from '@/lib/deepseek';

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyHermesAuth(req);
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Please provide valid X-Hermes-Key header or Bearer token.' },
      { status: 401 }
    );
  }

  try {
    const leads = await prisma.lead.findMany({
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        serviceType: true,
        stage: true,
        dealValue: true,
        currency: true,
        priority: true,
        aiScore: true,
        aiPriorityReason: true,
        nextFollowUpDate: true,
        nextFollowUpGoal: true,
        updatedAt: true,
      },
      orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error('Hermes leads fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const {
      name,
      company,
      email,
      phone,
      serviceType = 'ODOO_CONSULTING',
      stage = 'NEW_INQUIRY',
      dealValue = 0,
      currency = 'BDT',
      notes,
      tags,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Field "name" is required' }, { status: 400 });
    }

    // Auto-score lead with DeepSeek
    const aiInsight = await scoreLeadWithAI({
      name,
      company,
      serviceType,
      dealValue: Number(dealValue) || 0,
      stage,
      notes,
      tags,
    });

    const lead = await prisma.lead.create({
      data: {
        name,
        company,
        email,
        phone,
        serviceType,
        stage,
        dealValue: Number(dealValue) || 0,
        currency,
        notes,
        tags: tags || 'Ingested by Hermes Agent',
        priority: aiInsight.priority,
        aiScore: aiInsight.score,
        aiPriorityReason: aiInsight.reasoning,
        aiDossier: aiInsight.dossierMarkdown,
        nextFollowUpGoal: aiInsight.suggestedAction,
        activities: {
          create: {
            type: 'HERMES_SYNC',
            content: `Lead created via Hermes Agent integration. AI score: ${aiInsight.score}/100.`,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Lead successfully created by Hermes Agent',
        leadId: lead.id,
        lead,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Hermes lead creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
