'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { briefActions, type BriefAction } from '@/lib/mock-data';

const categoryMeta: Record<BriefAction['category'], { label: string; className: string }> = {
  marketing: { label: 'マーケ',  className: 'bg-blue-100 text-blue-800' },
  inventory:  { label: '在庫',   className: 'bg-purple-100 text-purple-800' },
  build:      { label: 'ビルド', className: 'bg-green-100 text-green-800' },
  analytics:  { label: '分析',   className: 'bg-orange-100 text-orange-800' },
};

const urgencyDot: Record<BriefAction['urgency'], string> = {
  high:   'bg-red-500',
  medium: 'bg-yellow-400',
  low:    'bg-slate-400',
};

export function AgentBriefCard({ category }: { category: BriefAction['category'] }) {
  const { toast } = useToast();
  const items = briefActions.filter((a) => a.category === category);

  const [states, setStates] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>(() =>
    Object.fromEntries(
      items.map((a) => [a.id, a.status as 'pending' | 'approved' | 'rejected'])
    )
  );

  if (items.length === 0) return null;

  const pendingCount = Object.values(states).filter((v) => v === 'pending').length;

  const approve = (id: string, title: string) => {
    setStates((s) => ({ ...s, [id]: 'approved' }));
    toast({ title: 'アクションを実行しました', description: title });
  };
  const reject = (id: string) => setStates((s) => ({ ...s, [id]: 'rejected' }));

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-900">🟡 今日の提案</h2>
        {pendingCount > 0 ? (
          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
            {pendingCount}つのアクション待ち
          </span>
        ) : (
          <span className="text-xs font-medium bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full">
            ✓ すべて完了
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {items.map((action) => {
          const state = states[action.id];
          const meta = categoryMeta[action.category];
          return (
            <div
              key={action.id}
              className={`border rounded-lg p-4 transition-all ${
                state === 'approved'
                  ? 'bg-teal-50 border-teal-200'
                  : state === 'rejected'
                  ? 'opacity-50 bg-white'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.className}`}>
                      {meta.label}
                    </span>
                    {state === 'pending' && (
                      <span className={`w-2 h-2 rounded-full ${urgencyDot[action.urgency]}`} />
                    )}
                    {state === 'approved' && (
                      <span className="text-xs font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} /> 実行中
                      </span>
                    )}
                    {state === 'rejected' && (
                      <span className="text-xs text-slate-400">却下済み</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900 leading-snug">{action.title}</p>
                  <p className="text-xs font-semibold text-amber-600 mt-1">{action.expectedImpact}</p>
                  <p className="text-xs text-slate-500 bg-slate-50 rounded p-2 mt-1.5 leading-relaxed">
                    {action.reasoning}
                  </p>
                </div>

                {state === 'pending' && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => approve(action.id, action.title)}
                      className="bg-blue-900 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap"
                    >
                      承認して実行
                    </button>
                    <button
                      onClick={() => reject(action.id)}
                      className="border text-slate-500 text-xs px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      却下
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
