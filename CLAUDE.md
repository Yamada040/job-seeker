# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**就活copilot** is a Next.js + Supabase MVP for Japanese job seekers. It centralizes ES (employment statement) creation, company management, interview logs, and self-analysis tools in one dashboard with AI-assisted review and gamification (XP/leveling).

**Core purpose**: Eliminate friction by consolidating fragmented job-hunting workflows into a single, unified interface. The app's value lies not in pushing users to work harder, but in removing the "friction time" that delays progress.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS v4 (prioritize recommended classes like `bg-linear-to-*`)
- **Backend**: Supabase (Auth/Postgres/Storage with RLS)
- **Auth**: Supabase Auth (Google OAuth)
- **AI**: Provider-agnostic wrapper (`lib/ai/client.ts`) — swaps between Gemini and GPT via `AI_PROVIDER` env var
- **Validation**: Zod (all inputs validated before DB/API)
- **Animations**: Framer Motion
- **Hosting**: Vercel (free tier)
- **Email**: Nodemailer (SMTP)

All dependencies operate on **free tiers** — no paid infrastructure.

## Development Commands

```bash
npm run dev        # Start Next.js dev server (localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type check (run after changes)
npm run format     # Format with Prettier
npm run format:check # Check formatting
```

**Before committing**, always run:

```bash
npm run type-check
npm run lint
npm run format:check
```

## Core Architecture

### Authentication & Authorization

- **Server Components** (`createSupabaseReadonlyClient`): Read-only; no session mutation
- **Route Handlers & Server Actions** (`createSupabaseServerActionClient`): Can mutate session cookies
- **Auth guard**: Unauthenticated requests redirect to `/login`. User context obtained via `supabase.auth.getUser()`
- **RLS enforcement**: All queries scoped to `user_id` at DB layer; Supabase RLS policies prevent cross-user data access

**Example**:

```typescript
// Server Component (read-only)
const supabase = await createSupabaseReadonlyClient();
const { data: userData } = await supabase.auth.getUser();

// Route Handler or Server Action (can write auth)
const supabase = await createSupabaseServerActionClient();
```

### Data Fetching & State Management

- **Server-side first**: Fetch data in Server Components where possible, pass as props to Client Components
- **Parallel queries**: Use `Promise.all()` in Server Components to fetch related data concurrently (see `app/dashboard/page.tsx`)
- **No external state management** (Redux, Zustand): Props and hooks only
- **Client-side mutations**: Use `fetch()` to POST to Route Handlers; validate response and update UI

### AI Integration

All AI calls route through `lib/ai/client.ts`:

```typescript
const client = createAiClient();
const result = await client.call(
  input,
  "es_review" | "company_analysis" | "aptitude_analysis" | "self_analysis" | "interview_review",
);
```

**Features**:

- Swappable providers: `AI_PROVIDER=gemini|gpt`
- Prompt templates: Each `AiPromptKind` has locale-specific (Japanese) system prompts
- Safe failure: If `AI_PROVIDER_API_KEY` is missing, returns a placeholder response
- Rate limiting: 12 requests per 60 seconds per user (enforced in `/api/ai/route.ts`)

**Available prompt types**:

- `es_review`: Review ES content for structure/clarity/impact
- `company_analysis`: Analyze company fit and desired traits
- `aptitude_analysis`: Recommend industries/roles from self-assessment
- `self_analysis`: Extract strengths and career axis
- `interview_review`: Provide feedback on interview performance

### Database Schema & RLS

**Core tables** (all have RLS enabled):

- `profiles`: User profile, XP, level, goals
- `es_entries`: ES drafts/submissions with Markdown, tags, AI summary
- `companies`: Company cards with stage/preference/AI summary
- `calendar_events`: Unified deadlines/interviews/internship dates
- `xp_logs`: Gamification history
- `interview_logs`: Interview records + AI summaries
- `aptitude_results`: One per user (unique index), stores AI diagnosis
- `self_analysis_results`: One per user (unique index), stores AI summary
- `webtest_questions` & `webtest_attempts`: Webtest practice bank

