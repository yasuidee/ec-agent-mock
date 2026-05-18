'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  Zap,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Megaphone,
  Package,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AgentBadge } from '@/components/dashboard/AgentBadge';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
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
  briefActions,
  kpiSummary,
  dailySales,
  topProducts,
  trafficSources,
  type BriefAction,
  type Product,
} from '@/lib/mock-data';

// ─── Weekly task type (compatible subset of BriefAction) ─────────────────────

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

function weeklyTaskToBriefAction(task: WeeklyTask): BriefAction {
  return {
    id: task.id,
    category: task.category,
    title: task.title,
    description: task.description,
    expectedImpact: `実施すると月+¥${task.expectedImpact.toLocaleString()}が見込めます`,
    reasoning: task.reasoning,
    urgency: task.urgency,
    status: 'pending',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const yen = (n: number) => '¥' + n.toLocaleString('ja-JP');

const delta = (v: number) =>
  v >= 0 ? (
    <span className="text-emerald-500 font-medium">↑ +{v.toFixed(1)}%</span>
  ) : (
    <span className="text-red-500 font-medium">↓ {v.toFixed(1)}%</span>
  );

const urgencyBadge: Record<BriefAction['urgency'], { bg: string; text: string; label: string }> = {
  high:   { bg: 'bg-red-100',    text: 'text-red-700',    label: '緊急' },
  medium: { bg: 'bg-amber-100',  text: 'text-amber-700',  label: '高' },
  low:    { bg: 'bg-slate-100',  text: 'text-slate-600',  label: '通常' },
};

const PIE_COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#f59e0b', '#64748b'];

const stockDayColor = (days: number) => {
  if (days >= 30) return 'text-emerald-600';
  if (days >= 14) return 'text-amber-600';
  return 'text-red-500';
};

// ─── Numbered Horizontal Action Card ─────────────────────────────────────────

function ActionCard({
  action,
  index,
  actionState,
  onApprove,
  onReject,
}: {
  action: BriefAction;
  index: number;
  actionState: 'pending' | 'approved' | 'rejected';
  onApprove: () => void;
  onReject: () => void;
}) {
  const isApproved = actionState === 'approved';
  const isRejected = actionState === 'rejected';
  const badge = urgencyBadge[action.urgency];

  return (
    <div
      className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
        isApproved
          ? 'bg-emerald-50 border-emerald-200'
          : isRejected
          ? 'opacity-50 bg-white border-slate-200'
          : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      {/* Number badge */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
          isApproved
            ? 'bg-emerald-200 text-emerald-800'
            : isRejected
            ? 'bg-slate-200 text-slate-500'
            : 'bg-blue-900 text-white'
        }`}
      >
        {isApproved ? <CheckCircle2 size={14} /> : isRejected ? <XCircle size={14} /> : index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <AgentBadge agent={action.category} clickable={true} />
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          {isApproved && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              ✓ 実行中
            </span>
          )}
          {isRejected && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              却下済み
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-900 leading-snug">{action.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{action.description}</p>
        <p className="text-sm font-semibold text-amber-600 mt-1">{action.expectedImpact}</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{action.reasoning}</p>
      </div>

      {/* Actions */}
      {actionState === 'pending' && (
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={onApprove}
            className="bg-blue-900 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap flex items-center gap-1"
          >
            承認して実行 <ArrowRight size={11} />
          </button>
          <button
            onClick={onReject}
            className="border border-slate-200 text-slate-500 text-xs px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            却下
          </button>
          <Link
            href={`/chat?action=${encodeURIComponent(action.title)}`}
            className="flex items-center justify-center gap-1 border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            <MessageSquare size={11} />
            AIに相談
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  deltaValue,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  deltaValue: number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? 'bg-blue-900 border-blue-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs uppercase tracking-wider font-medium ${accent ? 'text-blue-300' : 'text-slate-400'}`}>
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? 'bg-blue-800' : 'bg-slate-50'}`}>
          <Icon size={14} className={accent ? 'text-blue-300' : 'text-slate-400'} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${accent ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      <p className="text-xs mt-1.5">
        {accent ? (
          deltaValue >= 0 ? (
            <span className="text-emerald-400 font-medium">↑ +{deltaValue.toFixed(1)}%</span>
          ) : (
            <span className="text-red-300 font-medium">↓ {deltaValue.toFixed(1)}%</span>
          )
        ) : (
          delta(deltaValue)
        )}
        <span className={`ml-1 ${accent ? 'text-blue-400' : 'text-slate-400'}`}>前週比</span>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [weeklyReportTasks, setWeeklyReportTasks] = useState<BriefAction[] | null>(null);
  const [isMonday, setIsMonday] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Load weekly report tasks on Monday (or demo mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = new Date();
    const isActualMonday = today.getDay() === 1;
    if (isActualMonday) {
      try {
        const stored = localStorage.getItem('weeklyReportData');
        if (stored) {
          const weeklyData = JSON.parse(stored);
          const storedDate = new Date(weeklyData.generatedAt);
          const daysDiff = (today.getTime() - storedDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff <= 7 && Array.isArray(weeklyData.tasks) && weeklyData.tasks.length > 0) {
            setWeeklyReportTasks((weeklyData.tasks as WeeklyTask[]).map(weeklyTaskToBriefAction));
            setIsMonday(true);
          }
        }
      } catch { /* ignore */ }
    }
  }, []);

  const displayActions: BriefAction[] = (isMonday && weeklyReportTasks)
    ? weeklyReportTasks
    : briefActions;

  const initialStates = Object.fromEntries(
    briefActions.map((a) => [a.id, a.status as 'pending' | 'approved' | 'rejected'])
  );
  const [actionStates, setActionStates] =
    useState<Record<string, 'pending' | 'approved' | 'rejected'>>(initialStates);

  const approve = (id: string) => {
    const action = briefActions.find((a) => a.id === id);
    setActionStates((s) => ({ ...s, [id]: 'approved' }));
    toast({
      title: 'アクションを実行しました',
      description: action?.title,
    });
  };
  const reject = (id: string) =>
    setActionStates((s) => ({ ...s, [id]: 'rejected' }));

  const handleReset = () => {
    setActionStates(initialStates);
    toast({ title: 'デモをリセットしました', description: 'すべてのアクションをリセットしました' });
  };

  const pendingCount = displayActions.filter((a) => (actionStates[a.id] ?? 'pending') === 'pending').length;
  const totalSessions = trafficSources.reduce((s, t) => s + t.sessions, 0);
  const barData = dailySales.slice(-7);

  if (!ready) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── 1. Hero Banner ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)' }}>
        <div className="px-8 py-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">2026年5月18日 日曜日</p>
              <h1 className="text-2xl font-bold text-white">おはようございます、やすさん 👋</h1>
              <p className="text-blue-200 text-sm mt-1.5">
                本日は <span className="text-amber-400 font-semibold">{pendingCount}つのアクション</span> が承認待ちです
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Link
                  href="/chat"
                  className="flex items-center gap-2 bg-amber-400 text-amber-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors"
                >
                  <MessageSquare size={14} />
                  AIに相談する
                </Link>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <RotateCcw size={13} />
                  デモをリセット
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-blue-400 text-xs">
              <RefreshCw size={13} />
              <span>最終更新: 数分前</span>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 right-16 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* ── 2. KPI Snapshot ────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="今日の売上"  value={yen(kpiSummary.todayRevenue)}      deltaValue={kpiSummary.todayRevenueDelta}  icon={TrendingUp}      accent />
        <KpiCard label="本日注文数"  value={`${kpiSummary.todayOrders}件`}     deltaValue={kpiSummary.todayOrdersDelta}   icon={ShoppingCart} />
        <KpiCard label="CVR"         value={`${kpiSummary.cvr.toFixed(1)}%`}   deltaValue={kpiSummary.cvrDelta}           icon={MousePointerClick} />
        <KpiCard label="ROAS"        value={`${kpiSummary.roas.toFixed(1)}倍`} deltaValue={kpiSummary.roasDelta}          icon={Zap} />
      </div>

      {/* ── 3. Today's Brief ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg text-slate-900">今朝のブリーフ</h2>
            {isMonday && weeklyReportTasks && (
              <span className="text-xs font-medium bg-blue-900 text-white px-2.5 py-1 rounded-full">
                月曜レポート連動
              </span>
            )}
          </div>
          {pendingCount > 0 ? (
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              {pendingCount}つのアクション待ち
            </span>
          ) : (
            <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
              ✓ すべて完了
            </span>
          )}
        </div>

        {isMonday && weeklyReportTasks && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
            <span className="text-blue-600 text-sm">📊</span>
            <span className="text-sm text-blue-700">
              今週の週次レポートからのアクションプランを表示しています
            </span>
            <a href="/agents/analytics" className="text-xs text-blue-900 underline ml-auto">
              レポートを見る
            </a>
          </div>
        )}

        <p className="text-sm text-slate-500 mb-4">
          AIが分析した本日の優先アクション。承認するだけで実行されます。
        </p>

        <div className="flex flex-col gap-3">
          {displayActions.map((action, i) => (
            <ActionCard
              key={action.id}
              action={action}
              index={i}
              actionState={actionStates[action.id] ?? 'pending'}
              onApprove={() => approve(action.id)}
              onReject={() => reject(action.id)}
            />
          ))}
        </div>
      </div>

      {/* ── 4. Chart + AI Insight ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">直近7日間の売上</h2>
            <span className="text-xs text-slate-400">日別売上</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => v.slice(-5)}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
                width={68}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip
                formatter={(v) => [yen(Number(v)), '売上']}
                labelFormatter={(l) => String(l)}
                contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === barData.length - 1 ? '#f59e0b' : '#1e3a8a'}
                    fillOpacity={i === barData.length - 1 ? 1 : 0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight Card */}
        <div className="col-span-1 rounded-xl p-6 flex flex-col gap-4" style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #172554 100%)' }}>
          <div>
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">AI インサイト</p>
            <h2 className="text-white font-semibold text-base">今週の注目ポイント</h2>
          </div>
          <ul className="flex flex-col gap-3 flex-1">
            <li className="flex gap-2.5">
              <span className="text-amber-400 mt-0.5 shrink-0">✦</span>
              <p className="text-blue-100 text-xs leading-relaxed">
                昨日の売上は前週比 <span className="text-amber-400 font-semibold">+{kpiSummary.todayRevenueDelta.toFixed(1)}%</span>。上昇トレンドが継続しています。
              </p>
            </li>
            <li className="flex gap-2.5">
              <span className="text-amber-400 mt-0.5 shrink-0">✦</span>
              <p className="text-blue-100 text-xs leading-relaxed">
                CVR <span className="text-amber-400 font-semibold">{kpiSummary.cvr.toFixed(1)}%</span> はベンチマーク比で良好。広告の最適化で更なる向上が見込めます。
              </p>
            </li>
            <li className="flex gap-2.5">
              <span className="text-amber-400 mt-0.5 shrink-0">✦</span>
              <p className="text-blue-100 text-xs leading-relaxed">
                ROAS <span className="text-amber-400 font-semibold">{kpiSummary.roas.toFixed(1)}倍</span> を維持。予算配分の見直しで効率改善のチャンスあり。
              </p>
            </li>
          </ul>
          <Link
            href="/agents/analytics"
            className="flex items-center justify-between bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-3 py-2.5 text-xs text-blue-200 font-medium"
          >
            <span>詳細を分析する</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── 5. Bottom 2-col ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Product ranking */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">今週の売れ筋</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left pb-2 font-medium">商品名</th>
                <th className="text-right pb-2 font-medium">販売数</th>
                <th className="text-right pb-2 font-medium">売上</th>
                <th className="text-right pb-2 font-medium w-28">粗利率</th>
                <th className="text-right pb-2 font-medium">在庫残</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topProducts.map((p: Product) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-800 font-medium">{p.name}</td>
                  <td className="py-3 text-right text-slate-600">{p.weeklySales}個</td>
                  <td className="py-3 text-right text-slate-700 font-semibold">{yen(p.revenue)}</td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-slate-600">{p.marginRate}%</span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-900 rounded-full"
                          style={{ width: `${p.marginRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 text-right font-semibold ${stockDayColor(p.stockDays)}`}>
                    {p.stockDays}日
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Traffic sources */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">流入元</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  dataKey="sessions"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={450}
                >
                  {trafficSources.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800">
                {totalSessions.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">セッション</span>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {trafficSources.map((t, i) => (
              <li key={t.source} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-600">{t.source}</span>
                </div>
                <span className="font-semibold text-slate-700">{t.percentage.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── 6. Quick Access ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">各エージェントへのクイックアクセス</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { href: '/agents/build',     icon: Sparkles,  color: 'text-emerald-600', bg: 'bg-emerald-50', label: '構築AI',  desc: '商品ページ生成・価格分析' },
            { href: '/agents/marketing', icon: Megaphone, color: 'text-blue-600',    bg: 'bg-blue-50',    label: '集客AI',  desc: '広告判断・SNS投稿生成' },
            { href: '/agents/inventory', icon: Package,   color: 'text-purple-600',  bg: 'bg-purple-50',  label: '在庫AI',  desc: '在庫切れ予報・発注最適化' },
            { href: '/agents/analytics', icon: BarChart3, color: 'text-orange-600',  bg: 'bg-orange-50',  label: '分析AI',  desc: '売上分析・目標達成プラン' },
          ].map(({ href, icon: Icon, color, bg, label, desc }) => (
            <a
              key={href}
              href={href}
              className="group border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer block"
            >
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-900 transition-colors">
                {label}
              </p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
