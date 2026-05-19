'use client';

import { competitorPrices } from '@/lib/mock-data/build';

// MAX_PRICE = 15000 → barWidth(%) = price / 15000 * 100
const MAX_PRICE = 15000;

export function CompetitorPriceChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">📊 競合価格比較</h3>
        <p className="text-xs text-slate-500 mt-0.5">ヒノキカッティングボード — 市場価格ポジション</p>
      </div>

      <div className="space-y-3">
        {competitorPrices.map((item) => {
          const barPct = Math.min((item.price / MAX_PRICE) * 100, 100);
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-medium ${
                    item.isOwn
                      ? 'text-amber-700'
                      : item.isRecommended
                      ? 'text-[#1e3a8a] font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {item.isRecommended && (
                    <span className="inline-block bg-[#1e3a8a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-1.5">
                      AI推奨
                    </span>
                  )}
                  {item.label}
                </span>
                <span
                  className={`font-bold ${
                    item.isOwn
                      ? 'text-amber-700'
                      : item.isRecommended
                      ? 'text-[#1e3a8a]'
                      : 'text-slate-700'
                  }`}
                >
                  ¥{item.price.toLocaleString()}
                </span>
              </div>
              {/* ⚠️ NO overflow-hidden on the bar container */}
              <div className="w-full h-2 bg-slate-100 rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barPct}%`, backgroundColor: item.barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400">
        ※ バー幅は最大¥{MAX_PRICE.toLocaleString()}を基準に表示しています
      </p>
    </div>
  );
}
