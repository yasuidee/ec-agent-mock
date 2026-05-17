// ============================================================
// 型定義
// ============================================================

export type BriefAction = {
  id: string;
  category: "build" | "marketing" | "inventory" | "analytics";
  title: string;
  description: string;
  expectedImpact: string;
  reasoning: string;
  urgency: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected";
};

export type KpiSummary = {
  todayRevenue: number;
  todayRevenueDelta: number; // 前日比 %
  todayOrders: number;
  todayOrdersDelta: number;
  cvr: number; // %
  cvrDelta: number;
  roas: number;
  roasDelta: number;
  grossMarginRate: number; // %
  grossMarginRateDelta: number;
};

export type DailySales = {
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  weeklySales: number;
  revenue: number;
  marginRate: number; // %
  stockDays: number;
  price: number;  // 販売価格
  cost: number;   // 商品原価
  // 在庫管理拡張フィールド
  currentStock?: number;       // 現在在庫数
  weeklyVelocity?: number;     // 週間販売数
  leadTimeDays?: number;       // 発注リードタイム（日）
  safetyStockDays?: number;    // 安全在庫日数
  unitCost?: number;           // 仕入単価
  lastOrderDate?: string;      // 最終発注日 YYYY-MM-DD
  turnoverDays?: number;       // 在庫回転日数
};

export type TrafficSource = {
  source: string;
  sessions: number;
  percentage: number;
};

// ============================================================
// 今朝のブリーフアクション
// ============================================================

export const briefActions: BriefAction[] = [
  {
    id: "action-001",
    category: "marketing",
    title: "ヒノキカッティングボードの広告予算を +¥10,000 に増額",
    description:
      "Google ショッピング広告のヒノキカッティングボードキャンペーンの日予算を現行 ¥5,000 から ¥15,000 に引き上げる。",
    expectedImpact: "週次売上 +¥38,000〜¥50,000（ROAS 3.8 倍基準）",
    reasoning:
      "直近7日のROASが3.8倍に上昇。在庫も2ヶ月分あり、機会損失リスクが高い",
    urgency: "high",
    status: "pending",
  },
  {
    id: "action-002",
    category: "inventory",
    title: "有田焼マグカップを 30 個追加発注",
    description:
      "窯元への発注フォームから有田焼マグカップ（SKU: ARZ-MUG-001）を 30 個発注し、リードタイム 3 週間での納品を依頼する。",
    expectedImpact: "在庫切れ回避・販売機会の確保（週次 7 個ペース維持）",
    reasoning:
      "在庫残り12個、週次販売7個、リードタイム3週間。在庫切れリスク高",
    urgency: "high",
    status: "pending",
  },
  {
    id: "action-003",
    category: "build",
    title: "南部鉄器急須の商品ページを英語化",
    description:
      "南部鉄器急須（SKU: NMK-TEA-002）の商品説明・スペック・使い方ガイドを英語で追記し、多言語切り替えに対応させる。",
    expectedImpact: "海外購入率 +15〜20% / 海外売上 月次 +¥80,000 見込み",
    reasoning:
      "海外からのアクセスが先月比+40%。海外決済の問い合わせも増加",
    urgency: "medium",
    status: "pending",
  },
];

// ============================================================
// KPI サマリー（2026-05-15 時点）
// ============================================================

export const kpiSummary: KpiSummary = {
  todayRevenue: 187_400,
  todayRevenueDelta: 12.3,
  todayOrders: 34,
  todayOrdersDelta: 6.3,
  cvr: 3.2,
  cvrDelta: 0.4,
  roas: 3.8,
  roasDelta: 18.8,
  grossMarginRate: 42.5,
  grossMarginRateDelta: -1.2,
};

// ============================================================
// 売上推移（過去 30 日分: 2026-04-16 〜 2026-05-15）
// ============================================================

