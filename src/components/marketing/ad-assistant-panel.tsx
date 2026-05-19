'use client';

import { type ReactNode } from 'react';

type TabKey = 'planning' | 'improvement' | 'budget' | 'stop';

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'planning',    icon: '📣', label: '広告プランニング' },
  { key: 'improvement', icon: '🔧', label: '広告改善提案'    },
  { key: 'budget',      icon: '📅', label: '予算判断'        },
  { key: 'stop',        icon: '🛑', label: '停止判断'        },
];

interface AdAssistantPanelProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: ReactNode;
}

export function AdAssistantPanel({
  activeTab,
  onTabChange,
  children,
}: AdAssistantPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-base shrink-0">
          🎯
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">広告判断アシスタント</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            広告予算・継続・出稿商品・ページ改善をAIが一括判断します
          </p>
        </div>
      </div>

      {/* タブストリップ */}
      <div className="bg-slate-100 rounded-xl p-1 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`flex-1 rounded-lg py-2 flex items-center justify-center gap-1.5 text-xs font-medium transition ${
              activeTab === t.key
                ? 'bg-[#1e3a8a] text-white font-semibold shadow-sm'
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ（完全独立） */}
      {children}
    </div>
  );
}
