'use client';

import { strengthPoints } from '@/lib/mock-data/customer';

interface StrengthGridProps {
  onAddToProductPage: (label: string) => void;
}

export function StrengthGrid({ onAddToProductPage }: StrengthGridProps) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
      <h3 className="text-base font-bold text-emerald-800 mb-1">
        ✨ 顧客が評価している強み
      </h3>
      <p className="text-xs text-emerald-700 mb-5">
        ポジティブレビューから抽出した訴求ポイントです。商品ページに活用してください。
      </p>
      <div className="grid grid-cols-3 gap-4">
        {strengthPoints.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-emerald-200 rounded-xl p-4 space-y-2"
          >
            <p className="text-sm font-bold text-emerald-700">{s.label}</p>
            <p className="text-xs text-slate-400">{s.count}件のレビューで言及</p>
            <button
              onClick={() => onAddToProductPage(s.label)}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700
                         rounded-lg px-3 py-1.5 text-[11px] font-semibold
                         transition w-full text-left"
            >
              商品ページに追加する
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
