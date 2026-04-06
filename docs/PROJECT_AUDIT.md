# Технический аудит SwordCraft — актуальные риски

**Последнее обновление:** 2 апреля 2026 — **P0** зелёный; **P2 expand v2:** линейки рецептов в `allRecipes`, [`P2_ARCHITECTURE_INVENTORY.md`](P2_ARCHITECTURE_INVENTORY.md) обновлён; **целевая модель рецептов** (форма + материалы частей, без отдельных рецептов «железный меч» и без тира как свойства строки рецепта) — см. § «Модель рецептов» ниже; Vitest **58** файлов; снимок lint **116** warn / **0** error.

**Исходный полный снимок** (31 марта 2026, все разделы и таблицы) доступен в истории git этого файла до сокращения.

---

## Как вести этот документ

| Подход | Когда уместен |
|--------|----------------|
| **Живой аудит (текущий файл)** | Один документ только с **открытыми** темами + короткий журнал закрытых пунктов. Меньше шума, проще планировать спринты. |
| **Архивный снимок** | Перед крупной зачисткой сохранить копию, например `docs/PROJECT_AUDIT_ARCHIVE_2026-03.md`, или полагаться на git blame / теги. |
| **Полная ретроспектива** | Раз в квартал или перед релизом — пройтись по репозиторию заново и обновить разделы. |

Решённые проблемы **не** дублируются в деталях ниже: они перечислены в журнале. Если нужен старый текст по пункту — смотрите историю коммитов.

---

## Журнал закрытых пунктов (апрель 2026)

