# Технический аудит SwordCraft — актуальные риски

**Последнее обновление:** апрель 2026 (P1 lint/`src/lib`, P2 архитектура по [`P2_ARCHITECTURE_INVENTORY.md`](P2_ARCHITECTURE_INVENTORY.md), стабильность локального Next dev)

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
| P1: TypeScript «unused» | В [`tsconfig.json`](../tsconfig.json) включены `noUnusedLocals` / `noUnusedParameters`; проект проходит `type-check` / `build`. |
| P1: ESLint | Снижены warnings (консоль, хуки, точечные типы); для [`src/store/**/*.ts`](../eslint.config.mjs) `no-unused-vars` → **error** в отдельном блоке flat-config. |
| P1: Vitest coverage | В [`vitest.config.ts`](../vitest.config.ts): `coverage.include` = `src/lib/**/*.ts`, пороги lines/statements/branches/functions; в CI — [`npm run test:coverage`](../.github/workflows/ci.yml). |
| `save_history` при DELETE | Корректное удаление по `gameSaveId`. |
| `package.json` | `name`: `swordcraft-turso-v3`. |
| `materialKnowledge` DDL / Prisma / API | Согласовано в актуальной ветке. |
| `tsconfig` | Исключение `**/*.backup.*`. |
| Store | Экспедиции вынесены в [`src/store/cross-slice/guild-expedition-cross-slice.ts`](../src/store/cross-slice/guild-expedition-cross-slice.ts). |
| Крафт: константы и формулы | [`src/lib/craft/constants.ts`](../src/lib/craft/constants.ts), [`formulas.ts`](../src/lib/craft/formulas.ts) — калькулятор оружия, прогноз, умная сортировка материалов. |
| Тесты и QA-дисциплина | Vitest: **22+** файлов `src/**/*.test.ts` — крафт (`calculator`, `formulas`, `inventory-check`, `forecast-calculator`, `material-sorting`), сохранения (расширенные негативные кейсы для Zod + глубина JSON, `save-craft-normalize`), экспедиции (`expedition-calculator-v2`, реестр модификаторов, контрактная заглушка `expedition-reward-generator`), ремонт (`executeRepair`, `getMaterialDeductions`), заказы (`order-utils`, `order-achievable-utils`), `war-soul-utils`, `craft-utils` / `player-utils` / `worker-utils`, smoke-тесты [`repair-cross-slice`](../src/store/cross-slice/repair-cross-slice.test.ts) / [`guild-expedition-cross-slice`](../src/store/cross-slice/guild-expedition-cross-slice.test.ts) / [`order-cross-slice`](../src/store/cross-slice/order-cross-slice.test.ts), [`quality`](../src/types/shared/quality.test.ts). **CI:** [`npm run test`](../.github/workflows/ci.yml) перед `npm run build`. **Документация:** раздел «Тесты и проверка качества» в [`AGENTS.md`](../AGENTS.md), скрипты в корневом [`README.md`](../README.md), ссылка из [`docs/README.md`](README.md). |
| Кузница UI | ESM-импорт рецептов; лишний `onWeaponCreated` убран. |
| ESLint | Политика error/warn в [`eslint.config.mjs`](../eslint.config.mjs). |
| P1 (апр. 2026): CI + `src/lib` | В [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) после `npm ci` — **`npm run lint`** (без `--max-warnings 0`). Для [`src/lib/**/*.ts`](../eslint.config.mjs): `no-explicit-any`, `no-non-null-assertion`, `import/no-anonymous-default-export` → **error**; предупреждения по проекту сокращены (ориентир: ~103 → **~51** warn вне `src/lib`). |
| P2 (апр. 2026): крафт/сейв/store | Матрица ID рецептов и сейв v2: [`docs/P2_ARCHITECTURE_INVENTORY.md`](P2_ARCHITECTURE_INVENTORY.md) §1.2a; `craftV2Persisted` + нормализация [`save-craft-normalize.ts`](../src/lib/save-craft-normalize.ts). Убран legacy `activeCraft` из [`craft-slice`](../src/store/slices/craft-slice.ts); канон — `craftV2Persisted.activeCraft`. Заказы cross-slice: [`order-cross-slice.ts`](../src/store/cross-slice/order-cross-slice.ts). UI-метаданные качества/типов: [`weapon-display-meta.ts`](../src/lib/craft/weapon-display-meta.ts). Документы: [`04_TYPES_SYSTEM.md`](04_TYPES_SYSTEM.md) (craft vs craft-v2), [`03_STATE_MANAGEMENT.md`](03_STATE_MANAGEMENT.md) (P2-Store-02 спайк). [`examples/README.md`](../examples/README.md) + [`tsconfig.examples.json`](../tsconfig.examples.json). |
| Next.js dev: «Cannot find module './NNN.js'» | Типично при **рассинхроне** артефактов сборки в **`.next/`** (каталог в [`.gitignore`](../.gitignore)): остановить `next dev`, удалить **`.next`** (при необходимости **`node_modules/.cache`**), снова `npm run dev` или `npm run build`. Не коммитить `.next`. Если порт 3000 занят старым процессом — завершить его, иначе возможны 500 и ссылки на отсутствующие чанки. Сообщения Watchpack `EINVAL` на `C:\pagefile.sys` и т.п. на Windows — шум первичного скана, на выдачу страниц обычно не влияют. |

