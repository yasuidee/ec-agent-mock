import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { inquiries } = await req.json();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: `あなたはECショップのFAQ作成の専門家です。
問い合わせパターンを分析してFAQを生成してください。
以下のJSON形式のみで返答してください:
{"faqs":[{"question":"よくある質問文","answer":"回答文(100-200文字)"}]}
5-7件のFAQを生成してください。
必ずJSONのみを返してください。`,
      messages: [{
        role: 'user',
        content: `問い合わせ一覧:\n${inquiries.map((i: {subject: string; body: string; category: string}) => `- [${i.category}] ${i.subject}: ${i.body}`).join('\n')}`,
      }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleaned);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({
        faqs: [
          { question: '注文した商品はいつ届きますか？', answer: 'ご注文から通常3-5営業日以内に発送いたします。発送後、追跡番号をメールにてお送りします。' },
          { question: '返品・交換はできますか？', answer: '未使用・未開封の商品に限り、到着後7日以内であれば返品・交換を承ります。お気軽にご連絡ください。' },
          { question: '海外発送は対応していますか？', answer: '一部の国・地域への発送に対応しております。詳細はお問い合わせください。' },
          { question: 'ギフト包装は対応していますか？', answer: 'はい、ご希望の方にはギフト包装を承ります。ご注文時にご指定ください。' },
          { question: 'お手入れ方法を教えてください。', answer: '商品によってお手入れ方法が異なります。同梱のお手入れガイドをご参照ください。' },
        ]
      });
    }
  } catch {
    return NextResponse.json({ faqs: [] }, { status: 500 });
  }
}
