'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { topProducts } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CompetitorPriceChart } from '@/components/build/competitor-price-chart';
import { PriceStrategyCards } from '@/components/build/price-strategy-cards';
import { PriceRangeBar } from '@/components/build/price-range-bar';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PriceAnalysisResult {
  competitorPrices: {
    amazon: { min: number; avg: number; max: number; count: number };
    rakuten: { min: number; avg: number; max: number; count: number };
  };
  marketMedian: number;
  priceJudgment: 'too_low' | 'low' | 'optimal' | 'high' | 'too_high';
  recommendations: {
    costBased:     { price: number; marginRate: number; reason: string };
    marketOptimal: { price: number; marginRate: number; reason: string };
    premium:       { price: number; marginRate: number; reason: string };
  };
  freeShippingLine: number;
  competitorFreeShippingLine: number;
  competitorFreeShippingRate: number;
  advice: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PLATFORMS         = ['Shopify', 'Amazon', '楽天', 'Yahoo!ショッピング', 'BASE'];
const COMPETITOR_TARGETS = ['Amazon', '楽天', 'Yahoo!ショッピング', 'メルカリ', '海外EC（eBay/Etsy）'];
const CATEGORIES        = ['キッチン用品', 'インテリア雑貨', '伝統工芸', '食品', 'ファッション', '美容・健康', 'その他'];

const JUDGMENT_CONFIG: Record<string, { label: string; className: string }> = {
  too_low:  { label: '💸 安すぎます',       className: 'bg-red-100 text-red-700' },
  low:      { label: '✅ 適正価格（低め）',  className: 'bg-green-100 text-green-700' },
  optimal:  { label: '✅ 適正価格',          className: 'bg-green-100 text-green-700' },
  high:     { label: '⬆️ 高めです',          className: 'bg-amber-100 text-amber-700' },
  too_high: { label: '🚨 高すぎます',        className: 'bg-red-100 text-red-700' },
};

const STRATEGY_LABELS: Record<'costBased' | 'marketOptimal' | 'premium', string> = {
  costBased:     'コスト重視',
  marketOptimal: '市場最適',
  premium:       'プレミアム',
};

const MOCK_PRICE_ANALYSIS: PriceAnalysisResult = {
  competitorPrices: {
    amazon:  { min: 3800, avg: 7200,  max: 12800, count: 247 },
    rakuten: { min: 4200, avg: 8100,  max: 14800, count: 183 },
  },
  marketMedian: 7600,
  priceJudgment: 'optimal',
  recommendations: {
    costBased:     { price: 7200,  marginRate: 42, reason: '目標利益率40%を確保できる最低価格です。コスト構造を維持しながら市場参入しやすい価格帯。' },
    marketOptimal: { price: 8800,  marginRate: 52, reason: '競合中央値±10%以内で最も売れやすい価格帯です。転換率と利益率のバランスが最適。' },
    premium:       { price: 12800, marginRate: 68, reason: '品質・ストーリーを訴求して高単価で差別化する戦略です。上位20%の価格帯に位置します。' },
  },
  freeShippingLine: 14000,
  competitorFreeShippingLine: 10000,
  competitorFreeShippingRate: 78,
  advice: '現在価格¥8,800は競合中央値¥7,600より約16%高めですが、国産ヒノキ・職人手作りという差別化要素があるため適正範囲内です。市場最適価格¥8,800を維持しつつ、商品説明での品質訴求を強化することで転換率向上が期待できます。プレミアム戦略では¥12,800まで引き上げ可能ですが、競合との明確な差別化コンテンツ（製造過程動画・職人インタビュー等）が必要です。',
};

// ─── CopyBtn (local) ─────────────────────────────────────────────────────────

function CopyBtn({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium text-sm w-full py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? doneLabel : label}
    </button>
  );
}

// ─── PricingSection (internal — same logic as original PricingTab) ────────────

