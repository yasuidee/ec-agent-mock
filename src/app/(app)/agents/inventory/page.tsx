'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, FileText } from 'lucide-react';
import { AgentBriefCard } from '@/components/AgentBriefCard';
import { PageSkeleton } from '@/components/PageSkeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { topProducts, type Product } from '@/lib/mock-data';

// ─── Derived inventory data ───────────────────────────────────────────────────

interface InventoryRow extends Product {
  currentStock: number;
  orderQty: number;
}

const inventoryData: InventoryRow[] = [
  { ...topProducts[0], currentStock: 372, orderQty: 0   }, // ヒノキカッティングボード  62日
  { ...topProducts[1], currentStock: 12,  orderQty: 30  }, // 有田焼マグカップ          17日 ← アラート
  { ...topProducts[2], currentStock: 31,  orderQty: 0   }, // 南部鉄器急須              44日
  { ...topProducts[3], currentStock: 234, orderQty: 0   }, // 和紙ノート                91日
  { ...topProducts[4], currentStock: 60,  orderQty: 0   }, // 漆塗り箸セット            38日
];

const ALERT_PRODUCT = inventoryData[1]; // 有田焼マグカップ

// ─── Demand forecast (past 15 days actual + next 15 days forecast) ────────────

interface DemandPoint { day: string; actual: number | null; forecast: number | null; }

const demandData: DemandPoint[] = (() => {
  const base = [6, 5, 8, 7, 6, 9, 11, 6, 5, 7, 6, 8, 7, 9, 10];
  const forecast = [10, 11, 9, 12, 13, 10, 11, 12, 14, 13, 11, 12, 13, 15, 14];
  const actual: DemandPoint[] = base.map((v, i) => ({
    day: `05/${(i + 1).toString().padStart(2, '0')}`,
    actual: v,
    forecast: null,
  }));
  const pred: DemandPoint[] = forecast.map((v, i) => ({
    day: `05/${(i + 16).toString().padStart(2, '0')}`,
    actual: null,
    forecast: v,
  }));
  return [...actual, ...pred];
})();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const stockColor = (days: number) => {
  if (days >= 30) return 'text-green-600';
  if (days >= 14) return 'text-amber-600';
  return 'text-red-500 font-semibold';
};

const stockBg = (days: number) => {
  if (days >= 30) return 'bg-green-50 text-green-700';
  if (days >= 14) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryAgentPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 650); return () => clearTimeout(t); }, []);
  if (!ready) return <PageSkeleton />;

  const { toast } = useToast();

  // Alert order button
  const [alertOrdered, setAlertOrdered] = useState(false);

  // Per-row order state
  const [ordered, setOrdered] = useState<Record<string, boolean>>({});

  // PO form
  const [supplier, setSupplier] = useState('');
  const [lines, setLines] = useState([{ product: '', qty: '' }]);
  const [poDone, setPoDone] = useState(false);

  const handleAlertOrder = () => {
    setAlertOrdered(true);
    toast({ title: '発注書を作成しました', description: `${ALERT_PRODUCT.name} × 30個` });
  };

  const handleRowOrder = (id: string, name: string) => {
    setOrdered((s) => ({ ...s, [id]: true }));
    toast({ title: '発注書を作成しました', description: name });
  };

  const addLine = () => setLines((l) => [...l, { product: '', qty: '' }]);
  const removeLine = (i: number) => setLines((l) => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'product' | 'qty', value: string) =>
    setLines((l) => l.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const handleGeneratePO = () => {
    setPoDone(true);
    toast({ title: '発注書を作成しました（モック）', description: `仕入先: ${supplier || '未入力'}` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">在庫AI</h1>
        <p className="text-sm text-slate-500 mt-1">
          需要予測・発注タイミング・滞留在庫をAIが管理します
        </p>
      </div>

      <AgentBriefCard category="inventory" />

      {/* ── 2. Urgent alert ───────────────────────────────── */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">⚠️ 在庫切れアラート</p>
              <p className="text-sm text-red-700 mt-0.5">
                <span className="font-medium">{ALERT_PRODUCT.name}</span>：残{ALERT_PRODUCT.currentStock}個、推定切れまで約{ALERT_PRODUCT.stockDays}日
              </p>
            </div>
          </div>
          {alertOrdered ? (
            <span className="text-xs font-medium text-teal-700 bg-teal-100 px-3 py-1.5 rounded-md shrink-0">
              ✓ 発注済み
            </span>
          ) : (
            <button
              onClick={handleAlertOrder}
              className="bg-red-600 text-white text-xs font-medium px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors shrink-0"
            >
              今すぐ発注する
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Inventory table ────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">在庫状況</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">商品名</TableHead>
              <TableHead className="text-xs text-right">現在庫数</TableHead>
              <TableHead className="text-xs text-right">週次販売数</TableHead>
              <TableHead className="text-xs text-right">在庫残日数</TableHead>
              <TableHead className="text-xs text-right">発注推奨数</TableHead>
              <TableHead className="text-xs">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm font-medium text-slate-800">{row.name}</TableCell>
                <TableCell className="text-sm text-right text-slate-600">{row.currentStock}個</TableCell>
                <TableCell className="text-sm text-right text-slate-600">{row.weeklySales}個</TableCell>
                <TableCell className="text-right">
                  <span className={`text-sm font-medium ${stockColor(row.stockDays)}`}>
                    {row.stockDays}日
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {row.orderQty > 0 ? (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stockBg(row.stockDays)}`}>
                      {row.orderQty}個
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {ordered[row.id] ? (
                    <span className="text-xs font-medium text-teal-700">✓ 発注済み</span>
                  ) : (
                    <button
                      onClick={() => handleRowOrder(row.id, row.name)}
                      className="text-xs text-blue-900 border border-blue-900 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      発注する
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── 4. Demand forecast chart ──────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📈 今後30日の需要予測</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={demandData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              width={28}
            />
            <Tooltip
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
              formatter={(v, name) => [
                `${v}個`,
                name === 'actual' ? '過去実績' : '需要予測',
              ]}
              labelFormatter={(l) => String(l)}
            />
            <Legend
              formatter={(v) => (v === 'actual' ? '過去実績' : '需要予測')}
              iconSize={12}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#1e3a8a"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── 5. PO form ────────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📋 発注書を作成する</h2>

        <div className="space-y-4">
          {/* Supplier */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">仕入先名</label>
            <Input
              placeholder="例: 岩手南部鉄器工房"
              value={supplier}
              onChange={(e) => { setSupplier(e.target.value); setPoDone(false); }}
              className="max-w-sm"
            />
          </div>

          {/* Line items */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-600">商品・数量</label>
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="商品名"
                  value={line.product}
                  onChange={(e) => { updateLine(i, 'product', e.target.value); setPoDone(false); }}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="数量"
                  value={line.qty}
                  onChange={(e) => { updateLine(i, 'qty', e.target.value); setPoDone(false); }}
                  className="w-24"
                />
                {lines.length > 1 && (
                  <button
                    onClick={() => removeLine(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addLine}
              className="flex items-center gap-1.5 text-xs text-blue-900 hover:text-blue-700 transition-colors w-fit"
            >
              <Plus size={13} />
              商品を追加
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePO}
              className="flex items-center gap-2 bg-blue-900 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              <FileText size={15} />
              発注書PDFを生成する
            </button>
            {poDone && (
              <span className="text-sm text-teal-700 font-medium animate-in fade-in duration-200">
                ✓ 発注書を作成しました（モック）
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
