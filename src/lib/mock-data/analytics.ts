// ─── 週次売上推移（売上分析タブ / 棒グラフ）────────────────────────────────
export interface SalesTrendItem {
  week: string;
  sales: number;
  cost: number;
  profit: number;
}
export const salesTrendData: SalesTrendItem[] = [
  { week: '4/21〜', sales: 1_240_000, cost: 640_000, profit: 600_000 },
  { week: '4/28〜', sales: 1_450_000, cost: 740_000, profit: 710_000 },
  { week: '5/05〜', sales: 1_580_000, cost: 800_000, profit: 780_000 },
  { week: '5/12〜', sales: 1_720_000, cost: 840_000, profit: 880_000 },
];

// ─── 購買ファネル ─────────────────────────────────────────────────────────────
export interface FunnelStep {
  num: number;
  stage: string;
  count: string;
  unit: string;
  pct: number;
  barPct: string;
  color: string;
  drop?: string;
  severity?: 'critical' | 'warn';
  aiTip?: string;
}
export const funnelStepsData: FunnelStep[] = [
  { num: 1, stage: 'サイト訪問', count: '10,000', unit: 'セッション', pct: 100, barPct: '100%', color: '#1e3a8a' },
  { num: 2, stage: '商品閲覧',   count: '4,200',  unit: 'セッション', pct: 42,  barPct: '42%',  color: '#3b5db5',
    drop: '↓ 58% 離脱', severity: 'warn',     aiTip: 'TOPの動線が複雑。改善余地あり' },
  { num: 3, stage: 'カート追加', count: '890',    unit: 'セッション', pct: 8.9, barPct: '9%',   color: '#f59e0b',
    drop: '↓ 79% 離脱', severity: 'critical', aiTip: 'CTA文言とボタン位置を再設計' },
  { num: 4, stage: '購入完了',   count: '280',    unit: 'セッション', pct: 2.8, barPct: '3%',   color: '#10b981',
    drop: '↓ 69% 離脱', severity: 'warn',     aiTip: '送料無料ラインを ¥5,000 に下げる' },
];

// ─── 顧客セグメント ───────────────────────────────────────────────────────────
export interface SegmentItem {
  name: string;
  value: number;
  color: string;
  ltv: string;
}
export const segmentData: SegmentItem[] = [
  { name: '新規顧客',   value: 42, color: '#1e3a8a', ltv: '¥7,200' },
  { name: 'リピーター', value: 35, color: '#f59e0b', ltv: '¥40,960' },
  { name: '休眠顧客',   value: 23, color: '#cbd5e1', ltv: '¥2,820' },
];

// ─── 目標達成トラッカー ───────────────────────────────────────────────────────
export interface GoalMetric {
  label: string;
  current: string;
  target: string;
  pct: number;
  status: string;
  statusBg: string;
  statusColor: string;
  color: string;
  forecast: string;
}
export const goalData: GoalMetric[] = [
  { label: '売上',   current: '¥1,870,000', target: '¥3,000,000', pct: 62,
    status: '順調',     statusBg: 'bg-emerald-100', statusColor: 'text-emerald-700', color: 'bg-[#1e3a8a]',
    forecast: '達成予測: ¥2,950,000（残り12日でわずかに未達）' },
  { label: '粗利',   current: '¥748,000',   target: '¥1,200,000', pct: 62,
    status: '順調',     statusBg: 'bg-emerald-100', statusColor: 'text-emerald-700', color: 'bg-emerald-500',
    forecast: '達成予測: ¥1,180,000（目標達成圏内）' },
  { label: '注文数', current: '340件',      target: '550件',      pct: 62,
    status: 'やや遅れ', statusBg: 'bg-amber-100',   statusColor: 'text-amber-700',   color: 'bg-amber-400',
    forecast: '達成予測: 525件（あと25件、広告強化が必要）' },
];

