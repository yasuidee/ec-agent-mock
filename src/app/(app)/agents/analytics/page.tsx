'use client';

import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { kpiSummary, topProducts } from '@/lib/mock-data';
import { AgentBriefCard } from '@/components/AgentBriefCard';
import { PageSkeleton } from '@/components/PageSkeleton';

// ─── Static data ─────────────────────────────────────────────────────────────

const funnelSteps = [
  { label: 'サイト訪問',  sessions: 10000, pct: 100 },
  { label: '商品閲覧',   sessions: 4200,  pct: 42  },
  { label: 'カート追加', sessions: 890,   pct: 8.9 },
  { label: '購入完了',   sessions: 280,   pct: 2.8 },
];

const plData = [
  { week: '4/21〜', revenue: 1_240_000, cost: 620_000, profit: 620_000 },
  { week: '4/28〜', revenue: 1_380_000, cost: 710_000, profit: 670_000 },
  { week: '5/05〜', revenue: 1_520_000, cost: 780_000, profit: 740_000 },
  { week: '5/12〜', revenue: 1_580_000, cost: 810_000, profit: 770_000 },
];

const totalRevenue = plData.reduce((s, d) => s + d.revenue, 0);
const totalCost    = plData.reduce((s, d) => s + d.cost, 0);
const grossMargin  = kpiSummary.grossMarginRate;

const segments = [
  { name: '新規顧客',   value: 42, color: '#1e3a8a', unitPrice: '¥7,200',  freq: '1.0回',  ltv: '¥7,200'  },
  { name: 'リピーター', value: 35, color: '#f59e0b', unitPrice: '¥12,800', freq: '3.2回',  ltv: '¥40,960' },
  { name: '休眠顧客',   value: 23, color: '#e2e8f0', unitPrice: '¥9,400',  freq: '0.3回',  ltv: '¥2,820'  },
];

const insights = [
  'リピーター向けメルマガで月 +¥180,000 の売上増が見込めます',
  'カート離脱率が高い。送料無料ラインを ¥5,000 に下げることを推奨します',
  '休眠顧客 23% へのクーポン配信で約 15% が復帰する予測です',
];

const yen = (n: number) => '¥' + n.toLocaleString('ja-JP');

const selectClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30';

