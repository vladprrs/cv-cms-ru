'use server';

import { eq } from 'drizzle-orm';
import { getAdminDb } from '@/db/admin';
import {
  users,
  accounts,
  sessions,
  consents,
  creditBalances,
  creditAdjustments,
  purchases,
  usageRecords,
  userDatabases,
} from '@/auth/admin-schema';
import { isAuthEnabled } from '@/lib/auth-config';
import { deleteUserDatabase } from '@/db/turso-platform';
import { jobs, highlights, profile } from '@/db/schema';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  if (!isAuthEnabled()) return null;
  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

// ─── Delete Account ──────────────────────────────────────────────────────────

export async function deleteAccount(): Promise<{ success: true } | { error: string }> {
  const user = await getAuthenticatedUser();
  if (!user?.id) return { error: 'Not authenticated' };

  const userId = user.id;
  const adminDb = getAdminDb();

  // 1. Get the user's Turso DB info
  const userDb = await adminDb
    .select({ tursoDbName: userDatabases.tursoDbName })
    .from(userDatabases)
    .where(eq(userDatabases.userId, userId))
    .limit(1);

  // 2. Delete user's Turso database via Platform API (if exists)
  if (userDb[0]?.tursoDbName && userDb[0].tursoDbName !== 'pending') {
    try {
      await deleteUserDatabase(userDb[0].tursoDbName);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user database';
      return { error: `Database deletion failed: ${message}. Account not deleted.` };
    }
  }

  // 3. Anonymize purchases (set userId to 'deleted-user' for tax compliance)
  await adminDb
    .update(purchases)
    .set({ userId: 'deleted-user' })
    .where(eq(purchases.userId, userId));

  // 4. Update consent records with withdrawal timestamp
  const now = new Date().toISOString();
  await adminDb
    .update(consents)
    .set({ withdrawnAt: now })
    .where(eq(consents.userId, userId));

  // 5. Delete dependent records
  await adminDb.delete(usageRecords).where(eq(usageRecords.userId, userId));
  await adminDb.delete(creditBalances).where(eq(creditBalances.userId, userId));
  await adminDb.delete(creditAdjustments).where(eq(creditAdjustments.targetUserId, userId));
  await adminDb.delete(userDatabases).where(eq(userDatabases.userId, userId));
  await adminDb.delete(sessions).where(eq(sessions.userId, userId));
  await adminDb.delete(accounts).where(eq(accounts.userId, userId));

  // 6. Delete user record
  await adminDb.delete(users).where(eq(users.id, userId));

  return { success: true };
}

// ─── Export Account Data ─────────────────────────────────────────────────────

export async function exportAccountData(): Promise<
  { data: Record<string, unknown> } | { error: string }
> {
  const user = await getAuthenticatedUser();
  if (!user?.id) return { error: 'Not authenticated' };

  const userId = user.id;
  const adminDb = getAdminDb();

  // Get user info
  const userRecord = await adminDb
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Get consent records
  const consentRecords = await adminDb
    .select()
    .from(consents)
    .where(eq(consents.userId, userId));

  // Get credit balance
  const creditBalance = await adminDb
    .select()
    .from(creditBalances)
    .where(eq(creditBalances.userId, userId))
    .limit(1);

  // Get purchase history
  const purchaseHistory = await adminDb
    .select()
    .from(purchases)
    .where(eq(purchases.userId, userId));

  // Get usage records
  const usage = await adminDb
    .select()
    .from(usageRecords)
    .where(eq(usageRecords.userId, userId));

  // Get career data from user's Turso DB
  let careerData: { profile: unknown; jobs: unknown[]; highlights: unknown[] } = {
    profile: null,
    jobs: [],
    highlights: [],
  };

  try {
    const { getUserDb } = await import('@/db');
    const userDb = await getUserDb(userId);

    const [profileData, jobsData, highlightsData] = await Promise.all([
      userDb.select().from(profile).limit(1),
      userDb.select().from(jobs),
      userDb.select().from(highlights),
    ]);

    careerData = {
      profile: profileData[0] ?? null,
      jobs: jobsData,
      highlights: highlightsData,
    };
  } catch {
    // User DB may not exist yet
  }

  return {
    data: {
      exportedAt: new Date().toISOString(),
      account: userRecord[0]
        ? {
            name: userRecord[0].name,
            email: userRecord[0].email,
            registeredAt: userRecord[0].emailVerified?.toISOString() ?? null,
          }
        : null,
      consents: consentRecords.map((c) => ({
        scope: c.scope,
        version: c.consentVersion,
        consentedAt: c.consentedAt,
        withdrawnAt: c.withdrawnAt,
      })),
      creditBalance: creditBalance[0]?.balance ?? 0,
      purchases: purchaseHistory.map((p) => ({
        packId: p.packId,
        credits: p.credits,
        priceRub: p.priceRub,
        status: p.status,
        createdAt: p.createdAt,
        confirmedAt: p.confirmedAt,
      })),
      usageRecords: usage.map((u) => ({
        status: u.status,
        createdAt: u.createdAt,
      })),
      ...careerData,
    },
  };
}
