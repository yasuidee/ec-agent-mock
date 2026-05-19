'use client';

interface InventoryKpiStripProps {
  criticalCount: number;
  urgentCount: number;
  warningCount: number;
  normalCount: number;
}

const kpiConfig = [
  { icon: '🚨', label: '今すぐ発注', sub: '危機的品目',   iconBg: 'bg-red-100',     valueColor: 'text-red-500',     key: 'critical' as const },
  { icon: '⚠️', label: '3日以内',   sub: '要確認品目',   iconBg: 'bg-amber-100',   valueColor: 'text-amber-500',   key: 'urgent'   as const },
  { icon: '📋', label: '今週中',    sub: '注意品目',     iconBg: 'bg-sky-100',     valueColor: 'text-sky-500',     key: 'warning'  as const },
  { icon: '✅', label: '余裕あり',  sub: '正常品目',     iconBg: 'bg-emerald-100', valueColor: 'text-emerald-500', key: 'normal'   as const },
];

export function InventoryKpiStrip({ criticalCount, urgentCount, warningCount, normalCount }: InventoryKpiStripProps) {
  const values: Record<typeof kpiConfig[number]['key'], number> = {
    critical: criticalCount,
    urgent:   urgentCount,
    warning:  warningCount,
    normal:   normalCount,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-4 divide-x divide-slate-100">
        {kpiConfig.map((k) => (
          <div key={k.key} className="px-6 py-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${k.iconBg}`}>
              {k.icon}
            </div>
            <div>
              <p className={`text-4xl font-bold leading-none ${k.valueColor}`}>{values[k.key]}</p>
              <p className={`text-xs font-semibold mt-1.5 ${k.valueColor}`}>{k.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
