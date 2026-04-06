import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Zap, Rocket } from 'lucide-react';
import { PACKS } from '@/lib/credits';

const PACK_ICONS = [Sparkles, Zap, Rocket] as const;

export default function PricingPage() {
  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Услуги и цены</h1>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Описание услуги</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CV CMS — сервис для управления карьерными данными и генерации
              резюме с помощью искусственного интеллекта. Сервис позволяет хранить
              ваш профессиональный опыт в структурированном виде и создавать
              резюме, адаптированные под конкретную вакансию.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Базовые функции сервиса (хранение данных, управление карьерной историей)
              доступны бесплатно. Генерация резюме с помощью ИИ — платная услуга,
              оплачиваемая кредитами.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Пакеты кредитов</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Один кредит = одна генерация резюме под вакансию. Кредиты не имеют
              срока действия и доступны до полного использования.
            </p>
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PACKS.map((pack, i) => {
            const Icon = PACK_ICONS[i];
            const perCredit = Math.round(pack.priceRub / pack.credits);
            return (
              <div
                key={pack.id}
                className="rounded-lg border bg-card p-6 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{pack.name}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{pack.priceRub} &#8381;</p>
                  <p className="text-sm text-muted-foreground">
                    {pack.credits} {pack.credits === 3 ? 'кредита' : 'кредитов'} &middot; {perCredit} &#8381;/шт
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Как получить услугу после оплаты</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Это цифровая услуга. После успешной оплаты кредиты мгновенно
              зачисляются на ваш аккаунт в CV CMS. Вы можете использовать их
              на странице &laquo;Оптимизатор резюме&raquo; для генерации резюме
              под любую вакансию.
            </p>
            <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-1">
              <li>Войдите в аккаунт через GitHub или Google</li>
              <li>Перейдите в Настройки и выберите пакет кредитов</li>
              <li>Оплатите через ЮKassa (банковская карта, СБП и др.)</li>
              <li>Кредиты мгновенно появятся на вашем балансе</li>
              <li>Откройте &laquo;Оптимизатор резюме&raquo;, вставьте текст вакансии и получите готовое резюме</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Оплата</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Оплата принимается через платёжный сервис ЮKassa. Доступные способы
              оплаты: банковские карты (Visa, Mastercard, МИР), СБП (Система быстрых платежей)
              и другие способы, предоставляемые ЮKassa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Возврат средств</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Возврат средств за неиспользованные кредиты возможен в течение
              14 дней с момента оплаты. Для оформления возврата напишите
              на почту{' '}
              <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">
                i@vladpr.com
              </a>{' '}
              с указанием номера заказа. Использованные кредиты возврату не подлежат.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Оплачивая услугу, вы принимаете условия{' '}
              <Link href="/terms" className="underline hover:text-foreground">
                публичной оферты
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
