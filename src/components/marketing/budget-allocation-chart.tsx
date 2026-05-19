'use client';

import { budgetItems, MAX_BUDGET } from '@/lib/mock-data/marketing';
import { Check } from 'lucide-react';

// 順位に応じたバー色（深い藍 → 薄い藍）
const BAR_COLORS = [
  '#1e3a8a', '#2d4fa3', '#3d64bb', '#5279c9', '#6389c4',
];

interface BudgetAllocationChartProps {
  budgetExecuted: boolean;
  onExecuteBudget: () => void;
}

export function BudgetAllocationChart({
  budgetExecuted,
  onExecuteBudget,
}: BudgetAllocationChartProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">📊 今週の予算配分提案</h3>
          <p className="text-xs text-slate-400 mt-0.5">ROASと在庫状況を踏まえたAI最適配分</p>
        </div>
      </div>

      {/* バーチャート — divベース、overflow-hidden なし */}
      <div className="space-y-3">
        {budgetItems.map((item, index) => {
          // ★ クランプ必須
          const pct = Math.min(Math.max((item.budget / MAX_BUDGET) * 100, 0), 100);
          return (
            <div key={item.name} className="flex items-center gap-3">
              {/* 商品名 固定幅 */}
              <span className="w-44 text-xs text-slate-600 text-right shrink-0">
                {item.name}
              </span>
              {/* バートラック（overflow-hidden は付けない） */}
              <div className="flex-1 h-7 bg-slate-100 rounded-lg relative">
                {/* フィル: style で幅指定 */}
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: BAR_COLORS[index] ?? '#1e3a8a',
                  }}
                />
              </div>
              {/* 金額 + ROAS */}
              <div className="w-36 shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  ¥{item.budget.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">ROAS {item.roas}倍</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 実行ボタン */}
      <div className="mt-5">
        {budgetExecuted ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-lg">
            <Check size={14} />
            配分を適用しました
          </span>
        ) : (
          <button
            onClick={onExecuteBudget}
            className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-lg px-5 py-2.5 text-sm font-bold transition"
          >
            この配分で実行する
          </button>
        )}
      </div>
    </div>
  );
}
