'use client';

interface AiImprovementBannerProps {
  customerReport:      string;
  reportLoading:       boolean;
  onGenerateReport:    () => void;
  onNavigateToBuild:   () => void;
  onNavigateToMarketing: () => void;
  onNavigateToInventory: () => void;
}

export function AiImprovementBanner({
  customerReport,
  reportLoading,
  onGenerateReport,
  onNavigateToBuild,
  onNavigateToMarketing,
  onNavigateToInventory,
}: AiImprovementBannerProps) {
  return (
    <div className="bg-[#1e3a8a] rounded-2xl overflow-hidden relative">
      {/* 装飾円 */}
      <div className="absolute right-0 top-0 w-40 h-40 bg-[#3b5db5] rounded-full
                      opacity-40 translate-x-12 -translate-y-12 pointer-events-none" />

      <div className="px-6 py-5 flex items-center justify-between relative z-10">
        <h3 className="text-base font-bold text-white">🌐 AIからの改善提案</h3>
        <button
          onClick={onGenerateReport}
          disabled={reportLoading}
          className="bg-amber-400 hover:bg-amber-300 text-slate-900
                     rounded-lg px-5 py-2.5 text-sm font-bold transition shrink-0
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {reportLoading ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-slate-900
                               border-t-transparent rounded-full animate-spin" />
              生成中...
            </>
          ) : '分析レポートを生成する'}
        </button>
      </div>

      {customerReport && (
        <div className="px-6 pb-6 relative z-10">
          <p className="text-blue-100 text-sm leading-relaxed whitespace-pre-wrap">
            {customerReport}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <button
              onClick={onNavigateToBuild}
              className="bg-[#2d4fa3] hover:bg-[#3b5db5] rounded-lg p-3
                         text-sm text-white transition text-left"
            >
              🏗️ 商品ページを改善する →
            </button>
            <button
              onClick={onNavigateToMarketing}
              className="bg-[#2d4fa3] hover:bg-[#3b5db5] rounded-lg p-3
                         text-sm text-white transition text-left"
            >
              📣 広告・集客を見直す →
            </button>
            <button
              onClick={onNavigateToInventory}
              className="bg-[#2d4fa3] hover:bg-[#3b5db5] rounded-lg p-3
                         text-sm text-white transition text-left"
            >
              📦 在庫・品質を見直す →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
