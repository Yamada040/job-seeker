# 就活AI Copilot (MVP)

就活の ES 作成・添削、企業管理、進捗確認を AI とゲーミフィケーションで支援する Next.js + Supabase 製の MVP です。Gemini/GPT は環境変数で差し替え可能なラッパー構成です。

## 主要機能
- 認証: Supabase Auth（Magic Link / Google OAuth）、認証後は `/dashboard` へ。未ログイン時は各ページで `/login` にリダイレクト。
- ダッシュボード: ES/企業カード/XP のサマリー、フォーカス、カレンダー表示。カレンダーでは ES 締切・面接・インターンなどの予定を追加/更新して保存（`/api/calendar-events`）し、ES 締切も自動表示。
- ES 管理: 一覧・作成/編集・削除、Markdown 入力、タグ/ステータス、AI 添削パネル。
- 企業管理: 企業カード作成/編集/削除、ステージ・志望度・メモ、AI 企業分析パネル。
- プロフィール: 氏名/大学/学部/アバター（固定画像）を保存。
- ホーム（MVP紹介）: 白基調のガラス風 UI。ログイン/新規登録導線と機能紹介。
- 共通: ダーク/ライト切替（class 切替）、Tailwind v4 推奨クラス（`bg-linear-to-*` など）で警告回避。

## 技術スタック
- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Auth/DB/Storage, RLS)
- AI: provider-agnostic（Gemini/GPT を環境変数で切替）
- Hosting: Vercel 想定

## セットアップ
```bash
npm install
npm run dev
# http://localhost:3000
```

## 環境変数 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# AI
AI_PROVIDER=gemini|openai
AI_PROVIDER_API_KEY=...
```

## 認証設定 (Supabase)
Supabase Dashboard → Authentication → URL Configuration
- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`

Next.js 認証コールバック: `app/auth/callback/route.ts` で `exchangeCodeForSession` を実行。

## DB スキーマ概要
`supabase/schema.sql` に定義（すべて RLS 有効）
- `profiles`: ユーザープロフィール
- `es_entries`: ES 本文/ステータス/締切など
- `companies`: 企業カード
- `xp_logs`: XP ログ
- `calendar_events`: カレンダー予定（ES締切/面接/インターンなど）

カレンダー予定 API:
- `GET /api/calendar-events` （ログインユーザーの予定取得）
- `POST /api/calendar-events` （予定追加）
- `PUT /api/calendar-events/:id` （予定更新）

## 開発ルール
- YAGNI/DRY を徹底、MVP 以外の過剰実装は避ける。
- サーバー側で Cookie 書き込みが必要な場合は Route Handler / Server Action で `createSupabaseActionClient` を使用。Server Component では `createSupabaseReadonlyClient` を使用し Cookie 書き込みは禁止。
- 認証が必要なデータ取得は `user_id` でスコープする。未ログインはリダイレクト。
- Tailwind は推奨クラス（`bg-linear-to-*` など）を優先して警告を回避。
- AI 呼び出しは `lib/ai/` の薄いラッパー経由。キー未設定時は安全に失敗させる。

## ページ一覧
- `/` ホーム（MVP紹介、ログイン/新規登録導線）
- `/login` ログイン
- `/auth/callback` 認証コールバック
- `/dashboard` ダッシュボード（ログイン必須）
- `/es`, `/es/new`, `/es/[id]` ES 管理（ログイン必須）
- `/companies`, `/companies/new`, `/companies/[id]` 企業管理（ログイン必須）
- `/profile` プロフィール編集（ログイン必須）

## 必要なキー
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- AI: `AI_PROVIDER_API_KEY`（Gemini/GPT に応じて設定）, `AI_PROVIDER`
