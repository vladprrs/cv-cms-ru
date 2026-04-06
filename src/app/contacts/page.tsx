import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Globe, Github } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Контакты и реквизиты</h1>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Реквизиты</h2>
            <div className="rounded-lg border bg-card p-6 space-y-2 text-sm">
              <div className="grid grid-cols-[140px_1fr] gap-y-2">
                <span className="text-muted-foreground">ФИО</span>
                <span>Прищепов Владислав Евгеньевич</span>

                <span className="text-muted-foreground">Статус</span>
                <span>Самозанятый (плательщик НПД)</span>

                <span className="text-muted-foreground">ИНН</span>
                <span>544502002569</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Контакты</h2>
            <div className="space-y-3">
              <a
                href="mailto:i@vladpr.com"
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm hover:bg-accent transition-colors"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>i@vladpr.com</span>
              </a>
              <a
                href="https://cv-cms.com"
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm hover:bg-accent transition-colors"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>cv-cms.com</span>
              </a>
              <a
                href="https://github.com/vladpr-com/cv-cms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm hover:bg-accent transition-colors"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
                <span>github.com/vladpr-com/cv-cms</span>
              </a>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">По вопросам оплаты и возвратов</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Для оформления возврата или по любым вопросам, связанным с оплатой,
              напишите на{' '}
              <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">
                i@vladpr.com
              </a>
              . Срок рассмотрения обращений — до 3 рабочих дней.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
