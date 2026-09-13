import { prisma } from './prisma';

interface LeadContext {
  name: string;
  company?: string | null;
  serviceType: string;
  dealValue: number;
  stage: string;
  notes?: string | null;
  tags?: string | null;
}

export async function getDeepSeekApiKey(): Promise<string | null> {
  if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim() !== '') {
    return process.env.DEEPSEEK_API_KEY.trim();
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'DEEPSEEK_API_KEY' },
    });
    return setting?.value?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * AI Lead Scoring and Priority Assessment
 */
export async function scoreLeadWithAI(lead: LeadContext): Promise<{
  score: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  suggestedAction: string;
  dossierMarkdown: string;
}> {
  const apiKey = await getDeepSeekApiKey();

  if (apiKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an executive CRM strategist for an elite Odoo Consultant, Trainer, and Solo Entrepreneur.
Evaluate the lead and output strict JSON with fields:
- "score": number from 0 to 100
- "priority": "HIGH" | "MEDIUM" | "LOW"
- "reasoning": 2-3 concise sentences explaining urgency, budget fit, and conversion probability
- "suggestedAction": next immediate tactical step to advance this lead
- "dossierMarkdown": structured markdown briefing covering Profile, Technical Needs, and Closing Strategy`,
            },
            {
              role: 'user',
              content: `Evaluate this lead:
Name: ${lead.name}
Company: ${lead.company || 'N/A'}
Service: ${lead.serviceType}
Deal Value: ৳${lead.dealValue} BDT
Stage: ${lead.stage}
Notes: ${lead.notes || 'None'}
Tags: ${lead.tags || 'None'}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return {
          score: Math.min(100, Math.max(0, Number(parsed.score) || 75)),
          priority: ['HIGH', 'MEDIUM', 'LOW'].includes(parsed.priority) ? parsed.priority : 'MEDIUM',
          reasoning: parsed.reasoning || 'Evaluated based on deal value and engagement level.',
          suggestedAction: parsed.suggestedAction || 'Schedule a follow-up call.',
          dossierMarkdown: parsed.dossierMarkdown || '',
        };
      }
    } catch (err) {
      console.warn('DeepSeek API request failed, falling back to heuristic engine:', err);
    }
  }

  // Intelligent heuristic fallback for instant offline/keyless use
  let baseScore = 50;
  if (lead.dealValue >= 100000 || lead.dealValue >= 10000) baseScore += 25;
  else if (lead.dealValue >= 30000 || lead.dealValue >= 4000) baseScore += 18;
  else if (lead.dealValue > 0) baseScore += 10;

  if (['NEGOTIATION', 'PROPOSAL_SENT', 'WON_ACTIVE'].includes(lead.stage)) baseScore += 15;
  if (lead.serviceType === 'ODOO_CONSULTING') baseScore += 10;
  if (lead.notes && lead.notes.length > 30) baseScore += 5;

  const finalScore = Math.min(98, Math.max(35, baseScore));
  const priority: 'HIGH' | 'MEDIUM' | 'LOW' = finalScore >= 80 ? 'HIGH' : finalScore >= 60 ? 'MEDIUM' : 'LOW';

  return {
    score: finalScore,
    priority,
    reasoning: `Calculated based on deal magnitude (৳${lead.dealValue.toLocaleString()} BDT), active pipeline stage (${lead.stage}), and service alignment with ${lead.serviceType}. High likelihood of revenue realization with timely follow-up.`,
    suggestedAction:
      priority === 'HIGH'
        ? 'Send direct WhatsApp message regarding milestone dates and schedule a 15-minute agreement sync.'
        : 'Share syllabus/case study brochure and schedule a discovery demo.',
    dossierMarkdown: `### Executive Dossier: ${lead.name} (${lead.company || 'Direct Client'})
- **Service Stream**: ${lead.serviceType.replace('_', ' ')}
- **Pipeline Value**: ৳${lead.dealValue.toLocaleString()}
- **Strategic Fit**: Strong opportunity for solopreneur margin. Core focus on custom module requirements and delivery milestones.
- **Action Plan**: Target next touchpoint within 48 hours to preserve deal momentum.`,
  };
}

