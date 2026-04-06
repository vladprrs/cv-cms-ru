'use server';

import { eq, sql, like, or, desc, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { getAdminDb } from '@/db/admin';
import { isAdmin, userSearchSchema, creditAdjustmentSchema } from '@/lib/admin';
import {
  users,
  accounts,
  creditBalances,
  userDatabases,
  purchases,
  usageRecords,
  creditAdjustments,
} from '@/auth/admin-schema';
import { revalidatePath } from 'next/cache';

const PAGE_SIZE = 20;

export async function requireAdmin(): Promise<{ adminId: string; adminEmail: string }> {
  const session = await auth();

  if (!session?.user?.email || !session.user.id) {
    throw new Error('NOT_AUTHENTICATED');
  }

  if (!isAdmin(session.user.email)) {
    throw new Error('NOT_ADMIN');
  }

  return { adminId: session.user.id, adminEmail: session.user.email };
}

// ─── T006: getUsers ────────────────────────────────────────────────────────────

export type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  provider: string | null;
  balance: number;
  dbStatus: string | null;
  createdAt: string | null;
};

export type GetUsersResult = {
  users: UserListItem[];
  totalCount: number;
  page: number;
  totalPages: number;
};

export async function getUsers(params: {
  query?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
}): Promise<GetUsersResult> {
  await requireAdmin();

  const parsed = userSearchSchema.parse({
    query: params.query,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
    page: params.page ? Number(params.page) : 1,
  });

  const db = getAdminDb();

  // Build WHERE clause for search
  const searchCondition = parsed.query
    ? or(
        like(users.email, `%${parsed.query}%`),
        like(users.name, `%${parsed.query}%`)
      )
    : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(searchCondition);
  const totalCount = countResult[0].count;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(parsed.page, totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  // Determine sort column and direction
  const sortDir = parsed.sortOrder === 'asc' ? asc : desc;
  let orderExpr;
  switch (parsed.sortBy) {
    case 'name':
      orderExpr = sortDir(users.name);
      break;
    case 'email':
      orderExpr = sortDir(users.email);
      break;
    case 'balance':
      orderExpr = sortDir(creditBalances.balance);
      break;
    case 'createdAt':
    default:
      orderExpr = sortDir(userDatabases.createdAt);
      break;
  }

  // Fetch users with joins
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      balance: creditBalances.balance,
      dbStatus: userDatabases.status,
      dbCreatedAt: userDatabases.createdAt,
    })
    .from(users)
    .leftJoin(creditBalances, eq(creditBalances.userId, users.id))
    .leftJoin(userDatabases, eq(userDatabases.userId, users.id))
    .where(searchCondition)
    .orderBy(orderExpr)
    .limit(PAGE_SIZE)
    .offset(offset);

  // Fetch providers for these users
  const userIds = rows.map((r) => r.id);
  let providerMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const accs = await db
      .select({ userId: accounts.userId, provider: accounts.provider })
      .from(accounts)
      .where(sql`${accounts.userId} IN (${sql.join(userIds.map((id) => sql`${id}`), sql`, `)})`);
    for (const acc of accs) {
      // If user has multiple providers, join them
      providerMap[acc.userId] = providerMap[acc.userId]
        ? `${providerMap[acc.userId]}, ${acc.provider}`
        : acc.provider;
    }
  }

  return {
    users: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      image: r.image,
      provider: providerMap[r.id] || null,
      balance: r.balance ?? 0,
      dbStatus: r.dbStatus,
      createdAt: r.dbCreatedAt,
    })),
    totalCount,
    page,
    totalPages,
  };
}

// ─── T008: getUserDetail ───────────────────────────────────────────────────────

export type UserDetail = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  providers: string[];
  database: {
    name: string;
    url: string;
    status: string;
    createdAt: string;
  } | null;
  balance: number;
  adjustments: {
    id: string;
    adminEmail: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
    reason: string;
    createdAt: string;
  }[];
  purchaseHistory: {
    id: string;
    packId: string;
    credits: number;
    priceRub: number;
    status: string;
    createdAt: string;
    confirmedAt: string | null;
  }[];
  usageHistory: {
    id: string;
    status: string;
    createdAt: string;
  }[];
};

export type GetUserDetailResult =
  | { data: UserDetail }
  | { error: string };

