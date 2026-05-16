import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK = {
  monthlyGrowthRate: 17.1,
  monthlyMilestones: [
    { month: 1, targetRevenue: 2188000, growthRate: 17 },
    { month: 2, targetRevenue: 2564000, growthRate: 17 },
    { month: 3, targetRevenue: 3000000, growthRate: 17 },
  ],
  actions: {
    immediate: [
      {
        title: 'Google広告の予算を+¥50,000増額する',
        expectedImpact: '週次売上+¥80,000〜¥120,000',
        expectedRevenueLift: 320000,
        steps: ['現在のROASが3.8倍のキャンペーンを特定', '日予算を現行から¥50,000引き上げ', '1週間後に効果測定'],
        agent: 'marketing',
      },
      {
        title: '上位5商品のSEOタイトルを最適化する',
        expectedImpact: 'オーガニック流入+15%（月換算+¥150,000）',
        expectedRevenueLift: 150000,
        steps: ['各商品ページのタイトルにSEOキーワードを追加', 'メタディスクリプションを120文字以内で整備', 'Google Search Consoleで効果確認'],
        agent: 'build',
      },
    ],
    shortTerm: [
      {
        title: 'リピーター向けメルマガ配信を開始する',
        expectedImpact: 'リピート購入率+8%（月+¥180,000）',
        expectedRevenueLift: 180000,
        steps: ['購入履歴からリピーター候補リストを作成', '限定クーポン付きメルマガを配信', '開封率・CTRを計測して改善'],
        agent: 'marketing',
      },
      {
        title: '在庫切れ商品の緊急補充を行う',
        expectedImpact: '機会損失の回避（月+¥90,000）',
        expectedRevenueLift: 90000,
        steps: ['在庫切れ・残り少ない商品をリストアップ', '各サプライヤーに発注', '入荷後に広告を再開'],
        agent: 'inventory',
      },
      {
        title: '客単価向上のためセット販売を実施する',
        expectedImpact: '客単価+¥800（月+¥220,000）',
        expectedRevenueLift: 220000,
        steps: ['相性の良い商品ペアを3組選定', '専用バンドルページを作成', '送料無料ラインを活用した訴求'],
        agent: 'build',
      },
    ],
    midTerm: [
      {
        title: 'SNS広告チャンネルを追加する',
        expectedImpact: '新規顧客流入+25%（月+¥280,000）',
        expectedRevenueLift: 280000,
        steps: ['Instagram/TikTok広告のテスト予算¥30,000で開始', 'クリエイティブA/Bテストを実施', '効果の高いチャンネルに予算集中'],
        agent: 'marketing',
      },
      {
        title: '商品レビュー収集施策を実施する',
        expectedImpact: 'CVR+0.5%（月+¥170,000）',
        expectedRevenueLift: 170000,
        steps: ['購入後フォローアップメールでレビュー依頼', 'レビュー投稿でポイント付与', 'レビューを商品ページの目立つ位置に表示'],
        agent: 'build',
      },
    ],
  },
  predictions: {
    month1: { revenue: 2188000, grossProfit: 929900, roas: 4.2 },
    month2: { revenue: 2564000, grossProfit: 1089700, roas: 4.6 },
    month3: { revenue: 3000000, grossProfit: 1275000, roas: 5.0 },
  },
  weeklyTasks: [
    { week: 1, tasks: [
      { title: 'Google広告予算を+¥50,000増額', agent: 'marketing' },
      { title: '上位5商品のSEOタイトル改善', agent: 'build' },
      { title: '有田焼マグカップの緊急発注', agent: 'inventory' },
    ]},
    { week: 2, tasks: [
      { title: 'リピーター向けメルマガリスト作成', agent: 'marketing' },
      { title: 'セット販売ページ3点を作成', agent: 'build' },
      { title: '広告効果計測・低ROASキャンペーン停止', agent: 'marketing' },
    ]},
    { week: 3, tasks: [
      { title: 'メルマガ第1弾（限定クーポン）配信', agent: 'marketing' },
      { title: 'Instagram広告テスト開始', agent: 'marketing' },
      { title: '商品レビュー依頼メール設定', agent: 'build' },
    ]},
    { week: 4, tasks: [
      { title: 'Week1-3の効果測定・レポート作成', agent: 'analytics' },
      { title: 'SEO改善の成果確認（Google Search Console）', agent: 'analytics' },
      { title: 'TikTok広告クリエイティブA/Bテスト', agent: 'marketing' },
    ]},
    { week: 5, tasks: [
      { title: '2ヶ月目の広告戦略見直し', agent: 'marketing' },
      { title: '新規入荷商品のページ作成', agent: 'build' },
    ]},
    { week: 6, tasks: [
      { title: 'メルマガ効果測定・改善', agent: 'marketing' },
      { title: '在庫状況の月次レビュー', agent: 'inventory' },
    ]},
  ],
  aiComment: '現状月商¥1,870,000から¥3,000,000への達成は挑戦的ですが、月次17%成長で3ヶ月での実現が可能です。最重要アクションはGoogle広告の即時増額とSEO対策です。この2つだけで月+¥470,000の効果が見込めます。リピーター施策は中長期で最も高いROIが期待できる施策です。焦らず週次でタスクをこなせば達成できます。まず今週のアクションから始めましょう。',
  feasibilityScore: 72,
};

function buildPrompt(d: Record<string, unknown>) {
  return `ECオーナーの目標達成プランを作成してください。

【現状】
今月売上: ¥${d.currentRevenue}
今月粗利: ¥${d.currentGrossProfit}
今月注文数: ${d.currentOrders}件
平均客単価: ¥${d.avgOrderValue}
広告費: ¥${d.adSpend}
ROAS: ${d.roas}倍

【目標】
達成期間: ${d.period}
目標売上: ¥${d.targetRevenue}
目標粗利: ¥${d.targetGrossProfit}
目標注文数: ${d.targetOrders}件
追加目標: ${(d.additionalGoals as string[]).join(', ')}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "monthlyGrowthRate": 月次必要成長率の数値,
  "monthlyMilestones": [{"month": 1, "targetRevenue": 数値, "growthRate": 数値}],
  "actions": {
    "immediate": [{"title": "string", "expectedImpact": "string", "expectedRevenueLift": 数値, "steps": ["string"], "agent": "build|marketing|inventory|analytics"}],
    "shortTerm": [同形式],
    "midTerm": [同形式]
  },
  "predictions": {
    "month1": {"revenue": 数値, "grossProfit": 数値, "roas": 数値},
    "month2": {"revenue": 数値, "grossProfit": 数値, "roas": 数値},
    "month3": {"revenue": 数値, "grossProfit": 数値, "roas": 数値}
  },
  "weeklyTasks": [{"week": 1, "tasks": [{"title": "string", "agent": "string"}]}],
  "aiComment": "300-400文字のコメント",
  "feasibilityScore": 0-100の整数
}
immediateは2-3件、shortTermは3-4件、midTermは2-3件。weeklyTasksは最低4週分。必ずJSONのみを返してください。`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return NextResponse.json(MOCK); }
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5', max_tokens: 3000,
      system: 'あなたはEC事業の経営コンサルタントです。指定のJSON形式のみで返答してください。前置きや説明文は一切不要です。',
      messages: [{ role: 'user', content: buildPrompt(body) }],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    return NextResponse.json(JSON.parse(match[0]));
  } catch { return NextResponse.json(MOCK); }
}
