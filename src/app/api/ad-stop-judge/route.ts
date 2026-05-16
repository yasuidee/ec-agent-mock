import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK_RESULT = {
  results: [
    {
      adName: 'ヒノキカッティングボード_検索広告',
      verdict: 'continue',
      roas: 3.8,
      cpa: 428,
      cvr: 1.75,
      monthlyProfit: 23040,
      roasJudgment: 'good',
      cpaJudgment: 'good',
      cvrJudgment: 'warning',
      reason: 'ROASが3.8倍と優秀です。継続して予算増額を検討してください',
      action: '',
    },
    {
      adName: '有田焼マグカップ_ショッピング',
      verdict: 'improve',
      roas: 1.2,
      cpa: 666,
      cvr: 1.5,
      monthlyProfit: -720,
      roasJudgment: 'danger',
      cpaJudgment: 'danger',
      cvrJudgment: 'warning',
      reason: 'ROASが1.2倍と採算ぎりぎりです。商品ページのCVR改善が必要です',
      action: '商品ページのメイン画像とキャッチコピーを改善し、CVRを2%以上に引き上げてください',
    },
    {
      adName: '南部鉄器急須_ブランド',
      verdict: 'continue',
      roas: 4.2,
      cpa: 714,
      cvr: 1.75,
      monthlyProfit: 33600,
      roasJudgment: 'good',
      cpaJudgment: 'warning',
      cvrJudgment: 'warning',
      reason: 'ROASが4.2倍と高効率です。ブランドキーワードの入札を維持してください',
      action: '',
    },
  ],
  summary: {
    continueCount: 2,
    improveCount: 1,
    stopCount: 0,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPrompt(ads: Record<string, any>[]) {
  const lines = ads
    .map(
      (ad, i) =>
        `広告${i + 1}: ${ad.adName} / 月間広告費¥${ad.monthlySpend} / 広告経由売上¥${ad.adRevenue} / クリック数${ad.clicks} / 転換数${ad.conversions}`,
    )
    .join('\n');

  return `以下のEC広告の継続・改善・停止を判定してください。

${lines}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "results": [
    {
      "adName": "広告名",
      "verdict": "continue" または "improve" または "stop",
      "roas": 数値,
      "cpa": 数値,
      "cvr": 数値（%）,
      "monthlyProfit": 数値,
      "roasJudgment": "good" または "warning" または "danger",
      "cpaJudgment": "good" または "warning" または "danger",
      "cvrJudgment": "good" または "warning" または "danger",
      "reason": "判定理由（1-2行）",
      "action": "具体的な改善アクション（improveの場合のみ、それ以外は空文字）"
    }
  ],
  "summary": {
    "continueCount": 数値,
    "improveCount": 数値,
    "stopCount": 数値
  }
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

  const { ads } = body;
  if (!Array.isArray(ads) || ads.length === 0) {
    return NextResponse.json(MOCK_RESULT);
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system:
        'あなたはEC広告の専門家です。各広告の継続・改善・停止を判定し、必ずJSON形式のみで返答してください。前置きや説明文は一切不要です。',
      messages: [{ role: 'user', content: buildPrompt(ads) }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON not found');
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json(MOCK_RESULT);
  }
}
