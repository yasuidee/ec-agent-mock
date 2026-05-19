'use client';

import { type Review } from '@/lib/mock-data';
import { ReviewFilterBar } from '@/components/customer/review-filter-bar';
import { ReviewCard }      from '@/components/customer/review-card';

interface ReviewTabProps {
  filteredReviews:     Review[];
  replyTexts:          Record<string, string>;
  replyStatuses:       Record<string, 'replied' | 'editing'>;
  loadingStates:       Record<string, boolean>;
  showUnrepliedOnly:   boolean;
  setShowUnrepliedOnly:(v: boolean) => void;
  filterPlatform:      string;
  setFilterPlatform:   (v: string) => void;
  filterRating:        string;
  setFilterRating:     (v: string) => void;
  filterStatus:        string;
  setFilterStatus:     (v: string) => void;
  filterSentiment:     string;
  setFilterSentiment:  (v: string) => void;
  onGenerateReply:     (id: string) => void;
  onApplyReply:        (id: string) => void;
  onStartEditing:      (id: string) => void;
  onUpdateReplyText:   (id: string, text: string) => void;
  onAddToProductPage:  (tag: string) => void;
}

export function ReviewTab({
  filteredReviews,
  replyTexts,
  replyStatuses,
  loadingStates,
  showUnrepliedOnly,   setShowUnrepliedOnly,
  filterPlatform,      setFilterPlatform,
  filterRating,        setFilterRating,
  filterStatus,        setFilterStatus,
  filterSentiment,     setFilterSentiment,
  onGenerateReply,
  onApplyReply,
  onStartEditing,
  onUpdateReplyText,
  onAddToProductPage,
}: ReviewTabProps) {
  return (
    <div className="space-y-4">
      <ReviewFilterBar
        filterPlatform={filterPlatform}     setFilterPlatform={setFilterPlatform}
        filterRating={filterRating}         setFilterRating={setFilterRating}
        filterStatus={filterStatus}         setFilterStatus={setFilterStatus}
        filterSentiment={filterSentiment}   setFilterSentiment={setFilterSentiment}
        showUnrepliedOnly={showUnrepliedOnly}
        setShowUnrepliedOnly={setShowUnrepliedOnly}
      />

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            replyText={replyTexts[review.id]}
            replyStatus={replyStatuses[review.id]}
            isLoading={loadingStates[review.id] ?? false}
            onGenerateReply={() => onGenerateReply(review.id)}
            onApplyReply={() => onApplyReply(review.id)}
            onStartEditing={() => onStartEditing(review.id)}
            onRegenerate={() => onGenerateReply(review.id)}
            onUpdateReplyText={(text) => onUpdateReplyText(review.id, text)}
            onAddToProductPage={onAddToProductPage}
          />
        ))}
        {filteredReviews.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8
                          text-center text-slate-400 text-sm">
            条件に一致するレビューがありません
          </div>
        )}
      </div>
    </div>
  );
}
