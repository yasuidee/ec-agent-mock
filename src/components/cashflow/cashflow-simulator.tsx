'use client';

interface CashflowSimulatorProps {
  growthRate: number;
  inventoryRate: number;
  adRate: number;
  initialCash: number;
  onGrowthRateChange: (v: number) => void;
  onInventoryRateChange: (v: number) => void;
  onAdRateChange: (v: number) => void;
  onInitialCashChange: (v: number) => void;
  sim6monthCash: number;
  originalFinalCash: number;
  firstLossSim: { month: number } | undefined;
  totalShortfallSim: number;
}

const yen = (n: number) => `¥${Math.abs(n).toLocaleString()}`;

export function CashflowSimulator({
  growthRate,
  inventoryRate,
  adRate,
  initialCash,
  onGrowthRateChange,
  onInventoryRateChange,
  onAdRateChange,
  onInitialCashChange,
  sim6monthCash,
  originalFinalCash,
  firstLossSim,
  totalShortfallSim,
}: CashflowSimulatorProps) {
  const simDiff = sim6monthCash - originalFinalCash;
  const allPositive = !firstLossSim;

  const sliders = [
    {
      label: '月次売上成長率',
      value: growthRate,
      min: -10,
      max: 30,
      step: 1,
      display: `+${growthRate}%`,
      hint: `毎月+${growthRate}%成長した場合`,
      onChange: (v: number) => onGrowthRateChange(v),
    },
    {
      label: '仕入比率',
      value: inventoryRate,
      min: 10,
      max: 80,
      step: 1,
      display: `${inventoryRate}%`,
      hint: `売上の${inventoryRate}%を仕入に使う場合`,
      onChange: (v: number) => onInventoryRateChange(v),
    },
    {
      label: '広告費比率',
      value: adRate,
      min: 0,
      max: 30,
      step: 1,
      display: `${adRate}%`,
      hint: `売上の${adRate}%を広告費に使う場合`,
      onChange: (v: number) => onAdRateChange(v),
    },
    {
      label: '初期キャッシュ残高',
      value: initialCash / 1000000,
      min: 1,
      max: 50,
      step: 1,
      display: `¥${(initialCash / 1000000).toFixed(0)}M`,
      hint: '現在のキャッシュ残高',
      onChange: (v: number) => onInitialCashChange(v * 1000000),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900">📐 CF改善シミュレーター</h3>
      <p className="text-xs text-slate-400 mt-0.5">数値を変えるとリアルタイムで更新されます</p>

      {/* Sliders */}
      <div className="space-y-5 mt-5">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-600">{s.label}</span>
              <span className="text-xs font-bold text-[#1e3a8a]">{s.display}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.onChange(Number(e.target.value))}
              className="w-full accent-[#1e3a8a]"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Result strip */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
        <div>
          <p className="text-[10px] text-slate-500">6ヶ月後の残高予測</p>
          <p className="text-base font-bold text-emerald-700 mt-0.5">{yen(sim6monthCash)}</p>
          <p className="text-[10px] text-emerald-500">
            (現在比 {simDiff >= 0 ? '+' : ''}{yen(simDiff)})
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500">月次収支状況</p>
          <p className="text-sm font-bold text-emerald-700 mt-0.5">
            {allPositive ? '全月黒字' : `${firstLossSim?.month}ヶ月目に赤字`}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500">必要な追加資金</p>
          <p className="text-sm font-bold text-emerald-700 mt-0.5">
            {totalShortfallSim === 0 ? '追加資金不要 ✅' : `${yen(totalShortfallSim)}の資金不足`}
          </p>
        </div>
      </div>
    </div>
  );
}
