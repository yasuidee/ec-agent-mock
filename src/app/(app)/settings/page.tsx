'use client';

import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const CSV_FORMATS: Record<string, string> = {
  shopify_products: 'CSVカラム: 商品ID, 商品名, 価格, 在庫数, SKU',
  shopify_orders: 'CSVカラム: 注文ID, 日付, 金額, ステータス',
  meta_ads: 'CSVカラム: キャンペーン名, 費用, インプレッション, クリック数, 購入数, ROAS',
  google_ads: 'CSVカラム: キャンペーン名, 費用, クリック数, CVR(%), 注文数, ROAS',
};

const CSV_TYPE_LABELS: Record<string, string> = {
  shopify_products: 'Shopify商品データ',
  shopify_orders: 'Shopify注文データ',
  meta_ads: 'Meta広告データ',
  google_ads: 'Google広告データ',
};

interface ImportedData {
  type: string;
  rowCount: number;
  importedAt: string;
  preview: string[][];
}

export default function SettingsPage() {
  const { toast } = useToast();

  // Shopify tab
  const [connectionLoading, setConnectionLoading] = useState(false);

  // CSV tab
  const [selectedType, setSelectedType] = useState('shopify_products');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportedData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('importedData');
      if (stored) setImportHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handleConnectionTest = () => {
    setConnectionLoading(true);
    setTimeout(() => {
      setConnectionLoading(false);
      toast({
        title: 'Shopify APIキーが設定されていません。環境変数を設定してください。',
        variant: 'destructive',
      });
    }, 2000);
  };

  const handleSyncNow = () => {
    toast({
      title: 'Shopifyが未接続のため同期できません',
      variant: 'destructive',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim()).slice(0, 6);
      const parsed = lines.map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
      setPreviewData(parsed);
    };
    reader.readAsText(f);
  };

  const handleImport = () => {
    if (!previewData.length) return;
    setIsImporting(true);
    setTimeout(() => {
      const data: ImportedData = {
        type: selectedType,
        rowCount: previewData.length - 1,
        importedAt: new Date().toISOString(),
        preview: previewData.slice(0, 5),
      };
      localStorage.setItem('importedData', JSON.stringify(data));
      setImportHistory(data);
      setIsImporting(false);
      toast({ title: `✅ ${data.rowCount}件のデータをインポートしました` });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="ストア設定"
        description="データソースの接続とインポート設定"
        backLink={false}
      />

      <Tabs defaultValue="shopify">
        <TabsList>
          <TabsTrigger value="shopify">Shopify連携</TabsTrigger>
          <TabsTrigger value="ads">広告アカウント連携</TabsTrigger>
          <TabsTrigger value="csv">CSVインポート</TabsTrigger>
        </TabsList>

        {/* ══ Shopify連携 ══ */}
        <TabsContent value="shopify">
          <div className="space-y-6 mt-2">
            {/* Connection status */}
            <div className="bg-white border rounded-xl p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="font-medium text-amber-700">⚠️ Shopifyが未接続です</p>
                <div className="mt-3 space-y-1 text-sm text-amber-600">
                  <p>以下の手順でShopifyと連携できます:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Shopify Partnersでカスタムアプリを作成</li>
                    <li>Admin API権限を設定（read_products, read_orders, read_inventory, write_inventory）</li>
                    <li>アクセストークンを取得</li>
                    <li>Vercelの環境変数に設定してリデプロイ</li>
                  </ol>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleConnectionTest}
                  disabled={connectionLoading}
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {connectionLoading ? (
                    <><span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />確認中...</>
                  ) : '接続テストをする'}
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  ※この機能は未実装です。実際の連携にはShopify APIキーの設定が必要です。
                </p>
              </div>
            </div>

            {/* Sync settings */}
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">データ同期設定</h2>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700">現在: モックデータを使用中</p>
                <p className="text-xs text-slate-500 mt-1">実際のShopifyデータを使うには連携が必要です</p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input type="checkbox" disabled className="w-10 h-5 rounded-full appearance-none bg-slate-200 cursor-not-allowed" />
                <span className="text-sm text-slate-500">毎日午前6時に自動同期</span>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleSyncNow}
                  className="border px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  今すぐ同期する
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  ※この機能は未実装です。
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ══ 広告アカウント連携 ══ */}
        <TabsContent value="ads">
          <div className="space-y-4 mt-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="font-medium text-blue-700">📋 広告データの連携について</p>
              <p className="text-sm text-blue-600 mt-2">
                Meta・Google広告のAPIは審査が必要なため、現在はCSVインポートでデータを取り込めます。自動連携機能は今後追加予定です。
              </p>
            </div>

            {/* Meta */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">Meta（Facebook/Instagram）広告</h2>
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">未接続</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Meta Marketing APIと連携すると、広告データを自動で取り込めます。</p>
              <div className="mt-4">
                <button
                  disabled
                  className="border w-full py-2 rounded-lg text-slate-400 cursor-not-allowed text-sm"
                >
                  Meta広告と連携する
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  ※この機能は未実装です。Meta Marketing APIの審査が必要です。
                </p>
              </div>
            </div>

            {/* Google */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">Google広告</h2>
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">未接続</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Google Ads APIと連携すると、広告データを自動で取り込めます。</p>
              <div className="mt-4">
                <button
                  disabled
                  className="border w-full py-2 rounded-lg text-slate-400 cursor-not-allowed text-sm"
                >
                  Google広告と連携する
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  ※この機能は未実装です。Google Ads APIの審査が必要です。
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ══ CSVインポート ══ */}
        <TabsContent value="csv">
          <div className="space-y-4 mt-2">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-medium text-green-700">✅ CSVインポートは現在利用可能です</p>
              <p className="text-sm text-slate-600 mt-1">各管理画面からCSVをエクスポートしてアップロードするとデータを取り込めます。</p>
            </div>

            {/* Data type select */}
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">インポートするデータの種類</h2>
              <select
                value={selectedType}
                onChange={e => { setSelectedType(e.target.value); setFile(null); setPreviewData([]); }}
                className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              >
                <option value="shopify_products">Shopify商品データ</option>
                <option value="shopify_orders">Shopify注文データ</option>
                <option value="meta_ads">Meta広告データ</option>
                <option value="google_ads">Google広告データ</option>
              </select>
              <div className="bg-slate-50 rounded-lg p-3 mt-3">
                <p className="text-xs text-slate-600">{CSV_FORMATS[selectedType]}</p>
              </div>
            </div>

            {/* Upload area */}
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">ファイルをアップロード</h2>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-900 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud size={40} className="mx-auto text-slate-400" />
                <p className="text-slate-600 font-medium mt-3">CSVファイルをドラッグ&ドロップ</p>
                <p className="text-slate-400 text-sm mt-1">またはクリックしてファイルを選択</p>
                <p className="text-xs text-slate-400 mt-1">対応形式: .csv</p>
              </div>

              {previewData.length > 0 && file && (
                <div className="mt-4 bg-white border rounded-xl p-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">プレビュー（{file.name}）</p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewData[0]?.map((col, i) => (
                            <TableHead key={i} className="text-xs">{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.slice(1, 6).map((row, i) => (
                          <TableRow key={i}>
                            {row.map((cell, j) => (
                              <TableCell key={j} className="text-xs">{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {previewData.length > 6 && (
                    <p className="text-xs text-slate-400 mt-2">...他{previewData.length - 6}件のデータ</p>
                  )}
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="mt-4 bg-blue-900 text-white w-full py-3 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <><span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />インポート中...</>
                    ) : `${previewData.length - 1}件のデータをインポートする`}
                  </button>
                </div>
              )}
            </div>

            {/* Import history */}
            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">インポート履歴</h2>
              {importHistory ? (
                <div className="border rounded-lg p-4">
                  <p className="font-medium text-sm text-slate-800">
                    {CSV_TYPE_LABELS[importHistory.type] ?? importHistory.type} - {importHistory.rowCount}件
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(importHistory.importedAt).toLocaleString('ja-JP')}にインポート
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">まだインポート履歴がありません</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
