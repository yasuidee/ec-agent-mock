'use client';

interface ReviewFilterBarProps {
  filterPlatform:      string;
  setFilterPlatform:   (v: string) => void;
  filterRating:        string;
  setFilterRating:     (v: string) => void;
  filterStatus:        string;
  setFilterStatus:     (v: string) => void;
  filterSentiment:     string;
  setFilterSentiment:  (v: string) => void;
  showUnrepliedOnly:   boolean;
  setShowUnrepliedOnly:(v: boolean) => void;
}

const selectClass =
  'border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 ' +
  'bg-slate-50 focus:border-[#1e3a8a] focus:outline-none';

export function ReviewFilterBar({
  filterPlatform,   setFilterPlatform,
  filterRating,     setFilterRating,
  filterStatus,     setFilterStatus,
  filterSentiment,  setFilterSentiment,
  showUnrepliedOnly, setShowUnrepliedOnly,
}: ReviewFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5
                    flex items-center gap-2 flex-wrap">
      <select value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className={selectClass}>
        <option value="all">全プラットフォーム</option>
        <option value="shopify">Shopify</option>
        <option value="amazon">Amazon</option>
        <option value="rakuten">楽天</option>
        <option value="google">Google</option>
      </select>

      <select value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className={selectClass}>
        <option value="all">全評価</option>
        <option value="5">⭐⭐⭐⭐⭐(5)</option>
        <option value="4">⭐⭐⭐⭐(4)</option>
        <option value="3">⭐⭐⭐(3)</option>
        <option value="2">⭐⭐(2)</option>
        <option value="1">⭐(1)</option>
      </select>

      <select value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectClass}>
        <option value="all">全ステータス</option>
        <option value="unreplied">未返信</option>
        <option value="replied">返信済み</option>
      </select>

      <select value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className={selectClass}>
        <option value="all">全感情</option>
        <option value="positive">ポジティブ</option>
        <option value="neutral">ニュートラル</option>
        <option value="negative">ネガティブ</option>
      </select>

      <div className="ml-auto">
        <label className="flex items-center gap-2 cursor-pointer
                          bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5
                          text-xs font-semibold text-[#1e3a8a]">
          <input
            type="checkbox"
            checked={showUnrepliedOnly}
            onChange={(e) => setShowUnrepliedOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-[#1e3a8a]"
          />
          未返信のみ表示
        </label>
      </div>
    </div>
  );
}
