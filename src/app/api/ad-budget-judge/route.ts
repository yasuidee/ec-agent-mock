import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK_RESULT = {
  verdict: 'increase',
  recommendedBudget: 650000,
  reason:
    'ROASが3.8倍と目標を上回っており、在庫も45日分確保されています。現在の広告効率を活かして予算を増額することで、売上をさらに伸ばせます。競合強度が普通であることも増額のチャンスです。',
  expectedRevenueLift: 646000,
  savedAmount: 0,
  roasJudgment: 'good',
  roasComment: '目標ROASを超えています。増額の好機です',
  stockJudgment: 'good',
  stockComment: '在庫45日分。増額しても対応できます',
  marginJudgment: 'good',
  marginComment: '粗利率40%以上。広告費をかけても利益が残ります',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPrompt(d: Record<string, any>) {
  return `EC広告の予算判断を行ってください。

今月の広告費: ¥${d.adSpend}
今月の広告経由売上: ¥${d.adRevenue}
現在のROAS: ${d.roas}倍
目標ROAS: ${d.targetRoas}倍
今月の広告経由注文数: ${d.adOrders}件
商品の粗利率: ${d.marginRate}%
在庫残日数: ${d.stockDays}日
月間予算上限: ¥${d.budgetCap}
競合の広告強度: ${d.competitorStrength}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "verdict": "increase" または "maintain" または "decrease",
  "recommendedBudget": 数値,
  "reason": "判断理由(2-3行)",
  "expectedRevenueLift": 数値（増額時の売上増加額、増額でない場合は0）,
  "savedAmount": 数値（削減時のコスト削減額、削減でない場合は0）,
  "roasJudgment": "good" または "warning" または "danger",
  "roasComment": "ROASへの一言コメント",
  "stockJudgment": "good" または "warning" または "danger",
  "stockComment": "在庫への一言コメント",
  "marginJudgment": "good" または "warning" または "danger",
  "marginComment": "粗利率への一言コメント"
}`;
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(MOCK_RESULT);
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system:
        'あなたはEC広告の専門家です。広告データを分析して予算判断を行い、必ずJSON形式のみで返答してください。前置きや説明文は一切不要です。',
      messages: [{ role: 'user', content: buildPrompt(body) }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON not found');
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json(MOCK_RESULT);
  }
}
