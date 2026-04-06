'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  exportDatabase,
  importDatabase,
  clearDatabase,
} from '@/app/actions';
import type { BackupData, ImportResult } from '@/lib/data-types';
import { AuthButton } from '@/components/auth/auth-button';
import {
  ArrowLeft,
  Download,
  Upload,
  Settings,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  HardDrive,
  Trash2,
  Cloud,
  Database,
  User,
  Coins,
  ShoppingCart,
  Loader2,
  Clock,
  UserX,
} from 'lucide-react';
import { PACKS } from '@/lib/credits';

type Theme = 'light' | 'dark' | 'system';

const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated' && !!session?.user;

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<Theme>('system');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);

  // Account deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingAccount, setIsExportingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Credits state
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [pendingPurchaseId, setPendingPurchaseId] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  // Load theme and webhook URL from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
    const savedWebhookUrl = localStorage.getItem('n8n-webhook-url');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);

  // Load credit balance for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return;
    setCreditsLoading(true);
    import('@/app/actions/credits').then(({ getCreditBalance }) =>
      getCreditBalance().then((result) => {
        if ('balance' in result) setCreditBalance(result.balance);
        setCreditsLoading(false);
      })
    );
  }, [isAuthenticated]);

  // Handle return from YooKassa payment redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const purchaseId = params.get('purchaseId');
    if (payment === 'pending' && purchaseId) {
      setPendingPurchaseId(purchaseId);
      setPurchaseStatus('pending');
      // Clean URL
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  // Poll for purchase confirmation
  useEffect(() => {
    if (!pendingPurchaseId || purchaseStatus !== 'pending') return;
    const interval = setInterval(async () => {
      const { getPurchaseStatus } = await import('@/app/actions/payments');
      const result = await getPurchaseStatus(pendingPurchaseId);
      if ('status' in result && result.status !== 'pending') {
        setPurchaseStatus(result.status);
        setPendingPurchaseId(null);
        // Refresh balance
        const { getCreditBalance } = await import('@/app/actions/credits');
        const balanceResult = await getCreditBalance();
        if ('balance' in balanceResult) setCreditBalance(balanceResult.balance);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pendingPurchaseId, purchaseStatus]);

  const handleBuyPack = async (packId: string) => {
    setPurchaseLoading(packId);
    try {
      const { createPayment } = await import('@/app/actions/payments');
      const result = await createPayment(packId);
      if ('redirectUrl' in result) {
        window.location.href = result.redirectUrl;
      }
    } catch {
      // Payment creation failed
    } finally {
      setPurchaseLoading(null);
    }
  };

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(newTheme);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const handleSaveWebhookUrl = () => {
    const trimmed = webhookUrl.trim();
    if (trimmed) {
      try {
        new URL(trimmed);
      } catch {
        return;
      }
      localStorage.setItem('n8n-webhook-url', trimmed);
    } else {
      localStorage.removeItem('n8n-webhook-url');
    }
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2000);
  };

  // Handle export — works for both modes
  const handleExport = async () => {
    setIsExporting(true);
    try {
      let data: BackupData;
      if (isAuthenticated) {
        data = await exportDatabase();
      } else {
        const { ClientDataLayer } = await import('@/lib/data-layer/client-data-layer');
        const dl = new ClientDataLayer();
        data = await dl.exportDatabase();
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text) as BackupData;
      let result: ImportResult;

      if (isAuthenticated) {
        result = await importDatabase(data);
      } else {
        const { ClientDataLayer } = await import('@/lib/data-layer/client-data-layer');
        const dl = new ClientDataLayer();
        result = await dl.importDatabase(data);
      }

      setImportResult(result);
      if (result.success) {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse backup file';
      setImportResult({
        success: false,
        jobsImported: 0,
        highlightsImported: 0,
        errors: [message],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      if (isAuthenticated) {
        await clearDatabase();
      } else {
        const { ClientDataLayer } = await import('@/lib/data-layer/client-data-layer');
        const dl = new ClientDataLayer();
        await dl.clearDatabase();
      }
      router.push('/app');
      router.refresh();
    } catch (err) {
      console.error('Failed to clear data:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportAccountData = async () => {
    setIsExportingAccount(true);
    try {
      const { exportAccountData } = await import('@/app/actions/account');
      const result = await exportAccountData();
      if ('data' in result) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Account data export failed:', err);
    } finally {
      setIsExportingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { signOut } = await import('next-auth/react');
      const { deleteAccount } = await import('@/app/actions/account');
      const result = await deleteAccount();
      if ('error' in result) {
        setDeleteError(result.error);
        setIsDeleting(false);
        return;
      }
      await signOut({ callbackUrl: '/?deleted=true' });
    } catch (err) {
      console.error('Account deletion failed:', err);
      setDeleteError('An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/app">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your preferences and data
            </p>
          </div>
          <AuthButton />
        </div>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>
              {isAuthenticated
                ? 'Your account information'
                : authEnabled
                  ? 'Sign in to sync your data across devices'
                  : 'Local mode — data is stored in your browser'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated && session?.user ? (
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-sm">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;re using CV CMS in local mode. Your data is stored in your browser.
                {authEnabled && ' Sign in to sync your data to the cloud.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Storage Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isAuthenticated ? <Cloud className="h-5 w-5" /> : <HardDrive className="h-5 w-5" />}
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                {isAuthenticated ? 'Cloud (Turso)' : 'Local (Browser)'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {isAuthenticated
                  ? 'Your data is stored securely in a dedicated cloud database.'
                  : 'Data is stored in IndexedDB. It will be lost if you clear browser data.'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* n8n Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              n8n Integration
            </CardTitle>
            <CardDescription>
              Connect external tools to read your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook URL</label>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  placeholder="https://your-n8n.example.com/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveWebhookUrl}
                >
                  {webhookSaved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your n8n webhook URL for resume optimization. Stored only in your browser.
              </p>
              {webhookUrl.trim() && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-yellow-700 dark:text-yellow-400">
                    При использовании оптимизации резюме ваши карьерные данные будут
                    отправлены на указанный вами внешний сервис. Вы несёте ответственность
                    за сохранность данных на этом сервисе.
                  </span>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Resume Optimization Credits */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Resume Optimization
              </CardTitle>
              <CardDescription>
                Purchase credit packs to optimize resumes with our service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pending purchase banner */}
              {purchaseStatus === 'pending' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">
                    Payment processing... Credits will appear shortly.
                  </span>
                </div>
              )}
              {purchaseStatus === 'confirmed' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    Payment confirmed! Credits added to your balance.
                  </span>
                </div>
              )}
              {purchaseStatus === 'failed' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Payment failed. Please try again.
                  </span>
                </div>
              )}

              {/* Balance display */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Credit Balance</p>
                  <p className="text-xs text-muted-foreground">
                    Each credit = one resume optimization
                  </p>
                </div>
                {creditsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant={creditBalance && creditBalance > 0 ? 'default' : 'secondary'} className="text-base px-3 py-1">
                    {creditBalance ?? 0} credits
                  </Badge>
                )}
              </div>

              {/* Pack cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="border rounded-lg p-4 flex flex-col items-center text-center space-y-2"
                  >
                    <p className="font-semibold text-sm">{pack.name}</p>
                    <p className="text-2xl font-bold">{pack.credits}</p>
                    <p className="text-xs text-muted-foreground">credits</p>
                    <p className="font-medium text-sm">{pack.priceRub} RUB</p>
                    <Button
                      size="sm"
                      variant={creditBalance === 0 ? 'default' : 'outline'}
                      className="w-full gap-2"
                      disabled={purchaseLoading !== null}
                      onClick={() => handleBuyPack(pack.id)}
                    >
                      {purchaseLoading === pack.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Buy
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
            <CardDescription>
              Choose how CV CMS looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('system')}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backup & Restore</CardTitle>
            <CardDescription>
              Export or import your data for backup and migration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-sm">Export Full Backup</p>
                <p className="text-xs text-muted-foreground">
                  Download all your data as JSON
                </p>
              </div>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                size="sm"
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Import */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="backup-file"
                  />
                  <label htmlFor="backup-file">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <span>
                        <HardDrive className="h-4 w-4" />
                        {selectedFile ? selectedFile.name : 'Select backup file...'}
                      </span>
                    </Button>
                  </label>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                  size="sm"
                  className="gap-2"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import
                    </>
                  )}
                </Button>
              </div>

              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: <Badge variant="outline" className="text-xs">{selectedFile.name}</Badge>{' '}
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}

              {importResult && (
                <Alert variant={importResult.success ? 'default' : 'destructive'}>
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle className="text-sm">
                    {importResult.success ? 'Import Successful' : 'Import Failed'}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {importResult.success ? (
                      <>
                        Imported {importResult.jobsImported} jobs and{' '}
                        {importResult.highlightsImported} highlights
                      </>
                    ) : (
                      importResult.errors[0]
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions. Please be careful.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <div>
                <p className="font-medium text-sm">Clear All Data</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete all jobs and highlights
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all
                      your jobs, highlights, and associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isClearing}
                    >
                      {isClearing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        'Yes, delete everything'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Account — authenticated users only */}
            {isAuthenticated && (
              <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div>
                  <p className="font-medium text-sm">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <UserX className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удаление аккаунта</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-3">
                          <p>
                            Это действие необратимо. Будут удалены:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Ваш профиль, все места работы и достижения</li>
                            <li>Учётная запись и данные авторизации</li>
                            <li>Записи о кредитах и использовании</li>
                            <li>Персональная база данных</li>
                          </ul>
                          {creditBalance !== null && creditBalance > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                              <span className="text-yellow-700 dark:text-yellow-400">
                                У вас {creditBalance} неиспользованных кредитов. Они будут утеряны.
                              </span>
                            </div>
                          )}
                          <p className="text-sm">
                            Записи о покупках будут обезличены и сохранены в соответствии с требованиями закона (5 лет).
                          </p>
                          {deleteError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-sm">
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="text-red-700 dark:text-red-400">{deleteError}</span>
                            </div>
                          )}
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportAccountData}
                        disabled={isExportingAccount || isDeleting}
                        className="gap-2"
                      >
                        {isExportingAccount ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Экспорт...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Скачать данные
                          </>
                        )}
                      </Button>
                      <div className="flex gap-2 ml-auto">
                        <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Удаление...
                            </>
                          ) : (
                            'Удалить аккаунт'
                          )}
                        </AlertDialogAction>
                      </div>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
            <CardDescription>
              Quick actions available on the main page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Search</span>
                <kbd className="px-2 py-1 bg-background rounded text-xs">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>New Highlight</span>
                <kbd className="px-2 py-1 bg-background rounded text-xs">⌘N</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>New Job</span>
                <kbd className="px-2 py-1 bg-background rounded text-xs">⌘⇧N</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Copy JSON</span>
                <kbd className="px-2 py-1 bg-background rounded text-xs">⌘⇧C</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
