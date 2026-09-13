import { NextResponse } from 'next/server';

export async function GET() {
  const tools = [
    {
      type: 'function',
      function: {
        name: 'solocrm_create_lead',
        description:
          'Create a new prospective lead in SoloCRM with automatic DeepSeek AI scoring and priority determination.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Contact person full name' },
            company: { type: 'string', description: 'Company or business name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone or WhatsApp number with country code' },
            serviceType: {
              type: 'string',
              enum: ['ODOO_CONSULTING', 'TRAINING', 'ADVISORY'],
              description: 'The type of service stream',
            },
            dealValue: { type: 'number', description: 'Estimated total deal value in BDT (৳)' },
            notes: { type: 'string', description: 'Initial inquiry details or scope notes' },
          },
          required: ['name'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'solocrm_get_priority_leads',
        description:
          'Fetch active high-priority leads, upcoming follow-up goals, and deal statuses from SoloCRM.',
        parameters: {
          type: 'object',
          properties: {
            serviceType: {
              type: 'string',
              enum: ['ALL', 'ODOO_CONSULTING', 'TRAINING', 'ADVISORY'],
            },
            priority: {
              type: 'string',
              enum: ['ALL', 'HIGH', 'MEDIUM', 'LOW'],
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'solocrm_log_meeting_notes',
        description:
          'Log call transcript or rough meeting notes into SoloCRM. Automatically triggers DeepSeek to extract executive summary and concrete action items.',
        parameters: {
          type: 'object',
          properties: {
            leadId: { type: 'string', description: 'ID of the lead in SoloCRM' },
            title: { type: 'string', description: 'Title of the call or sync' },
            rawNotes: { type: 'string', description: 'Full transcript or rough meeting notes' },
          },
          required: ['rawNotes'],
        },
      },
    },
  ];

  return NextResponse.json({
    version: '1.0.0',
    description: 'SoloCRM Hermes Agent Tool Manifest (OpenAI / Hermes Function Calling compatible)',
    instructions:
      'Pass header "x-hermes-key: <HERMES_API_KEY>" with requests to https://<your-domain>/api/hermes/v1/...',
    tools,
  });
}
