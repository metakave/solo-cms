import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { leadId, title, amount, dueDate, invoiceNumber, status = 'PENDING' } = await req.json();

    if (!leadId || !title || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'leadId, title, and amount are required' },
        { status: 400 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        leadId,
        title,
        amount: Number(amount),
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        invoiceNumber: invoiceNumber || null,
        paidDate: status === 'PAID' ? new Date() : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        leadId,
        type: 'NOTE',
        content: `Milestone created: "${title}" (৳${Number(amount).toLocaleString()}) - Status: ${status}`,
      },
    });

    return NextResponse.json({ success: true, milestone }, { status: 201 });
  } catch (error: any) {
    console.error('Milestone creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { milestoneId, status, invoiceNumber, dueDate } = await req.json();

    if (!milestoneId) {
      return NextResponse.json({ success: false, error: 'milestoneId is required' }, { status: 400 });
    }

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(status !== undefined && {
          status,
          paidDate: status === 'PAID' ? new Date() : null,
        }),
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    await prisma.activityLog.create({
      data: {
        leadId: milestone.leadId,
        type: 'NOTE',
        content: `Milestone "${milestone.title}" updated to status: ${milestone.status}.`,
      },
    });

    return NextResponse.json({ success: true, milestone });
  } catch (error: any) {
    console.error('Milestone update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
