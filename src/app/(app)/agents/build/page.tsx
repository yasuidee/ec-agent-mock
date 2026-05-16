'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { AgentBriefCard } from '@/components/AgentBriefCard';
import { PageSkeleton } from '@/components/PageSkeleton';
import { Input } from '@/components/ui/input';
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

// ─── Static data ─────────────────────────────────────────────────────────────

const suggestions: Suggestion[] = [
  { id: 's1', title: '南部鉄器急須の商品ページを英語化',                   urgency: 'high' },
  { id: 's2', title: 'ヒノキカッティングボードにSEOキーワードを追加',       urgency: 'medium' },
  { id: 's3', title: '有田焼マグカップの画像にalt属性を追加',               urgency: 'low' },
];

const historyRows: HistoryRow[] = [
  { id: 'h1', datetime: '2026-05-15 09:12', action: '南部鉄器急須 英語ページ生成',           status: '完了',  effect: 'CVR +12%' },
  { id: 'h2', datetime: '2026-05-14 14:33', action: 'ヒノキカッティングボード SEO最適化',     status: '完了',  effect: '検索流入 +8%' },
  { id: 'h3', datetime: '2026-05-14 11:05', action: '和紙ノート 商品説明リライト',           status: '完了',  effect: '滞在時間 +25%' },
  { id: 'h4', datetime: '2026-05-13 16:48', action: '漆塗り箸セット 中国語ページ生成',       status: '完了',  effect: '海外売上 +¥32,000' },
  { id: 'h5', datetime: '2026-05-13 10:20', action: '有田焼マグカップ altテキスト一括追加',   status: '処理中', effect: '計測中' },
];

const urgencyConfig: Record<Urgency, { label: string; className: string }> = {
  high:   { label: '高',  className: 'bg-red-100 text-red-700' },
  medium: { label: '中',  className: 'bg-amber-100 text-amber-700' },
  low:    { label: '低',  className: 'bg-slate-100 text-slate-600' },
};

const MOCK_PREVIEW = {
  title: (name: string) => `【公式】${name} | 職人手作り・日本製 | EC Agent ストア`,
  description: (name: string, feature: string) =>
    `${name}は、熟練の職人が一つひとつ丁寧に仕上げた日本製の逸品です。${feature || '素材の質感と独自の製法'}にこだわり、日常使いから贈り物まで幅広くお使いいただけます。耐久性・機能性・デザイン性を高い次元で両立しています。`,
  keywords: (name: string) =>
    [`${name} 日本製`, `${name} 職人手作り`, `${name} ギフト プレゼント`],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuildAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 650); return () => clearTimeout(t); }, []);
  if (!ready) return <PageSkeleton />;

  const [done, setDone] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({ name: '', cost: '', feature: '', lang: '日本語' });
  const [preview, setPreview] = useState<null | { title: string; description: string; keywords: string[] }>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!form.name) return;
    setGenerating(true);
    setTimeout(() => {
      setPreview({
        title: MOCK_PREVIEW.title(form.name),
        description: MOCK_PREVIEW.description(form.name, form.feature),
        keywords: MOCK_PREVIEW.keywords(form.name),
      });
      setGenerating(false);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">構築AI</h1>
        <p className="text-sm text-slate-500 mt-1">
          商品ページ生成・SEO最適化・多言語対応をAIが代行します
        </p>
      </div>

      <AgentBriefCard category="build" />

      {/* ── 2. Today's suggestions ────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📋 今日の提案</h2>
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => {
            const cfg = urgencyConfig[s.urgency];
            const isDone = done[s.id];
            return (
              <div
                key={s.id}
                className={`flex items-center justify-between border rounded-lg p-4 transition-colors ${
                  isDone ? 'bg-teal-50 border-teal-200' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                    優先度{cfg.label}
                  </span>
                  <span className={`text-sm ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {s.title}
                  </span>
                </div>
                {isDone ? (
                  <div className="flex items-center gap-1.5 text-teal-600 text-sm font-medium">
                    <CheckCircle2 size={16} />
                    完了
                  </div>
                ) : (
                  <button
                    onClick={() => setDone((d) => ({ ...d, [s.id]: true }))}
                    className="bg-blue-900 text-white text-xs px-4 py-1.5 rounded-md hover:bg-blue-800 transition-colors shrink-0"
                  >
                    実行する
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Generation form ────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">✨ 商品ページを生成する</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">商品名</label>
            <Input
              placeholder="例: 南部鉄器急須"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">原価（円）</label>
            <Input
              type="number"
              placeholder="例: 3500"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs font-medium text-slate-600">商品の特徴</label>
            <textarea
              rows={3}
              placeholder="例: 岩手の伝統工芸。200年の歴史を持つ職人が手作業で仕上げた急須。"
              value={form.feature}
              onChange={(e) => setForm((f) => ({ ...f, feature: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">ターゲット言語</label>
            <select
              value={form.lang}
              onChange={(e) => setForm((f) => ({ ...f, lang: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option>日本語</option>
              <option>英語</option>
              <option>中国語</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!form.name || generating}
          className="flex items-center gap-2 bg-blue-900 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles size={15} />
          {generating ? '生成中...' : 'AIで生成する'}
        </button>

        {preview && (
          <div className="mt-4 bg-slate-50 rounded-lg p-4 space-y-3 animate-in fade-in duration-200">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">生成されたタイトル</p>
              <p className="text-sm font-semibold text-slate-900">{preview.title}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">商品説明文</p>
              <p className="text-sm text-slate-700 leading-relaxed">{preview.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">SEOキーワード</p>
              <div className="flex gap-2 flex-wrap">
                {preview.keywords.map((kw) => (
                  <span key={kw} className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. History table ──────────────────────────────────── */}
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
              <TableRow key={row.id}>
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">{row.datetime}</TableCell>
                <TableCell className="text-sm text-slate-800">{row.action}</TableCell>
                <TableCell>
                  {row.status === '完了' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} />
                      完了
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Clock size={11} />
                      処理中
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
