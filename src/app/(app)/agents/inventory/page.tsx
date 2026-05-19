'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { topProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

// ── 型定義 ─────────────────────────────────────────────────────
import type {
  UrgencyLevel,
  SlowMoveLevel,
  StockForecast,
  OrderRecommendation,
  SlowMoveItem,
} from '@/lib/mock-data/inventory';

// ── 新デザインコンポーネント ──────────────────────────────────
import { InventoryTopbar }         from '@/components/inventory/inventory-topbar';
import { InventoryKpiStrip }       from '@/components/inventory/inventory-kpi-strip';
import { InventoryTabStrip, type InventoryTabKey } from '@/components/inventory/inventory-tab-strip';
import { ShortageForecastTab }     from '@/components/inventory/tabs/shortage-forecast-tab';
import { OrderRecommendationTab }  from '@/components/inventory/tabs/order-recommendation-tab';
import { StagnantAlertTab }        from '@/components/inventory/tabs/stagnant-alert-tab';

// ============================================================
// ヘルパー関数（既存コードから保持）
// ============================================================
function _urgencyBg(u: UrgencyLevel) {
  if (u === 'critical') return 'bg-red-50 border-2 border-red-400 p-5';
  if (u === 'urgent') return 'bg-amber-50 border-2 border-amber-400 p-5';
  if (u === 'warning') return 'bg-amber-50 border border-amber-200 p-4';
  return 'bg-white border border-slate-200 p-4';
}
function _urgencyBadge(u: UrgencyLevel) {
  if (u === 'critical') return 'bg-red-100 text-red-700 border border-red-300';
  if (u === 'urgent') return 'bg-orange-100 text-orange-700 border border-orange-300';
  if (u === 'warning') return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
  return 'bg-green-100 text-green-700 border border-green-300';
}
function _urgencyLabel(u: UrgencyLevel) {
  if (u === 'critical') return '🔴 危機的';
  if (u === 'urgent') return '🟠 緊急';
  if (u === 'warning') return '🟡 注意';
  return '🟢 正常';
}
function _urgencyTextColor(u: UrgencyLevel) {
  if (u === 'critical') return 'text-red-600';
  if (u === 'urgent') return 'text-orange-600';
  if (u === 'warning') return 'text-yellow-600';
  return 'text-green-600';
}
function _slowMoveBg(l: SlowMoveLevel) {
  if (l === 'danger') return 'bg-red-50 border border-red-200 p-5';
  if (l === 'warning') return 'bg-amber-50 border border-amber-200 p-4';
  return 'bg-white border border-slate-200 p-4';
}
function _slowMoveBadge(l: SlowMoveLevel) {
  if (l === 'danger') return 'bg-red-100 text-red-700';
  if (l === 'warning') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
}
function _slowMoveTextColor(l: SlowMoveLevel) {
  if (l === 'danger') return 'text-red-600';
  if (l === 'warning') return 'text-yellow-600';
  return 'text-green-600';
}

