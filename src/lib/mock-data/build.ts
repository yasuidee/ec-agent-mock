// ─────────────────────────────────────────────────────────────
// 構築AI 型定義 + モックデータ
// ─────────────────────────────────────────────────────────────

export type ProposalPriority = 'high' | 'medium' | 'low';
export type ProposalTag      = 'ビルド' | 'SEO' | '価格';
export type ExecutionStatus  = 'done' | 'processing';

export interface Proposal {
  id: string;
  priority: ProposalPriority;
  tag: ProposalTag;
  icon: string;
  title: string;
  effect: string;
  effectColor: string;
  description: string;
}

export const todayProposals: Proposal[] = [
  {
    id: '1', priority: 'high', tag: 'ビルド', icon: '🌐',
    title: '南部鉄器急須の商品ページを英語化',
    effect: '海外購入率 +15〜20%', effectColor: 'text-emerald-600',
    description: '海外からのアクセスが先月比+40%。英語対応で購買率が大幅改善',
  },
  {
    id: '2', priority: 'medium', tag: 'SEO', icon: '🔍',
    title: 'ヒノキカッティングボードにSEOキーワードを追加',
    effect: '検索流入 +8%見込み', effectColor: 'text-emerald-600',
    description: '検索ランキング圏外のロングテールキーワードを15個特定済み',
  },
  {
    id: '3', priority: 'low', tag: 'SEO', icon: '🖼️',
    title: '有田焼マグカップの画像にalt属性を追加',
    effect: 'SEOスコア向上', effectColor: 'text-slate-500',
    description: 'alt属性なし画像が3枚。検索エンジンのクロール改善に有効',
  },
];

export interface ExecutionRecord {
  date: string;
  action: string;
  status: ExecutionStatus;
  effect: string;
}

export const executionHistory: ExecutionRecord[] = [
  { date: '2026-05-15 09:12', action: '南部鉄器急須 英語ページ生成',         status: 'done',       effect: 'CVR +12%'         },
  { date: '2026-05-14 14:33', action: 'ヒノキカッティングボード SEO最適化',  status: 'done',       effect: '検索流入 +8%'      },
  { date: '2026-05-14 11:05', action: '和紙ノート 商品説明リライト',          status: 'done',       effect: '滞在時間 +25%'     },
  { date: '2026-05-13 16:48', action: '漆塗り箸セット 中国語ページ生成',      status: 'done',       effect: '海外売上 +¥32,000' },
  { date: '2026-05-13 10:20', action: '有田焼マグカップ altテキスト追加',     status: 'processing', effect: '計測中'            },
];

// ── 価格分析タブ ────────────────────────────────────────────

export interface CompetitorPrice {
  label: string;
  price: number;
  isOwn: boolean;
  isRecommended: boolean;
  barColor: string;
}

// MAX_PRICE = 15000 → barWidth(%) = price / 15000 * 100
export const competitorPrices: CompetitorPrice[] = [
  { label: 'メルカリ最安値',  price: 6500,  isOwn: false, isRecommended: false, barColor: '#94a3b8' },
  { label: '楽天 競合A',     price: 7800,  isOwn: false, isRecommended: false, barColor: '#818cf8' },
  { label: 'Amazon 競合B',  price: 8500,  isOwn: false, isRecommended: false, barColor: '#818cf8' },
  { label: 'あなたの商品',  price: 8800,  isOwn: true,  isRecommended: false, barColor: '#f59e0b' },
  { label: '推奨価格（AI）', price: 9800,  isOwn: false, isRecommended: true,  barColor: '#1e3a8a' },
  { label: '競合プレミアム', price: 12800, isOwn: false, isRecommended: false, barColor: '#94a3b8' },
];

export interface PriceStrategy {
  icon: string;
  label: string;
  isRecommended: boolean;
  tag: string;
  price: string;
  margin: string;
  accentColor: string;
  points: string[];
}

export const priceStrategies: PriceStrategy[] = [
  {
    icon: '🚀', label: '利益最大化', isRecommended: true,
    tag: 'AI推奨', price: '¥9,800', margin: '粗利率 62.2%',
    accentColor: '#1e3a8a',
    points: ['競合平均を5%下回る設定で流入を維持', '月間粗利 +¥144,000の改善', '価格競争力スコア: 上位24%'],
  },
  {
    icon: '⚖️', label: 'バランス型', isRecommended: false,
    tag: '安定重視', price: '¥8,990', margin: '粗利率 58.9%',
    accentColor: '#10b981',
    points: ['現在価格に近い±200円の調整', 'CVR低下リスクを最小化', '楽天SEOランキング維持に有効'],
  },
  {
    icon: '📈', label: 'シェア拡大', isRecommended: false,
    tag: '集客重視', price: '¥7,980', margin: '粗利率 47.9%',
    accentColor: '#f59e0b',
    points: ['競合最安値を上回る設定で検索上位を狙う', '短期の流入増加とレビュー収集に有効', '粗利を一時的に下げて認知拡大'],
  },
];
