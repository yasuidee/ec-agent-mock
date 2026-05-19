'use client';

import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { topProducts } from '@/lib/mock-data';
import {
  type AdPlanForm,
  type AdPlanResult,
} from '@/lib/mock-data/marketing';

interface AdPlanningTabProps {
  planForm: AdPlanForm;
  setPlanForm: React.Dispatch<React.SetStateAction<AdPlanForm>>;
  planResult: AdPlanResult | null;
  planLoading: boolean;
  planCopied: boolean;
  metaChecks: Record<string, boolean>;
  googleChecks: Record<string, boolean>;
  setMetaChecks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setGoogleChecks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onCreatePlan: () => void;
  onCopyPlan: () => void;
}

export function AdPlanningTab({
  planForm,
  setPlanForm,
  planResult,
  planLoading,
  planCopied,
  metaChecks,
  googleChecks,
  setMetaChecks,
  setGoogleChecks,
  onCreatePlan,
  onCopyPlan,
}: AdPlanningTabProps) {
  return (
    <div className="space-y-5">
      {/* 情報バナー */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-xs font-medium text-[#1e3a8a]">
          📋 新しい広告キャンペーンのプランニングをサポートします。
          AIが生成した指示書をもとに広告管理画面で設定してください。
        </p>
      </div>

      {/* フォーム */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900">キャンペーン情報を入力</h4>

        <div className="grid grid-cols-2 gap-4">
          {/* 広告の目的 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              広告の目的
            </label>
            <select
              value={planForm.objective}
              onChange={(e) => setPlanForm((f) => ({ ...f, objective: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-[#1e3a8a] focus:outline-none"
            >
              <option>売上を増やしたい</option>
              <option>新規顧客を獲得したい</option>
              <option>ブランド認知を広げたい</option>
              <option>特定商品を売り切りたい</option>
            </select>
          </div>
          {/* メイン商品 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              メイン商品
            </label>
            <select
              value={planForm.productName}
              onChange={(e) => setPlanForm((f) => ({ ...f, productName: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-[#1e3a8a] focus:outline-none"
            >
              {topProducts.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 掲載プラットフォーム + ターゲット顧客 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              掲載プラットフォーム
            </label>
            <div className="flex flex-wrap gap-3">
              {['Meta(Facebook/Instagram)', 'Google検索広告', 'Googleショッピング'].map((p) => (
                <label key={p} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-[#1e3a8a]"
                    checked={planForm.platforms.includes(p)}
                    onChange={() =>
                      setPlanForm((f) => ({
                        ...f,
                        platforms: f.platforms.includes(p)
                          ? f.platforms.filter((x) => x !== p)
                          : [...f.platforms, p],
                      }))
                    }
                  />
                  {p}
                </label>
              ))}
            </div>
            {planForm.platforms.length === 0 && (
              <p className="text-xs text-red-500 mt-1.5">
                プラットフォームを1つ以上選択してください
              </p>
            )}
          </div>
          {/* ターゲット顧客 */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              ターゲット顧客
            </label>
            <textarea
              value={planForm.targetAudience}
              onChange={(e) => setPlanForm((f) => ({ ...f, targetAudience: e.target.value }))}
              rows={3}
              placeholder="例: 料理好きな30-40代の女性、プレゼントを探している方"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 bg-slate-50 focus:border-[#1e3a8a] focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* 月間予算 + 目標KPI */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              月間予算
            </label>
            <div className="relative">
              <Input
                type="number"
                value={planForm.budget}
                onChange={(e) => setPlanForm((f) => ({ ...f, budget: e.target.value }))}
                placeholder="100000"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">円</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              目標KPI
            </label>
            <select
              value={planForm.targetKpi}
              onChange={(e) => setPlanForm((f) => ({ ...f, targetKpi: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-[#1e3a8a] focus:outline-none"
            >
              <option>ROAS 3倍以上</option>
              <option>ROAS 2倍以上</option>
              <option>CPA ¥3,000以下</option>
              <option>CPA ¥5,000以下</option>
            </select>
          </div>
        </div>

        {/* キャンペーン期間 */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            キャンペーン期間
          </label>
          <select
            value={planForm.campaignPeriod}
            onChange={(e) => setPlanForm((f) => ({ ...f, campaignPeriod: e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:border-[#1e3a8a] focus:outline-none"
          >
            <option>1週間</option>
            <option>2週間</option>
            <option>1ヶ月</option>
            <option>継続的に</option>
          </select>
        </div>

        {/* AI CTA */}
        <button
          onClick={onCreatePlan}
          disabled={planLoading || planForm.platforms.length === 0}
          className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 disabled:bg-slate-300 text-white rounded-2xl py-4 text-base font-bold flex items-center justify-center gap-2 transition"
        >
          {planLoading ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              プラン作成中...
            </>
          ) : (
            '✨ AIに広告プランを作成してもらう'
          )}
        </button>
      </div>

      {/* 結果 */}
      {planResult && (
        <div className="bg-white border-2 border-[#1e3a8a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-[#1e3a8a]">📋 広告設定指示書</h3>
            <button
              onClick={onCopyPlan}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {planCopied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
              {planCopied ? 'コピーしました' : '指示書をコピーする'}
            </button>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 mb-4 text-sm text-amber-700">
            ⚠️ この指示書はAIが生成した推奨設定です。実際の設定は各広告管理画面で手動で行ってください。
          </div>

          {planForm.platforms.some((p) => p.includes('Meta')) && (
            <div className="bg-slate-50 rounded-xl p-5 mb-4">
              <p className="font-medium text-slate-800 mb-3">Meta広告 設定手順</p>
              <div className="space-y-3">
                {[
                  { key: 'objective',   label: 'キャンペーン目的',          value: planResult.metaPlan.objective,                          location: 'キャンペーン作成 > キャンペーンの目的' },
                  { key: 'dailyBudget', label: '1日の予算',                 value: `¥${planResult.metaPlan.dailyBudget.toLocaleString()}`,  location: '広告セット > 予算と日程' },
                  { key: 'targetAge',   label: 'ターゲット年齢',             value: planResult.metaPlan.targetAge,                          location: '広告セット > オーディエンス > 年齢' },
                  { key: 'interests',   label: 'ターゲット興味関心',         value: planResult.metaPlan.interests.join(', '),               location: '広告セット > オーディエンス > 詳細なターゲット設定' },
                  { key: 'mainCopy',    label: '広告コピー（メインテキスト）', value: planResult.metaPlan.mainCopy,                           location: '広告 > 広告クリエイティブ' },
                  { key: 'headline',    label: '見出し',                    value: planResult.metaPlan.headline,                           location: '広告 > 広告クリエイティブ > 見出し' },
                  { key: 'cta',         label: 'CTAボタン',                 value: planResult.metaPlan.cta,                                location: '広告 > 広告クリエイティブ > 行動を促すフレーズ' },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 cursor-pointer hover:bg-white rounded-lg p-3 transition-colors">
                    <input
                      type="checkbox"
                      checked={metaChecks[item.key] || false}
                      onChange={() => setMetaChecks((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className="mt-0.5 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">設定値: {item.value}</p>
                      <p className="text-xs text-[#1e3a8a]">設定場所: {item.location}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{Object.values(metaChecks).filter(Boolean).length}/7項目を設定しました</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full">
                  <div
                    className="h-full bg-[#1e3a8a] rounded-full transition-all"
                    style={{ width: `${(Object.values(metaChecks).filter(Boolean).length / 7) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {planForm.platforms.some((p) => p.includes('Google')) && (
            <div className="bg-slate-50 rounded-xl p-5 mb-4">
              <p className="font-medium text-slate-800 mb-3">Google広告 設定手順</p>
              <div className="space-y-3">
                {[
                  { key: 'campaignType',     label: 'キャンペーンタイプ',  value: planResult.googlePlan.campaignType,                          location: 'キャンペーン作成 > キャンペーンタイプ' },
                  { key: 'dailyBudget',      label: '1日の予算',           value: `¥${planResult.googlePlan.dailyBudget.toLocaleString()}`,     location: 'キャンペーン > 予算' },
                  { key: 'biddingStrategy',  label: '入札戦略',            value: planResult.googlePlan.biddingStrategy,                        location: 'キャンペーン > 入札戦略' },
                  { key: 'keywords',         label: 'キーワード',           value: planResult.googlePlan.keywords.join(', '),                   location: 'キーワード > キーワードを追加' },
                  { key: 'negativeKeywords', label: '除外キーワード',       value: planResult.googlePlan.negativeKeywords.join(', '),            location: 'キーワード > 除外キーワード' },
                  { key: 'headline1',        label: '見出し1',             value: planResult.googlePlan.headline1,                              location: '広告 > レスポンシブ検索広告' },
                  { key: 'description',      label: '説明文',              value: planResult.googlePlan.description,                            location: '広告 > レスポンシブ検索広告 > 説明文' },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-3 cursor-pointer hover:bg-white rounded-lg p-3 transition-colors">
                    <input
                      type="checkbox"
                      checked={googleChecks[item.key] || false}
                      onChange={() => setGoogleChecks((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className="mt-0.5 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">設定値: {item.value}</p>
                      <p className="text-xs text-[#1e3a8a]">設定場所: {item.location}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{Object.values(googleChecks).filter(Boolean).length}/7項目を設定しました</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full">
                  <div
                    className="h-full bg-[#1e3a8a] rounded-full transition-all"
                    style={{ width: `${(Object.values(googleChecks).filter(Boolean).length / 7) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-4">
            <p className="font-medium text-slate-800">📊 このプランの期待値（目安）</p>
            <div className="grid grid-cols-4 gap-4 mt-3">
              {[
                { label: '月間インプレッション', value: `約${planResult.forecast.monthlyImpressions.toLocaleString()}回` },
                { label: '月間クリック数',       value: `約${planResult.forecast.monthlyClicks.toLocaleString()}回` },
                { label: '期待ROAS',             value: `${planResult.forecast.expectedRoas}倍` },
                { label: '期待注文数',           value: `約${planResult.forecast.expectedOrders}件` },
              ].map((item) => (
                <div key={item.label} className="bg-white border rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              ※予測値はAIの試算です。実際の結果は市場状況により異なります。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
