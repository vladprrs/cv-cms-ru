# Tasks: Fix Duplicate User Database Records

**Input**: Design documents from `/specs/004-fix-duplicate-user-dbs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — manual verification via database queries per quickstart.md.

**Organization**: Tasks grouped by user story. US1 must complete before US2 migration can be applied (UNIQUE constraint requires no duplicates).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 — Admin Cleans Up Existing Duplicates (Priority: P1) MVP

**Goal**: Remove 19 duplicate `user_databases` rows so each user has exactly 1 record (34 → 15 rows).

**Independent Test**: Query `SELECT user_id, COUNT(*) as cnt FROM user_databases GROUP BY user_id HAVING cnt > 1` returns 0 rows. Total count equals 15.

### Implementation for User Story 1

- [x] T001 [US1] Create cleanup script following migrate-profile-contacts.ts pattern in src/db/cleanup-duplicate-user-dbs.ts — connect to admin DB via @libsql/client/web, query user_databases grouped by user_id, for each user with duplicates keep the row with MAX(created_at) and delete the rest, log each deletion and print summary
- [ ] T002 [US1] Run cleanup script against production admin DB: `npx dotenv -e .env.local -- npx tsx src/db/cleanup-duplicate-user-dbs.ts` — verify output shows 19 records deleted and 15 remaining (REQUIRES PRODUCTION ENV)

**Checkpoint**: Each user has exactly 1 database record. All users can still access their data.

---

## Phase 2: User Story 2 — System Prevents Future Duplicate Provisioning (Priority: P1)

**Goal**: Add UNIQUE constraint on `user_databases.user_id` and update provisioning code to handle concurrent requests gracefully.

**Independent Test**: Attempting to insert a second `user_databases` row for the same user_id results in a constraint error handled by the application (returns existing record instead of crashing).

**⚠️ Depends on**: US1 completion (duplicates must be removed before UNIQUE index can be created)

### Implementation for User Story 2

- [x] T003 [P] [US2] Add .unique() to userId field in userDatabases table definition in src/auth/admin-schema.ts (line 147, after .notNull(), before .references())
- [x] T004 [P] [US2] Update provisionUserDatabase() in src/app/actions/user-db.ts — wrap the adminDb.insert(userDatabases).values(...) call (line 45) in try-catch: on UNIQUE constraint error (message contains "UNIQUE constraint failed"), re-query for the existing record and return it if ready; if in creating/migrating state, re-query after brief delay; if error state, delete and retry
- [x] T005 [US2] Generate admin DB migration: `npx dotenv -e .env.local -- npm run db:admin:generate` — verify generated SQL contains CREATE UNIQUE INDEX user_databases_user_id_unique
- [ ] T006 [US2] Apply admin DB migration: `npx dotenv -e .env.local -- npm run db:admin:migrate` — verify migration completes successfully (REQUIRES PRODUCTION ENV, RUN AFTER T002)

**Checkpoint**: UNIQUE constraint is active. Concurrent provisioning requests for the same user no longer create duplicates.

---

## Phase 3: User Story 3 — Admin Monitors Database-to-User Ratio (Priority: P2)

**Goal**: Verify admin panel shows accurate counts matching 1:1 user-to-database ratio.

**Independent Test**: Admin panel user count and database record count match after cleanup and constraint are in place.

### Implementation for User Story 3

- [ ] T007 [US3] Verify admin panel displays correct counts by querying: `SELECT COUNT(*) FROM users` and `SELECT COUNT(*) FROM user_databases` — counts should reflect accurate 1:1 ratio (no code change needed if admin panel queries are already correct per commit 5f5a268)

**Checkpoint**: Admin panel accurately reflects true user and database counts.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T008 Run quickstart.md verification queries against admin DB: confirm no duplicates exist, total count is 15, and UNIQUE index is present
- [ ] T009 Verify at least 2 users can log in and access their data without disruption after all changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: No dependencies — can start immediately
- **Phase 2 (US2)**: Depends on Phase 1 completion (UNIQUE index fails if duplicates exist)
- **Phase 3 (US3)**: Depends on Phase 1 and Phase 2 completion (verification of final state)
- **Phase 4 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — start immediately
- **User Story 2 (P1)**: BLOCKS on US1 (cleanup must precede migration). Schema change (T003) and code fix (T004) can be done in parallel, but migration (T005, T006) requires both T002 and T003 complete.
- **User Story 3 (P2)**: Verification only — depends on US1 + US2 being deployed

### Within User Story 2

- T003 (schema) and T004 (code fix) modify different files → can be done in parallel [P]
- T005 (generate migration) depends on T003
- T006 (apply migration) depends on T002 (cleanup done) AND T005 (migration generated)

### Parallel Opportunities

```bash
# After US1 cleanup completes, launch schema + code changes together:
Task T003: "Add .unique() to admin-schema.ts"
Task T004: "Update provisionUserDatabase() in user-db.ts"
# Then sequential: T005 (generate) → T006 (apply)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Create and run cleanup script
2. **STOP and VALIDATE**: Verify 15 records, no duplicates
3. This alone resolves the immediate data integrity issue

### Full Delivery

1. Complete US1 → Cleanup done (MVP!)
2. Complete US2 → Prevention active (T003+T004 in parallel, then T005→T006)
3. Complete US3 → Verified via admin panel
4. Complete Polish → Full confidence

---

## Notes

- T001 creates a one-time script that can be deleted after successful run
- T003 and T004 modify different files — safe to implement in parallel
- T007 may require no code changes if admin panel queries already handle the 1:1 relationship correctly (per prior fix in commit 5f5a268)
- Total scope: 1 new file, 2 modified files, 1 auto-generated migration
