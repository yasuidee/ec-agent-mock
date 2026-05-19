'use client';

import { type OrderRecommendation } from '@/lib/mock-data/inventory';
import { OrderProductCard } from '@/components/inventory/order-product-card';

interface SelectableProduct { id: string; name: string; }

interface OrderRecommendationTabProps {
  orderRecommendations: OrderRecommendation[];
  allProducts: SelectableProduct[];
  selectedProducts: Set<string>;
  demandMultiplier: number;
  safetyStockPolicy: string;
  budgetLimit: string;
  orderQtyOverrides: Record<string, number>;
  showOrderPreview: boolean;
  orderNotes: string;
  orderPreviewCopied: boolean;
  totalOrderCost: { total: number; overBudget: boolean };
  expandedActions: Record<string, string>;
  loadingAI: Record<string, boolean>;
  // Shopify sync
  updatedStocks: Record<string, number>;
  isUpdating: boolean;
  isUpdated: boolean;
  // Callbacks
  onToggleProduct: (id: string) => void;
  onDemandMultiplierChange: (v: number) => void;
  onSafetyStockPolicyChange: (v: string) => void;
  onBudgetLimitChange: (v: string) => void;
  onOrderQtyChange: (id: string, val: number) => void;
  onResetOrderQty: (id: string) => void;
  onShowOrderPreviewChange: (v: boolean) => void;
  onOrderNotesChange: (v: string) => void;
  onCopyOrderPreview: () => void;
  onApproveOrder: () => void;
  onFetchAIAdvice: (key: string, prompt: string) => void;
  onUpdatedStockChange: (id: string, val: number) => void;
  onUpdateShopify: () => void;
}

