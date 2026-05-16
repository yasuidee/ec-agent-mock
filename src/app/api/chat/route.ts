import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたはEC Agentです。日本の中小ECオーナーの専属AIアシスタントです。
ストアデータ: 月商500万円、主力商品はヒノキカッティングボード・有田焼マグカップ・南部鉄器急須。
今日の売上¥187,400、ROAS3.8倍、在庫切れリスク:有田焼マグカップ(残12個)。
常に具体的な数字を使い、3つ以内のアクションを提案してください。日本語で回答。`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages,
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  return NextResponse.json({ role: 'assistant', content: text });
}
