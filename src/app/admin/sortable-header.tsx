'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export function SortableHeader({
  column,
  currentSort,
  currentOrder,
  children,
}: {
  column: string;
  currentSort: string;
  currentOrder: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isActive = currentSort === column;
  const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc';

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', column);
    params.set('sortOrder', nextOrder);
    params.set('page', '1');
    router.push(`/admin?${params.toString()}`);
  };

  return (
    <button
      onClick={handleSort}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      {isActive ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" />
      )}
    </button>
  );
}
