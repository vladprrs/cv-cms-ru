import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Публичная оферта</h1>
        </div>

        <p className="text-sm text-muted-foreground">Дата публикации: 6 апреля 2026 г.</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Общие положения</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Настоящий документ является публичной офертой (далее — &laquo;Оферта&raquo;)
              Прищепова Владислава Евгеньевича, самозанятого (плательщика налога на
              профессиональный доход), ИНН 544502002569 (далее — &laquo;Исполнитель&raquo;),
              адресованной любому физическому лицу (далее — &laquo;Заказчик&raquo;),
              и содержит все существенные условия оказания услуг.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              В соответствии со статьёй 437 Гражданского кодекса Российской Федерации
              настоящий документ является публичной офертой. Оплата услуг Заказчиком
              является акцептом настоящей Оферты (статья 438 ГК РФ) и означает
              полное и безоговорочное принятие Заказчиком всех её условий.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Предмет оферты</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Исполнитель оказывает Заказчику услуги по предоставлению доступа
              к функциям генерации резюме с использованием искусственного интеллекта
              на платформе CV CMS (далее — &laquo;Сервис&raquo;), расположенной
              по адресу{' '}
              <a href="https://cv-cms.com" className="underline hover:text-foreground">
                cv-cms.com
              </a>
              .
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Услуга включает: анализ карьерных данных Заказчика, хранящихся в Сервисе,
              и генерацию резюме, адаптированного под указанную Заказчиком вакансию,
              с помощью технологий искусственного интеллекта.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Описание услуг</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сервис CV CMS предоставляет следующие возможности:
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Бесплатные функции:</strong> хранение и управление карьерными данными
                (профиль, места работы, достижения, проекты), экспорт и импорт данных
              </li>
              <li>
                <strong>Платная услуга:</strong> генерация резюме с помощью ИИ — создание
                резюме, адаптированного под конкретную вакансию, на основе карьерных данных
                Заказчика. Каждая генерация списывает один кредит с баланса Заказчика
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Стоимость услуг и порядок оплаты</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Стоимость услуг определяется в соответствии с действующими тарифами,
              опубликованными на странице{' '}
              <Link href="/pricing" className="underline hover:text-foreground">
                &laquo;Услуги и цены&raquo;
              </Link>
              . Оплата производится в российских рублях.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Актуальные тарифы:
            </p>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Пакет Starter — 3 кредита за 299 &#8381;</li>
              <li>Пакет Standard — 15 кредитов за 699 &#8381;</li>
              <li>Пакет Bulk — 50 кредитов за 1 500 &#8381;</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Оплата принимается через платёжный сервис ЮKassa. Доступные способы
              оплаты: банковские карты (Visa, Mastercard, МИР), СБП и другие способы,
              предоставляемые ЮKassa.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Исполнитель применяет специальный налоговый режим &laquo;Налог на
              профессиональный доход&raquo; и не является плательщиком НДС.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Порядок оказания услуг</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Услуга является цифровой и предоставляется в электронном виде.
            </p>
            <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-1">
              <li>Заказчик регистрируется в Сервисе через GitHub или Google OAuth</li>
              <li>Заказчик выбирает и оплачивает пакет кредитов</li>
              <li>После успешной оплаты кредиты мгновенно зачисляются на баланс Заказчика</li>
              <li>
                Заказчик использует кредиты для генерации резюме: вводит текст вакансии,
                Сервис формирует адаптированное резюме на основе карьерных данных Заказчика
              </li>
              <li>Услуга считается оказанной в момент предоставления сгенерированного резюме</li>
            </ol>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Приобретённые кредиты не имеют срока действия и доступны до полного использования.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Возврат средств</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Заказчик вправе потребовать возврата средств за неиспользованные кредиты
              в течение 14 (четырнадцати) календарных дней с момента оплаты. Для оформления
              возврата необходимо направить обращение на электронную почту{' '}
              <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">
                i@vladpr.com
              </a>{' '}
              с указанием номера заказа.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Возврат средств за использованные кредиты (по которым была оказана услуга
              генерации резюме) не производится. Возврат осуществляется тем же способом,
              которым была произведена оплата, в течение 10 рабочих дней с момента
              подтверждения обращения.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Права и обязанности сторон</h2>

            <h3 className="text-base font-medium">Исполнитель обязуется:</h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Оказывать услуги надлежащего качества в соответствии с настоящей Офертой</li>
              <li>Обеспечивать работоспособность Сервиса</li>
              <li>Обеспечивать сохранность данных Заказчика</li>
              <li>Рассматривать обращения Заказчика в разумные сроки</li>
            </ul>

            <h3 className="text-base font-medium">Заказчик обязуется:</h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Использовать Сервис по назначению и в соответствии с законодательством РФ</li>
              <li>Не передавать доступ к своему аккаунту третьим лицам</li>
              <li>Своевременно оплачивать услуги</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Ответственность сторон</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Исполнитель не несёт ответственности за содержание и достоверность
              карьерных данных, предоставленных Заказчиком. Результаты генерации резюме
              с помощью ИИ носят рекомендательный характер — Заказчик самостоятельно
              проверяет и редактирует итоговый документ перед использованием.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Исполнитель не гарантирует бесперебойную работу Сервиса и не несёт
              ответственности за временную недоступность, вызванную техническими
              работами или обстоятельствами непреодолимой силы.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Персональные данные</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Обработка персональных данных Заказчика осуществляется в соответствии
              с Федеральным законом от 27.07.2006 № 152-ФЗ &laquo;О персональных
              данных&raquo; и{' '}
              <Link href="/privacy" className="underline hover:text-foreground">
                Политикой конфиденциальности
              </Link>{' '}
              Сервиса.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">10. Срок действия и изменение оферты</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Настоящая Оферта вступает в силу с момента публикации на сайте Сервиса
              и действует до момента её отзыва Исполнителем. Исполнитель вправе
              изменить условия Оферты в любое время, опубликовав новую редакцию
              на данной странице. Продолжение использования платных услуг после
              изменения Оферты означает согласие с новыми условиями.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">11. Разрешение споров</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Все споры и разногласия разрешаются путём переговоров. При невозможности
              достижения согласия споры рассматриваются в соответствии с действующим
              законодательством Российской Федерации.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t">
            <h2 className="text-lg font-semibold">12. Реквизиты Исполнителя</h2>
            <div className="rounded-lg border bg-card p-4 text-sm space-y-1">
              <p>Прищепов Владислав Евгеньевич</p>
              <p>Самозанятый (плательщик НПД)</p>
              <p>ИНН: 544502002569</p>
              <p>
                Email:{' '}
                <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">
                  i@vladpr.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
