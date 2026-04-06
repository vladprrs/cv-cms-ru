import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/admin';
import { getUsers, getDashboardStats } from '@/app/actions/admin';
import type { GetUsersResult, DashboardStats } from '@/app/actions/admin';
import { Badge } from '@/components/ui/badge';
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
import { AdminSearch } from './admin-search';
import { SortableHeader } from './sortable-header';
import { Pagination } from './pagination';

export const dynamic = 'force-dynamic';

function DbStatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">No DB</Badge>;
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ready: 'default',
    creating: 'secondary',
    migrating: 'secondary',
    error: 'destructive',
  };
  return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
}

function ProviderBadge({ provider }: { provider: string | null }) {
  if (!provider) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex gap-1">
      {provider.split(', ').map((p) => (
        <Badge key={p} variant="outline">
          {p}
        </Badge>
      ))}
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/signin');
  }

  if (!isAdmin(session.user.email)) {
    redirect('/');
  }

  const params = await searchParams;
  const query = typeof params.query === 'string' ? params.query : undefined;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'createdAt';
  const sortOrder = typeof params.sortOrder === 'string' ? params.sortOrder : 'desc';
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;

  let result: GetUsersResult;
  let stats: DashboardStats;
  try {
    [result, stats] = await Promise.all([
      getUsers({ query, sortBy, sortOrder, page }),
      getDashboardStats(),
    ]);
  } catch {
    redirect('/');
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm">
          User management &middot; {result.totalCount} users total
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card className="py-4">
          <CardHeader className="pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Users</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0">
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">With DBs</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0">
            <p className="text-2xl font-bold">{stats.usersWithDbs}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Credits</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0">
            <p className="text-2xl font-bold">{stats.totalCredits}</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Purchases</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0">
            <p className="text-2xl font-bold">{stats.purchaseCount}</p>
            <p className="text-xs text-muted-foreground">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1 pt-0 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Usage Records</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0">
            <p className="text-2xl font-bold">{stats.totalUsage}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <AdminSearch defaultValue={query} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>
                <SortableHeader column="name" currentSort={sortBy} currentOrder={sortOrder}>
                  Name
                </SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="email" currentSort={sortBy} currentOrder={sortOrder}>
                  Email
                </SortableHeader>
              </TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>
                <SortableHeader column="balance" currentSort={sortBy} currentOrder={sortOrder}>
                  Credits
                </SortableHeader>
              </TableHead>
              <TableHead>DB Status</TableHead>
              <TableHead>
                <SortableHeader column="createdAt" currentSort={sortBy} currentOrder={sortOrder}>
                  Registered
                </SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {query ? 'No users match your search.' : 'No users registered yet.'}
                </TableCell>
              </TableRow>
            ) : (
              result.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {(user.name?.[0] || user.email[0]).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium hover:underline"
                    >
                      {user.name || '-'}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <ProviderBadge provider={user.provider} />
                  </TableCell>
                  <TableCell className="font-mono">{user.balance}</TableCell>
                  <TableCell>
                    <DbStatusBadge status={user.dbStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {result.totalPages > 1 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
        />
      )}
    </div>
  );
}
