'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Sparkles, Copy, Check, Loader2, Lightbulb, FileText, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { AgentBriefCard } from '@/components/AgentBriefCard';
import { PageSkeleton } from '@/components/PageSkeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

// ─── Types ───────────────────────────────────────────────────────────────────

type Urgency = 'high' | 'medium' | 'low';

interface Suggestion {
  id: string;
  title: string;
  urgency: Urgency;
}

interface HistoryRow {
  id: string;
  datetime: string;
  action: string;
  status: '完了' | '処理中';
  effect: string;
}

interface CreateForm {
  productName: string;
  price: string;
  category: string;
  targetCustomer: string;
  platform: string;
  features: string;
  differentiation: string;
  shipping: string;
  returnPolicy: string;
  language: string;
  tone: string;
  includeFaq: boolean;
  includeSeo: boolean;
}

interface GeneratedContent {
  productName: string;
  catchCopy: string;
  description: string;
  photoGuide: string;
  pricingComment: string;
  faq: string;
  shipping: string;
  seoKeywords: string[];
}

interface ImproveResult {
  currentScore: number;
  improvedScore: number;
  improvements: { area: string; issue: string; suggestion: string }[];
  fullPage: string;
}

interface PriceAnalysisResult {
  competitorPrices: {
    amazon: { min: number; avg: number; max: number; count: number };
    rakuten: { min: number; avg: number; max: number; count: number };
  };
  marketMedian: number;
  priceJudgment: 'too_low' | 'low' | 'optimal' | 'high' | 'too_high';
  recommendations: {
    costBased: { price: number; marginRate: number; reason: string };
    marketOptimal: { price: number; marginRate: number; reason: string };
    premium: { price: number; marginRate: number; reason: string };
  };
  freeShippingLine: number;
  competitorFreeShippingLine: number;
  competitorFreeShippingRate: number;
  advice: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const suggestions: Suggestion[] = [
  { id: 's1', title: '南部鉄器急須の商品ページを英語化',             urgency: 'high' },
  { id: 's2', title: 'ヒノキカッティングボードにSEOキーワードを追加', urgency: 'medium' },
  { id: 's3', title: '有田焼マグカップの画像にalt属性を追加',         urgency: 'low' },
];

const historyRows: HistoryRow[] = [
  { id: 'h1', datetime: '2026-05-15 09:12', action: '南部鉄器急須 英語ページ生成',         status: '完了',  effect: 'CVR +12%' },
  { id: 'h2', datetime: '2026-05-14 14:33', action: 'ヒノキカッティングボード SEO最適化', status: '完了',  effect: '検索流入 +8%' },
  { id: 'h3', datetime: '2026-05-14 11:05', action: '和紙ノート 商品説明リライト',         status: '完了',  effect: '滞在時間 +25%' },
  { id: 'h4', datetime: '2026-05-13 16:48', action: '漆塗り箸セット 中国語ページ生成',   status: '完了',  effect: '海外売上 +¥32,000' },
  { id: 'h5', datetime: '2026-05-13 10:20', action: '有田焼マグカップ altテキスト追加',  status: '処理中', effect: '計測中' },
];

const urgencyConfig: Record<Urgency, { label: string; className: string }> = {
  high:   { label: '高', className: 'bg-red-100 text-red-700' },
  medium: { label: '中', className: 'bg-amber-100 text-amber-700' },
  low:    { label: '低', className: 'bg-slate-100 text-slate-600' },
};

const CONTENT_LABELS: Record<keyof Omit<GeneratedContent, 'seoKeywords'>, string> = {
  productName:    '商品名（最適化）',
  catchCopy:      'キャッチコピー',
  description:    '商品説明文',
  photoGuide:     '推奨撮影ガイド',
  pricingComment: '価格コメント',
  faq:            'FAQ',
  shipping:       '配送説明',
};

const IMPROVE_PRIORITIES = ['タイトル', '商品説明', '画像alt', 'FAQ', 'SEO', '価格表示'];

const PLATFORMS = ['Shopify', 'Amazon', '楽天', 'Yahoo!ショッピング', 'BASE'];
const COMPETITOR_TARGETS = ['Amazon', '楽天', 'Yahoo!ショッピング', 'メルカリ', '海外EC（eBay/Etsy）'];
const CATEGORIES = ['キッチン用品', 'インテリア雑貨', '伝統工芸', '食品', 'ファッション', '美容・健康', 'その他'];

const JUDGMENT_CONFIG: Record<string, { label: string; className: string }> = {
  too_low: { label: '💸 安すぎます',      className: 'bg-red-100 text-red-700' },
  low:     { label: '✅ 適正価格（低め）', className: 'bg-green-100 text-green-700' },
  optimal: { label: '✅ 適正価格',         className: 'bg-green-100 text-green-700' },
  high:    { label: '⬆️ 高めです',         className: 'bg-amber-100 text-amber-700' },
  too_high:{ label: '🚨 高すぎます',       className: 'bg-red-100 text-red-700' },
};

const STRATEGY_LABELS: Record<'costBased' | 'marketOptimal' | 'premium', string> = {
  costBased:     'コスト重視',
  marketOptimal: '市場最適',
  premium:       'プレミアム',
};

const MOCK_PRICE_ANALYSIS: PriceAnalysisResult = {
  competitorPrices: {
    amazon: { min: 3800, avg: 7200, max: 12800, count: 247 },
    rakuten: { min: 4200, avg: 8100, max: 14800, count: 183 },
  },
  marketMedian: 7600,
  priceJudgment: 'optimal',
  recommendations: {
    costBased: { price: 7200, marginRate: 42, reason: '目標利益率40%を確保できる最低価格です。コスト構造を維持しながら市場参入しやすい価格帯。' },
    marketOptimal: { price: 8800, marginRate: 52, reason: '競合中央値±10%以内で最も売れやすい価格帯です。転換率と利益率のバランスが最適。' },
    premium: { price: 12800, marginRate: 68, reason: '品質・ストーリーを訴求して高単価で差別化する戦略です。上位20%の価格帯に位置します。' },
  },
  freeShippingLine: 14000,
  competitorFreeShippingLine: 10000,
  competitorFreeShippingRate: 78,
  advice: '現在価格¥8,800は競合中央値¥7,600より約16%高めですが、国産ヒノキ・職人手作りという差別化要素があるため適正範囲内です。市場最適価格¥8,800を維持しつつ、商品説明での品質訴求を強化することで転換率向上が期待できます。プレミアム戦略では¥12,800まで引き上げ可能ですが、競合との明確な差別化コンテンツ（製造過程動画・職人インタビュー等）が必要です。',
};

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors shrink-0">
      {copied ? <Check size={12} className="text-teal-600" /> : <Copy size={12} />}
      {copied ? 'コピーしました✓' : 'コピー'}
    </button>
  );
}

