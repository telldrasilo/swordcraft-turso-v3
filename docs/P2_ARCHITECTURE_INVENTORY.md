# P2 — инвентаризация и бэклог задач (архитектура)

**Статус:** справочный документ для планирования; не подменяет [PROJECT_AUDIT.md](PROJECT_AUDIT.md).  
**Связь с аудитом:** раздел «P2 — архитектура» в [PROJECT_AUDIT.md](PROJECT_AUDIT.md).

**Стратегия рецептов (2026-04, обновлено):** **allRecipes** — только **формы** (`basic_sword`, `long_sword`, `basic_mace`, …). Шаблоны заказов `iron_sword`, `bronze_axe`, … живут в [legacy-recipe-rows.ts](../src/data/recipes/legacy-recipe-rows.ts) и в массиве [weapon-recipes.ts](../src/data/weapon-recipes.ts) (`shapeRecipeId` → id формы v2). Миграция сейва: `STORE_VERSION` 5, [recipe-id-migrate.ts](../src/lib/recipe-id-migrate.ts).

---

## 1. Крафт v1 / v2

### 1.1 Два источника рецептов

| Источник | Файл | Тип рецепта | Потребители (ориентир) |
|----------|------|-------------|-------------------------|
| **V2** | [src/data/recipes/index.ts](../src/data/recipes/index.ts) | `WeaponRecipe` из `@/types/craft-v2` | `use-craft-v2`, `craft-planner`, `craft-container`, `forge-screen`, `process-generator`, калькуляторы/тесты в `src/lib/craft/` |
| **Шаблоны заказов (легаси-строка + shapeRecipeId)** | [src/data/weapon-recipes.ts](../src/data/weapon-recipes.ts) | тип `WeaponRecipe` (другое имя, чем v2): `weaponRecipes[]` из [legacy-recipe-rows.ts](../src/data/recipes/legacy-recipe-rows.ts); метаданные отображения — [`weapon-display-meta`](../src/lib/craft/weapon-display-meta.ts) | заказы, часть UI, ремонт/стоимости |

### 1.2 Файлы с импортом `@/data/weapon-recipes` (уникальный список)

- [src/components/altar/enchanted-weapons-section.tsx](../src/components/altar/enchanted-weapons-section.tsx) — `qualityGrades`
- [src/components/altar/sacrifice-weapon-card.tsx](../src/components/altar/sacrifice-weapon-card.tsx) — `qualityGrades`, `weaponTypeStats`, `getQualityGrade`, `QualityGrade`
- [src/components/dungeons/weapon-select-modal.tsx](../src/components/dungeons/weapon-select-modal.tsx)
- [src/components/dungeons/weapons-history-section.tsx](../src/components/dungeons/weapons-history-section.tsx)
- [src/components/forge/weapon-inventory-card.tsx](../src/components/forge/weapon-inventory-card.tsx) — `weaponTypeStats`
- [src/components/ui/adventurer-card.tsx](../src/components/ui/adventurer-card.tsx) — `WeaponType`
- [src/components/ui/repair-card.tsx](../src/components/ui/repair-card.tsx) — `qualityGrades`, `QualityGrade`
- [src/components/ui/weapon-card.tsx](../src/components/ui/weapon-card.tsx) — `CraftedWeaponV2`; tier/material fallback через `weaponRecipes`; отображение — [`weapon-display-meta`](../src/lib/craft/weapon-display-meta.ts)
- [src/data/repair-system.ts](../src/data/repair-system.ts) — `CraftingCost`, `WeaponTier`
- [src/hooks/use-modifier-calculator.ts](../src/hooks/use-modifier-calculator.ts) — `CraftedWeapon` (legacy)
- [src/lib/adventurer-generator.ts](../src/lib/adventurer-generator.ts) — `WeaponType`
- [src/lib/craft/inventory-check.ts](../src/lib/craft/inventory-check.ts) — алиас `LegacyWeaponRecipe`
- [src/lib/guild-utils.ts](../src/lib/guild-utils.ts) — `CraftedWeapon`
- [src/lib/store-utils/order-achievable-utils.ts](../src/lib/store-utils/order-achievable-utils.ts) — `WeaponRecipe`, `weaponRecipes`
- [src/lib/store-utils/order-utils.ts](../src/lib/store-utils/order-utils.ts) — тип `WeaponRecipe`
- [src/lib/store-utils/repair-utils.ts](../src/lib/store-utils/repair-utils.ts) — `CraftingCost`
- Тесты: [src/lib/store-utils/order-utils.test.ts](../src/lib/store-utils/order-utils.test.ts), [src/lib/store-utils/order-achievable-utils.test.ts](../src/lib/store-utils/order-achievable-utils.test.ts), [src/lib/craft/inventory-check.test.ts](../src/lib/craft/inventory-check.test.ts)