export const dailySales: DailySales[] = [
  // 4月後半 — 月中はやや落ち着く
  { date: "2026-04-16", revenue: 98_200, orders: 18 },
  { date: "2026-04-17", revenue: 112_600, orders: 21 },
  { date: "2026-04-18", revenue: 148_800, orders: 27 }, // 土
  { date: "2026-04-19", revenue: 163_400, orders: 30 }, // 日
  { date: "2026-04-20", revenue: 89_300, orders: 16 },
  { date: "2026-04-21", revenue: 95_700, orders: 18 },
  { date: "2026-04-22", revenue: 104_100, orders: 19 },
  { date: "2026-04-23", revenue: 107_500, orders: 20 },
  { date: "2026-04-24", revenue: 99_600, orders: 18 },
  { date: "2026-04-25", revenue: 152_300, orders: 28 }, // 土
  { date: "2026-04-26", revenue: 168_900, orders: 31 }, // 日
  { date: "2026-04-27", revenue: 93_400, orders: 17 },
  { date: "2026-04-28", revenue: 101_800, orders: 19 },
  { date: "2026-04-29", revenue: 137_200, orders: 25 }, // みどりの日
  { date: "2026-04-30", revenue: 143_500, orders: 26 }, // 昭和の日振替
  // 5月前半 — GW後は反動減、月初は低め
  { date: "2026-05-01", revenue: 78_400, orders: 14 }, // GW明け
  { date: "2026-05-02", revenue: 82_100, orders: 15 },
  { date: "2026-05-03", revenue: 155_600, orders: 28 }, // 憲法記念日
  { date: "2026-05-04", revenue: 172_300, orders: 32 }, // みどりの日
  { date: "2026-05-05", revenue: 186_700, orders: 34 }, // こどもの日
  { date: "2026-05-06", revenue: 76_900, orders: 14 }, // GW明け
  { date: "2026-05-07", revenue: 84_300, orders: 16 },
  { date: "2026-05-08", revenue: 96_800, orders: 18 },
  { date: "2026-05-09", revenue: 145_200, orders: 27 }, // 土
  { date: "2026-05-10", revenue: 158_900, orders: 29 }, // 日
  { date: "2026-05-11", revenue: 102_400, orders: 19 },
  { date: "2026-05-12", revenue: 108_700, orders: 20 },
  { date: "2026-05-13", revenue: 119_300, orders: 22 },
  { date: "2026-05-14", revenue: 166_500, orders: 31 }, // 木曜・好調
  { date: "2026-05-15", revenue: 187_400, orders: 34 }, // 本日
];

// ============================================================
// 商品ランキング TOP 5
// ============================================================

export const topProducts: Product[] = [
  {
    id: "prod-001",
    name: "ヒノキカッティングボード",
    sku: "HNK-CUT-001",
    weeklySales: 42,
    revenue: 588_000,
    marginRate: 48,
    stockDays: 62,
    price: 8_800,
    cost: 2_800,
    currentStock: 85,
    weeklyVelocity: 21,
    leadTimeDays: 14,
    safetyStockDays: 21,
    unitCost: 2_800,
    lastOrderDate: "2026-04-28",
    turnoverDays: 28,
  },
  {
    id: "prod-002",
    name: "有田焼マグカップ",
    sku: "ARZ-MUG-001",
    weeklySales: 7,
    revenue: 196_000,
    marginRate: 39,
    stockDays: 17,
    price: 4_400,
    cost: 1_200,
    currentStock: 12,
    weeklyVelocity: 7,
    leadTimeDays: 21,
    safetyStockDays: 14,
    unitCost: 1_200,
    lastOrderDate: "2026-03-15",
    turnoverDays: 12,
  },
  {
    id: "prod-003",
    name: "南部鉄器急須",
    sku: "NMK-TEA-002",
    weeklySales: 5,
    revenue: 175_000,
    marginRate: 52,
    stockDays: 44,
    price: 12_800,
    cost: 4_200,
    currentStock: 34,
    weeklyVelocity: 5,
    leadTimeDays: 30,
    safetyStockDays: 21,
    unitCost: 4_200,
    lastOrderDate: "2026-04-10",
    turnoverDays: 48,
  },
  {
    id: "prod-004",
    name: "和紙ノート",
    sku: "WSH-NTE-003",
    weeklySales: 18,
    revenue: 108_000,
    marginRate: 55,
    stockDays: 91,
    price: 1_980,
    cost: 480,
    currentStock: 156,
    weeklyVelocity: 11,
    leadTimeDays: 7,
    safetyStockDays: 14,
    unitCost: 480,
    lastOrderDate: "2026-05-01",
    turnoverDays: 98,
  },
  {
    id: "prod-005",
    name: "漆塗り箸セット",
    sku: "URU-HST-004",
    weeklySales: 11,
    revenue: 99_000,
    marginRate: 43,
    stockDays: 38,
    price: 6_600,
    cost: 1_800,
    currentStock: 8,
    weeklyVelocity: 3,
    leadTimeDays: 45,
    safetyStockDays: 30,
    unitCost: 1_800,
    lastOrderDate: "2026-02-20",
    turnoverDays: 18,
  },
];