**RLS pattern**: Every table enforces `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE. Querying bypasses RLS only via `createSupabaseAdminClient` (service role key).

**Example RLS policy**:

```sql
CREATE POLICY "Enable read own es" ON es_entries
  FOR SELECT USING (auth.uid() = user_id);
```

### Input Validation

**All inputs validated with Zod** before DB/API:

- `lib/validation/schemas/forms.ts`: Form input schemas
- `lib/validation/schemas/api.ts`: API request body schemas
- `lib/validation/schemas/ai.ts`: AI request schemas
- `lib/validation/schemas/contact.ts`: Contact form schemas
- `lib/validation/schemas/interviews.ts`: Interview schemas

**Pattern**:

```typescript
const schema = z.object({
  /* ... */
});
const parsed = schema.safeParse(formData);
if (!parsed.success) return { error: "Invalid input" };
// Safe to use parsed.data
```

### API Routes

- `POST /api/ai`: Call AI with rate limiting + auth
- `GET|POST|PUT /api/calendar-events`: Manage calendar events (CRUD)
- `POST /api/contact`: Send contact form (SMTP)
- `POST /api/interviews`: Create/update interview logs
- `GET /api/developer/me`: Developer/test endpoint

All Route Handlers:

1. Validate user auth
2. Validate request body with Zod
3. Scope queries to `user_id`
4. Return JSON or error

### UI Patterns & Styling

**Tailwind v4 conventions**:

- Use recommended classes (`bg-linear-to-r`, `text-balance`, `text-wrap`)
- Avoid deprecated v3 syntax to prevent warnings
- Theme: Light mode (`theme-light` class on `<html>`)

**DQ-style UI** (Dragon Quest inspired):

- `dq-window`, `dq-title`, `dq-item`: Quest log panels
- `dq-button`, `dq-button-secondary`: Styled buttons
- `dq-menu-item`: Menu items with hover state (left triangle `▶` moves right on hover)
- Terminology: "クエスト", "ログ", "追加へ" (quest, log, add to)

**Component organization**:

- Page-level layout: `app/_components/layout.tsx` (`AppLayout`)
- Feature-level: Co-locate components in `_components/` subdirs (e.g., `app/dashboard/_components/`)
- Shared utilities: `lib/` (Zod schemas, Supabase clients, AI client, constants)

### Gamification (XP System)

- Users earn XP for actions: ES creation, company addition, interview log, etc.
- Level = `Math.floor(xp / 50) + 1`
- XP logged in `xp_logs` table with `action` and optional `ref_id`
- Dashboard displays current XP, level, and recent log entries
- See `lib/xp/award-xp.ts` for awarding logic

### Common Page Flows

**Dashboard (`/dashboard`)**:

- Fetches: ES entries, profile, calendar events, interviews, XP logs
- Displays: Summary cards, calendar, goal/axis editor, recent activity
- Protected: Redirects if not logged in

**ES Management** (`/es`, `/es/new`, `/es/[id]`):

- Create/edit/delete with Markdown editor
- Add questions and answers
- AI review panel
- Save triggers XP award
- Delete also removes calendar event if present

**Company Management** (`/companies`, `/companies/new`, `/companies/[id]`):

- Track stage (未エントリー → 面接 → 内定 etc.)
- Store mypage ID for tracking
- AI company analysis panel
- Preference/favorite flags

**Login** (`/login`):

- Redirects to Supabase login (Google OAuth)
- On success, Supabase redirects to `/auth/callback` → `/dashboard`

### Development Rules (AGENTS.md)

**Principles**:

- **YAGNI**: Only implement what's needed now; no speculative features
- **KISS**: Prefer simple solutions over complex ones
- **DRY**: Extract duplicated logic into shared utils/components
- **Type safety**: Run `npm run type-check` after changes
- **Validation**: Never trust user input; always validate with Zod

**Implementation specifics**:

- Respect Server/Client Component boundaries (no mixing concerns)
- Validate all form/API inputs before DB access
- Use `createSupabaseReadonlyClient` in Server Components (no cookie mutation)
- Use `createSupabaseServerActionClient` in Route Handlers (cookie mutation allowed)
- AI calls must route through `lib/ai/client.ts`
- AI keys not set → safe failure (no crashes)
- Component max ~200 lines; split if larger
- Directory structure: Group by feature/responsibility, not by type

**UI consistency**:

- Use DQ-window/button classes as base
- Left-triangle hover effect for menu items (no boxed buttons)
- Quest/log terminology

### Environment Variables

**Required**:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://job-seeker-gray.vercel.app (or localhost:3000 locally)

# AI
AI_PROVIDER=gemini|gpt
AI_PROVIDER_API_KEY=...

# Optional AI customization
AI_MODEL=gemini-1.5-flash-latest (for Gemini) or gpt-4o-mini (for GPT)
AI_ENDPOINT=https://api.openai.com/v1/chat/completions (for custom OpenAI endpoint)
AI_API_VERSION=v1beta (for Gemini)

# Contact form (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-mail@example.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=contact-destination@example.com
SMTP_SECURE=true
```

