'use client';

interface CashRiskAlertProps {
  riskMonth: string;
  deficit: number;
  income: number;
  expense: number;
}

const yen = (n: number) => `¥${Math.abs(n).toLocaleString()}`;

export function CashRiskAlert({ riskMonth, deficit, income, expense }: CashRiskAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden flex items-stretch">
      {/* Left accent bar */}
      <div className="w-1.5 bg-red-500 shrink-0" />

      {/* Body */}
      <div className="flex-1 p-5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center text-xl shrink-0">
            🚨
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-red-700">キャッシュ枯渇リスクを検出しました</p>
            <p className="text-xs text-red-500 mt-0.5">
              {riskMonth}: 収支がマイナスになる見込みです
            </p>
          </div>

          {/* Risk badge */}
          <div className="ml-auto shrink-0 bg-red-100 border border-red-300 rounded-xl px-4 py-2.5 text-center">
            <p className="text-sm font-bold text-red-700">▲{yen(deficit)}の赤字</p>
            <p className="text-[10px] text-red-500 mt-1">
              入金{yen(income)} − 出金{yen(expense)}
            </p>
          </div>
        </div>

        {/* AI suggestions */}
        <div className="mt-3 pl-14">
          <p className="text-[11px] font-bold text-[#1e3a8a] mb-1.5">AIの対策提案</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>・仕入タイミングを分散して{riskMonth}の出金を抑えてください</li>
            <li>・{riskMonth}に向けて売上を{yen(deficit + 100000)}上積みする施策が必要です</li>
            <li>・融資・ファクタリングの活用も検討してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
