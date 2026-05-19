'use client';

import { Input } from '@/components/ui/input';
import { X as XIcon, Plus } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { type AdRow, type AdStopResult, type Judgment } from '@/lib/mock-data/marketing';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

function judgmentLabel(j: Judgment) {
  if (j === 'good') return '良い';
  if (j === 'warning') return '普通';
  return '悪い';
}
function judgmentColor(j: Judgment) {
  if (j === 'good') return 'text-green-600';
  if (j === 'warning') return 'text-amber-600';
  return 'text-red-500';
}

interface StopJudgmentTabProps {
  adRows: AdRow[];
  t2Loading: boolean;
  t2Error: boolean;
  t2Result: AdStopResult | null;
  onAddAd: () => void;
  onRemoveAd: (id: string) => void;
  onUpdateAd: (id: string, field: keyof AdRow, value: string) => void;
  onJudgeStop: () => void;
}

export function StopJudgmentTab({
  adRows,
  t2Loading,
  t2Error,
  t2Result,
  onAddAd,
  onRemoveAd,
  onUpdateAd,
  onJudgeStop,
}: StopJudgmentTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-bold text-slate-900">🛑 止めるべき広告を特定します</h4>
        <p className="text-xs text-slate-500 mt-1">
          広告ごとの数値を入力してください。AIが継続・改善・停止を判定します
        </p>
      </div>

      {/* 広告追加ボタン */}
      <button
        onClick={onAddAd}
        disabled={adRows.length >= 10}
        className="border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition flex items-center gap-2"
      >
        <Plus size={14} />広告を追加する
      </button>

      {/* 広告行 */}
      <div className="space-y-3">
        {adRows.map((row) => (
          <div key={row.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
            <button
              onClick={() => onRemoveAd(row.id)}
              className="absolute top-3 right-3 w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-500 text-xs flex items-center justify-center transition"
            >
              <XIcon size={12} />
            </button>

            {/* カラムラベル */}
            <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-3 mb-2 pr-8">
              {['広告名/商品名', '月間広告費（円）', '広告経由売上（円）', 'クリック数', '転換数'].map((l) => (
                <span key={l} className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                  {l}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-3 pr-8">
              <Input
                value={row.adName}
                onChange={(e) => onUpdateAd(row.id, 'adName', e.target.value)}
                placeholder="ヒノキカッティングボード_検索広告"
                className="text-xs"
              />
              <Input
                type="number"
                value={row.monthlySpend}
                onChange={(e) => onUpdateAd(row.id, 'monthlySpend', e.target.value)}
                placeholder="18000"
                className="text-xs"
              />
              <Input
                type="number"
                value={row.adRevenue}
                onChange={(e) => onUpdateAd(row.id, 'adRevenue', e.target.value)}
                placeholder="68400"
                className="text-xs"
              />
              <Input
                type="number"
                value={row.clicks}
                onChange={(e) => onUpdateAd(row.id, 'clicks', e.target.value)}
                placeholder="2400"
                className="text-xs"
              />
              <Input
                type="number"
                value={row.conversions}
                onChange={(e) => onUpdateAd(row.id, 'conversions', e.target.value)}
                placeholder="168"
                className="text-xs"
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI CTA */}
      <button
        onClick={onJudgeStop}
        disabled={t2Loading || adRows.length === 0}
        className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-2xl py-4 text-base font-bold flex items-center justify-center gap-2 transition"
      >
        {t2Loading ? (
          <>
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            分析中...
          </>
        ) : (
          '✨ AIに判定してもらう'
        )}
      </button>

      {/* エラー */}
      {!t2Loading && t2Error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-600">分析中にエラーが発生しました。再試行してください。</p>
          <button
            onClick={onJudgeStop}
            className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition-colors shrink-0 ml-4"
          >
            再試行
          </button>
        </div>
      )}

      {/* 結果 */}
      {t2Result && (
        <div className="space-y-4">
          {/* サマリー */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6">
            <PieChart width={80} height={80}>
              <Pie
                data={[
                  { name: '継続', value: t2Result.summary.continueCount },
                  { name: '改善', value: t2Result.summary.improveCount },
                  { name: '停止', value: t2Result.summary.stopCount },
                ].filter((d) => d.value > 0)}
                cx={35} cy={35}
                innerRadius={22} outerRadius={35}
                dataKey="value"
                stroke="none"
              >
                {PIE_COLORS.map((color, idx) => (
                  <Cell key={idx} fill={color} />
                ))}
              </Pie>
            </PieChart>
            <div>
              <p className="text-sm font-medium text-slate-800">{adRows.length}件中</p>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-green-600 font-medium">継続 {t2Result.summary.continueCount}件</span>
                <span className="text-xs text-amber-600 font-medium">改善 {t2Result.summary.improveCount}件</span>
                <span className="text-xs text-red-500 font-medium">停止 {t2Result.summary.stopCount}件</span>
              </div>
            </div>
          </div>

          {/* 個別カード */}
          {t2Result.results.map((r, i) => {
            const isStop = r.verdict === 'stop';
            const isImprove = r.verdict === 'improve';
            const cardClass = isStop
              ? 'bg-red-50 border border-red-200'
              : isImprove
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-green-50 border border-green-200';
            const badgeClass = isStop ? 'bg-red-500' : isImprove ? 'bg-amber-500' : 'bg-green-500';
            const badgeLabel = isStop ? '🛑 停止' : isImprove ? '⚠️ 改善' : '✅ 継続';

            return (
              <div key={i} className={`${cardClass} rounded-2xl p-5`}>
                <div className="flex items-start gap-4">
                  <span className={`${badgeClass} text-white text-sm font-medium px-4 py-2 rounded-lg shrink-0`}>
                    {badgeLabel}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{r.adName}</p>
                    <p className="text-sm text-slate-600 mt-1">{r.reason}</p>
                    {r.action && <p className="text-sm text-amber-700 mt-2">💡 {r.action}</p>}
                    {isStop && (
                      <button className="mt-2 border border-red-300 text-red-500 text-sm px-4 py-2 rounded hover:bg-red-50 transition-colors">
                        この広告を停止する（準備中）
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: 'ROAS',   value: `${r.roas}倍`,                j: r.roasJudgment },
                    { label: 'CPA',    value: `¥${r.cpa.toLocaleString()}`, j: r.cpaJudgment  },
                    { label: 'CVR',    value: `${r.cvr}%`,                  j: r.cvrJudgment  },
                    { label: '月間利益', value: `¥${r.monthlyProfit.toLocaleString()}`, j: (r.monthlyProfit >= 0 ? 'good' : 'danger') as Judgment },
                  ].map((item) => (
                    <div key={item.label} className="bg-white rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                      <p className={`text-xs mt-0.5 font-medium ${judgmentColor(item.j)}`}>
                        {judgmentLabel(item.j)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
