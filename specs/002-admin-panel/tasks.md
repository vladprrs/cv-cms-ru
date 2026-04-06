# Tasks: Admin Panel for User Management

**Input**: Design documents from `/specs/002-admin-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks grouped by user story. US4 (Access Control) is foundational and placed in Phase 2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Schema changes and environment configuration

- [X] T001 [P] Add `ADMIN_EMAILS` environment variable to `.env.example` with documentation comment
- [X] T002 Add `creditAdjustments` table to `src/auth/admin-schema.ts` with fields: id, adminUserId (FK→users), targetUserId (FK→users), amount (integer), previousBalance (integer), newBalance (integer), reason (text), createdAt (text ISO)
- [X] T003 Generate and apply admin DB migration: run `npm run db:admin:generate` then `npx dotenv -e .env.local -- npm run db:admin:push`

---

## Phase 2: Foundational — Admin Access Control (US4)

**Purpose**: Auth guard infrastructure that MUST be complete before ANY admin page can be built

**⚠️ CRITICAL**: No admin page work can begin until this phase is complete

- [X] T004 [P] Create admin authorization helper in `src/lib/admin.ts`: export `isAdmin(email: string): boolean` that parses `ADMIN_EMAILS` env var (comma-separated), export `ADMIN_EMAILS` constant; also export Zod schemas `creditAdjustmentSchema` (amount: nonzero integer, reason: min 1 char) and `userSearchSchema` (query: optional string, sortBy: enum, sortOrder: enum, page: positive int)
- [X] T005 Create admin server actions file `src/app/actions/admin.ts` with `'use server'` directive: implement `requireAdmin()` async helper that checks session via `auth()`, verifies `isAdmin(session.user.email)`, and returns `{ adminId, adminEmail }` or throws; this is the auth guard used by all subsequent admin actions

**Checkpoint**: Admin auth guard ready — admin page implementation can begin

---

## Phase 3: User Story 1 — View User List (Priority: P1) 🎯 MVP

**Goal**: Paginated, searchable, sortable list of all registered users with key metrics

**Independent Test**: Sign in as admin, navigate to `/admin`, verify user list shows all registered users with name, email, avatar, registration date, credit balance, database status, and login provider. Test search by name/email, column sorting, and pagination.

### Implementation for User Story 1

- [X] T006 [US1] Implement `getUsers(params)` server action in `src/app/actions/admin.ts`: accept validated search/sort/pagination params; query `users` table with LEFT JOINs to `creditBalances`, `userDatabases`, `accounts`; apply LIKE filter on name/email; sort by requested column; paginate with LIMIT 20 / OFFSET; return `{ users, totalCount, page, totalPages }`
- [X] T007 [US1] Create admin page at `src/app/admin/page.tsx` as server component with `dynamic = 'force-dynamic'`: check admin access via `requireAdmin()` (redirect to `/` if denied, redirect to `/signin` if unauthenticated); render user list using shadcn Table with columns (avatar, name, email, provider badge, credit balance, DB status badge, registration date); add search Input above table; add sortable column headers; add pagination controls below table; pass search/sort/page via URL searchParams

**Checkpoint**: User Story 1 fully functional — admin can browse, search, sort, and paginate all users

---

## Phase 4: User Story 2 — View User Detail (Priority: P2)

**Goal**: Detailed view of a single user's account, credits, purchases, and usage history

**Independent Test**: From the user list, click any user row. Verify detail page shows: account info (name, email, avatar, ID), linked OAuth providers, database info (name, URL, status, created), credit balance, credit adjustment history, purchase history, and usage records.

### Implementation for User Story 2

- [X] T008 [US2] Implement `getUserDetail(userId)` server action in `src/app/actions/admin.ts`: call `requireAdmin()`; fetch user by ID from `users`; fetch linked accounts from `accounts`; fetch userDatabase from `userDatabases`; fetch creditBalance from `creditBalances`; fetch purchases from `purchases` (ordered by createdAt DESC); fetch usageRecords from `usageRecords` (ordered by createdAt DESC); fetch creditAdjustments from `creditAdjustments` (ordered by createdAt DESC); return combined object or `{ error }` if user not found
- [X] T009 [US2] Create user detail page at `src/app/admin/users/[id]/page.tsx` as server component with `dynamic = 'force-dynamic'`: check admin access; call `getUserDetail(params.id)`; render sections using shadcn Cards: account info card (name, email, avatar, ID), OAuth providers card (badges per provider), database info card (name, URL, status badge, created date), credit balance card (current balance), adjustment history section (shadcn Table: date, admin email, amount with +/- formatting, previous→new balance, reason), purchase history section (shadcn Table: date, pack, credits, price ₽, status badge), usage history section (shadcn Table: date, status badge); add back link to `/admin`

**Checkpoint**: User Stories 1 and 2 both work — admin can browse users and inspect any user's full profile

---

## Phase 5: User Story 3 — Manage Credit Balance (Priority: P2)

**Goal**: Admin can adjust any user's credit balance with audit logging

**Independent Test**: On a user's detail page, click "Adjust Balance". Add credits (+5, reason "bonus") — verify balance updates, adjustment appears in history. Try subtracting more than available — verify error. Try subtracting valid amount — verify balance decreases, logged.

### Implementation for User Story 3

- [X] T010 [US3] Implement `adjustCreditBalance(targetUserId, amount, reason)` server action in `src/app/actions/admin.ts`: call `requireAdmin()` to get adminId; validate input with `creditAdjustmentSchema`; fetch current balance; compute newBalance and verify >= 0; atomically update `creditBalances` and insert `creditAdjustments` record with previousBalance, newBalance, adminUserId, reason; if user has no creditBalance row, create one; call `revalidatePath` for the user detail page; return `{ success, newBalance }` or `{ error }`
- [X] T011 [P] [US3] Create credit adjustment dialog as client component at `src/app/admin/users/[id]/credit-adjustment-dialog.tsx`: shadcn Dialog with form containing: numeric Input for amount (positive to add, negative to subtract), text Input for reason (required), submit Button; call `adjustCreditBalance` server action on submit; show loading state during submission; show error message if action fails; close dialog and signal parent to refresh on success; show self-admin warning if targetUserId matches current admin
- [X] T012 [US3] Integrate credit adjustment dialog into user detail page `src/app/admin/users/[id]/page.tsx`: add "Adjust Balance" Button next to credit balance card that opens the dialog; pass targetUserId and current adminId as props to the dialog component

**Checkpoint**: User Stories 1, 2, and 3 all work — full user management with credit adjustment and audit trail

---

## Phase 6: User Story 5 — Platform Dashboard (Priority: P3)

**Goal**: Aggregate platform statistics displayed at the top of the admin page

**Independent Test**: Navigate to `/admin`, verify dashboard section shows: total users count, users with databases count, total credits across all users, confirmed purchases count and total revenue (₽), total usage records count. Register a new user or make a purchase, refresh — stats update.

### Implementation for User Story 5

- [X] T013 [US5] Implement `getDashboardStats()` server action in `src/app/actions/admin.ts`: call `requireAdmin()`; run aggregate queries: COUNT users, COUNT userDatabases WHERE status='ready', SUM creditBalances.balance, COUNT+SUM purchases WHERE status='confirmed', COUNT usageRecords; return stats object
- [X] T014 [US5] Add dashboard stats section to `src/app/admin/page.tsx`: render stats cards grid above the user list using shadcn Cards; display: total users, users with DBs, total credits, purchases (count + revenue in ₽), total usage; call `getDashboardStats()` server-side

**Checkpoint**: All user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and final validation

- [X] T015 Review and add edge case handling across admin pages: empty states when no users/purchases/usage exist (show placeholder text); DB status error badge styling (red/warning); self-admin warning in credit adjustment dialog; graceful error display if admin DB query fails
- [X] T016 Run quickstart.md validation checklist: verify all 6 items pass (admin page loads, non-admin redirected, user detail shows all sections, credit dialog works, adjustment history visible, dashboard stats correct)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T002 (schema) — BLOCKS all admin pages
- **US1 (Phase 3)**: Depends on Phase 2 completion — MVP delivery point
- **US2 (Phase 4)**: Depends on Phase 2; benefits from US1 (user list links to detail) but testable independently via direct URL
- **US3 (Phase 5)**: Depends on Phase 2 + T002 (creditAdjustments table); integrates into US2 detail page
- **US5 (Phase 6)**: Depends on Phase 2; independent of US1–US3
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US4 (Access Control)**: Foundational — no story dependencies
- **US1 (User List)**: Can start after Phase 2 — no story dependencies
- **US2 (User Detail)**: Can start after Phase 2 — independent of US1 (accessible via direct URL)
- **US3 (Credit Management)**: Can start after Phase 2 — integrates into US2 detail page (T012 depends on T009)
- **US5 (Dashboard)**: Can start after Phase 2 — fully independent

### Parallel Opportunities

- T001 ∥ T002 (different files)
- T004 ∥ T005 possible but T005 imports from T004
- T011 ∥ T010 (different files: dialog component vs server action)
- T013 ∥ T014 cannot parallel (T014 calls T013)
- US1, US2, US5 can all proceed in parallel after Phase 2

---

## Parallel Example: Phase 1

```text
# These can run simultaneously:
Task T001: "Add ADMIN_EMAILS to .env.example"
Task T002: "Add creditAdjustments table to src/auth/admin-schema.ts"
```

## Parallel Example: User Story 3

```text
# These can run simultaneously:
Task T010: "Implement adjustCreditBalance() server action in src/app/actions/admin.ts"
Task T011: "Create credit adjustment dialog in src/app/admin/users/[id]/credit-adjustment-dialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational / US4 (T004–T005)
3. Complete Phase 3: User Story 1 (T006–T007)
4. **STOP and VALIDATE**: Admin can sign in, see user list, search, sort, paginate
5. Deploy if ready — basic admin visibility delivered

### Incremental Delivery

1. Setup + Foundational → Admin auth guard ready
2. Add US1 (User List) → Test → Deploy (MVP!)
3. Add US2 (User Detail) → Test → Deploy (support visibility)
4. Add US3 (Credit Management) → Test → Deploy (support operations)
5. Add US5 (Dashboard) → Test → Deploy (strategic insight)
6. Polish → Final validation → Deploy

---

## Notes

- All admin pages are server components (no `'use client'`) except the credit adjustment dialog (T011)
- All server actions use `requireAdmin()` as first line — no data exposed without admin verification
- Credit adjustment is the only write operation; everything else is read-only
- The creditAdjustments table stores balance snapshots (previousBalance, newBalance) for complete audit trail
- URL searchParams used for search/sort/pagination state (bookmarkable, shareable between admins)
