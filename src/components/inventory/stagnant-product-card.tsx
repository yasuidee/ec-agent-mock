'use client';

import {
  type SlowMoveItem,
  slowMoveBadgeClass,
  slowMoveLabel,
  slowMoveBarColor,
} from '@/lib/mock-data/inventory';

// ⚠️ Figmaデザイン崩れ対策 (Fix #4)
// バーコンテナに pt-4 を付けてラベル分のスペース確保
// 30日ラベル = 25% (30/120)、60日ラベル = 50% (60/120)
// マーカー縦線は top-[-4px] bottom-[-4px] ではみ出させる
const MAX_TURNOVER = 120;

const statusCardBg = {
  danger:  'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  normal:  'bg-white border-slate-200',
} as const;

const statusDayColor = {
  danger:  'text-red-500',
  warning: 'text-amber-500',
  normal:  'text-emerald-500',
} as const;

interface StagnantProductCardProps {
  item: SlowMoveItem;
  expandedAction?: string;
  loadingAI: boolean;
  onFetchAIAdvice: (key: string, prompt: string) => void;
  onGoToMarketing: () => void;
}

export function StagnantProductCard({
  item,
  expandedAction,
  loadingAI,
  onFetchAIAdvice,
  onGoToMarketing,
}: StagnantProductCardProps) {
  const barPct   = Math.min(Math.max((item.turnoverDays / MAX_TURNOVER) * 100, 0), 100);
  const barColor = slowMoveBarColor(item.level);

  return (
    <div className={`border rounded-2xl shadow-sm p-5 space-y-3.5 ${statusCardBg[item.level]}`}>
      {/* 1段目: 商品名 + 回転日数 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-base font-bold text-slate-900">{item.name}</span>
          <span className="text-xs text-slate-400 shrink-0">{item.sku}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${slowMoveBadgeClass(item.level)}`}>
            ● {slowMoveLabel(item.level)}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-3xl font-bold leading-none ${statusDayColor[item.level]}`}>
            {item.turnoverDays}日
          </p>
          <p className="text-[10px] text-slate-400 mt-1">在庫回転日数</p>
        </div>
      </div>

      {/* 2段目: スタッツ */}
      <p className="text-xs text-slate-500">
        現在庫: {item.currentStock}個　週間販売: {item.weeklyVelocity}個/週
        仕入単価: ¥{item.unitCost.toLocaleString()}　在庫資産額: ¥{item.stockValue.toLocaleString()}
      </p>

      {/* 3段目: 回転日数バー
          ★ Fix #4: pt-4 でラベル分のスペース確保、overflow-hidden なし */}
      <div className="relative w-full pt-4">
        {/* 30日ラベル: 25% = 30/120 */}
        <span
          className="absolute top-0 text-[9px] text-slate-400"
          style={{ left: '25%', transform: 'translateX(-50%)' }}
        >
          30日
        </span>
        {/* 60日ラベル: 50% = 60/120 */}
        <span
          className="absolute top-0 text-[9px] text-slate-400"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          60日
        </span>
        {/* バートラック */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full relative">
          {/* フィル: style で幅を指定（動的Tailwindクラスは使わない）*/}
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${barPct}%`, backgroundColor: barColor }}
          />
          {/* 30日マーカー縦線（少しはみ出させる）*/}
          <div
            className="absolute top-[-4px] bottom-[-4px] w-px bg-slate-300"
            style={{ left: '25%' }}
          />
          {/* 60日マーカー縦線 */}
          <div
            className="absolute top-[-4px] bottom-[-4px] w-px bg-slate-400"
            style={{ left: '50%' }}
          />
        </div>
      </div>

      {/* 4段目: 推奨アクション */}
      <div className="flex items-start gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a] shrink-0 mt-1.5" />
        <p className="text-xs text-slate-600">推奨アクション: {item.suggestion}</p>
      </div>

      {/* 5段目: ボタン */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() =>
            onFetchAIAdvice(
              `slow-${item.id}`,
              `商品: ${item.name}、現在庫: ${item.currentStock}個、在庫回転日数: ${item.turnoverDays}日、在庫資産額: ¥${item.stockValue.toLocaleString()}、週間販売: ${item.weeklyVelocity}個。滞留在庫を解消するための具体的な販促・価格戦略を3点提案してください。`
            )
          }
          className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
        >
          {loadingAI
            ? '⏳ 分析中...'
            : expandedAction
            ? '▲ 閉じる'
            : '✨ AI販促提案'}
        </button>
        {item.level !== 'normal' && (
          <button
            onClick={onGoToMarketing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
          >
            → マーケティングエージェントへ
          </button>
        )}
      </div>

      {expandedAction && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-slate-700 whitespace-pre-line">
          <span className="font-semibold text-blue-700">✨ AI 販促提案</span>
          <p className="mt-1">{expandedAction}</p>
        </div>
      )}
    </div>
  );
}
