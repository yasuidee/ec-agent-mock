'use client';

import { faqCategories } from '@/lib/mock-data/customer';

interface FaqGeneratorProps {
  generatedFaqs:    { question: string; answer: string }[];
  faqLoading:       boolean;
  onGenerateFaq:    () => void;
  onAddFaqToPage:   () => void; // navigates to build agent
}

export function FaqGenerator({
  generatedFaqs,
  faqLoading,
  onGenerateFaq,
  onAddFaqToPage,
}: FaqGeneratorProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-base font-bold text-slate-900">
        ❓ よくある質問（FAQ）の自動生成
      </h3>
      <p className="text-xs text-slate-500">
        問い合わせパターンからFAQを生成し、商品ページに追加できます
      </p>

      <div>
        <p className="text-xs font-semibold text-slate-600 mb-3">
          最もよくある問い合わせ: 配送（2件）
        </p>
        <div className="space-y-2">
          {faqCategories.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="w-12 text-xs text-slate-500 text-right shrink-0">
                {f.label}
              </span>
              {/* バートラック（overflow-hidden は付けない） */}
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full">
                {f.barPct > 0 && (
                  <div
                    className="h-full bg-[#1e3a8a] rounded-full transition-all duration-500"
                    style={{ width: `${f.barPct}%` }}
                  />
                )}
              </div>
              <span className="w-8 text-[10px] text-slate-400 shrink-0 text-right">
                {f.count}件
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerateFaq}
        disabled={faqLoading}
        className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white
                   rounded-lg px-5 py-2.5 text-sm font-bold transition
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
      >
        {faqLoading ? (
          <>
            <span className="inline-block h-4 w-4 border-2 border-white
                             border-t-transparent rounded-full animate-spin" />
            生成中...
          </>
        ) : 'FAQを自動生成する'}
      </button>

      {generatedFaqs.length > 0 && (
        <div className="space-y-3">
          {generatedFaqs.map((faq, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-xl p-4
                         hover:border-blue-200 transition"
            >
              <p className="font-medium text-sm text-slate-800">Q: {faq.question}</p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">A: {faq.answer}</p>
              <button
                onClick={onAddFaqToPage}
                className="border border-slate-200 hover:bg-slate-50
                           text-slate-700 text-sm px-3 py-2 rounded-lg mt-3 transition"
              >
                商品ページのFAQに追加する
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