// ============================================================
// キャッシュフロー管理
// ============================================================

// Shopify手数料設定
export type ShopifyFeeConfig = {
  planName: string;           // プラン名
  monthlyFee: number;         // 月額料金
  transactionFeeRate: number; // 取引手数料率(%)
  paymentFeeRate: number;     // 決済手数料率(%)
  payoutDelayDays: number;    // 入金遅延日数
};

export const shopifyFeeConfig: ShopifyFeeConfig = {
  planName: 'Shopify(ベーシック)',
  monthlyFee: 3773,
  transactionFeeRate: 2.0,
  paymentFeeRate: 3.4,
  payoutDelayDays: 3,
};

// 月次キャッシュフローデータ
export type MonthlyCashflow = {
  month: string;             // YYYY-MM
  label: string;             // 表示用ラベル(例: 5月)

  // 入金
  shopifyRevenue: number;    // Shopify売上
  shopifyFee: number;        // Shopify手数料(取引+決済)
  shopifyMonthlyFee: number; // 月額費用
  netIncome: number;         // 実際の入金額(売上-手数料)
  payoutDate: string;        // 実際の入金日(YYYY-MM-DD)

  // 出金(翌月末払い)
  inventoryCost: number;     // 仕入高(前月分)
  adSpend: number;           // 広告費(前月分)
  otherFixed: number;        // その他固定費
  totalOutflow: number;      // 出金合計

  // 収支
  netCashflow: number;       // 入金-出金
  cumulativeCash: number;    // 累計キャッシュ残高
};