### 1.2a P2-Craft-01 — матрица ID (формы v2 vs шаблоны заказов, 2026-04)

| ID | [initialUnlockedRecipes](../src/store/slices/craft-slice.ts) | [weaponRecipes](../src/data/weapon-recipes.ts) | [allRecipes / getRecipeById](../src/data/recipes/index.ts) | Заметка |
|----|:---:|:---:|:---:|---|
| `basic_sword` … `basic_hammer` (6 форм) | ✅ | `shapeRecipeId` у шаблонов | ✅ | Стартовые формы; заказы требуют ту же форму + материал из строки |
| `iron_*`, `bronze_*`, `steel_*`, … | ❌ | ✅ (`id` строки заказа) | ❌ | Только стоимость/NPC; не существуют в `getRecipeById` |
| `long_sword`, `battle_axe` | ❌ (магазин / прогресс) | при необходимости — тот же `shapeRecipeId` | ✅ | Доп. формы |

**Вывод:** `getRecipeById` — **только** формы; строки заказов не дублируют v2-рецепты в каталоге.

---

### 1.3 Два контура «активного крафта» и персистентность

| Модель | Где определена | Где в состоянии / сейве |
|--------|----------------|-------------------------|
| ~~`activeCraft` в slice~~ (удалено P2-Craft-04) | — | Legacy прогресс v1 не хранится в Zustand; `initialActiveCraft` остаётся в [craft-slice.ts](../src/store/slices/craft-slice.ts) для парсинга старых сейвов ([save-craft-normalize](../src/lib/save-craft-normalize.ts)). |
| `ActiveCraftV2` | [src/types/craft-v2.ts](../src/types/craft-v2.ts) | [craftV2Persisted.activeCraft](../src/store/game-store-composed.ts), [use-craft-v2.ts](../src/hooks/use-craft-v2.ts), сейв/API |
| Дублирующее имя | [src/types/craft.ts](../src/types/craft.ts) — `ActiveCraft` | Документальный / legacy тип; не дублирует поле в store |

Колонка/поле `activeCraft` в JSON сейва — **только** `ActiveCraftV2 | null` (нормализация в save-route и cloud-save). Селектор [`selectActiveCraft`](../src/store/selectors/index.ts) читает `craftV2Persisted.activeCraft`.

Экспорт из [src/store/index.ts](../src/store/index.ts): тип `ActiveCraft` и константа `initialActiveCraft` (реэкспорт из slice/`game-store-composed` по мере необходимости); **`CraftedWeapon` из `craft.ts`** — см. [04_TYPES_SYSTEM.md](04_TYPES_SYSTEM.md) P2-Craft-05.

---

## 2. Composed store

- **Файл:** [src/store/game-store-composed.ts](../src/store/game-store-composed.ts) — **~1150 строк** (апр. 2026).
- **Уже вынесено в cross-slice:** [repair-cross-slice.ts](../src/store/cross-slice/repair-cross-slice.ts), [guild-expedition-cross-slice.ts](../src/store/cross-slice/guild-expedition-cross-slice.ts), [order-cross-slice.ts](../src/store/cross-slice/order-cross-slice.ts) (завершение заказа, аванс, истечение).
- **Жёсткие приведения типов в composed (точки для последующей типизации):** `set as any` / `get as any` при создании slices (~298–317), `set as never` / `get as never` для cross-slice (~545–546), фрагменты с `as any` при сбросе/мердже состояния (~960, 1022, 1067).

Кандидаты на следующие выносы: ~~заказы~~ (сделано — `order-cross-slice`), **refining/крафт** целиком, крупные куски **guild** вне экспедиций — см. нижнюю половину `game-store-composed.ts`.

---

## 3. Корень репозитория вне `src/`

