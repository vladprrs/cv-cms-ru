import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getAdminDb } from '@/db/admin';
import { purchases, creditBalances } from '@/auth/admin-schema';
import { yookassaWebhookSchema } from '@/lib/yookassa';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate payload
  const parsed = yookassaWebhookSchema.safeParse(body);
  if (!parsed.success) {
    console.error('YooKassa webhook: invalid payload', parsed.error.issues);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const notification = parsed.data;
  const paymentId = notification.object.id;
  const { purchaseId } = notification.object.metadata;

  const adminDb = getAdminDb();

  // Look up purchase by YooKassa payment ID
  const purchaseResults = await adminDb
    .select()
    .from(purchases)
    .where(eq(purchases.yookassaPaymentId, paymentId))
    .limit(1);

  // Fallback: look up by purchaseId from metadata
  let purchase = purchaseResults[0];
  if (!purchase) {
    const byId = await adminDb
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);
    purchase = byId[0];
  }

  if (!purchase) {
    console.warn('YooKassa webhook: purchase not found for payment', paymentId);
    return NextResponse.json({}, { status: 200 }); // Return 200 to stop retries
  }

  // Deduplicate: skip if already in terminal state
  if (purchase.status === 'confirmed' || purchase.status === 'failed') {
    console.warn('YooKassa webhook: duplicate for payment', paymentId, 'status:', purchase.status);
    return NextResponse.json({}, { status: 200 });
  }

  if (notification.event === 'payment.succeeded') {
    // Update purchase to confirmed
    await adminDb
      .update(purchases)
      .set({
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        yookassaPaymentId: paymentId,
      })
      .where(eq(purchases.id, purchase.id));

    // Upsert credit balance: insert if not exists, increment if exists
    const existing = await adminDb
      .select()
      .from(creditBalances)
      .where(eq(creditBalances.userId, purchase.userId))
      .limit(1);

    if (existing.length === 0) {
      await adminDb.insert(creditBalances).values({
        userId: purchase.userId,
        balance: purchase.credits,
      });
    } else {
      await adminDb
        .update(creditBalances)
        .set({
          balance: sql`${creditBalances.balance} + ${purchase.credits}`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(creditBalances.userId, purchase.userId));
    }
  } else if (notification.event === 'payment.canceled') {
    await adminDb
      .update(purchases)
      .set({
        status: 'failed',
        yookassaPaymentId: paymentId,
      })
      .where(eq(purchases.id, purchase.id));
  }

  return NextResponse.json({}, { status: 200 });
}
