'use client';

import { type SlowMoveItem } from '@/lib/mock-data/inventory';
import { StagnantProductCard } from '@/components/inventory/stagnant-product-card';

interface StagnantAlertTabProps {
  slowMoveItems: SlowMoveItem[];
  expandedActions: Record<string, string>;
  loadingAI: Record<string, boolean>;
  onFetchAIAdvice: (key: string, prompt: string) => void;
  onGoToMarketing: () => void;
}

export function StagnantAlertTab({
  slowMoveItems,
  expandedActions,
  loadingAI,
  onFetchAIAdvice,
  onGoToMarketing,
}: StagnantAlertTabProps) {
  const dangerCount  = slowMoveItems.filter(i => i.level === 'danger').length;
  const warningCount = slowMoveItems.filter(i => i.level === 'warning').length;
  const normalCount  = slowMoveItems.filter(i => i.level === 'normal').length;

  return (
    <div className="space-y-4">
      {/* 凡例 */}
      <div className="flex items-center gap-6 text-xs flex-wrap">
        {[
          { color: '#ef4444', label: `危険（60日超）: ${dangerCount}品`    },
          { color: '#f59e0b', label: `注意（30〜60日）: ${warningCount}品` },
          { color: '#10b981', label: `正常（30日以内）: ${normalCount}品`  },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* アラートバナー */}
      {dangerCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-amber-800">
            ⚠️ <b>{dangerCount}品目</b>が危険水準の滞留在庫です。キャッシュフローへの影響を確認してください。
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {slowMoveItems.map(item => (
          <StagnantProductCard
            key={item.id}
            item={item}
            expandedAction={expandedActions[`slow-${item.id}`]}
            loadingAI={!!loadingAI[`slow-${item.id}`]}
            onFetchAIAdvice={onFetchAIAdvice}
            onGoToMarketing={onGoToMarketing}
          />
        ))}
      </div>
    </div>
  );
}
