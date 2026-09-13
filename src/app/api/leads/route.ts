import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreLeadWithAI } from '@/lib/deepseek';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get('serviceType');
    const stage = searchParams.get('stage');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const where: any = {};
    if (serviceType && serviceType !== 'ALL') {
      where.serviceType = serviceType;
    }
    if (stage && stage !== 'ALL') {
      where.stage = stage;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        milestones: true,
        meetings: {
          orderBy: { startTime: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      poc,
      title,
      company,
      email,
      phone,
      serviceType = 'ODOO_CONSULTING',
      stage = 'NEW_INQUIRY',
      dealValue = 0,
      currency = 'BDT',
      notes,
      tags,
      nextFollowUpDate,
      nextFollowUpGoal,
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // Run AI scoring & dossier generation immediately
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
        poc,
        title,
        company,
        email,
        phone,
        serviceType,
        stage,
        dealValue: Number(dealValue) || 0,
        currency,
        notes,
        tags,
        priority: aiInsight.priority,
        aiScore: aiInsight.score,
        aiPriorityReason: aiInsight.reasoning,
        aiDossier: aiInsight.dossierMarkdown,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
        nextFollowUpGoal: nextFollowUpGoal || aiInsight.suggestedAction,
        activities: {
          create: {
            type: 'NOTE',
            content: `Lead created. AI scored priority as ${aiInsight.priority} (${aiInsight.score}/100).`,
          },
        },
      },
      include: {
        milestones: true,
        meetings: true,
        activities: true,
      },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
