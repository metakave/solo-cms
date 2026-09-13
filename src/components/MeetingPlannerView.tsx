'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
  Video,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Lead } from '@/types/crm';
import { formatDate, formatTime } from '@/lib/date';

interface MeetingPlannerViewProps {
  leads: Lead[];
  onOpenScheduleModal: () => void;
}

export const MeetingPlannerView: React.FC<MeetingPlannerViewProps> = ({
  leads,
  onOpenScheduleModal,
}) => {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasZohoSync, setHasZohoSync] = useState(false);

  // AI Meeting Summarizer State
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [rawMeetingNotes, setRawMeetingNotes] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{
    summary: string;
    actionItems: string[];
    suggestedNextFollowUpDays: number;
    followUpAgenda: string;
  } | null>(null);

  const fetchCalendar = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calendar/zoho');
      const data = await res.json();
      if (data.success) {
        setCalendarEvents(data.events || []);
        setHasZohoSync(data.hasZohoSync);
      }
    } catch (err) {
      console.error('Error fetching calendar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleRunAiSummarizer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawMeetingNotes.trim()) return;

    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes: rawMeetingNotes,
          leadId: selectedLeadId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.aiResult) {
        setSummaryResult(data.aiResult);
      }
    } catch (err) {
      console.error('Failed to summarize notes:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs dark:shadow-lg transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Meeting Planner & Zoho Calendar Hub</span>
            </h2>
            {hasZohoSync ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                Zoho Synced
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Local Schedule
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronize consultations, demo calls, and corporate training batches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCalendar}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            title="Refresh Calendar"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="book-meeting-btn"
            onClick={onOpenScheduleModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Book Meeting</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Meetings */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Upcoming Schedule ({calendarEvents.length} Events)
          </h3>

          {calendarEvents.length === 0 ? (
            <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/40">
              No meetings scheduled. Click "Book Meeting" to plan a scoping call.
            </div>
          ) : (
            <div className="space-y-2.5">
              {calendarEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white dark:bg-slate-900/90 hover:bg-slate-50/80 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl shadow-xs dark:shadow-md transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{evt.title}</div>
                      {evt.lead && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Client: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{evt.lead.company || evt.lead.name}</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        evt.source === 'ZOHO'
                          ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                          : 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                      }`}
                    >
                      {evt.source === 'ZOHO' ? 'Zoho Feed' : 'SoloCRM'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>
                        {formatDate(evt.startTime)} • {formatTime(evt.startTime)}
                      </span>
                    </div>

                    {evt.meetUrl && (
                      <a
                        href={evt.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: DeepSeek AI Meeting Summarizer Tool */}
        <div className="lg:col-span-5 bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:to-[#121b2d] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">DeepSeek AI Call Summarizer</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste raw call notes or voice transcript to extract summary & action items.
              </p>
            </div>
          </div>

          <form onSubmit={handleRunAiSummarizer} className="space-y-3">
            {/* Associate with Lead */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link to Lead / Client (Optional)
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200"
              >
                <option value="">-- No specific lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company || l.name} ({l.serviceType.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Raw Notes Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Raw Meeting Notes / Transcript
              </label>
              <textarea
                id="raw-meeting-notes-input"
                rows={5}
                value={rawMeetingNotes}
                onChange={(e) => setRawMeetingNotes(e.target.value)}
                placeholder="Paste client requirements, technical notes, or audio transcription..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              id="summarize-notes-btn"
              type="submit"
              disabled={isSummarizing || !rawMeetingNotes.trim()}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSummarizing ? 'Analyzing with DeepSeek...' : 'Summarize & Extract Actions'}</span>
            </button>
          </form>

          {/* AI Result Card */}
          {summaryResult && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
              <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Executive Summary</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{summaryResult.summary}</p>
              </div>

              {summaryResult.actionItems.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Action Items Extracted</div>
                  <ul className="space-y-1.5">
                    {summaryResult.actionItems.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                <strong>Suggested Next Step: </strong>
                Follow up in {summaryResult.suggestedNextFollowUpDays} days regarding: "{summaryResult.followUpAgenda}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
