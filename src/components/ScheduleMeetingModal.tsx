'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Plus, User } from 'lucide-react';
import { Lead } from '@/types/crm';
import { DateInput } from '@/components/DateInput';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  defaultLead?: Lead | null;
  onMeetingScheduled: () => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  leads,
  defaultLead,
  onMeetingScheduled,
}) => {
  const [leadId, setLeadId] = useState(defaultLead?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [locationType, setLocationType] = useState('ZOHO_MEETING');
  const [meetUrl, setMeetUrl] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    setIsSubmitting(true);
    try {
      const startTime = new Date(`${date}T${time}:00`);
      const endTime = new Date(startTime.getTime() + Number(durationMinutes) * 60 * 1000);

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          leadId: leadId || undefined,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          locationType,
          meetUrl: meetUrl || undefined,
          rawNotes: rawNotes || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onMeetingScheduled();
        onClose();
        setTitle('');
        setMeetUrl('');
        setRawNotes('');
      }
    } catch (err) {
      console.error('Failed to schedule meeting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Schedule Meeting</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plan consultation, scoping call, or training kickoff.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/60 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Meeting Title */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Title *</label>
            <input
              id="meeting-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Odoo 18 Scoping & Milestone Review"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Associate Lead */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Client / Lead</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- General Meeting (No Specific Client) --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company || l.name} ({l.serviceType.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date (DD/MM/YYYY) *</label>
              <DateInput
                id="meeting-date-input"
                value={date}
                onChange={(val) => setDate(val)}
                required
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time *</label>
              <input
                id="meeting-time-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </div>
          </div>

          {/* Platform & Link */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ZOHO_MEETING">Zoho Meeting</option>
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="WHATSAPP_CALL">WhatsApp Call</option>
                <option value="IN_PERSON">In-Person</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting URL</label>
              <input
                type="url"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="https://meet.zoho.com/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Agenda / Prep notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pre-meeting Agenda / Notes</label>
            <textarea
              rows={2}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Key discussion points, demo requirements, questions to ask..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-schedule-meeting-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
