'use client';

import { type Review } from '@/lib/mock-data';
import { AgentBadge } from '@/components/dashboard/AgentBadge';
import { platformLabelMap, platformColorMap } from '@/lib/mock-data/customer';

// ── Sentiment style map ───────────────────────────────────────
const sentimentStyles = {
  positive: { card: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'ポジティブ' },
  neutral:  { card: 'bg-amber-50 border-amber-200',    bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700',    label: 'ニュートラル' },
  negative: { card: 'bg-red-50 border-red-200',        bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700',        label: 'ネガティブ' },
} as const;

interface ReviewCardProps {
  review:              Review;
  replyText?:          string;
  replyStatus?:        'replied' | 'editing';
  isLoading:           boolean;
  onGenerateReply:     () => void;
  onApplyReply:        () => void;
  onStartEditing:      () => void;
  onRegenerate:        () => void;
  onUpdateReplyText:   (text: string) => void;
  onAddToProductPage:  (tag: string) => void;
}

export function ReviewCard({
  review,
  replyText,
  replyStatus,
  isLoading,
  onGenerateReply,
  onApplyReply,
  onStartEditing,
  onRegenerate,
  onUpdateReplyText,
  onAddToProductPage,
}: ReviewCardProps) {
  const styles     = sentimentStyles[review.sentiment];
  const hasGenerated = replyText !== undefined;
  const isReplied  = replyStatus === 'replied' ||
    (review.status === 'replied' && replyStatus !== 'editing');
  const isEditing  = replyStatus === 'editing';

  const platformColor   = platformColorMap[review.platform]  ?? '#64748b';
  const platformDisplay = platformLabelMap[review.platform]  ?? review.platform;

  return (
    <div className={`border rounded-2xl shadow-sm overflow-hidden flex ${styles.card}`}>
      {/* 左アクセントバー */}
      <div className={`w-1 shrink-0 self-stretch ${styles.bar}`} />

      <div className="flex-1 p-5 space-y-2.5 min-w-0">
        {/* 1段目: 商品名 + プラットフォームバッジ + 感情バッジ */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-sm font-bold text-slate-900 truncate">
              {review.productName}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold shrink-0"
              style={{ backgroundColor: `${platformColor}18`, color: platformColor }}
            >
              {platformDisplay}
            </span>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${styles.badge}`}>
            ● {styles.label}
          </span>
        </div>

        {/* 2段目: 星評価 + レビュアー */}
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </span>
          <span className="text-[11px] text-slate-400">
            {review.authorName} · {review.date}
          </span>
        </div>

        {/* 3段目: タイトル */}
        <p className="text-sm font-semibold text-slate-900">{review.title}</p>

        {/* 4段目: 本文 */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{review.body}</p>

        {/* 5段目: タグ */}
        <div className="flex items-center gap-2 flex-wrap">
          {review.tags.map((tag) => (
            <span key={tag}
                  className="bg-slate-100 text-slate-500 rounded-full
                             px-2.5 py-0.5 text-[10px] font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* 6段目: 返信エリア */}
        <div>
          {isReplied && !isEditing ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-emerald-700">✅ 返信済み</span>
                <button
                  onClick={onStartEditing}
                  className="text-xs text-[#1e3a8a] hover:underline">
                  返信を修正する
                </button>
              </div>
              <p className="text-sm text-slate-600">{replyText ?? review.reply}</p>
            </div>
          ) : (
            <>
              {!hasGenerated && !isLoading && (
                <button
                  onClick={onGenerateReply}
                  className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white
                             rounded-lg px-4 py-2 text-xs font-semibold
                             flex items-center gap-1.5 transition w-fit">
                  ✨ AI返信を生成する
                </button>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="inline-block h-4 w-4 border-2
                                   border-[#1e3a8a] border-t-transparent
                                   rounded-full animate-spin" />
                  返信文を生成中...
                </div>
              )}
              {hasGenerated && !isLoading && (
                <div>
                  <textarea
                    value={replyText}
                    onChange={(e) => onUpdateReplyText(e.target.value)}
                    rows={4}
                    className="border border-slate-200 rounded-xl p-3 w-full text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-100
                               focus:border-blue-300 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={onApplyReply}
                      className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white
                                 text-sm px-4 py-2 rounded-lg transition">
                      この返信を使う
                    </button>
                    <button
                      onClick={onRegenerate}
                      className="border border-slate-200 hover:bg-slate-50
                                 text-slate-700 text-sm px-3 py-2 rounded-lg transition">
                      再生成する
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ネガティブ改善リンク */}
        {review.sentiment === 'negative' && hasGenerated && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-medium text-amber-700 mb-2">
              🔗 この問題を改善するには
            </p>
            <div className="flex gap-2 flex-wrap">
              {review.tags.includes('ページ説明') && (
                <AgentBadge agent="build" clickable={true} />
              )}
              {(review.tags.includes('梱包') || review.tags.includes('破損')) && (
                <AgentBadge agent="inventory" clickable={true} />
              )}
              {review.tags.includes('配送') && (
                <AgentBadge agent="marketing" clickable={true} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
