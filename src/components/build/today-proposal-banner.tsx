'use client';

import { type Proposal } from '@/lib/mock-data/build';

interface TodayProposalBannerProps {
  proposal: Proposal;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function TodayProposalBanner({
  proposal,
  onApprove,
  onDismiss,
}: TodayProposalBannerProps) {
  return (
    <div className="relative bg-white border border-amber-200 rounded-2xl px-6 py-4 overflow-hidden shadow-sm">
      {/* Amber top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />

      <div className="flex items-center justify-between gap-4 mt-1">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{proposal.icon}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-amber-700 mb-0.5">🌟 今日の最優先提案</p>
            <p className="text-sm font-bold text-slate-900">{proposal.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{proposal.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold ${proposal.effectColor}`}>{proposal.effect}</span>
          <button
            onClick={() => onApprove(proposal.id)}
            className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap"
          >
            承認して実行
          </button>
          <button
            onClick={() => onDismiss(proposal.id)}
            className="text-slate-400 hover:text-slate-600 text-xs px-3 py-2 rounded-full hover:bg-slate-100 transition"
          >
            却下
          </button>
        </div>
      </div>
    </div>
  );
}
