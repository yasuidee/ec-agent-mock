'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
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
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { kpiSummary, topProducts, dailySales } from '@/lib/mock-data';
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

interface FunnelResult {
  stageHealth: Record<string, number>;
  problems: Array<{
    stage: string; title: string; priority: 'high' | 'medium' | 'low';
    currentValue: string; benchmark: string; impactAmount: number;
    action: string; agent: string;
  }>;
  aiComment: string;
  priorityAction: string;
}

interface PlanResult {
  monthlyGrowthRate: number;
  monthlyMilestones: Array<{ month: number; targetRevenue: number; growthRate: number }>;
  actions: {
    immediate: ActionItem[];
    shortTerm: ActionItem[];
    midTerm: ActionItem[];
  };
  predictions: Record<string, { revenue: number; grossProfit: number; roas: number }>;
  weeklyTasks: Array<{ week: number; tasks: Array<{ title: string; agent: string }> }>;
  aiComment: string;
  feasibilityScore: number;
}

interface ActionItem {
  title: string; expectedImpact: string; expectedRevenueLift: number;
  steps: string[]; agent: string;
}

// ─── Weekly Report types ──────────────────────────────────────────────────────

interface WeeklyTask {
  id: string;
  priority: 'urgent' | 'high' | 'normal';
  title: string;
  expectedImpact: number;
  steps: string[];
  agent: string;
  category: 'build' | 'marketing' | 'inventory' | 'analytics';
  description: string;
  urgency: 'high' | 'medium' | 'low';
  status: string;
  reasoning: string;
}

interface WeeklyGoodPoint { title: string; detail: string; revenueImpact: number; }
interface WeeklyBadPoint  { title: string; cause: string; lossImpact: number; }
interface WeeklyDanger    { title: string; description: string; riskAmount: number; }

interface WeeklyReportContent {
  weekLabel: string;
  overallRating: 'good' | 'normal' | 'bad';
  goodPoints: WeeklyGoodPoint[];
  badPoints: WeeklyBadPoint[];
  nextWeekTasks: WeeklyTask[];
  dangers: WeeklyDanger[];
}

interface WeeklyReportHistoryItem {
  weekLabel: string;
  generatedAt: string;
  overallRating: 'good' | 'normal' | 'bad';
  data: WeeklyReportContent;
}

interface WeeklyReportStoredData {
  generatedAt: string;
  weekStartDate: string;
  report: WeeklyReportContent;
  tasks: WeeklyTask[];
}

const ADDITIONAL_GOAL_OPTIONS = [
  '新規顧客比率を上げたい', 'リピート率を上げたい', '客単価を上げたい',
  '広告費を削減したい', '粗利率を改善したい', '在庫回転率を上げたい',
];

const AGENT_BADGE_COLORS: Record<string, string> = {
  build: 'bg-purple-100 text-purple-700',
  marketing: 'bg-blue-100 text-blue-700',
  inventory: 'bg-teal-100 text-teal-700',
  analytics: 'bg-amber-100 text-amber-700',
};

const AGENT_LABELS: Record<string, string> = {
  build: '構築AI', marketing: '集客AI', inventory: '在庫AI', analytics: '分析AI',
};

