'use client';

import { useState, useMemo } from 'react';
import {
  monthlyCashflows,
  dailyPayouts,
  shopifyFeeConfig,
} from '@/lib/mock-data';

// New design components
import { CashflowTopbar }        from '@/components/cashflow/cashflow-topbar';
import { KpiCashflowGrid }       from '@/components/cashflow/kpi-summary-grid';
import { CashRiskAlert }         from '@/components/cashflow/cash-risk-alert';
import { CashflowChart }         from '@/components/cashflow/cashflow-chart';
import { MonthlyStatementTable } from '@/components/cashflow/monthly-statement-table';
import { PaymentSchedule }       from '@/components/cashflow/payment-schedule';
import { FeeBreakdown }          from '@/components/cashflow/fee-breakdown';
import { CashflowSimulator }     from '@/components/cashflow/cashflow-simulator';

// ────────────────────────────────────────────────
// ヘルパー
// ────────────────────────────────────────────────
const yen = (n: number) => `¥${Math.abs(n).toLocaleString()}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });

// 今月データ(index=3)
const thisMonth = monthlyCashflows[3];
// 先月データ
const lastMonth = monthlyCashflows[2];

// シミュレーター計算関数
function simulateCashflow(
  initialCash: number,
  growthRate: number,
  inventoryRate: number,
  adRate: number
) {
  let cash = initialCash;
  const results = [];
  let revenue = 5_000_000;

  for (let i = 0; i < 6; i++) {
    revenue = revenue * (1 + growthRate / 100);
    const fee = revenue * 0.054;
    const netIncome = revenue - fee;
    const inventory = revenue * (inventoryRate / 100);
    const ad = revenue * (adRate / 100);
    const fixed = 85_000;
    const outflow = inventory + ad + fixed;
    const netCash = netIncome - outflow;
    cash = cash + netCash;
    results.push({ month: i + 1, revenue, netIncome, outflow, netCash, cash });
  }
  return results;
}

// ────────────────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────────────────
export default function CashflowPage() {
  const [growthRate,    setGrowthRate]    = useState(5);
  const [inventoryRate, setInventoryRate] = useState(45);
  const [adRate,        setAdRate]        = useState(10);
  const [initialCash,   setInitialCash]   = useState(10_000_000);

  // アラート対象月
  const dangerMonths = useMemo(
    () => monthlyCashflows.filter(m => m.netCashflow < 0 || m.cumulativeCash < 2_000_000),
    []
  );

  // 累計残高の最小値
  const minCumulativeCash = useMemo(
    () => monthlyCashflows.reduce(
      (min, m) => (m.cumulativeCash < min.val ? { val: m.cumulativeCash, label: m.label } : min),
      { val: Infinity, label: '' }
    ),
    []
  );

  // 入金集計（保持）
  const _todayCompletedTotal = useMemo(
    () => dailyPayouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    []
  );
  const _todayScheduledTotal = useMemo(
    () => dailyPayouts.filter(p => p.status === 'scheduled').reduce((s, p) => s + p.amount, 0),
    []
  );

  // シミュレーション
  const simResults = useMemo(
    () => simulateCashflow(initialCash, growthRate, inventoryRate, adRate),
    [initialCash, growthRate, inventoryRate, adRate]
  );
  const sim6monthCash       = simResults[simResults.length - 1]?.cash ?? 0;
  const originalFinalCash   = monthlyCashflows[9].cumulativeCash;
  const _simDiff            = sim6monthCash - originalFinalCash;
  const firstLossSim        = simResults.find(r => r.netCash < 0);
  const totalShortfallSim   = simResults
    .filter(r => r.netCash < 0)
    .reduce((s, r) => s + Math.abs(r.netCash), 0);

  // 手数料削減シミュレーション（保持）
  const _stdPlanMonthly  = 8_479;
  const _stdFeeRate      = 0.029;
  const _savingsIfUpgrade =
    thisMonth.shopifyRevenue * (0.034 - _stdFeeRate) - (_stdPlanMonthly - shopifyFeeConfig.monthlyFee);

  // 手数料率
  const feeRate = (
    ((thisMonth.shopifyFee + thisMonth.shopifyMonthlyFee) / thisMonth.shopifyRevenue) * 100
  ).toFixed(1);

  // 前月比
  const netIncomeDelta = thisMonth.netIncome - lastMonth.netIncome;

  // Risk month data (hardcoded from spec — 9月(予測))
  const riskIncome  = 3_591_027;
  const riskExpense = 4_085_000;
  const riskDeficit = riskExpense - riskIncome; // 493,973

  return (
    <div className="animate-in fade-in duration-300">

      {/* ── Topbar (flush) ──────────────────────────────── */}
      <CashflowTopbar />

      <div className="space-y-5">

        {/* ── KPI Grid ─────────────────────────────────── */}
        <KpiCashflowGrid
          revenue={thisMonth.shopifyRevenue}
          fees={thisMonth.shopifyFee + thisMonth.shopifyMonthlyFee}
          feeRate={feeRate}
          netIncome={thisMonth.netIncome}
          payoutDate={fmtDate(thisMonth.payoutDate)}
          netIncomeDelta={netIncomeDelta}
          netCashflow={thisMonth.netCashflow}
        />

        {/* ── Cash Risk Alert ───────────────────────────── */}
        {dangerMonths.length > 0 ? (
          <CashRiskAlert
            riskMonth="9月(予測)"
            deficit={riskDeficit}
            income={riskIncome}
            expense={riskExpense}
          />
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-green-700 font-medium">✅ 今後6ヶ月のキャッシュフローは健全です</p>
            <p className="text-sm text-green-600 mt-1">
              最低残高: {yen(minCumulativeCash.val)}（{minCumulativeCash.label}）
            </p>
          </div>
        )}

        {/* ── Cashflow Chart ────────────────────────────── */}
        <CashflowChart />

        {/* ── Monthly Statement Table ───────────────────── */}
        <MonthlyStatementTable />

        {/* ── Payment Schedule ─────────────────────────── */}
        <PaymentSchedule />

        {/* ── Fee Breakdown + Simulator ─────────────────── */}
        <div className="grid grid-cols-[1fr_340px] gap-5">
          <FeeBreakdown />
          <CashflowSimulator
            growthRate={growthRate}
            inventoryRate={inventoryRate}
            adRate={adRate}
            initialCash={initialCash}
            onGrowthRateChange={setGrowthRate}
            onInventoryRateChange={setInventoryRate}
            onAdRateChange={setAdRate}
            onInitialCashChange={setInitialCash}
            sim6monthCash={sim6monthCash}
            originalFinalCash={originalFinalCash}
            firstLossSim={firstLossSim}
            totalShortfallSim={totalShortfallSim}
          />
        </div>

      </div>

    </div>
  );
}

