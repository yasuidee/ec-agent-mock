'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { AgentBadge } from '@/components/dashboard/AgentBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { reviews as initialReviews, inquiries as initialInquiries, type Review, type Inquiry } from '@/lib/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const platformLabel: Record<string, string> = {
  shopify: 'Shopify', amazon: 'Amazon', rakuten: '楽天', google: 'Google',
  email: 'メール', line: 'LINE', instagram: 'Instagram',
};

const platformColor: Record<string, string> = {
  shopify: 'bg-green-100 text-green-700',
  amazon: 'bg-orange-100 text-orange-700',
  rakuten: 'bg-red-100 text-red-700',
  google: 'bg-blue-100 text-blue-700',
  email: 'bg-slate-100 text-slate-700',
  line: 'bg-green-100 text-green-700',
  instagram: 'bg-pink-100 text-pink-700',
};

const sentimentLabel: Record<string, string> = {
  positive: '😊 ポジティブ',
  neutral: '😐 ニュートラル',
  negative: '😞 ネガティブ',
};

const sentimentColor: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-slate-100 text-slate-600',
  negative: 'bg-red-100 text-red-700',
};

const sentimentBorder: Record<string, string> = {
  positive: 'border-l-4 border-l-green-400',
  neutral: 'border-l-4 border-l-slate-300',
  negative: 'border-l-4 border-l-red-400',
};

const priorityLabel: Record<string, string> = {
  high: '🔴 高優先度', medium: '🟡 中優先度', low: '🔵 低優先度',
};

const priorityColor: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const priorityBorder: Record<string, string> = {
  high: 'border-l-4 border-l-red-400',
  medium: 'border-l-4 border-l-amber-400',
  low: 'border-l-4 border-l-slate-300',
};

const categoryLabel: Record<string, string> = {
  shipping: '📦 配送', product: '📋 商品', return: '↩️ 返品', other: '💬 その他',
};

