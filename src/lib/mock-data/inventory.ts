// ─────────────────────────────────────────────────────────────
// 在庫AI 共有型定義 + モックデータ
// ─────────────────────────────────────────────────────────────

export type UrgencyLevel  = 'critical' | 'urgent' | 'warning' | 'normal';
export type SlowMoveLevel = 'danger'   | 'warning' | 'normal';

// ─── 既存 page.tsx の useMemo 出力に合わせた型 ─────────────────
export interface StockForecast {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  weeklyVelocity: number;
  leadTimeDays: number;
  safetyStockDays: number;
  stockDays: number;
  orderDeadlineDays: number;
  urgency: UrgencyLevel;
  reorderPoint: number;
  price: number;
  unitCost: number;
}

export interface OrderRecommendation {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  weeklyVelocity: number;
  leadTimeDays: number;
  safetyStockDays: number;
  recommendedQty: number;
  urgency: UrgencyLevel;
  unitCost: number;
  price: number;
}

export interface SlowMoveItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  turnoverDays: number;
  stockValue: number;
  level: SlowMoveLevel;
  suggestion: string;
  weeklyVelocity: number;
  unitCost: number;
}

// ─── UI ヘルパー ────────────────────────────────────────────

export function urgencyBadgeClass(u: UrgencyLevel) {
  if (u === 'critical') return 'bg-red-100 text-red-700';
  if (u === 'urgent')   return 'bg-orange-100 text-orange-700';
  if (u === 'warning')  return 'bg-yellow-100 text-yellow-700';
  return 'bg-emerald-100 text-emerald-700';
}

export function urgencyLabel(u: UrgencyLevel) {
  if (u === 'critical') return '危機的';
  if (u === 'urgent')   return '緊急';
  if (u === 'warning')  return '注意';
  return '正常';
}

export function slowMoveBadgeClass(l: SlowMoveLevel) {
  if (l === 'danger')  return 'bg-red-100 text-red-700';
  if (l === 'warning') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

export function slowMoveLabel(l: SlowMoveLevel) {
  if (l === 'danger')  return '危険';
  if (l === 'warning') return '注意';
  return '正常';
}

export function slowMoveBarColor(l: SlowMoveLevel) {
  if (l === 'danger')  return '#ef4444';
  if (l === 'warning') return '#f59e0b';
  return '#10b981';
}
