import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK_REPORT = {
  weekLabel: '5月第2週',
  overallRating: 'good',
  goodPoints: [
    {
      title: 'ヒノキカッティングボードの広告ROASが4.2倍に上昇',
      detail: 'Google ショッピング広告の最適化により、CPAが15%改善しました',
      revenueImpact: 182000,
    },
    {
      title: 'リピーター購入率が前週比+3.2%向上',
      detail: 'メルマガのパーソナライズ配信が効果を発揮しました',
      revenueImpact: 95000,
    },
    {
      title: '南部鉄器急須が週間5個と安定推移',
      detail: 'プレミアム価格帯での差別化が定着し、粗利率52%を維持しています',
      revenueImpact: 64000,
    },
  ],
  badPoints: [
    {
      title: '有田焼マグカップの在庫が残17日と危機的',
      cause: '発注リードタイム3週間に対して安全在庫の計算が不十分でした',
      lossImpact: 88000,
    },
    {
      title: 'カート離脱率が68%と高水準が継続',
      cause: '送料表示のタイミングが遅く、購入直前での体験が悪化しています',
      lossImpact: 142000,
    },
    {
      title: 'Instagram広告のCTRが前週比-12%低下',
      cause: 'クリエイティブの疲弊。同一画像を3週間以上使用しています',
      lossImpact: 54000,
    },
  ],
  nextWeekTasks: [
    {
      id: 'weekly_task_1',
      priority: 'urgent',
      title: '有田焼マグカップを即時30個追加発注',
      expectedImpact: 88000,
      steps: ['窯元への緊急発注フォームから30個発注', 'リードタイム3週間での納品を確認'],
      agent: 'inventory',
      category: 'inventory',
      description: '在庫残17日・週間7個ペース・リードタイム3週間のため、即日発注しないと在庫切れが確定します',
      urgency: 'high',
      status: 'pending',
      reasoning: '在庫切れになると週間7個×3週=21個の機会損失（¥88,000相当）が発生します',
    },
    {
      id: 'weekly_task_2',
      priority: 'high',
      title: 'ヒノキカッティングボードの広告予算を+¥10,000増額',
      expectedImpact: 182000,
      steps: [
        'Google広告管理画面でヒノキキャンペーンの日予算を¥5,000から¥15,000に変更',
        'ROAS目標を3.5倍に設定して自動入札を最適化',
      ],
      agent: 'marketing',
      category: 'marketing',
      description: 'ROASが4.2倍と絶好調。在庫62日分あり、増額リスクが低い最高の状況です',
      urgency: 'medium',
      status: 'pending',
      reasoning: 'ROAS4.2倍の状態で予算2倍にすると月+¥182,000の売上増が期待できます',
    },
    {
      id: 'weekly_task_3',
      priority: 'normal',
      title: '南部鉄器急須の商品ページを英語化',
      expectedImpact: 64000,
      steps: ['商品説明・スペック・使い方ガイドを英語で追記', '多言語切り替えボタンを実装'],
      agent: 'build',
      category: 'build',
      description: '海外からのアクセスが先月比+40%増加。英語ページがないため機会損失が続いています',
      urgency: 'low',
      status: 'pending',
      reasoning: '海外顧客の購入率を5%から15%に改善することで月+¥64,000の売上増が見込めます',
    },
  ],
  dangers: [
    {
      title: '有田焼マグカップの在庫切れが17日後に確定',
      description:
        '現在の週間販売7個ペースでは17日後に在庫がゼロになります。リードタイムが3週間あるため、今週発注しても間に合わない可能性があります',
      riskAmount: 88000,
    },
    {
      title: 'Instagram広告クリエイティブの疲弊が深刻化',
      description:
        '同一画像を3週間以上使用しており、CTRが毎週5〜8%低下しています。放置するとROASが1.0倍を下回るリスクがあります',
      riskAmount: 54000,
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPrompt(d: Record<string, any>) {
  const revDelta = ((d.revenue - d.prevRevenue) / d.prevRevenue * 100).toFixed(1);
  const orderDelta = ((d.orders - d.prevOrders) / d.prevOrders * 100).toFixed(1);

  return `以下のECショップの週次データを分析して、改善レポートを作成してください。

週開始日: ${d.weekStartDate}
今週の売上: ¥${d.revenue.toLocaleString()} (前週比${revDelta}%)
今週の注文数: ${d.orders}件 (前週比${orderDelta}%)
CVR: ${d.cvr}% (前週 ${d.prevCvr.toFixed(1)}%)
粗利: ¥${d.grossProfit.toLocaleString()} (前週 ¥${d.prevGrossProfit.toLocaleString()})
広告費: ¥${d.adSpend.toLocaleString()}
ROAS: ${d.roas}倍
在庫切れ商品数: ${d.stockoutCount}品
リピート率: ${d.repeatRate}%

以下のJSON形式のみで回答してください（説明文不要）:
{
  "weekLabel": "X月第Y週",
  "overallRating": "good" または "normal" または "bad",
  "goodPoints": [
    { "title": "良かった点", "detail": "詳細", "revenueImpact": 数値 }
  ],
  "badPoints": [
    { "title": "悪かった点", "cause": "原因", "lossImpact": 数値 }
  ],
  "nextWeekTasks": [
    {
      "id": "weekly_task_1",
      "priority": "urgent" または "high" または "normal",
      "title": "タスクのタイトル",
      "expectedImpact": 数値,
      "steps": ["手順1", "手順2"],
      "agent": "build" または "marketing" または "inventory" または "analytics",
      "category": "build" または "marketing" または "inventory" または "analytics",
      "description": "タスクの詳細説明",
      "urgency": "high" または "medium" または "low",
      "status": "pending",
      "reasoning": "提案理由"
    }
  ],
  "dangers": [
    { "title": "危険なこと", "description": "リスク説明", "riskAmount": 数値 }
  ]
}
goodPointsは3件、badPointsは3件、nextWeekTasksは必ず3件（priorityはurgent/high/normalを1件ずつ）、dangersは2-3件。`;
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(MOCK_REPORT);
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2500,
      system:
        'あなたはEC事業の経営アドバイザーです。週次データを分析して改善レポートを作成してください。必ずJSON形式のみで返答してください。前置きや説明文は一切不要です。',
      messages: [{ role: 'user', content: buildPrompt(body.currentData ?? {}) }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON not found');
    return NextResponse.json(JSON.parse(match[0]));
  } catch {
    return NextResponse.json(MOCK_REPORT);
  }
}
