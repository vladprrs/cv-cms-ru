import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/admin';
import { getUserDetail } from '@/app/actions/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { CreditAdjustmentDialog } from './credit-adjustment-dialog';

export const dynamic = 'force-dynamic';

function StatusBadge({ status, type }: { status: string; type: 'db' | 'purchase' | 'usage' }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ready: 'default',
    confirmed: 'default',
    success: 'default',
    creating: 'secondary',
    migrating: 'secondary',
    pending: 'secondary',
    error: 'destructive',
    failed: 'destructive',
    refunded: 'outline',
  };
  return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect('/signin');
  if (!isAdmin(session.user.email)) redirect('/');

  const { id } = await params;
  const result = await getUserDetail(id);

  if ('error' in result) {
    notFound();
  }

  const { user, providers, database, balance, adjustments, purchaseHistory, usageHistory } = result.data;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="size-4" />
            Back to users
          </Button>
        </Link>
      </div>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {user.image ? (
              <img src={user.image} alt="" className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                {(user.name?.[0] || user.email[0]).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <p className="text-lg font-semibold">{user.name || 'No name'}</p>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OAuth Providers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OAuth Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length > 0 ? (
            <div className="flex gap-2">
              {providers.map((p) => (
                <Badge key={p} variant="outline">{p}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No linked providers</p>
          )}
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database</CardTitle>
        </CardHeader>
        <CardContent>
          {database ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-mono">{database.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">URL</span>
                <span className="font-mono text-xs break-all max-w-md text-right">{database.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={database.status} type="db" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(database.createdAt)}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No database provisioned</p>
          )}
        </CardContent>
      </Card>

      {/* Credit Balance */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Credit Balance</CardTitle>
            <CreditAdjustmentDialog
              targetUserId={user.id}
              adminId={session.user.id!}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold font-mono">{balance}</p>
        </CardContent>
      </Card>

      {/* Adjustment History */}
      {adjustments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Credit Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adj) => (
                  <TableRow key={adj.id}>
                    <TableCell className="text-sm">{formatDate(adj.createdAt)}</TableCell>
                    <TableCell className="text-sm">{adj.adminEmail}</TableCell>
                    <TableCell className={`font-mono ${adj.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.amount > 0 ? `+${adj.amount}` : adj.amount}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {adj.previousBalance} → {adj.newBalance}
                    </TableCell>
                    <TableCell className="text-sm max-w-48 truncate">{adj.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Purchase History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseHistory.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{formatDate(p.createdAt)}</TableCell>
                    <TableCell>{p.packId}</TableCell>
                    <TableCell className="font-mono">{p.credits}</TableCell>
                    <TableCell className="font-mono">{p.priceRub} ₽</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} type="purchase" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No purchases yet</p>
          )}
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          {usageHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageHistory.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-sm">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} type="usage" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No usage records yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
