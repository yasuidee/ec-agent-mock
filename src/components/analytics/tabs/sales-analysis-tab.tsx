'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  salesTrendData,
  funnelStepsData,
  segmentData,
  goalData,
  actionPlanData,
} from '@/lib/mock-data/analytics';

const yen = (n: number) => '¥' + n.toLocaleString('ja-JP');

// ─── Sales Trend Chart ────────────────────────────────────────────────────────
function SalesTrendChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-1">📈 週次売上推移</h2>
      <p className="text-xs text-slate-400 mb-4">過去4週間の売上・原価・粗利の推移</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={salesTrendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
              const labels: Record<string, string> = { sales: '売上', cost: '原価', profit: '粗利' };
              return [yen(Number(v)), labels[String(name)] ?? String(name)];
            }}
            contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
          />
          <Legend
            formatter={(v) => {
              const map: Record<string, string> = { sales: '売上', cost: '原価', profit: '粗利' };
              return map[String(v)] ?? String(v);
            }}
            iconSize={10}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="sales"  fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="cost"   fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="profit" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Purchase Funnel ──────────────────────────────────────────────────────────
function PurchaseFunnel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-1">🔍 購買ファネル</h2>
      <p className="text-xs text-slate-400 mb-4">各ステップの通過率と離脱ポイントを可視化</p>
      <div className="flex flex-col gap-1">
        {funnelStepsData.map((step) => (
          <div key={step.num}>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: step.color }}>
                    {step.num}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{step.stage}</span>
                  {step.aiTip && (
                    <span className="hidden md:inline text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      💡 {step.aiTip}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">
                    {step.count} {step.unit}
                  </span>
                  <span className="text-xs font-medium text-slate-500 w-10 text-right">
                    {step.pct}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: step.barPct, background: step.color }}
                />
              </div>
            </div>
            {step.drop && (
              <div className="flex items-center justify-center py-1 gap-2">
                <span className={`text-xs font-medium ${step.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                  {step.drop}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Customer Segment Donut ───────────────────────────────────────────────────
function CustomerSegmentDonut() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-1">👥 顧客セグメント</h2>
      <p className="text-xs text-slate-400 mb-4">顧客構成比とセグメント別LTV</p>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={segmentData}
                dataKey="value"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                startAngle={90}
                endAngle={450}
              >
                {segmentData.map((seg) => (
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
            <span className="text-base font-bold text-slate-800">100%</span>
            <span className="text-[10px] text-slate-400">合計</span>
          </div>
        </div>

        {/* Legend + LTV */}
        <div className="flex-1 space-y-3">
          {segmentData.map((seg) => (
            <div key={seg.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{
                      background: seg.color,
                      border: seg.color === '#cbd5e1' ? '1px solid #94a3b8' : undefined,
                    }}
                  />
                  <span className="text-sm text-slate-700">{seg.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">{seg.value}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pl-4">
                <span>LTV</span>
                <span className="font-medium text-slate-600">{seg.ltv}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Goal Achievement Tracker ─────────────────────────────────────────────────
function GoalAchievementTracker() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-1">🎯 月間目標トラッカー</h2>
      <p className="text-xs text-slate-400 mb-4">今月の目標達成状況と予測</p>
      <div className="space-y-4">
        {goalData.map((g) => (
          <div key={g.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{g.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.statusBg} ${g.statusColor}`}>
                  {g.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">{g.current}</span>
                <span className="text-xs text-slate-400 ml-1">/ {g.target}</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${g.color}`}
                style={{ width: `${g.pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">{g.pct}% 達成</span>
              <span className="text-xs text-slate-400">{g.forecast}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Action Plan Cards ─────────────────────────────────────────────────────
function AiActionPlanCards() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-1">🤖 AIアクションプラン</h2>
      <p className="text-xs text-slate-400 mb-4">今すぐ実行できる売上改善アクション</p>
      <div className="space-y-3">
        {actionPlanData.map((card) => (
          <div key={card.num} className="flex items-start gap-4 rounded-xl border border-slate-200 p-4">
            {/* Accent bar */}
            <div className={`w-1 self-stretch rounded-full shrink-0 ${card.accentColor}`} />

            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${card.iconBg}`}>
              {card.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${card.badgeBg} ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <span className="text-sm font-semibold text-slate-900">{card.title}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{card.body}</p>
            </div>

            {/* Effect */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-emerald-600">{card.effect}</p>
              <p className="text-xs text-slate-400 mt-0.5">作業 {card.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sales Analysis Tab ───────────────────────────────────────────────────────
export function SalesAnalysisTab() {
  return (
    <div className="space-y-6 mt-6">
      <SalesTrendChart />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PurchaseFunnel />
        <CustomerSegmentDonut />
      </div>

      <GoalAchievementTracker />
      <AiActionPlanCards />
    </div>
  );
}
