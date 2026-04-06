import { z } from 'zod';

// ─── Consent Version ────────────────────────────────────────────────────────
// Bump this constant when the Privacy Policy is updated.
// Compared against user's latest consent record to determine if re-consent is needed.

export const CURRENT_CONSENT_VERSION = '2026-04-06-v1';

// ─── Consent Scopes ─────────────────────────────────────────────────────────

export const CONSENT_SCOPES = {
  PERSONAL_DATA_PROCESSING: 'personal_data_processing',
  THIRD_PARTY_DATA_SHARING: 'third_party_data_sharing',
} as const;

export type ConsentScope = (typeof CONSENT_SCOPES)[keyof typeof CONSENT_SCOPES];

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const consentScopeSchema = z.enum([
  CONSENT_SCOPES.PERSONAL_DATA_PROCESSING,
  CONSENT_SCOPES.THIRD_PARTY_DATA_SHARING,
]);

export const recordConsentSchema = z.object({
  consentVersion: z.string().min(1),
  scope: consentScopeSchema,
});

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConsentRecord {
  id: string;
  userId: string;
  consentVersion: string;
  scope: ConsentScope;
  consentedAt: string;
  withdrawnAt: string | null;
}

export interface ConsentStatus {
  hasConsent: boolean;
  needsReconsent: boolean;
  consentVersion: string | null;
}

export interface OverallConsentStatus {
  consents: Array<{ scope: string; version: string; consentedAt: string }>;
  currentVersion: string;
  needsReconsent: boolean;
}

// ─── Re-consent Deadline ────────────────────────────────────────────────────

export const RECONSENT_GRACE_PERIOD_DAYS = 14;
