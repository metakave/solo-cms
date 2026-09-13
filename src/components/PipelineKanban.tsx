'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
  Pencil,
  Eye,
  SlidersHorizontal,
  Paperclip,
} from 'lucide-react';
import { Lead, Stage, Priority, ServiceType } from '@/types/crm';
import { generateWhatsAppLink, getDefaultFollowUpTemplate } from '@/lib/whatsapp';

interface PipelineKanbanProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onUpdateStage: (leadId: string, newStage: Stage) => void;
  onOpenWhatsApp: (lead: Lead) => void;
}

export const STAGES: { id: Stage; title: string; color: string; badgeColor: string }[] = [
  {
    id: 'NEW_INQUIRY',
    title: 'New Inquiries',
    color: 'border-t-blue-500',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    id: 'DISCOVERY_CALL',
    title: 'Discovery & Demo',
    color: 'border-t-amber-500',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  {
    id: 'PROPOSAL_SENT',
    title: 'Proposal & Scope',
    color: 'border-t-purple-500',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    id: 'NEGOTIATION',
    title: 'Negotiation & Terms',
    color: 'border-t-orange-500',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  {
    id: 'WON_ACTIVE',
    title: 'Won & Active Delivery',
    color: 'border-t-emerald-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'COMPLETED',
    title: 'Delivered / Completed',
    color: 'border-t-slate-400 dark:border-t-slate-500',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
];

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  leads,
  onSelectLead,
  onEditLead,
  onUpdateStage,
  onOpenWhatsApp,
}) => {
  // Folded stages dictionary: { [stageId]: true/false }
  const [foldedStages, setFoldedStages] = useState<Record<string, boolean>>({});

  // Load folded stages preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('solocrm_folded_stages');
      if (saved) {
        setFoldedStages(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFoldStage = (stageId: string) => {
    setFoldedStages((prev) => {
      const next = { ...prev, [stageId]: !prev[stageId] };
      try {
        localStorage.setItem('solocrm_folded_stages', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const foldAll = () => {
    const allFolded: Record<string, boolean> = {};
    STAGES.forEach((s) => {
      allFolded[s.id] = true;
    });
    setFoldedStages(allFolded);
    try {
      localStorage.setItem('solocrm_folded_stages', JSON.stringify(allFolded));
    } catch {
      // ignore
    }
  };

  const unfoldAll = () => {
    setFoldedStages({});
    try {
      localStorage.removeItem('solocrm_folded_stages');
    } catch {
      // ignore
    }
  };

  const foldCompleted = () => {
    setFoldedStages((prev) => {
      const next = { ...prev, WON_ACTIVE: true, COMPLETED: true };
      try {
        localStorage.setItem('solocrm_folded_stages', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const foldedCount = Object.values(foldedStages).filter(Boolean).length;

  const getServiceBadge = (service: ServiceType) => {
    switch (service) {
      case 'ODOO_CONSULTING':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-full">
            Odoo Consulting
          </span>
        );
      case 'TRAINING':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-full">
            Training Batch
          </span>
        );
      case 'ADVISORY':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 rounded-full">
            Advisory Retainer
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: Priority, score?: number | null) => {
    let color = 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    if (priority === 'HIGH') color = 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
    if (priority === 'MEDIUM') color = 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
    if (priority === 'LOW') color = 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';

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
    <div className="space-y-3">
      {/* Kanban Stage View Controls Toolbar */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Stages View:</span>
          {foldedCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-[11px] border border-indigo-200 dark:border-indigo-500/20">
              {foldedCount} folded of {STAGES.length}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              All {STAGES.length} stages expanded
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {foldedCount > 0 ? (
            <button
              onClick={unfoldAll}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-[11px] flex items-center gap-1"
              title="Expand all folded stages"
            >
              <ChevronsRight className="w-3 h-3" />
              <span>Unfold All</span>
            </button>
          ) : (
            <button
              onClick={foldCompleted}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-[11px] flex items-center gap-1"
              title="Fold Won and Completed columns"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Fold Won & Completed</span>
            </button>
          )}

          <button
            onClick={foldedCount === STAGES.length ? unfoldAll : foldAll}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors text-[11px]"
            title="Toggle all stages"
          >
            {foldedCount === STAGES.length ? 'Unfold All' : 'Fold All'}
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-stretch min-h-[580px]">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
          const isFolded = !!foldedStages[stage.id];

          // FOLDED STAGE COLUMN
          if (isFolded) {
            return (
              <div
                key={stage.id}
                id={`kanban-col-folded-${stage.id}`}
                onClick={() => toggleFoldStage(stage.id)}
                className={`group flex flex-col items-center bg-slate-100/80 dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 w-14 min-w-[56px] max-w-[56px] py-3.5 px-1 shadow-xs dark:shadow-md transition-all cursor-pointer select-none shrink-0 border-t-4 ${stage.color.replace('border-t-2', 'border-t-4')}`}
                title={`Click to unfold ${stage.title}`}
              >
                {/* Unfold Chevron Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFoldStage(stage.id);
                  }}
                  className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all mb-2"
                  title="Unfold stage"
                >
                  <ChevronRight className="w-4 h-4 group-hover:scale-125 transition-transform" />
                </button>

                {/* Lead Count Badge */}
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs mb-2">
                  {stageLeads.length}
                </span>

                {/* Abbreviated Revenue Value */}
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-4 whitespace-nowrap">
                  {stageValue >= 1000 ? `৳${(stageValue / 1000).toFixed(0)}k` : `৳${stageValue}`}
                </span>

                {/* Rotated Vertical Title */}
                <div className="flex-1 flex items-center justify-center py-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider whitespace-nowrap [writing-mode:vertical-rl] rotate-180 opacity-80 group-hover:opacity-100 transition-opacity">
                    {stage.title}
                  </span>
                </div>
              </div>
            );
          }

          // UNFOLDED STAGE COLUMN
          return (
            <div
              key={stage.id}
              id={`kanban-col-${stage.id}`}
              className="flex flex-col bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex-1 min-w-[280px] max-w-[360px] p-3 shadow-xs dark:shadow-lg transition-all shrink-0"
            >
              {/* Column Header */}
              <div className={`border-t-2 ${stage.color} pt-2.5 pb-2 px-1 mb-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleFoldStage(stage.id)}
                      className="p-1 -ml-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={`Fold ${stage.title} stage`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                      {stage.title}
                    </h3>
                  </div>

                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-xs">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 pl-4">
                  ৳{stageValue.toLocaleString()} total
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {stageLeads.length === 0 ? (
                  <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400 dark:text-slate-600 italic">
                    No active deals
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      id={`lead-card-${lead.id}`}
                      className="bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-3.5 shadow-xs dark:shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer group relative"
                      onClick={() => onSelectLead(lead)}
                    >
                      {/* Top Badges & Edit Button */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1">
                          {getServiceBadge(lead.serviceType)}
                          {getPriorityBadge(lead.priority, lead.aiScore)}
                        </div>

                        {/* Direct Edit Lead Button */}
                        {onEditLead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditLead(lead);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-all"
                            title="Edit deal details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Company & Contact */}
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {lead.company || lead.name}
                      </div>
                      {lead.company && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                          {lead.name} {lead.title ? `• ${lead.title}` : ''}
                        </div>
                      )}

                      {/* Value & Probability */}
                      <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          ৳{lead.dealValue.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          {lead.attachments && lead.attachments.length > 0 && (
                            <div
                              className="flex items-center gap-0.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/40"
                              title={`${lead.attachments.length} attachment${lead.attachments.length > 1 ? 's' : ''}`}
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{lead.attachments.length}</span>
                            </div>
                          )}
                          <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                            {lead.probability}% prob
                          </span>
                        </div>
                      </div>

                      {/* Follow-up Indicator */}
                      {lead.nextFollowUpDate && (
                        <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg px-2 py-1">
                          <Clock className="w-3 h-3 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
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
                        className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/40 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          {/* 1-Click WhatsApp */}
                          {lead.phone ? (
                            <button
                              id={`whatsapp-btn-${lead.id}`}
                              onClick={() => onOpenWhatsApp(lead)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-1 rounded-lg transition-all"
                              title="Open WhatsApp chat"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">No phone</span>
                          )}

                          {/* Direct Edit Button */}
                          {onEditLead && (
                            <button
                              id={`edit-card-btn-${lead.id}`}
                              type="button"
                              onClick={() => onEditLead(lead)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/40 px-2 py-1 rounded-lg transition-all"
                              title="Edit lead details"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>

                        {/* Quick Move Stage Dropdown */}
                        <select
                          id={`stage-select-${lead.id}`}
                          value={lead.stage}
                          onChange={(e) => onUpdateStage(lead.id, e.target.value as Stage)}
                          className="bg-slate-50 dark:bg-slate-900 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
    </div>
  );
};