const PRIORITY_CONFIG = {
  high:   { label: '高', borderClass: 'border-red-400',   bgClass: 'bg-red-50' },
  medium: { label: '中', borderClass: 'border-amber-400', bgClass: 'bg-amber-50' },
  low:    { label: '低', borderClass: 'border-blue-400',  bgClass: 'bg-blue-50' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 1000); return () => clearTimeout(t); }, []);

  // Load weekly report data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('weeklyReportData');
      if (stored) setCurrentReportData(JSON.parse(stored));
      const hist = localStorage.getItem('weeklyReports');
      if (hist) setWeeklyReports(JSON.parse(hist));
      const ar = localStorage.getItem('autoReport');
      if (ar === 'true') setAutoReport(true);
    } catch { /* ignore */ }
  }, []);

  const [mainTab, setMainTab] = useState('sales');
  const [period, setPeriod] = useState<Period>('今月');

  const router = useRouter();

  // Funnel analysis state
  const [funnelData, setFunnelData] = useState({
    sessions: '10000', cvr: '2.8', avgOrderValue: '5500',
    orders: '', repeatRate: '23', adSpend: '480000',
    stockoutCount: '2', returnRate: '2.1', benchmark: 'average',
  });
  const [funnelResult, setFunnelResult] = useState<FunnelResult | null>(null);
  const [funnelLoading, setFunnelLoading] = useState(false);

  // Goal planner state
  const [plannerStep, setPlannerStep] = useState<1 | 2 | 3>(1);
  const [currentData, setCurrentData] = useState({
    revenue: '1870000', grossProfit: '748000', orders: '340',
    avgOrderValue: '5500', adSpend: '480000', roas: '3.8',
  });
  const [targetData, setTargetData] = useState({
    period: '3ヶ月後', revenue: '3000000', grossProfit: '1200000', orders: '550',
  });
  const [additionalGoals, setAdditionalGoals] = useState<string[]>([]);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planLoadingProgress, setPlanLoadingProgress] = useState(0);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [planCopied, setPlanCopied] = useState(false);

  // ── Weekly Report state ────────────────────────────────────────────────────
  const [reportLoading, setReportLoading] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReportHistoryItem[]>([]);
  const [currentReportData, setCurrentReportData] = useState<WeeklyReportStoredData | null>(null);
  const [expandedReportIdx, setExpandedReportIdx] = useState<number | null>(null);
  const [reportCopied, setReportCopied] = useState(false);
  const [autoReport, setAutoReport] = useState(false);
  const [dangerToastIdx, setDangerToastIdx] = useState<number | null>(null);

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

  const handleFunnelAnalyze = async () => {
    setFunnelLoading(true);
    try {
      const orders = funnelData.orders || String(Math.round(Number(funnelData.sessions) * Number(funnelData.cvr) / 100));
      const res = await fetch('/api/funnel-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessions: Number(funnelData.sessions), cvr: Number(funnelData.cvr),
          avgOrderValue: Number(funnelData.avgOrderValue), orders: Number(orders),
          repeatRate: Number(funnelData.repeatRate), adSpend: Number(funnelData.adSpend),
          stockoutCount: Number(funnelData.stockoutCount), returnRate: Number(funnelData.returnRate),
          benchmark: funnelData.benchmark,
        }),
      });
      setFunnelResult(await res.json());
    } catch {
      setFunnelResult(null);
    } finally {
      setFunnelLoading(false);
    }
  };

  const handlePlanCreate = async () => {
    setPlanLoading(true);
    setPlanLoadingProgress(0);
    setPlannerStep(2);
    const interval = setInterval(() => {
      setPlanLoadingProgress(p => { if (p >= 90) { clearInterval(interval); return 90; } return p + 8; });
    }, 400);
    try {
      const res = await fetch('/api/goal-planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRevenue: Number(currentData.revenue),
          currentGrossProfit: Number(currentData.grossProfit),
          currentOrders: Number(currentData.orders),
          avgOrderValue: Number(currentData.avgOrderValue),
          adSpend: Number(currentData.adSpend),
          roas: Number(currentData.roas),
          period: targetData.period,
          targetRevenue: Number(targetData.revenue),
          targetGrossProfit: Number(targetData.grossProfit),
          targetOrders: Number(targetData.orders),
          additionalGoals,
        }),
      });
      clearInterval(interval);
      setPlanLoadingProgress(100);
      const data = await res.json();
      setTimeout(() => { setPlanResult(data); setPlanLoading(false); }, 400);
    } catch {
      clearInterval(interval);
      setPlanLoadingProgress(100);
      setTimeout(() => { setPlanLoading(false); }, 400);
    }
  };

  // ── Weekly Report handler ─────────────────────────────────────────────────
  const handleGenerateReport = async () => {
    setReportLoading(true);

    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now);
    weekStart.setDate(diff);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const half = Math.floor(dailySales.length / 2);
    const prevRevenue = dailySales.slice(0, half).reduce((s, d) => s + d.revenue, 0);
    const revenue     = dailySales.slice(half).reduce((s, d) => s + d.revenue, 0);
    const prevOrders  = dailySales.slice(0, half).reduce((s, d) => s + d.orders, 0);
    const orders      = dailySales.slice(half).reduce((s, d) => s + d.orders, 0);

    try {
      const res = await fetch('/api/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStartDate: weekStartStr,
          currentData: {
            revenue,
            prevRevenue,
            orders,
            prevOrders,
            cvr: kpiSummary.cvr,
            prevCvr: +(kpiSummary.cvr * 0.92).toFixed(2),
            grossProfit: Math.round(revenue * kpiSummary.grossMarginRate / 100),
            prevGrossProfit: Math.round(prevRevenue * (kpiSummary.grossMarginRate + kpiSummary.grossMarginRateDelta) / 100),
            adSpend: 480000,
            roas: kpiSummary.roas,
            stockoutCount: 2,
            repeatRate: 23,
          },
        }),
      });
      const reportData: WeeklyReportContent = await res.json();

      const storedData: WeeklyReportStoredData = {
        generatedAt: new Date().toISOString(),
        weekStartDate: weekStartStr,
        report: reportData,
        tasks: reportData.nextWeekTasks,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('weeklyReportData', JSON.stringify(storedData));
          const histRaw = localStorage.getItem('weeklyReports') || '[]';
          const hist: WeeklyReportHistoryItem[] = JSON.parse(histRaw);
          hist.unshift({
            weekLabel: reportData.weekLabel,
            generatedAt: storedData.generatedAt,
            overallRating: reportData.overallRating,
            data: reportData,
          });
          localStorage.setItem('weeklyReports', JSON.stringify(hist.slice(0, 8)));
          if (autoReport) localStorage.setItem('autoReport', 'true');
        } catch { /* ignore */ }
      }

      setCurrentReportData(storedData);
      setWeeklyReports((prev) =>
        [
          { weekLabel: reportData.weekLabel, generatedAt: storedData.generatedAt, overallRating: reportData.overallRating, data: reportData },
          ...prev,
        ].slice(0, 8),
      );
      setExpandedReportIdx(0);
    } catch { /* silently fail with mock */ }
    finally { setReportLoading(false); }
  };

  const handleAutoReportToggle = () => {
    const next = !autoReport;
    setAutoReport(next);
    if (typeof window !== 'undefined') {
      try {
        if (next) localStorage.setItem('autoReport', 'true');
        else localStorage.removeItem('autoReport');
      } catch { /* ignore */ }
    }
  };

  const setFD = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFunnelData(f => ({ ...f, [k]: e.target.value }));
  const setCD = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCurrentData(f => ({ ...f, [k]: e.target.value }));
  const setTD = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setTargetData(f => ({ ...f, [k]: e.target.value }));

  if (!ready) return <PageSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────── */}
      <PageHeader
        title="分析AI"
        description="アクセス分析・顧客行動・経営PLをAIが可視化します"
      />

      <AgentBriefCard category="analytics" />

      {/* ── Main navigation tabs ──────────────────────────── */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="sales">📊 売上分析</TabsTrigger>
          <TabsTrigger value="business">💹 経営分析</TabsTrigger>
          <TabsTrigger value="weekly">📋 週次レポート</TabsTrigger>
        </TabsList>
      </Tabs>

      <TabsContent value="sales">
      <div className="space-y-6">

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

      {/* ── 8. Funnel Analysis ─────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="mb-6">
          <h2 className="font-semibold text-lg text-slate-900">🔍 売上低迷 原因分解ファネル</h2>
          <p className="text-sm text-slate-500 mt-1">売上が伸びない原因をファネルで特定し、優先すべき改善ポイントを提案します</p>
        </div>

        {/* Input area */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">現在の数値を入力してください</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '月間セッション数', k: 'sessions', ph: '10000', unit: '' },
              { label: 'CVR %', k: 'cvr', ph: '2.8', unit: '', step: '0.1' },
              { label: '平均客単価', k: 'avgOrderValue', ph: '5500', unit: '円' },
              { label: '月間注文数', k: 'orders', ph: String(Math.round(Number(funnelData.sessions) * Number(funnelData.cvr) / 100) || 280), unit: '' },
            ].map(({ label, k, ph, unit, step }) => (
              <div key={k} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">{label}</label>
                <div className="flex items-center gap-1">
                  <Input type="number" step={step} placeholder={ph}
                    value={funnelData[k as keyof typeof funnelData]}
                    onChange={setFD(k)} className="text-sm" />
                  {unit && <span className="text-xs text-slate-400 shrink-0">{unit}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4 mt-3">
            {[
              { label: 'リピート率%', k: 'repeatRate', ph: '23', unit: '', step: '0.1' },
              { label: '広告費', k: 'adSpend', ph: '480000', unit: '円' },
              { label: '在庫切れ件数', k: 'stockoutCount', ph: '2', unit: '件/月' },
              { label: '返品率%', k: 'returnRate', ph: '2.1', unit: '', step: '0.1' },
            ].map(({ label, k, ph, unit, step }) => (
              <div key={k} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">{label}</label>
                <div className="flex items-center gap-1">
                  <Input type="number" step={step} placeholder={ph}
                    value={funnelData[k as keyof typeof funnelData]}
                    onChange={setFD(k)} className="text-sm" />
                  {unit && <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">{unit}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">ベンチマーク比較対象</label>
            <select value={funnelData.benchmark} onChange={setFD('benchmark')} className={selectClass} style={{maxWidth: 240}}>
              <option value="average">同規模EC平均</option>
              <option value="top20">業界トップ20%</option>
              <option value="custom">カスタム入力</option>
            </select>
          </div>
          <button onClick={handleFunnelAnalyze} disabled={funnelLoading}
            className="flex items-center justify-center gap-2 bg-blue-900 text-white w-full py-3 mt-4 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors font-medium">
            {funnelLoading
              ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />分析中...</>
              : '🔍 ファネル分析を実行する'
            }
          </button>
        </div>

        {/* Funnel result */}
        {funnelResult && (() => {
          const sessions = Number(funnelData.sessions) || 10000;
          const cvr = Number(funnelData.cvr) || 2.8;
          const avgOV = Number(funnelData.avgOrderValue) || 5500;
          const orders = Number(funnelData.orders) || Math.round(sessions * cvr / 100);
          const repeatRate = Number(funnelData.repeatRate) || 23;
          const adSpend = Number(funnelData.adSpend) || 480000;
          const stockoutCount = Number(funnelData.stockoutCount) || 2;
          const revenue = orders * avgOV;
          const roas = adSpend > 0 ? revenue / adSpend : 0;
          const stockHealth = Math.max(0, 100 - stockoutCount * 5);

          const stages = [
            { key: 'access', label: 'アクセス（セッション）', value: `${sessions.toLocaleString()}件/月`, health: funnelResult.stageHealth.access ?? 70 },
            { key: 'productView', label: '商品閲覧', value: `${Math.round(sessions * 0.42).toLocaleString()}件 (42%)`, health: funnelResult.stageHealth.productView ?? 72 },
            { key: 'cartAdd', label: 'カート追加', value: `${Math.round(sessions * 0.089).toLocaleString()}件 (8.9%)`, health: funnelResult.stageHealth.cartAdd ?? 68 },
            { key: 'cvr', label: '購入完了（CVR）', value: `${orders.toLocaleString()}件 (${cvr}%)`, health: funnelResult.stageHealth.cvr ?? 40 },
            { key: 'avgOrderValue', label: '客単価', value: yen(avgOV), health: funnelResult.stageHealth.avgOrderValue ?? 60 },
            { key: 'repeatRate', label: 'リピート率', value: `${repeatRate}%`, health: funnelResult.stageHealth.repeatRate ?? 35 },
            { key: 'roas', label: '広告効率（ROAS）', value: `${roas.toFixed(1)}倍`, health: funnelResult.stageHealth.roas ?? 50 },
            { key: 'stockout', label: '在庫充足率', value: `${stockHealth}%`, health: funnelResult.stageHealth.stockout ?? stockHealth },
          ];

          const barColor = (h: number) => h >= 80 ? 'bg-blue-900' : h >= 50 ? 'bg-amber-400' : 'bg-red-500';

          const benchmarkPct = 70; // visual benchmark line at 70% width

          return (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Funnel stages */}
              <div className="space-y-2">
                {stages.map((stage, i) => {
                  const dropValue = i < stages.length - 1
                    ? (() => {
                        const currSessions = [sessions, Math.round(sessions*0.42), Math.round(sessions*0.089), orders, null, null, null, null][i];
                        const nextSessions = [Math.round(sessions*0.42), Math.round(sessions*0.089), orders, null, null, null, null, null][i];
                        return (currSessions && nextSessions) ? currSessions - nextSessions : null;
                      })()
                    : null;

                  return (
                    <div key={stage.key}>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-4 font-medium">{i + 1}</span>
                            <span className="text-sm font-medium text-slate-800">{stage.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{stage.value}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${barColor(stage.health).replace('bg-', 'bg-').replace('bg-blue-900', 'bg-blue-100 text-blue-900').replace('bg-amber-400', 'bg-amber-100 text-amber-700').replace('bg-red-500', 'bg-red-100 text-red-700')}`}>
                              {stage.health >= 80 ? '良好' : stage.health >= 50 ? '要注意' : '問題'}
                            </span>
                          </div>
                        </div>
                        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${barColor(stage.health)}`}
                            style={{ width: `${stage.health}%` }} />
                          {/* Benchmark line */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400 opacity-60"
                            style={{ left: `${benchmarkPct}%` }} />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-slate-400">
                          <span>健全度 {stage.health}%</span>
                          <span>目安: {benchmarkPct}%</span>
                        </div>
                      </div>
                      {dropValue !== null && (
                        <div className="flex justify-center py-1">
                          <span className="text-xs text-red-500 font-medium">↓ {dropValue.toLocaleString()}件が離脱</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Problems */}
              {funnelResult.problems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mt-6 mb-3">⚠️ 改善が必要な箇所</h3>
                  <div className="space-y-3">
                    {funnelResult.problems.map((p, i) => {
                      const cfg = PRIORITY_CONFIG[p.priority] ?? PRIORITY_CONFIG.medium;
                      return (
                        <div key={i} className={`border-l-4 pl-4 py-3 pr-3 rounded-r-lg ${cfg.borderClass} ${cfg.bgClass}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-slate-900">{p.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.borderClass.replace('border-', 'bg-').replace('-400', '-100')} ${cfg.borderClass.replace('border-', 'text-').replace('-400', '-700')}`}>
                              優先度{cfg.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">現在: {p.currentValue} / 業界平均: {p.benchmark}</p>
                          <p className="text-sm text-red-600 font-medium mt-1">
                            改善すると月+¥{p.impactAmount.toLocaleString()}の売上増
                          </p>
                          <p className="text-sm text-slate-600 mt-1">→ {p.action}</p>
                          <button
                            onClick={() => router.push(`/agents/${p.agent}`)}
                            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full cursor-pointer ${AGENT_BADGE_COLORS[p.agent] ?? 'bg-slate-100 text-slate-700'}`}
                          >
                            {AGENT_LABELS[p.agent] ?? p.agent}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Comment */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-sm text-slate-800 mb-2">🤖 AIの診断</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{funnelResult.aiComment}</p>
                {funnelResult.priorityAction && (
                  <p className="text-sm font-medium text-blue-900 mt-2">
                    最優先アクション: {funnelResult.priorityAction}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      </div>
      </TabsContent>

      <TabsContent value="business">
      <div className="space-y-6">

      {/* ── 9. Goal Planner ──────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <div className="mb-6">
          <h2 className="font-semibold text-lg text-slate-900">🎯 目標達成プランナー</h2>
          <p className="text-sm text-slate-500 mt-1">現状と目標を入力すると、AIが達成までのアクションプランを提案します</p>
        </div>

        {/* Step 1 */}
        {plannerStep === 1 && (
          <div className="space-y-6">
            {/* Current data */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">現状の数値</p>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: '今月の売上', k: 'revenue', ph: '1870000', unit: '円' },
                    { label: '今月の粗利', k: 'grossProfit', ph: '748000', unit: '円' },
                    { label: '今月の注文数', k: 'orders', ph: '340', unit: '件' },
                  ].map(({ label, k, ph, unit }) => (
                    <div key={k} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-600">{label}</label>
                      <div className="flex items-center gap-1">
                        <Input type="number" placeholder={ph} value={currentData[k as keyof typeof currentData]} onChange={setCD(k)} className="text-sm" />
                        <span className="text-xs text-slate-400 shrink-0">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {[
                    { label: '平均客単価', k: 'avgOrderValue', ph: String(Number(currentData.revenue) > 0 && Number(currentData.orders) > 0 ? Math.round(Number(currentData.revenue) / Number(currentData.orders)) : 5500), unit: '円' },
                    { label: '広告費', k: 'adSpend', ph: '480000', unit: '円' },
                    { label: 'ROAS', k: 'roas', ph: '3.8', unit: '倍' },
                  ].map(({ label, k, ph, unit }) => (
                    <div key={k} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-600">{label}</label>
                      <div className="flex items-center gap-1">
                        <Input type="number" placeholder={ph} value={currentData[k as keyof typeof currentData]} onChange={setCD(k)} className="text-sm" />
                        <span className="text-xs text-slate-400 shrink-0">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target data */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3 mt-6">目標の数値</p>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-xs font-medium text-slate-600">目標達成期間</label>
                  <select value={targetData.period} onChange={setTD('period')} className={selectClass} style={{maxWidth:200}}>
                    {['1ヶ月後', '3ヶ月後', '6ヶ月後', '1年後'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: '目標売上', k: 'revenue', ph: '3000000', unit: '円' },
                    { label: '目標粗利', k: 'grossProfit', ph: '1200000', unit: '円' },
                    { label: '目標注文数', k: 'orders', ph: '550', unit: '件' },
                  ].map(({ label, k, ph, unit }) => (
                    <div key={k} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-600">{label}</label>
                      <div className="flex items-center gap-1">
                        <Input type="number" placeholder={ph} value={targetData[k as keyof typeof targetData]} onChange={setTD(k)} className="text-sm" />
                        <span className="text-xs text-slate-400 shrink-0">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">追加目標（複数選択可）</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ADDITIONAL_GOAL_OPTIONS.map(g => (
                      <label key={g} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={additionalGoals.includes(g)}
                          onChange={() => setAdditionalGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                          className="rounded" />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handlePlanCreate} disabled={planLoading}
              className="flex items-center justify-center gap-2 bg-blue-900 text-white w-full py-3 mt-6 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors font-medium">
              {planLoading
                ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />プラン作成中...</>
                : 'AIにアクションプランを作成してもらう'
              }
            </button>
          </div>
        )}

        {/* Step 2: Loading */}
        {plannerStep === 2 && planLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <span className="animate-spin inline-block w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full" />
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>目標達成プランを分析中です...</span><span>{planLoadingProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-900 rounded-full transition-all duration-300" style={{ width: `${planLoadingProgress}%` }} />
              </div>
            </div>
            <p className="text-sm text-slate-400">売上ギャップを分析し、最適なアクションプランを生成しています</p>
          </div>
        )}

        {/* Step 2: Results */}
        {plannerStep === 2 && !planLoading && planResult && (() => {
          const curRev = Number(currentData.revenue) || 1870000;
          const curGP = Number(currentData.grossProfit) || 748000;
          const curOrd = Number(currentData.orders) || 340;
          const tgtRev = Number(targetData.revenue) || 3000000;
          const tgtGP = Number(targetData.grossProfit) || 1200000;
          const tgtOrd = Number(targetData.orders) || 550;
          const months = { '1ヶ月後': 1, '3ヶ月後': 3, '6ヶ月後': 6, '1年後': 12 }[targetData.period] ?? 3;

          const chartData = [
            { month: '現状', actual: curRev, plan: curRev, target: curRev },
            { month: '1ヶ月', actual: curRev * Math.pow(1 + (tgtRev/curRev - 1) * 0.3, 1), plan: planResult.predictions.month1?.revenue ?? curRev * 1.17, target: tgtRev },
            { month: '2ヶ月', actual: curRev * Math.pow(1 + (tgtRev/curRev - 1) * 0.3, 2), plan: planResult.predictions.month2?.revenue ?? curRev * 1.36, target: tgtRev },
            { month: '3ヶ月', actual: curRev * Math.pow(1 + (tgtRev/curRev - 1) * 0.3, 3), plan: planResult.predictions.month3?.revenue ?? tgtRev, target: tgtRev },
          ];

          const renderActionSection = (title: string, actions: ActionItem[], borderColor: string, badgeLabel: string, badgeBg: string) => (
            <div className="mb-6">
              <div className={`border-l-4 ${borderColor} pl-4 mb-3`}>
                <h4 className="font-semibold text-slate-800">{title}</h4>
              </div>
              {actions.map((a, i) => (
                <div key={i} className={`rounded-lg p-4 mb-3 ${badgeBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-slate-900">{a.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badgeBg.replace('bg-', 'bg-').replace('-50', '-100')} ${borderColor.replace('border-', 'text-').replace('-400', '-700')}`}>{badgeLabel}</span>
                  </div>
                  <p className="text-sm text-slate-600">期待効果: {a.expectedImpact}</p>
                  <p className="text-sm text-red-600 font-medium">実施すると売上+¥{a.expectedRevenueLift.toLocaleString()}が見込めます</p>
                  <ul className="mt-2 space-y-0.5">
                    {a.steps.map((s, j) => <li key={j} className="text-xs text-slate-500">・{s}</li>)}
                  </ul>
                  <button onClick={() => router.push(`/agents/${a.agent}`)}
                    className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full cursor-pointer ${AGENT_BADGE_COLORS[a.agent] ?? 'bg-slate-100 text-slate-700'}`}>
                    {AGENT_LABELS[a.agent] ?? a.agent}
                  </button>
                </div>
              ))}
            </div>
          );

          return (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Gap summary */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">📊 現状と目標の差分</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: '売上', cur: curRev, tgt: tgtRev, unit: '¥' },
                    { label: '粗利', cur: curGP, tgt: tgtGP, unit: '¥' },
                    { label: '注文数', cur: curOrd, tgt: tgtOrd, unit: '' },
                  ].map(({ label, cur, tgt, unit }) => {
                    const gap = tgt - cur;
                    const rate = Math.round((cur / tgt) * 100);
                    return (
                      <div key={label} className="border rounded-lg p-4 text-center">
                        <p className="text-xs text-slate-500 mb-2">{label}</p>
                        <p className="text-sm text-slate-400 line-through">{unit === '¥' ? yen(cur) : cur.toLocaleString() + '件'}</p>
                        <div className="text-lg font-bold text-blue-900 my-1">↑ {unit === '¥' ? yen(tgt) : tgt.toLocaleString() + '件'}</div>
                        <p className="text-sm font-medium text-red-500">+{unit === '¥' ? yen(gap) : gap.toLocaleString() + '件'}</p>
                        <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-900 rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">達成率 {rate}%</p>
                      </div>
                    );
                  })}
                </div>

                {/* Monthly growth needed */}
                <div className="bg-amber-50 rounded-lg p-4 mt-4">
                  <p className="text-center font-medium text-slate-800">
                    目標達成には月平均 <span className="text-amber-600 font-bold">{planResult.monthlyGrowthRate.toFixed(1)}%</span> の成長が必要です
                  </p>
                  {months >= 3 && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-xs text-center">
                        <thead>
                          <tr className="text-slate-500">
                            <th className="py-1">月</th>
                            <th className="py-1">目標売上</th>
                            <th className="py-1">必要成長</th>
                          </tr>
                        </thead>
                        <tbody>
                          {planResult.monthlyMilestones.slice(0, months).map(m => (
                            <tr key={m.month} className="border-t border-slate-100">
                              <td className="py-1">{m.month}ヶ月目</td>
                              <td className="py-1 font-medium">{yen(m.targetRevenue)}</td>
                              <td className="py-1 text-amber-600">+{m.growthRate.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Action plan */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">🚀 AIが提案するアクションプラン</h3>
                {renderActionSection('即実行（今週中）', planResult.actions.immediate, 'border-red-400', '緊急', 'bg-red-50')}
                {renderActionSection('短期実行（1ヶ月以内）', planResult.actions.shortTerm, 'border-amber-400', '短期', 'bg-amber-50')}
                {renderActionSection('中長期（3ヶ月以内）', planResult.actions.midTerm, 'border-blue-400', '中長期', 'bg-blue-50')}
              </div>

              {/* Simulation chart */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">📈 アクション実施後の予測</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} width={60} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: unknown) => yen(Number(v))} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="actual" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="現状維持" />
                        <Line type="monotone" dataKey="plan" stroke="#1e3a8a" strokeWidth={2} dot={{ fill: '#1e3a8a', r: 4 }} name="プラン実施後" />
                        <ReferenceLine y={tgtRev} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '目標', position: 'right', fontSize: 11, fill: '#f59e0b' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-xs text-slate-500 py-2 text-left">指標</th>
                          <th className="text-xs text-slate-500 py-2 text-right">現状</th>
                          <th className="text-xs text-slate-500 py-2 text-right">3ヶ月後予測</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2 text-slate-700">売上</td>
                          <td className="py-2 text-right text-slate-500">{yen(curRev)}</td>
                          <td className="py-2 text-right font-medium text-blue-900">{yen(planResult.predictions.month3?.revenue ?? tgtRev)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-700">粗利</td>
                          <td className="py-2 text-right text-slate-500">{yen(curGP)}</td>
                          <td className="py-2 text-right font-medium text-blue-900">{yen(planResult.predictions.month3?.grossProfit ?? tgtGP)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-700">粗利率</td>
                          <td className="py-2 text-right text-slate-500">{curRev > 0 ? ((curGP/curRev)*100).toFixed(1) : 0}%</td>
                          <td className="py-2 text-right font-medium text-blue-900">{planResult.predictions.month3 ? ((planResult.predictions.month3.grossProfit / planResult.predictions.month3.revenue) * 100).toFixed(1) : 0}%</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-700">ROAS</td>
                          <td className="py-2 text-right text-slate-500">{Number(currentData.roas).toFixed(1)}倍</td>
                          <td className="py-2 text-right font-medium text-blue-900">{planResult.predictions.month3?.roas.toFixed(1) ?? '5.0'}倍</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* AI comment */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">🤖 AIからのメッセージ</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{planResult.aiComment}</p>
                <p className="text-xs text-blue-600 mt-3 font-medium">実現可能性スコア: {planResult.feasibilityScore}/100</p>
              </div>

              <button onClick={() => setPlannerStep(3)}
                className="bg-blue-900 text-white w-full py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium">
                Step 3: 週次タスクに落とし込む →
              </button>
            </div>
          );
        })()}

        {/* Step 3: Weekly tasks */}
        {plannerStep === 3 && planResult && (() => {
          const totalTasks = planResult.weeklyTasks.flatMap(w => w.tasks).length;
          const completedTasks = Object.values(checkedTasks).filter(Boolean).length;
          const visibleWeeks = showAllWeeks ? planResult.weeklyTasks : planResult.weeklyTasks.slice(0, 4);
          const remainingWeeks = planResult.weeklyTasks.length - 4;

          const getWeekDates = (weekNum: number) => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() + (weekNum - 1) * 7);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return `${start.getMonth()+1}/${start.getDate()} 〜 ${end.getMonth()+1}/${end.getDate()}`;
          };

          const copyPlan = () => {
            const text = planResult.weeklyTasks.map(w =>
              `【Week ${w.week}】${getWeekDates(w.week)}\n${w.tasks.map(t => `・${t.title} (${AGENT_LABELS[t.agent] ?? t.agent})`).join('\n')}`
            ).join('\n\n');
            navigator.clipboard.writeText(text);
            setPlanCopied(true);
            setTimeout(() => setPlanCopied(false), 2000);
          };

          return (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Progress header */}
              <div className="bg-blue-900 text-white rounded-xl p-4">
                <p className="font-medium">全体進捗: {completedTasks}/{totalTasks}タスク完了</p>
                <p className="text-xs text-blue-200 mt-0.5">
                  目標達成まで残り約{({ '1ヶ月後': 30, '3ヶ月後': 90, '6ヶ月後': 180, '1年後': 365 }[targetData.period] ?? 90) - completedTasks * 3}日
                </p>
                <div className="mt-3 w-full h-2 bg-blue-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Weekly cards */}
              <div className="space-y-3">
                {visibleWeeks.map(week => {
                  const weekTasks = week.tasks;
                  const weekCompleted = weekTasks.filter(t => checkedTasks[`${week.week}-${t.title}`]).length;
                  const weekRate = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;
                  return (
                    <div key={week.week} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-semibold text-slate-800">Week {week.week}</span>
                          <span className="text-xs text-slate-400 ml-2">{getWeekDates(week.week)}</span>
                        </div>
                        <span className="text-xs text-slate-500">{weekCompleted}/{weekTasks.length}</span>
                      </div>
                      <div className="space-y-2 mb-3">
                        {weekTasks.map(task => {
                          const key = `${week.week}-${task.title}`;
                          const checked = !!checkedTasks[key];
                          return (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={checked}
                                onChange={() => setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }))}
                                className="rounded" />
                              <span className={`text-sm flex-1 ${checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {task.title}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${AGENT_BADGE_COLORS[task.agent] ?? 'bg-slate-100 text-slate-700'}`}>
                                {AGENT_LABELS[task.agent] ?? task.agent}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-900 rounded-full transition-all duration-300" style={{ width: `${weekRate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {!showAllWeeks && remainingWeeks > 0 && (
                <button onClick={() => setShowAllWeeks(true)}
                  className="border w-full py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  残り{remainingWeeks}週のプランを表示する
                </button>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button onClick={copyPlan}
                  className="border w-full py-3 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  {planCopied ? 'コピーしました ✓' : 'プランをコピーする'}
                </button>
                <button onClick={() => { setPlannerStep(1); setPlanResult(null); setCheckedTasks({}); setShowAllWeeks(false); }}
                  className="border w-full py-3 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  最初からやり直す
                </button>
              </div>
            </div>
          );
        })()}
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
      </TabsContent>

      <TabsContent value="weekly">
      <div className="space-y-6">

      {/* ── 週次レポート ──────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-semibold text-lg text-slate-900">📊 自動改善レポート</h2>
            <p className="text-sm text-slate-500 mt-0.5">毎週月曜日8:00に自動生成されます</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {currentReportData
                ? `最終生成: ${new Date(currentReportData.generatedAt).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                : '未生成'}
            </span>
            <button
              onClick={handleGenerateReport}
              disabled={reportLoading}
              className="border text-sm px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {reportLoading && (
                <span className="inline-block h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              )}
              {reportLoading ? '生成中...' : '今すぐ生成する'}
            </button>
          </div>
        </div>

        {/* Past reports accordion */}
        {weeklyReports.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-8 text-center mb-5">
            <p className="text-sm text-slate-500">
              まだレポートがありません。「今すぐ生成する」でレポートを作成してください。
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden mb-5">
            {weeklyReports.map((report, idx) => {
              const ratingConfig: Record<string, { label: string; className: string }> = {
                good:   { label: '好調',   className: 'bg-green-100 text-green-700' },
                normal: { label: '普通',   className: 'bg-slate-100 text-slate-600' },
                bad:    { label: '要注意', className: 'bg-red-100 text-red-700' },
              };
              const rc = ratingConfig[report.overallRating] ?? ratingConfig.normal;
              const isExpanded = expandedReportIdx === idx;
              return (
                <div key={idx}>
                  <div
                    className={`px-4 py-3 flex justify-between items-center border-b last:border-b-0 ${
                      isExpanded ? 'bg-blue-50' : 'hover:bg-slate-50'
                    } transition-colors`}
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {report.data.weekLabel}のレポート
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${rc.className}`}>
                        {rc.label}
                      </span>
                      <button
                        onClick={() => setExpandedReportIdx(isExpanded ? null : idx)}
                        className="text-sm text-blue-900 hover:underline"
                      >
                        {isExpanded ? '閉じる' : '詳細を見る'}
                      </button>
                    </div>
                  </div>

                  {/* Inline report body */}
                  {isExpanded && (() => {
                    const r = report.data;
                    const half2 = Math.floor(dailySales.length / 2);
                    const wRevenue = dailySales.slice(half2).reduce((s, d) => s + d.revenue, 0);
                    const pRevenue = dailySales.slice(0, half2).reduce((s, d) => s + d.revenue, 0);
                    const wOrders  = dailySales.slice(half2).reduce((s, d) => s + d.orders, 0);
                    const pOrders  = dailySales.slice(0, half2).reduce((s, d) => s + d.orders, 0);
                    const wProfit  = Math.round(wRevenue * kpiSummary.grossMarginRate / 100);
                    const pProfit  = Math.round(pRevenue * (kpiSummary.grossMarginRate + kpiSummary.grossMarginRateDelta) / 100);
                    const revDelta = +((wRevenue - pRevenue) / pRevenue * 100).toFixed(1);
                    const ordDelta = +((wOrders - pOrders) / pOrders * 100).toFixed(1);
                    const cvrDelta = kpiSummary.cvrDelta;
                    const profDelta = +((wProfit - pProfit) / pProfit * 100).toFixed(1);

                    const overallEmoji = r.overallRating === 'good' ? '📈 好調な週でした' : r.overallRating === 'normal' ? '📊 普通の週でした' : '📉 厳しい週でした';
                    const overallBadgeClass = r.overallRating === 'good' ? 'bg-green-100 text-green-700' : r.overallRating === 'normal' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700';

                    const priorityBadge: Record<string, string> = {
                      urgent: 'bg-red-100 text-red-700',
                      high:   'bg-amber-100 text-amber-700',
                      normal: 'bg-blue-100 text-blue-700',
                    };
                    const priorityLabel: Record<string, string> = {
                      urgent: '🔴 最優先',
                      high:   '🟡 優先',
                      normal: '🔵 通常',
                    };
                    const agentBadge: Record<string, string> = {
                      build:     'bg-purple-100 text-purple-700',
                      marketing: 'bg-blue-100 text-blue-700',
                      inventory: 'bg-teal-100 text-teal-700',
                      analytics: 'bg-amber-100 text-amber-700',
                    };
                    const agentLabel: Record<string, string> = {
                      build: '構築AI', marketing: '集客AI', inventory: '在庫AI', analytics: '分析AI',
                    };
                    const agentPath: Record<string, string> = {
                      build: '/agents/build', marketing: '/agents/marketing',
                      inventory: '/agents/inventory', analytics: '/agents/analytics',
                    };

                    const deltaEl = (v: number) =>
                      v >= 0
                        ? <span className="text-green-600 text-xs">↑ +{v}%</span>
                        : <span className="text-red-500 text-xs">↓ {v}%</span>;

                    return (
                      <div className="px-4 pb-6 pt-4 space-y-5 border-t bg-white">
                        {/* Section 1: Weekly KPI */}
                        <div className="bg-white border rounded-xl p-5">
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">今週のサマリー</h3>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { label: '今週の売上',   value: yen(wRevenue), d: revDelta },
                              { label: '注文数',       value: `${wOrders}件`, d: ordDelta },
                              { label: 'CVR',          value: `${kpiSummary.cvr}%`, d: cvrDelta },
                              { label: '粗利',         value: yen(wProfit), d: profDelta },
                            ].map((item) => (
                              <div key={item.label} className="bg-slate-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-slate-500">{item.label}</p>
                                <p className="text-base font-semibold text-slate-800 mt-0.5">{item.value}</p>
                                <div className="mt-0.5">{deltaEl(item.d)}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 text-center">
                            <span className={`inline-block text-base px-6 py-2 rounded-full font-medium ${overallBadgeClass}`}>
                              {overallEmoji}
                            </span>
                          </div>
                        </div>

                        {/* Section 2: Good points */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                          <h3 className="text-sm font-medium text-green-700 mb-3">✅ 良かったこと</h3>
                          <div className="space-y-2">
                            {r.goodPoints.map((g, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="shrink-0 w-4 h-4 bg-green-500 rounded-full mt-0.5" />
                                <div>
                                  <p className="text-sm text-green-800">{g.title}</p>
                                  <p className="text-xs text-green-600 mt-0.5">{g.detail}</p>
                                  <p className="text-xs text-green-600 font-medium mt-0.5">
                                    → 売上+¥{g.revenueImpact.toLocaleString()}に貢献
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Section 3: Bad points */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                          <h3 className="text-sm font-medium text-red-700 mb-3">⚠️ 改善が必要なこと</h3>
                          <div className="space-y-3">
                            {r.badPoints.map((b, i) => (
                              <div key={i}>
                                <p className="font-medium text-sm text-red-800">{b.title}</p>
                                <p className="text-xs text-red-600 mt-0.5">原因: {b.cause}</p>
                                <p className="text-xs text-red-500 font-medium mt-0.5">
                                  → 機会損失 約¥{b.lossImpact.toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Section 4: Next week tasks */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                          <h3 className="text-sm font-medium text-blue-700">🚀 来週のアクションプラン</h3>
                          <p className="text-xs text-blue-500 mt-1 mb-3">
                            ※月曜日の今朝のブリーフに自動反映されます
                          </p>
                          <div className="space-y-3">
                            {r.nextWeekTasks.map((task) => (
                              <div key={task.id} className="bg-white border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityBadge[task.priority] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {priorityLabel[task.priority] ?? '通常'}
                                  </span>
                                  <button
                                    onClick={() => router.push(agentPath[task.agent] ?? '/')}
                                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${agentBadge[task.agent] ?? 'bg-slate-100 text-slate-600'} hover:opacity-80 transition-opacity`}
                                  >
                                    {agentLabel[task.agent] ?? task.agent}
                                  </button>
                                </div>
                                <p className="font-medium text-sm text-slate-800 mt-2">{task.title}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  実施すると+¥{task.expectedImpact.toLocaleString()}が見込めます
                                </p>
                                <ul className="mt-1 space-y-0.5">
                                  {task.steps.map((step, si) => (
                                    <li key={si} className="text-xs text-slate-400">• {step}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Section 5: Dangers */}
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5">
                          <h3 className="font-medium text-base text-orange-700 mb-3">🚨 放置すると危険なこと</h3>
                          <div className="space-y-3">
                            {r.dangers.map((danger, di) => (
                              <div key={di} className="bg-white border border-orange-200 rounded-lg p-4 relative">
                                <p className="font-medium text-sm text-orange-800">{danger.title}</p>
                                <p className="text-xs text-orange-600 mt-1">{danger.description}</p>
                                <p className="text-xs text-red-500 font-medium mt-1">
                                  放置すると月間-¥{danger.riskAmount.toLocaleString()}の損失リスク
                                </p>
                                <div className="mt-2 relative">
                                  <button
                                    onClick={() => {
                                      setDangerToastIdx(di);
                                      setTimeout(() => setDangerToastIdx(null), 3000);
                                    }}
                                    className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded hover:bg-orange-600 transition-colors"
                                  >
                                    今すぐ対処する
                                  </button>
                                  {dangerToastIdx === di && (
                                    <span className="ml-3 text-xs text-orange-700 font-medium animate-in fade-in duration-200">
                                      対処タスクをブリーフに追加しました
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Section 6: Actions */}
                        <div className="border-t pt-4 flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => {
                              const text = [
                                `【${r.weekLabel} 週次レポート】`,
                                `総合評価: ${r.overallRating === 'good' ? '好調' : r.overallRating === 'normal' ? '普通' : '要注意'}`,
                                '',
                                '■ 良かったこと',
                                ...r.goodPoints.map((g) => `・${g.title}`),
                                '',
                                '■ 改善が必要なこと',
                                ...r.badPoints.map((b) => `・${b.title}`),
                                '',
                                '■ 来週のアクション',
                                ...r.nextWeekTasks.map((t) => `・${t.title}`),
                              ].join('\n');
                              navigator.clipboard.writeText(text);
                              setReportCopied(true);
                              setTimeout(() => setReportCopied(false), 2000);
                            }}
                            className="border text-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                          >
                            {reportCopied ? '✓ コピーしました' : 'レポートをコピーする'}
                          </button>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={autoReport}
                              onChange={handleAutoReportToggle}
                              className="w-4 h-4 accent-blue-900 cursor-pointer"
                            />
                            <span className="text-sm text-slate-600">次回も自動生成する</span>
                          </label>
                          <a href="/dashboard" className="text-sm text-blue-900 hover:underline ml-auto">
                            ダッシュボードに戻る
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
      </TabsContent>
    </div>
  );
}
