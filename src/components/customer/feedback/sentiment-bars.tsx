'use client';

import { type SentimentBar } from '@/lib/mock-data/customer';

interface SentimentBarsProps {
  data: SentimentBar[];
}

export function SentimentBars({ data }: SentimentBarsProps) {
  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold text-slate-500">感情分析</p>
      {data.map((item) => {
        const widthPct = Math.min(Math.max(item.pct, 0), 100);
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>
                {item.pct}%
              </span>
            </div>
            {/* バートラック（overflow-hidden は付けない） */}
            <div className="w-full h-3 bg-slate-100 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPct}%`, backgroundColor: item.color }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {item.count}件 / 全{item.total}件
            </p>
          </div>
        );
      })}
    </div>
  );
}
