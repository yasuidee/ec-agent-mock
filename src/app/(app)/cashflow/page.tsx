'use client';

import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
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
import {
  monthlyCashflows,
  dailyPayouts,
  shopifyFeeConfig,
} from '@/lib/mock-data';
import { PageHeader } from '@/components/dashboard/PageHeader';

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

// グラフ用: 今月以降の6ヶ月(index 3〜9)
const chartData = monthlyCashflows.slice(3).map(m => ({
  label: m.label,
  入金: m.netIncome,
  出金: m.totalOutflow,
  累計残高: m.cumulativeCash,
}));

// ────────────────────────────────────────────────
// シミュレーター計算関数
// ────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'balance'>('income');
  const [growthRate, setGrowthRate] = useState(5);
  const [inventoryRate, setInventoryRate] = useState(45);
  const [adRate, setAdRate] = useState(10);
  const [initialCash, setInitialCash] = useState(10_000_000);

  // ── アラート対象月
  const dangerMonths = useMemo(
    () => monthlyCashflows.filter(m => m.netCashflow < 0 || m.cumulativeCash < 2_000_000),
    []
  );

  // ── 累計残高の最小値
  const minCumulativeCash = useMemo(
    () => monthlyCashflows.reduce((min, m) => (m.cumulativeCash < min.val ? { val: m.cumulativeCash, label: m.label } : min), { val: Infinity, label: '' }),
    []
  );

  // ── 入金集計
  const todayCompletedTotal = useMemo(
    () => dailyPayouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    []
  );
  const todayScheduledTotal = useMemo(
    () => dailyPayouts.filter(p => p.status === 'scheduled').reduce((s, p) => s + p.amount, 0),
    []
  );

  // ── シミュレーション
  const simResults = useMemo(
    () => simulateCashflow(initialCash, growthRate, inventoryRate, adRate),
    [initialCash, growthRate, inventoryRate, adRate]
  );
  const sim6monthCash = simResults[simResults.length - 1]?.cash ?? 0;
  const originalFinalCash = monthlyCashflows[9].cumulativeCash;
  const simDiff = sim6monthCash - originalFinalCash;
  const firstLossSim = simResults.find(r => r.netCash < 0);
  const totalShortfallSim = simResults
    .filter(r => r.netCash < 0)
    .reduce((s, r) => s + Math.abs(r.netCash), 0);

  // ── 手数料削減シミュレーション
  const stdPlanMonthly = 8_479;
  const stdFeeRate = 0.029;
  const savingsIfUpgrade =
    thisMonth.shopifyRevenue * (0.034 - stdFeeRate) - (stdPlanMonthly - shopifyFeeConfig.monthlyFee);

  // ── ドーナツグラフデータ
  const pieData = [
    { name: '実入金額', value: thisMonth.netIncome, color: '#1e3a8a' },
    { name: '決済手数料', value: thisMonth.shopifyFee, color: '#ef4444' },
    { name: '月額費用', value: thisMonth.shopifyMonthlyFee, color: '#f59e0b' },
  ];
  const feeRate = (((thisMonth.shopifyFee + thisMonth.shopifyMonthlyFee) / thisMonth.shopifyRevenue) * 100).toFixed(1);

  // ── 前月比
  const netIncomeDelta = thisMonth.netIncome - lastMonth.netIncome;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── ヘッダー ─────────────────────────────────────── */}
      <PageHeader
        title="入金・手数料管理"
        description="Shopify入金スケジュール・手数料・6ヶ月キャッシュフロー予測"
      />

      {/* ── セクション1: KPIカード ──────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {/* カード1: 今月の売上 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">今月の売上</p>
          <p className="text-2xl font-bold text-slate-900">{yen(thisMonth.shopifyRevenue)}</p>
          <p className="text-xs text-slate-500 mt-1">Shopify売上総額</p>
        </div>

        {/* カード2: 差し引き手数料 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">差し引き手数料</p>
          <p className="text-2xl font-bold text-red-600">
            {yen(thisMonth.shopifyFee + thisMonth.shopifyMonthlyFee)}
          </p>
          <p className="text-xs text-slate-500 mt-1">取引手数料+月額費用</p>
          <p className="text-xs text-red-400 mt-0.5">手数料率 {feeRate}%</p>
        </div>

        {/* カード3: 実際の入金額 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">実際の入金額</p>
          <p className="text-2xl font-bold text-blue-900">{yen(thisMonth.netIncome)}</p>
          <p className="text-xs text-slate-500 mt-1">入金予定日: {fmtDate(thisMonth.payoutDate)}</p>
          <p className={`text-xs mt-0.5 ${netIncomeDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {netIncomeDelta >= 0 ? '↑' : '↓'} 前月比 {yen(netIncomeDelta)}
          </p>
        </div>

        {/* カード4: 今月の収支 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-1">今月の収支</p>
          <p className={`text-2xl font-bold ${thisMonth.netCashflow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {thisMonth.netCashflow >= 0 ? '' : '▲'}{yen(thisMonth.netCashflow)}
          </p>
          <p className="text-xs text-slate-500 mt-1">入金-仕入-広告-固定費</p>
          {/* 収支バー */}
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${thisMonth.netCashflow >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.abs(thisMonth.netCashflow / (thisMonth.netIncome || 1) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── セクション2: キャッシュ枯渇アラート ────────── */}
      {dangerMonths.length > 0 ? (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <span className="font-bold text-red-700 text-lg">キャッシュ枯渇リスクを検出しました</span>
          </div>
          <div className="mt-3 space-y-2">
            {dangerMonths.map(m => (
              <div key={m.month} className="text-sm text-red-800">
                {m.netCashflow < 0 ? (
                  <p>
                    📉 <b>{m.label}</b>: 収支がマイナスになる見込みです<br />
                    <span className="ml-4 text-xs">
                      入金{yen(m.netIncome)} - 出金{yen(m.totalOutflow)} = ▲{yen(Math.abs(m.netCashflow))}の赤字
                    </span>
                  </p>
                ) : (
                  <p>
                    ⚠️ <b>{m.label}</b>: キャッシュ残高が{yen(m.cumulativeCash)}まで低下します<br />
                    <span className="ml-4 text-xs">最低運転資金(¥2,000,000)を下回る可能性があります</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-4 mt-3">
            <p className="text-sm font-semibold text-slate-700 mb-2">💡 AIの対策提案</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• 仕入タイミングを分散して{dangerMonths[0].label}の出金を抑えてください</li>
              <li>• {dangerMonths[0].label}に向けて売上を{yen(Math.abs(dangerMonths[0].netCashflow) * 1.2)}上積みする施策が必要です</li>
              <li>• 融資・ファクタリングの活用も検討してください</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-700 font-medium">✅ 今後6ヶ月のキャッシュフローは健全です</p>
          <p className="text-sm text-green-600 mt-1">
            最低残高: {yen(minCumulativeCash.val)}（{minCumulativeCash.label}）
          </p>
        </div>
      )}

      {/* ── セクション3: キャッシュフローグラフ ─────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">📈 6ヶ月キャッシュフロー予測</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-900" />入金</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-400" />出金</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-amber-400" />残高</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 60, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={v => `¥${(v / 1_000_000).toFixed(0)}M`}
              width={52}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={v => `¥${(v / 1_000_000).toFixed(0)}M`}
              width={52}
            />
            <Tooltip
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, name: any) => [`¥${Number(v).toLocaleString()}`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine yAxisId="left" y={0} stroke="#64748b" strokeDasharray="4 4" />
            <ReferenceLine yAxisId="left" y={2_000_000} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '危険ライン', position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }} />
            <Bar yAxisId="left" dataKey="入金" fill="#1e3a8a" opacity={0.8} radius={[3, 3, 0, 0]} />
            <Bar yAxisId="left" dataKey="出金" fill="#ef4444" opacity={0.7} radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="累計残高" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-slate-500">6ヶ月累計入金</p>
            <p className="text-lg font-bold text-slate-900">
              {yen(monthlyCashflows.slice(3).reduce((s, m) => s + m.netIncome, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">6ヶ月累計出金</p>
            <p className="text-lg font-bold text-slate-900">
              {yen(monthlyCashflows.slice(3).reduce((s, m) => s + m.totalOutflow, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">6ヶ月後の残高予測</p>
            <p className="text-lg font-bold text-blue-900">
              {yen(monthlyCashflows[9].cumulativeCash)}
            </p>
          </div>
        </div>
      </div>

      {/* ── セクション4: 月次収支テーブル ──────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📊 月次収支明細</h2>
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="income">入金</TabsTrigger>
            <TabsTrigger value="expense">出金</TabsTrigger>
            <TabsTrigger value="balance">収支</TabsTrigger>
          </TabsList>

          {/* 入金タブ */}
          <TabsContent value="income">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">月</TableHead>
                  <TableHead className="text-xs text-right">売上</TableHead>
                  <TableHead className="text-xs text-right">取引手数料(2%)</TableHead>
                  <TableHead className="text-xs text-right">決済手数料</TableHead>
                  <TableHead className="text-xs text-right">月額費用</TableHead>
                  <TableHead className="text-xs text-right">実入金額</TableHead>
                  <TableHead className="text-xs text-right">入金日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyCashflows.map(m => {
                  const txFee = Math.round(m.shopifyRevenue * 0.02);
                  const payFee = m.shopifyFee - txFee;
                  const isThisMonth = m.month === '2026-05';
                  const isForecast = parseInt(m.month.split('-')[1]) > 5 || parseInt(m.month.split('-')[0]) > 2026;
                  return (
                    <TableRow key={m.month} className={isThisMonth ? 'bg-blue-50' : ''}>
                      <TableCell className={`text-sm font-medium ${isForecast ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                        {m.label}
                      </TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>{yen(m.shopifyRevenue)}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>▲{yen(txFee)}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>▲{yen(payFee)}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>▲{yen(m.shopifyMonthlyFee)}</TableCell>
                      <TableCell className={`text-sm text-right font-semibold ${isForecast ? 'text-slate-400 italic' : 'text-blue-900'}`}>{yen(m.netIncome)}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>{fmtDate(m.payoutDate)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>

          {/* 出金タブ */}
          <TabsContent value="expense">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">月</TableHead>
                  <TableHead className="text-xs text-right">仕入高(翌月末)</TableHead>
                  <TableHead className="text-xs text-right">広告費(翌月末)</TableHead>
                  <TableHead className="text-xs text-right">固定費</TableHead>
                  <TableHead className="text-xs text-right">出金合計</TableHead>
                  <TableHead className="text-xs text-right">支払日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyCashflows.map(m => {
                  const isThisMonth = m.month === '2026-05';
                  const isForecast = parseInt(m.month.split('-')[1]) > 5 || parseInt(m.month.split('-')[0]) > 2026;
                  // 月末日計算
                  const [y, mo] = m.month.split('-').map(Number);
                  const lastDay = new Date(y, mo, 0).getDate();
                  const payDate = `${m.month}-${lastDay}`;
                  return (
                    <TableRow key={m.month} className={isThisMonth ? 'bg-blue-50' : ''}>
                      <TableCell className={`text-sm font-medium ${isForecast ? 'text-slate-400 italic' : 'text-slate-800'}`}>{m.label}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>{yen(m.inventoryCost)}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>{yen(m.adSpend)}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>{yen(m.otherFixed)}</TableCell>
                      <TableCell className={`text-sm text-right font-semibold ${isForecast ? 'text-slate-400 italic' : 'text-slate-900'}`}>{yen(m.totalOutflow)}</TableCell>
                      <TableCell className={`text-sm text-right ${isForecast ? 'text-slate-400 italic' : ''}`}>{fmtDate(payDate)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="text-xs text-slate-500 mt-3">※仕入高・広告費は当月発生分を翌月末に支払い</p>
          </TabsContent>

          {/* 収支タブ */}
          <TabsContent value="balance">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">月</TableHead>
                  <TableHead className="text-xs text-right">入金</TableHead>
                  <TableHead className="text-xs text-right">出金</TableHead>
                  <TableHead className="text-xs text-right">収支</TableHead>
                  <TableHead className="text-xs text-right">累計残高</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyCashflows.map(m => {
                  const isNegative = m.netCashflow < 0;
                  const isLowCash = m.cumulativeCash < 2_000_000;
                  return (
                    <TableRow key={m.month} className={isNegative ? 'bg-red-50' : isLowCash ? 'bg-amber-50' : ''}>
                      <TableCell className="text-sm font-medium text-slate-800">{m.label}</TableCell>
                      <TableCell className="text-sm text-right">{yen(m.netIncome)}</TableCell>
                      <TableCell className="text-sm text-right">{yen(m.totalOutflow)}</TableCell>
                      <TableCell className={`text-sm text-right font-semibold ${isNegative ? 'text-red-700' : 'text-green-700'}`}>
                        {isNegative ? `▲${yen(m.netCashflow)}` : `+${yen(m.netCashflow)}`}
                      </TableCell>
                      <TableCell className={`text-sm text-right font-semibold ${isLowCash ? 'text-amber-700' : 'text-slate-900'}`}>
                        {yen(m.cumulativeCash)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── セクション5: 入金スケジュール ───────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-slate-900">📅 今月の入金スケジュール</h2>
          <span className="text-xs text-slate-500">注文から{shopifyFeeConfig.payoutDelayDays}営業日後に入金されます</span>
        </div>
        <div className="mt-4 divide-y">
          {dailyPayouts.map(p => (
            <div
              key={p.date}
              className={`py-3 flex justify-between items-center ${p.status === 'completed' ? 'opacity-60' : ''}`}
            >
              <div className="text-sm">
                {p.status === 'completed' ? (
                  <span className="text-slate-600">✅ {fmtDate(p.date)} 入金確定</span>
                ) : (
                  <span className="text-slate-800">🔜 {fmtDate(p.date)} 入金予定</span>
                )}
              </div>
              <div className="text-sm text-center text-slate-500">
                {p.status === 'completed'
                  ? `売上${yen(p.grossAmount)} - 手数料${yen(p.fee)}`
                  : `${fmtDate(p.orderDate)}分の売上`}
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${p.status === 'completed' ? 'text-green-600' : 'text-blue-900'}`}>
                  {yen(p.amount)}
                </span>
                {p.status === 'scheduled' && (
                  <div className="text-xs text-slate-400">({yen(p.grossAmount)} - 手数料{yen(p.fee)})</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t mt-2 pt-4 space-y-1">
          <p className="text-sm text-green-600">今月の入金確定済み: {yen(todayCompletedTotal)}</p>
          <p className="text-sm text-blue-900">今月の入金予定: {yen(todayScheduledTotal)}</p>
          <p className="text-base font-bold text-slate-900 mt-2">
            今月の合計入金見込み: {yen(todayCompletedTotal + todayScheduledTotal)}
          </p>
        </div>
      </div>

      {/* ── セクション6: 手数料の内訳 ───────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">💳 Shopify手数料の内訳</h2>

        {/* プラン設定 */}
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="font-medium text-slate-800">現在のプラン: {shopifyFeeConfig.planName}</p>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="text-center">
              <p className="text-xs text-slate-500">月額料金</p>
              <p className="text-lg font-bold text-slate-900">{yen(shopifyFeeConfig.monthlyFee)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">取引手数料</p>
              <p className="text-lg font-bold text-slate-900">{shopifyFeeConfig.transactionFeeRate}%</p>
              <p className="text-xs text-slate-400">外部決済利用時</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">決済手数料</p>
              <p className="text-lg font-bold text-slate-900">{shopifyFeeConfig.paymentFeeRate}%</p>
              <p className="text-xs text-slate-400">Shopify Payments利用時</p>
            </div>
          </div>
        </div>

        {/* 手数料シミュレーション */}
        <div className="flex gap-6 items-start">
          <div className="flex-1 bg-slate-50 rounded-xl p-5">
            <p className="text-sm font-medium text-slate-800 mb-3">
              今月(¥5,000,000の売上)の手数料計算
            </p>
            <div className="space-y-2 text-sm font-mono">
              <p className="text-slate-700">Step 1: 売上 <span className="font-bold">¥5,000,000</span></p>
              <p className="text-red-600">Step 2: × 決済手数料 3.4% = <span className="font-bold">▲¥170,000</span></p>
              <p className="text-red-600">Step 3: 月額料金 = <span className="font-bold">▲¥3,773</span></p>
              <p className="text-slate-400">Step 4: ━━━━━━━━━━━━━━━</p>
              <p className="text-blue-900 font-bold">Step 5: 実際の入金額 = ¥4,826,227</p>
            </div>
          </div>

          {/* ドーナツグラフ */}
          <div className="flex flex-col items-center" style={{ width: 180 }}>
            <div className="relative" style={{ width: 160, height: 160 }}>
              <PieChart width={160} height={160}>
                <Pie
                  data={pieData}
                  cx={75}
                  cy={75}
                  innerRadius={48}
                  outerRadius={72}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-slate-500">手数料率</p>
                <p className="text-lg font-bold text-slate-900">{feeRate}%</p>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 手数料削減ヒント */}
        <div className="bg-amber-50 rounded-xl p-4 mt-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">💡 手数料を抑えるには</p>
          <ul className="space-y-1.5 text-sm text-amber-900">
            <li>• Shopify Paymentsを使うと取引手数料(2.0%)が免除されます</li>
            <li>
              • 上位プランにアップグレードすると決済手数料が下がります<br />
              <span className="text-xs ml-3 text-amber-700">ベーシック 3.4% → スタンダード 2.9% → プレミアム 2.4%</span>
            </li>
            <li>
              • 月商{yen(thisMonth.shopifyRevenue)}の場合、スタンダードプランに変更すると
              手数料が月{yen(Math.round(savingsIfUpgrade))}削減できます
            </li>
          </ul>
        </div>
      </div>

      {/* ── セクション7: シミュレーター ─────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900">🔧 キャッシュフロー改善シミュレーター</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">数値を変えるとシミュレーション結果がリアルタイムで更新されます</p>

        <div className="grid grid-cols-2 gap-6">
          {/* スライダー1: 月次売上成長率 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">月次売上成長率</label>
              <span className="text-sm font-bold text-blue-900">{growthRate > 0 ? '+' : ''}{growthRate}%</span>
            </div>
            <input
              type="range" min={-10} max={30} value={growthRate}
              onChange={e => setGrowthRate(Number(e.target.value))}
              className="accent-blue-900 w-full"
            />
            <p className="text-xs text-slate-500 mt-1">毎月{growthRate > 0 ? '+' : ''}{growthRate}%成長した場合</p>
          </div>

          {/* スライダー2: 仕入比率 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">仕入比率</label>
              <span className="text-sm font-bold text-blue-900">{inventoryRate}%</span>
            </div>
            <input
              type="range" min={30} max={60} value={inventoryRate}
              onChange={e => setInventoryRate(Number(e.target.value))}
              className="accent-blue-900 w-full"
            />
            <p className="text-xs text-slate-500 mt-1">売上の{inventoryRate}%を仕入に使う場合</p>
          </div>

          {/* スライダー3: 広告費比率 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">広告費比率</label>
              <span className="text-sm font-bold text-blue-900">{adRate}%</span>
            </div>
            <input
              type="range" min={5} max={25} value={adRate}
              onChange={e => setAdRate(Number(e.target.value))}
              className="accent-blue-900 w-full"
            />
            <p className="text-xs text-slate-500 mt-1">売上の{adRate}%を広告費に使う場合</p>
          </div>

          {/* スライダー4: 初期キャッシュ */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">初期キャッシュ残高</label>
              <span className="text-sm font-bold text-blue-900">{yen(initialCash)}</span>
            </div>
            <input
              type="range" min={0} max={20_000_000} step={1_000_000} value={initialCash}
              onChange={e => setInitialCash(Number(e.target.value))}
              className="accent-blue-900 w-full"
            />
            <p className="text-xs text-slate-500 mt-1">現在のキャッシュ残高: {yen(initialCash)}</p>
          </div>
        </div>

        {/* シミュレーション結果 */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">6ヶ月後の残高</p>
            <p className={`text-xl font-bold ${sim6monthCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yen(sim6monthCash)}
            </p>
            <p className={`text-xs mt-1 ${simDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              (予測比 {simDiff >= 0 ? '+' : '▲'}{yen(simDiff)})
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">月次収支状況</p>
            {!firstLossSim ? (
              <p className="text-xl font-bold text-green-600">全月黒字</p>
            ) : (
              <p className="text-xl font-bold text-red-600">{firstLossSim.month}ヶ月目から赤字</p>
            )}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">必要な追加資金</p>
            {totalShortfallSim === 0 ? (
              <p className="text-xl font-bold text-green-600">追加資金不要 ✅</p>
            ) : (
              <p className="text-xl font-bold text-red-600">▲{yen(totalShortfallSim)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
