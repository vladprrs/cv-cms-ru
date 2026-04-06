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

        <p className="text-sm text-muted-foreground">
          Версия: 2026-04-06-v1 | Дата вступления в силу: 6 апреля 2026 г.
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">

          {/* 1. Оператор */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Оператор персональных данных</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Оператор персональных данных — индивидуальный предприниматель,
              владелец сервиса CV CMS (далее — &laquo;Сервис&raquo;),
              доступного по адресу{' '}
              <a href="https://cv-cms.com" className="underline hover:text-foreground">
                cv-cms.com
              </a>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              По вопросам обработки персональных данных (доступ, исправление, удаление,
              отзыв согласия) обращайтесь по электронной почте:{' '}
              <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">
                i@vladpr.com
              </a>.
            </p>
          </section>

          {/* 2. Правовое основание */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Правовое основание обработки</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Обработка персональных данных осуществляется на основании добровольного,
              информированного и однозначного согласия субъекта персональных данных
              (статья 6, пункт 1, часть 1; статья 9 Федерального закона от 27.07.2006 № 152-ФЗ
              &laquo;О персональных данных&raquo;).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Согласие предоставляется до начала обработки данных — перед авторизацией
              через OAuth-провайдера. Согласие может быть отозвано в любое время
              путём удаления аккаунта в разделе &laquo;Настройки&raquo;.
            </p>
          </section>

          {/* 3. Категории данных */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Категории собираемых данных</h2>

            <h3 className="text-base font-medium">3.1. Данные аутентификации</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              При входе через GitHub или Google OAuth Сервис получает и хранит:
              имя пользователя, адрес электронной почты, URL аватара.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Цель обработки:</strong> идентификация пользователя, аутентификация,
              управление сессиями.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Срок хранения:</strong> до момента удаления аккаунта пользователем.
            </p>

            <h3 className="text-base font-medium">3.2. Карьерные данные</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сервис хранит данные, которые пользователь создаёт самостоятельно:
              места работы (компания, должность, даты), достижения, проекты,
              обязанности, профиль (ФИО, контактные данные), навыки, домены, метрики.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Цель обработки:</strong> предоставление основного функционала Сервиса —
              управление карьерными данными и генерация резюме.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Срок хранения:</strong> до момента удаления аккаунта или отдельных записей
              пользователем.
            </p>

            <h3 className="text-base font-medium">3.3. Платёжные данные</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сервис хранит информацию о покупках кредитов: идентификатор пакета,
              количество кредитов, сумму в рублях, статус платежа, идентификатор
              платежа ЮKassa. Данные банковских карт Сервис не хранит —
              они обрабатываются ЮKassa (PCI DSS).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Цель обработки:</strong> учёт операций, начисление кредитов,
              исполнение обязательств по договору.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Срок хранения:</strong> 5 лет с момента совершения операции
              (статья 29 Федерального закона от 06.12.2011 № 402-ФЗ
              &laquo;О бухгалтерском учёте&raquo;). При удалении аккаунта записи
              о покупках обезличиваются (удаляется привязка к пользователю),
              но сохраняются на указанный срок.
            </p>

            <h3 className="text-base font-medium">3.4. Данные согласий</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сервис хранит записи о фактах предоставления и отзыва согласия:
              версия политики, область согласия, дата предоставления, дата отзыва.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Цель обработки:</strong> обеспечение доказательной базы получения согласия
              (статья 9 152-ФЗ).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Срок хранения:</strong> бессрочно (для целей аудита).
            </p>

            <h3 className="text-base font-medium">3.5. Анонимное использование</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Если вы используете Сервис без авторизации, ваши данные хранятся
              локально в браузере (IndexedDB) и никогда не покидают ваше устройство,
              пока вы не решите войти в систему.
            </p>
          </section>

          {/* 4. Файлы cookie и сессии */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Файлы cookie и сессии</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сервис использует только необходимые (функциональные) cookie для поддержания
              сессии аутентификации. Рекламные, аналитические и иные
              cookie третьих сторон не используются. Данные о теме оформления
              и URL веб-хука хранятся в localStorage браузера.
            </p>
          </section>

          {/* 5. Третьи лица */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Передача данных третьим лицам</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сервис передаёт персональные данные следующим третьим лицам:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">Получатель</th>
                    <th className="text-left py-2 pr-4 font-medium">Данные</th>
                    <th className="text-left py-2 font-medium">Цель</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">GitHub (Microsoft)</td>
                    <td className="py-2 pr-4">Email, имя, аватар</td>
                    <td className="py-2">OAuth-аутентификация</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Google (Alphabet)</td>
                    <td className="py-2 pr-4">Email, имя, аватар</td>
                    <td className="py-2">OAuth-аутентификация</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Turso (ChiselStrike)</td>
                    <td className="py-2 pr-4">Все данные пользователя</td>
                    <td className="py-2">Хранение данных (база данных)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">ЮKassa (НКО &laquo;ЮМани&raquo;)</td>
                    <td className="py-2 pr-4">Сумма платежа, идентификатор операции</td>
                    <td className="py-2">Обработка платежей</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">AI-сервис (через webhook)</td>
                    <td className="py-2 pr-4">Карьерные данные (без контактов)</td>
                    <td className="py-2">Генерация резюме</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Vercel (Vercel Inc.)</td>
                    <td className="py-2 pr-4">Сетевые данные (IP, User-Agent)</td>
                    <td className="py-2">Хостинг приложения</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              При использовании функции оптимизации резюме карьерные данные
              (места работы, достижения, навыки) передаются AI-сервису.
              Персональные контактные данные (ФИО, email, телефон и т.д.)
              <strong> не передаются</strong> — они добавляются на стороне сервера
              после получения ответа от AI. Отдельное согласие на такую передачу
              запрашивается при первом использовании данной функции.
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Если пользователь настраивает собственный URL веб-хука (n8n),
              карьерные данные будут отправлены на указанный им внешний сервис.
              Пользователь несёт ответственность за сохранность данных на своём сервисе.
            </p>
          </section>

          {/* 6. Хранение данных */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Хранение данных</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Данные аутентифицированных пользователей хранятся в выделенных
              базах данных Turso (libSQL). Каждый пользователь получает
              изолированную базу данных — данные не пересекаются между пользователями.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Серверы расположены в дата-центрах Turso. Данные передаются
              по зашифрованному каналу (TLS).
            </p>
          </section>

          {/* 7. Права субъекта */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Права субъекта персональных данных</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              В соответствии с Федеральным законом № 152-ФЗ вы имеете право:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
              <li>
                <strong>Право на доступ</strong> — запросить информацию о том,
                какие персональные данные обрабатываются. Направьте запрос
                на <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">i@vladpr.com</a>.
              </li>
              <li>
                <strong>Право на исправление</strong> — потребовать исправления
                неточных данных. Большинство данных вы можете исправить
                самостоятельно в Сервисе. Для остальных случаев обращайтесь
                на <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">i@vladpr.com</a>.
              </li>
              <li>
                <strong>Право на удаление</strong> — удалить все свои данные.
                Самообслуживание: Настройки → &laquo;Удалить аккаунт&raquo;.
                При удалении уничтожаются все персональные данные из всех баз данных.
              </li>
              <li>
                <strong>Право на отзыв согласия</strong> — отозвать согласие
                на обработку персональных данных в любое время. Отзыв согласия
                равносилен удалению аккаунта. Оператор прекращает обработку
                и уничтожает данные немедленно.
              </li>
              <li>
                <strong>Право на экспорт</strong> — скачать все свои данные
                в формате JSON через раздел &laquo;Настройки&raquo;.
              </li>
            </ul>
          </section>

          {/* 8. Удаление данных */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Удаление данных</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              При удалении аккаунта Сервис немедленно:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
              <li>Удаляет учётную запись, сессии и OAuth-токены</li>
              <li>Удаляет персональную базу данных (все карьерные данные и профиль)</li>
              <li>Удаляет записи о кредитах и использовании</li>
              <li>Обезличивает записи о покупках (удаляет привязку к пользователю, сохраняет финансовые данные на 5 лет)</li>
              <li>Фиксирует факт отзыва согласия (для целей аудита)</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Неиспользованные кредиты при удалении аккаунта не возвращаются.
            </p>
          </section>

          {/* 9. Изменения политики */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Изменения Политики конфиденциальности</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              При обновлении данной Политики пользователям показывается
              постоянное уведомление с просьбой ознакомиться с изменениями
              и подтвердить согласие. На подтверждение отводится 14 календарных дней.
              Если в течение этого срока согласие не подтверждено, доступ к Сервису
              приостанавливается до момента подтверждения.
            </p>
          </section>

          {/* 10. Контакты */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">10. Контакты</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              По всем вопросам, связанным с обработкой персональных данных,
              включая запросы на доступ, исправление и удаление данных,
              обращайтесь по электронной почте:{' '}
              <a href="mailto:i@vladpr.com" className="underline hover:text-foreground">
                i@vladpr.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
