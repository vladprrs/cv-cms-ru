import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Upload,
  Target,
  Zap,
  Clock,
  Shield,
  BarChart3,
  FileText,
  ArrowRight,
  CheckCircle,
  Layers,
  Repeat,
  Search,
  Sparkles,
  Heart,
  Eye,
  Coffee,
  ChevronRight,
  ChevronDown,
  Check,
  Minus,
  Quote,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'CV CMS — Создавайте адресные резюме за минуты, а не за часы',
  description:
    'Headless CMS для карьерных данных. Храните опыт в виде атомарных блоков и генерируйте ATS-оптимизированные резюме под каждую вакансию за 5 минут.',
};

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/75 backdrop-blur-lg">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            CV CMS
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/signin">Войти</Link>
            </Button>
            <Button size="sm" className="pr-1.5" asChild>
              <Link href="/app">
                <span>Попробовать</span>
                <ChevronRight className="opacity-50" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Section 1: Hero ─────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="py-20 md:pt-32">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance font-serif text-4xl font-medium sm:text-5xl">
            Headless CMS для ваших карьерных данных.
          </h1>
          <p className="text-muted-foreground mt-4 text-balance text-lg">
            Храните весь карьерный путь в виде атомарных блоков — достижения,
            проекты, метрики — и собирайте из них ATS-оптимизированные резюме
            под каждую вакансию. 5 минут вместо часа.
          </p>
          <Button asChild className="mt-8 pr-1.5">
            <Link href="/app">
              <span className="text-nowrap">Попробовать бесплатно — без регистрации</span>
              <ChevronRight className="opacity-50" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: Features ─────────────────────────────────────────────────────

const features = [
  {
    icon: Upload,
    title: 'Загрузите один раз — используйте всегда',
    description:
      'Заполните вручную или импортируйте из JSON-файла. Используйте AI-промпт, чтобы превратить любое резюме в структурированные данные. Каждый проект, метрика и достижение становится отдельным атомом с богатыми метаданными.',
  },
  {
    icon: Target,
    title: 'Увидьте, как ваш опыт ложится на вакансию',
    description:
      'Вставьте описание вакансии — система выберет самые релевантные атомы из всей карьерной истории и соберёт из них целевое резюме.',
  },
  {
    icon: Zap,
    title: 'Сгенерируйте за 5 минут',
    description:
      'Получите буллеты, переписанные на языке вакансии, отредактируйте результат прямо в интерфейсе и скачайте чистый PDF.',
  },
];

function Features() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
            Откликайтесь на 10 вакансий в неделю — каждый раз с резюме, которое попадает в точку
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">
            CV CMS хранит весь ваш карьерный путь в виде атомарных блоков и собирает
            из них резюме под конкретную роль. ATS-оптимизация,
            релевантные ключевые слова, профессиональный PDF.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/50 shadow-none p-6">
              <div className="space-y-2">
                <f.icon className="text-foreground h-5 w-5 mb-3" />
                <h3 className="text-foreground font-medium">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: Stats ────────────────────────────────────────────────────────

function Stats() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
          <div className="border-y py-6">
            <p className="text-muted-foreground text-xl">
              <span className="text-foreground font-medium">5 мин</span> на адресное резюме.
            </p>
          </div>
          <div className="border-y py-6">
            <p className="text-muted-foreground text-xl">
              <span className="text-foreground font-medium">8–9 часов</span> экономии в неделю при 10 откликах.
            </p>
          </div>
          <div className="border-y py-6">
            <p className="text-muted-foreground text-xl">
              <span className="text-foreground font-medium">100%</span> карьеры в одной структурированной базе.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: CTA ──────────────────────────────────────────────────────────

