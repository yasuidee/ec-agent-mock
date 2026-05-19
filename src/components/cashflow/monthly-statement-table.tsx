'use client';

import { useState } from 'react';
import { monthlyStatement } from '@/lib/mock-data/cashflow';

const yen = (n: number) => `¥${Math.abs(n).toLocaleString()}`;
const neg = (n: number) => `▲¥${n.toLocaleString()}`;

type TabKey = 'income' | 'expense' | 'balance';

export function MonthlyStatementTable() {
  const [activeTab, setActiveTab] = useState<TabKey>('income');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'income',  label: '入金' },
    { key: 'expense', label: '出金' },
    { key: 'balance', label: '収支' },
  ];

  // Summary totals
  const confirmed = monthlyStatement
    .filter((r) => !r.isForecast && !r.isToday)
    .reduce((s, r) => s + r.actual, 0);
  const scheduled = monthlyStatement
    .filter((r) => r.isToday)
    .reduce((s, r) => s + r.actual, 0);
  const total = confirmed + scheduled;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-900">📋 月次収支明細</h3>

      {/* Tab strip */}
      <div className="mt-4 bg-slate-100 rounded-lg p-1 inline-flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-xs rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-white text-[#1e3a8a] font-semibold shadow-sm'
                : 'text-slate-500 font-medium hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 rounded-lg">
              {['月', '売上', '取引手数料(2%)', '決済手数料', '月額費用', '実入金額', '入金日'].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap first:rounded-l-lg last:rounded-r-lg"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlyStatement.map((row) => {
              const isToday = row.isToday;
              const isRisk = row.isRisk;
              const isForecast = row.isForecast;

              const rowClass = isToday
                ? 'bg-blue-50 border border-[#1e3a8a]/20 rounded-lg'
                : isRisk
                ? 'bg-red-50 border border-red-200 rounded-lg'
                : 'border-b border-slate-50 hover:bg-slate-50/50 transition';

              return (
                <tr key={row.month} className={rowClass}>
                  <td className={`px-3 py-3 font-medium whitespace-nowrap ${
                    isToday ? 'text-[#1e3a8a] font-bold' : isRisk ? 'text-red-700 font-semibold' : isForecast ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {row.month}
                      {isToday && (
                        <span className="bg-[#1e3a8a] text-white text-[9px] font-bold rounded-full px-2 py-0.5">
                          今月
                        </span>
                      )}
                      {isRisk && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-bold rounded-full px-2 py-0.5">
                          ⚠️ 赤字
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap ${isForecast && !isRisk ? 'text-slate-400' : 'text-slate-700'}`}>
                    {yen(row.sales)}
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap ${isForecast ? 'text-slate-300' : 'text-red-500'}`}>
                    {neg(row.fee2)}
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap ${isForecast ? 'text-slate-300' : 'text-red-500'}`}>
                    {neg(row.payment)}
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap ${isForecast ? 'text-slate-300' : 'text-red-500'}`}>
                    {neg(row.monthly)}
                  </td>
                  <td className={`px-3 py-3 font-bold whitespace-nowrap ${
                    isToday ? 'text-[#1e3a8a]' : isRisk ? 'text-red-700' : isForecast ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    {yen(row.actual)}
                  </td>
                  <td className={`px-3 py-3 whitespace-nowrap ${isForecast ? 'text-slate-300' : 'text-slate-500'}`}>
                    {row.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary strip */}
      <div className="mt-4 bg-sky-50 border border-sky-200 rounded-xl px-6 py-3 flex divide-x divide-sky-200">
        {[
          { label: '入金確定済み',    value: confirmed, size: 'text-base' },
          { label: '入金予定',        value: scheduled, size: 'text-base' },
          { label: '合計入金見込み',  value: total,     size: 'text-lg'  },
        ].map((item) => (
          <div key={item.label} className="flex-1 px-6 first:pl-0">
            <p className="text-[10px] text-slate-500 font-medium">{item.label}</p>
            <p className={`${item.size} font-bold text-slate-900 mt-0.5`}>¥{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