const RATING_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#86efac', '#22c55e'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerAgentPage() {
  const router = useRouter();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────

  const [reviewData, setReviewData] = useState<Review[]>(initialReviews);
  const [inquiryData, setInquiryData] = useState<Inquiry[]>(initialInquiries);

  // Filter state – reviews
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [showUnrepliedOnly, setShowUnrepliedOnly] = useState(true);

  // Filter state – inquiries
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterInqPlatform, setFilterInqPlatform] = useState('all');
  const [filterInqStatus, setFilterInqStatus] = useState('all');

  // Reply state
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyStatuses, setReplyStatuses] = useState<Record<string, 'replied' | 'editing'>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // FAQ
  const [generatedFaqs, setGeneratedFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);

  // Customer report
  const [customerReport, setCustomerReport] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // ── Computed ───────────────────────────────────────────────────────────────

  const unrepliedReviews = useMemo(() => reviewData.filter(r => r.status === 'unreplied'), [reviewData]);
  const unrepliedInquiries = useMemo(() => inquiryData.filter(i => i.status === 'unreplied'), [inquiryData]);
  const negativeReviews = useMemo(() => reviewData.filter(r => r.sentiment === 'negative'), [reviewData]);
  const avgRating = useMemo(() => reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length, [reviewData]);
  const highPriorityCount = useMemo(() => unrepliedInquiries.filter(i => i.priority === 'high').length, [unrepliedInquiries]);

  const filteredReviews = useMemo(() => {
    return reviewData.filter(r => {
      if (showUnrepliedOnly && r.status !== 'unreplied' && replyStatuses[r.id] !== 'editing') {
        if (replyStatuses[r.id]) return true;
        return false;
      }
      if (filterPlatform !== 'all' && r.platform !== filterPlatform) return false;
      if (filterRating !== 'all' && r.rating !== Number(filterRating)) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterSentiment !== 'all' && r.sentiment !== filterSentiment) return false;
      return true;
    });
  }, [reviewData, filterPlatform, filterRating, filterStatus, filterSentiment, showUnrepliedOnly, replyStatuses]);

  const filteredInquiries = useMemo(() => {
    const sorted = [...inquiryData].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
    return sorted.filter(i => {
      if (filterCategory !== 'all' && i.category !== filterCategory) return false;
      if (filterPriority !== 'all' && i.priority !== filterPriority) return false;
      if (filterInqPlatform !== 'all' && i.platform !== filterInqPlatform) return false;
      if (filterInqStatus !== 'all' && i.status !== filterInqStatus) return false;
      return true;
    });
  }, [inquiryData, filterCategory, filterPriority, filterInqPlatform, filterInqStatus]);

  const tagCounts = useMemo(() => {
    return reviewData.reduce((acc, review) => {
      review.tags.forEach(tag => {
        if (!acc[tag]) acc[tag] = { total: 0, negative: 0 };
        acc[tag].total++;
        if (review.sentiment === 'negative') acc[tag].negative++;
      });
      return acc;
    }, {} as Record<string, { total: number; negative: number }>);
  }, [reviewData]);

  const sortedTags = useMemo(() =>
    Object.entries(tagCounts).sort((a, b) => b[1].negative - a[1].negative),
    [tagCounts]
  );

  const positiveTagCounts = useMemo(() => {
    return reviewData
      .filter(r => r.sentiment === 'positive')
      .flatMap(r => r.tags)
      .reduce((acc, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc; }, {} as Record<string, number>);
  }, [reviewData]);

  const inquiryCategories = useMemo(() => ({
    shipping: inquiryData.filter(i => i.category === 'shipping').length,
    product: inquiryData.filter(i => i.category === 'product').length,
    return: inquiryData.filter(i => i.category === 'return').length,
    other: inquiryData.filter(i => i.category === 'other').length,
  }), [inquiryData]);

  const ratingDistribution = useMemo(() =>
    [5, 4, 3, 2, 1].map(n => ({ name: `⭐${n}`, count: reviewData.filter(r => r.rating === n).length, rating: n })),
    [reviewData]
  );

  const positiveCount = useMemo(() => reviewData.filter(r => r.sentiment === 'positive').length, [reviewData]);
  const neutralCount = useMemo(() => reviewData.filter(r => r.sentiment === 'neutral').length, [reviewData]);
  const negativeCount = useMemo(() => reviewData.filter(r => r.sentiment === 'negative').length, [reviewData]);
  const total = reviewData.length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const generateReply = async (id: string, type: 'review' | 'inquiry') => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    try {
      if (type === 'review') {
        const review = reviewData.find(r => r.id === id);
        if (!review) return;
        const res = await fetch('/api/generate-review-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review }),
        });
        const text = await res.text();
        setReplyTexts(prev => ({ ...prev, [id]: text }));
      } else {
        const inquiry = inquiryData.find(i => i.id === id);
        if (!inquiry) return;
        const res = await fetch('/api/generate-inquiry-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inquiry }),
        });
        const text = await res.text();
        setReplyTexts(prev => ({ ...prev, [id]: text }));
      }
    } catch {
      setReplyTexts(prev => ({ ...prev, [id]: '返信文の生成に失敗しました。再試行してください。' }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const applyReply = (id: string, type: 'review' | 'inquiry') => {
    const text = replyTexts[id];
    if (!text) return;
    if (type === 'review') {
      setReviewData(prev => prev.map(r => r.id === id ? { ...r, status: 'replied', reply: text } : r));
    } else {
      setInquiryData(prev => prev.map(i => i.id === id ? { ...i, status: 'replied', reply: text } : i));
    }
    setReplyStatuses(prev => ({ ...prev, [id]: 'replied' }));
    toast({ title: '返信をコピーしました', description: '返信済みに更新されました。' });
  };

  const startEditing = (id: string) => {
    setReplyStatuses(prev => ({ ...prev, [id]: 'editing' }));
  };

  const generateFaq = async () => {
    setFaqLoading(true);
    try {
      const res = await fetch('/api/generate-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiries: inquiryData.map(i => ({ subject: i.subject, body: i.body, category: i.category })) }),
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
    const topPositiveTags = Object.entries(positiveTagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag]) => tag);
    try {
      const res = await fetch('/api/generate-customer-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            avgRating: avgRating.toFixed(1),
            positiveRate: ((positiveCount / total) * 100).toFixed(0),
            negativeRate: ((negativeCount / total) * 100).toFixed(0),
            topNegativeTags,
            topPositiveTags,
            unrepliedCount: unrepliedReviews.length + unrepliedInquiries.length,
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

  const selectClass = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="顧客対応AI"
        description="レビュー・問い合わせへのAI返信アシストとフィードバック分析"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Unreplied reviews */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">未返信レビュー</p>
          <p className={`text-3xl font-bold ${unrepliedReviews.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {unrepliedReviews.length}件
          </p>
          <p className="text-xs text-slate-400 mt-1">早めの対応を推奨</p>
        </div>
        {/* Unreplied inquiries */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">未返信問い合わせ</p>
          <p className={`text-3xl font-bold ${unrepliedInquiries.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {unrepliedInquiries.length}件
          </p>
          <p className="text-xs text-slate-400 mt-1">高優先度{highPriorityCount}件あり</p>
        </div>
        {/* Avg rating */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">平均評価</p>
          <p className={`text-3xl font-bold ${avgRating >= 4 ? 'text-green-600' : avgRating >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
            {avgRating.toFixed(1)}⭐
          </p>
          <p className="text-xs text-slate-400 mt-1">全{reviewData.length}件のレビュー</p>
        </div>
        {/* Negative rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">ネガティブ率</p>
          <p className={`text-3xl font-bold ${(negativeReviews.length / total) >= 0.1 ? 'text-red-600' : (negativeReviews.length / total) >= 0.05 ? 'text-amber-600' : 'text-green-600'}`}>
            {((negativeReviews.length / total) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">改善が必要な割合</p>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="reviews">
        <TabsList className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 h-auto w-full">
          <TabsTrigger value="reviews" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
            <Star className="w-4 h-4" />レビュー返信
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
            <MessageCircle className="w-4 h-4" />問い合わせ返信
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center">
            <BarChart3 className="w-4 h-4" />フィードバック分析
          </TabsTrigger>
        </TabsList>

        {/* ══ TAB 1: レビュー返信 ══ */}
        <TabsContent value="reviews">
          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex items-center gap-3 flex-wrap">
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className={selectClass}>
              <option value="all">全プラットフォーム</option>
              <option value="shopify">Shopify</option>
              <option value="amazon">Amazon</option>
              <option value="rakuten">楽天</option>
              <option value="google">Google</option>
            </select>
            <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className={selectClass}>
              <option value="all">全評価</option>
              <option value="5">⭐⭐⭐⭐⭐(5)</option>
              <option value="4">⭐⭐⭐⭐(4)</option>
              <option value="3">⭐⭐⭐(3)</option>
              <option value="2">⭐⭐(2)</option>
              <option value="1">⭐(1)</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectClass}>
              <option value="all">全ステータス</option>
              <option value="unreplied">未返信</option>
              <option value="replied">返信済み</option>
            </select>
            <select value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)} className={selectClass}>
              <option value="all">全感情</option>
              <option value="positive">ポジティブ</option>
              <option value="neutral">ニュートラル</option>
              <option value="negative">ネガティブ</option>
            </select>
            <label className="flex items-center gap-2 ml-auto text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnrepliedOnly}
                onChange={e => setShowUnrepliedOnly(e.target.checked)}
                className="rounded"
              />
              未返信のみ表示
            </label>
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {filteredReviews.map(review => {
              const isReplied = replyStatuses[review.id] === 'replied' || (review.status === 'replied' && replyStatuses[review.id] !== 'editing');
              const isEditing = replyStatuses[review.id] === 'editing';
              const hasGenerated = replyTexts[review.id] !== undefined;
              const isLoading = loadingStates[review.id];

              return (
                <div key={review.id} className={`bg-white border border-slate-200 rounded-xl p-5 mb-4 ${sentimentBorder[review.sentiment]}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{review.productName}</p>
                      <p className="text-lg mt-0.5">{'⭐'.repeat(review.rating)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{review.authorName} · {review.date}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${platformColor[review.platform]}`}>
                        {platformLabel[review.platform]}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${sentimentColor[review.sentiment]}`}>
                        {sentimentLabel[review.sentiment]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-800">{review.title}</p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{review.body}</p>
                  </div>

                  <div className="mt-2 flex gap-1 flex-wrap">
                    {review.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>

                  {/* Reply area */}
                  <div className="mt-4">
                    {isReplied && !isEditing ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-green-700">✅ 返信済み</span>
                          <button onClick={() => startEditing(review.id)} className="text-xs text-blue-900 hover:underline">
                            返信を修正する
                          </button>
                        </div>
                        <p className="text-sm text-slate-600">{replyTexts[review.id] || review.reply}</p>
                      </div>
                    ) : (
                      <>
                        {!hasGenerated && !isLoading && (
                          <button
                            onClick={() => generateReply(review.id, 'review')}
                            className="bg-blue-900 hover:bg-blue-950 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                          >
                            AI返信を生成する
                          </button>
                        )}
                        {isLoading && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="inline-block h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                            返信文を生成中...
                          </div>
                        )}
                        {hasGenerated && !isLoading && (
                          <div>
                            <textarea
                              value={replyTexts[review.id]}
                              onChange={e => setReplyTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                              rows={4}
                              className="border border-slate-200 rounded-xl p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => applyReply(review.id, 'review')}
                                className="bg-blue-900 hover:bg-blue-950 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                              >
                                この返信を使う
                              </button>
                              <button
                                onClick={() => generateReply(review.id, 'review')}
                                className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm px-3 py-2 rounded-lg transition-colors"
                              >
                                再生成する
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Negative improvement links */}
                  {review.sentiment === 'negative' && hasGenerated && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                      <p className="text-xs font-medium text-amber-700 mb-2">🔗 この問題を改善するには</p>
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
              );
            })}
            {filteredReviews.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                条件に一致するレビューがありません
              </div>
            )}
          </div>
        </TabsContent>

        {/* ══ TAB 2: 問い合わせ返信 ══ */}
        <TabsContent value="inquiries">
          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex items-center gap-3 flex-wrap">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectClass}>
              <option value="all">全カテゴリ</option>
              <option value="shipping">配送</option>
              <option value="product">商品</option>
              <option value="return">返品・交換</option>
              <option value="other">その他</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={selectClass}>
              <option value="all">全優先度</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            <select value={filterInqPlatform} onChange={e => setFilterInqPlatform(e.target.value)} className={selectClass}>
              <option value="all">全プラットフォーム</option>
              <option value="email">メール</option>
              <option value="shopify">Shopify</option>
              <option value="line">LINE</option>
              <option value="instagram">Instagram</option>
            </select>
            <select value={filterInqStatus} onChange={e => setFilterInqStatus(e.target.value)} className={selectClass}>
              <option value="all">全ステータス</option>
              <option value="unreplied">未返信</option>
              <option value="replied">返信済み</option>
            </select>
          </div>

          {/* Inquiry list */}
          <div className="space-y-4">
            {filteredInquiries.map(inquiry => {
              const isReplied = replyStatuses[inquiry.id] === 'replied' || (inquiry.status === 'replied' && replyStatuses[inquiry.id] !== 'editing');
              const isEditing = replyStatuses[inquiry.id] === 'editing';
              const hasGenerated = replyTexts[inquiry.id] !== undefined;
              const isLoading = loadingStates[inquiry.id];

              return (
                <div key={inquiry.id} className={`bg-white border border-slate-200 rounded-xl p-5 mb-4 ${priorityBorder[inquiry.priority]}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColor[inquiry.priority]}`}>
                        {priorityLabel[inquiry.priority]}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {categoryLabel[inquiry.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${platformColor[inquiry.platform]}`}>
                        {platformLabel[inquiry.platform]}
                      </span>
                      <span className="text-xs text-slate-400">{inquiry.date}</span>
                    </div>
                  </div>

                  {inquiry.priority === 'high' && inquiry.status === 'unreplied' && replyStatuses[inquiry.id] !== 'replied' && (
                    <div className="mt-2 text-xs font-medium text-red-600">⚠️ 早急な対応が必要です</div>
                  )}

                  <p className="font-medium text-slate-800 mt-2">{inquiry.customerName}</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{inquiry.subject}</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{inquiry.body}</p>
                  {inquiry.productName && (
                    <p className="text-xs text-slate-400 mt-1">商品: {inquiry.productName}</p>
                  )}

                  {/* Reply area */}
                  <div className="mt-4">
                    {isReplied && !isEditing ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-green-700">✅ 返信済み</span>
                          <button onClick={() => startEditing(inquiry.id)} className="text-xs text-blue-900 hover:underline">
                            返信を修正する
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{replyTexts[inquiry.id] || inquiry.reply}</p>
                      </div>
                    ) : (
                      <>
                        {!hasGenerated && !isLoading && (
                          <button
                            onClick={() => generateReply(inquiry.id, 'inquiry')}
                            className="bg-blue-900 hover:bg-blue-950 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                          >
                            AI返信を生成する
                          </button>
                        )}
                        {isLoading && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="inline-block h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                            返信文を生成中...
                          </div>
                        )}
                        {hasGenerated && !isLoading && (
                          <div>
                            <textarea
                              value={replyTexts[inquiry.id]}
                              onChange={e => setReplyTexts(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                              rows={4}
                              className="border border-slate-200 rounded-xl p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => applyReply(inquiry.id, 'inquiry')}
                                className="bg-blue-900 hover:bg-blue-950 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                              >
                                この返信を使う
                              </button>
                              <button
                                onClick={() => generateReply(inquiry.id, 'inquiry')}
                                className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm px-3 py-2 rounded-lg transition-colors"
                              >
                                再生成する
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredInquiries.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                条件に一致する問い合わせがありません
              </div>
            )}
          </div>
        </TabsContent>

        {/* ══ TAB 3: フィードバック分析 ══ */}
        <TabsContent value="analysis">
          <div className="space-y-6">

            {/* Section 1: Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="font-semibold text-slate-900 mb-4">📊 顧客フィードバック サマリー</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Rating distribution */}
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-3">評価分布</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={ratingDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v}件`, '件数']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={index} fill={RATING_COLORS[5 - entry.rating]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Sentiment summary */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-600">感情分析</p>
                  {[
                    { label: 'ポジティブ', count: positiveCount, color: 'bg-green-500' },
                    { label: 'ニュートラル', count: neutralCount, color: 'bg-slate-400' },
                    { label: 'ネガティブ', count: negativeCount, color: 'bg-red-500' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-medium text-slate-800">{((item.count / total) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${(item.count / total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.count}件 / 全{total}件</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Tag analysis */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="font-semibold text-slate-900 mb-4">🏷️ 課題カテゴリ別分析</h2>
              <div>
                {sortedTags.map(([tag, counts]) => (
                  <div key={tag} className="border-b py-4 flex items-center gap-4 last:border-b-0">
                    <span className="w-24 font-medium text-sm text-slate-700 shrink-0">{tag}</span>
                    <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-red-400 h-3 rounded-full transition-all"
                        style={{ width: `${counts.total > 0 ? (counts.negative / counts.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-44 shrink-0 text-right">
                      {counts.negative}件のネガティブ / 全{counts.total}件
                    </span>
                    <div className="shrink-0">
                      {(tag === '品質' || tag === '梱包') && <AgentBadge agent="build" clickable={true} />}
                      {(tag === 'ページ説明' || tag === 'サイズ感') && <AgentBadge agent="build" clickable={true} />}
                      {tag === '配送' && <AgentBadge agent="marketing" clickable={true} />}
                      {tag === '顧客対応' && <span className="text-xs text-slate-500">対応速度を改善してください</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Strengths */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-green-700 mb-1">✨ 顧客が評価している強み</h2>
              <p className="text-sm text-slate-500 mb-4">ポジティブレビューから抽出した訴求ポイントです。商品ページに活用してください。</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(positiveTagCounts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                  <div key={tag} className="bg-white border border-green-200 rounded-xl p-4 hover:border-green-400 transition-colors">
                    <p className="font-medium text-slate-800">{tag}</p>
                    <p className="text-sm text-green-600 mt-1">{count}件のレビューで言及</p>
                    <button
                      onClick={() => {
                        toast({ title: '構築AIに追加しました' });
                        router.push('/agents/build');
                      }}
                      className="border border-green-300 text-green-700 text-xs px-3 py-1 rounded mt-2 hover:bg-green-50 transition-colors"
                    >
                      商品ページに追加する
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: FAQ */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="font-semibold text-slate-900 mb-1">❓ よくある質問(FAQ)の自動生成</h2>
              <p className="text-sm text-slate-500 mb-4">問い合わせパターンからFAQを生成し、商品ページに追加できます</p>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-3">
                  最もよくある問い合わせ: {Object.entries(inquiryCategories).sort((a, b) => b[1] - a[1])[0][0] === 'shipping' ? '配送' : Object.entries(inquiryCategories).sort((a, b) => b[1] - a[1])[0][0]}
                  （{Object.entries(inquiryCategories).sort((a, b) => b[1] - a[1])[0][1]}件）
                </p>
                {[
                  { label: '配送', count: inquiryCategories.shipping },
                  { label: '商品', count: inquiryCategories.product },
                  { label: '返品', count: inquiryCategories.return },
                  { label: 'その他', count: inquiryCategories.other },
                ].map(item => {
                  const maxCount = Math.max(...Object.values(inquiryCategories), 1);
                  return (
                    <div key={item.label} className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-slate-500 w-12">{item.label}</span>
                      <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-900 h-2 rounded-full"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8">{item.count}件</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={generateFaq}
                disabled={faqLoading}
                className="bg-blue-900 hover:bg-blue-950 text-white px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {faqLoading ? (
                  <><span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />生成中...</>
                ) : 'FAQを自動生成する'}
              </button>

              {generatedFaqs.length > 0 && (
                <div className="mt-4 space-y-3">
                  {generatedFaqs.map((faq, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3 hover:border-blue-200 transition-colors">
                      <p className="font-medium text-sm text-slate-800">Q: {faq.question}</p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">A: {faq.answer}</p>
                      <button
                        onClick={() => {
                          toast({ title: '構築AIに追加しました' });
                          router.push('/agents/build');
                        }}
                        className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm px-3 py-2 rounded-lg mt-3 transition-colors"
                      >
                        商品ページのFAQに追加する
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5: AI Report */}
            <div className="bg-blue-900 rounded-xl p-6 text-white">
              <h2 className="font-bold text-lg mb-3">🤖 AIからの改善提案</h2>
              <button
                onClick={generateReport}
                disabled={reportLoading}
                className="bg-white text-blue-900 hover:bg-blue-50 font-medium text-sm px-5 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {reportLoading ? (
                  <><span className="inline-block h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />生成中...</>
                ) : '分析レポートを生成する'}
              </button>
              {customerReport && (
                <div className="mt-4">
                  <p className="text-blue-100 text-sm leading-relaxed whitespace-pre-wrap">{customerReport}</p>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <button onClick={() => router.push('/agents/build')} className="bg-blue-800 hover:bg-blue-700 rounded-lg p-3 text-sm text-white transition-colors text-left">
                      🏗️ 商品ページを改善する →
                    </button>
                    <button onClick={() => router.push('/agents/marketing')} className="bg-blue-800 hover:bg-blue-700 rounded-lg p-3 text-sm text-white transition-colors text-left">
                      📣 広告・集客を見直す →
                    </button>
                    <button onClick={() => router.push('/agents/inventory')} className="bg-blue-800 hover:bg-blue-700 rounded-lg p-3 text-sm text-white transition-colors text-left">
                      📦 在庫・品質を見直す →
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