function CtaTryNow() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <Card className="border-border/50 shadow-none p-8 sm:p-12">
          <div className="text-center">
            <Sparkles className="mx-auto mb-4 h-5 w-5 text-muted-foreground" />
            <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
              Попробуйте прямо сейчас — без регистрации
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
              Начните вводить свой опыт или импортируйте JSON-файл. Используйте
              AI-промпт, чтобы превратить любое резюме в структурированные данные.
              Вы увидите свою карьеру так, как никогда раньше.
            </p>
            <Button asChild className="mt-6 pr-1.5">
              <Link href="/app">
                <span>Начать</span>
                <ChevronRight className="opacity-50" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ─── Section 5: Aha Moments ──────────────────────────────────────────────────

function AhaMoments() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
          Два момента, после которых вы не вернётесь к старому способу
        </h2>
        <p className="text-muted-foreground mt-4 text-balance max-w-xl">
          Эти осознания меняют подход к каждому отклику на вакансию.
        </p>
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          <Card className="border-border/50 shadow-none p-6">
            <div className="space-y-4">
              <Quote className="text-foreground/15 h-8 w-8" />
              <div className="space-y-2">
                <h3 className="text-foreground font-medium text-lg">
                  &laquo;У меня, оказывается, 47 значимых достижений&raquo;
                </h3>
                <p className="text-muted-foreground text-sm">
                  После импорта вы увидите свой опыт, разложенный на атомы —
                  каждый с метриками, доменами, технологиями и контекстом роли.
                  Большинство людей удивляются: 7–10 лет работы — это гораздо
                  больше, чем помещается на одной странице.
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-border/50 shadow-none p-6">
            <div className="space-y-4">
              <Quote className="text-foreground/15 h-8 w-8" />
              <div className="space-y-2">
                <h3 className="text-foreground font-medium text-lg">
                  &laquo;Это резюме — под эту вакансию — за 4 минуты?&raquo;
                </h3>
                <p className="text-muted-foreground text-sm">
                  Вставьте описание вакансии, нажмите &laquo;Сгенерировать&raquo;.
                  PDF готов. Никакого копипейста между документами,
                  никакого &laquo;ладно, отправлю универсальную версию&raquo;.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Value Propositions ───────────────────────────────────────────

const values = [
  {
    icon: Search,
    title: 'Подбор вместо угадывания',
    description:
      'Система выбирает самые релевантные атомы из всей вашей карьеры под конкретную вакансию — никакого ручного перебора, что включить.',
  },
  {
    icon: Shield,
    title: 'Буллеты, которые звучат как вы',
    description:
      'AI предлагает формулировки в формате «действие — результат — метрика» на языке вакансии. Каждый пункт основан на ваших реальных данных.',
  },
  {
    icon: Clock,
    title: '5 минут вместо часа',
    description:
      'При 10 откликах в неделю вы экономите 8–9 часов. Целый рабочий день на подготовку к собеседованиям, нетворкинг или отдых.',
  },
  {
    icon: Layers,
    title: 'Ваши данные — ваш контроль',
    description:
      'Работает без регистрации в локальном хранилище браузера. Войдите, чтобы синхронизировать в облако. Карьерные данные всегда можно экспортировать в JSON — никакой привязки к платформе.',
  },
];

