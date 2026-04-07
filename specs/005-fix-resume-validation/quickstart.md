# Quickstart: Fix Resume Validation Error

**Feature**: 005-fix-resume-validation
**Date**: 2026-04-07

## Implementation Order

Execute in this exact sequence:

### Step 1: Fix Server-Side Path

**File**: `src/app/actions/optimize.ts`

In `generateResume()`, after parsing the AI response (the `resumeData` variable is set around line 137-152):

1. **Move** the profile injection block (currently lines 164-176) to **before** the validation check (currently line 155)
2. **Change** the validation from:
   ```
   if (!resumeData.name || !resumeData.experience)
   ```
   to:
   ```
   if (!Array.isArray(resumeData.experience) || resumeData.experience.length === 0)
   ```
3. **Update** the error message from `'Invalid resume data received from AI agent'` to `'AI agent did not return any experience entries. Please try again.'`

The resulting order should be:
1. Parse AI response → `resumeData`
2. Inject profile name and contacts into `resumeData`
3. Validate `experience` exists and is non-empty
4. Return `{ data: resumeData }`

### Step 2: Fix Client-Side Path

**File**: `src/app/optimize/optimize-client.tsx`

In `generateResumeLocal()`, apply the identical change:

1. **Move** the profile injection block (currently lines 331-343) to **before** the validation check (currently line 327)
2. **Change** the validation to match the server-side fix: `!Array.isArray(resumeData.experience) || resumeData.experience.length === 0`
3. **Update** the error message to match: `'AI agent did not return any experience entries. Please try again.'`

### Step 3: Verify

1. Build the project: `npm run build` — should compile without errors
2. Test on the /optimize page:
   - Submit a job description as an authenticated user (service mode)
   - Verify a resume is displayed instead of the error
   - Verify the user's name and contacts appear from their profile
3. If possible, test the webhook mode with a user-provided n8n webhook URL

## Key Decisions Reference

| Decision | Choice | See |
|----------|--------|-----|
| Fix approach | Reorder: inject before validate | research.md R1 |
| Validation scope | Only validate `experience` (non-empty array) | research.md R2 |
| Code paths | Fix both server and client identically | research.md R3 |
| Error message | Specific: "no experience entries" | research.md R4 |
