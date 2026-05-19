'use client';

import { PieChart, Pie, Cell } from 'recharts';

const donutData = [
  { name: '実入金額',   value: 4726227, color: '#1e3a8a' },
  { name: '決済手数料', value: 170000,  color: '#ef4444' },
  { name: '月額費用',   value: 3773,    color: '#f59e0b' },
];

export function FeeBreakdown() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900">💳 Shopify手数料の内訳</h3>
      <div className="mt-2">
        <span className="inline-block bg-blue-50 text-[#1e3a8a] text-[11px] font-semibold rounded-full px-3 py-1">
          現在のプラン: Shopify (ベーシック)
        </span>
      </div>

      <div className="grid grid-cols-[1fr_200px] gap-6 mt-5">
        {/* Left column */}
        <div>
          {/* Fee metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '月額料金',    value: '¥3,773',  sub: '税込み' },
              { label: '取引手数料', value: '2%',       sub: '外部決済利用時' },
              { label: '決済手数料', value: '3.4%',     sub: 'Shopify Payments利用時' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 font-medium">{item.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{item.value}</p>
                <p className="text-[10px] text-slate-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-4 mb-4" />

          {/* Calculation steps */}
          <p className="text-xs font-semibold text-slate-500">
            今月(¥5,000,000の売上)の手数料計算
          </p>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">売上</span>
              <span className="font-medium text-slate-900">¥5,000,000</span>
            </div>
            <div className="flex justify-between items-center text-xs bg-red-50 rounded-lg px-3 py-2">
              <span className="text-slate-600">× 決済手数料 3.4%</span>
              <span className="font-semibold text-red-500">▲¥170,000</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">月額料金</span>
              <span className="text-red-500">▲¥3,773</span>
            </div>
            <div className="border-t border-slate-100 my-1" />
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">実際の入金額</span>
              <span className="font-bold text-[#1e3a8a]">¥4,826,227</span>
            </div>
          </div>

          {/* AI tip */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <p className="text-xs font-bold text-amber-800">💡 手数料を抑えるには</p>
            <ul className="text-xs text-amber-700 space-y-1 mt-2">
              <li>・Shopify Payments を使うと取引手数料(2%)が免除されます</li>
              <li>・上位プランにアップグレードすると決済手数料が下がります</li>
              <li>・スタンダードプランに変更で月¥20,294の削減が可能です</li>
            </ul>
          </div>
        </div>

        {/* Right column: Donut chart */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <PieChart width={160} height={160}>
              <Pie
                data={donutData}
                cx={75}
                cy={75}
                innerRadius={48}
                outerRadius={72}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            {/* Center text — absolute overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-slate-900">5.5%</span>
              <span className="text-[10px] text-slate-500">手数料率</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-4 w-full">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