function ValuePropositions() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
          Что меняется, когда ваш опыт — это данные, а не документ
        </h2>
        <p className="text-muted-foreground mt-4 text-balance max-w-xl">
          Всё, что нужно, чтобы легко создавать, отправлять и улучшать адресные резюме.
        </p>
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {values.map((v) => (
            <Card key={v.title} className="border-border/50 shadow-none p-6">
              <div className="space-y-2">
                <v.icon className="text-foreground h-5 w-5 mb-3" />
                <h3 className="text-foreground font-medium">{v.title}</h3>
                <p className="text-muted-foreground text-sm">{v.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 7: "That's Me" ──────────────────────────────────────────────────

const painPoints = [
  'Вас сократили, вы выгорели или хотите расти — и начали активный поиск.',
  'Вы отправили «универсальное» резюме и получили отказ на скрининге — хотя точно знаете, что опыт есть.',
  '«У меня 8 лет в продакт-менеджменте, но рекрутер даже не открыл моё резюме.»',
  '«Откликаюсь три недели, а воронка пустая — может, дело во мне?»',
  'Вы тратите воскресный вечер на переделку одного и того же документа под пять вакансий — а к концу просто отправляете «и так сойдёт».',
  'На рабочем столе лежит «CV_final_v3_avito_2_NEW.pdf», и вы уже не помните, какая версия куда ушла.',
];

function ThatsMe() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
            Знакомо?
          </h2>
          <p className="text-muted-foreground mt-6 text-lg italic leading-relaxed">
            Хотите получить оффер как можно быстрее — в компании, где ваш
            опыт действительно ценится? Или хотя бы перестать чувствовать,
            что 10 лет карьеры = &laquo;нам не подходит&raquo;?
          </p>
        </div>
        <div className="mt-12 max-w-2xl">
          <p className="text-foreground font-medium mb-6">Это про вас, если:</p>
          <div className="space-y-1">
            {painPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-border/50 py-3 last:border-0">
                <Check className="text-foreground h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 8: How It Works ─────────────────────────────────────────────────

interface Step {
  step: string;
  youDo: string;
  youGet: string;
}

function StepRows({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <Card key={s.step} className="border-border/50 shadow-none p-5">
          <div className="grid gap-4 sm:grid-cols-[140px_1fr_1fr]">
            <p className="text-foreground text-sm font-medium">{s.step}</p>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Что вы делаете</p>
              <p className="text-foreground text-sm">{s.youDo}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Что получаете</p>
              <p className="text-foreground text-sm">{s.youGet}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

const coreJob1: Step[] = [
  { step: '1. Инвентаризация', youDo: 'Заполните вручную или импортируйте JSON-файл', youGet: 'Структурированная база атомов: достижения, проекты, роли — каждый с метриками, технологиями и доменами' },
  { step: '2. Анализ вакансии', youDo: 'Вставьте описание вакансии', youGet: 'AI выбирает релевантные атомы и переписывает их на языке вакансии' },
  { step: '3. Подбор и сборка', youDo: 'Просмотрите и отредактируйте сгенерированное резюме', youGet: 'Адресное резюме: правильные акценты, терминология, порядок блоков — готово к скачиванию' },
  { step: '4. PDF и отправка', youDo: 'Нажмите «Скачать»', youGet: 'Чистый PDF через печать браузера. Готов к отправке' },
];

const coreJob2: Step[] = [
  { step: 'Редактирование', youDo: 'Подправьте буллеты, удалите нерелевантное', youGet: 'Отполированное резюме, которое звучит как вы, а не как шаблон' },
  { step: 'Итерация', youDo: 'Сгенерируйте снова с другой вакансией', youGet: 'Каждое резюме собирается заново из всей базы атомов' },
];

const coreJob3: Step[] = [
  { step: 'Облачная синхр.', youDo: 'Войдите через GitHub или Google', youGet: 'Локальные данные автоматически мигрируют в персональную облачную базу — доступ с любого устройства' },
  { step: 'Свой пайплайн', youDo: 'Подключите собственный n8n-вебхук для AI-генерации', youGet: 'Полный контроль: ваши API-ключи, ваша модель, данные не хранятся на сторонних серверах' },
];

function HowItWorks() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
          Как это работает
        </h2>
        <p className="text-muted-foreground mt-4 text-balance max-w-xl">
          От хаоса к адресному резюме за 4 шага.
        </p>

        <div className="mt-12 space-y-12">
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              &laquo;Мне нужно быстро собрать резюме под конкретную роль&raquo;
            </h3>
            <StepRows steps={coreJob1} />
          </div>

          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              &laquo;Хочу довести результат до идеала перед отправкой&raquo;
            </h3>
            <StepRows steps={coreJob2} />
          </div>

          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              &laquo;Хочу, чтобы мои данные были в безопасности и под моим контролем&raquo;
            </h3>
            <StepRows steps={coreJob3} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 9: Emotions / Results ───────────────────────────────────────────

function Emotions() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <h2 className="text-balance font-serif text-3xl font-medium">
              Что вы почувствуете
            </h2>
            <div className="mt-8 space-y-6">
              {[
                { icon: Heart, label: 'Уверенность', text: 'Вы знаете, что каждый отклик уходит с резюме, которое говорит на языке вакансии.' },
                { icon: Eye, label: 'Контроль', text: 'Вы видите всю карьеру структурированной и доступной для поиска. Каждое достижение размечено навыками, доменами и метриками. Поиск работы становится управляемым процессом, а не хаосом.' },
                { icon: Coffee, label: 'Спокойствие', text: 'Вы не сжигаете выходные на ручную правку документов. Есть время подготовиться к собеседованиям, отдохнуть, восстановиться.' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="text-foreground h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium text-sm">{item.label}</p>
                    <p className="text-muted-foreground text-sm mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-balance font-serif text-3xl font-medium">
              Как выглядит результат
            </h2>
            <div className="mt-8 space-y-6">
              {[
                { label: 'Вы получаете оффер быстрее', text: 'Конверсия на скрининге растёт, когда резюме действительно попадает в точку.' },
                { label: 'Вы возвращаете профессиональную уверенность', text: 'Вы видите свой полный опыт: 47 достижений, 12 доменов, 8 лет роста. Дело не в «я не подхожу» — а в «я не подсветил нужное».' },
                { label: 'Вы тратите энергию на то, что важно', text: 'Подготовка к собеседованиям, нетворкинг, развитие — а не борьба с Word и копипейстом.' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <Check className="text-foreground h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium text-sm">{item.label}</p>
                    <p className="text-muted-foreground text-sm mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 10: FAQ ─────────────────────────────────────────────────────────

const faqs = [
  {
    question: '«У меня нет времени заполнять ещё один инструмент»',
    answer:
      'Используйте AI-промпт, чтобы превратить любое резюме или описание карьеры в структурированный JSON для импорта. Или заполните данные вручную — формы быстрые. Первичная инвентаризация занимает 15–30 минут. После этого вы просто нажимаете «Сгенерировать».',
  },
  {
    question: '«Тексты от AI выглядят шаблонно и неестественно»',
    answer:
      'Мы не генерируем текст из воздуха. Каждый буллет основан на ваших реальных данных — метриках, проектах, результатах. AI помогает со структурой и терминологией, но контент — ваш.',
  },
  {
    question: '«Мне нужны версии и на английском, и на русском»',
    answer:
      'Вводите атомы на любом языке. Генерируйте резюме на языке вакансии — AI адаптирует терминологию автоматически. Отлично работает для двуязычного поиска работы.',
  },
];

function LoweringBarriers() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
            &laquo;Но...&raquo;
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">
            Частые сомнения — честные ответы.
          </p>
        </div>
        <div className="mt-12 max-w-2xl space-y-px">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-border/50"
            >
              <summary className="flex cursor-pointer items-center justify-between py-5 font-medium text-sm">
                {faq.question}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="pb-5 text-sm text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 11: Competition ─────────────────────────────────────────────────

const competitors = [
  {
    label: 'Google Docs',
    quote: '«Я и так адаптирую резюме в Google Docs»',
    answer:
      'Ручное редактирование работает на 2–3 отклика. К десятому вы устаёте — начинаете отправлять универсальную версию и получаете отказы. CV CMS делает десятую итерацию такой же быстрой, как первую.',
    has: ['Ручное редактирование', 'Бесплатно', 'Привычно'],
    misses: ['Нет структурированных данных', 'Нет версионности', 'Нет подбора под вакансию'],
  },
  {
    label: 'Teal / Jobscan / Kickresume',
    quote: '«Есть же Teal / Jobscan / Kickresume»',
    answer:
      'Они полируют готовый PDF — подсвечивают ключевые слова, проверяют ATS-совместимость. Но не хранят ваш опыт как структурированные данные. Нельзя пересобрать документ из атомов, отследить версии, провести ретроспективу. Это косметика, а не архитектура.',
    has: ['Проверка ATS', 'Анализ ключевых слов', 'Шаблоны'],
    misses: ['Нет атомарных данных', 'Нет пересборки', 'Нет ретроспективы'],
  },
  {
    label: 'ChatGPT',
    quote: '«ChatGPT перепишет резюме бесплатно»',
    answer:
      'LLM не знает ваш реальный опыт — он выдумывает метрики и приукрашивает. После 3 итераций у вас будет текст, который невозможно защитить на собеседовании. CV CMS генерирует только из ваших проверенных данных — ни одной выдуманной цифры.',
    has: ['Быстро', 'Бесплатно', 'Гибко'],
    misses: ['Галлюцинации', 'Нет реальных данных', 'Не защитишь на интервью'],
  },
];

function Competition() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
          Почему не [альтернатива]?
        </h2>
        <p className="text-muted-foreground mt-4 text-balance max-w-xl">
          Узнайте, чем CV CMS отличается.
        </p>
        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {competitors.map((c) => (
            <Card key={c.label} className="border-border/50 shadow-none p-6">
              <div className="space-y-4">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{c.label}</p>
                <h3 className="text-foreground font-medium">{c.quote}</h3>
                <p className="text-muted-foreground text-sm">{c.answer}</p>
                <div className="space-y-2 pt-2 border-t border-border/50">
                  {c.has.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                  {c.misses.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 12: Final CTA ──────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance font-serif text-3xl font-medium sm:text-4xl">
            Ваш следующий отклик может быть другим
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">
            Без аккаунта. Без карты. Без барьеров. Начните вводить свой
            опыт, импортируйте данные и сгенерируйте первое адресное
            резюме. 5 минут до первого PDF.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="pr-1.5">
              <Link href="/app">
                <span>Попробовать бесплатно — без регистрации</span>
                <ChevronRight className="opacity-50" />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/signin">Войти</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Background Blobs ─────────────────────────────────────────────────────────

function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hero area dot grid */}
      <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(circle_at_1px_1px,_var(--border)_1px,_transparent_0)] bg-[size:40px_40px] opacity-[0.15]" />

      {/* Hero blobs */}
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-violet-500/20 blur-[120px]" />
      <div className="absolute -top-[100px] -left-32 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[100px]" />
      <div className="absolute top-0 -right-32 h-[400px] w-[400px] rounded-full bg-rose-500/10 blur-[100px]" />

      {/* Mid-upper blobs */}
      <div className="absolute top-[25%] right-[10%] h-[500px] w-[600px] rounded-full bg-amber-500/15 blur-[120px]" />
      <div className="absolute top-[35%] -left-32 h-[500px] w-[500px] rounded-full bg-rose-500/15 blur-[100px]" />

      {/* Mid blobs */}
      <div className="absolute top-[50%] -right-32 h-[500px] w-[500px] rounded-full bg-blue-500/12 blur-[100px]" />
      <div className="absolute top-[65%] -left-48 h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-[120px]" />

      {/* Lower blobs */}
      <div className="absolute top-[75%] -right-32 h-[400px] w-[400px] rounded-full bg-amber-500/12 blur-[100px]" />

      {/* Bottom blobs */}
      <div className="absolute top-[85%] left-1/2 -translate-x-1/2 h-[800px] w-[600px] rounded-full bg-violet-500/20 blur-[120px]" />
      <div className="absolute top-[90%] -left-32 h-[400px] w-[400px] rounded-full bg-blue-500/15 blur-[100px]" />
      <div className="absolute top-[92%] -right-32 h-[400px] w-[400px] rounded-full bg-rose-500/10 blur-[100px]" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative">
      <BackgroundBlobs />
      <div className="relative">
        <Navbar />
        <Hero />
        <Features />
        <Stats />
        <CtaTryNow />
        <AhaMoments />
        <ValuePropositions />
        <ThatsMe />
        <HowItWorks />
        <Emotions />
        <LoweringBarriers />
        <Competition />
        <FinalCta />
      </div>
    </div>
  );
}
