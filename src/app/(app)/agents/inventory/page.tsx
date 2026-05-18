'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { topProducts } from '@/lib/mock-data';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// 型定義
// ============================================================
type UrgencyLevel = 'critical' | 'urgent' | 'warning' | 'normal';
type SlowMoveLevel = 'danger' | 'warning' | 'normal';

interface StockForecast {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  weeklyVelocity: number;
  leadTimeDays: number;
  safetyStockDays: number;
  stockDays: number;
  orderDeadlineDays: number;
  urgency: UrgencyLevel;
  reorderPoint: number;
  price: number;
  unitCost: number;
}

interface OrderRecommendation {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  weeklyVelocity: number;
  leadTimeDays: number;
  safetyStockDays: number;
  recommendedQty: number;
  urgency: UrgencyLevel;
  unitCost: number;
  price: number;
}

interface SlowMoveItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  turnoverDays: number;
  stockValue: number;
  level: SlowMoveLevel;
  suggestion: string;
  weeklyVelocity: number;
  unitCost: number;
}

// ============================================================
// ヘルパー関数
// ============================================================
function urgencyBg(u: UrgencyLevel) {
  if (u === 'critical') return 'bg-red-50 border-2 border-red-400 p-5';
  if (u === 'urgent') return 'bg-amber-50 border-2 border-amber-400 p-5';
  if (u === 'warning') return 'bg-amber-50 border border-amber-200 p-4';
  return 'bg-white border border-slate-200 p-4';
}
function urgencyBadge(u: UrgencyLevel) {
  if (u === 'critical') return 'bg-red-100 text-red-700 border border-red-300';
  if (u === 'urgent') return 'bg-orange-100 text-orange-700 border border-orange-300';
  if (u === 'warning') return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
  return 'bg-green-100 text-green-700 border border-green-300';
}
function urgencyLabel(u: UrgencyLevel) {
  if (u === 'critical') return '🔴 危機的';
  if (u === 'urgent') return '🟠 緊急';
  if (u === 'warning') return '🟡 注意';
  return '🟢 正常';
}
function urgencyTextColor(u: UrgencyLevel) {
  if (u === 'critical') return 'text-red-600';
  if (u === 'urgent') return 'text-orange-600';
  if (u === 'warning') return 'text-yellow-600';
  return 'text-green-600';
}
function slowMoveBg(l: SlowMoveLevel) {
  if (l === 'danger') return 'bg-red-50 border border-red-200 p-5';
  if (l === 'warning') return 'bg-amber-50 border border-amber-200 p-4';
  return 'bg-white border border-slate-200 p-4';
}
function slowMoveBadge(l: SlowMoveLevel) {
  if (l === 'danger') return 'bg-red-100 text-red-700';
  if (l === 'warning') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
}
function slowMoveTextColor(l: SlowMoveLevel) {
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

  const [activeTab, setActiveTab] = useState('forecast');

  // --- タブ1: 在庫切れ予報 ---
  const [showNormalItems, setShowNormalItems] = useState(false);

  // --- タブ2: 発注数おすすめ ---
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

  // --- Shopify在庫連携 ---
  const [updatedStocks, setUpdatedStocks] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  // --- AI展開 ---
  const [expandedActions, setExpandedActions] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({});

  // ============================================================
  // 計算ロジック (useMemo)
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
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: cs,
          weeklyVelocity: wv,
          leadTimeDays: lt,
          safetyStockDays: ss,
          stockDays,
          orderDeadlineDays,
          urgency,
          reorderPoint,
          price: p.price,
          unitCost: p.unitCost!,
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
  // イベントハンドラ
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
  const urgentCount = forecasts.filter(f => f.urgency === 'urgent').length;
  const warningCount = forecasts.filter(f => f.urgency === 'warning').length;
  const slowDangerCount = slowMoveItems.filter(i => i.level === 'danger').length;

  // ============================================================
  // レンダリング
  // ============================================================
  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <PageHeader
        title="在庫AI"
        description="在庫切れ予報・発注最適化・滞留在庫を自動管理します"
        actions={
          <div className="flex flex-wrap gap-2">
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                🔴 危機的 {criticalCount}品目
              </span>
            )}
            {urgentCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">
                🟠 緊急 {urgentCount}品目
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300">
                🟡 注意 {warningCount}品目
              </span>
            )}
          </div>
        }
      />

      {/* サマリーバー */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-slate-100">
          <div>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-xs text-slate-500 mt-1">今すぐ発注</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">{urgentCount}</div>
            <div className="text-xs text-slate-500 mt-1">3日以内</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
            <div className="text-xs text-slate-500 mt-1">今週中</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{forecasts.filter(f => f.urgency === 'normal').length}</div>
            <div className="text-xs text-slate-500 mt-1">余裕あり</div>
          </div>
        </div>
      </div>

      {/* タブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="forecast">📉 在庫切れ予報</TabsTrigger>
          <TabsTrigger value="order">🛒 発注数おすすめ</TabsTrigger>
          <TabsTrigger value="slowmove">🐌 滞留在庫アラート</TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════
            TAB 1: 在庫切れ予報
        ══════════════════════════════════════════════ */}
        <TabsContent value="forecast" className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-600">
              発注リードタイム＋安全在庫を加味した「発注期限」を自動計算します。
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showNormalItems}
                onChange={e => setShowNormalItems(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              正常品目も表示
            </label>
          </div>

          {visibleForecasts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-medium">すべての商品が正常な在庫水準です</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              {visibleForecasts.map(item => (
                <div
                  key={item.id}
                  className={`rounded-xl ${urgencyBg(item.urgency)}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.sku}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgencyBadge(item.urgency)}`}>
                          {urgencyLabel(item.urgency)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>現在庫: <b className="text-gray-900">{item.currentStock}個</b></span>
                        <span>週間販売: <b className="text-gray-900">{item.weeklyVelocity}個/週</b></span>
                        <span>在庫日数: <b className="text-gray-900">{item.stockDays}日</b></span>
                        <span>LT: <b className="text-gray-900">{item.leadTimeDays}日</b></span>
                        <span>安全在庫: <b className="text-gray-900">{item.safetyStockDays}日分</b></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${urgencyTextColor(item.urgency)}`}>
                        {item.orderDeadlineDays <= 0 ? '超過中' : `${item.orderDeadlineDays}日後`}
                      </div>
                      <div className="text-xs text-gray-500">発注期限</div>
                    </div>
                  </div>

                  {/* タイムライン */}
                  <div className="mt-3 relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-200 rounded-full"
                      style={{ width: `${Math.min(100, (item.stockDays / 30) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full bg-amber-100 rounded-full"
                      style={{ width: `${Math.min(30, (item.leadTimeDays / 30) * 100)}%`, left: `${Math.max(0, Math.min(95, ((item.stockDays - item.leadTimeDays) / 30) * 100))}%` }}
                    />
                    <div className="absolute top-0 left-0 h-full border-l-2 border-red-400 border-dashed" />
                  </div>

                  {/* 発注点表示 + アクション */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-gray-500">
                      発注点: <b>{item.reorderPoint}個</b>
                      {item.currentStock <= item.reorderPoint && (
                        <span className="ml-1 text-red-600 font-semibold">← 発注点を下回っています</span>
                      )}
                    </span>
                    <button
                      onClick={() =>
                        fetchAIAdvice(
                          item.id,
                          `商品: ${item.name}、現在庫: ${item.currentStock}個、週間販売: ${item.weeklyVelocity}個、リードタイム: ${item.leadTimeDays}日、安全在庫: ${item.safetyStockDays}日。在庫切れリスクへの具体的な対処法を3点で教えてください。`
                        )
                      }
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 text-xs font-medium transition-colors"
                    >
                      {loadingAI[item.id]
                        ? '⏳ 分析中...'
                        : expandedActions[item.id]
                        ? '▲ AIアドバイスを閉じる'
                        : '✨ AIアドバイスを見る'}
                    </button>
                    {item.urgency !== 'normal' && (
                      <button
                        onClick={() => {
                          setActiveTab('order');
                          setSelectedProducts(prev => new Set([...prev, item.id]));
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-xs font-medium transition-colors"
                      >
                        → 発注おすすめへ
                      </button>
                    )}
                  </div>

                  {/* AIアドバイス */}
                  {expandedActions[item.id] && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-gray-700 whitespace-pre-line">
                      <span className="font-semibold text-blue-700">✨ AI アドバイス</span>
                      <p className="mt-1">{expandedActions[item.id]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB 2: 発注数おすすめ
        ══════════════════════════════════════════════ */}
        <TabsContent value="order" className="mt-4 space-y-5">
          {/* 設定パネル */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">需要倍率</label>
              <select
                value={demandMultiplier}
                onChange={e => setDemandMultiplier(parseFloat(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              >
                <option value={0.8}>×0.8（控えめ）</option>
                <option value={1.0}>×1.0（標準）</option>
                <option value={1.2}>×1.2（強気）</option>
                <option value={1.5}>×1.5（積極的）</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">安全在庫ポリシー</label>
              <select
                value={safetyStockPolicy}
                onChange={e => setSafetyStockPolicy(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              >
                <option value="aggressive">薄め（×0.7）</option>
                <option value="standard">標準（×1.0）</option>
                <option value="conservative">厚め（×1.5）</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">予算上限（任意）</label>
              <Input
                type="number"
                placeholder="例: 500000"
                value={budgetLimit}
                onChange={e => setBudgetLimit(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* 商品選択チップ */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">発注対象商品を選択</p>
            <div className="flex flex-wrap gap-2">
              {topProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`text-sm transition-colors cursor-pointer ${
                    selectedProducts.has(p.id)
                      ? 'border-2 border-blue-900 bg-blue-50 rounded-xl p-3'
                      : 'border border-slate-200 rounded-xl p-3 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 推奨カード */}
          {orderRecommendations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">商品を選択してください</p>
          ) : (
            <div className="space-y-3">
              {orderRecommendations.map(item => {
                const qty =
                  orderQtyOverrides[item.id] !== undefined
                    ? orderQtyOverrides[item.id]
                    : item.recommendedQty;
                const cost = qty * item.unitCost;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl ${urgencyBg(item.urgency)}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{item.name}</span>
                          <span className="text-xs text-gray-400">{item.sku}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgencyBadge(item.urgency)}`}>
                            {urgencyLabel(item.urgency)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>現在庫: {item.currentStock}個</span>
                          <span>週間: {item.weeklyVelocity}個</span>
                          <span>LT: {item.leadTimeDays}日</span>
                          <span>仕入単価: ¥{item.unitCost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-700">¥{cost.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">発注金額</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">発注数:</span>
                        <Input
                          type="number"
                          value={qty}
                          min={0}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setOrderQtyOverrides(prev => ({ ...prev, [item.id]: val }));
                          }}
                          className="w-24 text-sm text-center"
                        />
                        <span className="text-xs text-gray-400">個</span>
                        {orderQtyOverrides[item.id] !== undefined &&
                          orderQtyOverrides[item.id] !== item.recommendedQty && (
                            <button
                              onClick={() =>
                                setOrderQtyOverrides(prev => {
                                  const n = { ...prev };
                                  delete n[item.id];
                                  return n;
                                })
                              }
                              className="text-xs text-gray-400 underline"
                            >
                              推奨値に戻す({item.recommendedQty}個)
                            </button>
                          )}
                      </div>
                      <button
                        onClick={() =>
                          fetchAIAdvice(
                            `order-${item.id}`,
                            `商品: ${item.name}、現在庫: ${item.currentStock}個、週間販売: ${item.weeklyVelocity}個、推奨発注数: ${item.recommendedQty}個、リードタイム: ${item.leadTimeDays}日。この発注量の妥当性と注意点を教えてください。`
                          )
                        }
                        className="text-xs px-3 py-1 rounded-lg bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {loadingAI[`order-${item.id}`]
                          ? '⏳'
                          : expandedActions[`order-${item.id}`]
                          ? '▲ 閉じる'
                          : '✨ AI分析'}
                      </button>
                    </div>

                    {expandedActions[`order-${item.id}`] && (
                      <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-gray-700 whitespace-pre-line">
                        <span className="font-semibold text-blue-700">✨ AI 分析</span>
                        <p className="mt-1">{expandedActions[`order-${item.id}`]}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 合計金額 */}
              <div
                className={`rounded-xl p-5 ${
                  totalOrderCost.overBudget
                    ? 'bg-red-50 border border-red-300'
                    : 'bg-blue-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-semibold ${totalOrderCost.overBudget ? 'text-gray-900' : 'text-white'}`}>発注合計金額</span>
                    {budgetLimit && (
                      <span
                        className={`ml-2 text-xs ${
                          totalOrderCost.overBudget
                            ? 'text-red-600 font-bold'
                            : 'text-blue-200'
                        }`}
                      >
                        {totalOrderCost.overBudget
                          ? `⚠️ 予算超過（上限¥${parseFloat(budgetLimit).toLocaleString()}）`
                          : '✅ 予算内'}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      totalOrderCost.overBudget ? 'text-red-600' : 'text-white'
                    }`}
                  >
                    ¥{totalOrderCost.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 備考 + プレビューボタン */}
              <div className="space-y-2">
                <Input
                  placeholder="発注備考（任意）: 急ぎ便希望、など"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="text-sm"
                />
                <button
                  onClick={() => setShowOrderPreview(!showOrderPreview)}
                  className="w-full py-3 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-semibold transition-colors text-sm"
                >
                  {showOrderPreview ? '▲ 発注プレビューを閉じる' : '📋 発注プレビューを確認する'}
                </button>
              </div>

              {/* 発注プレビュー */}
              {showOrderPreview && (
                <div className="bg-white border-2 border-blue-900 rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">📋 発注プレビュー</h3>
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {orderRecommendations.map(item => {
                      const qty =
                        orderQtyOverrides[item.id] !== undefined
                          ? orderQtyOverrides[item.id]
                          : item.recommendedQty;
                      return (
                        <div key={item.id} className="py-2 flex justify-between text-sm">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="ml-2 text-xs text-gray-400">{item.sku}</span>
                          </div>
                          <div className="text-right">
                            <span>
                              {qty}個 × ¥{item.unitCost.toLocaleString()}
                            </span>
                            <span className="ml-2 font-semibold text-blue-700">
                              = ¥{(qty * item.unitCost).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>合計</span>
                    <span className="text-blue-700">¥{totalOrderCost.total.toLocaleString()}</span>
                  </div>
                  {orderNotes && (
                    <p className="text-sm text-gray-600">備考: {orderNotes}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={copyOrderPreview}
                      className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {orderPreviewCopied ? '✅ コピー完了' : '📋 クリップボードにコピー'}
                    </button>
                    <button
                      onClick={handleApproveOrder}
                      className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      ✅ この内容で発注承認
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ── Shopify在庫連携 ──────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900">🔄 Shopifyに在庫数を反映する</h3>
          <p className="text-sm text-blue-600 mt-1">発注が完了したら、Shopifyの在庫数を更新してください。</p>

          <div className="bg-amber-50 rounded-lg p-3 mb-4 mt-4">
            <p className="text-sm text-amber-700 font-medium">⚠️ Shopify未接続 - 現在モックで動作中</p>
            <p className="text-xs text-amber-600 mt-1">Shopifyと連携すると、ここから直接在庫数を更新できます。</p>
          </div>

          <p className="text-sm font-medium text-slate-700 mb-3">発注完了後の在庫数を入力して更新してください:</p>

          {orderRecommendations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">タブ「発注数おすすめ」で商品を選択してください</p>
          ) : (
            <>
              {orderRecommendations.map(item => {
                const newStock = updatedStocks[item.id] !== undefined
                  ? updatedStocks[item.id]
                  : item.currentStock + item.recommendedQty;
                return (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 mb-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">現在の在庫: {item.currentStock}個</p>
                      <p className="text-xs text-blue-600 mt-0.5">推奨発注数: +{item.recommendedQty}個</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">発注完了後の在庫数</p>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            className="w-24 border rounded px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                            value={newStock}
                            onChange={e => setUpdatedStocks(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                          />
                          <span className="text-sm text-slate-500">個</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => {
                  setIsUpdating(true);
                  setTimeout(() => {
                    setIsUpdating(false);
                    setIsUpdated(true);
                    toast({ title: '✅ 在庫更新の指示書を作成しました。Shopify連携後に自動で反映されます。' });
                  }, 1500);
                }}
                disabled={isUpdating}
                className="bg-blue-900 hover:bg-blue-950 text-white w-full py-3 rounded-lg mt-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <><span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />更新中...</>
                ) : 'Shopifyの在庫を更新する'}
              </button>
              <p className="text-xs text-slate-400 mt-2 text-center">
                ※この機能は未実装です。Shopify連携後に実際の在庫更新が可能になります。
              </p>

              {isUpdated && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <p className="font-medium text-green-700">✅ 在庫更新指示書を作成しました</p>
                  <div className="mt-3">
                    {orderRecommendations.map(item => {
                      const newStock = updatedStocks[item.id] !== undefined
                        ? updatedStocks[item.id]
                        : item.currentStock + item.recommendedQty;
                      return (
                        <div key={item.id} className="flex justify-between py-2 border-b last:border-b-0 text-sm">
                          <span className="text-slate-700">{item.name}</span>
                          <span className="text-slate-600">{item.currentStock}個 → {newStock}個</span>
                          <span className="text-green-600">✅</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-4">Shopify管理画面で反映する手順:</p>
                  <ol className="mt-2 space-y-1 text-sm text-slate-600 list-decimal list-inside">
                    <li>Shopify管理画面にログイン</li>
                    <li>「商品」→「在庫」を選択</li>
                    <li>各商品の在庫数を上記の数値に更新</li>
                    <li>「保存する」をクリック</li>
                  </ol>
                  <p className="text-xs text-slate-400 mt-3">
                    ※Shopify連携が完了すると、この手順は自動化されます。
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════
            TAB 3: 滞留在庫アラート
        ══════════════════════════════════════════════ */}
        <TabsContent value="slowmove" className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            在庫回転日数が長い商品をAIが検出し、対策を提案します。
          </p>

          {/* 凡例 */}
          <div className="flex gap-5 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="text-gray-600">
                危険（60日超）: <b>{slowMoveItems.filter(i => i.level === 'danger').length}品</b>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              <span className="text-gray-600">
                注意（30〜60日）: <b>{slowMoveItems.filter(i => i.level === 'warning').length}品</b>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <span className="text-gray-600">
                正常（30日以内）: <b>{slowMoveItems.filter(i => i.level === 'normal').length}品</b>
              </span>
            </div>
          </div>

          {slowDangerCount > 0 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              ⚠️ <b>{slowDangerCount}品目</b>が危険水準の滞留在庫です。キャッシュフローへの影響を確認してください。
            </div>
          )}

          <div className="space-y-3">
            {slowMoveItems.map(item => (
              <div
                key={item.id}
                className={`rounded-xl ${slowMoveBg(item.level)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.sku}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${slowMoveBadge(item.level)}`}
                      >
                        {item.level === 'danger'
                          ? '🔴 危険'
                          : item.level === 'warning'
                          ? '🟡 注意'
                          : '🟢 正常'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        現在庫: <b className="text-gray-900">{item.currentStock}個</b>
                      </span>
                      <span>
                        週間販売: <b className="text-gray-900">{item.weeklyVelocity}個/週</b>
                      </span>
                      <span>
                        仕入単価: <b className="text-gray-900">¥{item.unitCost.toLocaleString()}</b>
                      </span>
                      <span>
                        在庫資産額: <b className="text-gray-900">¥{item.stockValue.toLocaleString()}</b>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${slowMoveTextColor(item.level)}`}>
                      {item.turnoverDays}日
                    </div>
                    <div className="text-xs text-gray-500">在庫回転日数</div>
                  </div>
                </div>

                {/* 推奨アクション */}
                <div className="mt-3 p-3 rounded-lg bg-white/70 border border-gray-200 text-sm text-gray-700">
                  💡 <span className="font-medium">推奨アクション:</span> {item.suggestion}
                </div>

                <div className="mt-2 flex gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      fetchAIAdvice(
                        `slow-${item.id}`,
                        `商品: ${item.name}、現在庫: ${item.currentStock}個、在庫回転日数: ${item.turnoverDays}日、在庫資産額: ¥${item.stockValue.toLocaleString()}、週間販売: ${item.weeklyVelocity}個。滞留在庫を解消するための具体的な販促・価格戦略を3点提案してください。`
                      )
                    }
                    className="text-xs px-3 py-1 rounded-lg bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {loadingAI[`slow-${item.id}`]
                      ? '⏳ 分析中...'
                      : expandedActions[`slow-${item.id}`]
                      ? '▲ 閉じる'
                      : '✨ AI販促提案'}
                  </button>
                  {item.level !== 'normal' && (
                    <button
                      onClick={() => router.push('/agents/marketing')}
                      className="text-xs px-3 py-1 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors"
                    >
                      → マーケティングエージェントへ
                    </button>
                  )}
                </div>

                {expandedActions[`slow-${item.id}`] && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-gray-700 whitespace-pre-line">
                    <span className="font-semibold text-blue-700">✨ AI 販促提案</span>
                    <p className="mt-1">{expandedActions[`slow-${item.id}`]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
