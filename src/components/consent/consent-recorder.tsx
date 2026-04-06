'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { CURRENT_CONSENT_VERSION, CONSENT_SCOPES } from '@/lib/consent';

/**
 * Records consent after successful OAuth callback.
 * Checks sessionStorage for pending consent flag set during sign-in.
 * Also handles existing users who don't have consent records yet.
 */
export function ConsentRecorder() {
  const { data: session, status, update } = useSession();
  const hasRun = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    if (hasRun.current) return;

    const hasPendingConsent = sessionStorage.getItem('pendingConsent');
    const needsConsent = !session.user.hasConsent;

    if (hasPendingConsent || needsConsent) {
      hasRun.current = true;
      sessionStorage.removeItem('pendingConsent');

      import('@/app/actions/consent').then(({ recordConsent }) =>
        recordConsent(
          CURRENT_CONSENT_VERSION,
          CONSENT_SCOPES.PERSONAL_DATA_PROCESSING,
        ).then(() => {
          // Refresh the session to pick up updated consent status
          update();
        })
      );
    }
  }, [status, session?.user?.id, session?.user?.hasConsent, update]);

  return null;
}
