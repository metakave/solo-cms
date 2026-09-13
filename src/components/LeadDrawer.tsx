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
  Pencil,
  Save,
  AlertTriangle,
  Paperclip,
  FileText,
  UploadCloud,
  Eye,
  Download,
  FileType,
  File,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Lead, Stage, Milestone, Meeting, ActivityLog, ServiceType, Priority, Attachment } from '@/types/crm';
import { generateWhatsAppLink, getDefaultFollowUpTemplate } from '@/lib/whatsapp';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';
import { formatDate, formatDateTime } from '@/lib/date';
import { DateInput } from '@/components/DateInput';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onOpenScheduleMeeting: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onOpenScheduleMeeting,
  onEditLead,
}) => {
  const [activeTab, setActiveTab] = useState<'EDIT' | 'AI' | 'ATTACHMENTS' | 'WHATSAPP' | 'MILESTONES' | 'MEETINGS' | 'NOTES'>('AI');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [whatsAppMsg, setWhatsAppMsg] = useState('');
  const [whatsAppGoal, setWhatsAppGoal] = useState('');
  const [whatsAppTone, setWhatsAppTone] = useState<'FRIENDLY_PROFESSIONAL' | 'DIRECT' | 'FORMAL'>('FRIENDLY_PROFESSIONAL');
  const [isDraftingMsg, setIsDraftingMsg] = useState(false);

  // Attachment & Document Preview State
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Full Inline Edit Lead State
  const [editName, setEditName] = useState('');
  const [editPoc, setEditPoc] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editServiceType, setEditServiceType] = useState<ServiceType>('ODOO_CONSULTING');
  const [editStage, setEditStage] = useState<Stage>('NEW_INQUIRY');
  const [editDealValue, setEditDealValue] = useState('');
  const [editProbability, setEditProbability] = useState('30');
  const [editPriority, setEditPriority] = useState<Priority>('MEDIUM');
  const [editNextFollowUpDate, setEditNextFollowUpDate] = useState('');
  const [editNextFollowUpGoal, setEditNextFollowUpGoal] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState(false);
  const [showDrawerDeleteWarning, setShowDrawerDeleteWarning] = useState(false);

  // New Milestone Form State
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  // Editable Lead Notes State
  const [leadNotes, setLeadNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (lead) {
      setShowDrawerDeleteWarning(false);
      setEditName(lead.name || '');
      setEditPoc(lead.poc || '');
      setEditTitle(lead.title || '');
      setEditCompany(lead.company || '');
      setEditEmail(lead.email || '');
      setEditPhone(lead.phone || '');
      setEditServiceType(lead.serviceType || 'ODOO_CONSULTING');
      setEditStage(lead.stage || 'NEW_INQUIRY');
      setEditDealValue(String(lead.dealValue ?? 0));
      setEditProbability(String(lead.probability ?? 30));
      setEditPriority(lead.priority || 'MEDIUM');
      setEditNextFollowUpDate(
        lead.nextFollowUpDate
          ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0]
          : ''
      );
      setEditNextFollowUpGoal(lead.nextFollowUpGoal || '');
      setEditTags(lead.tags || '');
      setLeadNotes(lead.notes || '');
      setWhatsAppGoal(lead.nextFollowUpGoal || 'Review project timeline and milestone schedule');
      setWhatsAppMsg(getDefaultFollowUpTemplate(lead.poc || lead.name, lead.serviceType));
    }
  }, [lead]);

  // Save Full Lead Edit
  const handleSaveFullLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lead || !editName.trim()) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          poc: editPoc.trim() || null,
          title: editTitle.trim() || null,
          company: editCompany.trim() || null,
          email: editEmail.trim() || null,
          phone: editPhone.trim() || null,
          serviceType: editServiceType,
          stage: editStage,
          dealValue: Number(editDealValue) || 0,
          probability: Math.min(100, Math.max(0, Number(editProbability) || 0)),
          priority: editPriority,
          nextFollowUpDate: editNextFollowUpDate ? new Date(editNextFollowUpDate).toISOString() : null,
          nextFollowUpGoal: editNextFollowUpGoal.trim() || null,
          notes: leadNotes.trim() || null,
          tags: editTags.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.lead) {
        onUpdateLead(data.lead);
        setEditSuccessMsg(true);
        setTimeout(() => setEditSuccessMsg(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save lead:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

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

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !lead) return;
    const file = files[0];
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds 15 MB limit.');
      return;
    }

    setIsUploadingAttachment(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            fileData: base64Data,
          }),
        });

        const data = await res.json();
        if (data.success && data.attachment) {
          const updatedLead: Lead = {
            ...lead,
            attachments: [data.attachment, ...(lead.attachments || [])],
          };
          onUpdateLead(updatedLead);
        } else {
          setUploadError(data.error || 'Failed to upload attachment');
        }
      } catch (err: any) {
        setUploadError(err.message || 'Upload error');
      } finally {
        setIsUploadingAttachment(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      setIsUploadingAttachment(false);
      setUploadError('Failed to read file from disk.');
    };
    reader.readAsDataURL(file);
  };

  // Delete Attachment Handler
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!lead) return;
    try {
      const res = await fetch(`/api/attachments?id=${attachmentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        const updatedLead: Lead = {
          ...lead,
          attachments: (lead.attachments || []).filter((a) => a.id !== attachmentId),
        };
        onUpdateLead(updatedLead);
      }
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  // Download Attachment Handler
  const handleDownloadAttachment = (attachment: Attachment) => {
    const a = document.createElement('a');
    a.href = attachment.fileData;
    a.download = attachment.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Open Preview Modal
  const handleOpenPreview = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0e1626] border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-full">
                  {lead.serviceType.replace('_', ' ')}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    lead.priority === 'HIGH'
                      ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                      : lead.priority === 'MEDIUM'
                      ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                      : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                  }`}
                >
                  {lead.priority} PRIORITY ({lead.aiScore || 0}/100)
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{lead.name}</h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium flex-wrap">
                {lead.poc && <span className="font-bold text-indigo-600 dark:text-indigo-400">PoC: {lead.poc}</span>}
                {lead.poc && (lead.company || lead.title) && <span>•</span>}
                {lead.company && <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.company}</span>}
                {lead.company && lead.title && <span>•</span>}
                {lead.title && <span>{lead.title}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEditLead && (
                <button
                  id="edit-lead-drawer-btn"
                  onClick={() => onEditLead(lead)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl transition-all shadow-xs"
                  title="Edit Lead Details"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Lead</span>
                </button>
              )}
              <button
                onClick={() => onDeleteLead(lead.id)}
                className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                title="Delete Lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Key Deal Metrics Quick Strip */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 text-xs">
            <div>
              <div className="text-slate-500 dark:text-slate-400 font-medium">Deal Value</div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ৳{lead.dealValue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400 font-medium">Stage</div>
              <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mt-1">
                {lead.stage.replace('_', ' ')}
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400 font-medium">Phone / WhatsApp</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1">
                {lead.phone || 'No phone set'}
              </div>
            </div>
          </div>

          {/* Prominent Quick Actions Strip */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60">
            <button
              id="drawer-quick-edit-btn"
              type="button"
              onClick={() => {
                if (onEditLead) onEditLead(lead);
                else setActiveTab('EDIT');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Lead Details</span>
            </button>
            <button
              type="button"
              id="drawer-quick-files-btn"
              onClick={() => setActiveTab('ATTACHMENTS')}
              className="flex items-center gap-1.5 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 rounded-xl text-xs font-semibold transition-all"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Files ({lead.attachments?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('WHATSAPP')}
              className="flex items-center gap-1.5 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenScheduleMeeting(lead)}
              className="flex items-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-6 gap-2 text-xs overflow-x-auto">
          {[
            { id: 'EDIT', label: 'Edit Deal', icon: Pencil },
            { id: 'AI', label: 'DeepSeek AI', icon: Sparkles },
            { id: 'ATTACHMENTS', label: 'Attachments', icon: Paperclip, count: lead.attachments?.length },
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
                    ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 0: EDIT LEAD FORM */}
          {activeTab === 'EDIT' && (
            <form onSubmit={handleSaveFullLead} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Edit Lead Information</span>
                </div>
                {editSuccessMsg && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved Successfully!</span>
                  </span>
                )}
              </div>

              {/* Service Stream Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Service Stream
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ODOO_CONSULTING', label: 'Odoo Consulting', icon: Briefcase },
                    { id: 'TRAINING', label: 'Training Batch', icon: Layers },
                    { id: 'ADVISORY', label: 'Advisory Retainer', icon: Sparkles },
                  ].map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setEditServiceType(svc.id as ServiceType)}
                      className={`p-2 rounded-xl border text-center font-semibold transition-all flex flex-col items-center gap-1 ${
                        editServiceType === svc.id
                          ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <svc.icon className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{svc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Name & Lead PoC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="drawer-edit-name-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Apex Odoo 18 Migration"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead PoC (Point of Contact)</label>
                  <input
                    id="drawer-edit-poc-input"
                    type="text"
                    value={editPoc}
                    onChange={(e) => setEditPoc(e.target.value)}
                    placeholder="e.g. Rahim Chowdhury"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role / Job Title & Company */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PoC Role / Job Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Managing Director / IT Head"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                  <input
                    id="drawer-edit-company-input"
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Deal Value & Stage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deal Value (BDT)</label>
                  <input
                    id="drawer-edit-value-input"
                    type="number"
                    value={editDealValue}
                    onChange={(e) => setEditDealValue(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    id="drawer-edit-phone-input"
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+8801700000000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Stage, Probability, Priority */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pipeline Stage</label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as Stage)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="NEW_INQUIRY">New Inquiry</option>
                    <option value="DISCOVERY_CALL">Discovery & Demo</option>
                    <option value="PROPOSAL_SENT">Proposal & Scope</option>
                    <option value="NEGOTIATION">Negotiation & Terms</option>
                    <option value="WON_ACTIVE">Won & Active Delivery</option>
                    <option value="COMPLETED">Delivered / Completed</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editProbability}
                    onChange={(e) => setEditProbability(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Next Follow-up Date & Goal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-Up Date (DD/MM/YYYY)
                  </label>
                  <DateInput
                    id="drawer-edit-lead-date-input"
                    value={editNextFollowUpDate}
                    onChange={(val) => setEditNextFollowUpDate(val)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Follow-Up Goal</label>
                  <input
                    type="text"
                    value={editNextFollowUpGoal}
                    onChange={(e) => setEditNextFollowUpGoal(e.target.value)}
                    placeholder="e.g. Agreement signoff"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="Odoo 18, Accounting, MRP"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Save & Delete Buttons in EDIT Tab */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  {!showDrawerDeleteWarning ? (
                    <button
                      type="button"
                      onClick={() => setShowDrawerDeleteWarning(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 rounded-xl font-bold transition-all text-xs"
                      title="Delete this lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Lead</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 p-1.5 rounded-xl animate-in fade-in">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 px-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Delete permanently?</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteLead(lead.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-extrabold text-[11px] transition-all shadow-sm active:scale-95"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDrawerDeleteWarning(false)}
                        className="px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <button
                  id="drawer-save-full-lead-btn"
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingEdit ? 'Saving Changes...' : 'Save Lead Details'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: AI INTELLIGENCE & DOSSIER */}
          {activeTab === 'AI' && (
            <div className="space-y-5">
              {/* Score & Refresh Banner */}
              <div className="bg-indigo-50/60 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl p-4 shadow-sm dark:shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-xl font-black text-indigo-700 dark:text-indigo-300 shadow-inner">
                      {lead.aiScore || 75}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        DeepSeek Lead Score
                      </div>
                      <div className="text-xs text-indigo-700/80 dark:text-indigo-200/80 font-medium">
                        Priority: <strong className="text-slate-900 dark:text-white">{lead.priority}</strong> • Based on budget & scope
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
                  <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <strong className="text-indigo-600 dark:text-indigo-300">Strategy Rationale: </strong>
                    {lead.aiPriorityReason}
                  </div>
                )}
              </div>

              {/* Next Tactical Follow-Up Step */}
              {lead.nextFollowUpGoal && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recommended Next Step</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-200/90 font-medium">{lead.nextFollowUpGoal}</p>
                </div>
              )}

              {/* Dossier Markdown */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Client Strategic Dossier
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                  {lead.aiDossier || 'No strategic dossier generated yet. Click "Re-Score" to generate full client dossier.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ATTACHMENTS & DOCUMENT PREVIEW */}
          {activeTab === 'ATTACHMENTS' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Lead Attachments & Documents</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Proposals, scopes, contracts, and specifications with instant in-app preview for PDF and Word docs.
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {lead.attachments?.length || 0} files
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/40 transition-colors relative group">
                <input
                  type="file"
                  id="lead-file-upload-input"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploadingAttachment}
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-indigo-200 dark:border-indigo-500/20">
                    {isUploadingAttachment ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {isUploadingAttachment ? 'Uploading document...' : 'Click to browse or drop file here'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports PDF, Word (.docx, .doc), text, and images up to 15 MB
                  </div>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Attachments List */}
              <div className="space-y-3">
                {(!lead.attachments || lead.attachments.length === 0) ? (
                  <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900/20">
                    No documents attached yet. Attach a client proposal, technical scope, or invoice to preview here.
                  </div>
                ) : (
                  lead.attachments.map((att) => {
                    const ext = att.fileName.split('.').pop()?.toLowerCase() || '';
                    const isPdf = ext === 'pdf' || att.fileType.includes('pdf');
                    const isDoc = ['doc', 'docx'].includes(ext) || att.fileType.includes('word');
                    const sizeStr =
                      att.fileSize >= 1024 * 1024
                        ? `${(att.fileSize / (1024 * 1024)).toFixed(1)} MB`
                        : `${Math.round(att.fileSize / 1024)} KB`;

                    return (
                      <div
                        key={att.id}
                        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-slate-700 rounded-2xl p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2.5 rounded-xl border shrink-0 ${
                              isPdf
                                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
                                : isDoc
                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isPdf ? (
                              <FileText className="w-5 h-5" />
                            ) : isDoc ? (
                              <FileType className="w-5 h-5" />
                            ) : (
                              <File className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                {att.fileName}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {ext || 'FILE'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {sizeStr} • Added {formatDate(att.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(att)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
                            title="Quick Preview in CRM"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete attachment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK WHATSAPP */}
          {activeTab === 'WHATSAPP' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>1-Click WhatsApp Communication</span>
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 font-medium">
                  Compose high-converting follow-up drafts with DeepSeek, then launch directly into WhatsApp Web or Desktop via <code>wa.me</code>.
                </p>
              </div>

              {/* Follow-up Objective / Goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Follow-Up Objective / Talking Point
                </label>
                <input
                  type="text"
                  value={whatsAppGoal}
                  onChange={(e) => setWhatsAppGoal(e.target.value)}
                  placeholder="e.g., Finalize Odoo 18 scope and confirm 40% advance deposit"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tone Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Tone:</span>
                {(['FRIENDLY_PROFESSIONAL', 'DIRECT', 'FORMAL'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setWhatsAppTone(tone)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      whatsAppTone === tone
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  WhatsApp Message Draft
                </label>
                <textarea
                  id="whatsapp-message-draft"
                  rows={4}
                  value={whatsAppMsg}
                  onChange={(e) => setWhatsAppMsg(e.target.value)}
                  className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
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
                    className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
                    title="Record message as sent without opening link"
                  >
                    Log as Sent
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300">
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
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Payment Milestones & Cash Inflow
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl space-y-3 text-xs animate-in fade-in"
                >
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Milestone Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Module Customization & UAT Signoff (40%)"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Amount (BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g., 50000"
                      value={newMilestoneAmount}
                      onChange={(e) => setNewMilestoneAmount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingMilestone(false)}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-lg"
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
                  <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                    No milestones defined yet. Break down the ৳{lead.dealValue.toLocaleString()} deal into staged invoices.
                  </div>
                ) : (
                  lead.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-200">{m.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{m.amount.toLocaleString()}
                          </span>
                          {m.dueDate && (
                            <span className="text-slate-500 dark:text-slate-400">
                              • Due {formatDate(m.dueDate)}
                            </span>
                          )}
                          {m.invoiceNumber && (
                            <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300">
                              {m.invoiceNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.status === 'PAID' ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        ) : m.status === 'INVOICED' ? (
                          <button
                            onClick={() => handleUpdateMilestoneStatus(m.id, 'PAID')}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-500/15 hover:bg-emerald-50 text-amber-700 dark:text-amber-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-amber-200 dark:border-amber-500/30 rounded-lg transition-all"
                            title="Click to mark as Paid"
                          >
                            Invoiced • Mark Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateMilestoneStatus(m.id, 'INVOICED')}
                            className="px-2.5 py-1 text-[11px] font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg transition-all"
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
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Scheduled Meetings & Calls
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                    No meetings scheduled with this client yet.
                  </div>
                ) : (
                  lead.meetings.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 dark:text-slate-200">{m.title}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 font-bold">
                          {m.locationType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>{formatDateTime(m.startTime)}</span>
                      </div>
                      {m.meetUrl && (
                        <a
                          href={m.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {m.aiSummary && (
                        <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 mt-2">
                          <strong className="text-indigo-600 dark:text-indigo-300">DeepSeek Summary: </strong>
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
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
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Record scope notes, technical preferences, stakeholders, budget limits..."
                />
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Activity Timeline
                </h4>
                <div className="space-y-2">
                  {(!lead.activities || lead.activities.length === 0) ? (
                    <div className="text-xs text-slate-400 dark:text-slate-600 italic">No activity logs recorded yet.</div>
                  ) : (
                    lead.activities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{act.type}</span>
                          <span>{formatDateTime(act.createdAt)}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs">{act.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Document & Proposal Previewer */}
      <DocumentPreviewModal
        attachment={previewAttachment}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewAttachment(null);
        }}
      />
    </div>
  );
};
