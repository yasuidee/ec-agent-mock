import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { review } = await req.json();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      system: `あなたはECショップの丁寧な店主です。
お客様のレビューへの返信文を生成してください。

ルール:
- ポジティブレビュー: 感謝を述べ、また来てほしい気持ちを伝える
- ネガティブレビュー: 謝罪し、具体的な改善策を述べ、誠意を見せる
- ニュートラル: 感謝と改善への意欲を述べる
- 文字数: 80-150文字程度
- 敬語: 丁寧語を使用
- 署名: 末尾に「店主」と入れる
- 返信文のみを返す(前置きなし)`,
      messages: [{
        role: 'user',
        content: `商品名: ${review.productName}\n評価: ${review.rating}星\nタイトル: ${review.title}\n本文: ${review.body}\n感情: ${review.sentiment}\nタグ: ${review.tags.join(', ')}`,
      }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return new NextResponse(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch {
    return new NextResponse('申し訳ございません。レビューへのご評価、誠にありがとうございます。いただいたご意見を参考に、より良い商品・サービスの提供に努めてまいります。今後ともどうぞよろしくお願いいたします。店主', { status: 200 });
  }
}
