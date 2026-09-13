import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SoloCRM database...');

  // Clear existing data
  await prisma.activityLog.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.setting.deleteMany({});

  // Seed default settings
  await prisma.setting.createMany({
    data: [
      { key: 'HERMES_API_KEY', value: 'hermes-crm-secret-2026' },
      { key: 'DEEPSEEK_API_KEY', value: '' },
      { key: 'ZOHO_CALENDAR_ICAL_URL', value: '' },
    ],
  });

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const inTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const inTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  // 1. Lead: Apex Apparel (Odoo Consulting - Negotiation)
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Rahim Chowdhury',
      title: 'Managing Director & Operations Head',
      company: 'Apex Apparel & Textiles',
      email: 'rahim@apexapparel.example',
      phone: '+8801711001122',
      serviceType: 'ODOO_CONSULTING',
      stage: 'NEGOTIATION',
      dealValue: 14500,
      currency: 'BDT',
      probability: 85,
      priority: 'HIGH',
      aiScore: 94,
      aiPriorityReason:
        'Confirmed $14.5k budget, direct decision-maker engagement, migrating from Odoo 15 Community to 18 Enterprise. High likelihood of immediate sign-off.',
      aiDossier: `### Client Dossier: Apex Apparel
- **Business Profile**: 650-worker apparel export manufacturer based in Gazipur.
- **Pain Points**: Current Odoo 15 Community lacks real-time Barcode scanning on cutting floor; fabric wastage tracking is manual in Excel.
- **Scope**: Migration to Odoo 18 Enterprise, MRP II routing, Barcode app customization, Multi-warehouse batch tracking.
- **Recommended Strategy**: Offer 1 month post-launch hypercare support to secure deal closure this week.`,
      notes:
        'Client reviewed technical proposal. Discussing milestone schedule. Wants 40% upfront instead of 50%.',
      tags: 'Odoo 18, Manufacturing, Barcode, Migration',
      lastContactDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      nextFollowUpDate: tomorrow,
      nextFollowUpGoal: 'Finalize contract terms and send revised milestone schedule.',
    },
  });

  // Milestones for Lead 1
  await prisma.milestone.createMany({
    data: [
      {
        leadId: lead1.id,
        title: 'Project Kickoff & Advance Deposit (40%)',
        amount: 5800,
        currency: 'BDT',
        status: 'PAID',
        dueDate: now,
        paidDate: now,
        invoiceNumber: 'INV-2026-001',
      },
      {
        leadId: lead1.id,
        title: 'Custom Module Testing & MRP Workflow Sign-off (40%)',
        amount: 5800,
        currency: 'BDT',
        status: 'INVOICED',
        dueDate: inTenDays,
        invoiceNumber: 'INV-2026-004',
      },
      {
        leadId: lead1.id,
        title: 'Go-Live Deployment & Team Handover (20%)',
        amount: 2900,
        currency: 'BDT',
        status: 'PENDING',
        dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Meetings for Lead 1
  await prisma.meeting.create({
    data: {
      leadId: lead1.id,
      title: 'Contract Signing & Milestone Finalization',
      startTime: new Date(tomorrow.setHours(15, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
      locationType: 'ZOHO_MEETING',
      meetUrl: 'https://meet.zoho.com/odoo-apex-sync',
      status: 'SCHEDULED',
      rawNotes: 'Review payment schedule and data migration cutoff timeline.',
    },
  });

  // 2. Lead: FinEdge Capital (Odoo Consulting - Proposal Sent)
  const lead2 = await prisma.lead.create({
    data: {
      name: 'Sarah Jenkins',
      title: 'Chief Financial Officer',
      company: 'FinEdge Capital Partners',
      email: 's.jenkins@finedge.example',
      phone: '+442079460123',
      serviceType: 'ODOO_CONSULTING',
      stage: 'PROPOSAL_SENT',
      dealValue: 9200,
      currency: 'BDT',
      probability: 70,
      priority: 'HIGH',
      aiScore: 88,
      aiPriorityReason:
        'CFO initiated inquiry. Needs Odoo Accounting localization with multi-currency consolidation across UK and Singapore entities.',
      aiDossier: `### Client Dossier: FinEdge Capital
- **Need**: UK & SG Accounting localization, automated bank feeds reconciliation, custom management dashboard.
- **Budget**: Estimated $8,000 - $11,000.
- **Urgency**: Current QuickBooks license expires next month.`,
      notes: 'Detailed scope doc sent. Follow up on proposal acceptance.',
      tags: 'Accounting, Multi-Currency, Localization',
      lastContactDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      nextFollowUpDate: inTwoDays,
      nextFollowUpGoal: 'Check with Sarah on board approval for proposal.',
    },
  });

  await prisma.milestone.create({
    data: {
      leadId: lead2.id,
      title: 'Initial Retainer & Environment Setup (50%)',
      amount: 4600,
      currency: 'BDT',
      status: 'PENDING',
      dueDate: inFiveDays,
    },
  });

  // 3. Lead: TechPulse Engineering (Training Batch - Won & Active)
  const lead3 = await prisma.lead.create({
    data: {
      name: 'Tanvir Ahmed',
      title: 'VP of Engineering',
      company: 'TechPulse Solutions Ltd',
      email: 'tanvir@techpulse.example',
      phone: '+8801819223344',
      serviceType: 'TRAINING',
      stage: 'WON_ACTIVE',
      dealValue: 4800,
      currency: 'BDT',
      probability: 100,
      priority: 'HIGH',
      aiScore: 96,
      aiPriorityReason:
        'Corporate training for 15 software developers on Odoo 18 Backend & OWL 2.0 Web Framework. Contract signed, batch active.',
      aiDossier: `### Training Plan: TechPulse Developers
- **Audience**: 15 Python / JavaScript engineers transitioning to Odoo core development.
- **Duration**: 2-weekend bootcamp (30 contact hours).
- **Deliverables**: Hands-on lab repo, OWL component architecture guide, exam certification.`,
      notes: 'Weekend 1 completed successfully. Preparing Weekend 2 OWL component labs.',
      tags: 'Corporate Training, OWL 2.0, Odoo 18 Backend',
      lastContactDate: now,
      nextFollowUpDate: inFiveDays,
      nextFollowUpGoal: 'Distribute lab materials for OWL 2.0 deep dive.',
    },
  });

  await prisma.milestone.createMany({
    data: [
      {
        leadId: lead3.id,
        title: 'Corporate Booking Advance (50%)',
        amount: 2400,
        currency: 'BDT',
        status: 'PAID',
        dueDate: now,
        paidDate: now,
        invoiceNumber: 'INV-2026-002',
      },
      {
        leadId: lead3.id,
        title: 'Batch Completion & Certification Delivery (50%)',
        amount: 2400,
        currency: 'BDT',
        status: 'PENDING',
        dueDate: inTenDays,
      },
    ],
  });

  // 4. Lead: CloudScale Advisory (Advisory Retainer - Won & Active)
  const lead4 = await prisma.lead.create({
    data: {
      name: 'Michael Chang',
      title: 'Founder & CEO',
      company: 'OmniTrade Global Logistics',
      email: 'm.chang@omnitrade.example',
      phone: '+6581234567',
      serviceType: 'ADVISORY',
      stage: 'WON_ACTIVE',
      dealValue: 3000,
      currency: 'BDT',
      probability: 100,
      priority: 'HIGH',
      aiScore: 92,
      aiPriorityReason:
        'Monthly recurring fractional Odoo Architect advisory retainer ($3,000/mo). High client retention and steady cashflow.',
      aiDossier: `### Retainer Overview: OmniTrade
- **Contract**: 6-month advisory retainer ($3,000/mo).
- **Scope**: Weekly architectural code review, Postgres index optimization, API rate-limiting review.`,
      notes: 'Monthly billing cycle on 1st of each month. Current month invoice cleared.',
      tags: 'Retainer, Architecture, Performance Audit',
      lastContactDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      nextFollowUpDate: inTwoDays,
      nextFollowUpGoal: 'Conduct bi-weekly server load review call.',
    },
  });

  await prisma.milestone.create({
    data: {
      leadId: lead4.id,
      title: 'March 2026 Retainer Invoice',
      amount: 3000,
      currency: 'BDT',
      status: 'PAID',
      paidDate: now,
      invoiceNumber: 'INV-2026-003',
    },
  });

  // 5. Lead: Nordic Woodcraft (Odoo Consulting - Discovery Call)
  const lead5 = await prisma.lead.create({
    data: {
      name: 'Lars Lindqvist',
      title: 'Supply Chain Manager',
      company: 'Nordic Woodcraft AB',
      email: 'lars@nordicwoodcraft.example',
      phone: '+46701234567',
      serviceType: 'ODOO_CONSULTING',
      stage: 'DISCOVERY_CALL',
      dealValue: 6500,
      currency: 'BDT',
      probability: 45,
      priority: 'MEDIUM',
      aiScore: 72,
      aiPriorityReason:
        'Evaluating Odoo vs Microsoft Business Central. Need clear demo on multi-tier BOM and wood inventory dimensions.',
      notes: 'Initial intro call scheduled. Prepare demo of Odoo 18 attribute variants.',
      tags: 'Supply Chain, Manufacturing, Demo',
      lastContactDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      nextFollowUpDate: tomorrow,
      nextFollowUpGoal: 'Host discovery demo call and gather functional specification.',
    },
  });

  await prisma.meeting.create({
    data: {
      leadId: lead5.id,
      title: 'Odoo 18 Manufacturing & Variants Discovery Demo',
      startTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(12, 0, 0, 0)),
      locationType: 'GOOGLE_MEET',
      meetUrl: 'https://meet.google.com/xyz-demo-odoo',
      status: 'SCHEDULED',
      rawNotes: 'Show dimension tracking, scrap management, and product configurator.',
    },
  });

  // 6. Lead: Masterclass Batch (Training - New Inquiry)
  const lead6 = await prisma.lead.create({
    data: {
      name: 'Farhan Kabir',
      title: 'Lead Software Engineer',
      company: 'Freelance & Agency Guild',
      email: 'farhan.k@gmail.example',
      phone: '+8801911445566',
      serviceType: 'TRAINING',
      stage: 'NEW_INQUIRY',
      dealValue: 1800,
      currency: 'BDT',
      probability: 30,
      priority: 'MEDIUM',
      aiScore: 65,
      aiPriorityReason:
        'Group of 6 freelance developers interested in custom Odoo module development masterclass. Need syllabus and schedule.',
      notes: 'Inquired via WhatsApp. Sent course outline brochure.',
      tags: 'Masterclass, Developer Training, OWL',
      lastContactDate: now,
      nextFollowUpDate: inTwoDays,
      nextFollowUpGoal: 'Confirm batch start date and collect registration deposits.',
    },
  });

  // Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        leadId: lead1.id,
        type: 'STAGE_CHANGED',
        content: 'Lead advanced from PROPOSAL_SENT to NEGOTIATION.',
      },
      {
        leadId: lead1.id,
        type: 'WHATSAPP_SENT',
        content: 'Sent revised milestone draft via WhatsApp to Rahim Chowdhury.',
      },
      {
        leadId: lead3.id,
        type: 'AI_SCORED',
        content: 'DeepSeek rated lead priority: HIGH (Score: 96/100).',
      },
      {
        leadId: lead4.id,
        type: 'HERMES_SYNC',
        content: 'Hermes Agent synchronized server health audit summary into lead record.',
      },
    ],
  });

  console.log('✅ SoloCRM database successfully seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
