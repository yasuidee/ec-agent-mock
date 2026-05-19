'use client';

export function CashflowTopbar() {
  return (
    <div className="-mx-8 -mt-8 mb-6 h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      {/* Left: Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 leading-tight">入金・手数料管理</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Shopify入金スケジュール・手数料・6ヶ月キャッシュフロー予測
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          ⬇ CSV出力
        </button>
        <button className="bg-amber-400 hover:bg-amber-500 text-white rounded-lg px-4 py-2 text-xs font-bold transition-colors">
          ✨ 資金改善を相談
        </button>
      </div>
    </div>
  );
}
