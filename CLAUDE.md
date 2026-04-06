# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CV CMS is a multi-tenant Headless CMS for managing professional career data. Users store atomic "highlights" (achievements, projects, responsibilities) with rich metadata (metrics, skills, domains).

- **Anonymous users** work with IndexedDB in the browser (no account needed)
- **Authenticated users** (GitHub/Google OAuth) get a personal Turso database
- **On first login**, local data auto-migrates to the user's Turso DB
- **Authenticated users** can see their Turso read-only token + DB URL for n8n integration

**Production URL:** https://cv-cms.com

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint

# User Data DB (Drizzle + Turso)
npm run db:generate      # Generate migrations from schema changes
npm run db:migrate       # Apply migrations to database
npm run db:push          # Push schema directly (dev only, skips migrations)
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed          # Seed test data (tsx src/db/seed.ts)

# Admin DB (auth, user metadata)
npm run db:admin:generate  # Generate admin DB migrations
npm run db:admin:migrate   # Apply admin DB migrations
npm run db:admin:push      # Push admin schema directly
# Note: admin DB commands need dotenv: npx dotenv -e .env.local -- npm run db:admin:push
```

## Architecture

### Tech Stack
- Next.js 16 (App Router) + TypeScript
- Auth.js v5 (next-auth) — GitHub + Google OAuth, JWT sessions
- Turso (libSQL/SQLite edge database) + Drizzle ORM
- Dexie (IndexedDB) for anonymous client-side storage
- Tailwind CSS + shadcn/ui + [Tailark Veil](https://tailark.com/veil)
- React Hook Form + Zod validation

### Multi-Tenant Architecture

Two databases:
- **Admin DB** (`TURSO_ADMIN_DB_URL`) — Auth.js tables (users, accounts, sessions) + `userDatabases` mapping
- **Per-user DBs** — Provisioned via Turso Platform API on first login, each user gets their own Turso DB

Data access pattern:
- `DataLayer` interface (`src/lib/data-layer/types.ts`) — shared contract for all data operations
- `ServerDataLayer` — Drizzle/Turso implementation (authenticated users)
- `ClientDataLayer` — Dexie/IndexedDB implementation (anonymous users)
- `ServerActionProxy` — Client-side wrapper that calls server actions (authenticated users in browser)
- `DataContext` (`src/contexts/data-context.tsx`) — React context providing `useDataLayer()` hook

### Data Model

Three tables in `src/db/schema.ts`:

- **Jobs** — Employment contexts (company, role, dates)
- **Highlights** — Atomic experience units linked to jobs, with:
  - Type: `achievement | project | responsibility | education | course | teaching`
  - Tags: `domains[]`, `skills[]`, `keywords[]` (JSON arrays)
  - Metrics: `{ label, value, unit, prefix?, description? }[]`
  - Soft delete via `isHidden` flag
- **Profile** — Single-row table (id='default') storing user profile data:
  - `fullName` — inline-editable on the main page header
  - Contact fields (all nullable): `email`, `phone`, `location`, `linkedin`, `github`, `website`, `telegram`
  - Contacts displayed as icon+text row under name in header, editable via dialog
  - Included in backup/import, local→server migration, and resume optimizer output
  - Types: `Profile` and `UpdateProfile` in `src/lib/types.ts`

### Key Files

- `src/app/actions.ts` — Server Actions with `getDataLayer()` helper for session-based DB routing
- `src/app/actions/user-db.ts` — User DB provisioning, info retrieval, data migration
- `src/app/actions/optimize.ts` — `generateResume(vacancyText, webhookUrl?)` server action: when webhookUrl omitted uses service mode (credits), otherwise calls user's webhook; injects contacts from profile DB (not LLM)
- `src/app/actions/credits.ts` — Credit balance CRUD: `getCreditBalance()`, `consumeCredit()`, `refundCredit()`, `checkServiceStatus()`
- `src/app/actions/payments.ts` — YooKassa payment: `createPayment(packId)`, `getPurchaseStatus(purchaseId)`
- `src/app/api/payments/yookassa/webhook/route.ts` — YooKassa webhook handler: confirms/cancels purchases, credits balance
- `src/app/optimize/page.tsx` — Resume optimizer page: vacancy input, AI-generated resume preview, inline editing, PDF export
- `src/lib/credits.ts` — Pack catalog config (PACKS constant), PackId type, Zod schema
- `src/lib/yookassa.ts` — YooKassa SDK wrapper (PaymentsApi), webhook payload Zod schema
- `src/lib/data-layer/` — DataLayer interface + 3 implementations
- `src/auth/index.ts` — Auth.js config (providers, adapter, callbacks)
- `src/auth/admin-schema.ts` — Admin DB Drizzle schema
- `src/db/index.ts` — DB connections (`getUserDb(userId)`, `createDbFromCredentials()`)
- `src/db/turso-platform.ts` — Turso Platform API client (DB provisioning, token creation)
- `src/db/migrate-user-db.ts` — Runs DDL against new user DBs (jobs, highlights, profile tables)
- `src/contexts/data-context.tsx` — DataProvider + `useDataLayer()` hook
- `src/components/auth/` — AuthButton, ModeIndicator, MigrationHandler
- `src/components/profile/contacts-editor.tsx` — Dialog for editing profile contact fields
- `src/db/migrate-profile-contacts.ts` — One-time migration script for adding contact columns to existing DBs
- `src/lib/types.ts` — Shared TypeScript types (Job, Highlight, Profile, Insert/Update types)
- `src/lib/data-types.ts` — Shared composite types (SearchFilters, BackupData, etc.)

### Page Structure

| Route | Purpose |
|-------|---------|
| `/` | Timeline view — server-rendered for authenticated, client-loaded for anonymous |
| `/optimize` | AI resume optimizer — paste vacancy, get tailored resume (authenticated only) |
| `/settings` | Account info, n8n webhook URL, data storage indicator |
| `/api/auth/[...nextauth]` | Auth.js route handler |

### n8n Integration

The `/optimize` page integrates with an external n8n workflow via webhook:

- The n8n webhook URL is stored in the user's browser (`localStorage` key: `n8n-webhook-url`), configured in Settings
- The `generateResume(vacancyText, webhookUrl)` server action fetches all user data (profile, jobs, highlights) server-side and sends it to the webhook
- The n8n workflow receives `{ vacancyText, highlightsData }` and returns a structured JSON resume
- After receiving the LLM response, the server action injects the user's name and contact details from the profile DB — personal data is never sent to the LLM

Expected n8n workflow pattern: Webhook POST → Validate Input → Prepare Prompt → LLM Chain → Respond with JSON.

### Conventions

- Use Server Actions (not API routes) for mutations
- All server actions use `getDataLayer()` to route to the correct user DB
- Anonymous users never call server actions — they use `ClientDataLayer` directly
- Call `revalidatePath()` after data changes (authenticated mode only)
- Store dates as ISO strings (`YYYY-MM-DD`)
- UUIDs via `crypto.randomUUID()`
- Zod validation on both client forms and server actions
- `undefined` from Zod optional fields must be normalized to `null` before passing to DataLayer

## Environment Variables

```bash
# Admin DB (auth + user metadata)
TURSO_ADMIN_DB_URL="libsql://your-admin-db.turso.io"
TURSO_ADMIN_DB_TOKEN="your-admin-token"