type Period = '今週' | '今月' | '過去90日';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 1000); return () => clearTimeout(t); }, []);

  const [period, setPeriod] = useState<Period>('今月');

  // ── Simulator state ────────────────────────────────────────────────────────
  const [selectedProductId, setSelectedProductId] = useState('');
  const [shipping,       setShipping]       = useState('600');
  const [packaging,      setPackaging]      = useState('120');
  const [mallFeeRate,    setMallFeeRate]    = useState('10');
  const [paymentFeeRate, setPaymentFeeRate] = useState('3.6');
  const [adCost,         setAdCost]         = useState('800');
  const [returnRate,     setReturnRate]     = useState('2');
  const [discountRate,   setDiscountRate]   = useState('0');
  const [targetProfit,   setTargetProfit]   = useState('300000');

  const selectedProduct = useMemo(
    () => topProducts.find((p) => p.id === selectedProductId) ?? null,
    [selectedProductId],
  );

  const sim = useMemo(() => {
    if (!selectedProduct) return null;
    const price = selectedProduct.price;
    const cost  = selectedProduct.cost;
    const s   = Number(shipping)       || 0;
    const pkg = Number(packaging)      || 0;
    const mfr = Number(mallFeeRate)    || 0;
    const pfr = Number(paymentFeeRate) || 0;
    const ad  = Number(adCost)         || 0;
    const rr  = Number(returnRate)     || 0;
    const dr  = Number(discountRate)   || 0;
    const tp  = Number(targetProfit)   || 0;

    const effectivePrice = price * (1 - dr / 100);
    const mallFee        = effectivePrice * (mfr / 100);
    const paymentFee     = effectivePrice * (pfr / 100);
    const returnCost     = effectivePrice * (rr / 100);
    const totalCostVal   = cost + s + pkg + mallFee + paymentFee + ad + returnCost;
    const profitPerUnit  = effectivePrice - totalCostVal;
    const marginRate     = effectivePrice > 0 ? (profitPerUnit / effectivePrice) * 100 : 0;
    const maxAdCost      = effectivePrice * (1 - 0.2) - (cost + s + pkg + mallFee + paymentFee + returnCost);
    const profitWithoutShipping = profitPerUnit - s;
    const canAbsorbShipping     = profitWithoutShipping > 0;
    const unitsForTarget = profitPerUnit > 0 ? Math.ceil(tp / profitPerUnit) : null;

    const breakdown = [
      { label: '原価',      value: cost,             color: '#1e3a8a' },
      { label: '送料・梱包', value: s + pkg,          color: '#7c3aed' },
      { label: '手数料',    value: mallFee + paymentFee, color: '#f59e0b' },
      { label: '広告費',    value: ad,               color: '#ef4444' },
      { label: '返品',      value: returnCost,       color: '#94a3b8' },
    ].filter((b) => b.value > 0);

    return {
      effectivePrice, profitPerUnit, marginRate,
      maxAdCost, profitWithoutShipping, canAbsorbShipping,
      unitsForTarget, breakdown, ad, s,
    };
  }, [selectedProduct, shipping, packaging, mallFeeRate, paymentFeeRate, adCost, returnRate, discountRate, targetProfit]);

  const totalSessions = segments.reduce((s, sg) => s + sg.value, 0);

  if (!ready) return <PageSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">分析AI</h1>
          <p className="text-sm text-slate-500 mt-1">
            アクセス分析・顧客行動・経営PLをAIが可視化します
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-blue-900 hover:text-blue-700 transition-colors mt-1 shrink-0">
          ← ダッシュボードに戻る
        </Link>
      </div>

      <AgentBriefCard category="analytics" />

      {/* ── 2. Period tabs ────────────────────────────────── */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList>
          {(['今週', '今月', '過去90日'] as Period[]).map((p) => (
            <TabsTrigger key={p} value={p}>{p}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── 3. Purchase funnel ────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">🔍 購買ファネル</h2>
        <div className="flex flex-col gap-1">
          {funnelSteps.map((step, i) => {
            const dropPct =
              i < funnelSteps.length - 1
                ? (100 - (funnelSteps[i + 1].pct / step.pct) * 100).toFixed(0)
                : null;
            return (
              <div key={step.label}>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-400 w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-slate-800">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        {step.sessions.toLocaleString('ja-JP')}セッション
                      </span>
                      <span className="text-xs font-medium text-slate-500 w-12 text-right">
                        {step.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-900 rounded-full transition-all"
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
                {dropPct !== null && (
                  <div className="flex items-center justify-center py-1">
                    <span className="text-xs text-red-500 font-medium">↓ {dropPct}% が離脱</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. PL chart ───────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">💰 経営PL分析（過去30日）</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={plData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
              width={60}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip
              formatter={(v, name) => {
                const labels: Record<string, string> = { revenue: '売上', cost: '原価', profit: '粗利' };
                return [yen(Number(v)), labels[String(name)] ?? String(name)];
              }}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
            />
            <Legend
              formatter={(v) => {
                const map: Record<string, string> = { revenue: '売上', cost: '原価', profit: '粗利' };
                return map[String(v)] ?? String(v);
              }}
              iconSize={10}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="revenue" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="cost"    fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="profit"  fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: '売上合計', value: yen(totalRevenue), sub: '過去30日' },
            { label: '原価合計', value: yen(totalCost),    sub: '過去30日' },
            { label: '粗利率',   value: `${grossMargin}%`, sub: '平均' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-semibold text-slate-900 mt-0.5">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Customer segments ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-2">顧客セグメント</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={450}
                >
                  {segments.map((seg) => (
                    <Cell key={seg.name} fill={seg.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`, '']}
                  contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-semibold text-slate-800">{totalSessions}%</span>
              <span className="text-xs text-slate-400">合計</span>
            </div>
          </div>
          <ul className="mt-2 space-y-1.5">
            {segments.map((seg) => (
              <li key={seg.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: seg.color, border: seg.color === '#e2e8f0' ? '1px solid #cbd5e1' : undefined }}
                  />
                  <span className="text-slate-600">{seg.name}</span>
                </div>
                <span className="font-medium text-slate-700">{seg.value}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">セグメント別指標</h2>
          <div className="flex flex-col gap-3">
            {segments.map((seg) => (
              <div key={seg.name} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: seg.color, border: seg.color === '#e2e8f0' ? '1px solid #cbd5e1' : undefined }}
                  />
                  <span className="text-sm font-medium text-slate-800">{seg.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">{seg.value}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: '購入単価', value: seg.unitPrice },
                    { label: '購入頻度', value: seg.freq },
                    { label: 'LTV',      value: seg.ltv },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded p-2">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. AI insights ────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-3">🤖 AIからの改善提案</h2>
        <ul className="flex flex-col gap-2.5">
          {insights.map((text, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* ── 7. Profit Simulator ───────────────────────────── */}
      <div className="bg-white border rounded-xl p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-semibold text-lg text-slate-900">💰 利益シミュレーター</h2>
          <p className="text-sm text-slate-500 mt-1">商品1個あたりの利益構造を分析します</p>
        </div>

        {/* Block 1: Product select + Shopify data */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-600">商品を選択</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className={selectClass}
          >
            <option value="">商品を選択してください</option>
            {topProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedProduct && (
            <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">販売価格（Shopifyから取得）</p>
                <p className="text-lg font-semibold text-slate-900 mt-0.5">
                  ¥{selectedProduct.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">商品原価（Shopifyから取得）</p>
                <p className="text-lg font-semibold text-slate-900 mt-0.5">
                  ¥{selectedProduct.cost.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Block 2: Manual cost inputs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-3">
            {[
              { label: '送料',        unit: '¥', value: shipping,       set: setShipping,       ph: '600'  },
              { label: '梱包費',      unit: '¥', value: packaging,      set: setPackaging,      ph: '120'  },
              { label: 'モール手数料', unit: '%', value: mallFeeRate,    set: setMallFeeRate,    ph: '10'   },
              { label: '決済手数料',  unit: '%', value: paymentFeeRate, set: setPaymentFeeRate, ph: '3.6'  },
            ].map(({ label, unit, value, set, ph }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium text-slate-600">{label}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    className="flex-1 text-sm"
                  />
                  <span className="text-xs text-slate-400 w-4 shrink-0">{unit}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Right column */}
          <div className="space-y-3">
            {[
              { label: '広告費/件', unit: '¥', value: adCost,       set: setAdCost,       ph: '800' },
              { label: '返品率',    unit: '%', value: returnRate,   set: setReturnRate,   ph: '2'   },
              { label: '値引き率',  unit: '%', value: discountRate, set: setDiscountRate, ph: '0'   },
            ].map(({ label, unit, value, set, ph }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium text-slate-600">{label}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={ph}
                    className="flex-1 text-sm"
                  />
                  <span className="text-xs text-slate-400 w-4 shrink-0">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 3: Calculation results */}
        {sim && selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Profit per unit */}
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-slate-500">1個売れたらいくら残るか</p>
              <p className={`text-3xl font-bold ${sim.profitPerUnit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                ¥{Math.round(sim.profitPerUnit).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">利益率 {sim.marginRate.toFixed(1)}%</p>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400">コスト内訳</p>
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                  {sim.breakdown.map((b) => {
                    const pct = Math.max(0, Math.min(100, (b.value / sim.effectivePrice) * 100));
                    return (
                      <div
                        key={b.label}
                        style={{ width: `${pct}%`, background: b.color }}
                        title={`${b.label}: ¥${Math.round(b.value).toLocaleString()}`}
                      />
                    );
                  })}
                  {sim.profitPerUnit > 0 && (
                    <div
                      style={{ flex: 1, background: '#22c55e' }}
                      title={`利益: ¥${Math.round(sim.profitPerUnit).toLocaleString()}`}
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {sim.breakdown.map((b) => (
                    <span key={b.label} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-sm inline-block shrink-0" style={{ background: b.color }} />
                      {b.label}
                    </span>
                  ))}
                  {sim.profitPerUnit > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-sm inline-block bg-green-500 shrink-0" />
                      利益
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Break-even */}
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-slate-500">何個売れば黒字か</p>
              {sim.profitPerUnit > 0 ? (
                <p className="text-sm font-semibold text-green-600">✅ 1個から黒字です</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-500">❌ 1個売るたびに赤字です</p>
                  <p className="text-xs text-red-400">
                    1個あたり¥{Math.abs(Math.round(sim.profitPerUnit)).toLocaleString()}の赤字です
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">月間目標利益額</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(e.target.value)}
                    placeholder="300000"
                    className="flex-1 text-sm"
                  />
                  <span className="text-xs text-slate-400 shrink-0">円</span>
                </div>
                {sim.unitsForTarget !== null ? (
                  <p className="text-xs text-slate-600">
                    月¥{Number(targetProfit).toLocaleString()}の利益には
                    <span className="font-semibold text-blue-900 mx-1">
                      {sim.unitsForTarget.toLocaleString()}
                    </span>
                    個の販売が必要
                  </p>
                ) : (
                  <p className="text-xs text-red-500">赤字のため計算できません</p>
                )}
              </div>
            </div>

            {/* Card 3: Max ad cost */}
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-slate-500">広告費はいくらまで使えるか</p>
              <p className="text-3xl font-bold text-slate-900">
                ¥{Math.max(0, Math.round(sim.maxAdCost)).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">これ以上使うと利益率20%を下回ります</p>
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">現在の広告費</span>
                  <span className="font-medium text-slate-700">¥{sim.ad.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">上限まで余裕</span>
                  <span className={`font-medium ${sim.maxAdCost - sim.ad >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {sim.maxAdCost - sim.ad >= 0 ? '+' : ''}¥{Math.round(sim.maxAdCost - sim.ad).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Free shipping tolerance */}
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-slate-500">送料無料にしても耐えられるか</p>
              {sim.canAbsorbShipping ? (
                <>
                  <p className="text-sm font-semibold text-green-600">✓ 耐えられます</p>
                  <p className="text-xs text-slate-600">
                    送料¥{sim.s.toLocaleString()}を自社負担しても
                    <span className="font-semibold text-green-600 mx-1">
                      ¥{Math.round(sim.profitWithoutShipping).toLocaleString()}
                    </span>
                    の利益が残ります
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-red-500">✗ 耐えられません</p>
                  <p className="text-xs text-slate-600">
                    送料負担すると1個あたり
                    <span className="font-semibold text-red-500 mx-1">
                      ¥{Math.abs(Math.round(sim.profitWithoutShipping)).toLocaleString()}
                    </span>
                    の赤字になります
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Block 4: AI comment */}
        {sim && selectedProduct && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            {sim.profitPerUnit > 0 && sim.marginRate >= 30 ? (
              <p className="text-sm text-slate-700">
                ✅ 利益率{sim.marginRate.toFixed(1)}%は健全です。広告費を¥{Math.max(0, Math.round(sim.maxAdCost)).toLocaleString()}まで増やして販売数を伸ばすことを検討してください。
              </p>
            ) : sim.profitPerUnit > 0 ? (
              <p className="text-sm text-slate-700">
                ⚠️ 利益率{sim.marginRate.toFixed(1)}%はやや低めです。原価交渉または販売価格の見直しを推奨します。
              </p>
            ) : (
              <p className="text-sm text-slate-700">
                🚨 現在の設定では販売するたびに赤字です。原価・手数料・広告費を見直してください。
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
