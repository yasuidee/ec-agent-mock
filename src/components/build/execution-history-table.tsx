'use client';

import { type ExecutionRecord } from '@/lib/mock-data/build';

interface ExecutionHistoryTableProps {
  records: ExecutionRecord[];
}

export function ExecutionHistoryTable({ records }: ExecutionHistoryTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">実行履歴</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {records.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[160px_1fr_80px_120px] items-center px-6 py-3 hover:bg-slate-50 transition"
          >
            <span className="text-xs text-slate-400 font-mono">{row.date}</span>
            <span className="text-sm text-slate-700">{row.action}</span>
            <div>
              {row.status === 'done' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  ✓ 完了
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  ⏳ 処理中
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-emerald-600 text-right">{row.effect}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
