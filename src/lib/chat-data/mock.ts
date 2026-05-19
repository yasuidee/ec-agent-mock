// ─── Chat history mock data ───────────────────────────────────────────────────

export interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  pinned?: boolean;
  active?: boolean;
}

export const mockChatHistory = {
  pinned: [
    { id: 'p1', title: '今日の優先タスク', preview: '✓ 在庫3件・レビュー5件...', pinned: true },
  ],
  today: [
    { id: 't1', title: '今週のセール戦略', preview: '母の日キャンペーンの提案...', active: true },
    { id: 't2', title: '在庫切れリスク', preview: '抹茶100gを優先発注すべき...' },
  ],
  yesterday: [
    { id: 'y1', title: '広告予算の最適配分', preview: 'ROAS改善には...' },
    { id: 'y2', title: 'Amazon SEO相談', preview: "キーワード『抹茶 オーガニック』..." },
  ],
  thisWeek: [
    { id: 'w1', title: '新商品の価格設定', preview: '競合分析の結果...' },
  ],
};

// ─── Snapshot cards mock data ─────────────────────────────────────────────────

export const mockSnapshotCards = [
  { emoji: '💰', label: '今日の売上',    value: '¥187,400', colorClass: 'text-blue-900' },
  { emoji: '📦', label: '在庫アラート',  value: '3商品',    colorClass: 'text-red-700' },
  { emoji: '💬', label: '未返信レビュー', value: '5件',     colorClass: 'text-amber-700' },
];

// ─── Suggestion category cards ────────────────────────────────────────────────

export const mockCategoryCards = [
  {
    emoji: '📈',
    bgClass: 'bg-blue-100',
    title: '売上を伸ばす',
    desc: 'セール戦略・新商品提案・LTV改善',
    sample: '今週のセール戦略を立てて',
    sampleColor: 'text-blue-900',
    question: '今週のセール戦略を立ててください',
  },
  {
    emoji: '📦',
    bgClass: 'bg-red-100',
    title: '在庫の悩み',
    desc: '発注タイミング・滞留品の処分',
    sample: '在庫切れリスクは？',
    sampleColor: 'text-red-700',
    question: '在庫切れリスクの高い商品を教えてください',
  },
  {
    emoji: '🎯',
    bgClass: 'bg-amber-100',
    title: '広告の最適化',
    desc: '予算配分・ROAS改善・キーワード',
    sample: '広告予算の最適配分は？',
    sampleColor: 'text-amber-700',
    question: '広告予算の最適配分を提案してください',
  },
  {
    emoji: '💬',
    bgClass: 'bg-emerald-100',
    title: '顧客対応',
    desc: 'レビュー返信・問い合わせ・FAQ',
    sample: 'レビューへの返信文を作って',
    sampleColor: 'text-emerald-700',
    question: 'レビューへの返信文を作ってください',
  },
];

// ─── Quick suggest chips ──────────────────────────────────────────────────────

export const mockQuickChips = [
  { label: '🔥 今週のセール戦略は?',  question: '今週のセール戦略を立ててください' },
  { label: '📦 在庫の追加発注',       question: '在庫の追加発注が必要な商品を教えてください' },
  { label: '📊 売上レポート',         question: '最新の売上レポートをまとめてください' },
];
