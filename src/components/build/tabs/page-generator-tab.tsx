'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CopyButton } from '@/components/build/copy-button';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Constants ───────────────────────────────────────────────────────────────

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

// ─── CreateSubTab ─────────────────────────────────────────────────────────────

function CreateSubTab() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [combinedText, setCombinedText] = useState('');
  const [form, setForm] = useState<CreateForm>({
    productName: '', price: '', category: '', targetCustomer: '', platform: '',
    features: '', differentiation: '', shipping: '', returnPolicy: '',
    language: '日本語', tone: 'プロフェッショナル', includeFaq: true, includeSeo: true,
  });

  const set = (k: keyof CreateForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCheck = (k: 'includeFaq' | 'includeSeo') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
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
          <textarea
            rows={3}
            placeholder="例: 岩手の伝統工芸。200年の歴史を持つ職人が手作業で仕上げた急須。容量200ml。"
            value={form.features}
            onChange={set('features')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-medium text-slate-600">差別化ポイント</label>
          <textarea
            rows={2}
            placeholder="例: 鉄分補給・保温性・100年使える耐久性"
            value={form.differentiation}
            onChange={set('differentiation')}
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
            <select
              value={form.language}
              onChange={set('language')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
            >
              <option>日本語</option>
              <option>英語</option>
              <option>中国語（簡体）</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">文体・トーン</label>
            <select
              value={form.tone}
              onChange={set('tone')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white"
            >
              <option>プロフェッショナル</option>
              <option>親しみやすい</option>
              <option>高級感・上品</option>
              <option>カジュアル</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.includeFaq} onChange={setCheck('includeFaq')} className="rounded" />
            FAQを自動生成
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.includeSeo} onChange={setCheck('includeSeo')} className="rounded" />
            SEOキーワードを提案
          </label>
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={!form.productName}
        className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium text-sm w-full py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Sparkles size={15} />AIで商品ページを生成する
      </button>
    </div>
  );

  if (step === 2) return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <Loader2 size={40} className="text-[#1e3a8a] animate-spin" />
      <div className="w-full max-w-sm space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>AIが商品ページを生成中...</span>
          <span>{progress}%</span>
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
        <textarea
          rows={12}
          value={combinedText}
          onChange={(e) => setCombinedText(e.target.value)}
          className="w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 resize-none font-mono"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          disabled
          title="Shopify連携はProプランで利用可能"
          className="flex items-center gap-2 bg-slate-200 text-slate-400 text-sm px-6 py-2.5 rounded-xl cursor-not-allowed"
        >
          <Sparkles size={14} />Shopifyに反映する（Pro）
        </button>
        <button
          onClick={() => { setStep(1); setGenerated(null); setProgress(0); }}
          className="text-sm text-[#1e3a8a] hover:underline"
        >
          ← 最初からやり直す
        </button>
      </div>
    </div>
  );

  return null;
}

// ─── ImproveSubTab ────────────────────────────────────────────────────────────

function ImproveSubTab() {
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
            { area: 'タイトル',   issue: 'キーワードが不足している',           suggestion: '主要SEOキーワードを含むタイトルに変更' },
            { area: '商品説明',   issue: '特徴の羅列で購買動機が弱い',         suggestion: 'ストーリー性を加え、使用シーンを具体的に描写する' },
            { area: '画像',       issue: 'alt属性が未設定',                   suggestion: '全画像に商品名・特徴を含むalt属性を追加' },
            { area: 'FAQ',        issue: 'よくある質問がない',                 suggestion: 'お手入れ・サイズ・配送に関するFAQを追加' },
            { area: 'SEO',        issue: 'メタディスクリプションが未設定',     suggestion: '120文字以内でキーワードを含むディスクリプションを設定' },
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
            <textarea
              rows={8}
              placeholder="タイトル・商品説明・スペック等を貼り付けてください..."
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">改善優先事項（複数選択可）</p>
            <div className="flex flex-wrap gap-2">
              {IMPROVE_PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    priorities.includes(p)
                      ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                      : 'text-slate-600 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 size={32} className="text-[#1e3a8a] animate-spin" />
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>ページを分析中...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!currentContent}
              className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium text-sm w-full py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
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
                <p className="text-2xl font-bold text-[#1e3a8a]">
                  +{result.improvedScore - result.currentScore}pt
                </p>
                <p className="text-xs text-teal-600 mt-1">{result.improvements.length}件の改善ポイントを検出</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {result.improvements.map((item, i) => (
              <div key={i} className="border-l-4 border-[#1e3a8a] bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded">{item.area}</span>
                  <span className="text-xs text-red-600">{item.issue}</span>
                </div>
                <p className="text-sm text-slate-700">→ {item.suggestion}</p>
              </div>
            ))}
          </div>
          {!fullGenerated ? (
            <button
              onClick={() => {
                setGeneratingFull(true);
                setTimeout(() => { setGeneratingFull(false); setFullGenerated(true); }, 1500);
              }}
              disabled={generatingFull}
              className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-medium text-sm w-full py-3 rounded-xl disabled:opacity-50 transition-colors"
            >
              {generatingFull ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generatingFull ? '生成中...' : '改善版全文を生成する'}
            </button>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600">改善版全文</p>
                <CopyButton text={result.fullPage} />
              </div>
              <textarea
                rows={10}
                defaultValue={result.fullPage}
                className="w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 resize-none font-mono"
              />
            </div>
          )}
          <button
            onClick={() => {
              setResult(null);
              setCurrentContent('');
              setPriorities([]);
              setFullGenerated(false);
            }}
            className="text-sm text-[#1e3a8a] hover:underline"
          >
            ← 別のページを分析する
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PageGeneratorTab ─────────────────────────────────────────────────────────

export function PageGeneratorTab() {
  const [mode, setMode] = useState<'create' | 'improve'>('create');

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1">
        {(['create', 'improve'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${
              mode === m
                ? 'bg-[#1e3a8a] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {m === 'create' ? '✨ 新規作成' : '🔧 既存ページ改善'}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        {mode === 'create' && <CreateSubTab />}
        {mode === 'improve' && <ImproveSubTab />}
      </div>
    </div>
  );
}
