import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  let customerName = 'お客様';
  try {
    const { inquiry } = await req.json();
    if (inquiry?.customerName) customerName = inquiry.customerName;
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: `あなたはECショップの丁寧なカスタマーサポート担当です。
お客様からの問い合わせへの返信文を生成してください。

ルール:
- カテゴリに応じた具体的な回答をする
- shipping: 追跡番号の確認方法・お詫び
- product: 商品の詳細説明・使用方法
- return: 返品手続きの案内(返品用連絡先はXXXと記載)
- 文字数: 150-250文字程度
- 敬語: ビジネス敬語を使用
- 宛名: ${inquiry?.customerName ?? 'お客様'}様 から始める
- 署名: 末尾に「カスタマーサポート担当」と入れる
- 返信文のみを返す(前置きなし)`,
      messages: [{
        role: 'user',
        content: `顧客名: ${inquiry.customerName}\n件名: ${inquiry.subject}\n本文: ${inquiry.body}\nカテゴリ: ${inquiry.category}${inquiry.productName ? `\n商品名: ${inquiry.productName}` : ''}`,
      }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return new NextResponse(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch {
    return new NextResponse(`${customerName}様\n\nお問い合わせいただき、誠にありがとうございます。内容を確認の上、改めてご連絡いたします。\n\nカスタマーサポート担当`, { status: 200 });
  }
}
