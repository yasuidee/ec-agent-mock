'use client';

import { useRouter } from 'next/navigation';

export function CustomerTopbar() {
  const router = useRouter();
  return (
    <div className="-mx-8 -mt-8 h-20 bg-white border-b border-slate-200 px-8
                    flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">顧客対応AI</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          レビュー・問い合わせへのAI返信アシストとフィードバック分析
        </p>
      </div>
      <button
        onClick={() => router.push('/dashboard')}
        className="border border-slate-200 rounded-lg px-4 py-2
                   text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
      >
        ← ダッシュボードに戻る
      </button>
    </div>
  );
}