export const monthlyCashflows: MonthlyCashflow[] = [
  {
    month: '2026-02', label: '2月',
    shopifyRevenue: 3820000,
    shopifyFee: 206280,
    shopifyMonthlyFee: 3773,
    netIncome: 3609947,
    payoutDate: '2026-03-03',
    inventoryCost: 1490000,
    adSpend: 380000,
    otherFixed: 85000,
    totalOutflow: 1955000,
    netCashflow: 1654947,
    cumulativeCash: 4200000,
  },
  {
    month: '2026-03', label: '3月',
    shopifyRevenue: 4150000,
    shopifyFee: 224100,
    shopifyMonthlyFee: 3773,
    netIncome: 3922127,
    payoutDate: '2026-04-03',
    inventoryCost: 1650000,
    adSpend: 420000,
    otherFixed: 85000,
    totalOutflow: 2155000,
    netCashflow: 1767127,
    cumulativeCash: 5967127,
  },
  {
    month: '2026-04', label: '4月',
    shopifyRevenue: 4890000,
    shopifyFee: 264060,
    shopifyMonthlyFee: 3773,
    netIncome: 4622167,
    payoutDate: '2026-05-03',
    inventoryCost: 1980000,
    adSpend: 520000,
    otherFixed: 85000,
    totalOutflow: 2585000,
    netCashflow: 2037167,
    cumulativeCash: 8004294,
  },
  {
    month: '2026-05', label: '5月(今月)',
    shopifyRevenue: 5000000,
    shopifyFee: 270000,
    shopifyMonthlyFee: 3773,
    netIncome: 4726227,
    payoutDate: '2026-06-03',
    inventoryCost: 2100000,
    adSpend: 480000,
    otherFixed: 85000,
    totalOutflow: 2665000,
    netCashflow: 2061227,
    cumulativeCash: 10065521,
  },
  {
    month: '2026-06', label: '6月(予測)',
    shopifyRevenue: 5200000,
    shopifyFee: 280800,
    shopifyMonthlyFee: 3773,
    netIncome: 4915427,
    payoutDate: '2026-07-03',
    inventoryCost: 2200000,
    adSpend: 500000,
    otherFixed: 85000,
    totalOutflow: 2785000,
    netCashflow: 2130427,
    cumulativeCash: 12195948,
  },
  {
    month: '2026-07', label: '7月(予測)',
    shopifyRevenue: 4800000,
    shopifyFee: 259200,
    shopifyMonthlyFee: 3773,
    netIncome: 4537027,
    payoutDate: '2026-08-03',
    inventoryCost: 2500000,
    adSpend: 600000,
    otherFixed: 85000,
    totalOutflow: 3185000,
    netCashflow: 1352027,
    cumulativeCash: 13547975,
  },
  {
    month: '2026-08', label: '8月(予測)',
    shopifyRevenue: 4200000,
    shopifyFee: 226800,
    shopifyMonthlyFee: 3773,
    netIncome: 3969427,
    payoutDate: '2026-09-03',
    inventoryCost: 2800000,
    adSpend: 700000,
    otherFixed: 85000,
    totalOutflow: 3585000,
    netCashflow: 384427,
    cumulativeCash: 13932402,
  },
  {
    month: '2026-09', label: '9月(予測)',
    shopifyRevenue: 3800000,
    shopifyFee: 205200,
    shopifyMonthlyFee: 3773,
    netIncome: 3591027,
    payoutDate: '2026-10-03',
    inventoryCost: 3200000,
    adSpend: 800000,
    otherFixed: 85000,
    totalOutflow: 4085000,
    netCashflow: -493973,
    cumulativeCash: 13438429,
  },
  {
    month: '2026-10', label: '10月(予測)',
    shopifyRevenue: 5500000,
    shopifyFee: 297000,
    shopifyMonthlyFee: 3773,
    netIncome: 5199227,
    payoutDate: '2026-11-03',
    inventoryCost: 2000000,
    adSpend: 500000,
    otherFixed: 85000,
    totalOutflow: 2585000,
    netCashflow: 2614227,
    cumulativeCash: 16052656,
  },
  {
    month: '2026-11', label: '11月(予測)',
    shopifyRevenue: 6800000,
    shopifyFee: 367200,
    shopifyMonthlyFee: 3773,
    netIncome: 6429027,
    payoutDate: '2026-12-03',
    inventoryCost: 2800000,
    adSpend: 680000,
    otherFixed: 85000,
    totalOutflow: 3565000,
    netCashflow: 2864027,
    cumulativeCash: 18916683,
  },
];

// 今月の入金スケジュール(日次)
export type DailyPayout = {
  date: string;         // YYYY-MM-DD
  orderDate: string;    // 対応する注文日
  amount: number;       // 入金額
  fee: number;          // 差し引き手数料
  grossAmount: number;  // 売上総額
  status: 'completed' | 'scheduled';
};

export const dailyPayouts: DailyPayout[] = [
  // 過去分(completed)
  {
    date: '2026-05-01', orderDate: '2026-04-28',
    grossAmount: 187400, fee: 11620, amount: 175780, status: 'completed',
  },
  {
    date: '2026-05-02', orderDate: '2026-04-29',
    grossAmount: 203600, fee: 12623, amount: 190977, status: 'completed',
  },
  {
    date: '2026-05-05', orderDate: '2026-04-30',
    grossAmount: 165800, fee: 10280, amount: 155520, status: 'completed',
  },
  {
    date: '2026-05-07', orderDate: '2026-05-02',
    grossAmount: 221300, fee: 13720, amount: 207580, status: 'completed',
  },
  {
    date: '2026-05-08', orderDate: '2026-05-05',
    grossAmount: 198700, fee: 12319, amount: 186381, status: 'completed',
  },
  // 予定分(scheduled)
  {
    date: '2026-05-19', orderDate: '2026-05-16',
    grossAmount: 215000, fee: 13330, amount: 201670, status: 'scheduled',
  },
  {
    date: '2026-05-20', orderDate: '2026-05-17',
    grossAmount: 189000, fee: 11718, amount: 177282, status: 'scheduled',
  },
  {
    date: '2026-05-21', orderDate: '2026-05-18',
    grossAmount: 234000, fee: 14508, amount: 219492, status: 'scheduled',
  },
  {
    date: '2026-05-22', orderDate: '2026-05-19',
    grossAmount: 198000, fee: 12276, amount: 185724, status: 'scheduled',
  },
  {
    date: '2026-05-27', orderDate: '2026-05-24',
    grossAmount: 256000, fee: 15872, amount: 240128, status: 'scheduled',
  },
  {
    date: '2026-05-28', orderDate: '2026-05-25',
    grossAmount: 223000, fee: 13826, amount: 209174, status: 'scheduled',
  },
  {
    date: '2026-05-29', orderDate: '2026-05-26',
    grossAmount: 187000, fee: 11594, amount: 175406, status: 'scheduled',
  },
];