### Supabase Auth Configuration

**Local development** (`http://localhost:3000`):

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`, `http://localhost:3000/dashboard`

**Production** (`https://job-seeker-gray.vercel.app`):

- Site URL: `https://job-seeker-gray.vercel.app`
- Redirect URL: `https://job-seeker-gray.vercel.app/auth/callback`, `https://job-seeker-gray.vercel.app/dashboard`

Configure in Supabase Dashboard → Authentication → URL Configuration.

### Page Structure

**Layout hierarchy**:

- `/` — Home (MVP intro, login/signup links)
- `/login` — Google OAuth entry point
- `/auth/callback` — OAuth callback handler, exchanges code for session
- `/dashboard` — Main hub (read-only, protected)
- `/es`, `/es/new`, `/es/[id]` — ES management
- `/companies`, `/companies/new`, `/companies/[id]` — Company management
- `/interviews`, `/interviews/new`, `/interviews/[id]` — Interview logs
- `/self-analysis` — Self-analysis questionnaire + AI summary
- `/aptitude` — Aptitude check + AI diagnosis
- `/webtests`, `/webtests/new`, `/webtests/[id]` — Webtest practice
- `/profile` — Edit user profile/goals
- `/contact` — Feedback form (logged-in users)

All protected pages: If `auth.getUser()` fails, redirect to `/login`.

### Type Definitions

- `lib/database.types.ts`: Auto-generated Supabase TypeScript types (from Supabase CLI or manual sync)
- Database row types: e.g., `Database["public"]["Tables"]["es_entries"]["Row"]`
- Use these to type-check queries and ensure DB changes propagate to TypeScript

### Deployment

- Hosted on **Vercel** (free Hobby tier)
- Git push to main → auto-deploys
- Environment variables set in Vercel dashboard
- Preview deployments for branches

### Known Patterns & Pitfalls

**Avoid**:

- Writing auth logic in Server Components (use Route Handlers for session mutation)
- Mixing Supabase clients (readonly in Server Components, action client in Route Handlers)
- Skipping Zod validation on any user input
- Hard-coding AI prompts outside `lib/ai/client.ts`
- Querying without `user_id` scope (breaks RLS intent)

**Do**:

- Run `npm run type-check` after edits
- Validate async/await in Route Handlers (await `supabase.auth.getUser()`)
- Scope all DB queries to `user_id` via `.eq("user_id", userId)`
- Test AI calls with missing keys to verify safe failure
- Use `Promise.all()` for concurrent queries
- Pass typed Supabase rows to components for type safety

## Cursor Rules

See `AGENTS.md` for comprehensive Codex guidelines. Key excerpts:

- Follow existing code structure and naming conventions
- Respect App Router basics: Server/Client responsibilities
- Auth queries must be `user_id`-scoped; unauth → redirect to `/login`
- Zod validation for all inputs
- AI calls through `lib/ai/` wrapper; safe failure on missing keys
- Tailwind v4 recommended classes preferred; `bg-linear-to-*` etc.
- DQ UI theme: `dq-window`, `dq-button`, menu items with triangle hover effect
- Split components >200 lines; group by responsibility
