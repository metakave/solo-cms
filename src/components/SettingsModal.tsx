'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Sparkles,
  Calendar,
  Key,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [deepseekKey, setDeepseekKey] = useState('');
  const [zohoIcalUrl, setZohoIcalUrl] = useState('');
  const [hermesKey, setHermesKey] = useState('');
  const [isDeepSeekConfigured, setIsDeepSeekConfigured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) {
            setDeepseekKey(data.settings.DEEPSEEK_API_KEY || '');
            setZohoIcalUrl(data.settings.ZOHO_CALENDAR_ICAL_URL || '');
            setHermesKey(data.settings.HERMES_API_KEY || 'hermes-crm-secret-2026');
            setIsDeepSeekConfigured(data.settings.DEEPSEEK_CONFIGURED === 'true');
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          DEEPSEEK_API_KEY: deepseekKey.includes('...') ? undefined : deepseekKey,
          ZOHO_CALENDAR_ICAL_URL: zohoIcalUrl,
          HERMES_API_KEY: hermesKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (onSaved) onSaved();
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1626] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">SoloCRM Integrations & Settings</h2>
              <p className="text-xs text-slate-400">Configure your DeepSeek AI, Zoho Calendar, and Hermes credentials.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* DeepSeek API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>DeepSeek API Key</span>
              </label>
              <a
                href="https://platform.deepseek.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              id="settings-deepseek-key-input"
              type="password"
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400">
              Powers automated lead scoring, executive meeting summaries, and high-converting follow-up drafts.
            </p>
          </div>

          {/* Zoho Calendar iCal Feed URL */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zoho Calendar iCal Feed URL</span>
            </label>
            <input
              id="settings-zoho-ical-input"
              type="url"
              value={zohoIcalUrl}
              onChange={(e) => setZohoIcalUrl(e.target.value)}
              placeholder="https://calendar.zoho.com/eventreq/..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Paste your Zoho Calendar private iCal subscription link (from Zoho Calendar Settings &gt; Calendars &gt; Export/Subscribe) to sync schedule.
            </p>
          </div>

          {/* Hermes Secret Key */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Hermes Agent API Key</span>
            </label>
            <input
              type="text"
              value={hermesKey}
              onChange={(e) => setHermesKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              required
            />
            <p className="text-[11px] text-slate-400">
              Required header <code>x-hermes-key</code> for external Hermes Agent requests.
            </p>
          </div>

          {/* Save Status & Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">Settings stored locally in SQLite</span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                id="save-settings-btn"
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
