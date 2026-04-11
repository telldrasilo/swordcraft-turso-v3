# SwordCraft — Контекст для AI агентов

## Что это за проект
SwordCraft — браузерная игра-симулятор кузнеца оружия с системой гильдии, экспедиций, зачарований и заказов NPC.

## Технологии
Next.js 15, TypeScript 5, Zustand 5.0.6 (composed store), Tailwind CSS 4, shadcn/ui (Radix UI), Prisma 6.6.0, @libsql/client (Turso/libSQL)

## Порядок чтения документации

### Всегда читай первым:
**AGENTS.md** — этот файл (вы сейчас его читаете)

### Затем по очереди:
1. **docs/README.md** — навигация по всем файлам документации и карта систем игры
2. **docs/01_ARCHITECTURE.md** — обзор технологий, архитектурные паттерны, потоки данных между системами
3. **docs/03_STATE_MANAGEMENT.md** — Zustand store с описанием всех slices (центральная система)
4. **docs/04_TYPES_SYSTEM.md** — все интерфейсы, enum'ы, константы игры

### При работе с конкретными системами:
- **Крафт оружия** → docs/systems/FORGE_SYSTEM.md + docs/utils/CRAFT_CALCULATOR.md
- **Экспедиции** → docs/systems/GUILD_SYSTEM.md + EXPEDITION_SYSTEM.md (уже существует)
- **Заказы NPC** → docs/systems/ORDER_SYSTEM.md
- **Ресурсы и рабочие** → docs/systems/RESOURCE_SYSTEM.md
- **Зачарования** → docs/systems/ENCHANTMENT_SYSTEM.md
- **Туториал** → docs/systems/TUTORIAL_SYSTEM.md

### При работе с данными:
- **Материалы** → docs/data/MATERIALS_DATA.md; полный гайд добавления и энциклопедии — **docs/data/MATERIALS_ADDING.md**; маппинг id экспедиций — **docs/expedition-material-id-map.md**
- **Источник правды по материалам для игрока** — энциклопедия (каталог узлов), а не верхняя полоска ресурсов в макете: см. **docs/LEGACY_UI.md** (панель legacy, к удалению)
- **Цепочки руда/слиток/wood/stone и ключи склада** → **docs/RESOURCE_TRANSFORMATION_MAP.md** (человекочитаемая карта; источник правды — `inventory-check.ts`, `refining-recipes.ts`)
- **Переход на единый каталог материалов без legacy-мостов** → **docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md** (фазы, инварианты, склад A2, **обработка через техники и операции**, без постоянной миграции сейвов; при конфликте с устаревшими формулировками приоритет у roadmap). Чеклист PR волны A2 (stash, домены): **`.cursor/skills/materials-a2-wave/SKILL.md`**
- **Рецепты** → docs/data/RECIPES_DATA.md
- **Техники** → docs/data/TECHNIQUES_DATA.md; **энциклопедия (материалы/техники), микрозадачи, Крафтовая линия** — **docs/ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md**; skill подключения техники — **`.cursor/skills/technique-wiring/SKILL.md`**
- **Искатели** → docs/data/ADVENTURERS_DATA.md
- **События экспедиций** → docs/data/EXPEDITIONS_DATA.md

### При работе с формулами и расчётами:
- **Формулы игры** → docs/utils/FORMULAS.md

## Быстрые указатели по категориям