Путь `@/*` в TypeScript смотрит только в `./src/*` ([tsconfig.json](../tsconfig.json)). Следующие артефакты **не** являются частью приложения по алиасу, но занимают место и дублируют темы:

| Путь | Заметка |
|------|---------|
| [data/knowledge-discoveries.ts](../data/knowledge-discoveries.ts) | Крупный файл; параллели с `docs/Random_gen/data`. Импорт `../types/expedition-loot.types` — **корневой** [`types/expedition-loot.types.ts`](../types/expedition-loot.types.ts). В **app** через `@/` не подключается. |
| [types/expedition-loot.types.ts](../types/expedition-loot.types.ts) | Параллельная схема лута; канон игры — `src/types` + калькулятор v2. |
| [lib/loot-integration.ts](../lib/loot-integration.ts) | Корневая заготовка; не в `src/`. |
| [docs/Random_gen/](../docs/Random_gen/) | Черновики; самодостаточные относительные импорты внутри каталога. |

**P2-Repo-01 (инвентаризация импортов, 2026-04):** ниже — кто тянет корень **вне `src/`** (не через `@/`).

| Путь | Кто импортирует (вне `src/`) |
|------|------------------------------|
| [data/knowledge-discoveries.ts](../data/knowledge-discoveries.ts) | сам файл тянет [types/expedition-loot.types.ts](../types/expedition-loot.types.ts) |
| [types/expedition-loot.types.ts](../types/expedition-loot.types.ts) | [data/knowledge-discoveries.ts](../data/knowledge-discoveries.ts), [lib/loot-integration.ts](../lib/loot-integration.ts), [examples/loot-usage.ts](../examples/loot-usage.ts), дерево [docs/Random_gen/](../docs/Random_gen/), [src/backup/unused-root-files/](../src/backup/unused-root-files/) |
| [lib/loot-integration.ts](../lib/loot-integration.ts) | только типы из корневого `types/` |

**Итог:** в **runtime приложения** (`src/app`, `src/components`, …) импортов на эти корневые пути **нет**; живая игра — `src/types` + калькуляторы. Консолидация — по мере подключения лута или удаление бэкапов/`examples`.

**P2-Repo-01 (цель):** приложение не должно импортировать эти пути как `@/`; перенос в `src/` при подключении лута к рантайму или удаление дубликатов после миграции.

---

## 4. Каталог `examples/`

| Файл | Назначение |
|------|------------|
| [examples/loot-usage.ts](../examples/loot-usage.ts) | Пример использования лута |
| [examples/websocket/server.ts](../examples/websocket/server.ts), [examples/websocket/frontend.tsx](../examples/websocket/frontend.tsx) | Демо WebSocket |

Не входят в `npm run test` и production build — риск расхождения с контрактами игры.

---

## 5. Бэклог задач (приоритет не зафиксирован)

Идентификаторы для трекинга; порядок выполнения — по договорённости команды.

### Крафт и типы

- **План развития крафта (материалы, экспертиза, техники):** [CRAFT_SYSTEM_ROADMAP.md](systems/CRAFT_SYSTEM_ROADMAP.md) — фазы **A–E**, порядок внедрения и промежуточное видение — **§5.1**.

#### Чеклист CRAFT_SYSTEM_ROADMAP (идентификаторы для трекинга)

Рекомендуемая цепочка: **A → B1 → B2 → C → D → E** (подробности — в roadmap §5.1). Статусы в таблице не ведутся в этом файле; галочки — в Issue/PR или у команды.

| ID | Ссылка на roadmap | Итог / критерий (кратко) |
|----|-------------------|---------------------------|
| **P2-CraftRm-A** | Фаза A | Селектор части: только каноничные `materialId` нужной **стадии**; сырьё не как финал части (см. §6.10). |
| **P2-CraftRm-B1** | Фаза B1 | Ворота экспертизы; энциклопедия «Изучить»; туториал → 10% на набор §6.1; слоты/рабочие/риск/сообщения; заготовка событий под чат §6.8. |
| **P2-CraftRm-B2** | Фаза B2 | Экспертиза от крафта + DR; вехи 80/100; попап при заборе §6.5; переключатель списка §6.2; ролевые правила материалов. |
| **P2-CraftRm-C** | Фаза C | MVP цепочки техники (руда→слиток **или** слиток со склада §6.6); `CraftPlan` + cost; **без E** — только логистика расхода, без этапов техник в UI процесса. |
| **P2-CraftRm-D** | Фаза D | Реестр техник, разблокировки; **валидатор совместимости** §6.4 п. 10. |
| **P2-CraftRm-E** | Фаза E | Этапы техник в «Крафт в процессе» + время; `outcomeModifiers` и слияние с прогнозом §6.12. |
| **P2-CraftRm-X** | Вне A–E | Отложено: полный UI глобального чата §6.8; кожа `raw_leather` в рецептах частей §6.1; доработка заказов §6.7. |

