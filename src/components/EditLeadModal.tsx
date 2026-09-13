'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sparkles,
  Building,
  User,
  Mail,
  Phone,
  DollarSign,
  Tag,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  Percent,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Lead, ServiceType, Stage, Priority } from '@/types/crm';

interface EditLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: (lead: Lead) => void;
  onDeleteLead?: (id: string) => void;
}

const STAGES: { id: Stage; label: string }[] = [
  { id: 'NEW_INQUIRY', label: 'New Inquiry' },
  { id: 'DISCOVERY_CALL', label: 'Discovery & Demo' },
  { id: 'PROPOSAL_SENT', label: 'Proposal & Scope' },
  { id: 'NEGOTIATION', label: 'Negotiation & Terms' },
  { id: 'WON_ACTIVE', label: 'Won & Active Delivery' },
  { id: 'COMPLETED', label: 'Delivered / Completed' },
  { id: 'LOST', label: 'Lost' },
];

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  lead,
  onClose,
  onLeadUpdated,
  onDeleteLead,
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('ODOO_CONSULTING');
  const [stage, setStage] = useState<Stage>('NEW_INQUIRY');
  const [dealValue, setDealValue] = useState('');
  const [probability, setProbability] = useState('30');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpGoal, setNextFollowUpGoal] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (lead) {
      setShowDeleteWarning(false);
      setName(lead.name || '');
      setTitle(lead.title || '');
      setCompany(lead.company || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setServiceType(lead.serviceType || 'ODOO_CONSULTING');
      setStage(lead.stage || 'NEW_INQUIRY');
      setDealValue(String(lead.dealValue ?? 0));
      setProbability(String(lead.probability ?? 30));
      setPriority(lead.priority || 'MEDIUM');
      setNextFollowUpDate(
        lead.nextFollowUpDate
          ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0]
          : ''
      );
      setNextFollowUpGoal(lead.nextFollowUpGoal || '');
      setNotes(lead.notes || '');
      setTags(lead.tags || '');
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim() || null,
          company: company.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          serviceType,
          stage,
          dealValue: Number(dealValue) || 0,
          probability: Math.min(100, Math.max(0, Number(probability) || 0)),
          priority,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null,
          nextFollowUpGoal: nextFollowUpGoal.trim() || null,
          notes: notes.trim() || null,
          tags: tags.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.lead) {
        onLeadUpdated(data.lead);
        onClose();
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
      if (onDeleteLead) {
        onDeleteLead(lead.id);
      } else {
        await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 transition-colors max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Deal & Client Details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update deal parameters, stage, follow-up timeline, and contact information.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/60 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
          {/* Service Stream Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Service Stream
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ODOO_CONSULTING', label: 'Odoo Consulting', icon: Briefcase },
                { id: 'TRAINING', label: 'Training Batch', icon: GraduationCap },
                { id: 'ADVISORY', label: 'Advisory Retainer', icon: Sparkles },
              ].map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setServiceType(svc.id as ServiceType)}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all flex flex-col items-center gap-1 ${
                    serviceType === svc.id
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

          {/* Contact Person & Job Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-lead-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahim Chowdhury"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Managing Director"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Company & Deal Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
              <input
                id="edit-lead-company-input"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Apparel Ltd"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deal Value ($ USD)</label>
              <input
                id="edit-lead-value-input"
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="e.g. 12500"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* WhatsApp Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Phone (with Country Code)
              </label>
              <input
                id="edit-lead-phone-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +8801711000000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stage, Probability, and Priority */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pipeline Stage</label>
              <select
                id="edit-lead-stage-select"
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Next Follow-Up Date & Goal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Follow-Up Date</label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Follow-Up Goal</label>
              <input
                type="text"
                value={nextFollowUpGoal}
                onChange={(e) => setNextFollowUpGoal(e.target.value)}
                placeholder="e.g. Review milestone timeline & sign contract"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Odoo 18, Accounting, MRP, UAT Pending"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Strategic Scope
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Client requirements, pain points, milestone agreements..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
            {/* Left: Red Delete Button with Warning */}
            <div>
              {!showDeleteWarning ? (
                <button
                  id="delete-lead-modal-btn"
                  type="button"
                  onClick={() => setShowDeleteWarning(true)}
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
                    id="confirm-delete-lead-btn"
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-extrabold text-[11px] transition-all shadow-sm active:scale-95"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteWarning(false)}
                    className="px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Right: Cancel & Save Changes */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-xs"
              >
                Cancel
              </button>
              <button
                id="save-edit-lead-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
