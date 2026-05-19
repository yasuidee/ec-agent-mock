'use client';

import { executionHistory, channelColors } from '@/lib/mock-data/marketing';

export function ExecutionHistoryTable() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-4">実行履歴</h3>

      {/* カラムヘッダー */}
      <div className="bg-slate-50 rounded-lg px-4 py-2.5 grid grid-cols-[160px_1fr_120px_140px] text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
        <span>実行日時</span>
        <span>施策内容</span>
        <span>チャネル</span>
        <span>結果</span>
      </div>

      <div className="divide-y divide-slate-50">
        {executionHistory.map((row, i) => {
          const color = channelColors[row.channel];
          return (
            <div
              key={i}
              className={`grid grid-cols-[160px_1fr_120px_140px] px-4 py-3 items-center text-xs ${
                i % 2 === 1 ? 'bg-slate-50/60' : ''
              }`}
            >
              <span className="text-slate-400">{row.date}</span>
              <span className="font-medium text-slate-800">{row.action}</span>
              {/* チャネルバッジ — チャネルカラーで塗り分け */}
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 w-fit text-[10px] font-semibold"
                style={{
                  backgroundColor: `${color}18`,
                  color: color,
                }}
              >
                {row.channel}
              </span>
              <span className="font-semibold text-slate-800">{row.result}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