# Turso Platform API (for provisioning user DBs)
TURSO_PLATFORM_API_TOKEN="your-platform-token"
TURSO_ORG_NAME="your-org"

# Auth.js
AUTH_SECRET="generated-secret"                  # npx auth secret
AUTH_GITHUB_ID="github-oauth-app-id"
AUTH_GITHUB_SECRET="github-oauth-app-secret"
AUTH_GOOGLE_ID="google-oauth-client-id"
AUTH_GOOGLE_SECRET="google-oauth-client-secret"
```

Note: The n8n webhook URL is stored in the user's browser (localStorage key: `n8n-webhook-url`), not as a server environment variable.

## Schema Migrations

- `npm run db:generate` works for generating migration SQL files
- `npm run db:push` does NOT work with the current drizzle-kit version + Turso driver
- To apply schema changes to production, run the SQL directly against Turso using `@libsql/client`:
  - Existing user DBs: query `user_databases` table in admin DB for URLs/tokens, run SQL against each
  - New user DBs get the schema automatically via `src/db/migrate-user-db.ts`
- `migrate-user-db.ts` also runs ALTER TABLE statements (with try/catch) for columns added after initial schema, so existing user DBs get updated on next provisioning/migration call
- Example one-time migration script: `src/db/migrate-profile-contacts.ts` — run with `npx dotenv -e .env.local -- npx tsx src/db/migrate-profile-contacts.ts`

## Git Workflow

- Branch naming: `feature/*`, `bugfix/*`, `hotfix/*`
- Commits: Conventional Commits format (`feat(scope): message`)
- PRs to `main` → auto-deploys to Vercel production

## Active Technologies
- TypeScript (Next.js 16 App Router) + Next.js 16, Auth.js v5, Drizzle ORM, @yookassa/sdk (NEW), Zod, shadcn/ui (001-service-resume-subscription)
- Admin DB (Turso/libSQL) — new tables for credits, purchases, usage records (001-service-resume-subscription)
- TypeScript 5.x (Next.js 16 App Router) + Next.js 16, Auth.js v5, Drizzle ORM, shadcn/ui, lucide-react, Zod (002-admin-panel)
- Turso (libSQL) admin database via `getAdminDb()` singleton (002-admin-panel)
- TypeScript 5.x (Next.js 16 App Router) + Next.js 16, Auth.js v5 (next-auth), Drizzle ORM, shadcn/ui, Zod (003-pd-152fz-compliance)
- Turso (libSQL) — admin DB + per-user DBs; IndexedDB (anonymous); localStorage (webhook URL, theme) (003-pd-152fz-compliance)

## Recent Changes
- 001-service-resume-subscription: Added TypeScript (Next.js 16 App Router) + Next.js 16, Auth.js v5, Drizzle ORM, @yookassa/sdk (NEW), Zod, shadcn/ui
