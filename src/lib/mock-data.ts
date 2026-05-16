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