export function OrderRecommendationTab({
  orderRecommendations,
  allProducts,
  selectedProducts,
  demandMultiplier,
  safetyStockPolicy,
  budgetLimit,
  orderQtyOverrides,
  showOrderPreview,
  orderNotes,
  orderPreviewCopied,
  totalOrderCost,
  expandedActions,
  loadingAI,
  updatedStocks,
  isUpdating,
  isUpdated,
  onToggleProduct,
  onDemandMultiplierChange,
  onSafetyStockPolicyChange,
  onBudgetLimitChange,
  onOrderQtyChange,
  onResetOrderQty,
  onShowOrderPreviewChange,
  onOrderNotesChange,
  onCopyOrderPreview,
  onApproveOrder,
  onFetchAIAdvice,
  onUpdatedStockChange,
  onUpdateShopify,
}: OrderRecommendationTabProps) {
  return (
    <div className="space-y-5">
      {/* Settings panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">需要倍率</p>
          <select
            value={demandMultiplier}
            onChange={e => onDemandMultiplierChange(parseFloat(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:border-[#1e3a8a] focus:outline-none"
          >
            <option value={0.8}>×0.8（控えめ）</option>
            <option value={1.0}>×1.0（標準）</option>
            <option value={1.2}>×1.2（強気）</option>
            <option value={1.5}>×1.5（積極的）</option>
          </select>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">安全在庫ポリシー</p>
          <select
            value={safetyStockPolicy}
            onChange={e => onSafetyStockPolicyChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:border-[#1e3a8a] focus:outline-none"
          >
            <option value="aggressive">薄め（×0.7）</option>
            <option value="standard">標準（×1.0）</option>
            <option value="conservative">厚め（×1.5）</option>
          </select>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">予算上限（任意）</p>
          <input
            type="number"
            placeholder="例: 500000"
            value={budgetLimit}
            onChange={e => onBudgetLimitChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#1e3a8a] focus:outline-none"
          />
        </div>
      </div>

      {/* Product chips
          ⚠️ Fix #3: flex-wrap で重なりを防ぐ */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3">発注対象商品を選択</p>
        <div className="flex flex-wrap gap-2">
          {allProducts.map(p => (
            <button
              key={p.id}
              onClick={() => onToggleProduct(p.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                selectedProducts.has(p.id)
                  ? 'bg-[#1e3a8a] text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Order cards */}
      {orderRecommendations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-400 text-sm">商品を選択してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderRecommendations.map(item => {
            const qty = orderQtyOverrides[item.id] !== undefined ? orderQtyOverrides[item.id] : item.recommendedQty;
            return (
              <OrderProductCard
                key={item.id}
                item={item}
                qty={qty}
                isOverridden={
                  orderQtyOverrides[item.id] !== undefined &&
                  orderQtyOverrides[item.id] !== item.recommendedQty
                }
                expandedAction={expandedActions[`order-${item.id}`]}
                loadingAI={!!loadingAI[`order-${item.id}`]}
                onQtyChange={onOrderQtyChange}
                onResetQty={onResetOrderQty}
                onFetchAIAdvice={onFetchAIAdvice}
              />
            );
          })}

          {/* Total */}
          <div className={`rounded-2xl px-6 py-4 flex items-center ${
            totalOrderCost.overBudget ? 'bg-red-50 border border-red-300' : 'bg-[#1e3a8a]'
          }`}>
            <div>
              <span className={`font-bold ${totalOrderCost.overBudget ? 'text-slate-900' : 'text-white'}`}>
                発注合計金額
              </span>
              {budgetLimit && (
                <span className={`ml-2 text-xs ${
                  totalOrderCost.overBudget ? 'text-red-600 font-bold' : 'text-blue-200'
                }`}>
                  {totalOrderCost.overBudget
                    ? `⚠️ 予算超過（上限¥${parseFloat(budgetLimit).toLocaleString()}）`
                    : '✅ 予算内'}
                </span>
              )}
            </div>
            <span className={`ml-auto text-2xl font-bold ${
              totalOrderCost.overBudget ? 'text-red-600' : 'text-amber-400'
            }`}>
              ¥{totalOrderCost.total.toLocaleString()}
            </span>
          </div>

          {/* Notes */}
          <input
            type="text"
            placeholder="発注備考（任意）: 急ぎ便希望、など"
            value={orderNotes}
            onChange={e => onOrderNotesChange(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:border-[#1e3a8a] focus:outline-none"
          />

          {/* Preview button */}
          <button
            onClick={() => onShowOrderPreviewChange(!showOrderPreview)}
            className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-2xl py-4 text-base font-bold flex items-center justify-center gap-2 transition"
          >
            <span className="text-amber-400 text-xl leading-none">■</span>
            {showOrderPreview ? '▲ 発注プレビューを閉じる' : '発注プレビューを確認する'}
          </button>

          {/* Order preview */}
          {showOrderPreview && (
            <div className="bg-white border-2 border-[#1e3a8a] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">📋 発注プレビュー</h3>
                <span className="text-xs text-slate-400">{new Date().toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {orderRecommendations.map(item => {
                  const q = orderQtyOverrides[item.id] !== undefined
                    ? orderQtyOverrides[item.id]
                    : item.recommendedQty;
                  return (
                    <div key={item.id} className="py-2 flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 text-xs text-slate-400">{item.sku}</span>
                      </div>
                      <div className="text-right">
                        <span>{q}個 × ¥{item.unitCost.toLocaleString()}</span>
                        <span className="ml-2 font-semibold text-[#1e3a8a]">
                          = ¥{(q * item.unitCost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold">
                <span>合計</span>
                <span className="text-[#1e3a8a]">¥{totalOrderCost.total.toLocaleString()}</span>
              </div>
              {orderNotes && <p className="text-sm text-slate-600">備考: {orderNotes}</p>}
              <div className="flex gap-3">
                <button
                  onClick={onCopyOrderPreview}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  {orderPreviewCopied ? '✅ コピー完了' : '📋 クリップボードにコピー'}
                </button>
                <button
                  onClick={onApproveOrder}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  ✅ この内容で発注承認
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shopify sync */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">🔗 Shopifyに在庫数を反映する</h3>
          <p className="text-xs text-slate-500 mt-1">発注が完了したら、Shopifyの在庫数を更新してください。</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
          <p className="text-xs font-bold text-amber-800">⚠️ Shopify未接続 - 現在モックで動作中</p>
          <p className="text-xs text-amber-600 mt-1">Shopifyと連携すると、ここから直接在庫数を更新できます。</p>
        </div>
        <p className="text-xs text-slate-500">発注完了後の在庫数を入力して更新してください。</p>

        {orderRecommendations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">上で商品を選択してください</p>
        ) : (
          <>
            {orderRecommendations.map(item => {
              const newStock =
                updatedStocks[item.id] !== undefined
                  ? updatedStocks[item.id]
                  : item.currentStock + item.recommendedQty;
              return (
                <div key={item.id} className="bg-slate-50 rounded-xl p-4 flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">現在の在庫: {item.currentStock}個</p>
                    <p className="text-xs text-[#1e3a8a] mt-0.5 font-medium">推奨発注数: +{item.recommendedQty}個</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-[10px] text-slate-400 mb-1.5">発注完了後の在庫数</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <input
                        type="number"
                        value={newStock}
                        min={0}
                        onChange={e => onUpdatedStockChange(item.id, Number(e.target.value))}
                        className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center font-bold text-slate-900 bg-white"
                      />
                      <span className="text-xs text-slate-500">個</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={onUpdateShopify}
              disabled={isUpdating}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-xl py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  更新中...
                </>
              ) : (
                'Shopifyの在庫を更新する'
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400">
              ※この機能は未実装です。Shopify連携後に実際の在庫更新が可能になります。
            </p>

            {isUpdated && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                <p className="font-semibold text-emerald-700">✅ 在庫更新指示書を作成しました</p>
                <div>
                  {orderRecommendations.map(item => {
                    const newStock =
                      updatedStocks[item.id] !== undefined
                        ? updatedStocks[item.id]
                        : item.currentStock + item.recommendedQty;
                    return (
                      <div key={item.id} className="flex justify-between py-2 border-b border-emerald-100 last:border-0 text-sm">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="text-slate-600">{item.currentStock}個 → {newStock}個</span>
                        <span className="text-emerald-600">✅</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm font-semibold text-slate-700">Shopify管理画面で反映する手順:</p>
                <ol className="space-y-1 text-sm text-slate-600 list-decimal list-inside">
                  <li>Shopify管理画面にログイン</li>
                  <li>「商品」→「在庫」を選択</li>
                  <li>各商品の在庫数を上記の数値に更新</li>
                  <li>「保存する」をクリック</li>
                </ol>
                <p className="text-xs text-slate-400">
                  ※Shopify連携が完了すると、この手順は自動化されます。
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
