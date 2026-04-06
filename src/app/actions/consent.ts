'use server';

import { eq, and, desc } from 'drizzle-orm';
import { getAdminDb } from '@/db/admin';
import { consents } from '@/auth/admin-schema';
import { isAuthEnabled } from '@/lib/auth-config';
import {
  CURRENT_CONSENT_VERSION,
  CONSENT_SCOPES,
  recordConsentSchema,
  type ConsentStatus,
  type OverallConsentStatus,
} from '@/lib/consent';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;
  const { auth } = await import('@/auth');
  const session = await auth();
  return session?.user?.id ?? null;
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function recordConsent(
  consentVersion: string,
  scope: string,
): Promise<{ success: true } | { error: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: 'Not authenticated' };

  const validated = recordConsentSchema.safeParse({ consentVersion, scope });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const adminDb = getAdminDb();

  await adminDb.insert(consents).values({
    userId,
    consentVersion: validated.data.consentVersion,
    scope: validated.data.scope,
  });

  return { success: true };
}

export async function checkConsent(
  scope: string,
): Promise<ConsentStatus> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { hasConsent: false, needsReconsent: false, consentVersion: null };
  }

  const adminDb = getAdminDb();

  const latest = await adminDb
    .select({
      consentVersion: consents.consentVersion,
      withdrawnAt: consents.withdrawnAt,
    })
    .from(consents)
    .where(
      and(
        eq(consents.userId, userId),
        eq(consents.scope, scope),
      )
    )
    .orderBy(desc(consents.consentedAt))
    .limit(1);

  if (latest.length === 0 || latest[0].withdrawnAt) {
    return { hasConsent: false, needsReconsent: false, consentVersion: null };
  }

  const userVersion = latest[0].consentVersion;
  return {
    hasConsent: true,
    needsReconsent: userVersion !== CURRENT_CONSENT_VERSION,
    consentVersion: userVersion,
  };
}

export async function getConsentStatus(): Promise<OverallConsentStatus> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return {
      consents: [],
      currentVersion: CURRENT_CONSENT_VERSION,
      needsReconsent: false,
    };
  }

  const adminDb = getAdminDb();

  const allConsents = await adminDb
    .select({
      scope: consents.scope,
      consentVersion: consents.consentVersion,
      consentedAt: consents.consentedAt,
      withdrawnAt: consents.withdrawnAt,
    })
    .from(consents)
    .where(eq(consents.userId, userId))
    .orderBy(desc(consents.consentedAt));

  // Get latest active consent per scope
  const latestByScope = new Map<string, { scope: string; version: string; consentedAt: string }>();
  for (const c of allConsents) {
    if (c.withdrawnAt) continue;
    if (!latestByScope.has(c.scope)) {
      latestByScope.set(c.scope, {
        scope: c.scope,
        version: c.consentVersion,
        consentedAt: c.consentedAt,
      });
    }
  }

  const consentList = Array.from(latestByScope.values());
  const pdConsent = latestByScope.get(CONSENT_SCOPES.PERSONAL_DATA_PROCESSING);
  const needsReconsent = !pdConsent || pdConsent.version !== CURRENT_CONSENT_VERSION;

  return {
    consents: consentList,
    currentVersion: CURRENT_CONSENT_VERSION,
    needsReconsent,
  };
}