| Тема | Результат |
|------|-----------|
| Облачные сейвы | NextAuth + `isSaveAuthEnforced` / клиентское зеркало; строгий Zod и лимиты JSON в [`src/lib/save-payload-schema.ts`](../src/lib/save-payload-schema.ts); `materialKnowledge` в cloud-save и persist; чеклист колонок в [`src/lib/db.ts`](../src/lib/db.ts). **Фича-флаг:** по умолчанию облако **выкл.** — [`NEXT_PUBLIC_CLOUD_SAVE_ENABLED`](../.env.example), логика в [`src/lib/cloud-save-feature.ts`](../src/lib/cloud-save-feature.ts); без `true` — только Zustand persist + локальный бэкап, `/api/save` отвечает `503` + `cloudSaveDisabled`. |
| P1: TypeScript «unused» | В [`tsconfig.json`](../tsconfig.json) включены `noUnusedLocals` / `noUnusedParameters`; `npm run type-check` и **`next build`** проходят при зелёном ESLint. |
| P1: ESLint | Снижены warnings (консоль, хуки, точечные типы); для [`src/store/**/*.ts`](../eslint.config.mjs) `no-unused-vars` → **error** в отдельном блоке flat-config. |
| P1: Vitest coverage | В [`vitest.config.ts`](../vitest.config.ts): `coverage.include` = `src/lib/**/*.ts`, пороги lines/statements/branches/functions; в CI — [`npm run test:coverage`](../.github/workflows/ci.yml). |
| `save_history` при DELETE | Корректное удаление по `gameSaveId`. |
| `package.json` | `name`: `swordcraft-turso-v3`. |
| `materialKnowledge` DDL / Prisma / API | Согласовано в актуальной ветке. |
| `tsconfig` | Исключение `**/*.backup.*`. |
| Store | Экспедиции вынесены в [`src/store/cross-slice/guild-expedition-cross-slice.ts`](../src/store/cross-slice/guild-expedition-cross-slice.ts). |
| Крафт: константы и формулы | [`src/lib/craft/constants.ts`](../src/lib/craft/constants.ts), [`formulas.ts`](../src/lib/craft/formulas.ts) — калькулятор оружия, прогноз, умная сортировка материалов. |
| Тесты и QA-дисциплина | Vitest: **58** файлов `src/**/*.test.ts`, **619** тестов (апр. 2026; +P2 рецепты/store smoke) — крафт, сохранения и Zod, экспедиции (в т.ч. [`src/modules/expeditions/`](../src/modules/expeditions/), модификаторы, `expedition-reward-generator` как контракт), ремонт, заказы, материалы (`src/lib/materials/*`), cross-slice smoke, типы. **CI:** [`npm run test`](../.github/workflows/ci.yml) → `test:coverage` → `build`. **Документация:** «Тесты и проверка качества» в [`AGENTS.md`](../AGENTS.md), скрипты в [`README.md`](../README.md). |
| Кузница UI | ESM-импорт рецептов; лишний `onWeaponCreated` убран. |
| ESLint | Политика error/warn в [`eslint.config.mjs`](../eslint.config.mjs). |
| P1 (апр. 2026): CI + `src/lib` | В [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) после `npm ci` — **`npm run lint`**. Для [`src/lib/**/*.ts`](../eslint.config.mjs): `no-explicit-any`, `no-non-null-assertion`, `import/no-anonymous-default-export` → **error** (включая `*.test.ts` под тем же glob). **2026-04-02:** полный `eslint .` — **116** предупреждений (**0** error); пересчитать после дожимов по доменам. |
| P0 (апр. 2026): блокер lint/build | Устранены **7** ESLint **error**: доска миссий — [`ExpeditionLocationMissionBoard.tsx`](../src/components/guild/expeditions/ExpeditionLocationMissionBoard.tsx) (`useMemo` + `void poolNonce` вместо `setState` в `useEffect`); [`quality-display.ts`](../src/lib/craft/quality-display.ts) — fallback градации без `!`; тесты [`expedition-material-content.test.ts`](../src/lib/materials/expedition-material-content.test.ts), [`phase1b-material-science.test.ts`](../src/lib/materials/phase1b-material-science.test.ts) — сужение типов после `expect`. **`npm run lint`**, **`npm run build`** и цепочка CI снова могут завершаться успехом. |
| P2 (апр. 2026): крафт/сейв/store | Матрица ID рецептов и сейв v2: [`docs/P2_ARCHITECTURE_INVENTORY.md`](P2_ARCHITECTURE_INVENTORY.md) §1.2a; `craftV2Persisted` + нормализация [`save-craft-normalize.ts`](../src/lib/save-craft-normalize.ts). Убран legacy `activeCraft` из [`craft-slice`](../src/store/slices/craft-slice.ts); канон — `craftV2Persisted.activeCraft`. Заказы cross-slice: [`order-cross-slice.ts`](../src/store/cross-slice/order-cross-slice.ts). UI-метаданные качества/типов: [`weapon-display-meta.ts`](../src/lib/craft/weapon-display-meta.ts). Документы: [`04_TYPES_SYSTEM.md`](04_TYPES_SYSTEM.md) (craft vs craft-v2), [`03_STATE_MANAGEMENT.md`](03_STATE_MANAGEMENT.md) (P2-Store-02 спайк). [`examples/README.md`](../examples/README.md) + [`tsconfig.examples.json`](../tsconfig.examples.json). |
| P2 (апр. 2026): каркас крафта/UX | Синхронизирован [`CRAFT_SYSTEM_ROADMAP.md`](systems/CRAFT_SYSTEM_ROADMAP.md) (§5.1 чеклист, §9, бэклог приоритетов A–E). **Инвентарь кузницы:** сетка и карточки — [`inventory-section.tsx`](../src/components/forge/inventory-section.tsx), [`weapon-inventory-card.tsx`](../src/components/forge/weapon-inventory-card.tsx). **Заказы v2:** сопоставление материала заказа с `hiddenTags` через `hiddenTagsSatisfyOrderMaterial` в [`weapon-display-meta.ts`](../src/lib/craft/weapon-display-meta.ts) + slice/UI гильдии. |
| Next.js dev: «Cannot find module './NNN.js'» | Типично при **рассинхроне** артефактов сборки в **`.next/`** (каталог в [`.gitignore`](../.gitignore)): остановить `next dev`, удалить **`.next`** (при необходимости **`node_modules/.cache`**), снова `npm run dev` или `npm run build`. Не коммитить `.next`. Если порт 3000 занят старым процессом — завершить его, иначе возможны 500 и ссылки на отсутствующие чанки. Сообщения Watchpack `EINVAL` на `C:\pagefile.sys` и т.п. на Windows — шум первичного скана, на выдачу страниц обычно не влияют. |
| P2 (апр. 2026): рецепты форм vs заказы | Каталог v2 — только формы; шаблоны NPC — [`weapon-recipes.ts`](../src/data/weapon-recipes.ts) + [`legacy-recipe-rows.ts`](../src/data/recipes/legacy-recipe-rows.ts), `shapeRecipeId`, миграция сейва v5 [`recipe-id-migrate.ts`](../src/lib/recipe-id-migrate.ts). Тесты: [`p2-recipes-integration.test.ts`](../src/data/recipes/p2-recipes-integration.test.ts), [`recipe-id-migrate.test.ts`](../src/lib/recipe-id-migrate.test.ts). Док: [`04_TYPES_SYSTEM.md`](04_TYPES_SYSTEM.md), [`P2_ARCHITECTURE_INVENTORY.md`](P2_ARCHITECTURE_INVENTORY.md). |

