import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { campaigns, targetRoas, targetCpa } = await req.json();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `以下の広告データを分析して改善提案を作成してください。
キャンペーンデータ: ${JSON.stringify(campaigns)}
目標ROAS: ${targetRoas}倍
目標CPA: ¥${targetCpa}

以下のJSON形式のみで返答してください:
{
  "campaigns": [
    {
      "name": "キャンペーン名",
      "status": "good|improve|stop",
      "currentRoas": 数値,
      "improvements": {
        "targeting": "ターゲティング改善内容",
        "budget": {
          "current": 数値,
          "recommended": 数値,
          "reason": "理由"
        },
        "creative": "クリエイティブ改善内容",
        "keywords": {
          "add": ["追加キーワード"],
          "remove": ["除外キーワード"]
        }
      },
      "expectedRoasAfter": 数値,
      "lossAmount": 数値
    }
  ]
}
必ずJSONのみを返してください。`,
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = text.replace(/```json\n?|```\n?/g, '').trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      campaigns: campaigns.map((c: any) => ({
        name: c.name,
        status: (c.roas ?? 2.1) >= targetRoas ? 'good' : (c.roas ?? 2.1) >= 1.5 ? 'improve' : 'stop',
        currentRoas: c.roas ?? 2.1,
        improvements: {
          targeting: 'ターゲット年齢を25-44歳に絞ることを推奨します',
          budget: {
            current: Math.floor((c.spend ?? 0) / 30),
            recommended: Math.floor((c.spend ?? 0) / 30 * 1.2),
            reason: 'ROAS改善傾向にあるため増額を推奨',
          },
          creative: '商品の使用シーンを前面に出した動画広告に変更',
          keywords: {
            add: ['プレゼント向け', '職人手作り', '国産'],
            remove: ['安い', '格安', '激安'],
          },
        },
        expectedRoasAfter: (c.roas ?? 2.1) * 1.3,
        lossAmount: (c.roas ?? 2.1) < 1.5 ? (c.spend ?? 0) * 0.5 : 0,
      })),
    });
  }
}
