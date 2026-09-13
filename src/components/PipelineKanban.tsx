'use client';

import React from 'react';
import {
  MessageCircle,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  MoreVertical,
  Building,
  DollarSign,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Lead, Stage, Priority, ServiceType } from '@/types/crm';
import { generateWhatsAppLink, getDefaultFollowUpTemplate } from '@/lib/whatsapp';

interface PipelineKanbanProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, newStage: Stage) => void;
  onOpenWhatsApp: (lead: Lead) => void;
}

const STAGES: { id: Stage; title: string; color: string; badgeColor: string }[] = [
  {
    id: 'NEW_INQUIRY',
    title: 'New Inquiries',
    color: 'border-t-blue-500',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'DISCOVERY_CALL',
    title: 'Discovery & Demo',
    color: 'border-t-amber-500',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'PROPOSAL_SENT',
    title: 'Proposal & Scope',
    color: 'border-t-purple-500',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    id: 'NEGOTIATION',
    title: 'Negotiation & Terms',
    color: 'border-t-orange-500',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  {
    id: 'WON_ACTIVE',
    title: 'Won & Active Delivery',
    color: 'border-t-emerald-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'COMPLETED',
    title: 'Delivered / Completed',
    color: 'border-t-slate-500',
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
];

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  leads,
  onSelectLead,
  onUpdateStage,
  onOpenWhatsApp,
}) => {
  const getServiceBadge = (service: ServiceType) => {
    switch (service) {
      case 'ODOO_CONSULTING':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full">
            Odoo Consulting
          </span>
        );
      case 'TRAINING':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
            Training Batch
          </span>
        );
      case 'ADVISORY':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 rounded-full">
            Advisory Retainer
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: Priority, score?: number | null) => {
    let color = 'bg-slate-700/60 text-slate-300 border-slate-600';
    if (priority === 'HIGH') color = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    if (priority === 'MEDIUM') color = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    if (priority === 'LOW') color = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

    return (
      <span
        className={`px-2 py-0.5 text-[10px] font-bold border rounded-full flex items-center gap-1 ${color}`}
      >
        <Sparkles className="w-2.5 h-2.5" />
        <span>{priority}</span>
        {score !== undefined && score !== null && (
          <span className="opacity-80">({score})</span>
        )}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.id);
        const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

        return (
          <div
            key={stage.id}
            className="flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800/80 min-w-[280px] p-3 shadow-lg"
          >
            {/* Column Header */}
            <div className={`border-t-2 ${stage.color} pt-2.5 pb-2 px-1 mb-2`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 tracking-wide">{stage.title}</h3>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {stageLeads.length}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                ${stageValue.toLocaleString()} total
              </div>
            </div>

            {/* Cards Container */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {stageLeads.length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center text-xs text-slate-600 italic">
                  No active deals
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    id={`lead-card-${lead.id}`}
                    className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl p-3.5 shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer group"
                    onClick={() => onSelectLead(lead)}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      {getServiceBadge(lead.serviceType)}
                      {getPriorityBadge(lead.priority, lead.aiScore)}
                    </div>

                    {/* Company & Contact */}
                    <div className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {lead.company || lead.name}
                    </div>
                    {lead.company && (
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {lead.name} {lead.title ? `• ${lead.title}` : ''}
                      </div>
                    )}

                    {/* Value & Probability */}
                    <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-700/50">
                      <div className="font-extrabold text-emerald-400 text-sm">
                        ${lead.dealValue.toLocaleString()}
                      </div>
                      <div className="text-slate-400 font-medium text-[11px]">
                        {lead.probability}% prob
                      </div>
                    </div>

                    {/* Follow-up Indicator */}
                    {lead.nextFollowUpDate && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-900/30 rounded-lg px-2 py-1">
                        <Clock className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" />
                        <span className="line-clamp-1">
                          {new Date(lead.nextFollowUpDate).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                          : {lead.nextFollowUpGoal || 'Follow-up'}
                        </span>
                      </div>
                    )}

                    {/* Quick Action Footer */}
                    <div
                      className="mt-3 pt-2 flex items-center justify-between border-t border-slate-700/40 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 1-Click WhatsApp */}
                      {lead.phone ? (
                        <button
                          id={`whatsapp-btn-${lead.id}`}
                          onClick={() => onOpenWhatsApp(lead)}
                          className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 px-2.5 py-1 rounded-lg transition-all"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No phone</span>
                      )}

                      {/* Quick Move Stage Dropdown */}
                      <select
                        id={`stage-select-${lead.id}`}
                        value={lead.stage}
                        onChange={(e) => onUpdateStage(lead.id, e.target.value as Stage)}
                        className="bg-slate-900 text-[10px] font-semibold text-slate-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
