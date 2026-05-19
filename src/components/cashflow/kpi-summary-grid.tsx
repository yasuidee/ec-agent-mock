'use client';

interface KpiCashflowGridProps {
  revenue: number;
  fees: number;
  feeRate: string;
  netIncome: number;
  payoutDate: string;
  netIncomeDelta: number;
  netCashflow: number;
}

const yen = (n: number) => `¥${Math.abs(n).toLocaleString()}`;

export function KpiCashflowGrid({
  revenue,
  fees,
  feeRate,
  netIncome,
  payoutDate,
  netIncomeDelta,
  netCashflow,
}: KpiCashflowGridProps) {
  const cards = [
    {
      accentColor: 'bg-[#1e3a8a]',
      iconBg: 'bg-blue-100',
      icon: '💰',
      label: '今月の売上',
      value: yen(revenue),
      sub: 'Shopify売上総額',
      extra: null,
    },
    {
      accentColor: 'bg-red-500',
      iconBg: 'bg-red-100',
      icon: '📉',
      label: '差し引き手数料',
      value: yen(fees),
      sub: '取引手数料＋月額費用',
      extra: (
        <span className="inline-block bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[10px] font-semibold mt-2">
          予算料率 {feeRate}%
        </span>
      ),
    },
    {
      accentColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-100',
      icon: '🏦',
      label: '実際の入金額',
      value: yen(netIncome),
      sub: `入金予定日: ${payoutDate}`,
      extra: (
        <span className="inline-block bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] font-semibold mt-2">
          {netIncomeDelta >= 0 ? '↑' : '↓'} 前月比 {netIncomeDelta >= 0 ? '+' : ''}
          {yen(netIncomeDelta)}
        </span>
      ),
    },
    {
      accentColor: 'bg-violet-500',
      iconBg: 'bg-violet-100',
      icon: '📊',
      label: '今月の収支',
      value: yen(netCashflow),
      sub: '入金-仕入-広告-固定費',
      extra: (
        <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full"
            style={{ width: `${Math.min(100, (netCashflow / 3000000) * 100)}%` }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Accent bar */}
          <div className={`h-1 w-full ${card.accentColor}`} />
          {/* Body */}
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center text-base shrink-0`}>
                {card.icon}
              </div>
              <span className="text-xs text-slate-500 font-medium">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
            {card.extra}
          </div>
        </div>
      ))}
    </div>
  );
}
