# 就活AI Copilot (MVP)

大学生向けの就活アプリ（ES管理・AI添削・企業カード・XP表示）のMVP。初期はGeminiでAIを呼び出し、将来的にGPTへ差し替え可能な設計を前提にしています。

## 技術スタック

- Next.js (App Router) + TypeScript + TailwindCSS (v4)
- Supabase (Auth/DB/Storage + RLS)
- AI: provider-agnostic wrapper（初期Gemini→将来GPT）
- Hosting: Vercel

## 画面

- `/` マーケティング/要件サマリ（モダンUI）
- `/dashboard` 機能プレビュー: タスク、ESカード、企業カード、AIキュー、XP表示（ダミーデータ）

## DBスキーマ (Supabase)

- `supabase/schema.sql` にテーブル定義・RLSポリシーを用意（profiles / es_entries / companies / xp_logs）。
- Supabase SQLエディタまたは psql で適用し、RLSがONになっていることを確認してください。

## 環境変数

`.env.local` に設定してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# ローカル管理/マイグレーション用（サーバーのみで使用）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# optional: AI_PROVIDER=gemini|gpt (デフォルト gemini)
# optional: NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AIプロバイダーの鍵（初期はGemini、将来GPT等に差し替え）
AI_PROVIDER_API_KEY=your_ai_key
# optional: AI_PROVIDER=gemini|gpt (デフォルト gemini)
```

## セットアップ

```bash
npm install
npm run dev
# http://localhost:3000
```

## 今後の実装ステップ（優先度順）

1) Supabaseセットアップ: テーブル/ポリシー定義（ユーザー、ES、企業カード、XPログ）、RLS ON。
2) Supabaseクライアント/サーバーコンポーネントを実装し、ES/企業カードのCRUD UIを接続。
3) AIサービス層: provider-agnosticなラッパーを`/lib/ai/`に用意（Gemini→GPT差替え）。←実装済み
4) UI強化: フィルタ・タグ・ステータス変更UI、モバイル最適化の仕上げ。
5) 規約/プライポリ、エラーハンドリング、ローディング/空データ表示。

## Auth設定の要点（Magic Link）
- Supabase Auth → URL Configuration: Site URL を `http://localhost:3000`、Redirect URLs に `http://localhost:3000/auth/callback` と `http://localhost:3000/dashboard` を追加。
- Magic Linkのメールが叩くコールバック: `app/auth/callback/route.ts` で `exchangeCodeForSession` を必ず実行。
- ログインフォームは `/login` のサーバーアクション経由でメールリンクを送信（`emailRedirectTo` は `/auth/callback`）。  

## 実装ガイドライン

- YAGNI/DRY: MVPに不要な処理は後回し、共通化できるものは小コンポーネント/ユーティリティへ。
- AIはプロバイダー非依存: 環境変数で切替可能な薄いサービス層を設計し、Gemini実装から着手。
- セキュリティ: SupabaseのRLSを有効化し、HTTPS前提。写真アップロードは即時削除（将来のアバター生成用）。
- ドキュメント優先: 画面/DB/AIの振る舞いを簡潔に記述し、後続の改修コストを下げる。

### グラデーションユーティリティの注意点

Tailwind CSS が提供する公式のグラデーションクラスは
`bg-gradient-to-b` です。

エディタ拡張機能などが内部実装に基づく
`bg-linear-to-b`
を提案する場合がありますが、このクラスは Tailwind には存在せず、
置き換えるとビルドエラーが発生します。

Tailwind を利用する際は、公式仕様に従い
`bg-gradient-to-b`
をそのまま使用してください。
