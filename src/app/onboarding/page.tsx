'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Store, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function OnboardingPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => router.push('/dashboard'), 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900 mb-4 shadow-lg">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">EC Agent</h1>
          <p className="text-slate-500 mt-1 text-sm">AIが売上を最大化するあなたの専属マネージャー</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">EC Agentへようこそ</h2>
            <p className="text-sm text-slate-500 mt-1">
              ストア情報を入力して、AIによる経営最適化を始めましょう。
            </p>
          </div>

          {/* Store name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Store size={12} />
              ストア名
            </label>
            <Input
              placeholder="例: やすの工芸品ストア"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          {/* Shopify integration */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Shopify連携</label>
            {shopifyConnected ? (
              <div className="flex items-center gap-2 border border-green-200 bg-green-50 rounded-lg px-4 py-3">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">Shopify接続済み</span>
                <span className="text-xs text-green-600 ml-auto">モック</span>
              </div>
            ) : (
              <button
                onClick={() => setShopifyConnected(true)}
                className="w-full flex items-center justify-center gap-2.5 border-2 border-[#96bf48] rounded-lg px-4 py-3 hover:bg-[#96bf48]/5 transition-colors"
              >
                <svg viewBox="0 0 109 124" width="18" height="18" fill="none">
                  <path d="M74.7 14.8c-.1-.6-.6-1-1.2-1s-9.8-.2-9.8-.2-7.8-7.5-8.6-8.3c-.8-.8-2.4-.5-3 .1l-4.3 13.4C45 19.3 37.8 21 37.8 21L26 112.7l59.5 11.2L109 118zM66.1 13.9l-6.4 2-2.8-8.5zm-14 4.4-6.4 2L43.9 12z" fill="#95bf46"/>
                  <path d="M73.5 13.8c-.6 0-9.8-.2-9.8-.2s-7.8-7.5-8.6-8.3c-.3-.3-.7-.4-1.1-.4l-8.4 120.8 43.9-9.5z" fill="#5e8e3e"/>
                  <path d="M46.5 45.7l-5.4 15.9s-4.7-2.5-10.5-2.5c-8.4 0-8.8 5.3-8.8 6.6 0 7.2 18.8 10 18.8 26.9 0 13.3-8.4 21.9-19.8 21.9-13.6 0-20.6-8.5-20.6-8.5l3.6-12s7.2 6.2 13.2 6.2c4 0 5.6-3.1 5.6-5.4 0-9.4-15.4-9.8-15.4-25.4 0-13.1 9.4-25.8 28.3-25.8 7.3 0 10.8 2.1 10.8 2.1z" fill="#fff"/>
                </svg>
                <span className="text-sm font-medium text-slate-700">Shopifyと連携する</span>
              </button>
            )}
            <p className="text-xs text-slate-400">※ 現在はデモモードです。実際の連携は行われません。</p>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={starting}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 text-white font-medium py-3 rounded-xl hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm"
          >
            {starting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                読み込み中...
              </>
            ) : (
              <>
                はじめる
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by Claude AI · EC Agent v1.0 Demo
        </p>
      </div>
    </div>
  );
}