// ============================================================
// メインコンポーネント
// ============================================================
export default function InventoryPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ── タブ状態（既存: forecast/order/slowmove → リブランド後: shortage/order/stagnant）
  const [activeTab, setActiveTab] = useState<InventoryTabKey>('shortage');

  // ── タブ1: 在庫切れ予報 ──────────────────────────────────
  const [showNormalItems, setShowNormalItems] = useState(false);

  // ── タブ2: 発注数おすすめ ────────────────────────────────
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(['prod-002', 'prod-005'])
  );
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0);
  const [safetyStockPolicy, setSafetyStockPolicy] = useState<string>('standard');
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [orderQtyOverrides, setOrderQtyOverrides] = useState<Record<string, number>>({});
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderPreviewCopied, setOrderPreviewCopied] = useState(false);

  // ── Shopify在庫連携 ────────────────────────────────────
  const [updatedStocks, setUpdatedStocks] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  // ── AI展開 ─────────────────────────────────────────────
  const [expandedActions, setExpandedActions] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({});

  // ============================================================
  // 計算ロジック（既存 useMemo を完全保持）
  // ============================================================

  // タブ1: 在庫切れ予報
  const forecasts = useMemo<StockForecast[]>(() => {
    const today = new Date();
    return topProducts
      .filter(p => p.currentStock !== undefined)
      .map(p => {
        const cs = p.currentStock!;
        const wv = p.weeklyVelocity!;
        const lt = p.leadTimeDays!;
        const ss = p.safetyStockDays!;
        const dailyVelocity = wv / 7;
        const stockDays = dailyVelocity > 0 ? Math.floor(cs / dailyVelocity) : 999;
        const deadlineDate = new Date(today);
        deadlineDate.setDate(today.getDate() + stockDays - lt - ss);
        const orderDeadlineDays = Math.floor(
          (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        const reorderPoint = Math.ceil(dailyVelocity * (lt + ss));
        let urgency: UrgencyLevel = 'normal';
        if (orderDeadlineDays <= 0) urgency = 'critical';
        else if (orderDeadlineDays <= 3) urgency = 'urgent';
        else if (orderDeadlineDays <= 7) urgency = 'warning';
        return {
          id: p.id, name: p.name, sku: p.sku,
          currentStock: cs, weeklyVelocity: wv,
          leadTimeDays: lt, safetyStockDays: ss,
          stockDays, orderDeadlineDays, urgency,
          reorderPoint, price: p.price, unitCost: p.unitCost!,
        };
      })
      .sort((a, b) => a.orderDeadlineDays - b.orderDeadlineDays);
  }, []);

  // タブ2: 安全在庫倍率
  const safetyMultiplier = useMemo(() => {
    if (safetyStockPolicy === 'conservative') return 1.5;
    if (safetyStockPolicy === 'aggressive') return 0.7;
    return 1.0;
  }, [safetyStockPolicy]);

  // タブ2: 発注推奨
  const orderRecommendations = useMemo<OrderRecommendation[]>(() => {
    const today = new Date();
    return topProducts
      .filter(p => selectedProducts.has(p.id) && p.currentStock !== undefined)
      .map(p => {
        const cs = p.currentStock!;
        const wv = p.weeklyVelocity!;
        const lt = p.leadTimeDays!;
        const ss = p.safetyStockDays!;
        const dailyVelocity = (wv / 7) * demandMultiplier;
        const effectiveSS = Math.ceil(ss * safetyMultiplier);
        const recommendedQty = Math.max(
          0,
          Math.ceil(dailyVelocity * lt + dailyVelocity * effectiveSS - cs)
        );
        const stockDays = dailyVelocity > 0 ? Math.floor(cs / dailyVelocity) : 999;
        const deadlineDate = new Date(today);
        deadlineDate.setDate(today.getDate() + stockDays - lt - effectiveSS);
        const ddDays = Math.floor(
          (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        let urgency: UrgencyLevel = 'normal';
        if (ddDays <= 0) urgency = 'critical';
        else if (ddDays <= 3) urgency = 'urgent';
        else if (ddDays <= 7) urgency = 'warning';
        return {
          id: p.id, name: p.name, sku: p.sku,
          currentStock: cs, weeklyVelocity: wv,
          leadTimeDays: lt, safetyStockDays: ss,
          recommendedQty, urgency,
          unitCost: p.unitCost!, price: p.price,
        };
      });
  }, [selectedProducts, demandMultiplier, safetyMultiplier]);

  // タブ2: 合計金額
  const totalOrderCost = useMemo(() => {
    const budget = parseFloat(budgetLimit);
    const total = orderRecommendations.reduce((sum, r) => {
      const qty = orderQtyOverrides[r.id] !== undefined ? orderQtyOverrides[r.id] : r.recommendedQty;
      return sum + qty * r.unitCost;
    }, 0);
    return { total, overBudget: !isNaN(budget) && total > budget };
  }, [orderRecommendations, orderQtyOverrides, budgetLimit]);

  // タブ3: 滞留在庫
  const slowMoveItems = useMemo<SlowMoveItem[]>(() => {
    return topProducts
      .filter(p => p.currentStock !== undefined && p.turnoverDays !== undefined)
      .map(p => {
        const level: SlowMoveLevel =
          p.turnoverDays! > 60 ? 'danger' : p.turnoverDays! > 30 ? 'warning' : 'normal';
        const stockValue = p.currentStock! * p.unitCost!;
        const suggestion =
          level === 'danger'
            ? '大幅値引きまたはバンドル販売を検討。広告費の削減も推奨。'
            : level === 'warning'
            ? '10〜15%の価格見直し、またはSNS・メルマガでの訴求強化を検討。'
            : '現状維持。引き続き需要をモニタリング。';
        return {
          id: p.id, name: p.name, sku: p.sku,
          currentStock: p.currentStock!, turnoverDays: p.turnoverDays!,
          stockValue, level, suggestion,
          weeklyVelocity: p.weeklyVelocity!, unitCost: p.unitCost!,
        };
      })
      .sort((a, b) => b.turnoverDays - a.turnoverDays);
  }, []);

  // ============================================================
  // イベントハンドラ（既存を完全保持）
  // ============================================================
  function toggleProduct(id: string) {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function fetchAIAdvice(key: string, prompt: string) {
    if (expandedActions[key]) {
      setExpandedActions(prev => { const n = { ...prev }; delete n[key]; return n; });
      return;
    }
    setLoadingAI(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/inventory-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setExpandedActions(prev => ({
        ...prev,
        [key]: data.advice ?? data.error ?? 'アドバイスを取得できませんでした',
      }));
    } catch {
      setExpandedActions(prev => ({
        ...prev,
        [key]: 'AIへの接続に失敗しました。再度お試しください。',
      }));
    } finally {
      setLoadingAI(prev => ({ ...prev, [key]: false }));
    }
  }

  function copyOrderPreview() {
    const lines = orderRecommendations.map(r => {
      const qty = orderQtyOverrides[r.id] !== undefined ? orderQtyOverrides[r.id] : r.recommendedQty;
      return `${r.name} (${r.sku}): ${qty}個 × ¥${r.unitCost.toLocaleString()} = ¥${(qty * r.unitCost).toLocaleString()}`;
    });
    const text = [
      `【発注リスト】${new Date().toLocaleDateString('ja-JP')}`,
      ...lines,
      `合計: ¥${totalOrderCost.total.toLocaleString()}`,
      orderNotes ? `備考: ${orderNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setOrderPreviewCopied(true);
      setTimeout(() => setOrderPreviewCopied(false), 2000);
    });
  }

  function handleApproveOrder() {
    toast({
      title: '✅ 発注内容を承認しました',
      description: `${orderRecommendations.length}品目・合計¥${totalOrderCost.total.toLocaleString()}の発注を受け付けました。`,
    });
    setShowOrderPreview(false);
  }

  // ============================================================
  // 集計値
  // ============================================================
  const visibleForecasts = showNormalItems
    ? forecasts
    : forecasts.filter(f => f.urgency !== 'normal');

  const criticalCount = forecasts.filter(f => f.urgency === 'critical').length;
  const urgentCount   = forecasts.filter(f => f.urgency === 'urgent').length;
  const warningCount  = forecasts.filter(f => f.urgency === 'warning').length;
  const normalCount   = forecasts.filter(f => f.urgency === 'normal').length;

  // 未使用変数（既存コードの参照値）
  const _slowDangerCount = slowMoveItems.filter(i => i.level === 'danger').length;

  // allProducts for chip selector
  const allProducts = topProducts.map(p => ({ id: p.id, name: p.name }));

  // ============================================================
  // レンダリング
  // ============================================================
  return (
    <div className="animate-in fade-in duration-300">

      {/* ── Topbar (flush) ─────────────────────────────────── */}
      <InventoryTopbar criticalCount={criticalCount} />

      <div className="space-y-4">

        {/* ── KPI Strip ──────────────────────────────────────── */}
        <InventoryKpiStrip
          criticalCount={criticalCount}
          urgentCount={urgentCount}
          warningCount={warningCount}
          normalCount={normalCount}
        />

        {/* ── Tab Strip ──────────────────────────────────────── */}
        <InventoryTabStrip activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ★ タブごとに完全独立コンテンツを条件レンダリング
            shadcn TabsContent は使わない（全タブのDOMが残るため）*/}

        {/* ── Tab 1: 在庫切れ予報 ────────────────────────────── */}
        {activeTab === 'shortage' && (
          <ShortageForecastTab
            visibleForecasts={visibleForecasts}
            showNormalItems={showNormalItems}
            onShowNormalItemsChange={setShowNormalItems}
            expandedActions={expandedActions}
            loadingAI={loadingAI}
            onFetchAIAdvice={fetchAIAdvice}
            onTabChange={setActiveTab}
            onSelectProduct={(id) =>
              setSelectedProducts(prev => new Set([...prev, id]))
            }
          />
        )}

        {/* ── Tab 2: 発注数おすすめ ───────────────────────────── */}
        {activeTab === 'order' && (
          <OrderRecommendationTab
            orderRecommendations={orderRecommendations}
            allProducts={allProducts}
            selectedProducts={selectedProducts}
            demandMultiplier={demandMultiplier}
            safetyStockPolicy={safetyStockPolicy}
            budgetLimit={budgetLimit}
            orderQtyOverrides={orderQtyOverrides}
            showOrderPreview={showOrderPreview}
            orderNotes={orderNotes}
            orderPreviewCopied={orderPreviewCopied}
            totalOrderCost={totalOrderCost}
            expandedActions={expandedActions}
            loadingAI={loadingAI}
            updatedStocks={updatedStocks}
            isUpdating={isUpdating}
            isUpdated={isUpdated}
            onToggleProduct={toggleProduct}
            onDemandMultiplierChange={setDemandMultiplier}
            onSafetyStockPolicyChange={setSafetyStockPolicy}
            onBudgetLimitChange={setBudgetLimit}
            onOrderQtyChange={(id, val) =>
              setOrderQtyOverrides(prev => ({ ...prev, [id]: val }))
            }
            onResetOrderQty={(id) =>
              setOrderQtyOverrides(prev => { const n = { ...prev }; delete n[id]; return n; })
            }
            onShowOrderPreviewChange={setShowOrderPreview}
            onOrderNotesChange={setOrderNotes}
            onCopyOrderPreview={copyOrderPreview}
            onApproveOrder={handleApproveOrder}
            onFetchAIAdvice={fetchAIAdvice}
            onUpdatedStockChange={(id, val) =>
              setUpdatedStocks(prev => ({ ...prev, [id]: val }))
            }
            onUpdateShopify={() => {
              setIsUpdating(true);
              setTimeout(() => {
                setIsUpdating(false);
                setIsUpdated(true);
                toast({ title: '✅ 在庫更新の指示書を作成しました。Shopify連携後に自動で反映されます。' });
              }, 1500);
            }}
          />
        )}

        {/* ── Tab 3: 滞留在庫アラート ────────────────────────── */}
        {activeTab === 'stagnant' && (
          <StagnantAlertTab
            slowMoveItems={slowMoveItems}
            expandedActions={expandedActions}
            loadingAI={loadingAI}
            onFetchAIAdvice={fetchAIAdvice}
            onGoToMarketing={() => router.push('/agents/marketing')}
          />
        )}

      </div>
    </div>
  );
}
