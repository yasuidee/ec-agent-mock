'use client';

import {
  type OrderRecommendation,
  urgencyBadgeClass,
  urgencyLabel,
} from '@/lib/mock-data/inventory';

interface OrderProductCardProps {
  item: OrderRecommendation;
  qty: number;
  isOverridden: boolean;
  expandedAction?: string;
  loadingAI: boolean;
  onQtyChange: (id: string, val: number) => void;
  onResetQty: (id: string) => void;
  onFetchAIAdvice: (key: string, prompt: string) => void;
}

export function OrderProductCard({
  item,
  qty,
  isOverridden,
  expandedAction,
  loadingAI,
  onQtyChange,
  onResetQty,
  onFetchAIAdvice,
}: OrderProductCardProps) {
  const cost = qty * item.unitCost;

  const cardBg =
    item.urgency === 'critical' ? 'bg-red-50 border-red-200' :
    item.urgency === 'urgent'   ? 'bg-amber-50 border-amber-200' :
    item.urgency === 'warning'  ? 'bg-amber-50 border-amber-200' :
    'bg-white border-slate-200';

  return (
    <div className={`border rounded-2xl shadow-sm p-5 space-y-3 ${cardBg}`}>
      {/* 1段目: 商品名 */}
      {/* ⚠️ Fix #3: flex-wrap で重なり防止 */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <span className="text-base font-bold text-slate-900">{item.name}</span>
        <span className="text-xs text-slate-400 shrink-0">{item.sku}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${urgencyBadgeClass(item.urgency)}`}>
          ● {urgencyLabel(item.urgency)}
        </span>
      </div>

      {/* 2段目: スタッツ */}
      <p className="text-xs text-slate-500">
        在庫: {item.currentStock}個　週販: {item.weeklyVelocity}個　LT: {item.leadTimeDays}日
        仕入単価: ¥{item.unitCost.toLocaleString()}
      </p>

      {/* 3段目: 発注数入力 + 発注金額 */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-slate-600 shrink-0">発注数:</span>
        {/* ⚠️ Fix #5: w-20 = 80px（Figmaの崩れ値 19px は使わない）*/}
        <input
          type="number"
          value={qty}
          min={0}
          onChange={e => onQtyChange(item.id, Math.max(0, parseInt(e.target.value) || 0))}
          className="w-20 h-9 border border-slate-300 rounded-lg text-center text-sm font-bold text-slate-900 bg-white focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] focus:outline-none"
        />
        <span className="text-xs text-slate-500 shrink-0">個</span>
        {isOverridden && (
          <button
            onClick={() => onResetQty(item.id)}
            className="text-xs text-slate-400 underline hover:text-slate-600"
          >
            推奨値に戻す({item.recommendedQty}個)
          </button>
        )}
        <button
          onClick={() =>
            onFetchAIAdvice(
              `order-${item.id}`,
              `商品: ${item.name}、現在庫: ${item.currentStock}個、週間販売: ${item.weeklyVelocity}個、推奨発注数: ${item.recommendedQty}個、リードタイム: ${item.leadTimeDays}日。この発注量の妥当性と注意点を教えてください。`
            )
          }
          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
        >
          {loadingAI ? '⏳' : expandedAction ? '▲ 閉じる' : '✨ AI分析'}
        </button>
        <div className="ml-auto text-right shrink-0">
          <p className="text-xl font-bold text-[#1e3a8a]">¥{cost.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">発注金額</p>
        </div>
      </div>

      {expandedAction && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-slate-700 whitespace-pre-line">
          <span className="font-semibold text-blue-700">✨ AI 分析</span>
          <p className="mt-1">{expandedAction}</p>
        </div>
      )}
    </div>
  );
}
