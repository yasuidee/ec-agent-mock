import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK_ANALYSIS = {
  competitorPrices: {
    amazon: { min: 3800, avg: 7200, max: 12800, count: 247 },
    rakuten: { min: 4200, avg: 8100, max: 14800, count: 183 },
  },
  marketMedian: 7600,
  priceJudgment: 'optimal',
  recommendations: {
    costBased: {
      price: 7200,
      marginRate: 42,
      reason: '目標利益率40%を確保できる最低価格です。コスト構造を維持しながら市場参入しやすい価格帯。',
    },
    marketOptimal: {
      price: 8800,
      marginRate: 52,
      reason: '競合中央値±10%以内で最も売れやすい価格帯です。転換率と利益率のバランスが最適。',
    },
    premium: {
      price: 12800,
      marginRate: 68,
      reason: '品質・ストーリーを訴求して高単価で差別化する戦略です。上位20%の価格帯に位置します。',
    },
  },
  freeShippingLine: 14000,
  competitorFreeShippingLine: 10000,
  competitorFreeShippingRate: 78,
  advice:
    '現在価格¥8,800は競合中央値¥7,600より約16%高めですが、国産ヒノキ・職人手作りという差別化要素があるため適正範囲内です。市場最適価格¥8,800を維持しつつ、商品説明での品質訴求を強化することで転換率向上が期待できます。プレミアム戦略では¥12,800まで引き上げ可能ですが、競合との明確な差別化コンテンツ（製造過程動画・職人インタビュー等）が必要です。',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPrompt(d: Record<string, any>) {
  return `商品情報を分析して価格戦略を提案してください。

商品名: ${d.productName}
現在価格: ¥${d.currentPrice}
原価: ¥${d.cost}
カテゴリ: ${d.category}
特徴: ${d.features}
目標利益率: ${d.targetMargin}%
送料: ¥${d.shipping}
販売プラットフォーム: ${(d.platforms as string[]).join(', ') || '未指定'}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "competitorPrices": {
    "amazon": {"min": 数値, "avg": 数値, "max": 数値, "count": 数値},
    "rakuten": {"min": 数値, "avg": 数値, "max": 数値, "count": 数値}
  },
  "marketMedian": 数値,
  "priceJudgment": "too_low" または "low" または "optimal" または "high" または "too_high",
  "recommendations": {
    "costBased": {"price": 数値, "marginRate": 数値, "reason": "説明"},
    "marketOptimal": {"price": 数値, "marginRate": 数値, "reason": "説明"},
    "premium": {"price": 数値, "marginRate": 数値, "reason": "説明"}
  },
  "freeShippingLine": 数値,
  "competitorFreeShippingLine": 数値,
  "competitorFreeShippingRate": 数値,
  "advice": "200-300文字の価格戦略アドバイス"
}`;
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(MOCK_ANALYSIS);
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system:
        'あなたはEC価格戦略の専門家です。商品情報を分析して指定のJSON形式のみで返答してください。前置きや説明文は一切不要です。価格は現実的な日本市場の相場に基づいてください。',
      messages: [{ role: 'user', content: buildPrompt(body) }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON not found');
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json(MOCK_ANALYSIS);
  }
}