---

## Открытые вопросы

### P0 — публичный продакшен

- **Идентичность игрока:** провайдер Credentials «demo» не задаёт реальных уникальных пользователей. Для публичного запуска — OAuth/почта или иной провайдер, уникальный стабильный `user.id`, политика сессий и при необходимости миграция существующих сейвов.

### P1 — техдолг качества кода (остаток)

- **TypeScript:** строгость по unused включена; новые проблемы ловятся на `npm run type-check` / `build`.
- **ESLint:** слой **[`src/lib/**/*.ts`](../eslint.config.mjs)** закреплён правилами **error** для `any`, non-null assertion и anonymous default export; остальной `src/**` — прежний пласт **warn** (components, store, hooks, data, types). **CI** явно гоняет [`npm run lint`](../.github/workflows/ci.yml); `--max-warnings 0` не включён — следующий шаг после дожима warn. Дальнейшие домены — по плану (например `src/app/api/**`).
- **Покрытие:** пороги на узком `src/lib/**`; при расширении `coverage.include` или заметном изменении состава lib — пересмотреть проценты в [`vitest.config.ts`](../vitest.config.ts) (в конфиге есть напоминание).

### P2 — архитектура

Детальная инвентаризация файлов и нумерованный бэклог задач: [`docs/P2_ARCHITECTURE_INVENTORY.md`](P2_ARCHITECTURE_INVENTORY.md).

- **Крафт v1 / v2:** активный крафт — **только** `craftV2Persisted` / `ActiveCraftV2`; legacy [`weapon-recipes.ts`](../src/data/weapon-recipes.ts) остаётся для заказов (iron_* и т.д.) и адаптера стоимости, пока в v2 нет полного набора id (см. инвентаризация §1.2a).
- **Composed store:** [`game-store-composed.ts`](../src/store/game-store-composed.ts) всё ещё крупный; заказы вынесены в cross-slice, дальше — refining и сужение `as any` / `as never`. **Тесты:** cross-slice — точечные моки + [`order-cross-slice.test.ts`](../src/store/cross-slice/order-cross-slice.test.ts); полного сценария «полный стор → действие → состояние» нет (P3 / P2-Store-03).
- **Корень репозитория:** каталоги `data/`, `lib/`, `types/` вне `src/` — дубликаты и черновики, не входят в сборку приложения; консолидация после проверки импортов.
- **Каталог [`examples/`](../examples/):** скрипты и фрагменты **вне** `src/`; политика «не часть продукта» — [`examples/README.md`](../examples/README.md); опциональная проверка типов — [`tsconfig.examples.json`](../tsconfig.examples.json). Риск расхождения с API игры при копировании оттуда кода остаётся — править импорты вручную.

### P3 — тесты и незавершённые системы

- **E2E / интеграция:** unit-покрытие расширено, но нет цепочки «UI крафт → сохранение» (Playwright или интеграционный тест `POST` [`api/save`](../src/app/api/save/route.ts) с моком БД и **`NEXT_PUBLIC_CLOUD_SAVE_ENABLED=true`** в тестовом окружении). По желанию — после стабилизации контракта сейва.
- **Заглушки:** [`expedition-reward-generator.ts`](../src/lib/expedition-reward-generator.ts) по-прежнему возвращает пустые награды; TODO в expedition-калькуляторе; корневой/документный `loot-integration` — учитывать в QA или доработать.
- **`calculateWarSoulReward`:** использует `Math.random` для вариации; в юнит-тестах рандом мокается — при добавлении новых веток проверять детерминизм тестов.

### Два канала БД

- **Prisma** (`file:./dev.db`) — локально, утилиты и codegen. **Прод:** Turso + DDL/ALTER в [`src/lib/db.ts`](../src/lib/db.ts). При новых колонках `game_saves` следовать чеклисту в шапке `db.ts`.

---

## Резюме

Проект собирается с обязательными TypeScript и ESLint по `src/`; **CI прогоняет `lint`, unit-тесты, `test:coverage` (пороги на `src/lib`) и сборку**. Облачные сейвы **опциональны** (переменная окружения). Документированы команды и соглашения в **AGENTS.md** / README / [`cloud-save-feature.ts`](../src/lib/cloud-save-feature.ts).

Главные **незакрытые** направления: идентичность для публичного продакшена, **сближение линии рецептов** v1/v2 (заказы vs `allRecipes`), уменьшение монолитности store, **E2E и награды экспедиций**, консолидация **корневых дубликатов** данных (`data/`, `lib/`, `types/` вне `src/`). Остальное — управляемый техдолг.
