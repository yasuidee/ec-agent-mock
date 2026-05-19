'use client';

interface MarketingProposalBannerProps {
  onApprove: () => void;
  onSkip: () => void;
}

export function MarketingProposalBanner({ onApprove, onSkip }: MarketingProposalBannerProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
      {/* アンバーアクセントバー 4px */}
      <div className="h-1 w-full bg-amber-400 absolute top-0 left-0" />

      <div className="px-5 pt-5 pb-4 flex items-start gap-4">
        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl shrink-0 mt-0.5">
          💡
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-slate-900">今日の提案</span>
            <span className="bg-amber-100 text-amber-700 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              1つのアクション待ち
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="bg-blue-100 text-[#1e3a8a] rounded-full px-2 py-0.5 text-[9px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              マーケ
            </span>
            <span className="text-sm font-semibold text-slate-900">
              ヒノキカッティングボードの広告予算を +¥10,000 に増額
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
            <span className="font-semibold text-emerald-600">
              週次売上 +¥38,000〜¥50,000（ROAS 3.8 倍基準）
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            直近7日のROASが3.8倍に上昇。在庫も2ヶ月分あり、機会損失リスクが高い
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={onApprove}
            className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-lg px-4 py-2 text-xs font-bold transition"
          >
            承認して実行
          </button>
          <button
            onClick={onSkip}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md px-3 py-1.5 text-xs font-medium transition"
          >
            却下
          </button>
        </div>
      </div>
    </div>
  );
}
