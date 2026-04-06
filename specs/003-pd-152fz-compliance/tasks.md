# Tasks: 152-FZ Personal Data Compliance

**Input**: Design documents from `/specs/003-pd-152fz-compliance/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-actions.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create shared types, constants, and Zod schemas used across all user stories

- [x] T001 Create consent constants (CURRENT_CONSENT_VERSION = "2026-04-06-v1"), scope keys (`personal_data_processing`, `third_party_data_sharing`), TypeScript types, and Zod validation schemas in `src/lib/consent.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema changes, platform API additions, and server actions that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add `consents` table definition (id, userId, consentVersion, scope, consentedAt, withdrawnAt) with userId+scope composite index to admin DB schema in `src/auth/admin-schema.ts`
- [x] T003 [P] Add `deleteUserDatabase(dbName: string)` function using `DELETE /v1/organizations/{org}/databases/{dbName}` endpoint in `src/db/turso-platform.ts`
- [x] T004 Generate and push admin DB schema migration to apply the consents table (`npx dotenv -e .env.local -- npm run db:admin:push`)
- [x] T005 [P] Implement consent server actions (`recordConsent`, `checkConsent`, `getConsentStatus`) per contracts in `src/app/actions/consent.ts`
- [x] T006 Add consent status fields (`hasConsent`, `consentVersion`, `needsReconsent`, `reconsentDeadline`) to Auth.js JWT and session callbacks in `src/auth/index.ts`

**Checkpoint**: Foundation ready — consent infrastructure operational, user story implementation can begin

---

## Phase 3: User Story 1 — Explicit Consent Before Registration (Priority: P1) MVP

**Goal**: Block OAuth sign-in until user explicitly consents to personal data processing via checkbox. Show re-consent banner when Privacy Policy version changes.

**Independent Test**: Navigate to sign-in page, verify consent checkbox blocks OAuth buttons. Check checkbox, sign in, verify consent record created in admin DB. Bump CURRENT_CONSENT_VERSION, verify banner appears on all pages and access is suspended after 14 days.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create reusable consent checkbox component with summary text ("I consent to the processing of my personal data...") and expandable Privacy Policy link in `src/components/consent/consent-checkbox.tsx`
- [x] T008 [P] [US1] Create persistent re-consent banner component that reads `needsReconsent` and `reconsentDeadline` from session, shows banner on all pages, and suspends access after deadline in `src/components/consent/consent-banner.tsx`
- [x] T009 [US1] Integrate consent checkbox on sign-in page: disable OAuth buttons until checked, pass consent state through OAuth flow, record `personal_data_processing` consent after successful callback in `src/app/signin/page.tsx`
- [x] T010 [US1] Add ConsentBanner wrapper to root layout for authenticated users, handling re-consent flow and 14-day soft block enforcement in `src/app/layout.tsx`

**Checkpoint**: New users must consent before sign-in. Existing users without consent see consent screen on next login. Policy version mismatch triggers persistent banner with 14-day deadline.

---

## Phase 4: User Story 2 — Updated Privacy Policy with 152-FZ Requirements (Priority: P1)

**Goal**: Provide a legally complete Privacy Policy page with all sections required by Russian Federal Law 152-FZ.

**Independent Test**: Open `/privacy` page, verify all required sections are present: operator identity and contact email, data categories (auth, career, payment), processing purposes per category, legal basis (consent per Art. 6), retention periods per category, third-party list (GitHub, Google, Turso, YooKassa, AI service), full user rights description, and instructions for data subject requests via email.

### Implementation for User Story 2

- [x] T011 [US2] Rewrite Privacy Policy page with all 152-FZ sections: operator identity, contact details (email for data requests), exhaustive data categories, processing purposes, legal basis, retention periods (auth data, career data, payment data — 5 years per 402-FZ), third-party list with data scope, user rights (access, correction, deletion, withdrawal of consent), and request instructions in `src/app/privacy/page.tsx`

**Checkpoint**: Privacy Policy page is legally complete per 152-FZ requirements and accessible to all visitors (authenticated or not).

---

## Phase 5: User Story 3 — Right to Withdraw Consent and Delete Account (Priority: P1)

**Goal**: Enable authenticated users to export all personal data and permanently delete their account with full cascade across all storage locations.

**Independent Test**: Sign in as test user, navigate to Settings, click Delete Account, verify dialog warns about credit forfeiture, export data, confirm deletion. Verify: user record deleted from admin DB, Turso DB deleted via Platform API, purchases anonymized (userId = 'deleted-user'), consent record has withdrawnAt set, user is signed out and redirected to homepage.

### Implementation for User Story 3

- [x] T012 [US3] Implement `deleteAccount()` server action with full cascade: (1) invalidate sessions, (2) delete Turso DB via Platform API, (3) anonymize purchases (userId → 'deleted-user'), (4) set withdrawnAt on consent records, (5) delete usageRecords/creditBalances/creditAdjustments/userDatabases/accounts, (6) delete user record. Abort on Turso API failure. In `src/app/actions/account.ts`
- [x] T013 [US3] Implement `exportAccountData()` server action returning JSON with: profile, jobs, highlights, consent records, credit balance, purchase history, and account metadata (name, email, registration date) in `src/app/actions/account.ts`
- [x] T014 [US3] Add "Delete Account" section to Settings page with: confirmation dialog warning about permanent deletion and credit forfeiture, data export download step before final confirmation, deletion trigger calling `deleteAccount()`, and redirect to homepage with confirmation message on completion in `src/app/settings/page.tsx`

