'use server';

import { eq, sql } from 'drizzle-orm';
import { getAdminDb } from '@/db/admin';
import { creditBalances, usageRecords } from '@/auth/admin-schema';
import { isAuthEnabled } from '@/lib/auth-config';

// ─── Health Check Cache ──────────────────────────────────────────────────────

let cachedServiceStatus: { available: boolean; checkedAt: number } | null = null;
const SERVICE_STATUS_TTL = 60_000; // 60 seconds

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;
  const { auth } = await import('@/auth');
  const session = await auth();
  return session?.user?.id ?? null;
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function getCreditBalance(): Promise<{ balance: number } | { error: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: 'Not authenticated' };

  const adminDb = getAdminDb();
  const result = await adminDb
    .select({ balance: creditBalances.balance })
    .from(creditBalances)
    .where(eq(creditBalances.userId, userId))
    .limit(1);

  return { balance: result[0]?.balance ?? 0 };
}

export async function consumeCredit(): Promise<
  { success: true; remainingBalance: number; usageRecordId: string } | { success: false; error: string }
> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: 'Not authenticated' };

  const adminDb = getAdminDb();

  // Atomic decrement — only succeeds if balance > 0
  const updated = await adminDb
    .update(creditBalances)
    .set({
      balance: sql`${creditBalances.balance} - 1`,
      updatedAt: new Date().toISOString(),
    })
    .where(sql`${creditBalances.userId} = ${userId} AND ${creditBalances.balance} > 0`)
    .returning({ balance: creditBalances.balance });

  if (updated.length === 0) {
    return { success: false, error: 'Insufficient credits' };
  }

  // Create usage record
  const usageRecordId = crypto.randomUUID();
  await adminDb.insert(usageRecords).values({
    id: usageRecordId,
    userId,
    status: 'success',
  });

  return { success: true, remainingBalance: updated[0].balance, usageRecordId };
}

export async function refundCredit(
  usageRecordId: string,
): Promise<{ success: true; remainingBalance: number } | { success: false; error: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: 'Not authenticated' };

  const adminDb = getAdminDb();

  // Increment balance by 1
  const updated = await adminDb
    .update(creditBalances)
    .set({
      balance: sql`${creditBalances.balance} + 1`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(creditBalances.userId, userId))
    .returning({ balance: creditBalances.balance });

  if (updated.length === 0) {
    return { success: false, error: 'No credit balance found' };
  }

  // Update usage record to refunded
  await adminDb
    .update(usageRecords)
    .set({ status: 'refunded' })
    .where(eq(usageRecords.id, usageRecordId));

  return { success: true, remainingBalance: updated[0].balance };
}

export async function checkServiceStatus(): Promise<{ available: boolean }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { available: false };

  // Return cached result if fresh
  if (cachedServiceStatus && Date.now() - cachedServiceStatus.checkedAt < SERVICE_STATUS_TTL) {
    return { available: cachedServiceStatus.available };
  }

  const serviceUrl = process.env.SERVICE_WEBHOOK_URL;
  if (!serviceUrl) {
    cachedServiceStatus = { available: false, checkedAt: Date.now() };
    return { available: false };
  }

  try {
    const response = await fetch(serviceUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    const available = response.ok || response.status === 405; // HEAD may not be supported, but endpoint is reachable
    cachedServiceStatus = { available, checkedAt: Date.now() };
    return { available };
  } catch {
    cachedServiceStatus = { available: false, checkedAt: Date.now() };
    return { available: false };
  }
}
