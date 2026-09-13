'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Copy,
  Check,
  Code,
  Sparkles,
  Zap,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface HermesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadIngested?: () => void;
}

export const HermesModal: React.FC<HermesModalProps> = ({
  isOpen,
  onClose,
  onLeadIngested,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedTools, setCopiedTools] = useState(false);
  const [toolsJson, setToolsJson] = useState<string>('');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const hermesKey = 'hermes-crm-secret-2026';

  useEffect(() => {
    if (isOpen) {
      fetch('/api/hermes/v1/tools')
        .then((res) => res.json())
        .then((data) => setToolsJson(JSON.stringify(data.tools, null, 2)))
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const handleTestHermesLead = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/hermes/v1/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hermes-key': hermesKey,
        },
        body: JSON.stringify({
          name: 'David Thorne (Ingested by Hermes)',
          company: 'EuroLogistics Solutions',
          email: 'd.thorne@eurologistics.example',
          phone: '+447700900123',
          serviceType: 'ODOO_CONSULTING',
          dealValue: 12000,
          notes: 'Inbound WhatsApp request: Needs Odoo 18 Multi-warehouse routing and carrier shipping API integration.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus(`✅ Success! Hermes Agent ingested lead: "${data.lead.name}" with AI score ${data.lead.aiScore}/100.`);
        if (onLeadIngested) onLeadIngested();
      } else {
        setTestStatus(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setTestStatus(`❌ Request failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const sampleCurl = `curl -X POST https://<your-domain>/api/hermes/v1/leads \\
  -H "Content-Type: application/json" \\
  -H "x-hermes-key: ${hermesKey}" \\
  -d '{
    "name": "Sarah Miller",
    "company": "Nordic Retail",
    "serviceType": "ODOO_CONSULTING",
    "dealValue": 8500,
    "notes": "Needs Odoo POS barcode scanning"
  }'`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Hermes Agent Integration Hub</span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Effortless plug-and-play REST API & Function Calling tools for your autonomous Hermes Agent.
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

        {/* Secret Key Strip */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Hermes Secret Key (Header: x-hermes-key)
            </div>
            <div className="font-mono text-indigo-700 dark:text-indigo-300 mt-0.5 font-bold">{hermesKey}</div>
          </div>
          <button
            onClick={() => handleCopy(hermesKey, setCopiedKey)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all border border-slate-200 dark:border-slate-700"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Live Test Trigger */}
        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Simulate Hermes Inbound Lead</span>
            </div>
            <button
              onClick={handleTestHermesLead}
              disabled={isTesting}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
            >
              {isTesting ? 'Ingesting...' : 'Send Test Lead'}
            </button>
          </div>
          <p className="text-[11px] text-purple-900/70 dark:text-purple-200/70">
            Clicking this sends a test payload with auth to <code>/api/hermes/v1/leads</code>, scores it with DeepSeek, and adds it to your pipeline.
          </p>
          {testStatus && (
            <div className="text-xs p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-900/60 text-slate-800 dark:text-slate-200 font-mono">
              {testStatus}
            </div>
          )}
        </div>

        {/* Quick Sample Curl */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Sample cURL Command</span>
            </label>
            <button
              onClick={() => handleCopy(sampleCurl, setCopiedCurl)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              {copiedCurl ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto">
            {sampleCurl}
          </pre>
        </div>

        {/* Function Calling Tool Schemas */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Hermes / OpenAI Tool Schemas</span>
            </label>
            <button
              onClick={() => handleCopy(toolsJson, setCopiedTools)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              {copiedTools ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTools ? 'Copied Schemas' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-mono text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto">
            {toolsJson || 'Loading tool definitions...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