Связь с облаком и сейвом при очереди изучения / расширении плана — **P2-Save-01** + чеклист [`cloud-save-feature`](../src/lib/cloud-save-feature.ts).

- **P2-Craft-01** — **обновлено 2026-04:** формы только в `allRecipes`; шаблоны заказов — `weaponRecipes` + §1.2a; дальше — баланс/уникальные `recipeId` в [`recipe-shop.ts`](../src/data/recipe-shop.ts).
- **P2-Craft-02** — Заказы: строки `iron_*` / материал в шаблоне; крафт — `shapeRecipeId` + план v2 (см. [`order-achievable-utils.ts`](../src/lib/store-utils/order-achievable-utils.ts)).
- **P2-Craft-03** — **`qualityGrades` / weaponTypeStats** — см. [weapon-display-meta.ts](../src/lib/craft/weapon-display-meta.ts); дальше — убрать лишние импорты `weapon-recipes` в UI, где нужны только метаданные.
- **P2-Craft-04** — Упростить модель **активного крафта**: единый источник правды (`ActiveCraftV2` + slice/cleanup legacy `ActiveCraft` в persist и API save).
- **P2-Craft-05** — Зафиксировать в [docs/04_TYPES_SYSTEM.md](04_TYPES_SYSTEM.md) статус [src/types/craft.ts](../src/types/craft.ts) vs [craft-v2.ts](../src/types/craft-v2.ts) (deprecated / зона только orders / и т.д.).
- **P2-Craft-06** — [weapon-card.tsx](../src/components/ui/weapon-card.tsx): тип `WeaponCardWeapon` (legacy + v2 поля) — свести к `CraftedWeaponV2` + узкие расширения для UI.

### Store и архитектура

- **P2-Store-01** — ~~Вынести координацию заказов~~ **сделано:** [order-cross-slice.ts](../src/store/cross-slice/order-cross-slice.ts); остаточная склейка в composed.
- **P2-Store-02** — Исследование: типизированная сборка Zustand-слайсов без `set as any` / `get as any` (может потребовать общий тип `GameStore` до объявления slices).
- **P2-Store-03** — Точечный smoke/integration: «инициализация store → одно cross-slice действие → инварианты» (можно позже связать с P3 E2E).

### Репозиторий и примеры

- **P2-Repo-01** — Инвентаризация импортов на `data/`, `types/` в корне и `docs/Random_gen`; план удаления или переноса в `src/`.
- **P2-Repo-02** — Политика для [examples/](../examples/): README «черновик / не поддерживается» или лёгкая проверка типов в отдельном tsconfig.

### Персистентность и сейв

- **P2-Save-01** — Согласовать схему `activeCraft` в [save-payload-schema.ts](../src/lib/save-payload-schema.ts), [api/save/route.ts](../src/app/api/save/route.ts) и клиентском зеркале [use-cloud-save.ts](../src/hooks/use-cloud-save.ts) с финальной моделью v2. (**2026-04:** расширение каталога id рецептов в `unlockedRecipes` **без** смены формы полей Zod не потребовало правок.)

---

## 6. Следующий шаг

1. Дальше по бэклогу: **P2-Save-01** (финальная схема сейва), **P2-Store-02**, вынос refining; рецепты — см. §1.2a и тесты интеграции.  
2. По системе материалов/экспертизы/техник — последовательность **P2-CraftRm-A** … **E** (таблица выше); **P2-CraftRm-X** не блокирует эту цепочку.
3. После выполнения крупного шага — строка в журнал [PROJECT_AUDIT.md](PROJECT_AUDIT.md) и при необходимости обновление этого файла (счётчики файлов / новые находки).
