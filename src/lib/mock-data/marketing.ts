// ─────────────────────────────────────────────────────────────
// 集客AI 型定義 + モックデータ
// ─────────────────────────────────────────────────────────────

// ── KPI ──────────────────────────────────────────────────────

export interface MarketingKpi {
  icon: string;
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  iconBg: string;
  accentColor: string;
}

export const marketingKpis: MarketingKpi[] = [
  {
    icon: '📢', label: '広告費合計', value: '¥48,000',
    trend: '↑ +12% 前週比', trendColor: 'text-emerald-600',
    iconBg: 'bg-blue-100', accentColor: 'text-[#1e3a8a]',
  },
  {
    icon: '📈', label: 'ROAS', value: '3.8倍',
    trend: '↑ +0.4 前週比', trendColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100', accentColor: 'text-emerald-600',
  },
  {
    icon: '👤', label: '新規顧客', value: '23人',
    trend: '↑ +48% 前週比', trendColor: 'text-emerald-600',
    iconBg: 'bg-amber-100', accentColor: 'text-amber-600',
  },
];

// ── 予算配分 ──────────────────────────────────────────────────

export interface BudgetItem {
  name: string;
  budget: number;
  roas: number;
}

// MAX_BUDGET = 18000 → barWidth = (budget / 18000) * 100%
export const MAX_BUDGET = 18000;

export const budgetItems: BudgetItem[] = [
  { name: 'ヒノキカッティングボード', budget: 18000, roas: 3.8 },
  { name: '南部鉄器急須',             budget: 12000, roas: 3.1 },
  { name: '有田焼マグカップ',          budget: 8000,  roas: 2.4 },
  { name: '和紙ノート',               budget: 6000,  roas: 1.9 },
  { name: '漆塗り箸',                 budget: 4000,  roas: 2.1 },
];

// ── 実行履歴 ──────────────────────────────────────────────────

export type MarketingChannel =
  'Instagram' | 'Google' | 'X' | 'メール' | 'Facebook';

export interface ExecutionRecord {
  date: string;
  action: string;
  channel: MarketingChannel;
  result: string;
}

export const channelColors: Record<MarketingChannel, string> = {
  Instagram: '#e11d48',
  Google:    '#1e7e34',
  X:         '#0f172a',
  メール:    '#7c3aed',
  Facebook:  '#1877f2',
};

export const executionHistory: ExecutionRecord[] = [
  { date: '2026-05-15 10:30', action: 'ヒノキカッティングボード Instagram広告配信',    channel: 'Instagram', result: 'CVR +15%'      },
  { date: '2026-05-14 09:15', action: '南部鉄器急須 Google ショッピング最適化',         channel: 'Google',    result: 'ROAS 4.2倍'   },
  { date: '2026-05-13 14:00', action: '有田焼マグカップ X プロモーション投稿',           channel: 'X',         result: 'インプ +3,200' },
  { date: '2026-05-13 11:20', action: '全商品 メルマガ配信（リピーター向け）',            channel: 'メール',    result: '開封率 32%'   },
  { date: '2026-05-12 16:45', action: '和紙ノート Facebook 類似オーディエンス拡張',      channel: 'Facebook',  result: '新規 +9人'    },
];

// ── API レスポンス型（page.tsx と共有）────────────────────────

export type Judgment = 'good' | 'warning' | 'danger';

export interface BudgetJudgeResult {
  verdict: 'increase' | 'maintain' | 'decrease';
  recommendedBudget: number;
  reason: string;
  expectedRevenueLift: number;
  savedAmount: number;
  roasJudgment: Judgment;
  roasComment: string;
  stockJudgment: Judgment;
  stockComment: string;
  marginJudgment: Judgment;
  marginComment: string;
}

export interface AdResult {
  adName: string;
  verdict: 'continue' | 'improve' | 'stop';
  roas: number;
  cpa: number;
  cvr: number;
  monthlyProfit: number;
  roasJudgment: Judgment;
  cpaJudgment: Judgment;
  cvrJudgment: Judgment;
  reason: string;
  action?: string;
}

export interface AdStopResult {
  results: AdResult[];
  summary: { continueCount: number; improveCount: number; stopCount: number };
}

export interface AdRow {
  id: string;
  adName: string;
  monthlySpend: string;
  adRevenue: string;
  clicks: string;
  conversions: string;
}

export interface AdPlanForm {
  objective: string;
  platforms: string[];
  budget: string;
  productName: string;
  targetAudience: string;
  targetKpi: string;
  campaignPeriod: string;
}

export interface MetaPlan {
  objective: string;
  dailyBudget: number;
  targetAge: string;
  targetGender: string;
  targetLocation: string;
  interests: string[];
  adType: string;
  mainCopy: string;
  headline: string;
  cta: string;
}

export interface GooglePlan {
  campaignType: string;
  dailyBudget: number;
  biddingStrategy: string;
  keywords: string[];
  negativeKeywords: string[];
  matchType: string;
  headline1: string;
  headline2: string;
  description: string;
}

export interface AdPlanResult {
  metaPlan: MetaPlan;
  googlePlan: GooglePlan;
  forecast: {
    monthlyImpressions: number;
    monthlyClicks: number;
    expectedRoas: number;
    expectedOrders: number;
  };
}

export interface ImprovementCampaign {
  name: string;
  status: 'good' | 'improve' | 'stop';
  currentRoas: number;
  improvements: {
    targeting: string;
    budget: { current: number; recommended: number; reason: string };
    creative: string;
    keywords: { add: string[]; remove: string[] };
  };
  expectedRoasAfter: number;
  lossAmount: number;
}

export interface ImprovementResult {
  campaigns: ImprovementCampaign[];
}

export interface ImproveCampaignRow {
  id: string;
  name: string;
  spend: string;
  clicks: string;
  purchases: string;
  roas: string;
  cvr: string;
  platform: 'meta' | 'google';
}
