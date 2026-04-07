# Research: Fix Resume Validation Error

**Feature**: 005-fix-resume-validation
**Date**: 2026-04-07

## R1: Root Cause — Validation Before Injection

**Decision**: Move profile data injection before the validation check, then validate only the `experience` field from the AI response.

**Rationale**: The current code flow is:
1. Parse AI response → `resumeData`
2. Validate: `if (!resumeData.name || !resumeData.experience)` → ERROR
3. Inject profile name and contacts into `resumeData`

Step 2 rejects the response for missing `name` that step 3 would have provided. The AI agent doesn't return a `name` field because personal data is never sent to it (by design, for privacy). The fix is to reorder steps 2 and 3.

**Alternatives considered**:
- Have the AI agent return a placeholder name: Rejected — the system already handles name injection; the AI shouldn't need to know the user's name.
- Remove validation entirely: Rejected — we still need to verify `experience` exists (the actual resume content from the AI).
- Add `name` to the data sent to the AI: Rejected — violates the privacy design where personal data is never sent to the LLM.

## R2: Validation Scope After Fix

**Decision**: Validate only `experience` — it must be a non-empty array. Do not validate `name` since it is always injected from the profile.

**Rationale**: The `experience` array is the only field the AI must generate. All other fields (`name`, `contacts`) are injected from the profile DB. Fields like `summary`, `skills`, `education` are optional enrichments — a resume with just experience entries is still useful. Checking `Array.isArray(resumeData.experience) && resumeData.experience.length > 0` is more precise than the current truthy check.

**Alternatives considered**:
- Validate all fields (name, summary, experience, skills, education): Rejected — over-validation; `name` is injected, and the AI may legitimately omit `skills` or `education` depending on the vacancy.
- Use a Zod schema for full validation: Rejected — violates Simplicity principle; the fix should be minimal. A Zod schema can be added later if fragile AI responses become a recurring issue.

## R3: Client-Side Consistency

**Decision**: Apply the identical fix to both `src/app/actions/optimize.ts` (server-side) and `src/app/optimize/optimize-client.tsx` (client-side webhook path).

**Rationale**: Both paths have identical parsing and validation code. The client-side path is used when anonymous users or users with their own n8n webhook generate a resume. The same root cause (validating `name` before injection) exists in both paths.

**Alternatives considered**:
- Extract shared validation logic to a utility function: Rejected — violates Simplicity principle. Two locations with ~5 lines of identical logic don't warrant an abstraction.

## R4: Error Message Improvement

**Decision**: Replace the generic "Invalid resume data received from AI agent" with a more specific message: "AI agent did not return any experience entries. Please try again."

**Rationale**: The only remaining validation failure case is missing `experience`. A specific message helps users understand the issue and decide whether to retry or adjust their input.

**Alternatives considered**:
- Keep the generic message: Rejected — unhelpful for debugging; users don't know what "invalid" means.
- Show the raw AI response to the user: Rejected — exposes internal implementation details and may contain confusing or large payloads.