// ─── PriceRangeBar ────────────────────────────────────────────────────────────

function PriceRangeBar({ min, max, median, current }: { min: number; max: number; median: number; current: number }) {
  const range = max - min || 1;
  const medianPct  = Math.max(5, Math.min(95, ((median  - min) / range) * 100));
  const currentPct = Math.max(2, Math.min(98, ((current - min) / range) * 100));

  return (
    <div className="pt-8 pb-4">
      <div className="relative">
        <div
          className="absolute -top-7 transform -translate-x-1/2 text-xs font-bold text-blue-900 whitespace-nowrap"
          style={{ left: `${currentPct}%` }}
        >
          ▼ 自社 ¥{current.toLocaleString()}
        </div>
        <div className="h-2 rounded-full bg-slate-200 relative">
          <div
            className="absolute top-0 h-full bg-blue-900 rounded-full"
            style={{ width: `${currentPct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-500 rounded"
            style={{ left: `${medianPct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-900 rounded-full border-2 border-white shadow-md"
            style={{ left: `${currentPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>¥{min.toLocaleString()}</span>
          <span className="text-slate-700 font-medium">中央値 ¥{median.toLocaleString()}</span>
          <span>¥{max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CreateTab ───────────────────────────────────────────────────────────────

function CreateTab() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [combinedText, setCombinedText] = useState('');
  const [form, setForm] = useState<CreateForm>({
    productName: '', price: '', category: '', targetCustomer: '', platform: '',
    features: '', differentiation: '', shipping: '', returnPolicy: '',
    language: '日本語', tone: 'プロフェッショナル', includeFaq: true, includeSeo: true,
  });

  const set = (k: keyof CreateForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCheck = (k: 'includeFaq' | 'includeSeo') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.checked }));

  const handleGenerate = async () => {
    setStep(2);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 90) { clearInterval(interval); return 90; } return p + 10; });
    }, 300);

    try {
      const res = await fetch('/api/generate-product-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'create', ...form }),
      });
      const data: GeneratedContent = await res.json();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setGenerated(data);
        const combined = [
          `【商品名】\n${data.productName}`,
          `【キャッチコピー】\n${data.catchCopy}`,
          `【商品説明】\n${data.description}`,
          `【撮影ガイド】\n${data.photoGuide}`,
          `【価格コメント】\n${data.pricingComment}`,
          `【FAQ】\n${data.faq}`,
          `【配送】\n${data.shipping}`,
          `【SEOキーワード】\n${data.seoKeywords.join(' / ')}`,
        ].join('\n\n');
        setCombinedText(combined);
        setStep(3);
      }, 500);
    } catch {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        const fallback: GeneratedContent = {
          productName: `【公式】${form.productName} | 職人手作り・日本製`,
          catchCopy: '職人の技が宿る、日常の逸品。',
          description: `${form.productName}は、熟練の職人が一つひとつ丁寧に仕上げた日本製の逸品です。${form.features || '素材の質感と独自の製法'}にこだわり、日常使いから贈り物まで幅広くお使いいただけます。`,
          photoGuide: '1. 正面から全体像（白背景）\n2. 素材クローズアップ\n3. 使用シーン\n4. サイズ感カット\n5. ギフトボックス',
          pricingComment: `¥${form.price}は同カテゴリとして適正範囲です。`,
          faq: 'Q: お手入れ方法は？\nA: 使用後は水洗いし、自然乾燥させてください。',
          shipping: form.shipping || '通常2〜3営業日以内に発送。',
          seoKeywords: [`${form.productName} 日本製`, `${form.productName} 職人`, `${form.productName} ギフト`],
        };
        setGenerated(fallback);
        const combined = [
          `【商品名】\n${fallback.productName}`,
          `【キャッチコピー】\n${fallback.catchCopy}`,
          `【商品説明】\n${fallback.description}`,
          `【撮影ガイド】\n${fallback.photoGuide}`,
          `【価格コメント】\n${fallback.pricingComment}`,
          `【FAQ】\n${fallback.faq}`,
          `【配送】\n${fallback.shipping}`,
          `【SEOキーワード】\n${fallback.seoKeywords.join(' / ')}`,
        ].join('\n\n');
        setCombinedText(combined);
        setStep(3);
      }, 500);
    }
  };

  if (step === 1) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">商品名 <span className="text-red-500">*</span></label>
          <Input placeholder="例: 南部鉄器急須" value={form.productName} onChange={set('productName')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">価格（円）</label>
          <Input type="number" placeholder="例: 12800" value={form.price} onChange={set('price')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">カテゴリ</label>
          <Input placeholder="例: キッチン用品" value={form.category} onChange={set('category')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">ターゲット顧客</label>
          <Input placeholder="例: 30〜50代 料理好き" value={form.targetCustomer} onChange={set('targetCustomer')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">販売プラットフォーム</label>
          <Input placeholder="例: 自社EC / 楽天 / Amazon" value={form.platform} onChange={set('platform')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">配送情報</label>
          <Input placeholder="例: 送料無料・2〜3営業日" value={form.shipping} onChange={set('shipping')} />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-medium text-slate-600">商品の特徴・スペック</label>
          <textarea rows={3} placeholder="例: 岩手の伝統工芸。200年の歴史を持つ職人が手作業で仕上げた急須。容量200ml。"
            value={form.features} onChange={set('features')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-medium text-slate-600">差別化ポイント</label>
          <textarea rows={2} placeholder="例: 鉄分補給・保温性・100年使える耐久性"
            value={form.differentiation} onChange={set('differentiation')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-medium text-slate-600">返品・保証ポリシー</label>
          <Input placeholder="例: 到着後7日以内の初期不良のみ対応" value={form.returnPolicy} onChange={set('returnPolicy')} />
        </div>
      </div>
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
        <p className="text-xs font-semibold text-slate-700 mb-3">AI生成オプション</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">言語</label>
            <select value={form.language} onChange={set('language')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white">
              <option>日本語</option><option>英語</option><option>中国語（簡体）</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">文体・トーン</label>
            <select value={form.tone} onChange={set('tone')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white">
              <option>プロフェッショナル</option><option>親しみやすい</option><option>高級感・上品</option><option>カジュアル</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" id="faq" checked={form.includeFaq} onChange={setCheck('includeFaq')} className="rounded" />
            FAQを自動生成
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" id="seo" checked={form.includeSeo} onChange={setCheck('includeSeo')} className="rounded" />
            SEOキーワードを提案
          </label>
        </div>
      </div>
      <button onClick={handleGenerate} disabled={!form.productName}
        className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium text-sm w-full py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <Sparkles size={15} />AIで商品ページを生成する
      </button>
    </div>
  );

  if (step === 2) return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <Loader2 size={40} className="text-blue-900 animate-spin" />
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>AIが商品ページを生成中...</span><span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-sm text-slate-400">商品説明・キャッチコピー・SEOキーワードを同時生成しています</p>
    </div>
  );

  if (step === 3 && generated) return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(CONTENT_LABELS) as (keyof typeof CONTENT_LABELS)[]).map((key) => (
          <div key={key} className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600">{CONTENT_LABELS[key]}</p>
              <CopyButton text={generated[key]} />
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{generated[key]}</p>
          </div>
        ))}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">SEOキーワード</p>
            <CopyButton text={generated.seoKeywords.join(', ')} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {generated.seoKeywords.map((kw) => (
              <span key={kw} className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-600">全文まとめ（編集可能）</p>
          <CopyButton text={combinedText} />
        </div>
        <textarea rows={12} value={combinedText} onChange={(e) => setCombinedText(e.target.value)}
          className="w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none font-mono"
        />
      </div>
      <div className="flex items-center gap-4">
        <button disabled title="Shopify連携はProプランで利用可能"
          className="flex items-center gap-2 bg-slate-200 text-slate-400 text-sm px-6 py-2.5 rounded-md cursor-not-allowed">
          <Sparkles size={14} />Shopifyに反映する（Pro）
        </button>
        <button onClick={() => { setStep(1); setGenerated(null); setProgress(0); }} className="text-sm text-blue-900 hover:underline">
          ← 最初からやり直す
        </button>
      </div>
    </div>
  );

  return null;
}

// ─── ImproveTab ───────────────────────────────────────────────────────────────

function ImproveTab() {
  const [currentContent, setCurrentContent] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImproveResult | null>(null);
  const [generatingFull, setGeneratingFull] = useState(false);
  const [fullGenerated, setFullGenerated] = useState(false);

  const togglePriority = (p: string) =>
    setPriorities((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleAnalyze = async () => {
    setLoading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 90) { clearInterval(interval); return 90; } return p + 15; });
    }, 300);
    try {
      const res = await fetch('/api/generate-product-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'improve', currentContent, priorities }),
      });
      const data: ImproveResult = await res.json();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setResult(data); setLoading(false); }, 400);
    } catch {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setResult({
          currentScore: 42, improvedScore: 78,
          improvements: [
            { area: 'タイトル', issue: 'キーワードが不足している', suggestion: '主要SEOキーワードを含むタイトルに変更' },
            { area: '商品説明', issue: '特徴の羅列で購買動機が弱い', suggestion: 'ストーリー性を加え、使用シーンを具体的に描写する' },
            { area: '画像', issue: 'alt属性が未設定', suggestion: '全画像に商品名・特徴を含むalt属性を追加' },
            { area: 'FAQ', issue: 'よくある質問がない', suggestion: 'お手入れ・サイズ・配送に関するFAQを追加' },
            { area: 'SEO', issue: 'メタディスクリプションが未設定', suggestion: '120文字以内でキーワードを含むディスクリプションを設定' },
          ],
          fullPage: currentContent + '\n\n【改善済み】',
        });
        setLoading(false);
      }, 400);
    }
  };

  const scoreColor = (s: number) => s >= 70 ? 'text-teal-600' : s >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-5">
      {!result ? (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">現在の商品ページ内容を貼り付け</label>
            <textarea rows={8} placeholder="タイトル・商品説明・スペック等を貼り付けてください..."
              value={currentContent} onChange={(e) => setCurrentContent(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">改善優先事項（複数選択可）</p>
            <div className="flex flex-wrap gap-2">
              {IMPROVE_PRIORITIES.map((p) => (
                <button key={p} onClick={() => togglePriority(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${priorities.includes(p) ? 'bg-blue-900 text-white border-blue-900' : 'text-slate-600 border-slate-300 hover:border-slate-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 size={32} className="text-blue-900 animate-spin" />
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-xs text-slate-500"><span>ページを分析中...</span><span>{progress}%</span></div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          ) : (
            <button onClick={handleAnalyze} disabled={!currentContent}
              className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium text-sm w-full py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Sparkles size={15} />AIで改善点を分析する
            </button>
          )}
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="border rounded-xl p-5 bg-white">
            <p className="text-sm font-semibold text-slate-700 mb-4">ページスコア診断</p>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">現在のスコア</p>
                <p className={`text-4xl font-bold ${scoreColor(result.currentScore)}`}>{result.currentScore}</p>
                <p className="text-xs text-slate-400 mt-1">/ 100</p>
              </div>
              <div className="text-2xl text-slate-300">→</div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">改善後スコア</p>
                <p className={`text-4xl font-bold ${scoreColor(result.improvedScore)}`}>{result.improvedScore}</p>
                <p className="text-xs text-slate-400 mt-1">/ 100</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">改善率</p>
                <p className="text-2xl font-bold text-blue-900">+{result.improvedScore - result.currentScore}pt</p>
                <p className="text-xs text-teal-600 mt-1">{result.improvements.length}件の改善ポイントを検出</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {result.improvements.map((item, i) => (
              <div key={i} className="border-l-4 border-blue-900 bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">{item.area}</span>
                  <span className="text-xs text-red-600">{item.issue}</span>
                </div>
                <p className="text-sm text-slate-700">→ {item.suggestion}</p>
              </div>
            ))}
          </div>
          {!fullGenerated ? (
            <button onClick={() => { setGeneratingFull(true); setTimeout(() => { setGeneratingFull(false); setFullGenerated(true); }, 1500); }}
              disabled={generatingFull}
              className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium text-sm w-full py-3 rounded-lg disabled:opacity-50 transition-colors">
              {generatingFull ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generatingFull ? '生成中...' : '改善版全文を生成する'}
            </button>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600">改善版全文</p>
                <CopyButton text={result.fullPage} />
              </div>
              <textarea rows={10} defaultValue={result.fullPage}
                className="w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none font-mono"
              />
            </div>
          )}
          <button onClick={() => { setResult(null); setCurrentContent(''); setPriorities([]); setFullGenerated(false); }}
            className="text-sm text-blue-900 hover:underline">
            ← 別のページを分析する
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PricingTab ───────────────────────────────────────────────────────────────

function PricingTab() {
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
  const [priceCopied, setPriceCopied] = useState(false);
  const [shippingCopied, setShippingCopied] = useState(false);

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
    setForm((f) => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p] }));

  const toggleCompetitor = (c: string) =>
    setForm((f) => ({ ...f, competitorTargets: f.competitorTargets.includes(c) ? f.competitorTargets.filter((x) => x !== c) : [...f.competitorTargets, c] }));

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
          productName: form.productName,
          currentPrice: Number(form.currentPrice),
          cost: Number(form.cost),
          category: form.category,
          features: form.features,
          targetMargin: Number(form.targetMargin),
          shipping: Number(form.shipping),
          platforms: form.platforms,
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

  const cost = Number(form.cost) || 0;
  const currentPriceNum = Number(form.currentPrice) || 0;
  const adjustedPriceNum = Number(adjustedPrice) || 0;
  const newMarginRate = adjustedPriceNum > 0 ? ((adjustedPriceNum - cost) / adjustedPriceNum) * 100 : 0;
  const originalMarginRate = currentPriceNum > 0 ? ((currentPriceNum - cost) / currentPriceNum) * 100 : 0;
  const improvement = newMarginRate - originalMarginRate;
  const freeShippingLine = analysisResult?.freeShippingLine ?? 0;

  // ── Step 1 ──
  if (step === 1) return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="font-semibold text-slate-900 mb-6">📊 価格分析したい商品を入力してください</h2>

      <div className="mb-6 flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-600">既存商品から選ぶ</label>
        <select value={form.selectedProductId} onChange={(e) => handleProductSelect(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white">
          <option value="">-- 商品を選択 --</option>
          {topProducts.map((p) => (
            <option key={p.id} value={p.id}>{p.name}（¥{p.price.toLocaleString()}）</option>
          ))}
          <option value="new">新規商品を入力する</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left column */}
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
            <select value={form.category} onChange={setField('category')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white">
              <option value="">-- 選択 --</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">販売プラットフォーム</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p} type="button" onClick={() => togglePlatform(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.platforms.includes(p) ? 'bg-blue-900 text-white border-blue-900' : 'text-slate-600 border-slate-300 hover:border-slate-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">商品の特徴・強み</label>
            <textarea rows={3} placeholder="例: 国産ヒノキ100%、職人手作り、抗菌作用あり"
              value={form.features} onChange={setField('features')}
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

      <div className="bg-slate-50 rounded-lg p-4 mt-4">
        <p className="text-xs font-semibold text-slate-700 mb-3">競合リサーチ対象</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {COMPETITOR_TARGETS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.competitorTargets.includes(c)} onChange={() => toggleCompetitor(c)} className="rounded" />
              {c}
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleAnalyze} disabled={!form.productName || isLoading}
        className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium w-full py-3 mt-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        AI価格分析を実行する
      </button>
    </div>
  );

  // ── Step 2: loading ──
  if (step === 2 && isLoading) return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <Loader2 size={40} className="text-blue-900 animate-spin" />
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>競合価格を調査・分析中です...</span><span>{loadingProgress}%</span>
          </div>
          <Progress value={loadingProgress} className="h-2" />
        </div>
        <p className="text-sm text-slate-400">Amazon・楽天などの競合データをAIが分析しています</p>
      </div>
    </div>
  );

  // ── Step 2: results ──
  if (step === 2 && analysisResult) {
    const min = Math.min(analysisResult.competitorPrices.amazon.min, analysisResult.competitorPrices.rakuten.min);
    const max = Math.max(analysisResult.competitorPrices.amazon.max, analysisResult.competitorPrices.rakuten.max);
    const judgment = JUDGMENT_CONFIG[analysisResult.priceJudgment] ?? JUDGMENT_CONFIG.optimal;

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Section 1: Competitor price range */}
        <div className="bg-white border rounded-xl p-6">
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

        {/* Section 2: AI price recommendations */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-4">🤖 AI推奨価格</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Cost-based */}
            <div className="border rounded-xl p-5">
              <span className="inline-block text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full mb-3">コスト重視</span>
              <p className="text-3xl font-bold text-slate-900">¥{analysisResult.recommendations.costBased.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">利益率 {analysisResult.recommendations.costBased.marginRate}%</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{analysisResult.recommendations.costBased.reason}</p>
              <button onClick={() => handleSelectPrice('costBased')}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm w-full py-2 mt-3 rounded-lg transition-colors">
                この価格を採用する
              </button>
            </div>
            {/* Market optimal */}
            <div className="border-2 border-blue-900 rounded-xl p-5 relative">
              <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">おすすめ</span>
              <span className="inline-block text-xs font-medium bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full mb-3 mt-1">市場最適</span>
              <p className="text-3xl font-bold text-blue-900">¥{analysisResult.recommendations.marketOptimal.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">利益率 {analysisResult.recommendations.marketOptimal.marginRate}%</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{analysisResult.recommendations.marketOptimal.reason}</p>
              <button onClick={() => handleSelectPrice('marketOptimal')}
                className="bg-blue-900 hover:bg-blue-950 text-white font-medium text-sm w-full py-2 mt-3 rounded-lg transition-colors">
                この価格を採用する
              </button>
            </div>
            {/* Premium */}
            <div className="border rounded-xl p-5">
              <span className="inline-block text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mb-3">プレミアム</span>
              <p className="text-3xl font-bold text-slate-900">¥{analysisResult.recommendations.premium.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">利益率 {analysisResult.recommendations.premium.marginRate}%</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{analysisResult.recommendations.premium.reason}</p>
              <button onClick={() => handleSelectPrice('premium')}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm w-full py-2 mt-3 rounded-lg transition-colors">
                この価格を採用する
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Free shipping line */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-4">🚚 送料無料ライン提案</h3>
          <div className="flex items-center gap-8 mb-4 text-sm">
            <span className="text-slate-600">現在の送料: <strong className="text-slate-900">¥{Number(form.shipping).toLocaleString()}</strong></span>
            <span className="text-slate-600">推奨送料無料ライン: <strong className="text-blue-900 text-base">¥{analysisResult.freeShippingLine.toLocaleString()}</strong></span>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-800 leading-relaxed">
            ✅ <strong>¥{analysisResult.freeShippingLine.toLocaleString()}</strong>以上で送料無料にすることで、
            客単価アップと購買率向上が期待できます。
            現在の競合の<strong>{analysisResult.competitorFreeShippingRate}%</strong>が
            <strong>¥{analysisResult.competitorFreeShippingLine.toLocaleString()}</strong>前後で送料無料を設定しています。
          </div>
        </div>

        {/* Section 4: AI advice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-3">💡 価格戦略アドバイス</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{analysisResult.advice}</p>
        </div>

        <button onClick={handleConfirmPrice}
          className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium w-full py-3 rounded-lg transition-colors">
          価格を確定してStep 3へ →
        </button>
      </div>
    );
  }

  // ── Step 3 ──
  if (step === 3) {
    const strategyName = selectedStrategy ? STRATEGY_LABELS[selectedStrategy] : '市場最適';

    const copyPrice = () => {
      navigator.clipboard.writeText(`¥${adjustedPriceNum.toLocaleString()}`);
      setPriceCopied(true);
      setTimeout(() => setPriceCopied(false), 2000);
    };
    const copyShipping = () => {
      navigator.clipboard.writeText(`¥${freeShippingLine.toLocaleString()}`);
      setShippingCopied(true);
      setTimeout(() => setShippingCopied(false), 2000);
    };

    return (
      <div className="bg-white border rounded-xl p-6 space-y-6 animate-in fade-in duration-300">
        <h3 className="font-semibold text-slate-900">✅ 価格設定を確認してください</h3>

        {/* Change summary */}
        <div className="bg-slate-50 rounded-lg p-6">
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <p className="text-xs text-slate-500 mb-1">現在の価格</p>
              <p className="text-xl line-through text-slate-400">¥{currentPriceNum.toLocaleString()}</p>
            </div>
            <div className="text-slate-300 text-2xl font-light">→</div>
            <div>
              <p className="text-xs text-slate-500 mb-1">新しい価格</p>
              <p className="text-3xl font-bold text-blue-900">¥{adjustedPriceNum.toLocaleString()}</p>
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
            <span className="text-xs font-medium bg-blue-100 text-blue-900 px-3 py-1 rounded-full">{strategyName}</span>
          </div>
        </div>

        {/* Manual adjustment */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">価格を微調整する</label>
          <div className="flex items-center gap-4">
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">¥</span>
              <Input type="number" value={adjustedPrice} onChange={(e) => setAdjustedPrice(e.target.value)} className="pl-7" />
            </div>
            <p className="text-sm text-slate-500">
              利益率: <strong className={newMarginRate < 0 ? 'text-red-600' : 'text-slate-800'}>{newMarginRate.toFixed(1)}%</strong>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button disabled className="border w-full py-3 rounded-lg text-sm text-slate-400 cursor-not-allowed">
            Shopifyに反映する（準備中）
          </button>
          <button onClick={copyPrice}
            className="bg-blue-900 hover:bg-blue-950 text-white font-medium text-sm w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            {priceCopied ? <Check size={14} /> : <Copy size={14} />}
            {priceCopied ? 'コピーしました ✓' : '価格をコピーする'}
          </button>
        </div>

        {/* Free shipping button */}
        <button onClick={copyShipping}
          className="border w-full py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          {shippingCopied && <Check size={14} className="text-teal-600" />}
          {shippingCopied ? '設定をコピーしました ✓' : `送料無料ラインを¥${freeShippingLine.toLocaleString()}に設定する`}
        </button>

        <button
          onClick={() => { setStep(1); setAnalysisResult(null); setSelectedPrice(null); setSelectedStrategy(null); setAdjustedPrice(''); setIsLoading(false); }}
          className="text-sm text-blue-900 hover:underline"
        >
          ← 最初からやり直す
        </button>
      </div>
    );
  }

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuildAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 1000); return () => clearTimeout(t); }, []);
  const [done, setDone] = useState<Record<string, boolean>>({});

  if (!ready) return <PageSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <PageHeader
        title="構築AI"
        description="商品ページ生成・SEO最適化・価格分析をAIが代行します"
      />

      <AgentBriefCard category="build" />

      {/* ── 2. 3-tab main section ─────────────────────────────── */}
      <Tabs defaultValue="proposals">
        <TabsList className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 h-auto w-full">
          <TabsTrigger value="proposals" className="flex items-center gap-2 px-4 py-3.5 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
            <Lightbulb className="w-4 h-4" />今日の提案
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2 px-4 py-3.5 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
            <FileText className="w-4 h-4" />商品ページ生成
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2 px-4 py-3.5 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
            <TrendingUp className="w-4 h-4" />価格提案・分析
          </TabsTrigger>
        </TabsList>

        {/* Tab: Today's proposals */}
        <TabsContent value="proposals">
          <div className="bg-white border rounded-xl p-6 mt-2">
            <h2 className="font-semibold text-slate-900 mb-4">📋 今日の提案</h2>
            <div className="flex flex-col gap-3">
              {suggestions.map((s) => {
                const cfg = urgencyConfig[s.urgency];
                const isDone = done[s.id];
                return (
                  <div key={s.id} className={`flex items-center justify-between rounded-xl border p-5 transition-colors ${isDone ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>優先度{cfg.label}</span>
                      <span className={`text-sm ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{s.title}</span>
                    </div>
                    {isDone ? (
                      <div className="flex items-center gap-1.5 text-teal-600 text-sm font-medium"><CheckCircle2 size={16} />完了</div>
                    ) : (
                      <button onClick={() => setDone((d) => ({ ...d, [s.id]: true }))}
                        className="bg-blue-900 hover:bg-blue-950 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shrink-0">
                        実行する
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Page generator */}
        <TabsContent value="generator">
          <div className="bg-white border rounded-xl p-6 mt-2">
            <h2 className="font-semibold text-slate-900 mb-5">✨ 商品ページを生成する</h2>
            <Tabs defaultValue="create">
              <TabsList className="mb-5">
                <TabsTrigger value="create">新規作成</TabsTrigger>
                <TabsTrigger value="improve">既存ページ改善</TabsTrigger>
              </TabsList>
              <TabsContent value="create"><CreateTab /></TabsContent>
              <TabsContent value="improve"><ImproveTab /></TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Tab: Price analysis */}
        <TabsContent value="pricing" className="mt-2">
          <PricingTab />
        </TabsContent>
      </Tabs>

      {/* ── 3. History table ──────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">実行履歴</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">実行日時</TableHead>
              <TableHead className="text-xs">アクション内容</TableHead>
              <TableHead className="text-xs">ステータス</TableHead>
              <TableHead className="text-xs">効果</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyRows.map((row) => (
              <TableRow key={row.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">{row.datetime}</TableCell>
                <TableCell className="text-sm text-slate-800">{row.action}</TableCell>
                <TableCell>
                  {row.status === '完了' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} />完了
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Clock size={11} />処理中
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-700">{row.effect}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
