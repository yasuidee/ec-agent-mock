'use client';

export function PriceRangeBar({
  min,
  max,
  median,
  current,
}: {
  min: number;
  max: number;
  median: number;
  current: number;
}) {
  const range = max - min || 1;
  const medianPct  = Math.max(5, Math.min(95, ((median  - min) / range) * 100));
  const currentPct = Math.max(2, Math.min(98, ((current - min) / range) * 100));

  return (
    <div className="pt-8 pb-4">
      <div className="relative">
        <div
          className="absolute -top-7 transform -translate-x-1/2 text-xs font-bold text-blue-900 whitespace-nowrap"
          style={{ left: `${currentPct}%` }}
        >
          ▼ 自社 ¥{current.toLocaleString()}
        </div>
        <div className="h-2 rounded-full bg-slate-200 relative">
          <div
            className="absolute top-0 h-full bg-blue-900 rounded-full"
            style={{ width: `${currentPct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-500 rounded"
            style={{ left: `${medianPct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-900 rounded-full border-2 border-white shadow-md"
            style={{ left: `${currentPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>¥{min.toLocaleString()}</span>
          <span className="text-slate-700 font-medium">中央値 ¥{median.toLocaleString()}</span>
          <span>¥{max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
