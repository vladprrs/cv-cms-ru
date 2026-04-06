import { z } from 'zod';

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(email: string): boolean {
  return adminEmails.includes(email.toLowerCase());
}

export const creditAdjustmentSchema = z.object({
  amount: z.number().int().refine((n) => n !== 0, { message: 'Amount must not be zero' }),
  reason: z.string().min(1, 'Reason is required'),
});

export const userSearchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'balance']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().positive().default(1),
});
