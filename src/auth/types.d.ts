import 'next-auth';

declare module 'next-auth' {
  interface User {
    hasConsent?: boolean;
    consentVersion?: string | null;
    needsReconsent?: boolean;
    reconsentDeadline?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      hasConsent: boolean;
      consentVersion: string | null;
      needsReconsent: boolean;
      reconsentDeadline: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    hasConsent?: boolean;
    consentVersion?: string | null;
    needsReconsent?: boolean;
    reconsentDeadline?: string | null;
    consentCheckedAt?: number;
  }
}
