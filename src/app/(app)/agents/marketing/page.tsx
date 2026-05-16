'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Wallet, Copy, Check, Sparkles } from 'lucide-react';
import { AgentBriefCard } from '@/components/AgentBriefCard';
import { PageSkeleton } from '@/components/PageSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Types ───────────────────────────────────────────────────────────────────

type Platform = 'Instagram' | 'X' | 'Facebook';

interface HistoryRow {
  id: string;
  datetime: string;
  action: string;
  channel: string;
  result: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const kpis = [
  {
    id: 'spend',
    label: '広告費合計',
    value: '¥48,000',
    delta: '+12%',
    positive: true,
    sub: '前週比',
    icon: Wallet,
  },
  {
    id: 'roas',
    label: 'ROAS',
    value: '3.8倍',
    delta: '+0.4',
    positive: true,
    sub: '前週比',
    icon: TrendingUp,
  },
  {
    id: 'newCustomers',
    label: '新規顧客',
    value: '23人',
    delta: '+8%',
    positive: true,
    sub: '前週比',
    icon: Users,
  },
];

const budgetData = [
  { name: 'ヒノキカッティングボード', budget: 18000 },
  { name: '南部鉄器急須',             budget: 15000 },
  { name: '有田焼マグカップ',          budget: 8000  },
  { name: '和紙ノート',               budget: 4000  },
  { name: '漆塗り箸',                 budget: 3000  },
];

const products = budgetData.map((d) => d.name);

const historyRows: HistoryRow[] = [
  { id: 'h1', datetime: '2026-05-15 10:30', action: 'ヒノキカッティングボード Instagram広告配信',   channel: 'Instagram',  result: 'CVR +15%' },
  { id: 'h2', datetime: '2026-05-14 09:15', action: '南部鉄器急須 Google ショッピング最適化',        channel: 'Google',     result: 'ROAS 4.2倍' },
  { id: 'h3', datetime: '2026-05-13 14:00', action: '有田焼マグカップ X プロモーション投稿',          channel: 'X',          result: 'インプ +3,200' },
  { id: 'h4', datetime: '2026-05-13 11:20', action: '全商品 メルマガ配信（リピーター向け）',           channel: 'メール',     result: '開封率 32%' },
  { id: 'h5', datetime: '2026-05-12 16:45', action: '和紙ノート Facebook 類似オーディエンス拡張',     channel: 'Facebook',   result: '新規 +9人' },
];

const MOCK_POST: Record<Platform, (product: string) => string> = {
  Instagram: (p) =>
    `✨ 職人の技が宿る一品をご紹介 ✨\n\n「${p}」は、熟練の職人が一つひとつ丁寧に仕上げた日本製の逸品です。\n日常使いから特別な贈り物まで、幅広くお使いいただけます。\n\n🛒 プロフィールリンクから詳細をチェック👆\n\n#日本製 #職人手作り #${p.replace(/\s/g, '')} #和雑貨 #ギフト`,
  X: (p) =>
    `【新着】${p} が入荷しました🎉\n\n職人が手作業で仕上げた日本製の逸品。耐久性・デザイン性ともに抜群です。\n数量限定なのでお早めに👇\n\n#${p.replace(/\s/g, '')} #日本製 #職人`,
  Facebook: (p) =>
    `📦 ${p} のご紹介\n\n日本の伝統工芸に根ざした職人技が光る一品です。素材の質感と独自の製法にこだわり、日常をちょっと豊かにしてくれます。\n\nご注文・詳細はプロフィールのリンクから。お気軽にメッセージもどうぞ 😊\n\n#日本製 #伝統工芸 #${p.replace(/\s/g, '')} #ハンドメイド #暮らしの道具`,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketingAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 650); return () => clearTimeout(t); }, []);
  if (!ready) return <PageSkeleton />;

  const [budgetExecuted, setBudgetExecuted] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [post, setPost] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setPost(null);
    setCopied(false);
    setTimeout(() => {
      setPost(MOCK_POST[platform](selectedProduct));
      setGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    if (!post) return;
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">集客AI</h1>
        <p className="text-sm text-slate-500 mt-1">
          広告配信・SNS投稿・メルマガをAIが最適化します
        </p>
      </div>

      <AgentBriefCard category="marketing" />

      {/* ── 2. KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(({ id, label, value, delta, positive, sub, icon: Icon }) => (
          <div key={id} className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
              <Icon size={16} className="text-slate-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
            <p className="text-xs mt-1">
              <span className={positive ? 'text-green-600' : 'text-red-500'}>
                ↑ {delta}
              </span>
              <span className="text-slate-400 ml-1">{sub}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── 3. Budget allocation ──────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📊 今週の予算配分提案</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={budgetData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip
              formatter={(v) => [`¥${Number(v).toLocaleString('ja-JP')}`, '推奨予算']}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="budget" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4">
          {budgetExecuted ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-md">
              <Check size={14} />
              配分を適用しました
            </span>
          ) : (
            <button
              onClick={() => setBudgetExecuted(true)}
              className="bg-blue-900 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              この配分で実行する
            </button>
          )}
        </div>
      </div>

      {/* ── 4. SNS post generation ────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📱 SNS投稿を生成する</h2>

        <div className="flex flex-col gap-4">
          {/* Product select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">商品を選択</label>
            <select
              value={selectedProduct}
              onChange={(e) => { setSelectedProduct(e.target.value); setPost(null); }}
              className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              {products.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Platform tabs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">プラットフォーム</label>
            <Tabs
              value={platform}
              onValueChange={(v) => { setPlatform(v as Platform); setPost(null); }}
            >
              <TabsList>
                {(['Instagram', 'X', 'Facebook'] as Platform[]).map((p) => (
                  <TabsTrigger key={p} value={p}>{p}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Generate button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-blue-900 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles size={15} />
              {generating ? '生成中...' : '投稿文を生成する'}
            </button>
          </div>

          {/* Preview */}
          {post && (
            <div className="bg-slate-50 rounded-lg p-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-500">{platform} 投稿プレビュー</p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copied ? <Check size={13} className="text-teal-600" /> : <Copy size={13} />}
                  {copied ? 'コピーしました' : 'コピーする'}
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{post}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. History table ──────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">実行履歴</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">実行日時</TableHead>
              <TableHead className="text-xs">施策内容</TableHead>
              <TableHead className="text-xs">チャネル</TableHead>
              <TableHead className="text-xs">結果</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">{row.datetime}</TableCell>
                <TableCell className="text-sm text-slate-800">{row.action}</TableCell>
                <TableCell>
                  <span className="text-xs font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                    {row.channel}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-700">{row.result}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