function PricingSection() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    selectedProductId: '',
    productName: '',
    currentPrice: '',
    cost: '',
    category: '',
    features: '',
    targetMargin: '40',
    shipping: '600',
    platforms: [] as string[],
    competitorTargets: ['Amazon', '楽天'],
  });
  const [analysisResult, setAnalysisResult] = useState<PriceAnalysisResult | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'costBased' | 'marketOptimal' | 'premium' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [adjustedPrice, setAdjustedPrice] = useState('');
  const [shippingCopied, setShippingCopied] = useState(false);

  const setField = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleProductSelect = (productId: string) => {
    if (productId === 'new' || productId === '') {
      setForm((f) => ({ ...f, selectedProductId: productId, productName: '', currentPrice: '', cost: '' }));
      return;
    }
    const product = topProducts.find((p) => p.id === productId);
    if (product) {
      setForm((f) => ({
        ...f,
        selectedProductId: productId,
        productName: product.name,
        currentPrice: String(product.price),
        cost: String(product.cost),
      }));
    }
  };

  const togglePlatform = (p: string) =>
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));

  const toggleCompetitor = (c: string) =>
    setForm((f) => ({
      ...f,
      competitorTargets: f.competitorTargets.includes(c)
        ? f.competitorTargets.filter((x) => x !== c)
        : [...f.competitorTargets, c],
    }));

  const handleAnalyze = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setStep(2);

    const interval = setInterval(() => {
      setLoadingProgress((p) => { if (p >= 90) { clearInterval(interval); return 90; } return p + 10; });
    }, 300);

    try {
      const res = await fetch('/api/analyze-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName:  form.productName,
          currentPrice: Number(form.currentPrice),
          cost:         Number(form.cost),
          category:     form.category,
          features:     form.features,
          targetMargin: Number(form.targetMargin),
          shipping:     Number(form.shipping),
          platforms:    form.platforms,
        }),
      });
      const data: PriceAnalysisResult = await res.json();
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => { setAnalysisResult(data); setIsLoading(false); }, 400);
    } catch {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => { setAnalysisResult(MOCK_PRICE_ANALYSIS); setIsLoading(false); }, 400);
    }
  };

  const handleSelectPrice = (strategy: 'costBased' | 'marketOptimal' | 'premium') => {
    if (!analysisResult) return;
    const price = analysisResult.recommendations[strategy].price;
    setSelectedPrice(price);
    setSelectedStrategy(strategy);
    setAdjustedPrice(String(price));
    setStep(3);
  };

  const handleConfirmPrice = () => {
    if (!selectedPrice && analysisResult) {
      const price = analysisResult.recommendations.marketOptimal.price;
      setSelectedPrice(price);
      setSelectedStrategy('marketOptimal');
      setAdjustedPrice(String(price));
    }
    setStep(3);
  };

  const cost             = Number(form.cost) || 0;
  const currentPriceNum  = Number(form.currentPrice) || 0;
  const adjustedPriceNum = Number(adjustedPrice) || 0;
  const newMarginRate    = adjustedPriceNum > 0 ? ((adjustedPriceNum - cost) / adjustedPriceNum) * 100 : 0;
  const originalMarginRate = currentPriceNum > 0 ? ((currentPriceNum - cost) / currentPriceNum) * 100 : 0;
  const improvement      = newMarginRate - originalMarginRate;
  const freeShippingLine = analysisResult?.freeShippingLine ?? 0;

  // ── Step 1: form ──
  if (step === 1) return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
      <h2 className="font-semibold text-slate-900">📊 価格分析したい商品を入力してください</h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-600">既存商品から選ぶ</label>
        <select
          value={form.selectedProductId}
          onChange={(e) => handleProductSelect(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
        >
          <option value="">-- 商品を選択 --</option>
          {topProducts.map((p) => (
            <option key={p.id} value={p.id}>{p.name}（¥{p.price.toLocaleString()}）</option>
          ))}
          <option value="new">新規商品を入力する</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">商品名 <span className="text-red-500">*</span></label>
            <Input placeholder="例: ヒノキ無垢材カッティングボード" value={form.productName} onChange={setField('productName')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">現在の販売価格（円）</label>
            <Input type="number" placeholder="8800" value={form.currentPrice} onChange={setField('currentPrice')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">商品原価（円）</label>
            <Input type="number" placeholder="2800" value={form.cost} onChange={setField('cost')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">カテゴリ</label>
            <select
              value={form.category}
              onChange={setField('category')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
            >
              <option value="">-- 選択 --</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">販売プラットフォーム</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.platforms.includes(p)
                      ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                      : 'text-slate-600 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">商品の特徴・強み</label>
            <textarea
              rows={3}
              placeholder="例: 国産ヒノキ100%、職人手作り、抗菌作用あり"
              value={form.features}
              onChange={setField('features')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">目標利益率</label>
              <div className="relative">
                <Input type="number" placeholder="40" value={form.targetMargin} onChange={setField('targetMargin')} className="pr-7" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">送料（円）</label>
              <Input type="number" placeholder="600" value={form.shipping} onChange={setField('shipping')} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-700 mb-3">競合リサーチ対象</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {COMPETITOR_TARGETS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.competitorTargets.includes(c)}
                onChange={() => toggleCompetitor(c)}
                className="rounded"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!form.productName || isLoading}
        className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium w-full py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        AI価格分析を実行する
      </button>
    </div>
  );

  // ── Step 2: loading ──
  if (step === 2 && isLoading) return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <Loader2 size={40} className="text-[#1e3a8a] animate-spin" />
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>競合価格を調査・分析中です...</span>
            <span>{loadingProgress}%</span>
          </div>
          <Progress value={loadingProgress} className="h-2" />
        </div>
        <p className="text-sm text-slate-400">Amazon・楽天などの競合データをAIが分析しています</p>
      </div>
    </div>
  );

  // ── Step 2: results ──
  if (step === 2 && analysisResult) {
    const min      = Math.min(analysisResult.competitorPrices.amazon.min, analysisResult.competitorPrices.rakuten.min);
    const max      = Math.max(analysisResult.competitorPrices.amazon.max, analysisResult.competitorPrices.rakuten.max);
    const judgment = JUDGMENT_CONFIG[analysisResult.priceJudgment] ?? JUDGMENT_CONFIG.optimal;

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Competitor range */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 mb-3">🔍 競合価格レンジ</h3>
          <span className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full ${judgment.className}`}>
            {judgment.label}
          </span>
          <PriceRangeBar min={min} max={max} median={analysisResult.marketMedian} current={currentPriceNum} />
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">プラットフォーム</TableHead>
                <TableHead className="text-xs">最安値</TableHead>
                <TableHead className="text-xs">平均価格</TableHead>
                <TableHead className="text-xs">最高値</TableHead>
                <TableHead className="text-xs">商品数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-sm font-medium">Amazon</TableCell>
                <TableCell className="text-sm">¥{analysisResult.competitorPrices.amazon.min.toLocaleString()}</TableCell>
                <TableCell className="text-sm">¥{analysisResult.competitorPrices.amazon.avg.toLocaleString()}</TableCell>
                <TableCell className="text-sm">¥{analysisResult.competitorPrices.amazon.max.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{analysisResult.competitorPrices.amazon.count}件</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm font-medium">楽天</TableCell>
                <TableCell className="text-sm">¥{analysisResult.competitorPrices.rakuten.min.toLocaleString()}</TableCell>
                <TableCell className="text-sm">¥{analysisResult.competitorPrices.rakuten.avg.toLocaleString()}</TableCell>
                <TableCell className="text-sm">¥{analysisResult.competitorPrices.rakuten.max.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{analysisResult.competitorPrices.rakuten.count}件</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* AI price recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 mb-4">🤖 AI推奨価格</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Cost-based */}
            <div className="border rounded-xl p-5">
              <span className="inline-block text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full mb-3">コスト重視</span>
              <p className="text-3xl font-bold text-slate-900">¥{analysisResult.recommendations.costBased.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">利益率 {analysisResult.recommendations.costBased.marginRate}%</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{analysisResult.recommendations.costBased.reason}</p>
              <button
                onClick={() => handleSelectPrice('costBased')}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm w-full py-2 mt-3 rounded-xl transition-colors"
              >
                この価格を採用する
              </button>
            </div>
            {/* Market optimal */}
            <div className="border-2 border-[#1e3a8a] rounded-xl p-5 relative">
              <span className="bg-[#1e3a8a] text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">おすすめ</span>
              <span className="inline-block text-xs font-medium bg-blue-100 text-[#1e3a8a] px-2 py-0.5 rounded-full mb-3 mt-1">市場最適</span>
              <p className="text-3xl font-bold text-[#1e3a8a]">¥{analysisResult.recommendations.marketOptimal.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">利益率 {analysisResult.recommendations.marketOptimal.marginRate}%</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{analysisResult.recommendations.marketOptimal.reason}</p>
              <button
                onClick={() => handleSelectPrice('marketOptimal')}
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium text-sm w-full py-2 mt-3 rounded-xl transition-colors"
              >
                この価格を採用する
              </button>
            </div>
            {/* Premium */}
            <div className="border rounded-xl p-5">
              <span className="inline-block text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mb-3">プレミアム</span>
              <p className="text-3xl font-bold text-slate-900">¥{analysisResult.recommendations.premium.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">利益率 {analysisResult.recommendations.premium.marginRate}%</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{analysisResult.recommendations.premium.reason}</p>
              <button
                onClick={() => handleSelectPrice('premium')}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm w-full py-2 mt-3 rounded-xl transition-colors"
              >
                この価格を採用する
              </button>
            </div>
          </div>
        </div>

        {/* Free shipping */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 mb-4">🚚 送料無料ライン提案</h3>
          <div className="flex items-center gap-8 mb-4 text-sm">
            <span className="text-slate-600">現在の送料: <strong className="text-slate-900">¥{Number(form.shipping).toLocaleString()}</strong></span>
            <span className="text-slate-600">推奨送料無料ライン: <strong className="text-[#1e3a8a] text-base">¥{analysisResult.freeShippingLine.toLocaleString()}</strong></span>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800 leading-relaxed">
            ✅ <strong>¥{analysisResult.freeShippingLine.toLocaleString()}</strong>以上で送料無料にすることで、
            客単価アップと購買率向上が期待できます。
            現在の競合の<strong>{analysisResult.competitorFreeShippingRate}%</strong>が
            <strong>¥{analysisResult.competitorFreeShippingLine.toLocaleString()}</strong>前後で送料無料を設定しています。
          </div>
        </div>

        {/* AI advice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 mb-3">💡 価格戦略アドバイス</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{analysisResult.advice}</p>
        </div>

        <button
          onClick={handleConfirmPrice}
          className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium w-full py-3 rounded-2xl transition-colors"
        >
          価格を確定してStep 3へ →
        </button>
      </div>
    );
  }

  // ── Step 3 ──
  if (step === 3) {
    const strategyName = selectedStrategy ? STRATEGY_LABELS[selectedStrategy] : '市場最適';

    const copyShipping = () => {
      navigator.clipboard.writeText(`¥${freeShippingLine.toLocaleString()}`);
      setShippingCopied(true);
      setTimeout(() => setShippingCopied(false), 2000);
    };

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
        <h3 className="font-semibold text-slate-900">✅ 価格設定を確認してください</h3>

        {/* Summary */}
        <div className="bg-slate-50 rounded-xl p-6">
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <p className="text-xs text-slate-500 mb-1">現在の価格</p>
              <p className="text-xl line-through text-slate-400">¥{currentPriceNum.toLocaleString()}</p>
            </div>
            <div className="text-slate-300 text-2xl font-light">→</div>
            <div>
              <p className="text-xs text-slate-500 mb-1">新しい価格</p>
              <p className="text-3xl font-bold text-[#1e3a8a]">¥{adjustedPriceNum.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">利益率</p>
              <p className="text-lg font-semibold text-slate-800">
                {newMarginRate.toFixed(1)}%
                {improvement !== 0 && (
                  <span className={`text-sm ml-2 ${improvement > 0 ? 'text-teal-600' : 'text-red-600'}`}>
                    ({improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%改善)
                  </span>
                )}
              </p>
            </div>
            <span className="text-xs font-medium bg-blue-100 text-[#1e3a8a] px-3 py-1 rounded-full">{strategyName}</span>
          </div>
        </div>

        {/* Adjust */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">価格を微調整する</label>
          <div className="flex items-center gap-4">
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">¥</span>
              <Input
                type="number"
                value={adjustedPrice}
                onChange={(e) => setAdjustedPrice(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-sm text-slate-500">
              利益率:{' '}
              <strong className={newMarginRate < 0 ? 'text-red-600' : 'text-slate-800'}>
                {newMarginRate.toFixed(1)}%
              </strong>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button disabled className="border w-full py-3 rounded-xl text-sm text-slate-400 cursor-not-allowed">
            Shopifyに反映する（準備中）
          </button>
          <CopyBtn
            text={`¥${adjustedPriceNum.toLocaleString()}`}
            label="価格をコピーする"
            doneLabel="コピーしました ✓"
          />
        </div>

        <button
          onClick={copyShipping}
          className="border w-full py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          {shippingCopied && <Check size={14} className="text-teal-600" />}
          {shippingCopied
            ? '設定をコピーしました ✓'
            : `送料無料ラインを¥${freeShippingLine.toLocaleString()}に設定する`}
        </button>

        <button
          onClick={() => {
            setStep(1);
            setAnalysisResult(null);
            setSelectedPrice(null);
            setSelectedStrategy(null);
            setAdjustedPrice('');
            setIsLoading(false);
          }}
          className="text-sm text-[#1e3a8a] hover:underline"
        >
          ← 最初からやり直す
        </button>
      </div>
    );
  }

  return null;
}

// ─── PriceAnalysisTab ─────────────────────────────────────────────────────────

export function PriceAnalysisTab() {
  return (
    <div className="space-y-5">
      {/* Static market overview */}
      <CompetitorPriceChart />
      <PriceStrategyCards />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium px-2">個別商品の詳細分析</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Dynamic pricing analysis */}
      <PricingSection />
    </div>
  );
}
