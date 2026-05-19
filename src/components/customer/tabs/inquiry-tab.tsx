'use client';

import { type Inquiry } from '@/lib/mock-data';
import { InquiryFilterBar } from '@/components/customer/inquiry-filter-bar';
import { InquiryCard }      from '@/components/customer/inquiry-card';

interface InquiryTabProps {
  filteredInquiries:   Inquiry[];
  replyTexts:          Record<string, string>;
  replyStatuses:       Record<string, 'replied' | 'editing'>;
  loadingStates:       Record<string, boolean>;
  filterCategory:      string;
  setFilterCategory:   (v: string) => void;
  filterPriority:      string;
  setFilterPriority:   (v: string) => void;
  filterInqPlatform:   string;
  setFilterInqPlatform:(v: string) => void;
  filterInqStatus:     string;
  setFilterInqStatus:  (v: string) => void;
  onGenerateReply:     (id: string) => void;
  onApplyReply:        (id: string) => void;
  onStartEditing:      (id: string) => void;
  onUpdateReplyText:   (id: string, text: string) => void;
}

export function InquiryTab({
  filteredInquiries,
  replyTexts,
  replyStatuses,
  loadingStates,
  filterCategory,      setFilterCategory,
  filterPriority,      setFilterPriority,
  filterInqPlatform,   setFilterInqPlatform,
  filterInqStatus,     setFilterInqStatus,
  onGenerateReply,
  onApplyReply,
  onStartEditing,
  onUpdateReplyText,
}: InquiryTabProps) {
  return (
    <div className="space-y-4">
      <InquiryFilterBar
        filterCategory={filterCategory}         setFilterCategory={setFilterCategory}
        filterPriority={filterPriority}         setFilterPriority={setFilterPriority}
        filterInqPlatform={filterInqPlatform}   setFilterInqPlatform={setFilterInqPlatform}
        filterInqStatus={filterInqStatus}       setFilterInqStatus={setFilterInqStatus}
      />

      <div className="space-y-4">
        {filteredInquiries.map((inquiry) => {
          const isUrgent =
            inquiry.priority === 'high' &&
            inquiry.status   === 'unreplied' &&
            replyStatuses[inquiry.id] !== 'replied';
          return (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              replyText={replyTexts[inquiry.id]}
              replyStatus={replyStatuses[inquiry.id]}
              isLoading={loadingStates[inquiry.id] ?? false}
              isUrgent={isUrgent}
              onGenerateReply={() => onGenerateReply(inquiry.id)}
              onApplyReply={() => onApplyReply(inquiry.id)}
              onStartEditing={() => onStartEditing(inquiry.id)}
              onRegenerate={() => onGenerateReply(inquiry.id)}
              onUpdateReplyText={(text) => onUpdateReplyText(inquiry.id, text)}
            />
          );
        })}
        {filteredInquiries.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8
                          text-center text-slate-400 text-sm">
            条件に一致する問い合わせがありません
          </div>
        )}
      </div>
    </div>
  );
}
