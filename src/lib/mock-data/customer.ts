// ─────────────────────────────────────────────────────────────
// 顧客対応AI 型定義 + モックデータ
// ─────────────────────────────────────────────────────────────

export type Sentiment   = 'positive' | 'neutral' | 'negative';
export type Priority    = 'high' | 'medium' | 'low';
export type ChannelType = 'メール' | 'LINE' | 'Shopify' | 'Instagram' | 'Facebook' | 'Amazon';

// ── KPI ──────────────────────────────────────────────────────
export interface CustomerKpi {
  icon:       string;
  label:      string;
  value:      string;
  sub:        string;
  iconBg:     string;
  valueColor: string;
}

export const customerKpis: CustomerKpi[] = [
  { icon: '⭐', label: '未返信レビュー',   value: '5件',  sub: '早めの対応を推奨', iconBg: 'bg-red-100',   valueColor: 'text-red-500'   },
  { icon: '💬', label: '未返信問い合わせ', value: '4件',  sub: '高優先度2件あり',  iconBg: 'bg-amber-100', valueColor: 'text-amber-500' },
  { icon: '🌟', label: '平均評価',         value: '3.4',  sub: '全8件のレビュー',  iconBg: 'bg-amber-100', valueColor: 'text-amber-500' },
  { icon: '😟', label: 'ネガティブ率',     value: '38%',  sub: '改善が必要な割合', iconBg: 'bg-red-100',   valueColor: 'text-red-500'   },
];

// ── チャネルカラー ────────────────────────────────────────────
export const channelColors: Record<ChannelType, string> = {
  メール:    '#7c3aed',
  LINE:      '#00b900',
  Shopify:   '#96bf48',
  Instagram: '#e11d48',
  Facebook:  '#1877f2',
  Amazon:    '#ff9900',
};

// ── チャネルカラー（旧キー対応も含む） ───────────────────────
export const platformColorMap: Record<string, string> = {
  // new ChannelType keys
  メール:    '#7c3aed',
  LINE:      '#00b900',
  Shopify:   '#96bf48',
  Instagram: '#e11d48',
  Facebook:  '#1877f2',
  Amazon:    '#ff9900',
  // legacy lowercase keys (existing mock data)
  email:     '#7c3aed',
  line:      '#00b900',
  shopify:   '#96bf48',
  instagram: '#e11d48',
  facebook:  '#1877f2',
  amazon:    '#ff9900',
  rakuten:   '#bf0000',
  google:    '#4285f4',
};

export const platformLabelMap: Record<string, string> = {
  email:     'メール',
  line:      'LINE',
  shopify:   'Shopify',
  instagram: 'Instagram',
  facebook:  'Facebook',
  amazon:    'Amazon',
  rakuten:   '楽天',
  google:    'Google',
};

// ── フィードバック分析: 評価分布 ──────────────────────────────
export interface RatingBar {
  stars: number;
  count: number;
  color: string;
}

export const ratingDistribution: RatingBar[] = [
  { stars: 5, count: 3, color: '#10b981' },
  { stars: 4, count: 2, color: '#10b981' },
  { stars: 3, count: 1, color: '#f59e0b' },
  { stars: 2, count: 1, color: '#ef4444' },
  { stars: 1, count: 1, color: '#ef4444' },
];

// MAX_COUNT = 3 → barHeightPct = (count / 3) * 100
export const RATING_MAX_COUNT = 3;

// ── フィードバック分析: 感情分析 ──────────────────────────────
export interface SentimentBar {
  label:  string;
  pct:    number;
  count:  number;
  total:  number;
  color:  string;
}

export const sentimentData: SentimentBar[] = [
  { label: 'ポジティブ',    pct: 38, count: 3, total: 8, color: '#10b981' },
  { label: 'ニュートラル',  pct: 25, count: 2, total: 8, color: '#94a3b8' },
  { label: 'ネガティブ',    pct: 38, count: 3, total: 8, color: '#ef4444' },
];

// ── フィードバック分析: 課題カテゴリ ─────────────────────────
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'none';

export interface IssueCategory {
  name:        string;
  negCount:    number;
  total:       number;
  severity:    IssueSeverity;
  agentLabel?: string;
  agentType?:  'build' | 'marketing' | 'info';
}

export const issueCategories: IssueCategory[] = [
  { name: '顧客対応',    negCount: 2, total: 2, severity: 'critical',  agentLabel: '対応速度を改善してください', agentType: 'info'      },
  { name: '品質',        negCount: 1, total: 5, severity: 'high',       agentLabel: '構築AI',                    agentType: 'build'     },
  { name: 'ページ説明',  negCount: 1, total: 2, severity: 'high',       agentLabel: '構築AI',                    agentType: 'build'     },
  { name: '返品',        negCount: 1, total: 1, severity: 'critical'                                                                     },
  { name: '梱包',        negCount: 1, total: 3, severity: 'medium',     agentLabel: '構築AI',                    agentType: 'build'     },
  { name: '配送',        negCount: 1, total: 2, severity: 'medium',     agentLabel: '集客AI',                    agentType: 'marketing' },
  { name: '破損',        negCount: 1, total: 1, severity: 'critical'                                                                     },
  { name: '香り',        negCount: 0, total: 1, severity: 'none'                                                                         },
  { name: 'プレゼント',  negCount: 0, total: 2, severity: 'none'                                                                         },
  { name: 'サイズ感',    negCount: 0, total: 1, severity: 'none',       agentLabel: '構築AI',                    agentType: 'build'     },
  { name: '健康',        negCount: 0, total: 1, severity: 'none'                                                                         },
  { name: 'リピート意向',negCount: 0, total: 1, severity: 'none'                                                                         },
];

// ── 強みグリッド ──────────────────────────────────────────────
export interface StrengthPoint {
  label: string;
  count: number;
}

export const strengthPoints: StrengthPoint[] = [
  { label: '品質',         count: 3 },
  { label: 'プレゼント',   count: 2 },
  { label: '香り',         count: 1 },
  { label: '梱包',         count: 1 },
  { label: '健康',         count: 1 },
  { label: 'リピート意向', count: 1 },
];

// ── FAQカテゴリ ───────────────────────────────────────────────
export interface FaqCategory {
  label:  string;
  count:  number;
  barPct: number;
}

export const faqCategories: FaqCategory[] = [
  { label: '配送',   count: 2, barPct: 100 },
  { label: '商品',   count: 2, barPct: 100 },
  { label: '返品',   count: 1, barPct: 50  },
  { label: 'その他', count: 0, barPct: 0   },
];
