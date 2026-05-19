'use client';

interface InquiryFilterBarProps {
  filterCategory:      string;
  setFilterCategory:   (v: string) => void;
  filterPriority:      string;
  setFilterPriority:   (v: string) => void;
  filterInqPlatform:   string;
  setFilterInqPlatform:(v: string) => void;
  filterInqStatus:     string;
  setFilterInqStatus:  (v: string) => void;
}

const selectClass =
  'border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 ' +
  'bg-slate-50 focus:border-[#1e3a8a] focus:outline-none';

export function InquiryFilterBar({
  filterCategory,      setFilterCategory,
  filterPriority,      setFilterPriority,
  filterInqPlatform,   setFilterInqPlatform,
  filterInqStatus,     setFilterInqStatus,
}: InquiryFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5
                    flex items-center gap-2 flex-wrap">
      <select value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={selectClass}>
        <option value="all">全カテゴリ</option>
        <option value="shipping">配送</option>
        <option value="product">商品</option>
        <option value="return">返品・交換</option>
        <option value="other">その他</option>
      </select>

      <select value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={selectClass}>
        <option value="all">全優先度</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>

      <select value={filterInqPlatform}
              onChange={(e) => setFilterInqPlatform(e.target.value)}
              className={selectClass}>
        <option value="all">全プラットフォーム</option>
        <option value="email">メール</option>
        <option value="shopify">Shopify</option>
        <option value="line">LINE</option>
        <option value="instagram">Instagram</option>
      </select>

      <select value={filterInqStatus}
              onChange={(e) => setFilterInqStatus(e.target.value)}
              className={selectClass}>
        <option value="all">全ステータス</option>
        <option value="unreplied">未返信</option>
        <option value="replied">返信済み</option>
      </select>
    </div>
  );
}
