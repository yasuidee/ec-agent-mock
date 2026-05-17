'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Users, Wallet, Copy, Check, Sparkles, X as XIcon, Plus } from 'lucide-react';
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
import { topProducts, type Product } from '@/lib/mock-data';

// ─── Types ───────────────────────────────────────────────────────────────────

type Platform = 'Instagram' | 'X' | 'Facebook';

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

interface PageImprovement {
  category: 'photo' | 'text' | 'price' | 'shipping' | 'faq';
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface PageResult {
  pageName: string;
  cvr: number;
  benchmark: number;
  priority: 'urgent' | 'high' | 'normal';
  additionalOrders: number;
  revenueImpact: number;
  improvements: PageImprovement[];
}

interface PageImprovementResult {
  results: PageResult[];
}

interface AdRow {
  id: string;
  adName: string;
  monthlySpend: string;
  adRevenue: string;
  clicks: string;
  conversions: string;
}

interface PageRow {
  id: string;
  pageName: string;
  clicks: string;
  purchases: string;
  bounceRate: string;
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

const products = budgetData.map((d) => d.name);

const historyRows: HistoryRow[] = [
  { id: 'h1', datetime: '2026-05-15 10:30', action: 'ヒノキカッティングボード Instagram広告配信',    channel: 'Instagram', result: 'CVR +15%'      },
  { id: 'h2', datetime: '2026-05-14 09:15', action: '南部鉄器急須 Google ショッピング最適化',         channel: 'Google',    result: 'ROAS 4.2倍'   },
  { id: 'h3', datetime: '2026-05-13 14:00', action: '有田焼マグカップ X プロモーション投稿',           channel: 'X',         result: 'インプ +3,200' },
  { id: 'h4', datetime: '2026-05-13 11:20', action: '全商品 メルマガ配信（リピーター向け）',            channel: 'メール',    result: '開封率 32%'   },
  { id: 'h5', datetime: '2026-05-12 16:45', action: '和紙ノート Facebook 類似オーディエンス拡張',      channel: 'Facebook',  result: '新規 +9人'    },
];

const MOCK_POST: Record<Platform, (product: string) => string> = {
  Instagram: (p) =>
    `✨ 職人の技が宿る一品をご紹介 ✨\n\n「${p}」は、熟練の職人が一つひとつ丁寧に仕上げた日本製の逸品です。\n日常使いから特別な贈り物まで、幅広くお使いいただけます。\n\n🛒 プロフィールリンクから詳細をチェック👆\n\n#日本製 #職人手作り #${p.replace(/\s/g, '')} #和雑貨 #ギフト`,
  X: (p) =>
    `【新着】${p} が入荷しました🎉\n\n職人が手作業で仕上げた日本製の逸品。耐久性・デザイン性ともに抜群です。\n数量限定なのでお早めに👇\n\n#${p.replace(/\s/g, '')} #日本製 #職人`,
  Facebook: (p) =>
    `📦 ${p} のご紹介\n\n日本の伝統工芸に根ざした職人技が光る一品です。素材の質感と独自の製法にこだわり、日常をちょっと豊かにしてくれます。\n\nご注文・詳細はプロフィールのリンクから。お気軽にメッセージもどうぞ 😊\n\n#日本製 #伝統工芸 #${p.replace(/\s/g, '')} #ハンドメイド #暮らしの道具`,
};

// ─── Score helpers (Tab 3) ────────────────────────────────────────────────────

const avgWeeklySales =
  topProducts.reduce((s, p) => s + p.weeklySales, 0) / topProducts.length;

function calcAdScore(p: Product): number {
  let score = 0;
  if (p.marginRate >= 40) score += 30;
  else if (p.marginRate >= 20) score += 15;
  else score -= 20;

  if (p.stockDays >= 30) score += 25;
  else if (p.stockDays >= 14) score += 10;
  else score -= 30;

  if (p.weeklySales >= avgWeeklySales) score += 25;

  return Math.max(0, Math.min(100, score));
}

function calcRecommendedBudget(score: number): number {
  if (score >= 80) return 25000;
  if (score >= 50) return 15000;
  if (score >= 30) return 8000;
  return 0;
}

function getQuadrant(p: Product): 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' {
  const highMargin = p.marginRate >= 40;
  const sufficientStock = p.stockDays >= 30;
  if (highMargin && sufficientStock) return 'topRight';
  if (highMargin && !sufficientStock) return 'topLeft';
  if (!highMargin && sufficientStock) return 'bottomRight';
  return 'bottomLeft';
}

function getVerdictInfo(score: number) {
  if (score >= 80) return { label: '今すぐ出稿', icon: '🟢', color: 'bg-green-100 text-green-800' };
  if (score >= 50) return { label: '条件付きで出稿', icon: '🟡', color: 'bg-amber-100 text-amber-800' };
  return { label: '出稿しない', icon: '🔴', color: 'bg-red-100 text-red-800' };
}

function getScoreRingColor(score: number) {
  if (score >= 80) return 'border-green-500';
  if (score >= 50) return 'border-amber-400';
  return 'border-red-400';
}

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

const categoryIcon: Record<PageImprovement['category'], string> = {
  photo: '📸',
  text: '📝',
  price: '💰',
  shipping: '🚚',
  faq: '❓',
};

const difficultyBadge: Record<PageImprovement['difficulty'], string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

const difficultyLabel: Record<PageImprovement['difficulty'], string> = {
  easy: '簡単',
  medium: '普通',
  hard: '難しい',
};

const benchmarkMap: Record<string, { label: string; rate: number }> = {
  craft: { label: 'クラフト・伝統工芸（平均2.1%）', rate: 2.1 },
  food: { label: '食品・飲料（平均3.2%）', rate: 3.2 },
  fashion: { label: 'ファッション（平均1.8%）', rate: 1.8 },
  other: { label: 'その他（平均2.5%）', rate: 2.5 },
};

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
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [post, setPost] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [snsCopied, setSnsCopied] = useState(false);

