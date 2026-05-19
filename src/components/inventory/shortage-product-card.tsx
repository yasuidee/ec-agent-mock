'use client';

import { type StockForecast, urgencyBadgeClass, urgencyLabel } from '@/lib/mock-data/inventory';

// ⚠️ Figmaデザイン崩れ対策
// MAX_DAYS = 60: バー全体のスケール（日数）
// 安全在庫マーカー位置 = (safetyStockDays / MAX_DAYS) * 100 ← 在庫日数ベースにしない
// バーコンテナに overflow-hidden を付けない → mt-5 + absolute bottom-full でラベル表示
const MAX_DAYS = 60;
const clamp = (v: number) => Math.min(Math.max(v, 0), 100);

const cardStyles = {
  critical: { card: 'bg-red-50 border-red-200',    badge: 'bg-red-100 text-red-700'         },
  urgent:   { card: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700'     },
  warning:  { card: 'bg-amber-50 border-amber-200', badge: 'bg-yellow-100 text-yellow-700'   },
  normal:   { card: 'bg-white border-slate-200',    badge: 'bg-emerald-100 text-emerald-700' },
} as const;

interface ShortageProductCardProps {
  item: StockForecast;
  expandedAction?: string;
  loadingAI: boolean;
  onFetchAIAdvice: (key: string, prompt: string) => void;
  onGoToOrder: (id: string) => void;
}

export function ShortageProductCard({
  item,
  expandedAction,
  loadingAI,
  onFetchAIAdvice,
  onGoToOrder,
}: ShortageProductCardProps) {
  const styles = cardStyles[item.urgency];

  // ★ バー計算 — style={{ width:`${pct}%` }} で指定、動的Tailwindクラスは使わない
  const stockBarPct = clamp((item.stockDays / MAX_DAYS) * 100);
  // ★ Fix #1: マーカーは safetyStockDays ベース（在庫日数ベースにしない）
  const markerPct   = clamp((item.safetyStockDays / MAX_DAYS) * 100);
  const salesBarPct = clamp(((item.weeklyVelocity / 7) * MAX_DAYS / (item.currentStock || 1)) * 100);
  const leadBarPct  = clamp((item.leadTimeDays / MAX_DAYS) * 100);
  // 在庫日数が安全在庫を下回っていたら赤
  const bar1Color   = item.stockDays < item.safetyStockDays ? '#ef4444' : '#f59e0b';
  const statusLabel = item.orderDeadlineDays <= 0 ? '超過中' : `${item.orderDeadlineDays}日後`;

  return (
    <div className={`border rounded-2xl shadow-sm p-5 space-y-3.5 ${styles.card}`}>
      {/* 1段目: 商品名 + ステータス */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-base font-bold text-slate-900">{item.name}</span>
          <span className="text-xs text-slate-400 shrink-0">{item.sku}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${urgencyBadgeClass(item.urgency)}`}>
            ● {urgencyLabel(item.urgency)}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="bg-red-100 text-red-700 rounded-lg px-2.5 py-1 text-[10px] font-bold">
            {statusLabel}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">発注期限</p>
        </div>
      </div>

      {/* 2段目: スタッツ */}
      <div className="flex items-center gap-6 flex-wrap">
        {[
          { label: '現在庫',   value: `${item.currentStock}個`,        cls: '' },
          { label: '週間販売', value: `${item.weeklyVelocity}個/週`,   cls: '' },
          { label: '在庫日数', value: `${item.stockDays}日`,
            cls: item.stockDays < item.safetyStockDays ? 'text-red-600 font-bold' : 'text-amber-600 font-bold' },
          { label: 'LT',      value: `${item.leadTimeDays}日`,         cls: '' },
          { label: '安全在庫', value: `${item.safetyStockDays}日分`,   cls: '' },
        ].map(({ label, value, cls }) => (
          <div key={label}>
            <p className="text-[10px] text-slate-400">{label}</p>
            <p className={`text-sm font-semibold text-slate-900 mt-0.5 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* 3段目: 3層プログレスバー ★ 崩れ対策済み */}
      <div className="space-y-1">
        {/* 凡例 */}
        <div className="flex items-center gap-4 text-[9px] text-slate-400 mb-2">
          {[
            { color: bar1Color,  label: '在庫日数'    },
            { color: '#f59e0b',  label: '販売ペース'  },
            { color: '#818cf8',  label: 'リードタイム' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>

        {/* バー1: 在庫日数 + 安全在庫マーカー
            ★ overflow-hidden は付けない; mt-5 でマーカーラベルの空間確保 */}
        <div className="relative w-full mt-5">
          {/* マーカーラベル（バーの上に absolute 配置）*/}
          <div
            className="absolute bottom-full mb-1 flex flex-col items-center pointer-events-none"
            style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
          >
            <span className="text-[9px] text-[#1e3a8a] font-semibold whitespace-nowrap">安全</span>
          </div>
          {/* バートラック（overflow-hidden は絶対に付けない）*/}
          <div className="w-full h-2.5 bg-slate-100 rounded-full relative">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${stockBarPct}%`, backgroundColor: bar1Color }}
            />
            {/* マーカー縦線 */}
            <div
              className="absolute top-[-3px] w-0.5 h-4 bg-[#1e3a8a] rounded-full"
              style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
            />
          </div>
        </div>

        {/* バー2: 販売ペース */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${salesBarPct}%` }}
          />
        </div>

        {/* バー3: リードタイム */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-300"
            style={{ width: `${leadBarPct}%` }}
          />
        </div>
      </div>

      {/* 4段目: アクション */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <p className="text-xs text-slate-500">
          発注点: {item.reorderPoint}個
          {item.currentStock <= item.reorderPoint && (
            <span className="ml-1 font-semibold text-red-600">← 発注点を下回っています</span>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() =>
              onFetchAIAdvice(
                item.id,
                `商品: ${item.name}、現在庫: ${item.currentStock}個、週間販売: ${item.weeklyVelocity}個、リードタイム: ${item.leadTimeDays}日、安全在庫: ${item.safetyStockDays}日。在庫切れリスクへの具体的な対処法を3点で教えてください。`
              )
            }
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] rounded-full px-3 py-1.5 text-xs font-semibold transition"
          >
            {loadingAI
              ? '⏳ 分析中...'
              : expandedAction
              ? '▲ 閉じる'
              : '✨ AIアドバイスを見る'}
          </button>
          {item.urgency !== 'normal' && (
            <button
              onClick={() => onGoToOrder(item.id)}
              className="flex items-center gap-1.5 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-lg px-4 py-2 text-xs font-semibold transition"
            >
              → 発注おすすめへ
            </button>
          )}
        </div>
      </div>

      {/* AI advice */}
      {expandedAction && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-slate-700 whitespace-pre-line">
          <span className="font-semibold text-blue-700">✨ AI アドバイス</span>
          <p className="mt-1">{expandedAction}</p>
        </div>
      )}
    </div>
  );
}
