import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MOCK_CREATE = {
  productName: '南部鉄器急須 200ml 朱塗り',
  catchCopy: '200年の技が、毎朝の一杯を変える。',
  description: `岩手・盛岡の伝統工芸「南部鉄器」を受け継ぐ職人が、一つひとつ手作業で仕上げた急須です。
鉄分が溶け出すことでお茶の味わいがまろやかになり、保温性の高さで最後の一口まで温かくお楽しみいただけます。
朱塗り仕上げの落ち着いた佇まいは、毎日の茶時間をより豊かに彩ります。`,
  photoGuide: `1. 正面から全体像（白背景）
2. 蓋と注ぎ口のクローズアップ
3. 実際にお茶を注いでいるシーン
4. 手のひらに乗せたサイズ感カット
5. 収納・ギフトボックスとの組み合わせ`,
  pricingComment: '¥12,800は同カテゴリの職人品として適正範囲。送料無料設定で購入障壁を下げると転換率向上が見込めます。',
  faq: `Q: お手入れ方法は？
A: 使用後は水洗いし、自然乾燥させてください。洗剤は使用しないことをお勧めします。

Q: 食洗機は使えますか？
A: 食洗機・電子レンジのご使用はお避けください。

Q: 錆びた場合は？
A: 表面が赤くなった場合はお茶を入れてならし使いをすることで改善します。`,
  shipping: '通常2〜3営業日以内に発送。送料全国一律0円。ギフト包装（+¥330）対応可。',
  seoKeywords: ['南部鉄器 急須', '鉄瓶 急須 日本製', '南部鉄器 ギフト 誕生日', '岩手 伝統工芸 茶器', '鉄急須 おすすめ'],
};

const MOCK_IMPROVE = {
  currentScore: 42,
  improvedScore: 78,
  improvements: [
    { area: 'タイトル', issue: 'キーワードが不足している', suggestion: '「南部鉄器 急須 日本製 職人手作り」を含むタイトルに変更' },
    { area: '商品説明', issue: '特徴の羅列で購買動機が弱い', suggestion: 'ストーリー性を加え、使用シーンを具体的に描写する' },
    { area: '画像', issue: 'alt属性が未設定', suggestion: '全画像に「南部鉄器急須 朱塗り 正面」等のalt属性を追加' },
    { area: 'FAQ', issue: 'よくある質問がない', suggestion: 'お手入れ・サイズ・配送に関するFAQを5件追加' },
    { area: 'SEO', issue: 'メタディスクリプションが未設定', suggestion: '120文字以内でキーワードを含むディスクリプションを設定' },
  ],
  fullPage: `【南部鉄器 急須 日本製 職人手作り】200ml 朱塗り | 盛岡伝統工芸

◆ 200年の技が、毎朝の一杯を変える

岩手・盛岡の伝統工芸士が一つひとつ手作業で仕上げた南部鉄器急須。
鉄分が溶け出すことでお茶の味わいがまろやかになり、保温性の高さで最後の一口まで温かくお楽しみいただけます。

【商品仕様】
・容量: 200ml
・サイズ: W15 × D11 × H10 cm
・重量: 約450g
・素材: 鋳鉄（内部ホーロー加工）
・生産地: 岩手県盛岡市

【お手入れ】
使用後は水洗いし、自然乾燥。洗剤・食洗機はご使用不可。`,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCreatePrompt(data: Record<string, any>) {
  return `以下の商品情報をもとに、ECサイト用の商品ページコンテンツを生成してください。

商品名: ${data.productName}
価格: ¥${data.price}
カテゴリ: ${data.category}
ターゲット顧客: ${data.targetCustomer}
販売プラットフォーム: ${data.platform}
商品特徴: ${data.features}
差別化ポイント: ${data.differentiation}
配送情報: ${data.shipping}
返品ポリシー: ${data.returnPolicy}
言語: ${data.language || '日本語'}
トーン: ${data.tone || 'プロフェッショナル'}
FAQ生成: ${data.includeFaq ? 'あり' : 'なし'}
SEOキーワード: ${data.includeSeo ? 'あり' : 'なし'}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "productName": "最適化された商品名",
  "catchCopy": "キャッチコピー（20文字以内）",
  "description": "商品説明文（200〜300文字）",
  "photoGuide": "推奨撮影ガイド（5カット）",
  "pricingComment": "価格コメント（50文字以内）",
  "faq": "FAQテキスト（Q&A形式）",
  "shipping": "配送説明文（50文字以内）",
  "seoKeywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"]
}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildImprovePrompt(data: Record<string, any>) {
  return `以下の商品ページを分析し、改善提案をしてください。

現在のページ内容:
${data.currentContent}

改善優先事項: ${(data.priorities || []).join('、')}

以下のJSON形式のみで回答してください（説明文不要）:
{
  "currentScore": 現在のスコア(0-100の整数),
  "improvedScore": 改善後スコア(0-100の整数),
  "improvements": [
    { "area": "改善エリア", "issue": "問題点", "suggestion": "改善提案" }
  ],
  "fullPage": "改善版全文テキスト"
}`;
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON not found in response');
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  // Parse body first so it's available in the catch block
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(MOCK_CREATE);
  }

  const { mode, ...data } = body;

  try {
    if (mode === 'create') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: 'あなたはECサイトの商品ページ最適化の専門家です。必ずJSON形式のみで回答してください。前置きや説明文は一切不要です。',
        messages: [{ role: 'user', content: buildCreatePrompt(data) }],
      });
      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      return NextResponse.json(extractJson(text));
    }

    if (mode === 'improve') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: 'あなたはECサイトの商品ページ最適化の専門家です。必ずJSON形式のみで回答してください。前置きや説明文は一切不要です。',
        messages: [{ role: 'user', content: buildImprovePrompt(data) }],
      });
      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      return NextResponse.json(extractJson(text));
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch {
    if (mode === 'improve') return NextResponse.json(MOCK_IMPROVE);
    return NextResponse.json(MOCK_CREATE);
  }
}
