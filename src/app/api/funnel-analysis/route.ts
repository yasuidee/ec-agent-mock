import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK = {
  stageHealth: {
    access: 55, productView: 72, cartAdd: 68, cvr: 40,
    avgOrderValue: 60, repeatRate: 35, roas: 45, stockout: 90,
  },
  problems: [
    {
      stage: 'cvr', title: 'CVRが業界平均を下回っています',
      priority: 'high', currentValue: '2.8%', benchmark: '3.5%',
      impactAmount: 385000,
      action: '商品ページのファーストビューを改善し、購入ボタンを目立たせてください',
      agent: 'build',
    },
    {
      stage: 'repeatRate', title: 'リピート率が低水準です',
      priority: 'high', currentValue: '23%', benchmark: '30%',
      impactAmount: 280000,
      action: 'リピーター向けメルマガ配信とクーポン施策を実施してください',
      agent: 'marketing',
    },
    {
      stage: 'roas', title: '広告効率が改善余地あり',
      priority: 'medium', currentValue: '2.9倍', benchmark: '3.5倍以上',
      impactAmount: 120000,
      action: '低ROASキャンペーンの予算を削減し、高ROASキャンペーンに集中してください',
      agent: 'marketing',
    },
  ],
  aiComment: '現状の最大課題はCVR(2.8%)の低さです。業界平均(3.5%)まで改善できれば月間売上を約+¥385,000押し上げられます。同時にリピート率23%も改善余地があり、既存顧客への再購入施策が最もROIが高い施策です。まず商品ページの改善と顧客フォローアップメールの整備を優先してください。',
  priorityAction: '商品ページのCVR改善（ファーストビューと購入ボタンの最適化）',
};

function buildPrompt(d: Record<string, unknown>) {
  return `ECサイトのファネルデータを分析してください。

月間セッション数: ${d.sessions}
CVR: ${d.cvr}%
平均客単価: ¥${d.avgOrderValue}
月間注文数: ${d.orders}
リピート率: ${d.repeatRate}%
広告費: ¥${d.adSpend}
在庫切れ件数: ${d.stockoutCount}件/月
返品率: ${d.returnRate}%
ベンチマーク: ${d.benchmark}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "stageHealth": {
    "access": 0-100の整数,
    "productView": 0-100の整数,
    "cartAdd": 0-100の整数,
    "cvr": 0-100の整数,
    "avgOrderValue": 0-100の整数,
    "repeatRate": 0-100の整数,
    "roas": 0-100の整数,
    "stockout": 0-100の整数
  },
  "problems": [
    {
      "stage": "cvr",
      "title": "問題のタイトル",
      "priority": "high",
      "currentValue": "現在値の文字列",
      "benchmark": "ベンチマーク値の文字列",
      "impactAmount": 月間売上改善額の整数,
      "action": "具体的な改善アクション",
      "agent": "build"
    }
  ],
  "aiComment": "200-300文字の診断コメント",
  "priorityAction": "最も重要な1つのアクション"
}
problemsは優先度高から順に最大5件。必ずJSONのみを返してください。`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json(MOCK); }
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5', max_tokens: 1500,
      system: 'あなたはEC売上分析の専門家です。指定のJSON形式のみで返答してください。前置きや説明文は一切不要です。',
      messages: [{ role: 'user', content: buildPrompt(body) }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    return NextResponse.json(JSON.parse(match[0]));
  } catch { return NextResponse.json(MOCK); }
}
