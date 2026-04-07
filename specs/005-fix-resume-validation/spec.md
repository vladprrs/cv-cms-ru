# Feature Specification: Fix Resume Validation Error

**Feature Branch**: `005-fix-resume-validation`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "Fix error 'Invalid resume data received from AI agent' when optimizing resume"

## Background & Problem Statement

When a user attempts to optimize their resume, the system returns the error "Invalid resume data received from AI agent" even when the AI agent produces a valid resume. Investigation reveals:

- The system validates that the AI response contains a `name` field and an `experience` field before accepting it
- The user's personal data (name, contacts) is intentionally **not** sent to the AI agent for privacy reasons
- After validation, the system injects the user's name and contacts from their profile database
- **The validation runs before the injection** — so the AI response is rejected for missing `name` even though the system would have added it in the very next step
- The same issue exists in both the server-side (authenticated) and client-side (anonymous/webhook) code paths
- When the validation fails in service mode, a credit is consumed and then refunded, creating unnecessary billing churn

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Successfully Generates an Optimized Resume (Priority: P1)

An authenticated user pastes a job description and clicks generate. The AI agent processes their career data and returns a structured resume. The system accepts the response, injects the user's name and contacts from their profile, and displays the optimized resume.

**Why this priority**: This is the core feature that is currently broken. No user can successfully generate a resume if the AI agent does not include a `name` field in its output.

**Independent Test**: Can be fully tested by submitting a job description on the optimize page and verifying a resume is displayed instead of an error message.

**Acceptance Scenarios**:

1. **Given** an authenticated user with profile data and career highlights, **When** they submit a job description for optimization, **Then** a tailored resume is displayed with their name and contacts populated from their profile
2. **Given** the AI agent returns a valid resume without a `name` field, **When** the system processes the response, **Then** the response is accepted and the user's name is injected from their profile
3. **Given** the AI agent returns a valid resume with an empty `name` field, **When** the system processes the response, **Then** the response is accepted and the user's name is injected from their profile
4. **Given** the AI agent returns a resume with an `experience` section, **When** the system validates the response, **Then** the resume is accepted regardless of whether `name` is present in the AI output

---

### User Story 2 - System Provides Clear Feedback on Genuinely Invalid AI Responses (Priority: P2)

When the AI agent returns a response that is truly unusable (e.g., missing the `experience` section entirely, malformed data, or unparseable output), the system should provide a clear, actionable error message rather than a generic one.

**Why this priority**: Once the false-positive validation is fixed, users still need helpful feedback when the AI genuinely fails to produce usable output.

**Independent Test**: Can be tested by simulating various malformed AI responses and verifying appropriate error messages are shown.

**Acceptance Scenarios**:

1. **Given** the AI agent returns a response with no `experience` data, **When** the system validates it, **Then** the user sees a specific error indicating the AI could not generate experience entries
2. **Given** the AI agent returns completely unparseable output, **When** the system processes it, **Then** the user sees a clear error message suggesting they try again
3. **Given** the AI agent returns a partially valid response (e.g., experience present but malformed), **When** the system validates it, **Then** the error message indicates what specifically was wrong

---

### Edge Cases

- What happens if the user has no profile name set and the AI also returns no name?
- What happens if the AI returns `experience` as an empty array (technically present but no content)?
- How should the system handle an AI response where `experience` entries are missing required sub-fields (e.g., `company` or `role`)?
- What happens if the AI wraps the resume data in an unexpected envelope format not covered by existing parsing?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept AI responses that are missing the `name` field, provided the `experience` section is present and valid
- **FR-002**: System MUST inject the user's name from their profile regardless of whether the AI included a name in its response
- **FR-003**: System MUST validate that the `experience` section exists and contains at least one entry before accepting the resume
- **FR-004**: System MUST provide specific, actionable error messages that indicate which part of the AI response was invalid
- **FR-005**: The validation and error handling MUST behave identically in both the server-side (service mode) and client-side (webhook mode) code paths
- **FR-006**: System MUST NOT consume and refund credits for validation failures that are caused by the system's own validation logic rather than genuine AI failures

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully generate optimized resumes when the AI agent returns valid experience data, regardless of whether a `name` field is included in the AI response
- **SC-002**: 100% of previously failing resume generations (due to missing `name` in AI output) now succeed
- **SC-003**: Error messages clearly indicate the specific issue when the AI response is genuinely invalid
- **SC-004**: Zero unnecessary credit consume-and-refund cycles caused by false-positive validation failures

## Assumptions

- The AI agent reliably returns an `experience` array when given valid career data — the missing `name` field is the primary cause of current failures
- The existing response parsing logic (handling string, object, `result.resume`, `result.data`, and direct formats) is sufficient and does not need expansion
- Users always have the opportunity to set their profile name before using the optimizer, so profile-based name injection is a reliable fallback
- The client-side (anonymous/webhook) code path has the same validation issue and should be fixed consistently
