'use client';

interface KpiCard {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  sub?: string;
}

interface KpiSummaryGridProps {
  cards?: KpiCard[];
}

const DEFAULT_CARDS: KpiCard[] = [
  { label: '月間売上',  value: '¥1,870,000', delta: '前月比 +12.4%', deltaPositive: true,  sub: '目標 ¥3,000,000' },
  { label: '粗利',      value: '¥748,000',   delta: '前月比 +8.1%',  deltaPositive: true,  sub: '粗利率 40.0%' },
  { label: '注文数',    value: '340件',       delta: '前月比 +26件',  deltaPositive: true,  sub: '目標 550件' },
  { label: 'ROAS',      value: '3.8倍',       delta: '前月比 +0.2',   deltaPositive: true,  sub: '広告費 ¥480,000' },
];

export function KpiSummaryGrid({ cards = DEFAULT_CARDS }: KpiSummaryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col gap-1"
        >
          <p className="text-xs text-slate-500 font-medium">{card.label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{card.value}</p>
          <p
            className={`text-xs font-semibold ${
              card.deltaPositive ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {card.delta}
          </p>
          {card.sub && <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
