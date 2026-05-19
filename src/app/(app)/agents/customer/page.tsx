'use client';

import { useState, useMemo } from 'react';
import { useRouter }         from 'next/navigation';
import { useToast }          from '@/hooks/use-toast';
import { reviews as initialReviews, inquiries as initialInquiries, type Review, type Inquiry } from '@/lib/mock-data';

// ── New components ────────────────────────────────────────────
import { CustomerTopbar }   from '@/components/customer/customer-topbar';
import { CustomerKpiStrip } from '@/components/customer/customer-kpi-strip';
import { CustomerTabStrip } from '@/components/customer/customer-tab-strip';
import { ReviewTab }        from '@/components/customer/tabs/review-tab';
import { InquiryTab }       from '@/components/customer/tabs/inquiry-tab';
import { FeedbackTab }      from '@/components/customer/tabs/feedback-tab';

// ── Tab key ───────────────────────────────────────────────────
type TabKey = 'review' | 'inquiry' | 'feedback';

// ─────────────────────────────────────────────────────────────

export default function CustomerAgentPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ── Tab ────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>('review');

  // ── Data ───────────────────────────────────────────────────
  const [reviewData,   setReviewData]   = useState<Review[]>(initialReviews);
  const [inquiryData,  setInquiryData]  = useState<Inquiry[]>(initialInquiries);

  // ── Filter state – reviews ──────────────────────────────────
  const [filterPlatform,      setFilterPlatform]      = useState('all');
  const [filterRating,        setFilterRating]        = useState('all');
  const [filterStatus,        setFilterStatus]        = useState('all');
  const [filterSentiment,     setFilterSentiment]     = useState('all');
  const [showUnrepliedOnly,   setShowUnrepliedOnly]   = useState(true);

  // ── Filter state – inquiries ────────────────────────────────
  const [filterCategory,      setFilterCategory]      = useState('all');
  const [filterPriority,      setFilterPriority]      = useState('all');
  const [filterInqPlatform,   setFilterInqPlatform]   = useState('all');
  const [filterInqStatus,     setFilterInqStatus]     = useState('all');

  // ── Reply state ─────────────────────────────────────────────
  const [replyTexts,     setReplyTexts]     = useState<Record<string, string>>({});
  const [replyStatuses,  setReplyStatuses]  = useState<Record<string, 'replied' | 'editing'>>({});
  const [loadingStates,  setLoadingStates]  = useState<Record<string, boolean>>({});

  // ── FAQ ─────────────────────────────────────────────────────
  const [generatedFaqs, setGeneratedFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqLoading,    setFaqLoading]    = useState(false);

  // ── Customer report ─────────────────────────────────────────
  const [customerReport, setCustomerReport] = useState('');
  const [reportLoading,  setReportLoading]  = useState(false);

  // ── Computed ────────────────────────────────────────────────
  const unrepliedReviews   = useMemo(() => reviewData.filter((r) => r.status === 'unreplied'),  [reviewData]);
  const unrepliedInquiries = useMemo(() => inquiryData.filter((i) => i.status === 'unreplied'), [inquiryData]);
  const negativeReviews    = useMemo(() => reviewData.filter((r) => r.sentiment === 'negative'), [reviewData]);
  const avgRating          = useMemo(
    () => reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length,
    [reviewData]
  );

  const filteredReviews = useMemo(() => {
    return reviewData.filter((r) => {
      if (showUnrepliedOnly && r.status !== 'unreplied' && replyStatuses[r.id] !== 'editing') {
        if (replyStatuses[r.id]) return true;
        return false;
      }
      if (filterPlatform  !== 'all' && r.platform  !== filterPlatform)          return false;
      if (filterRating    !== 'all' && r.rating     !== Number(filterRating))    return false;
      if (filterStatus    !== 'all' && r.status     !== filterStatus)            return false;
      if (filterSentiment !== 'all' && r.sentiment  !== filterSentiment)         return false;
      return true;
    });
  }, [reviewData, filterPlatform, filterRating, filterStatus, filterSentiment, showUnrepliedOnly, replyStatuses]);

  const filteredInquiries = useMemo(() => {
    const sorted = [...inquiryData].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
    return sorted.filter((i) => {
      if (filterCategory    !== 'all' && i.category !== filterCategory)    return false;
      if (filterPriority    !== 'all' && i.priority !== filterPriority)    return false;
      if (filterInqPlatform !== 'all' && i.platform !== filterInqPlatform) return false;
      if (filterInqStatus   !== 'all' && i.status   !== filterInqStatus)   return false;
      return true;
    });
  }, [inquiryData, filterCategory, filterPriority, filterInqPlatform, filterInqStatus]);

  const sortedTags = useMemo(() => {
    const tagCounts = reviewData.reduce((acc, review) => {
      review.tags.forEach((tag) => {
        if (!acc[tag]) acc[tag] = { total: 0, negative: 0 };
        acc[tag].total++;
        if (review.sentiment === 'negative') acc[tag].negative++;
      });
      return acc;
    }, {} as Record<string, { total: number; negative: number }>);
    return Object.entries(tagCounts).sort((a, b) => b[1].negative - a[1].negative);
  }, [reviewData]);

  const positiveTagCounts = useMemo(() => {
    return reviewData
      .filter((r) => r.sentiment === 'positive')
      .flatMap((r) => r.tags)
      .reduce((acc, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc; }, {} as Record<string, number>);
  }, [reviewData]);

  const total = reviewData.length;

  const positiveCount  = useMemo(() => reviewData.filter((r) => r.sentiment === 'positive').length, [reviewData]);
  const negativeCount  = useMemo(() => reviewData.filter((r) => r.sentiment === 'negative').length, [reviewData]);

  // ── Handlers ────────────────────────────────────────────────

  const generateReply = async (id: string, type: 'review' | 'inquiry') => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      if (type === 'review') {
        const review = reviewData.find((r) => r.id === id);
        if (!review) return;
        const res = await fetch('/api/generate-review-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review }),
        });
        const text = await res.text();
        setReplyTexts((prev) => ({ ...prev, [id]: text }));
      } else {
        const inquiry = inquiryData.find((i) => i.id === id);
        if (!inquiry) return;
        const res = await fetch('/api/generate-inquiry-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inquiry }),
        });
        const text = await res.text();
        setReplyTexts((prev) => ({ ...prev, [id]: text }));
      }
    } catch {
      setReplyTexts((prev) => ({ ...prev, [id]: '返信文の生成に失敗しました。再試行してください。' }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const applyReply = (id: string, type: 'review' | 'inquiry') => {
    const text = replyTexts[id];
    if (!text) return;
    if (type === 'review') {
      setReviewData((prev) => prev.map((r) => r.id === id ? { ...r, status: 'replied' as const, reply: text } : r));
    } else {
      setInquiryData((prev) => prev.map((i) => i.id === id ? { ...i, status: 'replied' as const, reply: text } : i));
    }
    setReplyStatuses((prev) => ({ ...prev, [id]: 'replied' }));
    toast({ title: '返信をコピーしました', description: '返信済みに更新されました。' });
  };

  const startEditing = (id: string) => {
    setReplyStatuses((prev) => ({ ...prev, [id]: 'editing' }));
  };

  const generateFaq = async () => {
    setFaqLoading(true);
    try {
      const res = await fetch('/api/generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiries: inquiryData.map((i) => ({
            subject: i.subject, body: i.body, category: i.category,
          })),
        }),
      });
      const data = await res.json();
      setGeneratedFaqs(data.faqs || []);
    } catch {
      setGeneratedFaqs([]);
    } finally {
      setFaqLoading(false);
    }
  };

  const generateReport = async () => {
    setReportLoading(true);
    const topNegativeTags = sortedTags.slice(0, 3).map(([tag]) => tag);
    const topPositiveTags = Object.entries(positiveTagCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag]) => tag);
    try {
      const res = await fetch('/api/generate-customer-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            avgRating:       avgRating.toFixed(1),
            positiveRate:    ((positiveCount / total) * 100).toFixed(0),
            negativeRate:    ((negativeCount / total) * 100).toFixed(0),
            topNegativeTags,
            topPositiveTags,
            unrepliedCount:  unrepliedReviews.length + unrepliedInquiries.length,
          },
        }),
      });
      setCustomerReport(await res.text());
    } catch {
      setCustomerReport('レポートの生成に失敗しました。再試行してください。');
    } finally {
      setReportLoading(false);
    }
  };

  const handleAddToProductPage = (_label: string) => {
    toast({ title: '構築AIに追加しました' });
    router.push('/agents/build');
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. トップバー */}
      <CustomerTopbar />

      {/* 2. KPIストリップ */}
      <CustomerKpiStrip />

      {/* 3. タブストリップ */}
      <CustomerTabStrip activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 4. タブコンテンツ（完全独立） */}
      {activeTab === 'review' && (
        <ReviewTab
          filteredReviews={filteredReviews}
          replyTexts={replyTexts}
          replyStatuses={replyStatuses}
          loadingStates={loadingStates}
          showUnrepliedOnly={showUnrepliedOnly}
          setShowUnrepliedOnly={setShowUnrepliedOnly}
          filterPlatform={filterPlatform}     setFilterPlatform={setFilterPlatform}
          filterRating={filterRating}         setFilterRating={setFilterRating}
          filterStatus={filterStatus}         setFilterStatus={setFilterStatus}
          filterSentiment={filterSentiment}   setFilterSentiment={setFilterSentiment}
          onGenerateReply={(id) => generateReply(id, 'review')}
          onApplyReply={(id)    => applyReply(id, 'review')}
          onStartEditing={startEditing}
          onUpdateReplyText={(id, text) =>
            setReplyTexts((prev) => ({ ...prev, [id]: text }))
          }
          onAddToProductPage={handleAddToProductPage}
        />
      )}

      {activeTab === 'inquiry' && (
        <InquiryTab
          filteredInquiries={filteredInquiries}
          replyTexts={replyTexts}
          replyStatuses={replyStatuses}
          loadingStates={loadingStates}
          filterCategory={filterCategory}         setFilterCategory={setFilterCategory}
          filterPriority={filterPriority}         setFilterPriority={setFilterPriority}
          filterInqPlatform={filterInqPlatform}   setFilterInqPlatform={setFilterInqPlatform}
          filterInqStatus={filterInqStatus}       setFilterInqStatus={setFilterInqStatus}
          onGenerateReply={(id) => generateReply(id, 'inquiry')}
          onApplyReply={(id)    => applyReply(id, 'inquiry')}
          onStartEditing={startEditing}
          onUpdateReplyText={(id, text) =>
            setReplyTexts((prev) => ({ ...prev, [id]: text }))
          }
        />
      )}

      {activeTab === 'feedback' && (
        <FeedbackTab
          generatedFaqs={generatedFaqs}
          faqLoading={faqLoading}
          customerReport={customerReport}
          reportLoading={reportLoading}
          onGenerateFaq={generateFaq}
          onGenerateReport={generateReport}
          onAddToProductPage={handleAddToProductPage}
          onNavigateToBuild={() => router.push('/agents/build')}
          onNavigateToMarketing={() => router.push('/agents/marketing')}
          onNavigateToInventory={() => router.push('/agents/inventory')}
        />
      )}
    </div>
  );
}
