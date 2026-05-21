# 就活Copilot

就活の「やること迷子」を減らすための、AI活用型ジョブハンティング支援アプリです。  
ES作成・企業管理・面接ログ・自己分析を1つにまとめ、日々の就活アクションを前に進めやすくします。

## 主な機能

- **ダッシュボード**: 進捗サマリー、フォーカス、カレンダーで今日やることを見える化
- **ES管理**: ESの作成・編集・ステータス管理、AI添削
- **企業管理**: 志望企業ごとのステージ・志望度・メモ管理、AI分析
- **面接ログ**: 面接質問、回答、振り返りを記録
- **自己分析/適性チェック**: 回答保存とAIサマリーで軸整理
- **プロフィール管理**: 基本情報・アバター設定
- **お問い合わせ**: アプリ内から直接送信

## 技術スタック

- Next.js (App Router) / React / TypeScript
- Tailwind CSS v4
- Supabase (Auth / Database / Storage)
- AIラッパー（`lib/ai/`）

## セットアップ

```bash
npm install
npm run dev
# http://localhost:3000
```

## 環境変数（`.env.local`）

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# 本番例: NEXT_PUBLIC_SITE_URL=https://job-seeker-gray.vercel.app

# AI
AI_PROVIDER=gemini|openai
AI_PROVIDER_API_KEY=...

# Contact (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-mail@example.com
SMTP_PASS=your-app-password
SMTP_SECURE=true
```

## Supabase 認証設定

Supabase Dashboard → Authentication → URL Configuration

- Site URL（環境ごとにどちらか1つを設定）
  - `http://localhost:3000`（ローカル）
  - `https://job-seeker-gray.vercel.app`（本番）
- Redirect URLs
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`
  - `https://job-seeker-gray.vercel.app/auth/callback`
  - `https://job-seeker-gray.vercel.app/dashboard`

## スクリプト

```bash
npm run dev        # 開発サーバー
npm run lint       # ESLint
npm run type-check # TypeScript型チェック
npm run build      # 本番ビルド
```

## 主なページ

- `/` ホーム
- `/login` ログイン
- `/dashboard` ダッシュボード（ログイン必須）
- `/es` ES管理（ログイン必須）
- `/companies` 企業管理（ログイン必須）
- `/interviews` 面接ログ（ログイン必須）
- `/self-analysis` 自己分析（ログイン必須）
- `/aptitude` 適性チェック（ログイン必須）
- `/webtests` Webテスト対策（ログイン必須）
- `/profile` プロフィール（ログイン必須）
- `/contact` お問い合わせ（ログイン必須）
