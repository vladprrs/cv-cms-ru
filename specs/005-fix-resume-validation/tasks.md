# Tasks: Fix Resume Validation Error

**Input**: Design documents from `/specs/005-fix-resume-validation/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not requested — manual verification via /optimize page per quickstart.md.

**Organization**: Tasks grouped by user story. US1 is the core fix (MVP). US2 improves error messages.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 — User Successfully Generates an Optimized Resume (Priority: P1) MVP

**Goal**: Fix the false-positive validation error by reordering profile injection before validation and removing the `name` check from AI response validation.

**Independent Test**: Submit a job description on /optimize page as an authenticated user. Verify a resume is displayed (not an error) with the user's name and contacts from their profile.

### Implementation for User Story 1

- [x] T001 [P] [US1] In src/app/actions/optimize.ts — move the profile injection block (name + contacts, currently after validation) to before the validation check; change validation from `!resumeData.name || !resumeData.experience` to `!Array.isArray(resumeData.experience) || resumeData.experience.length === 0`
- [x] T002 [P] [US1] In src/app/optimize/optimize-client.tsx — apply identical fix: move profile injection block before validation; change validation to `!Array.isArray(resumeData.experience) || resumeData.experience.length === 0`

**Checkpoint**: Resume generation no longer fails with "Invalid resume data" when AI returns valid experience data without a `name` field.

---

## Phase 2: User Story 2 — Clear Feedback on Genuinely Invalid AI Responses (Priority: P2)

**Goal**: Replace the generic error message with a specific one that tells the user what went wrong.

**Independent Test**: Simulate an AI response with no `experience` array and verify the error message says "AI agent did not return any experience entries" instead of the generic message.

### Implementation for User Story 2

- [x] T003 [P] [US2] In src/app/actions/optimize.ts — update the error message in the validation block from 'Invalid resume data received from AI agent' to 'AI agent did not return any experience entries. Please try again.'
- [x] T004 [P] [US2] In src/app/optimize/optimize-client.tsx — update the same error message to match: 'AI agent did not return any experience entries. Please try again.'

**Checkpoint**: Error messages are specific and actionable when the AI genuinely fails.

---

## Phase 3: Polish & Verification

**Purpose**: Final verification

- [x] T005 Build the project with `npm run build` to verify no compilation errors
- [ ] T006 Verify on /optimize page that resume generation works end-to-end (manual post-deploy)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: No dependencies — can start immediately
- **Phase 2 (US2)**: Can be done in parallel with US1 (same files but different lines); however, since US1 moves code around, US2 error message changes should be applied after US1 reordering
- **Phase 3 (Polish)**: Depends on Phase 1 and Phase 2 completion

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — start immediately
- **User Story 2 (P2)**: Logically depends on US1 (error message is in the validation block that US1 modifies)

### Parallel Opportunities

```bash
# T001 and T002 modify different files — can run in parallel:
Task T001: "Fix server-side path in src/app/actions/optimize.ts"
Task T002: "Fix client-side path in src/app/optimize/optimize-client.tsx"

# T003 and T004 also modify different files — but depend on T001/T002 respectively
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 + T002 in parallel (different files)
2. **STOP and VALIDATE**: Test resume generation on /optimize page
3. This alone resolves the blocking bug

### Full Delivery

1. Complete US1 (T001 + T002) → Core fix done (MVP!)
2. Complete US2 (T003 + T004) → Better error messages
3. Complete Polish (T005 + T006) → Verified and ready to ship

---

## Notes

- T001 and T002 are the critical tasks — they fix the actual bug
- T003 and T004 are improvements that should be applied in the same commit as T001/T002 since they touch the same validation blocks
- Total scope: 2 files modified, ~20 lines changed
- In practice, T001+T003 can be done as a single edit in optimize.ts, and T002+T004 as a single edit in optimize-client.tsx