---

## Открытые вопросы

### P0 — публичный продакшен

- **Идентичность игрока:** провайдер Credentials «demo» не задаёт реальных уникальных пользователей. Для публичного запуска — OAuth/почта или иной провайдер, уникальный стабильный `user.id`, политика сессий и при необходимости миграция существующих сейвов.

### P1 — техдолг качества кода (остаток)

- **TypeScript:** строгость по unused включена; новые проблемы ловятся на `npm run type-check`.
- **ESLint:** слой **[`src/lib/**/*.ts`](../eslint.config.mjs)** — **error** на `any`, non-null assertion и anonymous default export; остальной `src/**` — преимущественно **warn** (в т.ч. `any`/`!` в store, components, hooks, data, `src/modules/**`). **Снимок 2026-04-02:** полный `eslint .` — **116** предупреждений (**0** error). **CI** гоняет [`npm run lint`](../.github/workflows/ci.yml); `--max-warnings 0` не включён. Дальнейшие домены — по плану (например дожим `src/app/api/**`).
- **Покрытие:** пороги на узком `src/lib/**` (lines **34** / statements **33** / branches **18** / functions **29** — см. [`vitest.config.ts`](../vitest.config.ts)); при расширении `coverage.include` или заметном изменении состава lib — пересмотреть проценты.

### P2 — архитектура

Детальная инвентаризация файлов и нумерованный бэклог задач: [`docs/P2_ARCHITECTURE_INVENTORY.md`](P2_ARCHITECTURE_INVENTORY.md) (в т.ч. чеклист **P2-CraftRm-*** по фазам [`CRAFT_SYSTEM_ROADMAP.md`](systems/CRAFT_SYSTEM_ROADMAP.md) §5.1).

**Дорожная карта крафта (материалы, экспертиза, техники):** [`docs/systems/CRAFT_SYSTEM_ROADMAP.md`](systems/CRAFT_SYSTEM_ROADMAP.md) — фазы A–E, **B1/B2**, **§6** (Q&A: туториал и стартовые материалы, слоты/рабочие/риск изучения, совместимость техник, попап экспертизы, контракт глобального чата), реестр техник и UI цепочек «сырьё → обработка → часть».

#### Модель рецептов — цель продукта vs текущий код (2026-04)

**Как должно быть (канон дизайна, к которому ведёт переработка):**

- В каталоге рецептов **нет** отдельных сущностей вроде «железный меч» / `iron_sword` как формы оружия. Есть **рецепт формы**: например, **меч** — набор частей (лезвие, гарда, рукоять, …) и этапов крафта v2.
- **Материал готового оружия** (железный, бронзовый и т.д.) определяется **выбором материалов по частям** в планировщике/крафте, в первую очередь **атакующей части** (для меча — лезвие / `combatPart`): игрок задаёт, из чего куётся лезвие — из этого следует «железность» и производные характеристики.
- **Тир не является свойством строки рецепта** в смысле базы данных форм: рецепт — **база** для крафта без дублирования одной формы под `common` / `rare` / линейки металлов. Всё, что сейчас воспринимается как прогрессия по тиру или по «линейке железа/бронзы», должно либо выводиться из **качества, материалов частей и последующих систем** (заказы, награды, баланс), либо жить в отдельном слое поверх одной формы — но **не** как множество почти одинаковых рецептов одной и той же формы.

**Состояние кода после переработки P2 (2026-04):**

- [`allRecipes`](../src/data/recipes/index.ts) — **только формы** (в т.ч. `basic_mace` / `basic_spear` / `basic_hammer` из [`extra-melee-forms.ts`](../src/data/recipes/extra-melee-forms.ts)); строк `iron_sword` в каталоге v2 **нет**.
- Шаблоны заказов (`iron_*`, `bronze_*`, …) остаются в [`legacy-recipe-rows.ts`](../src/data/recipes/legacy-recipe-rows.ts) и в [`weapon-recipes.ts`](../src/data/weapon-recipes.ts) с полем **`shapeRecipeId`**; тир/материал заказа — свойства **строки шаблона**, не рецепта формы.
- Миграция старых сейвов: **`STORE_VERSION` 5** — [`recipe-id-migrate.ts`](../src/lib/recipe-id-migrate.ts). Дальше — упростить дубли в [`recipe-shop`](../src/data/recipe-shop.ts), усилить сопоставление заказ ↔ скрафченное оружие по `hiddenTags` / `combatMaterialId`.

