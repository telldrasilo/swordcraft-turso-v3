# Технический аудит SwordCraft — актуальные риски

**Последнее обновление:** 1 апреля 2026  

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
| Облачные сейвы | NextAuth + `isSaveAuthEnforced` / клиентское зеркало; строгий Zod и лимиты JSON в [`src/lib/save-payload-schema.ts`](../src/lib/save-payload-schema.ts); `materialKnowledge` в cloud-save и persist; чеклист колонок в [`src/lib/db.ts`](../src/lib/db.ts). |
| `save_history` при DELETE | Корректное удаление по `gameSaveId`. |
| `package.json` | `name`: `swordcraft-turso-v3`. |
| `materialKnowledge` DDL / Prisma / API | Согласовано в актуальной ветке. |
| `tsconfig` | Исключение `**/*.backup.*`. |
| Store | Экспедиции вынесены в [`src/store/cross-slice/guild-expedition-cross-slice.ts`](../src/store/cross-slice/guild-expedition-cross-slice.ts). |
| Крафт: константы и формулы | [`src/lib/craft/constants.ts`](../src/lib/craft/constants.ts), [`formulas.ts`](../src/lib/craft/formulas.ts) — калькулятор оружия, прогноз, умная сортировка материалов. |
| Тесты | Vitest: save payload, craft calculator/formulas, [`expedition-calculator-v2.test.ts`](../src/lib/expedition-calculator-v2.test.ts) и др. |
| Кузница UI | ESM-импорт рецептов; лишний `onWeaponCreated` убран. |
| ESLint | Политика error/warn в [`eslint.config.mjs`](../eslint.config.mjs). |

---

## Открытые вопросы

### P0 — публичный продакшен

- **Идентичность игрока:** провайдер Credentials «demo» не задаёт реальных уникальных пользователей. Для публичного запуска — OAuth/почта или иной провайдер, уникальный стабильный `user.id`, политика сессий и при необходимости миграция существующих сейвов.

### P1 — техдолг качества кода

- **TypeScript:** `noUnusedLocals` / `noUnusedParameters` по-прежнему выключены.
- **ESLint:** много предупреждений (`no-explicit-any`, `no-console`, `no-unused-vars`, `exhaustive-deps` и т.д.). Критерий CI — **`npm run build`**; снижать warnings модулями.

### P2 — архитектура

- **Крафт v1 / v2:** в `craft-slice` остаётся legacy `ActiveCraft`; [`weapon-recipes.ts`](../src/data/weapon-recipes.ts) и часть заказов/UI завязаны на legacy-типы при том что UI кузницы — v2 ([`@/data/recipes`](../src/data/recipes/index.ts)). Цель — одна линия данных и типов (исторический детальный план миграции — в git к старой версии аудита, §10.5).
- **Composed store:** [`game-store-composed.ts`](../src/store/game-store-composed.ts) всё ещё крупный; дальнейший вынос cross-slice (заказы, refining, …), сужение `as any` / `as never`.
- **Корень репозитория:** каталоги `data/`, `lib/`, `types/` вне `src/` — дубликаты и черновики, не входят в сборку приложения; консолидация после проверки импортов.

### P3 — тесты и незавершённые системы

- Unit-тесты для [`expedition-calculator-v2.ts`](../src/lib/expedition-calculator-v2.ts) — см. [`expedition-calculator-v2.test.ts`](../src/lib/expedition-calculator-v2.test.ts); позже e2e (крафт → сохранение).
- **Заглушки:** [`expedition-reward-generator.ts`](../src/lib/expedition-reward-generator.ts), TODO в expedition-калькуляторе, документный/корневой `loot-integration` — явно учитывать в QA или доработать.

### Два канала БД

- **Prisma** (`file:./dev.db`) — локально, утилиты и codegen. **Прод:** Turso + DDL/ALTER в [`src/lib/db.ts`](../src/lib/db.ts). При новых колонках `game_saves` следовать чеклисту в шапке `db.ts`.

---

## Резюме

Проект собирается с обязательными TypeScript и ESLint по `src/`. Главные **незакрытые** направления: усиление облачной идентичности для продакшена, **слияние модели крафта** в одну линию, уменьшение монолитности store и рост покрытия тестами. Остальное — управляемый техдолг.
