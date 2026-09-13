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
    <div className="bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-[#10192e] border border-slate-800 rounded-2xl p-4 shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          {/* Total Pipeline */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium">Total Pipeline</span>
              <Target className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-extrabold text-white">
              ${metrics.totalPipelineValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-300 mt-0.5">
              {metrics.activeDealsCount} active client deals
            </div>
          </div>

          {/* Expected Weighted */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium">Expected (Weighted)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-extrabold text-cyan-300">
              ${metrics.expectedWeightedRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Probability weighted</div>
          </div>

          {/* Cash Collected */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
              <span className="font-medium">Realized Cash</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-emerald-400">
              ${metrics.totalCollected.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-0.5">Milestones cleared & paid</div>
          </div>

          {/* Invoiced Pending */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
              <span className="font-medium">Invoiced & Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-amber-400">
              ${metrics.totalInvoicedPending.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">Awaiting client payment</div>
          </div>
        </div>

        {/* Progress bar + View Details */}
        <div className="lg:w-72 bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Revenue Realization</span>
              <span className="text-emerald-400 font-bold">{collectedPct}% collected</span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
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
            className="mt-2.5 text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-between font-medium group transition-all"
          >
            <span>View Milestones & Forecast</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
