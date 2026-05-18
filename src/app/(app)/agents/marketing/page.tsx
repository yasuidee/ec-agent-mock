'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Users, Wallet, Copy, Check, X as XIcon, Plus, Megaphone, Target, StopCircle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { AgentBriefCard } from '@/components/AgentBriefCard';
import { PageSkeleton } from '@/components/PageSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { topProducts } from '@/lib/mock-data';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HistoryRow {
  id: string;
  datetime: string;
  action: string;
  channel: string;
  result: string;
}

type Judgment = 'good' | 'warning' | 'danger';

interface BudgetJudgeResult {
  verdict: 'increase' | 'maintain' | 'decrease';
  recommendedBudget: number;
  reason: string;
  expectedRevenueLift: number;
  savedAmount: number;
  roasJudgment: Judgment;
  roasComment: string;
  stockJudgment: Judgment;
  stockComment: string;
  marginJudgment: Judgment;
  marginComment: string;
}

interface AdResult {
  adName: string;
  verdict: 'continue' | 'improve' | 'stop';
  roas: number;
  cpa: number;
  cvr: number;
  monthlyProfit: number;
  roasJudgment: Judgment;
  cpaJudgment: Judgment;
  cvrJudgment: Judgment;
  reason: string;
  action?: string;
}

interface AdStopResult {
  results: AdResult[];
  summary: { continueCount: number; improveCount: number; stopCount: number };
}

interface AdRow {
  id: string;
  adName: string;
  monthlySpend: string;
  adRevenue: string;
  clicks: string;
  conversions: string;
}

interface AdPlanForm {
  objective: string;
  platforms: string[];
  budget: string;
  productName: string;
  targetAudience: string;
  targetKpi: string;
  campaignPeriod: string;
}

interface MetaPlan {
  objective: string;
  dailyBudget: number;
  targetAge: string;
  targetGender: string;
  targetLocation: string;
  interests: string[];
  adType: string;
  mainCopy: string;
  headline: string;
  cta: string;
}

interface GooglePlan {
  campaignType: string;
  dailyBudget: number;
  biddingStrategy: string;
  keywords: string[];
  negativeKeywords: string[];
  matchType: string;
  headline1: string;
  headline2: string;
  description: string;
}

interface AdPlanResult {
  metaPlan: MetaPlan;
  googlePlan: GooglePlan;
  forecast: {
    monthlyImpressions: number;
    monthlyClicks: number;
    expectedRoas: number;
    expectedOrders: number;
  };
}

interface ImprovementCampaign {
  name: string;
  status: 'good' | 'improve' | 'stop';
  currentRoas: number;
  improvements: {
    targeting: string;
    budget: { current: number; recommended: number; reason: string };
    creative: string;
    keywords: { add: string[]; remove: string[] };
  };
  expectedRoasAfter: number;
  lossAmount: number;
}

interface ImprovementResult {
  campaigns: ImprovementCampaign[];
}

