'use client';

import { Input } from '@/components/ui/input';
import { X as XIcon, Plus } from 'lucide-react';
import {
  type ImproveCampaignRow,
  type ImprovementResult,
} from '@/lib/mock-data/marketing';

interface AdImprovementTabProps {
  improveAdPlatformTab: string;
  setImproveAdPlatformTab: (v: string) => void;
  improveMetaRows: ImproveCampaignRow[];
  improveGoogleRows: ImproveCampaignRow[];
  improveTargetRoas: string;
  setImproveTargetRoas: (v: string) => void;
  improveTargetCpa: string;
  setImproveTargetCpa: (v: string) => void;
  improveBudgetCap: string;
  setImproveBudgetCap: (v: string) => void;
  improvementResult: ImprovementResult | null;
  improvementLoading: boolean;
  improveChecks: Record<string, boolean>;
  setImproveChecks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onAddRow: (platform: 'meta' | 'google') => void;
  onRemoveRow: (id: string, platform: 'meta' | 'google') => void;
  onUpdateRow: (id: string, field: keyof ImproveCampaignRow, value: string, platform: 'meta' | 'google') => void;
  onCreateImprovement: () => void;
}

export function AdImprovementTab({
  improveAdPlatformTab,
  setImproveAdPlatformTab,
  improveMetaRows,
  improveGoogleRows,
  improveTargetRoas,
  setImproveTargetRoas,
  improveTargetCpa,
  setImproveTargetCpa,
  improveBudgetCap,
  setImproveBudgetCap,
  improvementResult,
  improvementLoading,
  improveChecks,
  setImproveChecks,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onCreateImprovement,
}: AdImprovementTabProps) {
  const activeRows = improveAdPlatformTab === 'meta' ? improveMetaRows : improveGoogleRows;
  const activePlatform = improveAdPlatformTab as 'meta' | 'google';

  return (
    <div className="space-y-5">
      {/* 情報バナー */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-xs font-medium text-amber-800">
          🔄 稼働中の広告データを入力すると、AIが具体的な改善指示書を生成します。
          指示書をもとに広告管理画面で修正してください。
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900">稼働中の広告データを入力</h4>

        {/* Meta/Google 切替トグル */}
        <div className="bg-slate-100 rounded-lg p-1 inline-flex gap-1">
          {['Meta広告', 'Google広告'].map((p) => (
            <button
              key={p}
              onClick={() => setImproveAdPlatformTab(p === 'Meta広告' ? 'meta' : 'google')}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
                (p === 'Meta広告' ? 'meta' : 'google') === improveAdPlatformTab
                  ? 'bg-white text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* 広告追加ボタン */}
        <button
          onClick={() => onAddRow(activePlatform)}
          disabled={activeRows.length >= 8}
          className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
        >
          <Plus size={14} />広告を追加する
        </button>

        {/* 広告行 */}
        <div className="space-y-3">
          {activeRows.length === 0 && activePlatform === 'google' && (
            <p className="text-sm text-slate-400 text-center py-4">
              「広告を追加する」ボタンでGoogle広告データを入力してください
            </p>
          )}
          {activeRows.map((row) => {
            const roas =
              activePlatform === 'meta' && row.purchases && row.spend
                ? (Number(row.purchases) * 5500 / Number(row.spend)).toFixed(2)
                : row.roas || '—';
            const roasNum = parseFloat(roas);
            const roasLow = !isNaN(roasNum) && roasNum < 1.0;

            return (
              <div key={row.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
                <button
                  onClick={() => onRemoveRow(row.id, activePlatform)}
                  className="absolute top-3 right-3 w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-500 text-xs flex items-center justify-center transition"
                >
                  <XIcon size={12} />
                </button>

                {/* カラムラベル */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr] gap-3 mb-2 pr-8">
                  {(activePlatform === 'meta'
                    ? ['キャンペーン名', '月間費用（円）', 'クリック数', '購入数', 'ROAS（自動計算）']
                    : ['キャンペーン名', '月間費用（円）', 'クリック数', 'CVR(%)', 'ROAS']
                  ).map((l) => (
                    <span key={l} className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                      {l}
                    </span>
                  ))}
                </div>

                {/* 入力フィールド */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr] gap-3 pr-8">
                  <Input
                    value={row.name}
                    onChange={(e) => onUpdateRow(row.id, 'name', e.target.value, activePlatform)}
                    placeholder="キャンペーン名"
                    className="text-xs"
                  />
                  <Input
                    type="number"
                    value={row.spend}
                    onChange={(e) => onUpdateRow(row.id, 'spend', e.target.value, activePlatform)}
                    placeholder="120000"
                    className="text-xs"
                  />
                  <Input
                    type="number"
                    value={row.clicks}
                    onChange={(e) => onUpdateRow(row.id, 'clicks', e.target.value, activePlatform)}
                    placeholder="2400"
                    className="text-xs"
                  />
                  {activePlatform === 'meta' ? (
                    <Input
                      type="number"
                      value={row.purchases}
                      onChange={(e) => onUpdateRow(row.id, 'purchases', e.target.value, activePlatform)}
                      placeholder="42"
                      className="text-xs"
                    />
                  ) : (
                    <Input
                      type="number"
                      step="0.1"
                      value={row.cvr}
                      onChange={(e) => onUpdateRow(row.id, 'cvr', e.target.value, activePlatform)}
                      placeholder="1.7"
                      className="text-xs"
                    />
                  )}
                  {/* ROAS */}
                  {activePlatform === 'meta' ? (
                    <div
                      className={`border rounded-lg px-3 py-2 text-sm font-bold ${
                        roasLow
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {roas}{roas !== '—' ? '倍' : ''}
                    </div>
                  ) : (
                    <Input
                      type="number"
                      step="0.1"
                      value={row.roas}
                      onChange={(e) => onUpdateRow(row.id, 'roas', e.target.value, activePlatform)}
                      placeholder="3.0"
                      className="text-xs"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 目標指標 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-4">
          {[
            { label: '目標ROAS',    value: improveTargetRoas, setter: setImproveTargetRoas, suffix: '倍',  step: '0.1' },
            { label: '目標CPA',     value: improveTargetCpa,  setter: setImproveTargetCpa,  suffix: '円',  step: undefined },
            { label: '月間予算上限', value: improveBudgetCap,  setter: setImproveBudgetCap,  suffix: '円',  step: undefined },
          ].map(({ label, value, setter, suffix, step }) => (
            <div key={label}>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step={step}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {suffix}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI CTA */}
        <button
          onClick={onCreateImprovement}
          disabled={improvementLoading}
          className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-2xl py-4 text-base font-bold flex items-center justify-center gap-2 transition"
        >
          {improvementLoading ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              分析中...
            </>
          ) : (
            '✨ AIに改善提案を作成してもらう'
          )}
        </button>
      </div>

      {/* 結果 */}
      {improvementResult && (
        <div className="space-y-4">
          {improvementResult.campaigns.map((c, i) => {
            const checkPrefix = `c${i}`;
            if (c.status === 'good') return (
              <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="font-semibold text-green-700">✅ {c.name}: 目標達成中</p>
                <p className="text-sm text-slate-600 mt-1">現在ROAS {c.currentRoas}倍 / 目標{improveTargetRoas}倍</p>
                <p className="text-sm text-slate-500 mt-2">このキャンペーンは現在の設定を維持してください。</p>
              </div>
            );
            if (c.status === 'stop') return (
              <div key={i} className="bg-red-50 border-2 border-red-400 rounded-xl p-5">
                <p className="font-semibold text-red-700">🛑 {c.name}: 停止を推奨</p>
                <p className="text-sm text-slate-600 mt-1">ROAS {c.currentRoas}倍は採算ラインを下回っています</p>
                <p className="text-sm text-red-600 mt-1">月間損失推定: ¥{c.lossAmount.toLocaleString()}</p>
                <div className="mt-3 space-y-2">
                  {[
                    'Step 1: 広告管理画面にログイン',
                    `Step 2: キャンペーン一覧から「${c.name}」を選択`,
                    'Step 3: ステータスを「一時停止」に変更',
                    'Step 4: 節約できた予算を改善中のキャンペーンに振り替える',
                  ].map((step, j) => (
                    <label key={j} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-white rounded-lg p-3 transition-colors">
                      <input
                        type="checkbox"
                        checked={improveChecks[`${checkPrefix}_stop_${j}`] || false}
                        onChange={() =>
                          setImproveChecks((prev) => ({
                            ...prev,
                            [`${checkPrefix}_stop_${j}`]: !prev[`${checkPrefix}_stop_${j}`],
                          }))
                        }
                        className="rounded"
                      />
                      {step}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">※この指示書はAIの提案です。実際の操作は広告管理画面で手動で行ってください。</p>
              </div>
            );
            return (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="font-semibold text-amber-700">⚠️ {c.name}: 改善が必要</p>
                <p className="text-sm text-slate-600 mt-1">現在ROAS {c.currentRoas}倍 / 目標{improveTargetRoas}倍</p>
                <div className="bg-white rounded-lg p-4 mt-3">
                  <p className="text-sm font-medium text-slate-800 mb-3">以下を広告管理画面で修正してください:</p>
                  <div className="space-y-3">
                    {[
                      { key: 'targeting', label: 'ターゲティングの修正', detail: c.improvements.targeting,                                                                                                                                             location: '広告セット > オーディエンス' },
                      { key: 'budget',    label: '予算の調整',           detail: `現在¥${c.improvements.budget.current}/日 → 推奨¥${c.improvements.budget.recommended}/日（${c.improvements.budget.reason}）`,                                       location: 'キャンペーン > 予算と日程' },
                      { key: 'creative',  label: 'クリエイティブの変更', detail: c.improvements.creative,                                                                                                                                             location: '広告 > クリエイティブを編集' },
                      { key: 'keywords',  label: 'キーワード最適化',     detail: `追加: ${c.improvements.keywords.add.join(', ')} / 除外: ${c.improvements.keywords.remove.join(', ')}`,                                                            location: 'キーワード' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 cursor-pointer hover:bg-amber-50 rounded-lg p-3 transition-colors">
                        <input
                          type="checkbox"
                          checked={improveChecks[`${checkPrefix}_${item.key}`] || false}
                          onChange={() =>
                            setImproveChecks((prev) => ({
                              ...prev,
                              [`${checkPrefix}_${item.key}`]: !prev[`${checkPrefix}_${item.key}`],
                            }))
                          }
                          className="mt-0.5 rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.detail}</p>
                          <p className="text-xs text-[#1e3a8a]">設定場所: {item.location}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 mt-3">
                    <p className="text-sm text-[#1e3a8a]">
                      改善後の期待ROAS: {c.expectedRoasAfter.toFixed(1)}倍（現在比 +{(c.expectedRoasAfter - c.currentRoas).toFixed(1)}倍）
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">※この指示書はAIの提案です。実際の設定は広告管理画面で手動で行ってください。</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
