'use client';

import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { type BudgetJudgeResult, type Judgment } from '@/lib/mock-data/marketing';

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

interface BudgetJudgmentTabProps {
  t1Spend: string;
  setT1Spend: (v: string) => void;
  t1Revenue: string;
  setT1Revenue: (v: string) => void;
  t1TargetRoas: string;
  setT1TargetRoas: (v: string) => void;
  t1Orders: string;
  setT1Orders: (v: string) => void;
  t1Margin: string;
  setT1Margin: (v: string) => void;
  t1StockDays: string;
  setT1StockDays: (v: string) => void;
  t1BudgetCap: string;
  setT1BudgetCap: (v: string) => void;
  t1Competitor: string;
  setT1Competitor: (v: string) => void;
  t1Loading: boolean;
  t1Error: boolean;
  t1Result: BudgetJudgeResult | null;
  t1BudgetCopied: boolean;
  t1Toast: boolean;
  currentRoas: string;
  onJudgeBudget: () => void;
  onBudgetCopy: () => void;
  onDelegate: () => void;
}

export function BudgetJudgmentTab({
  t1Spend, setT1Spend,
  t1Revenue, setT1Revenue,
  t1TargetRoas, setT1TargetRoas,
  t1Orders, setT1Orders,
  t1Margin, setT1Margin,
  t1StockDays, setT1StockDays,
  t1BudgetCap, setT1BudgetCap,
  t1Competitor, setT1Competitor,
  t1Loading, t1Error,
  t1Result,
  t1BudgetCopied, t1Toast,
  currentRoas,
  onJudgeBudget, onBudgetCopy, onDelegate,
}: BudgetJudgmentTabProps) {
  return (
    <div className="space-y-5">
      {/* フォーム */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">💰 広告費を増やすべきか判断します</h4>
          <p className="text-xs text-slate-500 mt-1">
            現在の数値を入力するだけで、AIが増額・現状維持・削減を判断します
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 今月の広告費 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              今月の広告費
            </label>
            <div className="relative">
              <Input type="number" value={t1Spend} onChange={(e) => setT1Spend(e.target.value)} placeholder="480000" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">円</span>
            </div>
          </div>

          {/* 商品の粗利率 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              商品の粗利率
            </label>
            <div className="relative">
              <Input type="number" step="0.1" value={t1Margin} onChange={(e) => setT1Margin(e.target.value)} placeholder="40" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </div>

          {/* 今月の広告経由売上 + ROAS */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              今月の広告経由売上
            </label>
            <div className="relative">
              <Input type="number" value={t1Revenue} onChange={(e) => setT1Revenue(e.target.value)} placeholder="1824000" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">円</span>
            </div>
            {currentRoas !== '—' && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                <span className="text-xs font-bold text-[#1e3a8a]">
                  現在のROAS: {currentRoas}倍
                </span>
              </div>
            )}
          </div>

          {/* 目標ROAS */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              目標ROAS
            </label>
            <div className="relative">
              <Input type="number" step="0.1" value={t1TargetRoas} onChange={(e) => setT1TargetRoas(e.target.value)} placeholder="3.0" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">倍</span>
            </div>
          </div>

          {/* 月間予算の上限 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              月間予算の上限
            </label>
            <div className="relative">
              <Input type="number" value={t1BudgetCap} onChange={(e) => setT1BudgetCap(e.target.value)} placeholder="700000" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">円</span>
            </div>
          </div>

          {/* 競合の広告強度 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              整合の広告強度
            </label>
            <select
              value={t1Competitor}
              onChange={(e) => setT1Competitor(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-[#1e3a8a] focus:outline-none"
            >
              <option value="low">低い（自社が強い）</option>
              <option value="normal">普通</option>
              <option value="high">高い（競合が強い）</option>
              <option value="unknown">分からない</option>
            </select>
          </div>

          {/* 今月の広告経由注文数 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              今月の広告経由注文数
            </label>
            <div className="relative">
              <Input type="number" value={t1Orders} onChange={(e) => setT1Orders(e.target.value)} placeholder="218" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">件</span>
            </div>
          </div>

          {/* 在庫残日数 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              在庫残日数
            </label>
            <div className="relative">
              <Input type="number" value={t1StockDays} onChange={(e) => setT1StockDays(e.target.value)} placeholder="45" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">日</span>
            </div>
          </div>
        </div>

        {/* AI CTA */}
        <button
          onClick={onJudgeBudget}
          disabled={t1Loading}
          className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-2xl py-4 text-base font-bold flex items-center justify-center gap-2 transition"
        >
          {t1Loading ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              分析中...
            </>
          ) : (
            '✨ AIに判断してもらう'
          )}
        </button>
      </div>

      {/* エラー */}
      {!t1Loading && t1Error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-red-600">分析中にエラーが発生しました。再試行してください。</p>
          <button
            onClick={onJudgeBudget}
            className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition-colors shrink-0 ml-4"
          >
            再試行
          </button>
        </div>
      )}

      {/* 結果 */}
      {t1Result && (
        <div className="space-y-4">
          {/* Verdict card */}
          {t1Result.verdict === 'increase' && (
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-8 text-center">
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
            <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-8 text-center">
              <p className="text-6xl">→</p>
              <p className="text-2xl font-bold text-[#1e3a8a] mt-2">現状維持が最適です</p>
              <p className="text-sm text-[#1e3a8a] mt-3 leading-relaxed">{t1Result.reason}</p>
            </div>
          )}
          {t1Result.verdict === 'decrease' && (
            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-8 text-center">
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
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'ROAS',   value: `${currentRoas}倍`,    judgment: t1Result.roasJudgment,   comment: t1Result.roasComment   },
              { label: '在庫',   value: `残${t1StockDays}日分`, judgment: t1Result.stockJudgment,  comment: t1Result.stockComment  },
              { label: '粗利率', value: `${t1Margin}%`,         judgment: t1Result.marginJudgment, comment: t1Result.marginComment },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-500 font-medium mb-1">{item.label}</p>
                <p className="text-lg font-bold text-slate-800">{item.value}</p>
                <p className="text-xl mt-1">{judgmentIcon(item.judgment)}</p>
                <p className={`text-xs mt-1 ${judgmentColor(item.judgment)}`}>{item.comment}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2 relative">
            <button
              onClick={onBudgetCopy}
              className="border w-full py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              {t1BudgetCopied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
              {t1BudgetCopied ? 'コピーしました' : '推奨予算をコピーする'}
            </button>
            <button
              onClick={onDelegate}
              className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white w-full py-3 rounded-xl font-medium transition-colors"
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
    </div>
  );
}
