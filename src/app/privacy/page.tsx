import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Политика конфиденциальности</h1>
        </div>

        <p className="text-sm text-muted-foreground">Обновлено: 6 апреля 2026 г.</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CV CMS (&quot;the Service&quot;) is a headless CMS for managing professional career data.
              This policy describes what data we collect, how we use it, and your rights regarding that data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Data We Collect</h2>

            <h3 className="text-base font-medium">Authentication Data</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you sign in via GitHub or Google OAuth, we receive and store your name, email address,
              and profile picture from the OAuth provider. This data is used solely for authentication
              and identifying your account.
            </p>

            <h3 className="text-base font-medium">Career Data</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Service stores the career data you create, including jobs, highlights (achievements,
              projects, responsibilities), profile information, and associated metadata such as skills,
              domains, keywords, and metrics.
            </p>

            <h3 className="text-base font-medium">Anonymous Usage</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you use the Service without signing in, your data is stored locally in your browser
              using IndexedDB. This data never leaves your device unless you choose to sign in,
              at which point it is migrated to a cloud database.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. How We Store Your Data</h2>

            <h3 className="text-base font-medium">Authenticated Users</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each authenticated user receives a dedicated Turso (libSQL) database. Your career data
              is isolated in your own database and is not shared with other users.
            </p>

            <h3 className="text-base font-medium">Anonymous Users</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Anonymous users&apos; data is stored in IndexedDB within the browser. This data persists
              until you clear your browser data or explicitly clear it through the Settings page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Cookies and Sessions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use only essential cookies required for authentication sessions. We do not use
              tracking cookies, analytics cookies, or any third-party advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Third-Party Services</h2>

            <h3 className="text-base font-medium">OAuth Providers</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use GitHub and Google as OAuth providers for authentication. Their respective
              privacy policies apply to data they process during the authentication flow.
            </p>

            <h3 className="text-base font-medium">Turso</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Authenticated user data is stored in Turso databases. Turso acts as our database
              provider and processes data on our behalf.
            </p>

            <h3 className="text-base font-medium">n8n Webhook Integration</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The resume optimizer feature sends your career data to a user-configured n8n webhook
              URL for AI processing. This integration is optional and entirely user-initiated.
              The webhook URL is stored only in your browser&apos;s local storage. Personal contact
              details (name, email, phone, etc.) are not sent to the webhook &mdash; they are
              injected server-side after the AI response is received.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Data Export and Deletion</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can export all your data at any time from the Settings page as a JSON file.
              You can also delete all your data through the Settings page. These options are
              available to both authenticated and anonymous users.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Контакты</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              По вопросам, связанным с обработкой персональных данных, обращайтесь
              по электронной почте{' '}
              <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">
                i@vladpr.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
