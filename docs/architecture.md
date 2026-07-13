# アーキテクチャ概要

このドキュメントはコードベース全体の構造と主要フローを図解する。個別の詳細ルールは [CLAUDE.md](../CLAUDE.md) を、DBスキーマの詳細は [database-schema.md](./database-schema.md) を、テストの設計は [testing/](./testing/) を参照。

## 全体構成

```mermaid
flowchart TB
    subgraph Client["ブラウザ"]
        UI["Client Components<br/>(フォーム・パネル等)"]
    end

    subgraph Next["Next.js (App Router, Vercel)"]
        SC["Server Components<br/>(ページ, 読み取り専用)"]
        SA["Server Actions / Route Handlers<br/>(書き込み可)"]
        Proxy["proxy.ts (Middleware)<br/>認証ガード"]
    end

    subgraph External["外部サービス"]
        Supabase["Supabase<br/>(Auth / Postgres+RLS)"]
        AI["Gemini / GPT"]
        Tavily["Tavily<br/>(Web検索)"]
        SMTP["SMTP<br/>(問い合わせ)"]
    end

    UI -->|"fetch() POST"| SA
    UI -.->|画面表示| SC
    Proxy -->|全リクエストを検査| SC
    Proxy -->|全リクエストを検査| SA
    SC -->|createSupabaseReadonlyClient| Supabase
    SA -->|createSupabaseServerActionClient| Supabase
    SA -->|createAiClient| AI
    SA -->|agenticCompanyAnalysis| Tavily
    SA -->|nodemailer| SMTP
```

- **Server Component優先**: 可能な限りサーバー側でデータ取得し、Client Componentへpropsで渡す（外部状態管理ライブラリなし）
- **`proxy.ts`**: 全リクエストで `supabase.auth.getUser()` を検証し、未ログインで保護ルートにアクセスすると `/login` へリダイレクトする（詳細後述）

## 認証フロー

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Login as /login
    participant Supabase as Supabase Auth
    participant Google as Google OAuth
    participant Callback as /auth/callback
    participant Proxy as proxy.ts

    User->>Login: アクセス
    User->>Supabase: 「Googleでログイン」クリック<br/>signInWithOAuth()
    Supabase->>Google: リダイレクト
    Google-->>Callback: 認可コード付きでリダイレクト
    Callback->>Supabase: exchangeCodeForSession(code)
    Supabase-->>Callback: セッション（Cookie）
    Callback-->>User: /dashboard へリダイレクト

    Note over Proxy: 以降の全リクエストで実行
    User->>Proxy: 任意のページへアクセス
    Proxy->>Supabase: auth.getUser()（Cookie検証）
    alt 未ログイン かつ 保護ルート
        Proxy-->>User: /login へリダイレクト
    else ログイン済み かつ /login
        Proxy-->>User: /dashboard へリダイレクト
    else それ以外
        Proxy-->>User: そのまま表示
    end
