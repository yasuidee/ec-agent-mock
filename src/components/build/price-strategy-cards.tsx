'use client';

import { priceStrategies } from '@/lib/mock-data/build';

export function PriceStrategyCards() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900">💡 AI推奨価格戦略</h3>
      <div className="grid grid-cols-3 gap-4">
        {priceStrategies.map((strategy) => (
          <div
            key={strategy.label}
            className={`relative bg-white border rounded-2xl overflow-hidden shadow-sm ${
              strategy.isRecommended
                ? 'border-[#1e3a8a]'
                : 'border-slate-200'
            }`}
          >
            {/* Top accent bar */}
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: strategy.accentColor }}
            />

            <div className="p-5 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl">{strategy.icon}</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">{strategy.label}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${strategy.accentColor}20`,
                    color: strategy.accentColor,
                  }}
                >
                  {strategy.tag}
                </span>
              </div>

              {/* Price */}
              <div>
                <p
                  className="text-3xl font-bold"
                  style={{ color: strategy.accentColor }}
                >
                  {strategy.price}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{strategy.margin}</p>
              </div>

              {/* Points */}
              <ul className="space-y-1">
                {strategy.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: strategy.accentColor }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended badge */}
            {strategy.isRecommended && (
              <div
                className="absolute top-4 right-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-l-full"
                style={{ backgroundColor: strategy.accentColor }}
              >
                AI推奨
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
