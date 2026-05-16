import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK_RESULT = {
  results: [
    {
      pageName: 'ヒノキカッティングボード',
      cvr: 1.75,
      benchmark: 2.1,
      priority: 'high',
      additionalOrders: 8,
      revenueImpact: 70400,
      improvements: [
        {
          category: 'photo',
          content: 'メイン画像を白背景の正面カットに変更し、サイズ感が伝わる手持ち写真を追加',
          difficulty: 'easy',
        },
        {
          category: 'text',
          content: '商品説明にヒノキの抗菌効果と使用シーン（料理レシピ例）を追加',
          difficulty: 'easy',
        },
        {
          category: 'faq',
          content: 'お手入れ方法・食洗機可否・サイズ確認のFAQを5件追加',
          difficulty: 'easy',
        },
        {
          category: 'price',
          content: '送料無料ラインを設定し、まとめ買い割引を訴求',
          difficulty: 'medium',
        },
      ],
    },
    {
      pageName: '有田焼マグカップ',
      cvr: 1.5,
      benchmark: 2.1,
      priority: 'urgent',
      additionalOrders: 5,
      revenueImpact: 22000,
      improvements: [
        {
          category: 'photo',
          content: 'コーヒー・お茶を注いだ使用シーン写真を追加（現在は白背景のみ）',
          difficulty: 'easy',
        },
        {
          category: 'text',
          content: '有田焼の歴史・産地・職人へのこだわりをストーリー形式で記載',
          difficulty: 'medium',
        },
        {
          category: 'shipping',
          content: 'ギフト包装オプションと配送日数を目立つ位置に表示',
          difficulty: 'easy',
        },
        {
          category: 'faq',
          content: '食洗機可否・電子レンジ可否・割れた際の対応のFAQを追加',
          difficulty: 'easy',
        },
      ],
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPrompt(pages: Record<string, any>[], benchmarkRate: number) {
  const lines = pages
    .map(
      (p, i) =>
        `ページ${i + 1}: ${p.pageName} / クリック数${p.clicks}回/月 / 購入数${p.purchases}件/月 / 直帰率${p.bounceRate}%`,
    )
    .join('\n');

  return `以下のEC商品ページを分析し、CVR改善ポイントを提案してください。
業界CVRベンチマーク: ${benchmarkRate}%

${lines}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "results": [
    {
      "pageName": "ページ名",
      "cvr": 数値（%、小数点1桁）,
      "benchmark": ${benchmarkRate},
      "priority": "urgent" または "high" または "normal",
      "additionalOrders": 数値（月間追加注文数、CVRがベンチマークまで改善した場合）,
      "revenueImpact": 数値（月間売上増加額）,
      "improvements": [
        {
          "category": "photo" または "text" または "price" または "shipping" または "faq",
          "content": "改善内容の説明",
          "difficulty": "easy" または "medium" または "hard"
        }
      ]
    }
  ]
}
improvementsは各ページ3-5件。必ずJSONのみを返してください。`;
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(MOCK_RESULT);
  }

  const { pages, benchmarkRate } = body;
  if (!Array.isArray(pages) || pages.length === 0) {
    return NextResponse.json(MOCK_RESULT);
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system:
        'あなたはEC商品ページの改善専門家です。CVRデータを分析して改善ポイントを提案し、必ずJSON形式のみで返答してください。前置きや説明文は一切不要です。',
      messages: [{ role: 'user', content: buildPrompt(pages, benchmarkRate ?? 2.1) }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON not found');
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json(MOCK_RESULT);
  }
}
