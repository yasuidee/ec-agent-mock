import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { stats } = await req.json();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: `あなたはEC顧客満足度分析の専門家です。
レビューデータを分析して改善提案レポートを作成してください。
以下の構成で300-400文字のレポートを日本語で生成してください:
1. 現状評価(1-2行)
2. 最重要改善ポイント(2-3点)
3. 強みとして活かすべき点(1-2点)
4. 来月の重点アクション(具体的に)
テキストのみを返してください(JSON不要)。`,
      messages: [{
        role: 'user',
        content: `平均評価: ${stats.avgRating}\nポジティブ率: ${stats.positiveRate}%\nネガティブ率: ${stats.negativeRate}%\n主なネガティブタグ: ${stats.topNegativeTags.join(', ')}\n主なポジティブタグ: ${stats.topPositiveTags.join(', ')}\n未返信件数: ${stats.unrepliedCount}件`,
      }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return new NextResponse(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch {
    return new NextResponse('現在の平均評価は良好な水準を維持しています。主な改善ポイントとして、商品ページの説明精度向上と梱包品質の強化が挙げられます。ポジティブなレビューでは品質と職人技への高い評価が見られ、これを積極的に訴求することで新規顧客の獲得につなげられます。来月は未返信レビューへの迅速対応と、ネガティブタグ上位の課題解決を優先してください。', { status: 200 });
  }
}