- **Крафт v1 / v2:** активный крафт — **только** `craftV2Persisted` / `ActiveCraftV2`; [`weapon-recipes.ts`](../src/data/weapon-recipes.ts) — заказы/UI + расчёты атаки по типу/тир/материалу; детали в инвентаризации §1.2a.
- **Composed store:** [`game-store-composed.ts`](../src/store/game-store-composed.ts) по-прежнему монолитный (**~1150** строк, апр. 2026); заказы в cross-slice; **P2-Store-03:** дымовой [`game-store-smoke.test.ts`](../src/store/game-store-smoke.test.ts). Дальше — refining и сужение `as any` / `as never`.
- **Модуль экспедиций:** доменные данные и утилиты частично живут в [`src/modules/expeditions/`](../src/modules/expeditions/) (миссии, локации, события, тесты) — учитывать при рефакторингах store/UI.
- **Корень репозитория:** `data/`, `lib/`, `types/` вне `src/` ([`eslint.config.mjs`](../eslint.config.mjs) их игнорирует; в `tsconfig` — exclude) — фрагменты вроде [`data/knowledge-discoveries.ts`](../data/knowledge-discoveries.ts), [`lib/loot-integration.ts`](../lib/loot-integration.ts), [`types/expedition-loot.types.ts`](../types/expedition-loot.types.ts); консолидация с `src/` после проверки импортов.
- **Материалы:** массовая унификация каталога — см. [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md), [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md); утилита **`npm run materials:phase0`** ([`package.json`](../package.json)) — генерация фазы 0.
- **Каталог [`examples/`](../examples/):** скрипты и фрагменты **вне** `src/`; политика «не часть продукта» — [`examples/README.md`](../examples/README.md); опциональная проверка типов — [`tsconfig.examples.json`](../tsconfig.examples.json). Риск расхождения с API игры при копировании оттуда кода остаётся — править импорты вручную.

### P3 — тесты и незавершённые системы

- **E2E / интеграция:** unit-покрытие расширено, но нет цепочки «UI крафт → сохранение» (Playwright или интеграционный тест `POST` [`api/save`](../src/app/api/save/route.ts) с моком БД и **`NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true`** в тестовом окружении). По желанию — после стабилизации контракта сейва.
- **Заглушки:** [`expedition-reward-generator.ts`](../src/lib/expedition-reward-generator.ts) по-прежнему возвращает пустые награды; TODO в expedition-калькуляторе; корневой/документный `loot-integration` — учитывать в QA или доработать.
- **`calculateWarSoulReward`:** использует `Math.random` для вариации; в юнит-тестах рандом мокается — при добавлении новых веток проверять детерминизм тестов.

### Два канала БД

- **Prisma** (`file:./dev.db`) — локально, утилиты и codegen. **Прод:** Turso + DDL/ALTER в [`src/lib/db.ts`](../src/lib/db.ts). При новых колонках `game_saves` следовать чеклисту в шапке `db.ts`.

---

## Резюме

**TypeScript** (`type-check`), **Vitest** (59 файлов / 621 тест), **`npm run lint`** (ориентир **116** warn / **0** error) и **`next build`** — в зелёной зоне. **CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)): `lint` → `test` → `test:coverage` → `build`. Облачные сейвы **опциональны** ([`NEXT_PUBLIC_CLOUD_SAVE_ENABLED`](../.env.example), [`cloud-save-feature.ts`](../src/lib/cloud-save-feature.ts)).

Главные **незакрытые** направления: идентичность для публичного продакшена, уменьшение монолитности store и **P2-Save-01** / refining, **дожим рецептов** (магазин без дублей `recipeId`, баланс заказов), **развитие крафта по фазам** [`CRAFT_SYSTEM_ROADMAP.md`](systems/CRAFT_SYSTEM_ROADMAP.md) (стадии материалов, экспертиза, техники), **E2E и награды экспедиций**, консолидация **корневых дубликатов** (см. таблицу в инвентаризации) и **материалы** по аудиту; **дожим ESLint warn** — по доменам.
