'use client';

type TabKey = 'review' | 'inquiry' | 'feedback';

const TABS = [
  { key: 'review'   as TabKey, icon: '⭐', label: 'レビュー返信'      },
  { key: 'inquiry'  as TabKey, icon: '💬', label: '問い合わせ返信'    },
  { key: 'feedback' as TabKey, icon: '📊', label: 'フィードバック分析' },
];

interface CustomerTabStripProps {
  activeTab:   TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function CustomerTabStrip({ activeTab, onTabChange }: CustomerTabStripProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex-1 rounded-lg py-2.5 flex items-center justify-center
                      gap-1.5 text-sm font-medium transition
            ${activeTab === t.key
              ? 'bg-[#1e3a8a] text-white font-semibold shadow-sm'
              : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
