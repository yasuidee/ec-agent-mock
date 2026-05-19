'use client';

export type BuildTabKey = 'today' | 'generator' | 'price';

const TABS: { key: BuildTabKey; label: string; icon: string }[] = [
  { key: 'today',     label: '今日の提案',    icon: '💡' },
  { key: 'generator', label: '商品ページ生成', icon: '📄' },
  { key: 'price',     label: '価格提案・分析', icon: '📊' },
];

interface BuildTabStripProps {
  activeTab: BuildTabKey;
  onTabChange: (tab: BuildTabKey) => void;
}

export function BuildTabStrip({ activeTab, onTabChange }: BuildTabStripProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1">
      {TABS.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === key
              ? 'bg-[#1e3a8a] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