  // ── Ad assistant state ──────────────────────────────────────────────────────
  const [adTab, setAdTab] = useState('budget');

  // Tab 1: Budget Judge
  const [t1Spend, setT1Spend] = useState('480000');
  const [t1Revenue, setT1Revenue] = useState('1824000');
  const [t1TargetRoas, setT1TargetRoas] = useState('3.0');
  const [t1Orders, setT1Orders] = useState('218');
  const [t1Margin, setT1Margin] = useState('40');
  const [t1StockDays, setT1StockDays] = useState('45');
  const [t1BudgetCap, setT1BudgetCap] = useState('700000');
  const [t1Competitor, setT1Competitor] = useState('normal');
  const [t1Loading, setT1Loading] = useState(false);
  const [t1Result, setT1Result] = useState<BudgetJudgeResult | null>(null);
  const [t1BudgetCopied, setT1BudgetCopied] = useState(false);
  const [t1Toast, setT1Toast] = useState(false);

  const currentRoas = useMemo(() => {
    const spend = Number(t1Spend);
    const rev = Number(t1Revenue);
    if (!spend || spend <= 0) return '—';
    return (rev / spend).toFixed(2);
  }, [t1Spend, t1Revenue]);

  // Tab 2: Ad Stop Judge
  const [adRows, setAdRows] = useState<AdRow[]>(initialAdRows);
  const [t2Loading, setT2Loading] = useState(false);
  const [t2Result, setT2Result] = useState<AdStopResult | null>(null);

  // Tab 3: Product to advertise (frontend only)
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Tab 4: Page Improvement
  const [pageRows, setPageRows] = useState<PageRow[]>([
    { id: '1', pageName: 'ヒノキカッティングボード', clicks: '2400', purchases: '42', bounceRate: '68' },
    { id: '2', pageName: '有田焼マグカップ',          clicks: '800',  purchases: '12', bounceRate: '72' },
  ]);
  const [t4Benchmark, setT4Benchmark] = useState('craft');
  const [t4Loading, setT4Loading] = useState(false);
  const [t4Result, setT4Result] = useState<PageImprovementResult | null>(null);

  if (!ready) return <PageSkeleton />;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleGenerate = () => {
    setGenerating(true);
    setPost(null);
    setSnsCopied(false);
    setTimeout(() => {
      setPost(MOCK_POST[platform](selectedProduct));
      setGenerating(false);
    }, 800);
  };