/**
 * AI Meeting Note Summarization & Action Item Extraction
 */
export async function summarizeMeetingNotes(
  rawNotes: string,
  leadName?: string
): Promise<{
  summary: string;
  actionItems: string[];
  suggestedNextFollowUpDays: number;
  followUpAgenda: string;
}> {
  const apiKey = await getDeepSeekApiKey();

  if (apiKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an AI chief of staff for a top Odoo Consultant.
Summarize the meeting notes and extract concrete actions in strict JSON:
- "summary": 2-3 paragraph executive summary
- "actionItems": array of specific strings e.g. ["Prepare Odoo 18 staging demo", "Draft 40% milestone invoice"]
- "suggestedNextFollowUpDays": integer number of days until next check-in
- "followUpAgenda": 1 sentence describing the purpose of the next call`,
            },
            {
              role: 'user',
              content: `Client: ${leadName || 'Prospective Client'}\nMeeting Notes:\n${rawNotes}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return {
          summary: parsed.summary || rawNotes,
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          suggestedNextFollowUpDays: Number(parsed.suggestedNextFollowUpDays) || 3,
          followUpAgenda: parsed.followUpAgenda || 'Follow up on open discussion points.',
        };
      }
    } catch (err) {
      console.warn('DeepSeek summarizer failed, using heuristic engine:', err);
    }
  }

  // Heuristic summarization fallback
  const lines = rawNotes
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const actionLines = lines.filter(
    (l) =>
      l.toLowerCase().includes('todo') ||
      l.toLowerCase().includes('action') ||
      l.toLowerCase().includes('send') ||
      l.toLowerCase().includes('prepare') ||
      l.toLowerCase().includes('need to')
  );

  return {
    summary:
      lines.slice(0, 3).join(' ') ||
      `Meeting held with ${leadName || 'client'}. Discussed project requirements, timeline commitments, and milestone deliverables.`,
    actionItems:
      actionLines.length > 0
        ? actionLines
        : [
            `Send meeting recap and agreed milestones to ${leadName || 'client'}.`,
            'Update project scope documentation in Odoo repository.',
            'Schedule next milestone review call.',
          ],
    suggestedNextFollowUpDays: 3,
    followUpAgenda: `Review milestone status and confirm deliverable signoff.`,
  };
}

/**
 * AI WhatsApp / Email Follow-up Message Drafter
 */
export async function draftFollowUpMessage(
  lead: LeadContext,
  goal: string,
  tone: 'FRIENDLY_PROFESSIONAL' | 'DIRECT' | 'FORMAL' = 'FRIENDLY_PROFESSIONAL'
): Promise<string> {
  const apiKey = await getDeepSeekApiKey();

  if (apiKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a high-converting solopreneur business communicator.
Write a personalized, concise WhatsApp follow-up message (under 60 words).
Do not include placeholders. Be warm, natural, and respect the recipient's time.
Tone: ${tone}. Output ONLY the raw message text.`,
            },
            {
              role: 'user',
              content: `Lead Name: ${lead.name}
Company: ${lead.company || 'N/A'}
Service: ${lead.serviceType}
Current Stage: ${lead.stage}
Follow-up Goal: ${goal}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim();
      }
    } catch (err) {
      console.warn('DeepSeek drafter failed, using fallback template:', err);
    }
  }

  const firstName = lead.name.split(' ')[0] || lead.name;
  if (lead.serviceType === 'ODOO_CONSULTING') {
    return `Hi ${firstName}, hope your week is off to a great start! Following up on our Odoo scope discussion (${goal || 'milestone schedule'}). Let me know if you'd like a quick 5-minute call or if you have any questions on the proposal.`;
  } else if (lead.serviceType === 'TRAINING') {
    return `Hi ${firstName}, hope all is well! Reaching out regarding our upcoming Odoo training batch (${goal || 'dates & participant list'}). Happy to share the finalized curriculum when you're ready!`;
  } else {
    return `Hi ${firstName}, hope you're having a productive week! Checking in on our advisory plan and the ${goal || 'next action items'}. Let me know if there is anything you need my quick input on!`;
  }
}