// ============================================================
// アクセス流入元
// ============================================================

export const trafficSources: TrafficSource[] = [
  { source: "Organic Search", sessions: 3_840, percentage: 38.4 },
  { source: "Paid Search", sessions: 2_710, percentage: 27.1 },
  { source: "Social", sessions: 1_620, percentage: 16.2 },
  { source: "Direct", sessions: 1_280, percentage: 12.8 },
  { source: "Email", sessions: 550, percentage: 5.5 },
];

// ─── Customer support data ──────────────────────────────────────────────────

export type Review = {
  id: string
  platform: 'shopify' | 'amazon' | 'rakuten' | 'google'
  productName: string
  rating: number
  title: string
  body: string
  authorName: string
  date: string
  status: 'unreplied' | 'replied' | 'ignored'
  reply?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  tags: string[]
}

export const reviews: Review[] = [
  {
    id: 'r001', platform: 'shopify', productName: 'ヒノキカッティングボード', rating: 5,
    title: '職人の技が伝わる一品',
    body: 'ヒノキの香りが素晴らしく、使うたびに癒されます。厚みがあってしっかりしており、長く使えそうです。プレゼントにも最適でした。',
    authorName: '田中 美咲', date: '2026-05-10', status: 'unreplied',
    sentiment: 'positive', tags: ['品質', '香り', 'プレゼント']
  },
  {
    id: 'r002', platform: 'amazon', productName: '有田焼マグカップ', rating: 2,
    title: '説明と違う',
    body: '商品ページでは電子レンジ対応と書いてありましたが、届いた商品には電子レンジ不可のシールが貼ってありました。返品対応を求めます。',
    authorName: 'K.Yamamoto', date: '2026-05-12', status: 'unreplied',
    sentiment: 'negative', tags: ['ページ説明', '品質', '返品']
  },
  {
    id: 'r003', platform: 'shopify', productName: '南部鉄器急須', rating: 4,
    title: '重厚感があって良いが梱包が心配',
    body: '急須自体は非常に良い品物です。ただ、梱包がやや簡易的で、配送中に傷がつきそうで心配でした。商品は問題なかったですが改善を期待します。',
    authorName: '佐藤 健一', date: '2026-05-11', status: 'unreplied',
    sentiment: 'neutral', tags: ['品質', '梱包', '配送']
  },
  {
    id: 'r004', platform: 'google', productName: '漆塗り箸セット', rating: 5,
    title: '贈り物に大変喜ばれました',
    body: '両親の結婚記念日に贈りました。箱も立派で、開けた瞬間に歓声が上がりました。職人さんの丁寧な仕事が伝わります。また利用します。',
    authorName: '渡辺 由香', date: '2026-05-09', status: 'replied',
    reply: 'ありがとうございます。大切な方へのプレゼントにお選びいただき、誠に光栄です。',
    sentiment: 'positive', tags: ['プレゼント', '梱包', '品質']
  },
  {
    id: 'r005', platform: 'rakuten', productName: '和紙ノート', rating: 1,
    title: '配送が遅すぎる',
    body: '注文から10日経っても届かず、問い合わせしてもなかなか返信がなかった。商品は良かったですが、対応に不満です。',
    authorName: 'masa_rakuten', date: '2026-05-08', status: 'replied',
    reply: 'この度はご不便をおかけし、誠に申し訳ございませんでした。',
    sentiment: 'negative', tags: ['配送', '顧客対応']
  },
  {
    id: 'r006', platform: 'shopify', productName: 'ヒノキカッティングボード', rating: 3,
    title: '思ったより小さかった',
    body: 'サイズ表記はありましたが、実物を見てイメージと違いました。写真だともっと大きく見えます。品質自体は良いです。',
    authorName: '木村 翔', date: '2026-05-13', status: 'unreplied',
    sentiment: 'neutral', tags: ['ページ説明', 'サイズ感']
  },
  {
    id: 'r007', platform: 'amazon', productName: '南部鉄器急須', rating: 5,
    title: '本格的な鉄瓶でお茶が美味しくなった',
    body: '毎朝のお茶の時間が特別になりました。鉄分も補給できると聞いて購入しましたが、お茶の味が丸くなった気がします。一生ものの買い物をした感覚です。',
    authorName: 'tea_lover_jp', date: '2026-05-07', status: 'unreplied',
    sentiment: 'positive', tags: ['品質', '健康', 'リピート意向']
  },
  {
    id: 'r008', platform: 'shopify', productName: '有田焼マグカップ', rating: 2,
    title: '割れて届いた',
    body: '箱を開けたら取っ手部分が割れていました。すぐに連絡しましたが、対応に数日かかりました。交換品は問題なかったです。',
    authorName: '高橋 直子', date: '2026-05-06', status: 'replied',
    reply: 'この度は大変申し訳ございませんでした。梱包を改善いたします。',
    sentiment: 'negative', tags: ['梱包', '破損', '顧客対応']
  },
]

