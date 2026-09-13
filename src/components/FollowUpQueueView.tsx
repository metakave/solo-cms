'use client';

import React from 'react';
import {
  BellRing,
  Clock,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Lead } from '@/types/crm';
import { generateWhatsAppLink, getDefaultFollowUpTemplate } from '@/lib/whatsapp';

interface FollowUpQueueViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
}

export const FollowUpQueueView: React.FC<FollowUpQueueViewProps> = ({
  leads,
  onSelectLead,
  onUpdateLead,
  onOpenWhatsApp,
}) => {
  const now = new Date();

  // Filter leads with follow-up dates or high priority
  const leadsWithFollowUps = leads
    .filter((l) => l.nextFollowUpDate && !['COMPLETED', 'LOST'].includes(l.stage))
    .sort((a, b) => new Date(a.nextFollowUpDate!).getTime() - new Date(b.nextFollowUpDate!).getTime());

  const handleSnooze = async (lead: Lead, days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextFollowUpDate: newDate.toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to snooze follow-up:', err);
    }
  };

  const handleMarkDone = async (lead: Lead) => {
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastContactDate: new Date().toISOString(),
          nextFollowUpDate: null,
          nextFollowUpGoal: null,
        }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to mark follow-up done:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Daily Solopreneur Follow-up Queue</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Never let a deal go cold. Follow up with prospective consulting clients, training coordinators, and retainers.
        </p>
      </div>

      {leadsWithFollowUps.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 italic bg-slate-900/40">
          🎉 All caught up! No overdue or pending follow-ups scheduled for today.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leadsWithFollowUps.map((lead) => {
            const dueDate = new Date(lead.nextFollowUpDate!);
            const isOverdue = dueDate < now;

            return (
              <div
                key={lead.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg space-y-3 transition-all ${
                  isOverdue
                    ? 'border-rose-900/60 hover:border-rose-700'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full">
                        {lead.serviceType.replace('_', ' ')}
                      </span>
                      {isOverdue ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                          Due Soon
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectLead(lead)}
                      className="text-base font-bold text-slate-100 hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      {lead.company || lead.name}
                    </h3>
                    <div className="text-xs text-slate-400">
                      Contact: {lead.name} • ${lead.dealValue.toLocaleString()} ({lead.stage.replace('_', ' ')})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {dueDate.toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Follow-up Objective */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <span className="text-slate-400 font-semibold">Objective: </span>
                  <span className="text-slate-200">
                    {lead.nextFollowUpGoal || 'Check on proposal acceptance and next steps.'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    {lead.phone ? (
                      <button
                        onClick={() => onOpenWhatsApp(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp Now</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No phone</span>
                    )}

                    <button
                      onClick={() => onSelectLead(lead)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => handleSnooze(lead, 3)}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/70 hover:bg-slate-800 rounded-lg transition-all"
                      title="Snooze 3 days"
                    >
                      +3 Days
                    </button>
                    <button
                      onClick={() => handleMarkDone(lead)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 rounded-lg transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
