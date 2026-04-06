'use server';

import { eq } from 'drizzle-orm';
import { getAdminDb } from '@/db/admin';
import { purchases } from '@/auth/admin-schema';
import { isAuthEnabled } from '@/lib/auth-config';
import { getPackById, packIdSchema } from '@/lib/credits';
import { getPaymentsApi } from '@/lib/yookassa';

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;
  const { auth } = await import('@/auth');
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function createPayment(
  packId: string,
): Promise<{ redirectUrl: string; purchaseId: string } | { error: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = packIdSchema.safeParse(packId);
  if (!parsed.success) return { error: 'Invalid pack' };

  const pack = getPackById(parsed.data);
  if (!pack) return { error: 'Invalid pack' };

  const adminDb = getAdminDb();
  const purchaseId = crypto.randomUUID();

  // Create pending purchase record
  await adminDb.insert(purchases).values({
    id: purchaseId,
    userId,
    packId: pack.id,
    credits: pack.credits,
    priceRub: pack.priceRub,
    status: 'pending',
  });

  try {
    const api = getPaymentsApi();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const payment = await api.paymentsPost(
      crypto.randomUUID(), // idempotency key
      {
        amount: {
          value: `${pack.priceRub}.00`,
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: `${appUrl}/settings?payment=pending&purchaseId=${purchaseId}`,
        },
        capture: true,
        description: `CV CMS: ${pack.name} pack (${pack.credits} credits)`,
        metadata: {
          userId,
          purchaseId,
        },
      },
    );

    const paymentData = payment.data;
    if (!paymentData?.id || !paymentData?.confirmation) {
      return { error: 'Payment creation failed' };
    }

    // Store YooKassa payment ID
    await adminDb
      .update(purchases)
      .set({ yookassaPaymentId: paymentData.id })
      .where(eq(purchases.id, purchaseId));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confirmation = paymentData.confirmation as any;
    const confirmationUrl = confirmation?.confirmation_url || confirmation?.confirmationUrl;
    if (!confirmationUrl) {
      return { error: 'Payment creation failed — no redirect URL' };
    }

    return { redirectUrl: confirmationUrl, purchaseId };
  } catch (err) {
    console.error('YooKassa payment creation error:', err);

    // Mark purchase as failed
    await adminDb
      .update(purchases)
      .set({ status: 'failed' })
      .where(eq(purchases.id, purchaseId));

    return { error: 'Payment creation failed' };
  }
}

export async function getPurchaseStatus(
  purchaseId: string,
): Promise<{ status: 'pending' | 'confirmed' | 'failed'; credits?: number } | { error: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: 'Not authenticated' };

  const adminDb = getAdminDb();
  const result = await adminDb
    .select({
      status: purchases.status,
      credits: purchases.credits,
      purchaseUserId: purchases.userId,
    })
    .from(purchases)
    .where(eq(purchases.id, purchaseId))
    .limit(1);

  if (result.length === 0) return { error: 'Purchase not found' };

  const purchase = result[0];
  if (purchase.purchaseUserId !== userId) return { error: 'Purchase not found' };

  return {
    status: purchase.status as 'pending' | 'confirmed' | 'failed',
    credits: purchase.status === 'confirmed' ? purchase.credits : undefined,
  };
}