```

公開パス（`proxy.ts` の `PUBLIC_PATHS`）: `/`, `/login`, `/auth/callback`, および `/api/*` 全体（各APIルートが個別に認証チェックを行う）。

## AI連携（プロバイダー非依存ラッパー）

```mermaid
flowchart LR
    UI["ai-panel.tsx 等"] -->|"POST /api/ai<br/>{input, kind}"| Route["/api/ai/route.ts"]
    Route --> Auth{"認証済み?"}
    Auth -->|No| E401["401"]
    Auth -->|Yes| RL["checkRateLimit()<br/>lib/rate-limit.ts"]
    RL -->|"上限超過"| E429["429 + Retry-After"]
    RL -->|OK| Client["createAiClient()<br/>lib/ai/client.ts"]
    Client --> Provider{"AI_PROVIDER"}
    Provider -->|gemini| Gemini["Gemini API"]
    Provider -->|gpt| GPT["OpenAI API"]
    Gemini --> Result["AiResponse<br/>{summary, bulletPoints}"]
    GPT --> Result
    Result --> UI
```

- `kind`（`AiPromptKind`）ごとにロケール別（日本語）のプロンプトテンプレートを `lib/ai/client.ts` 内で保持する
- APIキー未設定時は例外を投げず、プレースホルダーの `AiResponse` を返す（安全なフェイルオーバー）
- `/api/ai/company/analyze` は上記とは別実装（`lib/ai/agentic-company.ts`）で、Tavily検索を挟みながら複数ターンLLM呼び出しを行うagenticなフロー。SSE（Server-Sent Events）で進捗をストリーミングする。こちらも独自のレート制限（10分5回）を持つ

## XP（ゲーミフィケーション）フロー

```mermaid
flowchart TB
    Action["ユーザーのアクション<br/>(ES提出・企業追加・面接ログ等)"] --> Award["awardXp(userId, action, opts)<br/>lib/xp/award-xp.ts"]
    Award --> Check{"重複防止/日次上限<br/>/クールダウン判定"}
    Check -->|NG| NotAwarded["NOT_AWARDED"]
    Check -->|OK| Update["profiles.xp/level 更新<br/>xp_logs へ記録"]
    Update --> Cookie["xp-status Cookieに<br/>結果をエンコードして書き込み"]
    Cookie --> Badge["XpBadge コンポーネントが<br/>マウント時/イベント受信時にCookieを読み取り演出"]
```

- `computeLevel(xp) = Math.floor(xp / 25) + 1`
- `redirect()` で終わるServer Actionは戻り値を返せないため、Cookie経由でフロントへXP変化を伝える一方通行の設計（`lib/xp/level-up-signal.ts`）

## テスト・CI

```mermaid
flowchart LR
    subgraph PR["Pull Request"]
        direction TB
        Checks["checks.yml<br/>lint+type-check+format:check / build"]
        Test["test.yml<br/>unit(Vitest) / e2e(Playwright)"]
    end
    Checks --> Merge["devへマージ<br/>(必須ステータスチェック)"]
    Test --> Merge
```

詳細は [testing/unit-test-plan.md](./testing/unit-test-plan.md)・[testing/e2e-test-plan.md](./testing/e2e-test-plan.md) を参照。

## ディレクトリ構成の要点

```
app/
  <feature>/            # ルートセグメント（es, companies, interviews, ...）
    _components/         # そのfeature専用のコンポーネント（コロケーション）
    actions.ts            # Server Actions
    page.tsx              # Server Component
  api/<feature>/route.ts  # Route Handlers
  _components/            # 全feature共有のコンポーネント（layout, ai-panel等）
lib/
  ai/                     # AIクライアント・設定・agentic company analysis
  supabase/               # Supabaseクライアントファクトリ（readonly/action/admin）
  validation/schemas/     # Zodスキーマ
  xp/                     # XP計算・付与ロジック
  rate-limit.ts           # 永続化レート制限
e2e/                      # Playwright E2E
docs/                     # このディレクトリ
supabase/
  schema.sql              # DBスキーマ正本
  migrations/             # 差分（schema.sqlに追記済み）
```

## 既知の技術的負債（アーキテクチャ観点）

- `app/dashboard/_components/sections/*` と `calendar/{CalendarGrid,CalendarHeader,CalendarWeekdays,CalendarModal}.tsx` は、途中で放棄されたコンポーネント分割リファクタの残骸で、どこからもimportされていない（実際は600行超のモノリス `interactive-calendar.tsx` が稼働中）。Issue #108で削除予定
- `error.tsx` / `loading.tsx` / `not-found.tsx` がリポジトリ全体に1つも無く、サーバー側の例外がNext標準のクラッシュ画面になる（Issue #109）
- ライトテーマは `globals.css` の属性セレクタによるハードコード色の力技上書きで、脆弱な構造（Issue #116、#91で本格対応予定）
