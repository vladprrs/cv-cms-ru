import { PaymentsApi, Configuration } from '@yookassa/sdk';
import { z } from 'zod';

let paymentsApiInstance: PaymentsApi | null = null;

export function getPaymentsApi(): PaymentsApi {
  if (paymentsApiInstance) return paymentsApiInstance;

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error('YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY must be set');
  }

  const config = new Configuration({ username: shopId, password: secretKey });
  paymentsApiInstance = new PaymentsApi(config);
  return paymentsApiInstance;
}

// Zod schema for YooKassa webhook notification payload
export const yookassaWebhookSchema = z.object({
  type: z.literal('notification'),
  event: z.enum(['payment.succeeded', 'payment.canceled']),
  object: z.object({
    id: z.string(),
    status: z.enum(['succeeded', 'canceled']),
    amount: z.object({
      value: z.string(),
      currency: z.string(),
    }),
    metadata: z.object({
      userId: z.string(),
      purchaseId: z.string(),
    }),
  }),
});

export type YooKassaWebhookPayload = z.infer<typeof yookassaWebhookSchema>;
