'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const yen = (n: number) => '¥' + n.toLocaleString('ja-JP');

const delta = (v: number) =>
  v >= 0 ? (
    <span className="text-green-600">↑ +{v.toFixed(1)}%</span>
  ) : (
    <span className="text-red-500">↓ {v.toFixed(1)}%</span>
  );

const categoryMeta: Record<
  BriefAction['category'],
  { label: string; className: string }
> = {
  marketing: { label: 'マーケ',  className: 'bg-blue-100 text-blue-800' },
  inventory:  { label: '在庫',   className: 'bg-purple-100 text-purple-800' },
  build:      { label: 'ビルド', className: 'bg-green-100 text-green-800' },
  analytics:  { label: '分析',   className: 'bg-orange-100 text-orange-800' },
};

const urgencyDot: Record<BriefAction['urgency'], string> = {
  high:   'bg-red-500',
  medium: 'bg-yellow-400',
  low:    'bg-slate-400',
};

const PIE_COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#f59e0b', '#64748b'];

const stockDayColor = (days: number) => {
  if (days >= 30) return 'text-green-600';
  if (days >= 14) return 'text-amber-600';
  return 'text-red-500';
};

// ─── Action Card ─────────────────────────────────────────────────────────────

function ActionCard({
  action,
  actionState,
  onApprove,
  onReject,
}: {
  action: BriefAction;
  actionState: 'pending' | 'approved' | 'rejected';
  onApprove: () => void;
  onReject: () => void;
}) {
  const meta = categoryMeta[action.category];
  const isApproved = actionState === 'approved';
  const isRejected = actionState === 'rejected';

  return (
    <div
      className={`border rounded-lg p-4 flex flex-col transition-all ${
        isApproved
          ? 'bg-teal-50 border-teal-200'
          : isRejected
          ? 'opacity-50 bg-white'
          : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${meta.className}`}>
          {meta.label}
        </span>
        <div className="flex items-center gap-1.5">
          {isApproved && (
            <span className="text-xs font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              ✓ 実行中
            </span>
          )}
          {isRejected && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              却下済み
            </span>
          )}
          {!isApproved && !isRejected && (
            <span className={`w-2.5 h-2.5 rounded-full ${urgencyDot[action.urgency]}`} />
          )}
        </div>
      </div>

      <p className="font-medium text-sm mt-2 text-slate-900 leading-snug">{action.title}</p>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.description}</p>
      <p className="text-sm font-semibold text-amber-600 mt-2">{action.expectedImpact}</p>

      <div className="bg-slate-50 rounded p-2 mt-2 text-xs text-slate-600 leading-relaxed">
        {action.reasoning}
      </div>

      {actionState === 'pending' && (
        <div className="mt-3">
          <button
            onClick={onApprove}
            className="w-full mb-1 bg-blue-900 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-800 transition-colors"
          >
            承認して実行
          </button>
          <button
            onClick={onReject}
            className="w-full border text-slate-500 text-xs px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
          >
            却下
          </button>
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
}: {
  label: string;
  value: string;
  deltaValue: number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
        <Icon size={16} className="text-slate-400" />
      </div>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
      <p className="text-xs mt-1">{delta(deltaValue)}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { toast } = useToast();

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

  const pendingCount = Object.values(actionStates).filter((v) => v === 'pending').length;
  const totalSessions = trafficSources.reduce((s, t) => s + t.sessions, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Page Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            おはようございます、やすさん
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">2026年5月15日 金曜日</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>最終更新: 数分前</span>
          <button className="p-1.5 rounded-md hover:bg-slate-100 transition-colors">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── 2. Brief Actions ───────────────────────────────────── */}
      <div className="bg-white border border-amber-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-lg text-slate-900">🟡 今朝のブリーフ</h2>
          {pendingCount > 0 ? (
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              {pendingCount}つのアクション待ち
            </span>
          ) : (
            <span className="text-xs font-medium bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full">
              ✓ すべて完了
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-4">
          AIが分析した本日の優先アクション。承認するだけで実行されます。
        </p>
        <div className="grid grid-cols-3 gap-4">
          {briefActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              actionState={actionStates[action.id]}
              onApprove={() => approve(action.id)}
              onReject={() => reject(action.id)}
            />
          ))}
        </div>
      </div>

      {/* ── 3. KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="今日の売上"  value={yen(kpiSummary.todayRevenue)}      deltaValue={kpiSummary.todayRevenueDelta}  icon={TrendingUp} />
        <KpiCard label="本日注文数"  value={`${kpiSummary.todayOrders}件`}     deltaValue={kpiSummary.todayOrdersDelta}   icon={ShoppingCart} />
        <KpiCard label="CVR"         value={`${kpiSummary.cvr.toFixed(1)}%`}   deltaValue={kpiSummary.cvrDelta}           icon={MousePointerClick} />
        <KpiCard label="ROAS"        value={`${kpiSummary.roas.toFixed(1)}倍`} deltaValue={kpiSummary.roasDelta}          icon={Zap} />
      </div>

      {/* ── 4. Revenue Chart ───────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">売上推移</h2>
          <span className="text-xs text-slate-400">過去30日</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailySales} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => v.slice(-2)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
              width={70}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip
              formatter={(v) => [yen(Number(v)), '売上']}
              labelFormatter={(l) => String(l)}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1e3a8a"
              strokeWidth={2}
              fill="#1e3a8a"
              fillOpacity={0.08}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── 5. Bottom 2-col ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Product ranking */}
        <div className="col-span-2 bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">今週の売れ筋</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wide border-b">
                <th className="text-left pb-2 font-medium">商品名</th>
                <th className="text-right pb-2 font-medium">販売数</th>
                <th className="text-right pb-2 font-medium">売上</th>
                <th className="text-right pb-2 font-medium w-28">粗利率</th>
                <th className="text-right pb-2 font-medium">在庫残</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((p: Product) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-800 font-medium">{p.name}</td>
                  <td className="py-3 text-right text-slate-600">{p.weeklySales}個</td>
                  <td className="py-3 text-right text-slate-700 font-medium">{yen(p.revenue)}</td>
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
                  <td className={`py-3 text-right font-medium ${stockDayColor(p.stockDays)}`}>
                    {p.stockDays}日
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Traffic sources */}
        <div className="col-span-1 bg-white border rounded-xl p-6">
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
              <span className="text-xl font-semibold text-slate-800">
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
                <span className="font-medium text-slate-700">{t.percentage.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
