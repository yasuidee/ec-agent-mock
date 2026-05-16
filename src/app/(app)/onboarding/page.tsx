'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

// ─── Static data ─────────────────────────────────────────────────────────────

const steps = [
  { num: 1, label: 'ストア情報を入力' },
  { num: 2, label: 'Shopifyと連携' },
  { num: 3, label: 'AIが分析開始' },
];

const revenueOptions = [
  { value: '', label: '月商規模を選択' },
  { value: 'lt100',   label: '〜100万円' },
  { value: '100-500', label: '100〜500万円' },
  { value: '500-1000',label: '500万〜1000万円' },
  { value: 'gt1000',  label: '1000万円〜' },
];

const categoryOptions = [
  { value: '', label: '主力商品カテゴリを選択' },
  { value: 'craft',   label: 'クラフト・伝統工芸' },
  { value: 'food',    label: '食品' },
  { value: 'fashion', label: 'ファッション' },
  { value: 'other',   label: 'その他' },
];

const selectClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingAppPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [revenue, setRevenue] = useState('');
  const [category, setCategory] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => router.push('/dashboard'), 1200);
  };

  return (
    <div className="max-w-md mx-auto mt-20 pb-16">
      {/* ── 1. Logo + heading ─────────────────────────────── */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-900">EC Agent</h1>
        <p className="text-lg text-slate-600 mt-2">ECオーナーの隣に座る、AI共同経営者</p>
      </div>

      {/* ── 2. Steps ──────────────────────────────────────── */}
      <div className="flex items-start justify-center gap-4 mt-8">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2">
            {/* Connector line */}
            {i > 0 && <div className="w-8 h-px bg-slate-200 -mt-4 shrink-0" />}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <span className="text-xs text-slate-500 w-20 leading-tight">{step.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Form ───────────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-8 mt-8 space-y-4">
        {/* Store name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">ストア名</label>
          <Input
            placeholder="例: やす商店"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>

        {/* Revenue scale */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">月商規模</label>
          <select
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className={selectClass}
          >
            {revenueOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">主力商品カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Shopify button */}
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-2 bg-blue-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {connecting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              連携中...
            </>
          ) : (
            'Shopifyと連携する'
          )}
        </button>
      </div>

      {/* ── 4. Skip link ──────────────────────────────────── */}
      <div className="text-center mt-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          今はスキップしてデモを見る →
        </button>
      </div>
    </div>
  );
}
