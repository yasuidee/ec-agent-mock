import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK_ADVICE = `1. **即時発注の実施**: 現在の在庫水準はリードタイムを考慮すると危機的です。今週中に最低でも推奨発注数の発注を行ってください。
2. **代替仕入先の確保**: 緊急時に対応できるよう、予備の仕入先を2社以上リストアップしておくことを推奨します。
3. **販売ペースのモニタリング**: 週次で販売数を確認し、需要が急増している場合は追加発注のタイミングを早める判断をしてください。`;

export async function POST(req: NextRequest) {
  let body: { prompt?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ advice: MOCK_ADVICE });
  }

  const prompt = body.prompt ?? '';
  if (!prompt) {
    return NextResponse.json({ advice: MOCK_ADVICE });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      system:
        'あなたはECショップの在庫管理専門アドバイザーです。具体的で実行可能なアドバイスを箇条書き3点で返してください。マークダウンの太字（**）は使用可。前置きや説明文は不要です。',
      messages: [{ role: 'user', content: prompt }],
    });
    const text =
      message.content[0].type === 'text' ? message.content[0].text : MOCK_ADVICE;
    return NextResponse.json({ advice: text });
  } catch {
    return NextResponse.json({ advice: MOCK_ADVICE });
  }
}
