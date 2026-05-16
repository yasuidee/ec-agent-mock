'use client';

import { useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { kpiSummary } from '@/lib/mock-data';

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

type Period = '今週' | '今月' | '過去90日';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsAgentPage() {
  const [period, setPeriod] = useState<Period>('今月');

  const totalSessions = segments.reduce((s, sg) => s + sg.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">分析AI</h1>
        <p className="text-sm text-slate-500 mt-1">
          アクセス分析・顧客行動・経営PLをAIが可視化します
        </p>
      </div>

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
                    <span className="text-xs text-red-500 font-medium">
                      ↓ {dropPct}% が離脱
                    </span>
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
                const labels: Record<string, string> = {
                  revenue: '売上', cost: '原価', profit: '粗利',
                };
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

        {/* PL summary cards */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: '売上合計',  value: yen(totalRevenue), sub: '過去30日' },
            { label: '原価合計',  value: yen(totalCost),    sub: '過去30日' },
            { label: '粗利率',    value: `${grossMargin}%`, sub: '平均' },
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
        {/* Donut chart */}
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
              <span className="text-lg font-semibold text-slate-800">
                {totalSessions}%
              </span>
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

        {/* Segment metric cards */}
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
    </div>
  );
}