interface ImproveCampaignRow {
  id: string;
  name: string;
  spend: string;
  clicks: string;
  purchases: string;
  roas: string;
  platform: 'meta' | 'google';
  cvr: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const kpis = [
  { id: 'spend', label: '広告費合計', value: '¥48,000', delta: '+12%', positive: true, sub: '前週比', icon: Wallet },
  { id: 'roas', label: 'ROAS', value: '3.8倍', delta: '+0.4', positive: true, sub: '前週比', icon: TrendingUp },
  { id: 'newCustomers', label: '新規顧客', value: '23人', delta: '+8%', positive: true, sub: '前週比', icon: Users },
];

const budgetData = [
  { name: 'ヒノキカッティングボード', budget: 18000 },
  { name: '南部鉄器急須',             budget: 15000 },
  { name: '有田焼マグカップ',          budget: 8000  },
  { name: '和紙ノート',               budget: 4000  },
  { name: '漆塗り箸',                 budget: 3000  },
];

const historyRows: HistoryRow[] = [
  { id: 'h1', datetime: '2026-05-15 10:30', action: 'ヒノキカッティングボード Instagram広告配信',    channel: 'Instagram', result: 'CVR +15%'      },
  { id: 'h2', datetime: '2026-05-14 09:15', action: '南部鉄器急須 Google ショッピング最適化',         channel: 'Google',    result: 'ROAS 4.2倍'   },
  { id: 'h3', datetime: '2026-05-13 14:00', action: '有田焼マグカップ X プロモーション投稿',           channel: 'X',         result: 'インプ +3,200' },
  { id: 'h4', datetime: '2026-05-13 11:20', action: '全商品 メルマガ配信（リピーター向け）',            channel: 'メール',    result: '開封率 32%'   },
  { id: 'h5', datetime: '2026-05-12 16:45', action: '和紙ノート Facebook 類似オーディエンス拡張',      channel: 'Facebook',  result: '新規 +9人'    },
];

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function judgmentIcon(j: Judgment) {
  if (j === 'good') return '✅';
  if (j === 'warning') return '⚠️';
  return '🚨';
}

function judgmentColor(j: Judgment) {
  if (j === 'good') return 'text-green-600';
  if (j === 'warning') return 'text-amber-600';
  return 'text-red-500';
}

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

// ─── Initial ad rows from topProducts ────────────────────────────────────────

const initialAdRows: AdRow[] = [
  { id: '1', adName: `${topProducts[0].name}_検索広告`,  monthlySpend: '18000', adRevenue: '68400', clicks: '2400', conversions: '168' },
  { id: '2', adName: `${topProducts[1].name}_ショッピング`, monthlySpend: '8000',  adRevenue: '9600',  clicks: '800',  conversions: '30'  },
  { id: '3', adName: `${topProducts[2].name}_ブランド`,   monthlySpend: '15000', adRevenue: '63000', clicks: '1200', conversions: '84'  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketingAgentPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // ── Existing state ──────────────────────────────────────────────────────────
  const [budgetExecuted, setBudgetExecuted] = useState(false);

  // ── Ad assistant state ──────────────────────────────────────────────────────
  const [adTab, setAdTab] = useState('planning');

  // Tab budget: Budget Judge
  const [t1Spend, setT1Spend] = useState('480000');
  const [t1Revenue, setT1Revenue] = useState('1824000');
  const [t1TargetRoas, setT1TargetRoas] = useState('3.0');
  const [t1Orders, setT1Orders] = useState('218');
  const [t1Margin, setT1Margin] = useState('40');
  const [t1StockDays, setT1StockDays] = useState('45');
  const [t1BudgetCap, setT1BudgetCap] = useState('700000');
  const [t1Competitor, setT1Competitor] = useState('normal');
  const [t1Loading, setT1Loading] = useState(false);
  const [t1Error, setT1Error] = useState(false);
  const [t1Result, setT1Result] = useState<BudgetJudgeResult | null>(null);
  const [t1BudgetCopied, setT1BudgetCopied] = useState(false);
  const [t1Toast, setT1Toast] = useState(false);

  const currentRoas = useMemo(() => {
    const spend = Number(t1Spend);
    const rev = Number(t1Revenue);
    if (!spend || spend <= 0) return '—';
    return (rev / spend).toFixed(2);
  }, [t1Spend, t1Revenue]);

  // Tab stop: Ad Stop Judge
  const [adRows, setAdRows] = useState<AdRow[]>(initialAdRows);
  const [t2Loading, setT2Loading] = useState(false);
  const [t2Error, setT2Error] = useState(false);
  const [t2Result, setT2Result] = useState<AdStopResult | null>(null);

  // Planning tab
  const [planForm, setPlanForm] = useState<AdPlanForm>({
    objective: '売上を増やしたい',
    platforms: [],
    budget: '100000',
    productName: topProducts[0]?.name ?? '',
    targetAudience: '',
    targetKpi: 'ROAS 3倍以上',
    campaignPeriod: '1ヶ月',
  });
  const [planResult, setPlanResult] = useState<AdPlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [metaChecks, setMetaChecks] = useState<Record<string, boolean>>({});
  const [googleChecks, setGoogleChecks] = useState<Record<string, boolean>>({});
  const [planCopied, setPlanCopied] = useState(false);

  // Improvement tab
  const initialImproveMeta: ImproveCampaignRow[] = [
    { id: 'im1', name: 'ヒノキボード_春の特集', spend: '120000', clicks: '2400', purchases: '42', roas: '', cvr: '', platform: 'meta' },
    { id: 'im2', name: '有田焼_新商品告知', spend: '80000', clicks: '800', purchases: '8', roas: '', cvr: '', platform: 'meta' },
  ];
  const initialImproveGoogle: ImproveCampaignRow[] = [];
  const [improveMetaRows, setImproveMetaRows] = useState<ImproveCampaignRow[]>(initialImproveMeta);
  const [improveGoogleRows, setImproveGoogleRows] = useState<ImproveCampaignRow[]>(initialImproveGoogle);
  const [improveTargetRoas, setImproveTargetRoas] = useState('3.0');
  const [improveTargetCpa, setImproveTargetCpa] = useState('3000');
  const [improveBudgetCap, setImproveBudgetCap] = useState('500000');
  const [improvementResult, setImprovementResult] = useState<ImprovementResult | null>(null);
  const [improvementLoading, setImprovementLoading] = useState(false);
  const [improveChecks, setImproveChecks] = useState<Record<string, boolean>>({});
  const [improveAdPlatformTab, setImproveAdPlatformTab] = useState('meta');

  if (!ready) return <PageSkeleton />;

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Tab budget
  const handleBudgetJudge = async () => {
    setT1Loading(true);
    setT1Result(null);
    setT1Error(false);
    try {
      const res = await fetch('/api/ad-budget-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adSpend: t1Spend,
          adRevenue: t1Revenue,
          roas: currentRoas,
          targetRoas: t1TargetRoas,
          adOrders: t1Orders,
          marginRate: t1Margin,
          stockDays: t1StockDays,
          budgetCap: t1BudgetCap,
          competitorStrength: t1Competitor,
        }),
      });
      const data = await res.json();
      setT1Result(data);
    } catch {
      setT1Result(null);
      setT1Error(true);
    } finally {
      setT1Loading(false);
    }
  };

  const handleT1BudgetCopy = () => {
    if (!t1Result) return;
    navigator.clipboard.writeText(`¥${t1Result.recommendedBudget.toLocaleString()}`);
    setT1BudgetCopied(true);
    setTimeout(() => setT1BudgetCopied(false), 2000);
  };

  const handleT1Delegate = () => {
    setT1Toast(true);
    setTimeout(() => setT1Toast(false), 3000);
  };

  // Tab stop
  const addAdRow = () => {
    if (adRows.length >= 10) return;
    setAdRows((prev) => [
      ...prev,
      { id: Date.now().toString(), adName: '', monthlySpend: '', adRevenue: '', clicks: '', conversions: '' },
    ]);
  };

  const removeAdRow = (id: string) => {
    setAdRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateAdRow = (id: string, field: keyof AdRow, value: string) => {
    setAdRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleAdStopJudge = async () => {
    setT2Loading(true);
    setT2Result(null);
    setT2Error(false);
    try {
      const res = await fetch('/api/ad-stop-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ads: adRows }),
      });
      const data = await res.json();
      setT2Result(data);
    } catch {
      setT2Result(null);
      setT2Error(true);
    } finally {
      setT2Loading(false);
    }
  };

  const handlePlanCreate = async () => {
    setPlanLoading(true);
    setPlanResult(null);
    try {
      const res = await fetch('/api/ad-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: planForm.objective,
          platforms: planForm.platforms,
          budget: Number(planForm.budget),
          productName: planForm.productName,
          targetAudience: planForm.targetAudience,
          targetKpi: planForm.targetKpi,
        }),
      });
      setPlanResult(await res.json());
    } catch {
      setPlanResult(null);
    } finally {
      setPlanLoading(false);
    }
  };

  const handlePlanCopy = () => {
    if (!planResult) return;
    const text = JSON.stringify(planResult, null, 2);
    navigator.clipboard.writeText(text);
    setPlanCopied(true);
    setTimeout(() => setPlanCopied(false), 2000);
  };

  const addImproveRow = (platform: 'meta' | 'google') => {
    const newRow: ImproveCampaignRow = {
      id: Date.now().toString(), name: '', spend: '', clicks: '',
      purchases: '', roas: '', cvr: '', platform,
    };
    if (platform === 'meta') setImproveMetaRows(prev => [...prev, newRow]);
    else setImproveGoogleRows(prev => [...prev, newRow]);
  };

  const removeImproveRow = (id: string, platform: 'meta' | 'google') => {
    if (platform === 'meta') setImproveMetaRows(prev => prev.filter(r => r.id !== id));
    else setImproveGoogleRows(prev => prev.filter(r => r.id !== id));
  };

  const updateImproveRow = (id: string, field: keyof ImproveCampaignRow, value: string, platform: 'meta' | 'google') => {
    if (platform === 'meta') setImproveMetaRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    else setImproveGoogleRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleImprovementAnalyze = async () => {
    setImprovementLoading(true);
    setImprovementResult(null);
    const avgOrderValue = 5500;
    const campaigns = [
      ...improveMetaRows.map(r => ({
        name: r.name,
        spend: Number(r.spend),
        clicks: Number(r.clicks),
        purchases: Number(r.purchases),
        roas: r.purchases && r.spend ? Number(r.purchases) * avgOrderValue / Number(r.spend) : 0,
        platform: 'meta',
      })),
      ...improveGoogleRows.map(r => ({
        name: r.name,
        spend: Number(r.spend),
        clicks: Number(r.clicks),
        cvr: Number(r.cvr),
        roas: Number(r.roas),
        platform: 'google',
      })),
    ].filter(c => c.name);
    try {
      const res = await fetch('/api/ad-improvement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaigns, targetRoas: Number(improveTargetRoas), targetCpa: Number(improveTargetCpa) }),
      });
      setImprovementResult(await res.json());
    } catch {
      setImprovementResult(null);
    } finally {
      setImprovementLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────── */}
      <PageHeader
        title="集客AI"
        description="広告プランニング・改善提案・予算判断をAIがサポートします"
      />

      <AgentBriefCard category="marketing" />

      {/* ── 2. KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(({ id, label, value, delta, positive, sub, icon: Icon }) => (
          <div key={id} className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
              <Icon size={16} className="text-slate-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
            <p className="text-xs mt-1">
              <span className={positive ? 'text-green-600' : 'text-red-500'}>↑ {delta}</span>
              <span className="text-slate-400 ml-1">{sub}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── 3. Budget allocation ──────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📊 今週の予算配分提案</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={budgetData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip
              formatter={(v) => [`¥${Number(v).toLocaleString('ja-JP')}`, '推奨予算']}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="budget" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4">
          {budgetExecuted ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-md">
              <Check size={14} />
              配分を適用しました
            </span>
          ) : (
            <button
              onClick={() => setBudgetExecuted(true)}
              className="bg-blue-900 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              この配分で実行する
            </button>
          )}
        </div>
      </div>

      {/* ── Separator ─────────────────────────────────────── */}
      <hr className="border-slate-200" />

      {/* ── 4. 広告判断アシスタント ───────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-1">🎯 広告判断アシスタント</h2>
        <p className="text-sm text-slate-500 mb-5">
          広告予算・継続・出稿商品・ページ改善をAIが一括判断します
        </p>

        <Tabs value={adTab} onValueChange={setAdTab}>
          <TabsList className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 h-auto w-full mb-6">
            <TabsTrigger value="planning" className="flex items-center gap-2 px-4 py-4 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
              <Megaphone className="w-4 h-4" />広告プランニング
            </TabsTrigger>
            <TabsTrigger value="improvement" className="flex items-center gap-2 px-4 py-4 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
              <Target className="w-4 h-4" />広告改善提案
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2 px-4 py-4 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
              <Wallet className="w-4 h-4" />予算判断
            </TabsTrigger>
            <TabsTrigger value="stop" className="flex items-center gap-2 px-4 py-4 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
              <StopCircle className="w-4 h-4" />停止判断
            </TabsTrigger>
          </TabsList>

          {/* ══ PLANNING TAB ══ */}
          <TabsContent value="planning">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">📋 新しい広告キャンペーンのプランニングをサポートします。AIが生成した指示書をもとに広告管理画面で設定してください。</p>
              </div>

              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">キャンペーン情報を入力</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">広告の目的</label>
                      <select
                        value={planForm.objective}
                        onChange={e => setPlanForm(f => ({ ...f, objective: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
                      >
                        <option>売上を増やしたい</option>
                        <option>新規顧客を獲得したい</option>
                        <option>ブランド認知を広げたい</option>
                        <option>特定商品を売り切りたい</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">掲載プラットフォーム</label>
                      <div className="flex gap-4 mt-1">
                        {['Meta(Facebook/Instagram)', 'Google検索広告', 'Googleショッピング'].map(p => (
                          <label key={p} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={planForm.platforms.includes(p)}
                              onChange={() => setPlanForm(f => ({
                                ...f,
                                platforms: f.platforms.includes(p)
                                  ? f.platforms.filter(x => x !== p)
                                  : [...f.platforms, p],
                              }))}
                              className="rounded"
                            />
                            {p}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">月間予算</label>
                      <div className="flex items-center gap-2">
                        <Input type="number" value={planForm.budget} onChange={e => setPlanForm(f => ({ ...f, budget: e.target.value }))} placeholder="100000" className="flex-1 text-sm" />
                        <span className="text-xs text-slate-400 shrink-0">円</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">キャンペーン期間</label>
                      <select
                        value={planForm.campaignPeriod}
                        onChange={e => setPlanForm(f => ({ ...f, campaignPeriod: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
                      >
                        <option>1週間</option>
                        <option>2週間</option>
                        <option>1ヶ月</option>
                        <option>継続的に</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">メイン商品</label>
                      <select
                        value={planForm.productName}
                        onChange={e => setPlanForm(f => ({ ...f, productName: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
                      >
                        {topProducts.map(p => <option key={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">ターゲット顧客</label>
                      <textarea
                        value={planForm.targetAudience}
                        onChange={e => setPlanForm(f => ({ ...f, targetAudience: e.target.value }))}
                        rows={3}
                        placeholder="例: 料理好きな30-40代の女性、プレゼントを探している方"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">目標KPI</label>
                      <select
                        value={planForm.targetKpi}
                        onChange={e => setPlanForm(f => ({ ...f, targetKpi: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
                      >
                        <option>ROAS 3倍以上</option>
                        <option>ROAS 2倍以上</option>
                        <option>CPA ¥3,000以下</option>
                        <option>CPA ¥5,000以下</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePlanCreate}
                  disabled={planLoading || planForm.platforms.length === 0}
                  className="mt-6 w-full bg-blue-900 hover:bg-blue-950 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {planLoading ? (
                    <><span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />プラン作成中...</>
                  ) : 'AIに広告プランを作成してもらう'}
                </button>
                {planForm.platforms.length === 0 && <p className="text-xs text-amber-600 mt-2 text-center">プラットフォームを1つ以上選択してください</p>}
              </div>

              {planResult && (
                <div className="bg-white border-2 border-blue-900 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-blue-900">📋 広告設定指示書</h3>
                    <button
                      onClick={handlePlanCopy}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {planCopied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
                      {planCopied ? 'コピーしました' : '指示書をコピーする'}
                    </button>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-3 mb-4 text-sm text-amber-700">
                    ⚠️ この指示書はAIが生成した推奨設定です。実際の設定は各広告管理画面で手動で行ってください。
                  </div>

                  {planForm.platforms.some(p => p.includes('Meta')) && (
                    <div className="bg-slate-50 rounded-xl p-5 mb-4">
                      <p className="font-medium text-slate-800 mb-3">Meta広告 設定手順</p>
                      <div className="space-y-3">
                        {[
                          { key: 'objective', label: 'キャンペーン目的', value: planResult.metaPlan.objective, location: 'キャンペーン作成 > キャンペーンの目的' },
                          { key: 'dailyBudget', label: '1日の予算', value: `¥${planResult.metaPlan.dailyBudget.toLocaleString()}`, location: '広告セット > 予算と日程' },
                          { key: 'targetAge', label: 'ターゲット年齢', value: planResult.metaPlan.targetAge, location: '広告セット > オーディエンス > 年齢' },
                          { key: 'interests', label: 'ターゲット興味関心', value: planResult.metaPlan.interests.join(', '), location: '広告セット > オーディエンス > 詳細なターゲット設定' },
                          { key: 'mainCopy', label: '広告コピー（メインテキスト）', value: planResult.metaPlan.mainCopy, location: '広告 > 広告クリエイティブ' },
                          { key: 'headline', label: '見出し', value: planResult.metaPlan.headline, location: '広告 > 広告クリエイティブ > 見出し' },
                          { key: 'cta', label: 'CTAボタン', value: planResult.metaPlan.cta, location: '広告 > 広告クリエイティブ > 行動を促すフレーズ' },
                        ].map(item => (
                          <label key={item.key} className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 rounded-lg p-3 transition-colors">
                            <input
                              type="checkbox"
                              checked={metaChecks[item.key] || false}
                              onChange={() => setMetaChecks(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className="mt-0.5 rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{item.label}</p>
                              <p className="text-xs text-slate-500">設定値: {item.value}</p>
                              <p className="text-xs text-blue-600">設定場所: {item.location}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{Object.values(metaChecks).filter(Boolean).length}/7項目を設定しました</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-900 rounded-full transition-all" style={{ width: `${(Object.values(metaChecks).filter(Boolean).length / 7) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {planForm.platforms.some(p => p.includes('Google')) && (
                    <div className="bg-slate-50 rounded-xl p-5 mb-4">
                      <p className="font-medium text-slate-800 mb-3">Google広告 設定手順</p>
                      <div className="space-y-3">
                        {[
                          { key: 'campaignType', label: 'キャンペーンタイプ', value: planResult.googlePlan.campaignType, location: 'キャンペーン作成 > キャンペーンタイプ' },
                          { key: 'dailyBudget', label: '1日の予算', value: `¥${planResult.googlePlan.dailyBudget.toLocaleString()}`, location: 'キャンペーン > 予算' },
                          { key: 'biddingStrategy', label: '入札戦略', value: planResult.googlePlan.biddingStrategy, location: 'キャンペーン > 入札戦略' },
                          { key: 'keywords', label: 'キーワード', value: planResult.googlePlan.keywords.join(', '), location: 'キーワード > キーワードを追加' },
                          { key: 'negativeKeywords', label: '除外キーワード', value: planResult.googlePlan.negativeKeywords.join(', '), location: 'キーワード > 除外キーワード' },
                          { key: 'headline1', label: '見出し1', value: planResult.googlePlan.headline1, location: '広告 > レスポンシブ検索広告' },
                          { key: 'description', label: '説明文', value: planResult.googlePlan.description, location: '広告 > レスポンシブ検索広告 > 説明文' },
                        ].map(item => (
                          <label key={item.key} className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 rounded-lg p-3 transition-colors">
                            <input
                              type="checkbox"
                              checked={googleChecks[item.key] || false}
                              onChange={() => setGoogleChecks(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className="mt-0.5 rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{item.label}</p>
                              <p className="text-xs text-slate-500">設定値: {item.value}</p>
                              <p className="text-xs text-blue-600">設定場所: {item.location}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{Object.values(googleChecks).filter(Boolean).length}/7項目を設定しました</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-900 rounded-full transition-all" style={{ width: `${(Object.values(googleChecks).filter(Boolean).length / 7) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-4">
                    <p className="font-medium text-slate-800">📊 このプランの期待値（目安）</p>
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      {[
                        { label: '月間インプレッション', value: `約${planResult.forecast.monthlyImpressions.toLocaleString()}回` },
                        { label: '月間クリック数', value: `約${planResult.forecast.monthlyClicks.toLocaleString()}回` },
                        { label: '期待ROAS', value: `${planResult.forecast.expectedRoas}倍` },
                        { label: '期待注文数', value: `約${planResult.forecast.expectedOrders}件` },
                      ].map(item => (
                        <div key={item.label} className="bg-white border rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-500">{item.label}</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-3">※予測値はAIの試算です。実際の結果は市場状況により異なります。</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ══ IMPROVEMENT TAB ══ */}
          <TabsContent value="improvement">
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-700">📈 稼働中の広告データを入力すると、AIが具体的な改善指示書を生成します。指示書をもとに広告管理画面で修正してください。</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">稼働中の広告データを入力</h3>

                <Tabs value={improveAdPlatformTab} onValueChange={setImproveAdPlatformTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="meta">Meta広告</TabsTrigger>
                    <TabsTrigger value="google">Google広告</TabsTrigger>
                  </TabsList>

                  <TabsContent value="meta">
                    <button
                      onClick={() => addImproveRow('meta')}
                      disabled={improveMetaRows.length >= 8}
                      className="flex items-center gap-1.5 border text-sm px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors mb-3"
                    >
                      <Plus size={14} />広告を追加する
                    </button>
                    {improveMetaRows.map(row => {
                      const roas = row.purchases && row.spend ? (Number(row.purchases) * 5500 / Number(row.spend)).toFixed(2) : '—';
                      return (
                        <div key={row.id} className="border border-slate-200 rounded-xl p-4 mb-3 relative">
                          <button onClick={() => removeImproveRow(row.id, 'meta')} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"><XIcon size={16} /></button>
                          <div className="grid grid-cols-5 gap-3 pr-6">
                            <div className="space-y-1"><label className="text-xs text-slate-500">キャンペーン名</label><Input value={row.name} onChange={e => updateImproveRow(row.id, 'name', e.target.value, 'meta')} placeholder="春の新商品キャンペーン" className="text-xs" /></div>
                            <div className="space-y-1"><label className="text-xs text-slate-500">月間費用（円）</label><Input type="number" value={row.spend} onChange={e => updateImproveRow(row.id, 'spend', e.target.value, 'meta')} placeholder="120000" className="text-xs" /></div>
                            <div className="space-y-1"><label className="text-xs text-slate-500">クリック数</label><Input type="number" value={row.clicks} onChange={e => updateImproveRow(row.id, 'clicks', e.target.value, 'meta')} placeholder="2400" className="text-xs" /></div>
                            <div className="space-y-1"><label className="text-xs text-slate-500">購入数</label><Input type="number" value={row.purchases} onChange={e => updateImproveRow(row.id, 'purchases', e.target.value, 'meta')} placeholder="42" className="text-xs" /></div>
                            <div className="space-y-1"><label className="text-xs text-slate-500">ROAS（自動計算）</label><div className="border rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-600">{roas}{roas !== '—' ? '倍' : ''}</div></div>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="google">
                    <button
                      onClick={() => addImproveRow('google')}
                      disabled={improveGoogleRows.length >= 8}
                      className="flex items-center gap-1.5 border text-sm px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors mb-3"
                    >
                      <Plus size={14} />広告を追加する
                    </button>
                    {improveGoogleRows.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">「広告を追加する」ボタンでGoogle広告データを入力してください</p>
                    )}
                    {improveGoogleRows.map(row => (
                      <div key={row.id} className="border border-slate-200 rounded-xl p-4 mb-3 relative">
                        <button onClick={() => removeImproveRow(row.id, 'google')} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"><XIcon size={16} /></button>
                        <div className="grid grid-cols-5 gap-3 pr-6">
                          <div className="space-y-1"><label className="text-xs text-slate-500">キャンペーン名</label><Input value={row.name} onChange={e => updateImproveRow(row.id, 'name', e.target.value, 'google')} className="text-xs" /></div>
                          <div className="space-y-1"><label className="text-xs text-slate-500">月間費用（円）</label><Input type="number" value={row.spend} onChange={e => updateImproveRow(row.id, 'spend', e.target.value, 'google')} className="text-xs" /></div>
                          <div className="space-y-1"><label className="text-xs text-slate-500">クリック数</label><Input type="number" value={row.clicks} onChange={e => updateImproveRow(row.id, 'clicks', e.target.value, 'google')} className="text-xs" /></div>
                          <div className="space-y-1"><label className="text-xs text-slate-500">CVR(%)</label><Input type="number" step="0.1" value={row.cvr} onChange={e => updateImproveRow(row.id, 'cvr', e.target.value, 'google')} className="text-xs" /></div>
                          <div className="space-y-1"><label className="text-xs text-slate-500">ROAS</label><Input type="number" step="0.1" value={row.roas} onChange={e => updateImproveRow(row.id, 'roas', e.target.value, 'google')} className="text-xs" /></div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">目標ROAS</label>
                      <div className="flex items-center gap-2"><Input type="number" step="0.1" value={improveTargetRoas} onChange={e => setImproveTargetRoas(e.target.value)} placeholder="3.0" className="flex-1 text-sm" /><span className="text-xs text-slate-400 shrink-0">倍</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">目標CPA</label>
                      <div className="flex items-center gap-2"><Input type="number" value={improveTargetCpa} onChange={e => setImproveTargetCpa(e.target.value)} placeholder="3000" className="flex-1 text-sm" /><span className="text-xs text-slate-400 shrink-0">円</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">月間予算上限</label>
                      <div className="flex items-center gap-2"><Input type="number" value={improveBudgetCap} onChange={e => setImproveBudgetCap(e.target.value)} placeholder="500000" className="flex-1 text-sm" /><span className="text-xs text-slate-400 shrink-0">円</span></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleImprovementAnalyze}
                  disabled={improvementLoading}
                  className="mt-4 w-full bg-blue-900 hover:bg-blue-950 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {improvementLoading ? (
                    <><span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />分析中...</>
                  ) : 'AIに改善提案を作成してもらう'}
                </button>
              </div>

              {improvementResult && (
                <div className="space-y-4">
                  {improvementResult.campaigns.map((c, i) => {
                    const checkPrefix = `c${i}`;
                    if (c.status === 'good') return (
                      <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <p className="font-semibold text-green-700">✅ {c.name}: 目標達成中</p>
                        <p className="text-sm text-slate-600 mt-1">現在ROAS {c.currentRoas}倍 / 目標{improveTargetRoas}倍</p>
                        <p className="text-sm text-slate-500 mt-2">このキャンペーンは現在の設定を維持してください。</p>
                      </div>
                    );
                    if (c.status === 'stop') return (
                      <div key={i} className="bg-red-50 border-2 border-red-400 rounded-xl p-5">
                        <p className="font-semibold text-red-700">🛑 {c.name}: 停止を推奨</p>
                        <p className="text-sm text-slate-600 mt-1">ROAS {c.currentRoas}倍は採算ラインを下回っています</p>
                        <p className="text-sm text-red-600 mt-1">月間損失推定: ¥{c.lossAmount.toLocaleString()}</p>
                        <div className="mt-3 space-y-2">
                          {[
                            `Step 1: 広告管理画面にログイン`,
                            `Step 2: キャンペーン一覧から「${c.name}」を選択`,
                            `Step 3: ステータスを「一時停止」に変更`,
                            `Step 4: 節約できた予算を改善中のキャンペーンに振り替える`,
                          ].map((step, j) => (
                            <label key={j} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-white rounded-lg p-3 transition-colors">
                              <input type="checkbox" checked={improveChecks[`${checkPrefix}_stop_${j}`] || false} onChange={() => setImproveChecks(prev => ({ ...prev, [`${checkPrefix}_stop_${j}`]: !prev[`${checkPrefix}_stop_${j}`] }))} className="rounded" />
                              {step}
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">※この指示書はAIの提案です。実際の操作は広告管理画面で手動で行ってください。</p>
                      </div>
                    );
                    return (
                      <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <p className="font-semibold text-amber-700">⚠️ {c.name}: 改善が必要</p>
                        <p className="text-sm text-slate-600 mt-1">現在ROAS {c.currentRoas}倍 / 目標{improveTargetRoas}倍</p>
                        <div className="bg-white rounded-lg p-4 mt-3">
                          <p className="text-sm font-medium text-slate-800 mb-3">以下を広告管理画面で修正してください:</p>
                          <div className="space-y-3">
                            {[
                              { key: 'targeting', label: 'ターゲティングの修正', detail: c.improvements.targeting, location: '広告セット > オーディエンス' },
                              { key: 'budget', label: '予算の調整', detail: `現在¥${c.improvements.budget.current}/日 → 推奨¥${c.improvements.budget.recommended}/日（${c.improvements.budget.reason}）`, location: 'キャンペーン > 予算と日程' },
                              { key: 'creative', label: 'クリエイティブの変更', detail: c.improvements.creative, location: '広告 > クリエイティブを編集' },
                              { key: 'keywords', label: 'キーワード最適化', detail: `追加: ${c.improvements.keywords.add.join(', ')} / 除外: ${c.improvements.keywords.remove.join(', ')}`, location: 'キーワード' },
                            ].map(item => (
                              <label key={item.key} className="flex items-start gap-3 cursor-pointer hover:bg-white rounded-lg p-3 transition-colors">
                                <input type="checkbox" checked={improveChecks[`${checkPrefix}_${item.key}`] || false} onChange={() => setImproveChecks(prev => ({ ...prev, [`${checkPrefix}_${item.key}`]: !prev[`${checkPrefix}_${item.key}`] }))} className="mt-0.5 rounded" />
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                                  <p className="text-xs text-slate-500">{item.detail}</p>
                                  <p className="text-xs text-blue-600">設定場所: {item.location}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 mt-3">
                            <p className="text-sm text-blue-700">改善後の期待ROAS: {c.expectedRoasAfter.toFixed(1)}倍（現在比 +{(c.expectedRoasAfter - c.currentRoas).toFixed(1)}倍）</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">※この指示書はAIの提案です。実際の設定は広告管理画面で手動で行ってください。</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB budget: 予算判断
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="budget">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-1">💰 広告費を増やすべきか判断します</h3>
              <p className="text-sm text-slate-500 mb-5">
                現在の数値を入力するだけで、AIが増額・現状維持・削減を判断します
              </p>

              <div className="grid grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">今月の広告費</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t1Spend}
                        onChange={(e) => setT1Spend(e.target.value)}
                        placeholder="480000"
                        className="flex-1 text-sm"
                      />
                      <span className="text-xs text-slate-400 shrink-0">円</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">今月の広告経由売上</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t1Revenue}
                        onChange={(e) => setT1Revenue(e.target.value)}
                        placeholder="1824000"
                        className="flex-1 text-sm"
                      />
                      <span className="text-xs text-slate-400 shrink-0">円</span>
                    </div>
                    {currentRoas !== '—' && (
                      <p className="text-sm text-blue-900 font-medium">
                        現在のROAS: {currentRoas}倍
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">目標ROAS</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={t1TargetRoas}
                        onChange={(e) => setT1TargetRoas(e.target.value)}
                        placeholder="3.0"
                        className="flex-1 text-sm"
                      />
                      <span className="text-xs text-slate-400 shrink-0">倍</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">今月の広告経由注文数</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t1Orders}
                        onChange={(e) => setT1Orders(e.target.value)}
                        placeholder="218"
                        className="flex-1 text-sm"
                      />
                      <span className="text-xs text-slate-400 shrink-0">件</span>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">商品の粗利率</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={t1Margin}
                        onChange={(e) => setT1Margin(e.target.value)}
                        placeholder="40"
                        className="flex-1 text-sm"
                      />
                      <span className="text-xs text-slate-400 shrink-0">%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">在庫残日数</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t1StockDays}
                        onChange={(e) => setT1StockDays(e.target.value)}
                        placeholder="45"
                        className="flex-1 text-sm"
                      />
                      <span className="text-xs text-slate-400 shrink-0">日</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">月間予算の上限</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t1BudgetCap}
                        onChange={(e) => setT1BudgetCap(e.target.value)}
                        placeholder="700000"
                        className="flex-1 text-sm"
                      />
                      <span className="text-xs text-slate-400 shrink-0">円</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">競合の広告強度</label>
                    <select
                      value={t1Competitor}
                      onChange={(e) => setT1Competitor(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
                    >
                      <option value="low">低い（自社が強い）</option>
                      <option value="normal">普通</option>
                      <option value="high">高い（競合が強い）</option>
                      <option value="unknown">分からない</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBudgetJudge}
                disabled={t1Loading}
                className="mt-6 w-full bg-blue-900 hover:bg-blue-950 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {t1Loading ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  'AIに判断してもらう'
                )}
              </button>
            </div>

            {/* Error */}
            {!t1Loading && t1Error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                <p className="text-sm text-red-600">分析中にエラーが発生しました。再試行してください。</p>
                <button
                  onClick={handleBudgetJudge}
                  className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition-colors shrink-0 ml-4"
                >
                  再試行
                </button>
              </div>
            )}

            {/* Result */}
            {t1Result && (
              <div className="mt-6">
                {/* Main verdict card */}
                {t1Result.verdict === 'increase' && (
                  <div className="bg-green-50 border-2 border-green-400 rounded-xl p-8 text-center">
                    <p className="text-6xl">↑</p>
                    <p className="text-2xl font-bold text-green-700 mt-2">広告費を増やしてください</p>
                    <p className="text-xl font-bold mt-2 text-slate-800">
                      ¥{Number(t1Spend).toLocaleString()} → ¥{t1Result.recommendedBudget.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 mt-3 leading-relaxed">{t1Result.reason}</p>
                    <div className="bg-green-100 rounded-lg p-3 mt-4">
                      <p className="text-sm font-medium text-green-800">
                        増額すると月+¥{t1Result.expectedRevenueLift.toLocaleString()}の売上増が見込めます
                      </p>
                    </div>
                  </div>
                )}
                {t1Result.verdict === 'maintain' && (
                  <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-8 text-center">
                    <p className="text-6xl">→</p>
                    <p className="text-2xl font-bold text-blue-700 mt-2">現状維持が最適です</p>
                    <p className="text-sm text-blue-600 mt-3 leading-relaxed">{t1Result.reason}</p>
                  </div>
                )}
                {t1Result.verdict === 'decrease' && (
                  <div className="bg-red-50 border-2 border-red-400 rounded-xl p-8 text-center">
                    <p className="text-6xl">↓</p>
                    <p className="text-2xl font-bold text-red-700 mt-2">広告費を減らしてください</p>
                    <p className="text-xl font-bold mt-2 text-slate-800">
                      ¥{Number(t1Spend).toLocaleString()} → ¥{t1Result.recommendedBudget.toLocaleString()}
                    </p>
                    <p className="text-sm text-red-600 mt-3 leading-relaxed">{t1Result.reason}</p>
                    <div className="bg-red-100 rounded-lg p-3 mt-4">
                      <p className="text-sm font-medium text-red-800">
                        削減することで月+¥{t1Result.savedAmount.toLocaleString()}のコスト削減になります
                      </p>
                    </div>
                  </div>
                )}

                {/* Evidence cards */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    {
                      label: 'ROAS',
                      value: `${currentRoas}倍`,
                      judgment: t1Result.roasJudgment,
                      comment: t1Result.roasComment,
                    },
                    {
                      label: '在庫',
                      value: `残${t1StockDays}日分`,
                      judgment: t1Result.stockJudgment,
                      comment: t1Result.stockComment,
                    },
                    {
                      label: '粗利率',
                      value: `${t1Margin}%`,
                      judgment: t1Result.marginJudgment,
                      comment: t1Result.marginComment,
                    },
                  ].map((item) => (
                    <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500 font-medium mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-slate-800">{item.value}</p>
                      <p className="text-xl mt-1">{judgmentIcon(item.judgment)}</p>
                      <p className={`text-xs mt-1 ${judgmentColor(item.judgment)}`}>{item.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="mt-6 space-y-2 relative">
                  <button
                    onClick={handleT1BudgetCopy}
                    className="border w-full py-3 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {t1BudgetCopied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
                    {t1BudgetCopied ? 'コピーしました' : '推奨予算をコピーする'}
                  </button>
                  <button
                    onClick={handleT1Delegate}
                    className="bg-blue-900 hover:bg-blue-950 text-white w-full py-3 rounded-lg font-medium transition-colors"
                  >
                    集客AIに予算変更を依頼する
                  </button>
                  {t1Toast && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs px-4 py-2 rounded-lg whitespace-nowrap animate-in fade-in duration-200">
                      予算変更の依頼を記録しました（Shopify広告連携後に自動反映）
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB stop: 停止判断
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="stop">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-1">🛑 止めるべき広告を特定します</h3>
              <p className="text-sm text-slate-500 mb-4">
                広告ごとの数値を入力してください。AIが継続・改善・停止を判定します
              </p>

              <button
                onClick={addAdRow}
                disabled={adRows.length >= 10}
                className="flex items-center gap-1.5 border text-sm px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors mb-4"
              >
                <Plus size={14} />
                広告を追加する
              </button>

              <div className="space-y-3">
                {adRows.map((row) => (
                  <div key={row.id} className="border border-slate-200 rounded-xl p-4 relative">
                    <button
                      onClick={() => removeAdRow(row.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <XIcon size={16} />
                    </button>
                    <div className="grid grid-cols-5 gap-3 pr-6">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">広告名/商品名</label>
                        <Input
                          value={row.adName}
                          onChange={(e) => updateAdRow(row.id, 'adName', e.target.value)}
                          placeholder="ヒノキカッティングボード_検索広告"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">月間広告費（円）</label>
                        <Input
                          type="number"
                          value={row.monthlySpend}
                          onChange={(e) => updateAdRow(row.id, 'monthlySpend', e.target.value)}
                          placeholder="120000"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">広告経由売上（円）</label>
                        <Input
                          type="number"
                          value={row.adRevenue}
                          onChange={(e) => updateAdRow(row.id, 'adRevenue', e.target.value)}
                          placeholder="456000"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">クリック数</label>
                        <Input
                          type="number"
                          value={row.clicks}
                          onChange={(e) => updateAdRow(row.id, 'clicks', e.target.value)}
                          placeholder="2400"
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">転換数</label>
                        <Input
                          type="number"
                          value={row.conversions}
                          onChange={(e) => updateAdRow(row.id, 'conversions', e.target.value)}
                          placeholder="42"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAdStopJudge}
                disabled={t2Loading || adRows.length === 0}
                className="mt-4 w-full bg-blue-900 hover:bg-blue-950 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {t2Loading ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  'AIに判定してもらう'
                )}
              </button>
            </div>

            {/* Error */}
            {!t2Loading && t2Error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                <p className="text-sm text-red-600">分析中にエラーが発生しました。再試行してください。</p>
                <button
                  onClick={handleAdStopJudge}
                  className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition-colors shrink-0 ml-4"
                >
                  再試行
                </button>
              </div>
            )}

            {/* Results */}
            {t2Result && (
              <div className="mt-6">
                {/* Summary */}
                <div className="bg-white border rounded-xl p-4 mb-4 flex items-center gap-6">
                  <PieChart width={80} height={80}>
                    <Pie
                      data={[
                        { name: '継続', value: t2Result.summary.continueCount },
                        { name: '改善', value: t2Result.summary.improveCount },
                        { name: '停止', value: t2Result.summary.stopCount },
                      ].filter((d) => d.value > 0)}
                      cx={35}
                      cy={35}
                      innerRadius={22}
                      outerRadius={35}
                      dataKey="value"
                      stroke="none"
                    >
                      {PIE_COLORS.map((color, idx) => (
                        <Cell key={idx} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {adRows.length}件中
                    </p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-green-600 font-medium">
                        継続 {t2Result.summary.continueCount}件
                      </span>
                      <span className="text-xs text-amber-600 font-medium">
                        改善 {t2Result.summary.improveCount}件
                      </span>
                      <span className="text-xs text-red-500 font-medium">
                        停止 {t2Result.summary.stopCount}件
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per-ad cards */}
                {t2Result.results.map((r, i) => {
                  const isStop = r.verdict === 'stop';
                  const isImprove = r.verdict === 'improve';
                  const cardClass = isStop
                    ? 'bg-red-50 border border-red-200'
                    : isImprove
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-green-50 border border-green-200';
                  const badgeClass = isStop
                    ? 'bg-red-500'
                    : isImprove
                    ? 'bg-amber-500'
                    : 'bg-green-500';
                  const badgeLabel = isStop ? '🛑 停止' : isImprove ? '⚠️ 改善' : '✅ 継続';

                  return (
                    <div key={i} className={`${cardClass} rounded-xl p-5 mb-3`}>
                      <div className="flex items-start gap-4">
                        <span className={`${badgeClass} text-white text-sm font-medium px-4 py-2 rounded-lg shrink-0`}>
                          {badgeLabel}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{r.adName}</p>
                          <p className="text-sm text-slate-600 mt-1">{r.reason}</p>
                          {r.action && (
                            <p className="text-sm text-amber-700 mt-2">💡 {r.action}</p>
                          )}
                          {isStop && (
                            <button className="mt-2 border border-red-300 text-red-500 text-sm px-4 py-2 rounded hover:bg-red-50 transition-colors">
                              この広告を停止する（準備中）
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {[
                          { label: 'ROAS', value: `${r.roas}倍`, j: r.roasJudgment },
                          { label: 'CPA', value: `¥${r.cpa.toLocaleString()}`, j: r.cpaJudgment },
                          { label: 'CVR', value: `${r.cvr}%`, j: r.cvrJudgment },
                          {
                            label: '月間利益',
                            value: `¥${r.monthlyProfit.toLocaleString()}`,
                            j: r.monthlyProfit >= 0 ? 'good' : 'danger' as Judgment,
                          },
                        ].map((item) => (
                          <div key={item.label} className="bg-white rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-500">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                            <p
                              className={`text-xs mt-0.5 font-medium ${
                                item.j === 'good'
                                  ? 'text-green-600'
                                  : item.j === 'warning'
                                  ? 'text-amber-600'
                                  : 'text-red-500'
                              }`}
                            >
                              {item.j === 'good' ? '良い' : item.j === 'warning' ? '普通' : '悪い'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── 5. History table ──────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">実行履歴</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">実行日時</TableHead>
              <TableHead className="text-xs">施策内容</TableHead>
              <TableHead className="text-xs">チャネル</TableHead>
              <TableHead className="text-xs">結果</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">{row.datetime}</TableCell>
                <TableCell className="text-sm text-slate-800">{row.action}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                    {row.channel}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-700">{row.result}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
