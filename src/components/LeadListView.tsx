'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building,
  Briefcase,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  Clock,
  Pencil,
  MessageCircle,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { Lead, Stage, Priority, ServiceType } from '@/types/crm';
import { formatDate } from '@/lib/date';
import { STAGES } from '@/components/PipelineKanban';

interface LeadListViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onUpdateStage: (leadId: string, newStage: Stage) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onSwitchToKanban?: () => void;
}

type SortField = 'name' | 'company' | 'dealValue' | 'probability' | 'stage' | 'priority' | 'nextFollowUpDate' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const LeadListView: React.FC<LeadListViewProps> = ({
  leads,
  onSelectLead,
  onEditLead,
  onUpdateStage,
  onOpenWhatsApp,
  onSwitchToKanban,
}) => {
  const [sortField, setSortField] = useState<SortField>('dealValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered and sorted leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    if (stageFilter !== 'ALL') {
      result = result.filter((l) => l.stage === stageFilter);
    }

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      } else if (sortField === 'company') {
        valA = (a.company || '').toLowerCase();
        valB = (b.company || '').toLowerCase();
      } else if (sortField === 'dealValue') {
        valA = a.dealValue || 0;
        valB = b.dealValue || 0;
      } else if (sortField === 'probability') {
        valA = a.probability || 0;
        valB = b.probability || 0;
      } else if (sortField === 'priority') {
        const priorityOrder: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        valA = priorityOrder[a.priority] || 0;
        valB = priorityOrder[b.priority] || 0;
      } else if (sortField === 'nextFollowUpDate') {
        valA = a.nextFollowUpDate ? new Date(a.nextFollowUpDate).getTime() : 0;
        valB = b.nextFollowUpDate ? new Date(b.nextFollowUpDate).getTime() : 0;
      } else if (sortField === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, sortField, sortOrder, stageFilter]);

  // Statistics
  const totalValue = useMemo(() => leads.reduce((acc, l) => acc + (l.dealValue || 0), 0), [leads]);
  const weightedValue = useMemo(
    () => leads.reduce((acc, l) => acc + ((l.dealValue || 0) * (l.probability || 0)) / 100, 0),
    [leads]
  );

  const getServiceBadge = (type: ServiceType) => {
    switch (type) {
      case 'ODOO_CONSULTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <Briefcase className="w-2.5 h-2.5" />
            <span>Odoo</span>
          </span>
        );
      case 'TRAINING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <GraduationCap className="w-2.5 h-2.5" />
            <span>Training</span>
          </span>
        );
      case 'ADVISORY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Advisory</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: Priority, aiScore?: number | null) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            HIGH {aiScore ? `(${aiScore})` : ''}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
            MED {aiScore ? `(${aiScore})` : ''}
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            LOW
          </span>
        );
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Quick View Switcher Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            {onSwitchToKanban && (
              <button
                type="button"
                onClick={onSwitchToKanban}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            )}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold bg-indigo-600 text-white shadow-xs"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{processedLeads.length}</strong> of {leads.length} leads
          </span>
        </div>

        {/* Right Metric Summary & Stage Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Stages ({leads.length})</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({leads.filter((l) => l.stage === s.id).length})
              </option>
            ))}
          </select>

          <div className="hidden md:flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-xl font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Pipeline: ৳{totalValue.toLocaleString()}</span>
            <span className="text-emerald-400 dark:text-emerald-600">•</span>
            <span className="text-[11px] font-normal">Weighted: ৳{Math.round(weightedValue).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#0c121e]/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Lead Name & Role</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('company')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company</span>
                    {renderSortIcon('company')}
                  </div>
                </th>
                <th className="py-3.5 px-4">Stream</th>
                <th
                  onClick={() => handleSort('stage')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stage</span>
                    {renderSortIcon('stage')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dealValue')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Deal Value (BDT)</span>
                    {renderSortIcon('dealValue')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Priority / AI</span>
                    {renderSortIcon('priority')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nextFollowUpDate')}
                  className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Follow-Up Due</span>
                    {renderSortIcon('nextFollowUpDate')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {processedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-600 italic">
                    No leads found matching current filter.
                  </td>
                </tr>
              ) : (
                processedLeads.map((lead) => {
                  const now = new Date();
                  const dueDate = lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate) : null;
                  const isOverdue = dueDate && dueDate < now;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      {/* Lead Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 text-sm transition-colors flex items-center gap-1.5">
                          <span>{lead.name}</span>
                          {lead.attachments && lead.attachments.length > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-1 py-0.2 rounded"
                              title={`${lead.attachments.length} attachment(s)`}
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              <span>{lead.attachments.length}</span>
                            </span>
                          )}
                        </div>
                        {lead.title && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {lead.title}
                          </div>
                        )}
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-4">
                        {lead.company ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{lead.company}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Service Stream */}
                      <td className="py-3.5 px-4">{getServiceBadge(lead.serviceType)}</td>

                      {/* Stage Dropdown (Inline Stage Switching) */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.stage}
                          onChange={(e) => onUpdateStage(lead.id, e.target.value as Stage)}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                          ৳{lead.dealValue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {lead.probability}% probability
                        </div>
                      </td>

                      {/* Priority / AI Score */}
                      <td className="py-3.5 px-4">{getPriorityBadge(lead.priority, lead.aiScore)}</td>

                      {/* Follow-up Due */}
                      <td className="py-3.5 px-4">
                        {lead.nextFollowUpDate ? (
                          <div className="space-y-0.5">
                            <div
                              className={`inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${
                                isOverdue
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(lead.nextFollowUpDate)}</span>
                            </div>
                            {lead.nextFollowUpGoal && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[160px]">
                                {lead.nextFollowUpGoal}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-[11px] italic">Not scheduled</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {lead.phone && (
                            <button
                              type="button"
                              onClick={() => onOpenWhatsApp(lead)}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                              title="Send WhatsApp Follow-up"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onEditLead && (
                            <button
                              type="button"
                              onClick={() => onEditLead(lead)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Lead Details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Open Lead Drawer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
