# Implementation Plan: Fix Resume Validation Error

**Branch**: `005-fix-resume-validation` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-fix-resume-validation/spec.md`

## Summary

Fix the false-positive "Invalid resume data received from AI agent" error caused by validating the `name` field before profile injection. Move profile data injection before validation, remove the `name` requirement from AI response validation (since it's always injected from the profile DB), and improve error messages for genuinely invalid responses.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 16 App Router)
**Primary Dependencies**: Next.js 16, React 19
**Storage**: N/A — no schema changes, fix is in application logic only
**Testing**: Manual verification via the /optimize page
**Target Platform**: Vercel (serverless)
**Project Type**: Web service (multi-tenant CMS)
**Performance Goals**: N/A — bug fix
**Constraints**: Must fix both server-side and client-side code paths identically
**Scale/Scope**: 2 files, ~20 lines changed total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server Actions Over API Routes | PASS | Fix modifies existing server action (`optimize.ts`). No new API routes. |
| II. DataLayer Contract | PASS | No data layer changes. Fix is in the optimize action which operates outside the DataLayer (AI agent communication). |
| III. Multi-Tenant Data Isolation | PASS | No tenant data access changes. Profile injection already exists; we're just reordering it. |
| IV. Validation at Boundaries | PASS | Improves validation — removes false-positive check, keeps genuine validation of AI response structure. |
| V. Simplicity | PASS | Minimal change: reorder existing code, no new abstractions. |

**Gate result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-resume-validation/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: root cause analysis
├── quickstart.md        # Phase 1: implementation guide
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── actions/
│   │   └── optimize.ts              # MODIFY: reorder injection before validation, fix validation logic
│   └── optimize/
│       └── optimize-client.tsx       # MODIFY: same fix for client-side webhook path
```

**Structure Decision**: All changes fit within existing files. No new files needed — this is a pure logic reorder + validation fix in 2 existing files.
