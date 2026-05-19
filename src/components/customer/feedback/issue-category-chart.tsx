'use client';

import { type IssueCategory, type IssueSeverity, issueCategories } from '@/lib/mock-data/customer';

const severityColors: Record<IssueSeverity, string> = {
  critical: '#dc2626',
  high:     '#f87171',
  medium:   '#fca5a5',
  none:     '#e2e8f0',
};

const agentBadgeStyles = {
  build:     { bg: 'bg-blue-100',  text: 'text-[#1e3a8a]' },
  marketing: { bg: 'bg-amber-100', text: 'text-amber-700'  },
  info:      { bg: 'bg-red-100',   text: 'text-red-700'    },
} as const;

// MAX_NEG_COUNT = 2
const MAX_NEG_COUNT = 2;

export function IssueCategoryChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-base font-bold text-slate-900">🔴 課題カテゴリ別分析</h3>
      <p className="text-xs text-slate-400 mt-1 mb-5">
        ネガティブ件数が多い順。赤が濃いほど深刻度が高い。
      </p>

      {/* カラムヘッダー */}
      <div className="bg-slate-50 rounded-lg px-4 py-2
                      grid grid-cols-[120px_1fr_180px]
                      text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
        <span>カテゴリ</span>
        <span>ネガティブ分布</span>
        <span>件数 / 詳細</span>
      </div>

      <div className="space-y-1">
        {issueCategories.map((cat: IssueCategory) => {
          const barPct    = Math.min(Math.max((cat.negCount / MAX_NEG_COUNT) * 100, 0), 100);
          const barColor  = severityColors[cat.severity];
          const agentStyle = cat.agentType ? agentBadgeStyles[cat.agentType] : null;

          return (
            <div
              key={cat.name}
              className="grid grid-cols-[120px_1fr_180px] items-center
                         px-4 py-2.5 rounded-lg hover:bg-slate-50/80 transition"
            >
              <span className="text-xs text-slate-700 font-medium">{cat.name}</span>

              {/* バートラック（overflow-hidden は付けない） */}
              <div className="w-full h-4 bg-slate-100 rounded-full mx-4">
                {barPct > 0 && (
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${barPct}%`, backgroundColor: barColor }}
                  />
                )}
              </div>

              <div className="flex items-center gap-2 justify-between">
                <span className="text-[10px] text-slate-400">
                  {cat.negCount}件のネガティブ / 全{cat.total}件
                </span>
                {agentStyle && cat.agentLabel && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold
                                    shrink-0 ${agentStyle.bg} ${agentStyle.text}`}>
                    {cat.agentLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
