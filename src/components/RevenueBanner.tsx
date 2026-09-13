'use client';

import React from 'react';
import { DollarSign, CheckCircle2, Clock, Target, ArrowUpRight } from 'lucide-react';
import { RevenueMetrics } from '@/types/crm';

interface RevenueBannerProps {
  metrics: RevenueMetrics | null;
  onViewRevenueDetails: () => void;
}

export const RevenueBanner: React.FC<RevenueBannerProps> = ({ metrics, onViewRevenueDetails }) => {
  if (!metrics) return null;

  const total = metrics.totalPipelineValue || 1;
  const collectedPct = Math.round((metrics.totalCollected / total) * 100);
  const invoicedPct = Math.round((metrics.totalInvoicedPending / total) * 100);

  return (
    <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900/95 dark:via-slate-900/80 dark:to-[#10192e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl mb-6 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          {/* Total Pipeline */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-medium">Total Pipeline</span>
              <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              ${metrics.totalPipelineValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-300 mt-0.5 font-medium">
              {metrics.activeDealsCount} active client deals
            </div>
          </div>

          {/* Expected Weighted */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-medium">Expected (Weighted)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-xl font-extrabold text-cyan-700 dark:text-cyan-300">
              ${metrics.expectedWeightedRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Probability weighted</div>
          </div>

          {/* Cash Collected */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="font-medium">Realized Cash</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
              ${metrics.totalCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-300/80 mt-0.5 font-medium">
              Milestones cleared & paid
            </div>
          </div>

          {/* Invoiced Pending */}
          <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 mb-1">
              <span className="font-medium">Invoiced & Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400">
              ${metrics.totalInvoicedPending.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-300/80 mt-0.5 font-medium">
              Awaiting client payment
            </div>
          </div>
        </div>

        {/* Progress bar + View Details */}
        <div className="lg:w-72 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Revenue Realization</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{collectedPct}% collected</span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, collectedPct)}%` }}
                className="h-full bg-emerald-500 rounded-l-full"
                title={`Collected: $${metrics.totalCollected}`}
              />
              <div
                style={{ width: `${Math.min(100 - collectedPct, invoicedPct)}%` }}
                className="h-full bg-amber-500"
                title={`Invoiced: $${metrics.totalInvoicedPending}`}
              />
            </div>
          </div>

          <button
            onClick={onViewRevenueDetails}
            className="mt-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center justify-between font-medium group transition-all"
          >
            <span>View Milestones & Forecast</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
