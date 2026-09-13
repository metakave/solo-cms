import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        milestones: true,
      },
    });

    let totalPipelineValue = 0;
    let expectedWeightedRevenue = 0;
    let totalCollected = 0;
    let totalInvoicedPending = 0;

    const serviceBreakdown = {
      ODOO_CONSULTING: { count: 0, totalValue: 0, collected: 0 },
      TRAINING: { count: 0, totalValue: 0, collected: 0 },
      ADVISORY: { count: 0, totalValue: 0, collected: 0 },
    };

    const stageBreakdown: Record<string, number> = {
      NEW_INQUIRY: 0,
      DISCOVERY_CALL: 0,
      PROPOSAL_SENT: 0,
      NEGOTIATION: 0,
      WON_ACTIVE: 0,
      COMPLETED: 0,
      LOST: 0,
    };

    for (const lead of leads) {
      if (lead.stage !== 'LOST') {
        totalPipelineValue += lead.dealValue;
        expectedWeightedRevenue += (lead.dealValue * (lead.probability || 30)) / 100;
      }

      if (stageBreakdown[lead.stage] !== undefined) {
        stageBreakdown[lead.stage] += 1;
      }

      const svcKey = lead.serviceType as keyof typeof serviceBreakdown;
      if (serviceBreakdown[svcKey]) {
        serviceBreakdown[svcKey].count += 1;
        serviceBreakdown[svcKey].totalValue += lead.dealValue;
      }

      for (const m of lead.milestones) {
        if (m.status === 'PAID') {
          totalCollected += m.amount;
          if (serviceBreakdown[svcKey]) {
            serviceBreakdown[svcKey].collected += m.amount;
          }
        } else if (m.status === 'INVOICED') {
          totalInvoicedPending += m.amount;
        }
      }
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalPipelineValue,
        expectedWeightedRevenue: Math.round(expectedWeightedRevenue),
        totalCollected,
        totalInvoicedPending,
        activeDealsCount: leads.filter((l) => !['COMPLETED', 'LOST'].includes(l.stage)).length,
        serviceBreakdown,
        stageBreakdown,
      },
    });
  } catch (error: any) {
    console.error('Revenue stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