// ─── AIアクションカード ───────────────────────────────────────────────────────
export interface ActionPlanCard {
  num: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  accentColor: string;
  icon: string;
  iconBg: string;
  title: string;
  body: string;
  effect: string;
  time: string;
}
export const actionPlanData: ActionPlanCard[] = [
  { num: '01', badge: '今すぐ',   badgeBg: 'bg-red-100',     badgeColor: 'text-red-700',
    accentColor: 'bg-[#1e3a8a]', icon: '🚛', iconBg: 'bg-red-50',
    title: '送料無料ライン引き下げ',
    body:  '現在 ¥7,000 → ¥5,000 に変更。カート離脱が改善し、CVRが推定 +0.8% 改善',
    effect: '+¥124,000 / 月', time: '10分' },
  { num: '02', badge: '今日中に', badgeBg: 'bg-amber-100',   badgeColor: 'text-amber-700',
    accentColor: 'bg-amber-400', icon: '📧', iconBg: 'bg-amber-50',
    title: 'リピーター向けメルマガ配信',
    body:  'LTV ¥40,960 のリピーター層に新商品案内。過去実績から推定 +¥180,000',
    effect: '+¥180,000 / 月', time: '30分' },
  { num: '03', badge: '今週中に', badgeBg: 'bg-emerald-100', badgeColor: 'text-emerald-700',
    accentColor: 'bg-emerald-500', icon: '🎁', iconBg: 'bg-emerald-50',
    title: '休眠顧客へクーポン配信',
    body:  '23%の休眠顧客に5%OFFクーポン。約15%が復帰、推定 +¥98,000',
    effect: '+¥98,000 / 月', time: '20分' },
];

// ─── 週次KPI ──────────────────────────────────────────────────────────────────
export const weeklyKpiData = {
  label: '5月12日(月) 〜 5月18日(日) 週次サマリー',
  items: [
    { label: '週間売上',  value: '¥487,200', delta: '前週比 +8.4%' },
    { label: '注文数',    value: '86件',      delta: '前週比 +12件'  },
    { label: '粗利率',    value: '41.2%',     delta: '前週比 +1.1%' },
    { label: 'ROAS',      value: '4.1倍',     delta: '前週比 +0.3'  },
  ],
};

// ─── 週次売上トレンド（8週）────────────────────────────────────────────────────
export interface WeeklyTrendItem {
  week: string;
  value: number;
  fill?: string;
}
export const weeklyTrendData: WeeklyTrendItem[] = [
  { week: '3/24', value: 320 },
  { week: '3/31', value: 350 },
  { week: '4/7',  value: 290 },
  { week: '4/14', value: 380 },
  { week: '4/21', value: 410 },
  { week: '4/28', value: 360 },
  { week: '5/5',  value: 450 },
  { week: '5/12', value: 487, fill: '#f59e0b' },
];

// ─── 商品ランキング ───────────────────────────────────────────────────────────
export interface RankingItem {
  rank: number;
  name: string;
  sales: string;
  units: string;
  change: string;
  changeColor: string;
}
export const productRankingData: RankingItem[] = [
  { rank: 1, name: 'ほうじ茶ティーバッグ',    sales: '¥98,400', units: '87件', change: '↑12', changeColor: 'text-emerald-600' },
  { rank: 2, name: '抹茶 100g（プレミアム）', sales: '¥76,200', units: '58件', change: '↓3',  changeColor: 'text-red-600' },
  { rank: 3, name: '煎茶 150g（春摘み）',     sales: '¥64,800', units: '72件', change: '↑5',  changeColor: 'text-emerald-600' },
  { rank: 4, name: 'ほうじ茶ラテキット',      sales: '¥51,200', units: '32件', change: '↑8',  changeColor: 'text-emerald-600' },
  { rank: 5, name: '玄米茶 200g',             sales: '¥38,600', units: '62件', change: 'NEW', changeColor: 'text-violet-600' },
];

// ─── 来週のアクション ─────────────────────────────────────────────────────────
export interface NextActionItem {
  icon: string;
  badge: string;
  badgeColor: 'red' | 'amber' | 'green';
  title: string;
  body: string;
}
export const nextWeekActionsData: NextActionItem[] = [
  { icon: '🚛', badge: '優先', badgeColor: 'red',   title: '抹茶100g を今週中に発注',     body: '在庫8個。週8〜10個の販売ペースで3日以内に欠品リスク' },
  { icon: '📧', badge: '推奨', badgeColor: 'amber', title: 'ほうじ茶ファン向けメルマガ',   body: '今週TOP売れ筋。関連商品のクロスセル提案で客単価向上' },
  { icon: '💸', badge: '推奨', badgeColor: 'amber', title: '低ROAS広告KWをカット',         body: '「日本茶 通販」のROAS 1.2倍。予算を上位KWに集中' },
  { icon: '📸', badge: '中期', badgeColor: 'green', title: '玄米茶の商品ページ改善',       body: 'NEW入りで注目度UP。写真・説明文をリライトで転換率改善' },
];
