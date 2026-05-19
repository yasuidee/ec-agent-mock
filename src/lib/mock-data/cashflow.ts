// ─── 6ヶ月キャッシュフロー予測データ ─────────────────────────────────────────

export interface CashflowMonthData {
  month: string;       // 表示ラベル
  income: number;      // 入金額（円）
  expense: number;     // 出金額（円）
  balance: number;     // 残高（円）
  isForecast: boolean; // 予測データか
  isRisk: boolean;     // 赤字リスク月か
}

export const cashflowData: CashflowMonthData[] = [
  { month: '5月(今月)',  income: 4726227, expense: 2665000, balance: 10000000, isForecast: false, isRisk: false },
  { month: '6月(予測)',  income: 4915427, expense: 3300000, balance: 11615427, isForecast: true,  isRisk: false },
  { month: '7月(予測)',  income: 4537027, expense: 3000000, balance: 13152454, isForecast: true,  isRisk: false },
  { month: '8月(予測)',  income: 3969427, expense: 2800000, balance: 14321881, isForecast: true,  isRisk: false },
  { month: '9月(予測)',  income: 3591027, expense: 4085000, balance: 13827908, isForecast: true,  isRisk: true  },
  { month: '10月(予測)', income: 5199227, expense: 3100000, balance: 15927135, isForecast: true,  isRisk: false },
  { month: '11月(予測)', income: 6429027, expense: 3800000, balance: 18556162, isForecast: true,  isRisk: false },
];

export const cashflowSummary = {
  totalIncome:  33367389,
  totalExpense: 22455000,
  finalBalance: 18916683,
};

// ─── 入金スケジュール ─────────────────────────────────────────────────────────

export interface PaymentScheduleItem {
  date: string;
  confirmed: boolean;
  detail: string;
  amount: number;
}

export const paymentSchedule: PaymentScheduleItem[] = [
  { date: '2026/5/1',  confirmed: true,  detail: '売上¥187,400 - 手数料¥11,620', amount: 175780 },
  { date: '2026/5/2',  confirmed: true,  detail: '売上¥203,600 - 手数料¥12,623', amount: 190977 },
  { date: '2026/5/5',  confirmed: true,  detail: '売上¥165,800 - 手数料¥10,280', amount: 155520 },
  { date: '2026/5/7',  confirmed: true,  detail: '売上¥221,300 - 手数料¥13,720', amount: 207580 },
  { date: '2026/5/8',  confirmed: true,  detail: '売上¥198,700 - 手数料¥12,319', amount: 186381 },
  { date: '2026/5/19', confirmed: false, detail: '2026/5/16分の売上',              amount: 201670 },
  { date: '2026/5/20', confirmed: false, detail: '2026/5/17分の売上',              amount: 177282 },
  { date: '2026/5/21', confirmed: false, detail: '2026/5/18分の売上',              amount: 219492 },
];

// ─── 月次収支明細 ─────────────────────────────────────────────────────────────

export interface MonthlyStatementRow {
  month: string;
  sales: number;
  fee2: number;
  payment: number;
  monthly: number;
  actual: number;
  date: string;
  isToday: boolean;
  isForecast: boolean;
  isRisk: boolean;
}

export const monthlyStatement: MonthlyStatementRow[] = [
  { month: '2月',       sales: 3820000, fee2: 76400,  payment: 129880, monthly: 3773, actual: 3609947, date: '2026/3/3',  isToday: false, isForecast: false, isRisk: false },
  { month: '3月',       sales: 4150000, fee2: 83000,  payment: 141100, monthly: 3773, actual: 3922127, date: '2026/4/3',  isToday: false, isForecast: false, isRisk: false },
  { month: '4月',       sales: 4890000, fee2: 97800,  payment: 166260, monthly: 3773, actual: 4622167, date: '2026/5/3',  isToday: false, isForecast: false, isRisk: false },
  { month: '5月(今月)', sales: 5000000, fee2: 100000, payment: 170000, monthly: 3773, actual: 4726227, date: '2026/6/3',  isToday: true,  isForecast: false, isRisk: false },
  { month: '6月(予測)', sales: 5200000, fee2: 104000, payment: 176800, monthly: 3773, actual: 4915427, date: '2026/7/3',  isToday: false, isForecast: true,  isRisk: false },
  { month: '7月(予測)', sales: 4800000, fee2: 96000,  payment: 163200, monthly: 3773, actual: 4537027, date: '2026/8/3',  isToday: false, isForecast: true,  isRisk: false },
  { month: '8月(予測)', sales: 4200000, fee2: 84000,  payment: 142800, monthly: 3773, actual: 3969427, date: '2026/9/3',  isToday: false, isForecast: true,  isRisk: false },
  { month: '9月(予測)', sales: 3800000, fee2: 76000,  payment: 129200, monthly: 3773, actual: 3591027, date: '2026/10/3', isToday: false, isForecast: true,  isRisk: true  },
  { month: '10月(予測)',sales: 5500000, fee2: 110000, payment: 187000, monthly: 3773, actual: 5199227, date: '2026/11/3', isToday: false, isForecast: true,  isRisk: false },
  { month: '11月(予測)',sales: 6800000, fee2: 136000, payment: 231200, monthly: 3773, actual: 6429027, date: '2026/12/3', isToday: false, isForecast: true,  isRisk: false },
];
