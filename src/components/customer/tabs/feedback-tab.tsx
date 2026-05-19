'use client';

import { ratingDistribution, sentimentData } from '@/lib/mock-data/customer';
import { RatingBarChart }      from '@/components/customer/feedback/rating-bar-chart';
import { SentimentBars }       from '@/components/customer/feedback/sentiment-bars';
import { IssueCategoryChart }  from '@/components/customer/feedback/issue-category-chart';
import { StrengthGrid }        from '@/components/customer/feedback/strength-grid';
import { FaqGenerator }        from '@/components/customer/feedback/faq-generator';
import { AiImprovementBanner } from '@/components/customer/feedback/ai-improvement-banner';

interface FeedbackTabProps {
  generatedFaqs:         { question: string; answer: string }[];
  faqLoading:            boolean;
  customerReport:        string;
  reportLoading:         boolean;
  onGenerateFaq:         () => void;
  onGenerateReport:      () => void;
  onAddToProductPage:    (label: string) => void;
  onNavigateToBuild:     () => void;
  onNavigateToMarketing: () => void;
  onNavigateToInventory: () => void;
}

export function FeedbackTab({
  generatedFaqs,
  faqLoading,
  customerReport,
  reportLoading,
  onGenerateFaq,
  onGenerateReport,
  onAddToProductPage,
  onNavigateToBuild,
  onNavigateToMarketing,
  onNavigateToInventory,
}: FeedbackTabProps) {
  return (
    <div className="space-y-6">
      {/* サマリーカード: 評価分布 + 感情分析 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-5">
          📊 顧客フィードバック サマリー
        </h3>
        <div className="grid grid-cols-[300px_1fr] gap-8">
          <RatingBarChart data={ratingDistribution} />
          <SentimentBars  data={sentimentData} />
        </div>
      </div>

      {/* 課題カテゴリ別分析 */}
      <IssueCategoryChart />

      {/* 強み */}
      <StrengthGrid onAddToProductPage={onAddToProductPage} />

      {/* FAQ自動生成 */}
      <FaqGenerator
        generatedFaqs={generatedFaqs}
        faqLoading={faqLoading}
        onGenerateFaq={onGenerateFaq}
        onAddFaqToPage={onNavigateToBuild}
      />

      {/* AI改善提案バナー */}
      <AiImprovementBanner
        customerReport={customerReport}
        reportLoading={reportLoading}
        onGenerateReport={onGenerateReport}
        onNavigateToBuild={onNavigateToBuild}
        onNavigateToMarketing={onNavigateToMarketing}
        onNavigateToInventory={onNavigateToInventory}
      />
    </div>
  );
}
