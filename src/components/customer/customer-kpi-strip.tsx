'use client';

import { customerKpis } from '@/lib/mock-data/customer';

export function CustomerKpiStrip() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-4 divide-x divide-slate-100">
        {customerKpis.map((k) => (
          <div key={k.label} className="px-6 py-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center
                             justify-center text-xl shrink-0 ${k.iconBg}`}>
              {k.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">{k.label}</p>
              <p className={`text-3xl font-bold leading-none mt-1 ${k.valueColor}`}>
                {k.value}
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
