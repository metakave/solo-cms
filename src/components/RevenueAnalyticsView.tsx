'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Lead, RevenueMetrics } from '@/types/crm';

interface RevenueAnalyticsViewProps {
  leads: Lead[];
  metrics: RevenueMetrics | null;
  onSelectLead: (lead: Lead) => void;
}

export const RevenueAnalyticsView: React.FC<RevenueAnalyticsViewProps> = ({
  leads,
  metrics,
  onSelectLead,
}) => {
  if (!metrics) return null;

  // Flatten all milestones from all leads
  const allMilestones = leads.flatMap((l) =>
    (l.milestones || []).map((m) => ({
      ...m,
      clientName: l.company || l.name,
      serviceType: l.serviceType,
      leadRef: l,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Overview Ribbon */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-lg transition-colors">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Cashflow Analytics</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor financial progress across Odoo implementations, training batches, and monthly advisory retainers.
        </p>
      </div>

      {/* 3-Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stream 1: Odoo Consulting */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Odoo Consulting</h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Implementations & Customization</div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
              {metrics.serviceBreakdown.ODOO_CONSULTING.count} Deals
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Pipeline Value:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                ৳{metrics.serviceBreakdown.ODOO_CONSULTING.totalValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Realized Cash:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                ৳{metrics.serviceBreakdown.ODOO_CONSULTING.collected.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stream 2: Training Batches */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Training Batches</h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Corporate Bootcamps & Workshops</div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
              {metrics.serviceBreakdown.TRAINING.count} Batches
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Pipeline Value:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                ৳{metrics.serviceBreakdown.TRAINING.totalValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Realized Cash:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                ৳{metrics.serviceBreakdown.TRAINING.collected.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stream 3: Advisory Retainers */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Advisory Retainers</h3>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Fractional CTO & Architecture</div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
              {metrics.serviceBreakdown.ADVISORY.count} Retainers
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Monthly Run-rate:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                ৳{metrics.serviceBreakdown.ADVISORY.totalValue.toLocaleString()}/mo
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Realized Cash:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                ৳{metrics.serviceBreakdown.ADVISORY.collected.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Milestones Tracker Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs dark:shadow-lg space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Client Milestone Schedule & Invoices ({allMilestones.length})
        </h3>

        {allMilestones.length === 0 ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
            No milestones configured. Open a lead to break down its delivery payments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Milestone Title</th>
                  <th className="py-3 px-4">Stream</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {allMilestones.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200">{m.clientName}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{m.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {m.serviceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ৳{m.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.status === 'PAID'
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                            : m.status === 'INVOICED'
                            ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{m.invoiceNumber || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectLead(m.leadRef)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
