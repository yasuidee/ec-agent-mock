'use client';

import { paymentSchedule } from '@/lib/mock-data/cashflow';

const yen = (n: number) => `¥${n.toLocaleString()}`;

const confirmedTotal = paymentSchedule
  .filter((p) => p.confirmed)
  .reduce((s, p) => s + p.amount, 0);
const scheduledTotal = paymentSchedule
  .filter((p) => !p.confirmed)
  .reduce((s, p) => s + p.amount, 0);
const grandTotal = confirmedTotal + scheduledTotal;

export function PaymentSchedule() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">🗓 今月の入金スケジュール</h3>
        <span className="text-xs text-slate-400">注文から3営業日後に入金されます</span>
      </div>

      {/* Column headers */}
      <div className="mt-4 grid grid-cols-[24px_100px_100px_1fr_auto] gap-4 bg-slate-50 rounded-lg px-3 py-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide" />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">日付</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">状態</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">内容</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-right">入金額</span>
      </div>

      {/* Rows */}
      <div className="mt-1">
        {paymentSchedule.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-[24px_100px_100px_1fr_auto] gap-4 items-center py-3.5 border-b border-slate-50 last:border-0"
          >
            <span className="text-base">{item.confirmed ? '✅' : '⏳'}</span>
            <span className="text-sm font-semibold text-slate-900">{item.date}</span>
            <div>
              {item.confirmed ? (
                <span className="bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                  入金確定
                </span>
              ) : (
                <span className="bg-blue-100 text-[#1e3a8a] rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                  入金予定
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">{item.detail}</span>
            <span className={`text-sm font-bold ml-auto ${item.confirmed ? 'text-[#1e3a8a]' : 'text-slate-700'}`}>
              {yen(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 bg-sky-50 border border-sky-200 rounded-xl grid grid-cols-3 divide-x divide-sky-200">
        {[
          { label: '入金確定済み',   value: confirmedTotal, size: 'text-base' },
          { label: '入金予定',       value: scheduledTotal, size: 'text-base' },
          { label: '合計入金見込み', value: grandTotal,     size: 'text-lg'  },
        ].map((item) => (
          <div key={item.label} className="px-6 py-3">
            <p className="text-[10px] text-slate-500 font-medium">{item.label}</p>
            <p className={`${item.size} font-bold text-slate-900 mt-0.5`}>¥{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
