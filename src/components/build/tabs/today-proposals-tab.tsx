'use client';

import { todayProposals, executionHistory } from '@/lib/mock-data/build';
import { ProposalCard } from '@/components/build/proposal-card';
import { ExecutionHistoryTable } from '@/components/build/execution-history-table';

interface TodayProposalsTabProps {
  done: Record<string, boolean>;
  onExecute: (id: string) => void;
}

export function TodayProposalsTab({ done, onExecute }: TodayProposalsTabProps) {
  const pendingCount  = todayProposals.filter(p => !done[p.id]).length;
  const finishedCount = todayProposals.filter(p =>  done[p.id]).length;

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '未処理の提案', value: pendingCount,  unit: '件', color: 'text-[#1e3a8a]' },
          { label: '完了済み',     value: finishedCount, unit: '件', color: 'text-emerald-600' },
          { label: '実行率',       value: todayProposals.length > 0 ? Math.round((finishedCount / todayProposals.length) * 100) : 0, unit: '%', color: 'text-amber-600' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>
              {value}<span className="text-base font-medium ml-0.5">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Proposal cards */}
      <div className="space-y-3">
        {todayProposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isDone={!!done[proposal.id]}
            onExecute={onExecute}
          />
        ))}
      </div>

      {/* Execution history */}
      <ExecutionHistoryTable records={executionHistory} />
    </div>
  );
}
