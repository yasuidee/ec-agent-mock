@AGENTS.md

# EC Agent Mock — プロジェクト概要

月商500万円規模の日本のECサイト（クラフト・伝統工芸系）向け、AIエージェント搭載の運営ダッシュボード。
全データはモックであり、バックエンドAPIは持たない。

## スタック

| レイヤー | 採用技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| UI ランタイム | React 19 |
| スタイリング | Tailwind CSS v4 (`@import "tailwindcss"`) |
| コンポーネント | shadcn/ui (`radix-ui` ベース、`src/components/ui/`) |
| チャート | Recharts v3 |
| AI SDK | `@anthropic-ai/sdk` |
| 言語 | TypeScript strict |

## ディレクトリ構成

```
src/
  app/              # Next.js App Router ページ・レイアウト
  components/
    ui/             # shadcn/ui プリミティブ（直接編集しない）
    # 独自コンポーネントはここに feature 単位で追加
  lib/
    mock-data.ts    # 全モックデータ・型定義（単一の真実の源泉）
    utils.ts        # cn() ユーティリティ
```

## コーディングルール

- **モックデータは `src/lib/mock-data.ts` のみで管理する。** コンポーネント内にインラインでデータを書かない。
- shadcn コンポーネント (`src/components/ui/`) は **直接編集しない**。上書きが必要なら独自ラッパーを作る。
- Tailwind はクラスユーティリティのみ使用。`style={}` による直接スタイル指定は避ける。
- `cn()` (`src/lib/utils.ts`) を使って条件付きクラスをまとめる。
- Server Component をデフォルトとする。`"use client"` はインタラクション・状態が必要な末端コンポーネントに限定する。
- `any` 型は禁止。型が不明なら `unknown` から絞り込む。

## Tailwind CSS v4 の注意点

- 設定は `globals.css` の `@theme inline {}` ブロックで行う（`tailwind.config.js` は存在しない）。
- カスタムカラーは CSS カスタムプロパティ (`--color-*`) で定義する。
- `dark:` バリアントは `@custom-variant dark (&:is(.dark *))` で定義済み。

## AI エージェント機能

- `@anthropic-ai/sdk` を使って Server Action または Route Handler 経由で Claude を呼び出す。
- ストリーミングレスポンスには `createStreamableUI` ではなく `ReadableStream` + `Response` を使う（App Router 流儀）。
- APIキーは `ANTHROPIC_API_KEY` 環境変数から読む（`.env.local` に定義、コミット禁止）。
