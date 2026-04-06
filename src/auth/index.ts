import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq, and, desc } from 'drizzle-orm';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  consents,
} from './admin-schema';
import { getAdminDb } from '@/db/admin';
import { isAuthEnabled } from '@/lib/auth-config';
import {
  CURRENT_CONSENT_VERSION,
  CONSENT_SCOPES,
  RECONSENT_GRACE_PERIOD_DAYS,
} from '@/lib/consent';

function createAuth() {
  if (!isAuthEnabled()) {
    const stubHandler = async () =>
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    return {
      handlers: { GET: stubHandler, POST: stubHandler },
      auth: (async () => null) as any,
      signIn: (async () => {}) as any,
      signOut: (async () => {}) as any,
    };
  }

  const adminDb = getAdminDb();

  return NextAuth({
    adapter: DrizzleAdapter(adminDb, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [GitHub, Google],
    pages: {
      signIn: '/signin',
    },
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user, trigger }) {
        if (user?.id) {
          token.userId = user.id;
        }

        // Refresh consent status on sign-in and periodically
        const userId = token.userId as string | undefined;
        if (userId && (trigger === 'signIn' || trigger === 'signUp' || !token.consentCheckedAt || Date.now() - (token.consentCheckedAt as number) > 5 * 60 * 1000 || !token.hasConsent)) {
          try {
            const db = getAdminDb();
            const latest = await db
              .select({
                consentVersion: consents.consentVersion,
                consentedAt: consents.consentedAt,
                withdrawnAt: consents.withdrawnAt,
              })
              .from(consents)
              .where(
                and(
                  eq(consents.userId, userId),
                  eq(consents.scope, CONSENT_SCOPES.PERSONAL_DATA_PROCESSING),
                )
              )
              .orderBy(desc(consents.consentedAt))
              .limit(1);

            if (latest.length === 0 || latest[0].withdrawnAt) {
              token.hasConsent = false;
              token.consentVersion = null;
              token.needsReconsent = false;
              token.reconsentDeadline = null;
            } else {
              const userVersion = latest[0].consentVersion;
              token.hasConsent = true;
              token.consentVersion = userVersion;

              if (userVersion !== CURRENT_CONSENT_VERSION) {
                token.needsReconsent = true;
                // Set deadline if not already set
                if (!token.reconsentDeadline) {
                  const deadline = new Date();
                  deadline.setDate(deadline.getDate() + RECONSENT_GRACE_PERIOD_DAYS);
                  token.reconsentDeadline = deadline.toISOString();
                }
              } else {
                token.needsReconsent = false;
                token.reconsentDeadline = null;
              }
            }
            token.consentCheckedAt = Date.now();
          } catch {
            // Don't block auth on consent check failure
          }
        }

        return token;
      },
      session({ session, token }) {
        if (token.userId && session.user) {
          session.user.id = token.userId as string;
          session.user.hasConsent = (token.hasConsent as boolean) ?? false;
          session.user.consentVersion = (token.consentVersion as string) ?? null;
          session.user.needsReconsent = (token.needsReconsent as boolean) ?? false;
          session.user.reconsentDeadline = (token.reconsentDeadline as string) ?? null;
        }
        return session;
      },
    },
  });
}

let _instance: ReturnType<typeof createAuth> | null = null;

function getInstance() {
  if (!_instance) {
    _instance = createAuth();
  }
  return _instance;
}

export function auth(...args: any[]) {
  const instance = getInstance();
  return args.length > 0 ? instance.auth(...(args as [any])) : instance.auth();
}

export function signIn(...args: any[]) {
  const instance = getInstance();
  return args.length > 0 ? instance.signIn(...(args as [any])) : instance.signIn();
}

export function signOut(...args: any[]) {
  const instance = getInstance();
  return args.length > 0 ? instance.signOut(...(args as [any])) : instance.signOut();
}

export const handlers = {
  GET: (req: any) => getInstance().handlers.GET(req),
  POST: (req: any) => getInstance().handlers.POST(req),
};
