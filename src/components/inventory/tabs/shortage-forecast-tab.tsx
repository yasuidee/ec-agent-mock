'use client';

import { type StockForecast } from '@/lib/mock-data/inventory';
import { ShortageProductCard } from '@/components/inventory/shortage-product-card';
import { type InventoryTabKey } from '@/components/inventory/inventory-tab-strip';

interface ShortageForecastTabProps {
  visibleForecasts: StockForecast[];
  showNormalItems: boolean;
  onShowNormalItemsChange: (v: boolean) => void;
  expandedActions: Record<string, string>;
  loadingAI: Record<string, boolean>;
  onFetchAIAdvice: (key: string, prompt: string) => void;
  onTabChange: (tab: InventoryTabKey) => void;
  onSelectProduct: (id: string) => void;
}

export function ShortageForecastTab({
  visibleForecasts,
  showNormalItems,
  onShowNormalItemsChange,
  expandedActions,
  loadingAI,
  onFetchAIAdvice,
  onTabChange,
  onSelectProduct,
}: ShortageForecastTabProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          発注リードタイム＋安全在庫を加味した「発注期限」を自動計算します。
        </p>
        <label className="flex items-center gap-2 cursor-pointer border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 transition select-none">
          <input
            type="checkbox"
            checked={showNormalItems}
            onChange={e => onShowNormalItemsChange(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#1e3a8a]"
          />
          正常品目も表示
        </label>
      </div>

      {/* Empty state */}
      {visibleForecasts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-center py-16">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-semibold text-slate-700">すべての商品が正常な在庫水準です</p>
          <p className="text-sm text-slate-400 mt-1">引き続きモニタリングを継続します</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleForecasts.map(item => (
            <ShortageProductCard
              key={item.id}
              item={item}
              expandedAction={expandedActions[item.id]}
              loadingAI={!!loadingAI[item.id]}
              onFetchAIAdvice={onFetchAIAdvice}
              onGoToOrder={(id) => {
                onSelectProduct(id);
                onTabChange('order');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
