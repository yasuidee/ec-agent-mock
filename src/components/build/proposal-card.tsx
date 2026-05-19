'use client';

import { type Proposal } from '@/lib/mock-data/build';

const PRIORITY_BAR: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-slate-300',
};

const PRIORITY_TAG: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-slate-100 text-slate-500',
};

const PRIORITY_LABEL: Record<string, string> = {
  high:   '高',
  medium: '中',
  low:    '低',
};

const TAG_BADGE: Record<string, string> = {
  'ビルド': 'bg-blue-100 text-blue-700',
  'SEO':    'bg-purple-100 text-purple-700',
  '価格':   'bg-emerald-100 text-emerald-700',
};

interface ProposalCardProps {
  proposal: Proposal;
  isDone: boolean;
  onExecute: (id: string) => void;
}

export function ProposalCard({ proposal, isDone, onExecute }: ProposalCardProps) {
  return (
    <div
      className={`flex items-stretch border rounded-2xl shadow-sm overflow-hidden transition ${
        isDone
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-slate-200 hover:border-[#1e3a8a]/30'
      }`}
    >
      {/* Left accent bar */}
      <div className={`w-1 shrink-0 self-stretch ${PRIORITY_BAR[proposal.priority]}`} />

      {/* Content */}
      <div className="flex flex-1 items-center justify-between px-5 py-4 gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{proposal.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_TAG[proposal.priority]}`}
              >
                優先度{PRIORITY_LABEL[proposal.priority]}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  TAG_BADGE[proposal.tag] ?? 'bg-slate-100 text-slate-600'
                }`}
              >
                {proposal.tag}
              </span>
            </div>
            <p
              className={`text-sm font-semibold ${
                isDone ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}
            >
              {proposal.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{proposal.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold ${proposal.effectColor}`}>
            {proposal.effect}
          </span>
          {isDone ? (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              ✓ 完了
            </span>
          ) : (
            <button
              onClick={() => onExecute(proposal.id)}
              className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap"
            >
              実行する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
