'use client';

import { type Inquiry } from '@/lib/mock-data';
import { ChannelBadge } from '@/components/customer/channel-badge';

// ── Priority style map ────────────────────────────────────────
const priorityStyles = {
  high:   { card: 'bg-red-50 border-red-200',    bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500',    label: '高優先度' },
  medium: { card: 'bg-amber-50 border-amber-200', bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400',  label: '中優先度' },
  low:    { card: 'bg-white border-slate-200',    bar: 'bg-[#1e3a8a]', badge: 'bg-blue-100 text-[#1e3a8a]', dot: 'bg-[#1e3a8a]', label: '低優先度' },
} as const;

const categoryLabel: Record<string, string> = {
  shipping: '配送',
  product:  '商品',
  return:   '返品',
  other:    'その他',
};

interface InquiryCardProps {
  inquiry:           Inquiry;
  replyText?:        string;
  replyStatus?:      'replied' | 'editing';
  isLoading:         boolean;
  isUrgent:          boolean;
  onGenerateReply:   () => void;
  onApplyReply:      () => void;
  onStartEditing:    () => void;
  onRegenerate:      () => void;
  onUpdateReplyText: (text: string) => void;
}

export function InquiryCard({
  inquiry,
  replyText,
  replyStatus,
  isLoading,
  isUrgent,
  onGenerateReply,
  onApplyReply,
  onStartEditing,
  onRegenerate,
  onUpdateReplyText,
}: InquiryCardProps) {
  const styles = priorityStyles[inquiry.priority];
  const hasGenerated = replyText !== undefined;
  const isReplied    = replyStatus === 'replied' ||
    (inquiry.status === 'replied' && replyStatus !== 'editing');
  const isEditing    = replyStatus === 'editing';

  return (
    <div className={`border rounded-2xl shadow-sm overflow-hidden flex ${styles.card}`}>
      {/* 左アクセントバー */}
      <div className={`w-1 shrink-0 self-stretch ${styles.bar}`} />

      <div className="flex-1 p-5 space-y-2 min-w-0">
        {/* 1段目: 優先度 + カテゴリ + チャネルバッジ + 日付 */}
        <div className="flex items-center gap-2 justify-between flex-wrap">
          <div className="flex items-center gap-2">
            {/* 優先度バッジ */}
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold
                              flex items-center gap-1 ${styles.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              {styles.label}
            </span>
            {/* カテゴリバッジ */}
            <span className="bg-slate-100 text-slate-500 rounded-full
                             px-2.5 py-0.5 text-[10px] font-medium">
              {categoryLabel[inquiry.category] ?? inquiry.category}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ChannelBadge channel={inquiry.platform} />
            <span className="text-[11px] text-slate-400">{inquiry.date}</span>
          </div>
        </div>

        {/* 緊急テキスト */}
        {isUrgent && (
          <p className="text-xs font-semibold text-red-600">
            ▲ 早急な対応が必要です
          </p>
        )}

        {/* 送信者名 + 件名 + 本文 */}
        <p className="text-sm font-bold text-slate-900">{inquiry.customerName}</p>
        <p className="text-sm font-semibold text-slate-800">{inquiry.subject}</p>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{inquiry.body}</p>

        {/* 商品名 */}
        {inquiry.productName && (
          <p className="text-[11px] text-slate-400">商品: {inquiry.productName}</p>
        )}

        {/* 返信エリア */}
        <div>
          {isReplied && !isEditing ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl
                            px-4 py-2.5 flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                ✅ 返信済み
              </span>
              <span className="text-xs text-slate-500 flex-1 min-w-0 truncate">
                {replyText ?? inquiry.reply}
              </span>
              <button
                onClick={onStartEditing}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-[11px]
                           font-medium text-slate-600 hover:bg-slate-50 transition shrink-0">
                返信を修正する
              </button>
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
      </div>
    </div>
  );
}
