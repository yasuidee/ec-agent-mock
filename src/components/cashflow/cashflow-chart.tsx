'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { cashflowData, cashflowSummary } from '@/lib/mock-data/cashflow';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-900 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mt-1">
          {p.name}: ¥{p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

// ─── Y-axis formatters ────────────────────────────────────────────────────────

const formatAmountAxis = (value: number) => `¥${(value / 1000000).toFixed(0)}M`;
const formatBalanceAxis = (value: number) => `¥${(value / 1000000).toFixed(0)}M`;

// ─── CashflowChart ────────────────────────────────────────────────────────────

export function CashflowChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">📈 6ヶ月キャッシュフロー予測</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            実績(5月) + 予測(6〜11月) · AIが毎月自動更新
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#1e3a8a] inline-block" />入金
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />出金
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />残高推移
          </span>
        </div>
      </div>

      {/* Chart — height must be a number, NOT "100%" */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={cashflowData}
          margin={{ top: 10, right: 60, left: 10, bottom: 0 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />

          {/* Left Y-axis: income/expense scale (¥0–¥7M) */}
          <YAxis
            yAxisId="amount"
            orientation="left"
            tickFormatter={formatAmountAxis}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 7000000]}
            width={40}
          />

          {/* Right Y-axis: balance scale (¥8M–¥20M) — MUST be separate */}
          <YAxis
            yAxisId="balance"
            orientation="right"
            tickFormatter={formatBalanceAxis}
            tick={{ fontSize: 9, fill: '#f59e0b' }}
            axisLine={false}
            tickLine={false}
            domain={[8000000, 20000000]}
            width={45}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Risk reference line for September */}
          <ReferenceLine
            yAxisId="amount"
            x="9月(予測)"
            stroke="#fca5a5"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{
              value: '⚠️ 赤字リスク',
              position: 'insideTopRight',
              fontSize: 9,
              fill: '#ef4444',
              offset: 8,
            }}
          />

          {/* Income bars */}
          <Bar yAxisId="amount" dataKey="income" name="入金" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {cashflowData.map((entry, index) => (
              <Cell
                key={`income-${index}`}
                fill={entry.isForecast ? '#6389c4' : '#1e3a8a'}
                fillOpacity={entry.isForecast ? 0.75 : 1}
              />
            ))}
          </Bar>

          {/* Expense bars */}
          <Bar yAxisId="amount" dataKey="expense" name="出金" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {cashflowData.map((entry, index) => (
              <Cell
                key={`expense-${index}`}
                fill={entry.isRisk ? '#dc2626' : entry.isForecast ? '#fca5a5' : '#ef4444'}
                fillOpacity={1}
              />
            ))}
          </Bar>

          {/* Balance line — MUST use yAxisId="balance" on right axis */}
          <Line
            yAxisId="balance"
            type="monotone"
            dataKey="balance"
            name="残高推移"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary strip */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 rounded-xl">
        {[
          { label: '6ヶ月累計入金',    value: cashflowSummary.totalIncome,  color: 'text-[#1e3a8a]' },
          { label: '6ヶ月累計出金',    value: cashflowSummary.totalExpense, color: 'text-red-500'   },
          { label: '6ヶ月後の残高予測', value: cashflowSummary.finalBalance, color: 'text-amber-500' },
        ].map((item) => (
          <div key={item.label} className="px-6 py-3">
            <p className="text-[10px] text-slate-500 font-medium">{item.label}</p>
            <p className={`text-lg font-bold mt-1 ${item.color}`}>
              ¥{item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
