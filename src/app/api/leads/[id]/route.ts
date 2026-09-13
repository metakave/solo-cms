import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        meetings: {
          orderBy: { startTime: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const currentLead = await prisma.lead.findUnique({ where: { id } });
    if (!currentLead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    // Detect stage change to log activity
    const activitiesToCreate: any[] = [];
    if (body.stage && body.stage !== currentLead.stage) {
      activitiesToCreate.push({
        type: 'STAGE_CHANGED',
        content: `Stage transitioned from ${currentLead.stage} to ${body.stage}.`,
      });
    }

    if (body.notes && body.notes !== currentLead.notes) {
      activitiesToCreate.push({
        type: 'NOTE',
        content: `Lead notes updated.`,
      });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.poc !== undefined && { poc: body.poc }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.serviceType !== undefined && { serviceType: body.serviceType }),
        ...(body.stage !== undefined && { stage: body.stage }),
        ...(body.dealValue !== undefined && { dealValue: Number(body.dealValue) }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.probability !== undefined && { probability: Number(body.probability) }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.nextFollowUpDate !== undefined && {
          nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null,
        }),
        ...(body.nextFollowUpGoal !== undefined && { nextFollowUpGoal: body.nextFollowUpGoal }),
        ...(body.lastContactDate !== undefined && {
          lastContactDate: body.lastContactDate ? new Date(body.lastContactDate) : null,
        }),
        ...(activitiesToCreate.length > 0 && {
          activities: {
            create: activitiesToCreate,
          },
        }),
      },
      include: {
        milestones: true,
        meetings: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lead.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
