'use client';

import { useRouter } from 'next/navigation';

export function BuildTopbar() {
  const router = useRouter();
  return (
    <div className="-mx-8 -mt-8 h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">構築AI</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          商品ページ生成・SEO最適化・価格分析をAIが代行します
        </p>
      </div>
      <button
        onClick={() => router.push('/dashboard')}
        className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
      >
        ← ダッシュボードに戻る
      </button>
    </div>
  );
}
