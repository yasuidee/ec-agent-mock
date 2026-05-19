'use client';

import { Sparkles } from 'lucide-react';

interface AiSummaryBannerProps {
  insights?: string[];
}

const DEFAULT_INSIGHTS = [
  'リピーター向けメルマガで月 +¥180,000 の売上増が見込めます',
  'カート離脱率が高い。送料無料ラインを ¥5,000 に下げることを推奨します',
  '休眠顧客 23% へのクーポン配信で約 15% が復帰する予測です',
];

export function AiSummaryBanner({ insights = DEFAULT_INSIGHTS }: AiSummaryBannerProps) {
  return (
    <div className="rounded-2xl bg-[#1e3a8a] px-6 py-5 flex items-start gap-4">
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={18} className="text-amber-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
          AI インサイト
        </p>
        <ul className="space-y-1.5">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-blue-100">
              <span className="text-amber-400 mt-0.5 shrink-0">✦</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
