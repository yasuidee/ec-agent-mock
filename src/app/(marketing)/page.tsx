'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Megaphone, Package, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const agents = [
  {
    icon: Sparkles,
    label: '構築AI',
    desc: '商品ページ生成・SEO最適化を自動化',
  },
  {
    icon: Megaphone,
    label: '集客AI',
    desc: '広告予算配分・SNS投稿を提案',
  },
  {
    icon: Package,
    label: '在庫AI',
    desc: '需要予測・発注タイミングを管理',
  },
  {
    icon: BarChart3,
    label: '分析AI',
    desc: '売上・CVR・ROASを毎日レポート',
  },
];

const problems = [
  { emoji: '📦', title: '何から始めればいいかわからない' },
  { emoji: '📊', title: '売れない理由が分析できない' },
  { emoji: '📉', title: '在庫と広告のバランスが取れない' },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleRegister = () => {
    alert('登録しました！近日中にご連絡します。');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── 1. Navbar ──────────────────────────────────────────── */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-blue-900 text-xl">EC Agent</span>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/onboarding"
              className="text-sm bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              無料で試す
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Hero ────────────────────────────────────────────── */}
      <section className="py-24 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-slate-900 leading-tight">
          ECオーナーの隣に座る、<br />AI共同経営者
        </h1>
        <p className="text-xl text-slate-600 mt-6">
          毎朝3つの提案。承認1タップで実行。
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/onboarding"
            className="bg-blue-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            30日間無料で試す →
          </Link>
          <Link
            href="/dashboard"
            className="border px-8 py-3 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            デモを見る
          </Link>
        </div>
        <div className="mt-16 bg-slate-100 rounded-2xl border shadow-lg h-96 flex items-center justify-center">
          <span className="text-slate-400 text-sm">[ ダッシュボードプレビュー ]</span>
        </div>
      </section>

      {/* ── 3. Problems ────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <h2 className="text-3xl font-bold text-center text-slate-900">
          ECオーナーが抱える3つの壁
        </h2>
        <div className="grid grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto px-6">
          {problems.map((p) => (
            <div key={p.title} className="bg-white border rounded-xl p-8">
              <div className="text-4xl mb-4">{p.emoji}</div>
              <p className="font-semibold text-slate-800 leading-snug">{p.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Solution ────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <h2 className="text-3xl font-bold text-center text-slate-900">
          4つのAIエージェントが、全部やります
        </h2>
        <div className="grid grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto px-6">
          {agents.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon size={22} className="text-blue-900" />
                </div>
              </div>
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Pricing ─────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <h2 className="text-3xl font-bold text-center text-slate-900">
          シンプルな料金体系
        </h2>
        <div className="grid grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto px-6">
          {/* Lite */}
          <div className="border rounded-xl p-8 bg-white">
            <p className="font-semibold text-slate-700">Lite</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">¥9,800<span className="text-base font-normal text-slate-500">/月</span></p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              {['提案モード', '月20件まで', '1ストア対応'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>{f}
                </li>
              ))}
            </ul>
            <button className="border w-full mt-8 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              はじめる
            </button>
          </div>

          {/* Standard */}
          <div className="bg-blue-900 text-white rounded-xl p-8 relative">
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              おすすめ
            </span>
            <p className="font-semibold text-blue-200">Standard</p>
            <p className="text-3xl font-bold mt-2">¥29,800<span className="text-base font-normal text-blue-300">/月</span></p>
            <ul className="mt-6 space-y-2 text-sm text-blue-100">
              {['承認制実行', '無制限', '毎朝ブリーフ', '経営PL診断'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="block bg-white text-blue-900 w-full mt-8 py-3 rounded-lg text-sm font-semibold text-center hover:bg-blue-50 transition-colors"
            >
              無料で試す
            </Link>
          </div>

          {/* Pro */}
          <div className="border rounded-xl p-8 bg-white">
            <p className="font-semibold text-slate-700">Pro</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">¥59,800<span className="text-base font-normal text-slate-500">/月</span></p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              {['全機能', '複数ストア', 'Shopify実連携', '専任サポート'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>{f}
                </li>
              ))}
            </ul>
            <button className="border w-full mt-8 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              お問い合わせ
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. Waitlist ────────────────────────────────────────── */}
      <section className="py-24 bg-blue-900 text-white text-center">
        <h2 className="text-3xl font-bold">先行アクセスに登録する</h2>
        <p className="text-blue-200 mt-4">現在、パイロット導入企業を募集しています。</p>
        <div className="flex gap-3 justify-center mt-8 max-w-md mx-auto px-6">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="bg-white text-slate-900 border-0 flex-1"
          />
          <button
            onClick={handleRegister}
            className="bg-amber-400 text-amber-900 font-medium px-6 py-2 rounded-md hover:bg-amber-300 transition-colors shrink-0"
          >
            登録する
          </button>
        </div>
      </section>

      {/* ── 7. Footer ──────────────────────────────────────────── */}
      <footer className="py-8 border-t text-center text-sm text-slate-500">
        EC Agent © 2026 All rights reserved.
      </footer>
    </div>
  );
}
