'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { CURRENT_CONSENT_VERSION, CONSENT_SCOPES } from '@/lib/consent';

export function ConsentBanner() {
  const { data: session, update } = useSession();
  const [isReconsenting, setIsReconsenting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!session?.user?.needsReconsent || dismissed) return null;

  const deadline = session.user.reconsentDeadline;
  const isExpired = deadline ? new Date(deadline) < new Date() : false;

  const handleReconsent = async () => {
    setIsReconsenting(true);
    try {
      const { recordConsent } = await import('@/app/actions/consent');
      const result = await recordConsent(
        CURRENT_CONSENT_VERSION,
        CONSENT_SCOPES.PERSONAL_DATA_PROCESSING,
      );
      if ('success' in result) {
        await update();
        setDismissed(true);
      }
    } finally {
      setIsReconsenting(false);
    }
  };

  if (isExpired) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Требуется повторное согласие</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Политика конфиденциальности была обновлена. Срок для подтверждения согласия истек.
            Для продолжения работы с сервисом необходимо принять обновленную политику.
          </p>
          <div className="text-sm">
            <Link href="/privacy" className="underline hover:text-foreground">
              Ознакомиться с Политикой конфиденциальности
            </Link>
          </div>
          <Button
            onClick={handleReconsent}
            disabled={isReconsenting}
            className="w-full"
          >
            {isReconsenting ? 'Обработка...' : 'Принимаю обновленную политику'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <span className="text-yellow-800 dark:text-yellow-200">
            Политика конфиденциальности обновлена. Пожалуйста,{' '}
            <Link href="/privacy" className="underline font-medium">
              ознакомьтесь
            </Link>{' '}
            и подтвердите согласие
            {deadline && (
              <> до {new Date(deadline).toLocaleDateString('ru-RU')}</>
            )}
            .
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={handleReconsent}
            disabled={isReconsenting}
          >
            {isReconsenting ? 'Обработка...' : 'Принимаю'}
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
          >
            <X className="h-4 w-4 text-yellow-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
