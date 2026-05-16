import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: `あなたはEC Agentです。日本の中小ECオーナーの専属AIアシスタントです。
ストアデータ: 月商500万円、主力商品はヒノキカッティングボード・有田焼マグカップ・南部鉄器急須。
今日の売上¥187,400、ROAS3.8倍、在庫切れリスク:有田焼マグカップ(残12個)。
常に具体的な数字を使い、3つ以内のアクションを提案してください。日本語で回答。`,
    messages,
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