  const handleSnsCopy = () => {
    if (!post) return;
    navigator.clipboard.writeText(post);
    setSnsCopied(true);
    setTimeout(() => setSnsCopied(false), 2000);
  };

  // Tab 1
  const handleBudgetJudge = async () => {
    setT1Loading(true);
    setT1Result(null);
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

  // Tab 2
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
    } finally {
      setT2Loading(false);
    }
  };

  // Tab 4
  const addPageRow = () => {
    if (pageRows.length >= 5) return;
    setPageRows((prev) => [
      ...prev,
      { id: Date.now().toString(), pageName: '', clicks: '', purchases: '', bounceRate: '' },
    ]);
  };

  const removePageRow = (id: string) => {
    setPageRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updatePageRow = (id: string, field: keyof PageRow, value: string) => {
    setPageRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handlePageImprovement = async () => {
    setT4Loading(true);
    setT4Result(null);
    try {
      const res = await fetch('/api/page-improvement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: pageRows,
          benchmarkRate: benchmarkMap[t4Benchmark].rate,
        }),
      });
      const data = await res.json();
      setT4Result(data);
    } catch {
      setT4Result(null);
    } finally {
      setT4Loading(false);
    }
  };

  // Tab 3 computed
  const sortedProducts = [...topProducts].sort((a, b) => calcAdScore(b) - calcAdScore(a));
  const topProduct = sortedProducts[0];
  const topScore = calcAdScore(topProduct);

  const quadrantMap: Record<string, Product[]> = {
    topRight: [],
    topLeft: [],
    bottomRight: [],
    bottomLeft: [],
  };
  topProducts.forEach((p) => quadrantMap[getQuadrant(p)].push(p));

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────── */}
      <PageHeader
        title="集客AI"
        description="広告配信・SNS投稿・メルマガをAIが最適化します"
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

      {/* ── 4. 広告判断アシスタント ───────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-lg text-slate-900 mb-1">🎯 広告判断アシスタント</h2>
        <p className="text-sm text-slate-500 mb-5">
          広告予算・継続・出稿商品・ページ改善をAIが一括判断します
        </p>

        <Tabs value={adTab} onValueChange={setAdTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="budget">広告予算の判断</TabsTrigger>
            <TabsTrigger value="stop">止めるべき広告</TabsTrigger>
            <TabsTrigger value="products">出すべき商品</TabsTrigger>
            <TabsTrigger value="pages">改善すべきページ</TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: 広告予算の判断
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
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
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
                className="mt-6 w-full bg-blue-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
                    <div key={item.label} className="bg-white border rounded-lg p-4 text-center">
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
                    className="bg-blue-900 text-white w-full py-3 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
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
              TAB 2: 止めるべき広告
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
                  <div key={row.id} className="border rounded-lg p-4 relative">
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
                className="mt-4 w-full bg-blue-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: 出すべき商品
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="products">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-1">📦 広告に出すべき商品を選びます</h3>
              <p className="text-sm text-slate-500 mb-6">
                利益率・在庫・需要トレンドを総合的に判断して、今広告をかけるべき商品を提案します
              </p>

              {/* 2×2 Matrix */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-medium text-slate-500">推奨度マトリクス</p>
                </div>
                <div className="grid grid-cols-2 gap-0 border rounded-xl overflow-hidden">
                  {/* Header row */}
                  <div className="col-span-2 grid grid-cols-2 bg-slate-50 border-b">
                    <div className="p-2 text-center text-xs text-slate-500 border-r">
                      ← 在庫不足 ／ 在庫充足 →
                    </div>
                    <div className="p-2 text-center text-xs text-slate-500"></div>
                  </div>
                  {/* Top-right: 今すぐ */}
                  <div className="bg-green-50 border-2 border-green-400 p-4 border-r">
                    <p className="text-xs font-semibold text-green-700 mb-2">
                      ↑ 利益率高 × 在庫充足
                    </p>
                    <p className="text-xs text-green-600 font-medium mb-2">✅ 今すぐ広告をかけるべき</p>
                    <div className="space-y-1">
                      {quadrantMap.topRight.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setModalProduct(p)}
                          className="block text-left text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors w-full truncate"
                        >
                          {p.name}
                        </button>
                      ))}
                      {quadrantMap.topRight.length === 0 && (
                        <p className="text-xs text-slate-400">該当なし</p>
                      )}
                    </div>
                  </div>
                  {/* Top-left: 仕入れ後に */}
                  <div className="bg-blue-50 border border-blue-300 p-4">
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                      ↑ 利益率高 × 在庫不足
                    </p>
                    <p className="text-xs text-blue-600 font-medium mb-2">📦 仕入れ後に広告をかける</p>
                    <div className="space-y-1">
                      {quadrantMap.topLeft.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setModalProduct(p)}
                          className="block text-left text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors w-full truncate"
                        >
                          {p.name}
                        </button>
                      ))}
                      {quadrantMap.topLeft.length === 0 && (
                        <p className="text-xs text-slate-400">該当なし</p>
                      )}
                    </div>
                  </div>
                  {/* Bottom-right: 価格改善後 */}
                  <div className="bg-amber-50 border border-amber-300 p-4 border-r border-t">
                    <p className="text-xs font-semibold text-amber-700 mb-2">
                      ↓ 利益率低 × 在庫充足
                    </p>
                    <p className="text-xs text-amber-600 font-medium mb-2">🔄 価格改善後に広告を検討</p>
                    <div className="space-y-1">
                      {quadrantMap.bottomRight.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setModalProduct(p)}
                          className="block text-left text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded hover:bg-amber-200 transition-colors w-full truncate"
                        >
                          {p.name}
                        </button>
                      ))}
                      {quadrantMap.bottomRight.length === 0 && (
                        <p className="text-xs text-slate-400">該当なし</p>
                      )}
                    </div>
                  </div>
                  {/* Bottom-left: 広告は控える */}
                  <div className="bg-red-50 border border-red-300 p-4 border-t">
                    <p className="text-xs font-semibold text-red-700 mb-2">
                      ↓ 利益率低 × 在庫不足
                    </p>
                    <p className="text-xs text-red-600 font-medium mb-2">🚫 広告は控える</p>
                    <div className="space-y-1">
                      {quadrantMap.bottomLeft.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setModalProduct(p)}
                          className="block text-left text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors w-full truncate"
                        >
                          {p.name}
                        </button>
                      ))}
                      {quadrantMap.bottomLeft.length === 0 && (
                        <p className="text-xs text-slate-400">該当なし</p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">※商品名をクリックすると詳細スコアを確認できます</p>
              </div>

              {/* Score cards */}
              <h4 className="text-sm font-semibold text-slate-700 mb-3">商品別 広告推奨スコア</h4>
              <div className="space-y-3">
                {sortedProducts.map((p) => {
                  const score = calcAdScore(p);
                  const verdict = getVerdictInfo(score);
                  const ringColor = getScoreRingColor(score);
                  const budget = calcRecommendedBudget(score);
                  return (
                    <div key={p.id} className="border rounded-xl p-5 flex items-center gap-4">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          在庫残{p.stockDays}日 ・ 粗利率{p.marginRate}% ・ 週間販売{p.weeklySales}個
                        </p>
                      </div>
                      {/* Center: score circle */}
                      <div
                        className={`shrink-0 w-16 h-16 rounded-full border-4 ${ringColor} flex flex-col items-center justify-center`}
                      >
                        <span className="text-xl font-bold text-slate-800">{score}</span>
                        <span className="text-xs text-slate-500">点</span>
                      </div>
                      {/* Right: verdict */}
                      <div className="shrink-0 text-right space-y-1">
                        <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${verdict.color}`}>
                          {verdict.icon} {verdict.label}
                        </span>
                        {budget > 0 && (
                          <p className="text-sm font-medium text-slate-700">
                            推奨月間予算 ¥{budget.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI comment */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-slate-700">
                  現時点で最も広告効果が高いのは
                  <span className="font-semibold text-amber-800 mx-1">{topProduct.name}</span>
                  です。粗利率{topProduct.marginRate}%・在庫{topProduct.stockDays}日分と条件が揃っており、今すぐ出稿できる状態です。
                  在庫を確保した上で月¥{calcRecommendedBudget(topScore).toLocaleString()}の出稿を推奨します。
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: 改善すべきページ
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="pages">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-1">📄 改善すべき商品ページを特定します</h3>
              <p className="text-sm text-slate-500 mb-5">
                広告をかけているのに売れないページを特定し、改善ポイントを提案します
              </p>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: page rows */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-700">広告実施中のページを入力してください</p>
                    <button
                      onClick={addPageRow}
                      disabled={pageRows.length >= 5}
                      className="flex items-center gap-1 text-xs border px-3 py-1.5 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      <Plus size={12} />
                      追加
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pageRows.map((row) => (
                      <div key={row.id} className="border rounded-lg p-3 relative">
                        <button
                          onClick={() => removePageRow(row.id)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                        >
                          <XIcon size={14} />
                        </button>
                        <div className="grid grid-cols-4 gap-2 pr-5">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500">ページ/商品名</label>
                            <Input
                              value={row.pageName}
                              onChange={(e) => updatePageRow(row.id, 'pageName', e.target.value)}
                              placeholder="ヒノキカッティングボード"
                              className="text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500">クリック数/月</label>
                            <Input
                              type="number"
                              value={row.clicks}
                              onChange={(e) => updatePageRow(row.id, 'clicks', e.target.value)}
                              placeholder="2400"
                              className="text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500">購入数/月</label>
                            <Input
                              type="number"
                              value={row.purchases}
                              onChange={(e) => updatePageRow(row.id, 'purchases', e.target.value)}
                              placeholder="42"
                              className="text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500">直帰率%</label>
                            <Input
                              type="number"
                              value={row.bounceRate}
                              onChange={(e) => updatePageRow(row.id, 'bounceRate', e.target.value)}
                              placeholder="68"
                              className="text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: benchmark */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">業種のCVRベンチマーク</p>
                  <select
                    value={t4Benchmark}
                    onChange={(e) => setT4Benchmark(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                  >
                    {Object.entries(benchmarkMap).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <div className="mt-4 bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">選択中のベンチマーク</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {benchmarkMap[t4Benchmark].rate}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{benchmarkMap[t4Benchmark].label}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePageImprovement}
                disabled={t4Loading || pageRows.length === 0}
                className="mt-6 w-full bg-blue-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {t4Loading ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  'AIに改善ポイントを分析してもらう'
                )}
              </button>
            </div>

            {/* Results */}
            {t4Result && (
              <div className="mt-6">
                {t4Result.results.map((r, i) => {
                  const benchmarkRate = benchmarkMap[t4Benchmark].rate;
                  const barMax = Math.max(benchmarkRate * 2.2, r.cvr * 1.5, 0.01);
                  const cvrPct = Math.min((r.cvr / barMax) * 100, 100);
                  const benchPct = Math.min((benchmarkRate / barMax) * 100, 100);
                  const targetPct = Math.min(((benchmarkRate * 1.1) / barMax) * 100, 100);

                  const priorityBadge =
                    r.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : r.priority === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600';
                  const priorityLabel =
                    r.priority === 'urgent' ? '最優先' : r.priority === 'high' ? '優先' : '様子見';

                  return (
                    <div key={i} className="border rounded-xl p-5 mb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800">{r.pageName}</p>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${priorityBadge}`}>
                          {priorityLabel}
                        </span>
                      </div>

                      {/* CVR bar */}
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-2">
                          現在のCVR: <span className="font-medium text-slate-700">{r.cvr}%</span>
                        </p>
                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-blue-400 rounded-full transition-all"
                            style={{ width: `${cvrPct}%` }}
                          />
                        </div>
                        <div className="relative h-4 mt-0.5">
                          {/* Benchmark marker */}
                          <div
                            className="absolute top-0 flex flex-col items-center"
                            style={{ left: `${benchPct}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="w-0.5 h-2 bg-amber-400" />
                            <span className="text-xs text-amber-600 whitespace-nowrap">業界平均</span>
                          </div>
                          {/* Target marker */}
                          <div
                            className="absolute top-0 flex flex-col items-center"
                            style={{ left: `${targetPct}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="w-0.5 h-2 bg-green-500" />
                            <span className="text-xs text-green-600 whitespace-nowrap">目標</span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue impact */}
                      <div className="bg-green-50 rounded-lg p-3 mt-4">
                        <p className="text-sm text-slate-700">
                          CVRが業界平均（{r.benchmark}%）まで改善すると
                          <span className="font-semibold text-green-700 mx-1">
                            月+{r.additionalOrders}件
                          </span>
                          の注文増・
                          <span className="font-semibold text-green-700 mx-1">
                            月+¥{r.revenueImpact.toLocaleString()}
                          </span>
                          の売上増が見込めます
                        </p>
                      </div>

                      {/* Improvements */}
                      <div className="mt-3 space-y-2">
                        {r.improvements.map((imp, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="shrink-0 text-base">{categoryIcon[imp.category]}</span>
                            <p className="flex-1 text-sm text-slate-700">{imp.content}</p>
                            <span
                              className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${difficultyBadge[imp.difficulty]}`}
                            >
                              {difficultyLabel[imp.difficulty]}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => router.push('/agents/build')}
                        className="mt-4 w-full bg-blue-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                      >
                        構築AIで商品ページを改善する
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── 5. SNS post generation ────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📱 SNS投稿を生成する</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">商品を選択</label>
            <select
              value={selectedProduct}
              onChange={(e) => { setSelectedProduct(e.target.value); setPost(null); }}
              className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              {products.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">プラットフォーム</label>
            <Tabs
              value={platform}
              onValueChange={(v) => { setPlatform(v as Platform); setPost(null); }}
            >
              <TabsList>
                {(['Instagram', 'X', 'Facebook'] as Platform[]).map((p) => (
                  <TabsTrigger key={p} value={p}>{p}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-blue-900 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles size={15} />
              {generating ? '生成中...' : '投稿文を生成する'}
            </button>
          </div>

          {post && (
            <div className="bg-slate-50 rounded-lg p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">{platform} 投稿プレビュー</p>
                <button
                  onClick={handleSnsCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {snsCopied ? <Check size={13} className="text-teal-600" /> : <Copy size={13} />}
                  {snsCopied ? 'コピーしました' : 'コピーする'}
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{post}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 6. History table ──────────────────────────────── */}
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

      {/* ── Product detail modal (Tab 3) ──────────────────── */}
      {modalProduct && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-900">{modalProduct.name}</h3>
              <button
                onClick={() => setModalProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XIcon size={18} />
              </button>
            </div>
            {(() => {
              const score = calcAdScore(modalProduct);
              const ringColor = getScoreRingColor(score);
              const verdict = getVerdictInfo(score);
              const budget = calcRecommendedBudget(score);
              return (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-20 h-20 rounded-full border-4 ${ringColor} flex flex-col items-center justify-center`}
                    >
                      <span className="text-2xl font-bold text-slate-800">{score}</span>
                      <span className="text-xs text-slate-500">点</span>
                    </div>
                    <div>
                      <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${verdict.color}`}>
                        {verdict.icon} {verdict.label}
                      </span>
                      {budget > 0 && (
                        <p className="text-sm text-slate-600 mt-1">
                          推奨月間予算 ¥{budget.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 bg-slate-50 rounded-lg p-4 text-sm">
                    {[
                      { label: '粗利率', value: `${modalProduct.marginRate}%`, ok: modalProduct.marginRate >= 40 },
                      { label: '在庫残日数', value: `${modalProduct.stockDays}日`, ok: modalProduct.stockDays >= 30 },
                      { label: '週間販売数', value: `${modalProduct.weeklySales}個`, ok: modalProduct.weeklySales >= avgWeeklySales },
                      { label: '販売価格', value: `¥${modalProduct.price.toLocaleString()}`, ok: true },
                      { label: '原価', value: `¥${modalProduct.cost.toLocaleString()}`, ok: true },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-slate-500">{item.label}</span>
                        <span className={`font-medium ${item.ok ? 'text-slate-800' : 'text-red-500'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
