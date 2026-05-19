'use client';

export type InventoryTabKey = 'shortage' | 'order' | 'stagnant';

interface InventoryTabStripProps {
  activeTab: string;
  onTabChange: (tab: InventoryTabKey) => void;
}

const tabs: { key: InventoryTabKey; icon: string; label: string }[] = [
  { key: 'shortage',  icon: '⚠️', label: '在庫切れ予報'    },
  { key: 'order',     icon: '🛒', label: '発注数おすすめ'  },
  { key: 'stagnant',  icon: '📦', label: '滞留在庫アラート' },
];

export function InventoryTabStrip({ activeTab, onTabChange }: InventoryTabStripProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex-1 rounded-lg py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium transition ${
            activeTab === t.key
              ? 'bg-[#1e3a8a] text-white font-semibold shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
