'use client';

import { type RatingBar, RATING_MAX_COUNT } from '@/lib/mock-data/customer';

const MAX_BAR_HEIGHT_PX = 160;

interface RatingBarChartProps {
  data: RatingBar[];
}

export function RatingBarChart({ data }: RatingBarChartProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-4">評価分布</p>
      <div className="flex items-end gap-3">
        {data.map((item) => {
          const heightPct = Math.min(Math.max((item.count / RATING_MAX_COUNT) * 100, 0), 100);
          return (
            <div key={item.stars} className="flex flex-col items-center gap-2">
              {/* 件数ラベル */}
              <span className="text-xs font-bold text-slate-700">{item.count}</span>
              {/* バートラック（overflow-hidden は付けない） */}
              <div
                className="w-10 bg-slate-100 rounded-t-lg relative flex items-end"
                style={{ height: `${MAX_BAR_HEIGHT_PX}px` }}
              >
                {/* フィル */}
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height:          `${heightPct}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              {/* 星ラベル */}
              <span className="text-[10px] text-amber-500 font-semibold">
                {'★'.repeat(item.stars)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