export type Inquiry = {
  id: string
  platform: 'email' | 'shopify' | 'line' | 'instagram'
  productName?: string
  subject: string
  body: string
  customerName: string
  date: string
  status: 'unreplied' | 'replied' | 'pending'
  reply?: string
  category: 'shipping' | 'product' | 'return' | 'other'
  priority: 'high' | 'medium' | 'low'
}

export const inquiries: Inquiry[] = [
  {
    id: 'i001', platform: 'email', productName: '有田焼マグカップ',
    subject: '注文した商品がまだ届きません',
    body: '5月10日に注文しましたが、まだ届いていません。追跡番号を教えていただけますか？注文番号は#10234です。',
    customerName: '山田 花子', date: '2026-05-15', status: 'unreplied',
    category: 'shipping', priority: 'high'
  },
  {
    id: 'i002', platform: 'shopify', productName: 'ヒノキカッティングボード',
    subject: 'サイズのカスタマイズは可能ですか？',
    body: '贈り物用に名前を入れることはできますか？また、Lサイズはありますか？',
    customerName: '鈴木 太郎', date: '2026-05-14', status: 'unreplied',
    category: 'product', priority: 'medium'
  },
  {
    id: 'i003', platform: 'line',
    subject: '返品したいのですが',
    body: 'イメージと違ったので返品したいです。まだ未使用です。返品方法を教えてください。',
    customerName: 'LINE_user_293', date: '2026-05-13', status: 'unreplied',
    category: 'return', priority: 'high'
  },
  {
    id: 'i004', platform: 'instagram', productName: '漆塗り箸セット',
    subject: '海外への発送は対応していますか？',
    body: 'アメリカに住む友人へのプレゼントに購入したいのですが、海外発送は可能ですか？',
    customerName: 'yuki_overseas', date: '2026-05-12', status: 'replied',
    reply: '海外発送に対応しております。詳細はメールにてご案内いたします。',
    category: 'shipping', priority: 'medium'
  },
  {
    id: 'i005', platform: 'email', productName: '南部鉄器急須',
    subject: 'お手入れ方法について',
    body: '購入後のお手入れ方法がわかりません。錆びやすいと聞いたのですが、どうすれば長持ちしますか？',
    customerName: '中村 恵子', date: '2026-05-11', status: 'unreplied',
    category: 'product', priority: 'low'
  },
]
