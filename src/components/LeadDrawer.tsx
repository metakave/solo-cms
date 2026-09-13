'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  MessageCircle,
  DollarSign,
  Calendar,
  Clock,
  Send,
  Plus,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Tag,
  Phone,
  Mail,
  Building,
  Briefcase,
  Layers,
  History,
  Trash2,
} from 'lucide-react';
import { Lead, Stage, Milestone, Meeting, ActivityLog } from '@/types/crm';
import { generateWhatsAppLink, getDefaultFollowUpTemplate } from '@/lib/whatsapp';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onOpenScheduleMeeting: (lead: Lead) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onOpenScheduleMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<'AI' | 'WHATSAPP' | 'MILESTONES' | 'MEETINGS' | 'NOTES'>('AI');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [whatsAppMsg, setWhatsAppMsg] = useState('');
  const [whatsAppGoal, setWhatsAppGoal] = useState('');
  const [whatsAppTone, setWhatsAppTone] = useState<'FRIENDLY_PROFESSIONAL' | 'DIRECT' | 'FORMAL'>('FRIENDLY_PROFESSIONAL');
  const [isDraftingMsg, setIsDraftingMsg] = useState(false);
  
  // New Milestone Form State
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  // Editable Lead Notes State
  const [leadNotes, setLeadNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (lead) {
      setLeadNotes(lead.notes || '');
      setWhatsAppGoal(lead.nextFollowUpGoal || 'Review project timeline and milestone schedule');
      setWhatsAppMsg(getDefaultFollowUpTemplate(lead.name, lead.serviceType));
    }
  }, [lead]);

  if (!lead) return null;

  // AI Re-score with DeepSeek
  const handleRecalculateAiScore = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to recalculate AI score:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate WhatsApp draft with DeepSeek
  const handleGenerateAiWhatsAppDraft = async () => {
    setIsDraftingMsg(true);
    try {
      const res = await fetch('/api/ai/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          customGoal: whatsAppGoal,
          tone: whatsAppTone,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setWhatsAppMsg(data.message);
      }
    } catch (err) {
      console.error('Failed to draft WhatsApp message:', err);
    } finally {
      setIsDraftingMsg(false);
    }
  };

  // Save updated notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: leadNotes }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle || !newMilestoneAmount) return;

    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          title: newMilestoneTitle,
          amount: Number(newMilestoneAmount),
        }),
      });
      const data = await res.json();
      if (data.success && data.milestone) {
        const updatedMilestones = [...(lead.milestones || []), data.milestone];
        onUpdateLead({ ...lead, milestones: updatedMilestones });
        setNewMilestoneTitle('');
        setNewMilestoneAmount('');
        setIsAddingMilestone(false);
      }
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  // Update Milestone Status
  const handleUpdateMilestoneStatus = async (milestoneId: string, status: 'INVOICED' | 'PAID') => {
    try {
      const res = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status }),
      });
      const data = await res.json();
      if (data.success && data.milestone) {
        const updated = (lead.milestones || []).map((m) =>
          m.id === milestoneId ? data.milestone : m
        );
        onUpdateLead({ ...lead, milestones: updated });
      }
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  // Log WhatsApp Message Sent
  const handleLogWhatsAppSent = async () => {
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastContactDate: new Date().toISOString(),
        }),
      });
      // Also record activity
      const updatedActivities = [
        {
          id: String(Date.now()),
          leadId: lead.id,
          type: 'WHATSAPP_SENT',
          content: `Sent WhatsApp message: "${whatsAppMsg.substring(0, 70)}..."`,
          createdAt: new Date().toISOString(),
        },
        ...(lead.activities || []),
      ];
      onUpdateLead({ ...lead, activities: updatedActivities, lastContactDate: new Date().toISOString() });
    } catch (err) {
      console.error('Error logging WhatsApp action:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-[#0e1626] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {lead.serviceType.replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    lead.priority === 'HIGH'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : lead.priority === 'MEDIUM'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {lead.priority} PRIORITY ({lead.aiScore || 0}/100)
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{lead.company || lead.name}</h2>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{lead.name}</span>
                {lead.title && <span>• {lead.title}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDeleteLead(lead.id)}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all"
                title="Delete Lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Key Deal Metrics Quick Strip */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/60 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Deal Value</div>
              <div className="text-base font-extrabold text-emerald-400">
                ${lead.dealValue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Stage</div>
              <div className="text-xs font-semibold text-indigo-300 mt-1">
                {lead.stage.replace('_', ' ')}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Phone / WhatsApp</div>
              <div className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1">
                {lead.phone || 'No phone set'}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/30 px-6 gap-2 text-xs overflow-x-auto">
          {[
            { id: 'AI', label: 'DeepSeek AI', icon: Sparkles },
            { id: 'WHATSAPP', label: '1-Click WhatsApp', icon: MessageCircle },
            { id: 'MILESTONES', label: 'Milestones & Cash', icon: DollarSign },
            { id: 'MEETINGS', label: 'Meetings & Zoho', icon: Calendar },
            { id: 'NOTES', label: 'Notes & Logs', icon: History },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`drawer-tab-${tab.id.toLowerCase()}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: AI INTELLIGENCE & DOSSIER */}
          {activeTab === 'AI' && (
            <div className="space-y-5">
              {/* Score & Refresh Banner */}
              <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-800/40 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl font-black text-indigo-300 shadow-inner">
                      {lead.aiScore || 75}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        DeepSeek Lead Score
                      </div>
                      <div className="text-xs text-indigo-200/80">
                        Priority: <strong className="text-white">{lead.priority}</strong> • Based on budget & scope
                      </div>
                    </div>
                  </div>

                  <button
                    id="re-score-ai-btn"
                    onClick={handleRecalculateAiScore}
                    disabled={isAiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                    <span>{isAiLoading ? 'Analyzing...' : 'Re-Score'}</span>
                  </button>
                </div>

                {lead.aiPriorityReason && (
                  <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-indigo-900/40">
                    <strong className="text-indigo-300">Strategy Rationale: </strong>
                    {lead.aiPriorityReason}
                  </div>
                )}
              </div>

              {/* Next Tactical Follow-Up Step */}
              {lead.nextFollowUpGoal && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recommended Next Step</span>
                  </div>
                  <p className="text-xs text-amber-200/90">{lead.nextFollowUpGoal}</p>
                </div>
              )}

              {/* Dossier Markdown */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Client Strategic Dossier
                </h3>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                  {lead.aiDossier || 'No strategic dossier generated yet. Click "Re-Score" to generate full client dossier.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK WHATSAPP */}
          {activeTab === 'WHATSAPP' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>1-Click WhatsApp Communication</span>
                </div>
                <p className="text-xs text-emerald-300/80">
                  Compose high-converting follow-up drafts with DeepSeek, then launch directly into WhatsApp Web or Desktop via <code>wa.me</code>.
                </p>
              </div>

              {/* Follow-up Objective / Goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Follow-Up Objective / Talking Point
                </label>
                <input
                  type="text"
                  value={whatsAppGoal}
                  onChange={(e) => setWhatsAppGoal(e.target.value)}
                  placeholder="e.g., Finalize Odoo 18 scope and confirm 40% advance deposit"
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tone Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Tone:</span>
                {(['FRIENDLY_PROFESSIONAL', 'DIRECT', 'FORMAL'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setWhatsAppTone(tone)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      whatsAppTone === tone
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tone.replace('_', ' ')}
                  </button>
                ))}

                <button
                  id="draft-ai-whatsapp-btn"
                  onClick={handleGenerateAiWhatsAppDraft}
                  disabled={isDraftingMsg}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isDraftingMsg ? 'Drafting...' : 'Generate with DeepSeek'}</span>
                </button>
              </div>

              {/* Message Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Message Draft
                </label>
                <textarea
                  id="whatsapp-message-draft"
                  rows={4}
                  value={whatsAppMsg}
                  onChange={(e) => setWhatsAppMsg(e.target.value)}
                  className="w-full p-3.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Launch WhatsApp Button */}
              {lead.phone ? (
                <div className="flex items-center gap-3 pt-2">
                  <a
                    id="launch-whatsapp-anchor"
                    href={generateWhatsAppLink(lead.phone, whatsAppMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLogWhatsAppSent}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Launch WhatsApp ({lead.phone})</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>

                  <button
                    onClick={handleLogWhatsAppSent}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                    title="Record message as sent without opening link"
                  >
                    Log as Sent
                  </button>
                </div>
              ) : (
                <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl text-xs text-amber-300">
                  ⚠️ No phone number saved for this lead. Please add a phone number with country code in Notes to enable 1-Click WhatsApp.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REVENUE & MILESTONES */}
          {activeTab === 'MILESTONES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Payment Milestones & Cash Inflow
                  </h3>
                  <p className="text-xs text-slate-400">
                    Track upfront deposits, UAT approvals, and final handover invoices.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingMilestone(!isAddingMilestone)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              {/* Add Milestone Form */}
              {isAddingMilestone && (
                <form
                  onSubmit={handleAddMilestone}
                  className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl space-y-3 text-xs animate-in fade-in"
                >
                  <div>
                    <label className="block text-slate-400 mb-1">Milestone Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Module Customization & UAT Signoff (40%)"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Amount ($ USD)</label>
                    <input
                      type="number"
                      placeholder="e.g., 4000"
                      value={newMilestoneAmount}
                      onChange={(e) => setNewMilestoneAmount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingMilestone(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              )}

              {/* Milestone List */}
              <div className="space-y-2">
                {(!lead.milestones || lead.milestones.length === 0) ? (
                  <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500 italic">
                    No milestones defined yet. Break down the ${lead.dealValue.toLocaleString()} deal into staged invoices.
                  </div>
                ) : (
                  lead.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{m.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-bold text-emerald-400">
                            ${m.amount.toLocaleString()}
                          </span>
                          {m.invoiceNumber && (
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              {m.invoiceNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.status === 'PAID' ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        ) : m.status === 'INVOICED' ? (
                          <button
                            onClick={() => handleUpdateMilestoneStatus(m.id, 'PAID')}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/15 hover:bg-emerald-500/20 text-amber-300 hover:text-emerald-300 border border-amber-500/30 rounded-lg transition-all"
                            title="Click to mark as Paid"
                          >
                            Invoiced • Mark Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateMilestoneStatus(m.id, 'INVOICED')}
                            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-all"
                          >
                            Mark Invoiced
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MEETINGS & CALENDAR */}
          {activeTab === 'MEETINGS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Scheduled Meetings & Calls
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sync with Zoho Calendar or book direct Google Meet / WhatsApp calls.
                  </p>
                </div>
                <button
                  onClick={() => onOpenScheduleMeeting(lead)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Meeting</span>
                </button>
              </div>

              <div className="space-y-2">
                {(!lead.meetings || lead.meetings.length === 0) ? (
                  <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500 italic">
                    No meetings scheduled with this client yet.
                  </div>
                ) : (
                  lead.meetings.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-200">{m.title}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                          {m.locationType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{new Date(m.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      {m.meetUrl && (
                        <a
                          href={m.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {m.aiSummary && (
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 mt-2">
                          <strong className="text-indigo-300">DeepSeek Summary: </strong>
                          {m.aiSummary}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: NOTES & TIMELINE */}
          {activeTab === 'NOTES' && (
            <div className="space-y-5">
              {/* Editable Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Lead Notes & Client Background
                  </label>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Record scope notes, technical preferences, stakeholders, budget limits..."
                />
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Activity Timeline
                </h4>
                <div className="space-y-2">
                  {(!lead.activities || lead.activities.length === 0) ? (
                    <div className="text-xs text-slate-600 italic">No activity logs recorded yet.</div>
                  ) : (
                    lead.activities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-indigo-400">{act.type}</span>
                          <span>{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 text-xs">{act.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
