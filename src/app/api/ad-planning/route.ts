import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `以下の情報をもとに広告プランを作成してください。
目的: ${body.objective}
プラットフォーム: ${body.platforms.join(', ')}
月間予算: ¥${body.budget}
商品: ${body.productName}
ターゲット: ${body.targetAudience}
目標KPI: ${body.targetKpi}

以下のJSON形式のみで返答してください:
{
  "metaPlan": {
    "objective": "広告目的",
    "dailyBudget": 数値,
    "targetAge": "年齢層",
    "targetGender": "性別",
    "targetLocation": "地域",
    "interests": ["興味関心1", "興味関心2"],
    "adType": "広告タイプ",
    "mainCopy": "メインコピー文",
    "headline": "見出し",
    "cta": "CTAボタンテキスト"
  },
  "googlePlan": {
    "campaignType": "検索|ショッピング",
    "dailyBudget": 数値,
    "biddingStrategy": "入札戦略",
    "keywords": ["キーワード1", "キーワード2"],
    "negativeKeywords": ["除外1", "除外2"],
    "matchType": "マッチタイプ説明",
    "headline1": "見出し1",
    "headline2": "見出し2",
    "description": "説明文"
  },
  "forecast": {
    "monthlyImpressions": 数値,
    "monthlyClicks": 数値,
    "expectedRoas": 数値,
    "expectedOrders": 数値
  }
}
必ずJSONのみを返してください。`,
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = text.replace(/```json\n?|```\n?/g, '').trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({
      metaPlan: {
        objective: body.objective,
        dailyBudget: Math.floor(body.budget / 30),
        targetAge: '25-44歳',
        targetGender: '全て',
        targetLocation: '日本全国',
        interests: ['インテリア', '料理', 'ライフスタイル'],
        adType: 'シングル画像広告',
        mainCopy: `${body.productName}で毎日をもっと豊かに。`,
        headline: `職人が作る${body.productName}`,
        cta: '今すぐ購入',
      },
      googlePlan: {
        campaignType: '検索',
        dailyBudget: Math.floor(body.budget / 30 * 0.4),
        biddingStrategy: '目標ROAS',
        keywords: [body.productName, '職人', '日本製', 'プレゼント'],
        negativeKeywords: ['無料', '格安', 'DIY'],
        matchType: 'フレーズ一致を中心に',
        headline1: `${body.productName} 公式ショップ`,
        headline2: '職人手作り・送料無料',
        description: `こだわりの${body.productName}。日本の職人が丁寧に作りました。`,
      },
      forecast: {
        monthlyImpressions: Math.floor(body.budget * 50),
        monthlyClicks: Math.floor(body.budget * 2),
        expectedRoas: 3.2,
        expectedOrders: Math.floor(body.budget / 4500),
      },
    });
  }
}
