'use client';

import React from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  Bot,
  Settings,
  Search,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Layers,
  BellRing,
  Lock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  selectedService: string;
  onSelectService: (service: string) => void;
  activeView: 'KANBAN' | 'FOLLOWUPS' | 'CALENDAR' | 'REVENUE';
  onSelectView: (view: 'KANBAN' | 'FOLLOWUPS' | 'CALENDAR' | 'REVENUE') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewLead: () => void;
  onOpenHermes: () => void;
  onOpenSettings: () => void;
  dueTodayCount: number;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  selectedService,
  onSelectService,
  activeView,
  onSelectView,
  searchQuery,
  onSearchChange,
  onOpenNewLead,
  onOpenHermes,
  onOpenSettings,
  dueTodayCount,
}) => {
  const { logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-3.5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <img
            src="/crm.png"
            alt="SoloCRM Logo"
            className="w-10 h-10 rounded-xl object-contain shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-0.5"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Solo<span className="text-emerald-600 dark:text-emerald-400 font-extrabold">CRM</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                Odoo & Trainer Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI-Powered by DeepSeek • Solopreneur Pipeline & Revenue
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads, clients, tags, or Odoo modules..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/90 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Switcher */}
          <ThemeToggle />

          <button
            id="open-hermes-btn"
            onClick={onOpenHermes}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 rounded-xl transition-all shadow-sm active:scale-95"
            title="Hermes Agent API & Tool Manifest"
          >
            <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Hermes Agent</span>
          </button>

          <button
            id="lock-crm-btn"
            onClick={logout}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700/60 hover:border-rose-300 dark:hover:border-rose-900/50 rounded-xl transition-all active:scale-95"
            title="Lock CRM Workspace (Requires Passcode)"
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all active:scale-95"
            title="Configure DeepSeek, Zoho Calendar & Keys"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="add-lead-btn"
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Sub-nav: View Navigation & Service Filters */}
      <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            id="view-kanban-tab"
            onClick={() => onSelectView('KANBAN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'KANBAN'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pipeline Kanban</span>
          </button>

          <button
            id="view-followups-tab"
            onClick={() => onSelectView('FOLLOWUPS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'FOLLOWUPS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Today's Follow-ups</span>
            {dueTodayCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                {dueTodayCount}
              </span>
            )}
          </button>

          <button
            id="view-calendar-tab"
            onClick={() => onSelectView('CALENDAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'CALENDAR'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar & Zoho Sync</span>
          </button>

          <button
            id="view-revenue-tab"
            onClick={() => onSelectView('REVENUE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'REVENUE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue & Milestones</span>
          </button>
        </div>

        {/* Service Stream Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Stream:</span>
          {[
            { id: 'ALL', label: 'All Streams' },
            { id: 'ODOO_CONSULTING', label: 'Odoo Consulting', icon: Briefcase },
            { id: 'TRAINING', label: 'Training Batches', icon: GraduationCap },
            { id: 'ADVISORY', label: 'Advisory Retainers', icon: Sparkles },
          ].map((item) => {
            const isSelected = selectedService === item.id;
            return (
              <button
                key={item.id}
                id={`filter-stream-${item.id.toLowerCase()}`}
                onClick={() => onSelectService(item.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-slate-700/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.icon && <item.icon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