### Ключевые файлы проекта
- **src/store/game-store-composed.ts** — единый Zustand store (~1400 строк; часть cross-slice в `src/store/cross-slice/`)
- **src/lib/craft/calculator.ts** — расчёт характеристик оружия; коэффициенты — **`src/lib/craft/constants.ts`**, хелперы — **`src/lib/craft/formulas.ts`**
- **src/lib/expedition-calculator-v2.ts** — расчёт экспедиций с модификаторами
- **src/data/** — все статические данные игры

### Типы данных
- **src/types/** — все TypeScript интерфейсы и типы. ВСЕГДА проверяй типы перед изменением.

## Структура проекта
- **src/app/** — Next.js App Router (страницы, API маршруты)
- **src/components/** — React компоненты (screens/, systems/, ui/, shared/)
- **src/store/** — Zustand store (slices/, selectors/, cross-slice/, game-store-composed.ts)
- **src/lib/** — утилиты и бизнес-логика
- **src/types/** — TypeScript типы
- **src/data/** — статические данные игры
- **src/hooks/** — React hooks

## Общие правила

1. **ВСЕГДА проверяй типы в src/types/** перед изменением незнакомых систем**
2. Store находится в src/store/game-store-composed.ts — читай его перед изменениями
3. При добавлении новых типов — обновляй docs/04_TYPES_SYSTEM.md
4. При изменении игровых систем — обновляй соответствующие docs/systems/*.md
5. Используй существующие константы из src/lib/store-utils/constants.ts
6. Формулы расчётов задокументированы в docs/utils/FORMULAS.md

## API для работы с store

```typescript
// Получение store
import { useGameStore } from '@/store'
const store = useGameStore()

// Основные методы
store.startCraftWithResources(recipe)
store.startExpeditionFull(expedition, adventurer, weapon)
store.completeOrder(orderId, weaponId, weapon)
store.addMaterialExpertise(materialId, amount)
```

Завершение крафта **v2:** батч прироста экспертизы строится в `src/lib/craft/craft-expertise-from-craft.ts` и применяется из `use-craft-v2` через `queueMicrotask`, чтобы не дергать Zustand внутри updater’а React — см. `docs/utils/FORMULAS.md` (B2).

## Важные архитектурные решения

1. **Composed Store** — Все слайсы объединены в одном файле game-store-composed.ts
2. **Slice Pattern** — Каждый слайс отвечает за свою доменную область
3. **Cross-Slice Actions** — Сложные операции (несколько слайсов) в `game-store-composed.ts` и вынесенные модули `src/store/cross-slice/`
4. **Modifier System v2** — Система модификаторов экспедиций с 8 провайдерами
5. **Craft System v2** — Новая система крафта с детальным управлением материалами и этапами
6. **Cloud Saves** — Опционально: `NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true` + Turso; иначе только Zustand `persist` и локальный бэкап в `use-cloud-save`. Чеклист расширения схемы: `src/lib/cloud-save-feature.ts`

## Константы игры

- Цены ресурсов, максимальные уровни, пороги знаний задокументированы в src/lib/store-utils/constants.ts
- Формулы расчёта задокументированы в docs/utils/FORMULAS.md

## Сохранение и загрузка

- **Основной слой:** Zustand persist (`localStorage`, см. store) + локальный бэкап в `use-cloud-save.ts`
- **Облако (Turso):** только если **`NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true`**; иначе `/api/save` не используется клиентом (ответ 503 при прямом вызове). Чеклист расширения полей: `src/lib/cloud-save-feature.ts`
- API: `src/app/api/save/route.ts`
- **Разработка:** при смене схемы персиста или `STORE_VERSION` после `git pull` при странных ошибках загрузки — очистите `localStorage` для ключа `swordcraft-store-v2` (и при необходимости `swordcraft-offline-backup`); миграции сейвов до релиза не гарантируются.

## Тесты и проверка качества

### Что использовать
- **Unit-тесты:** [Vitest](https://vitest.dev/) (среда Node), файлы **`src/**/*.test.ts`** (см. [vitest.config.ts](vitest.config.ts)).
- **Покрытие:** провайдер `@vitest/coverage-v8`; отчёт в `./coverage/` (в `.gitignore`). В конфиге заданы **`coverage.include`** (`src/lib/**/*.ts`) и **`coverage.thresholds`**; `src/app/**` и `src/components/**` в метриках не участвуют.

### Команды (локально)
| Команда | Назначение |
|--------|------------|
| `npm run test` | Один прогон всех тестов |
| `npm run test:watch` | Режим watch |
| `npm run test:coverage` | Прогон + отчёт покрытия |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production-сборка Next.js (строгая проверка) |
| `npm run clean:next` | Удалить кеш `.next` (битый HMR / 404 на `/_next/static/...`) |
| `npm run dev:clean` | `clean:next` затем `dev` — первый шаг при «пустой странице» и 404 на `main-app.js`, `layout.css` |

**Диагностика dev (404 на чанки / `layout.css`):** чаще всего устаревшая вкладка после перезапуска dev, **другой порт** (скрипт `scripts/next-dev.cjs` уходит на 3001+, если 3000 занят — в корне появляется `.next-dev-port` с номером) или повреждённый `.next`. Сообщение браузера вроде `[CursorBrowser] Native dialog overrides` идёт от встроенного браузера Cursor, не от приложения. Жёсткое обновление вкладки или `npm run dev:clean`.

### CI
В [.github/workflows/ci.yml](.github/workflows/ci.yml): **`npm ci` → `npm run lint` → `npm run test` → `npm run test:coverage` → `npm run build`**. Любой PR/пуш в `main`/`master` должен проходить эту цепочку.

### Как добавлять тесты
1. Рядом с модулем создай **`имя-модуля.test.ts`** в том же каталоге (или в `src/store/...` для cross-slice).
2. Импорты через алиас **`@/`** — как в приложении.
3. Избегай тестов всего `game-store-composed.ts` целиком; предпочитай **чистые функции** из `src/lib/**` и `src/store/cross-slice/**`.
4. Нестабильный рандом: мокай `Math.random` через `vi.spyOn` (Vitest), как в тестах ремонта.

Отдельная папка **`.agents`** в проекте не используется: для агентов достаточно этого файла (**AGENTS.md**) и при необходимости [.cursorrules](.cursorrules).

## Ключевые ограничения

0. **Материалы и UI:** не используй верхнюю панель `ResourceBar` как ориентир для баланса или описания процессинга; канон — энциклопедия и склад по каталожным id. Подробнее: **docs/LEGACY_UI.md**.
1. НЕ ИЗМЕНЯЙ существующие типы без необходимости — всегда читай src/types/**
2. При изменении slice — проверяй влияние на другие слайсы
3. Константы должны браться из src/lib/store-utils/constants.ts, не хардкодить
4. Используй существующие утилиты из src/lib/store-utils/ вместо дублирования кода
