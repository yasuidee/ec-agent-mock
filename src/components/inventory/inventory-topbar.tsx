'use client';

interface InventoryTopbarProps {
  criticalCount: number;
}

export function InventoryTopbar({ criticalCount }: InventoryTopbarProps) {
  return (
    <div className="-mx-8 -mt-8 mb-6 h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">在庫AI</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          在庫切れ予報・発注最適化・滞留在庫を自動管理します
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-red-700">危機的 {criticalCount}品目</span>
          </div>
        )}
        <button className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
          ← ダッシュボードに戻る
        </button>
      </div>
    </div>
  );
}
