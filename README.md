# 就活AI Copilot (MVP)

就活のES添削・企業管理・進捗確認を、AIとゲーミフィケーションで前向きに進めるためのMVP版Webアプリです。Gemini/GPTを環境変数だけで差し替えできる薄いラッパー構成になっています。

## 実装済みの主な機能
- 認証: Supabase Auth (Magic Link / Google OAuth)。認証コールバックでセッションをCookieに保存。
- ダッシュボード: ユーザー専用データを集約（ES/企業/XP、AIキュー、フォーカス、メトリクス）。ログイン必須。
- ES管理: 一覧フィルタ、質問カード形式で作成/編集、AI添削パネル、タグ、ステータス、削除。ログイン必須。
- 企業管理: 企業カードの作成/編集/削除、志望度・ステータス・メモ・お気に入り。ログイン必須。
- プロフィール: 氏名/大学/学部/アバター（固定2種）を保存。ログイン必須。
- ホーム（MVP紹介）: 白基調のガラス風UIで、ログイン/新規登録導線と機能紹介を表示。
- 共通UI: 抽象グラデ背景（`public/bg-abstract.svg`）、Sidebar/Breadcrumb、MVPボタン/カードスタイル、Tailwind v4準拠（`bg-linear-to-*`）、ライト/ダーク切替（自前Providerでローカル保存）。

## 技術スタック
- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Auth/DB/Storage, RLS)
- AI: provider-agnostic ラッパー（Gemini/GPTを環境変数で切替）
- Hosting: Vercel想定


## セットアップ
```bash
npm install
npm run dev
# http://localhost:3000
```

## 認証設定（Supabase）
1. Supabase Dashboard → Authentication → URL Configuration  
   - Site URL: `http://localhost:3000`  
   - Redirect URLs:  
     - `http://localhost:3000/auth/callback`  
     - `http://localhost:3000/dashboard`
2. Next.js route handler: `app/auth/callback/route.ts` で `exchangeCodeForSession` を実行（実装済み）。
3. ログイン必須: ダッシュボード/ES/企業/プロフィール/新規作成/詳細は未ログイン時に `/login` へリダイレクト。

## DB
- スキーマ: `supabase/schema.sql`（profiles / es_entries / companies / xp_logs）。RLS有効。
- `es_entries.questions` は JSONB 推奨。列が無い環境でもフォールバック挿入で動作。

## 実装ルール（AIも参照する想定）
- YAGNI/DRYを徹底し、MVPに不要な複雑化を避ける。
- 認証が必要なデータ取得は必ず `user_id` でスコープする（未ログインはリダイレクト）。
- Supabase SSRクライアント:
  - Server Action/Route HandlerでCookie書き込みが必要な場合のみ `createSupabaseActionClient` を使用。
  - Server Componentでは `createSupabaseReadonlyClient` を使用し、Cookie書き込みは禁止。
- Tailwindは推奨クラス（例: `bg-linear-to-*`）を使い、警告を避ける。
- AI呼び出しは `lib/ai/` の薄いラッパー経由。環境変数でGemini/GPTを切替。キー未設定時は安全に失敗させる。
- ログイン必須ページでは未ログイン時 `/login` へ即リダイレクトする。
- フォームのサーバーアクションは `"use server"` か Route Handler で定義し、Client Componentに直接関数を渡さない。

## ページ一覧
- `/` ホーム（MVP紹介、ログイン/新規登録導線）
- `/login` ログイン（Magic Link / Google）
- `/auth/callback` 認証コールバック
- `/dashboard` ダッシュボード（ログイン必須）
- `/es` / `/es/new` / `/es/[id]` ES管理（ログイン必須）
- `/companies` / `/companies/new` / `/companies/[id]` 企業管理（ログイン必須）
- `/profile` プロフィール編集（ログイン必須）

## 次に必要なキー
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- AI: `AI_PROVIDER_API_KEY`（Gemini/GPTどちらか） and `AI_PROVIDER` 指定