**Checkpoint**: Users can export all data and fully delete their account in 3 steps (Settings → Delete → Confirm). All personal data removed from all databases.

---

## Phase 6: User Story 4 — Consent Record for Third-Party Data Sharing (Priority: P2)

**Goal**: Inform users before career data is sent to third-party AI services and record their acknowledgment.

**Independent Test**: Navigate to `/optimize` as first-time user, attempt to submit vacancy — verify data sharing notice appears explaining what data is sent and to whom. Acknowledge notice, verify subsequent submissions skip notice. Configure custom webhook URL in Settings, verify disclaimer is shown.

### Implementation for User Story 4

- [x] T015 [US4] Add first-time data sharing notice dialog on /optimize page: explain that career data (not contacts) will be sent to third-party AI service, require acknowledgment before first submission, record `third_party_data_sharing` consent via `recordConsent`, skip notice on subsequent visits by checking consent status in `src/app/optimize/optimize-client.tsx`
- [x] T016 [US4] Add disclaimer notice when user saves custom webhook URL in Settings, warning that data will be sent to their specified external service in `src/app/settings/page.tsx`

**Checkpoint**: First-time /optimize users see and acknowledge data sharing notice. Custom webhook saves show disclaimer. Both consent events are recorded in admin DB.

---

## Phase 7: User Story 5 — Data Processing Consent Record Storage (Priority: P2)

**Goal**: Maintain an auditable trail of all consent events with timestamps, versions, and scope.

**Note**: This user story's implementation is fully covered by earlier phases:
- **Consent table and actions**: Phase 2 (T002, T004, T005) — `consents` table with audit fields
- **Recording consent on sign-in**: Phase 3 / US1 (T009) — `personal_data_processing` consent recorded
- **Recording third-party consent**: Phase 6 / US4 (T015) — `third_party_data_sharing` consent recorded
- **Withdrawal timestamp on deletion**: Phase 5 / US3 (T012) — `withdrawnAt` set on all consent records

No additional tasks are needed. Verify during Phase 8 testing that consent records are complete and queryable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation across all user stories and edge cases

- [x] T017 Verify edge cases: (1) existing user without consent record sees consent screen on next login, (2) bumped CURRENT_CONSENT_VERSION triggers re-consent banner, (3) 14-day re-consent deadline suspends access, (4) account deletion with unused credits shows forfeiture warning, (5) data export before deletion includes all admin DB data
- [x] T018 Run full quickstart.md testing checklist and validate all acceptance scenarios from spec.md across all user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2 completion — can run in parallel with US1 and US2
- **US4 (Phase 6)**: Depends on Phase 2 completion — can run in parallel with US1, US2, US3
- **US5 (Phase 7)**: No tasks — covered by earlier phases
- **Polish (Phase 8)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Requires foundational consent infrastructure. No dependencies on other stories.
- **US2 (P1)**: Standalone page rewrite. No dependencies on other stories. US1 links to this page.
- **US3 (P1)**: Requires `deleteUserDatabase()` from foundational. No dependencies on other stories.
- **US4 (P2)**: Requires consent actions from foundational. No dependencies on other stories.
- **US5 (P2)**: Infrastructure story — fully implemented in foundational + US1 + US3.

### Within Each User Story

- Components before page integration
- Server actions before UI that calls them
- Core flow before edge cases

### Parallel Opportunities

- T003 and T005 can run in parallel within Phase 2 (different files)
- T007 and T008 can run in parallel within US1 (different component files)
- **All user stories (US1–US4) can run in parallel** after Phase 2 completes (different pages/files)

---

## Parallel Example: After Phase 2 Completion

```text
# All four user stories can start simultaneously:
Story US1: "Create consent checkbox in src/components/consent/consent-checkbox.tsx"
Story US2: "Rewrite Privacy Policy in src/app/privacy/page.tsx"
Story US3: "Implement deleteAccount in src/app/actions/account.ts"
Story US4: "Add data sharing notice in src/app/optimize/optimize-client.tsx"
```

## Parallel Example: Within User Story 1

```text
# Launch both components together:
Task T007: "Create consent checkbox in src/components/consent/consent-checkbox.tsx"
Task T008: "Create re-consent banner in src/components/consent/consent-banner.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T006)
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: Consent flow works end-to-end
5. Deploy — app now collects consent before sign-in

### Incremental Delivery

1. Setup + Foundational → Consent infrastructure ready
2. Add US1 → Consent before sign-in (MVP!)
3. Add US2 → Legally complete Privacy Policy
4. Add US3 → Account deletion with data export
5. Add US4 → Third-party data sharing notices
6. Each story adds compliance coverage without breaking previous stories

### Suggested MVP Scope

**US1 + US2** together form the minimum viable compliance:
- US1 gates sign-in behind consent (legal requirement)
- US2 provides the Privacy Policy that consent references (legal requirement)
- Without both, the consent flow references a policy that doesn't meet 152-FZ standards

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- US5 has no dedicated tasks — its acceptance criteria are satisfied by infrastructure in earlier phases
- Financial records (purchases) are anonymized on deletion, not deleted (402-FZ, 5-year retention)
- Consent records are never deleted — `withdrawnAt` is set for audit trail
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
