'use client';

import { Download, RefreshCw } from 'lucide-react';

type Period = '今週' | '今月' | '過去90日';

interface AnalyticsTopbarProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
}

const PERIODS: Period[] = ['今週', '今月', '過去90日'];

export function AnalyticsTopbar({ period, onPeriodChange }: AnalyticsTopbarProps) {
  return (
    <div className="-mx-8 -mt-8 mb-6 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-4">
      {/* Left: title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1e3a8a] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">分析AI</h1>
          <p className="text-xs text-slate-500">売上分析・経営診断・目標達成プランをAIが可視化します</p>
        </div>
      </div>

      {/* Right: period selector + actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Period toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p
                  ? 'bg-white text-[#1e3a8a] shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw size={13} />
          更新
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 transition-colors">
          <Download size={13} />
          CSV
        </button>
      </div>
    </div>
  );
}