export async function getUserDetail(userId: string): Promise<GetUserDetailResult> {
  await requireAdmin();

  const db = getAdminDb();

  // Fetch user
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userRows.length === 0) {
    return { error: 'User not found' };
  }

  const user = userRows[0];

  // Fetch all related data in parallel
  const [accs, dbRows, balanceRows, purchaseRows, usageRows, adjustmentRows] = await Promise.all([
    db.select({ provider: accounts.provider }).from(accounts).where(eq(accounts.userId, userId)),
    db.select().from(userDatabases).where(eq(userDatabases.userId, userId)).limit(1),
    db.select({ balance: creditBalances.balance }).from(creditBalances).where(eq(creditBalances.userId, userId)).limit(1),
    db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt)),
    db.select().from(usageRecords).where(eq(usageRecords.userId, userId)).orderBy(desc(usageRecords.createdAt)),
    db
      .select({
        id: creditAdjustments.id,
        adminUserId: creditAdjustments.adminUserId,
        amount: creditAdjustments.amount,
        previousBalance: creditAdjustments.previousBalance,
        newBalance: creditAdjustments.newBalance,
        reason: creditAdjustments.reason,
        createdAt: creditAdjustments.createdAt,
      })
      .from(creditAdjustments)
      .where(eq(creditAdjustments.targetUserId, userId))
      .orderBy(desc(creditAdjustments.createdAt)),
  ]);

  // Resolve admin emails for adjustments
  const adminIds = [...new Set(adjustmentRows.map((a) => a.adminUserId))];
  let adminEmailMap: Record<string, string> = {};
  if (adminIds.length > 0) {
    const adminUsers = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(sql`${users.id} IN (${sql.join(adminIds.map((id) => sql`${id}`), sql`, `)})`);
    for (const au of adminUsers) {
      adminEmailMap[au.id] = au.email;
    }
  }

  const dbInfo = dbRows[0];

  return {
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      providers: accs.map((a) => a.provider),
      database: dbInfo
        ? {
            name: dbInfo.tursoDbName,
            url: dbInfo.tursoDbUrl,
            status: dbInfo.status,
            createdAt: dbInfo.createdAt,
          }
        : null,
      balance: balanceRows[0]?.balance ?? 0,
      adjustments: adjustmentRows.map((a) => ({
        id: a.id,
        adminEmail: adminEmailMap[a.adminUserId] || 'unknown',
        amount: a.amount,
        previousBalance: a.previousBalance,
        newBalance: a.newBalance,
        reason: a.reason,
        createdAt: a.createdAt,
      })),
      purchaseHistory: purchaseRows.map((p) => ({
        id: p.id,
        packId: p.packId,
        credits: p.credits,
        priceRub: p.priceRub,
        status: p.status,
        createdAt: p.createdAt,
        confirmedAt: p.confirmedAt,
      })),
      usageHistory: usageRows.map((u) => ({
        id: u.id,
        status: u.status,
        createdAt: u.createdAt,
      })),
    },
  };
}

// ─── T010: adjustCreditBalance ─────────────────────────────────────────────────

export async function adjustCreditBalance(
  targetUserId: string,
  amount: number,
  reason: string,
): Promise<{ success: true; newBalance: number } | { error: string }> {
  const { adminId } = await requireAdmin();

  const parsed = creditAdjustmentSchema.safeParse({ amount, reason });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const db = getAdminDb();

  // Fetch current balance (or 0 if no row exists)
  const balanceRows = await db
    .select({ id: creditBalances.id, balance: creditBalances.balance })
    .from(creditBalances)
    .where(eq(creditBalances.userId, targetUserId))
    .limit(1);

  const currentBalance = balanceRows[0]?.balance ?? 0;
  const newBalance = currentBalance + amount;

  if (newBalance < 0) {
    return { error: `Insufficient balance. Current: ${currentBalance}, adjustment: ${amount}` };
  }

  // Upsert credit balance
  if (balanceRows.length === 0) {
    await db.insert(creditBalances).values({
      userId: targetUserId,
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    });
  } else {
    await db
      .update(creditBalances)
      .set({
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(creditBalances.userId, targetUserId));
  }

  // Insert audit record
  await db.insert(creditAdjustments).values({
    adminUserId: adminId,
    targetUserId,
    amount,
    previousBalance: currentBalance,
    newBalance,
    reason,
  });

  revalidatePath(`/admin/users/${targetUserId}`);
  revalidatePath('/admin');

  return { success: true, newBalance };
}

// ─── T013: getDashboardStats ───────────────────────────────────────────────────

export type DashboardStats = {
  totalUsers: number;
  usersWithDbs: number;
  totalCredits: number;
  purchaseCount: number;
  totalRevenue: number;
  totalUsage: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const db = getAdminDb();

  const [userCount, dbCount, creditSum, purchaseStats, usageCount] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(users),
    db.select({ count: sql<number>`COUNT(*)` }).from(userDatabases).where(eq(userDatabases.status, 'ready')),
    db.select({ total: sql<number>`COALESCE(SUM(${creditBalances.balance}), 0)` }).from(creditBalances),
    db
      .select({
        count: sql<number>`COUNT(*)`,
        revenue: sql<number>`COALESCE(SUM(${purchases.priceRub}), 0)`,
      })
      .from(purchases)
      .where(eq(purchases.status, 'confirmed')),
    db.select({ count: sql<number>`COUNT(*)` }).from(usageRecords),
  ]);

  return {
    totalUsers: userCount[0].count,
    usersWithDbs: dbCount[0].count,
    totalCredits: creditSum[0].total,
    purchaseCount: purchaseStats[0].count,
    totalRevenue: purchaseStats[0].revenue,
    totalUsage: usageCount[0].count,
  };
}
