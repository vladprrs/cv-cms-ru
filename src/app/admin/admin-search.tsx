'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Input } from '@/components/ui/input';

export function AdminSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('query', value);
      } else {
        params.delete('query');
      }
      params.set('page', '1');
      startTransition(() => {
        router.push(`/admin?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="relative max-w-sm">
      <Input
        type="search"
        placeholder="Search by name or email..."
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        className={isPending ? 'opacity-70' : ''}
      />
    </div>
  );
}
