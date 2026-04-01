# P2 — инвентаризация и бэклог задач (архитектура)

**Статус:** справочный документ для планирования; не подменяет [PROJECT_AUDIT.md](PROJECT_AUDIT.md).  
**Связь с аудитом:** раздел «P2 — архитектура» в [PROJECT_AUDIT.md](PROJECT_AUDIT.md).

Цель файла — зафиксировать **где** сидит техдолг и **какие задачи** логично ставить в работу, без выполнения рефакторинга в этом изменении.

---

## 1. Крафт v1 / v2

### 1.1 Два источника рецептов

| Источник | Файл | Тип рецепта | Потребители (ориентир) |
|----------|------|-------------|-------------------------|
| **V2** | [src/data/recipes/index.ts](../src/data/recipes/index.ts) | `WeaponRecipe` из `@/types/craft-v2` | `use-craft-v2`, `craft-planner`, `craft-container`, `forge-screen`, `process-generator`, калькуляторы/тесты в `src/lib/craft/` |
| **Legacy v1** | [src/data/weapon-recipes.ts](../src/data/weapon-recipes.ts) | свой `WeaponRecipe`, `weaponRecipes[]`, константы `qualityGrades`, `weaponTypeStats` | заказы, часть UI, ремонт/стоимости, генератор искателей |

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

### 1.2a P2-Craft-01 — матрица ID рецептов (снимок)

| ID | [initialUnlockedRecipes](../src/store/slices/craft-slice.ts) | [weaponRecipes](../src/data/weapon-recipes.ts) (legacy) | [allRecipes / getRecipeById](../src/data/recipes/index.ts) (v2) | Заметка |
|----|:---:|:---:|:---:|---|
| `basic_sword` | ✅ | ❌ | ✅ | Старт v2; заказы/легаси не содержат железный набор для этого id |
| `basic_dagger` | ✅ | ❌ | ✅ | То же |
| `basic_axe` | ✅ | ❌ | ✅ | То же |
| `iron_sword` … `iron_hammer` (6 шт.) | ✅ | ✅ | ❌ | Только legacy: баланс заказов и `calculateAttack`; в v2 нет зеркальных id |
| `bronze_sword`, `bronze_axe` | ❌ | ✅ | ❌ | Только legacy |
| `steel_sword`, `steel_dagger`, `steel_spear` | ❌ | ✅ | ❌ | Только legacy |
| `silver_sword`, `silver_dagger` | ❌ | ✅ | ❌ | Только legacy |
| `gold_sword`, `mithril_sword`, `mithril_dagger` | ❌ | ✅ | ❌ | Только legacy |
| `long_sword`, `battle_axe` | ❌ | ❌ | ✅ | v2 без автоматической разблокировки в стартовом списке |

**Вывод:** пересечение по id между стартом и v2 — только `basic_*`. Расхождение с `initialUnlockedRecipes` — набор `iron_*` и др. существует только в legacy; заказы и достижимость пока опираются на [weaponRecipes](src/data/weapon-recipes.ts). Облако/БД по умолчанию наследует те же поля, что и клиентский persist (см. [db.ts](../src/lib/db.ts)); отдельный дефолтный набор рецептов в SQL не дублируется.

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

- **Файл:** [src/store/game-store-composed.ts](../src/store/game-store-composed.ts) — **~1175 строк** (оценка по состоянию репозитория).
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

**P2-Repo-01 (итог):** приложение не должно импортировать эти пути как `@/`; консолидация — перенос в `src/` при подключении лута к рантайму или удаление дубликатов после миграции.

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

- **P2-Craft-01** — Матрица соответствия ID рецептов: `initialUnlockedRecipes` / облако / `weaponRecipes` (v1) vs `allRecipes` (v2); устранить противоречия и мёртвые id.
- **P2-Craft-02** — Заказы: [order-achievable-utils.ts](../src/lib/store-utils/order-achievable-utils.ts), [order-utils.ts](../src/lib/store-utils/order-utils.ts) — миграция с legacy `WeaponRecipe` на v2 или явный адаптер v1↔v2.
- **P2-Craft-03** — Вынести `qualityGrades`, `weaponTypeStats`, `getQualityGrade` из legacy в нейтральный модуль (`src/types` или `src/lib/craft`) и подключать UI без `weapon-recipes.ts` где возможно.
- **P2-Craft-04** — Упростить модель **активного крафта**: единый источник правды (`ActiveCraftV2` + slice/cleanup legacy `ActiveCraft` в persist и API save).
- **P2-Craft-05** — Зафиксировать в [docs/04_TYPES_SYSTEM.md](04_TYPES_SYSTEM.md) статус [src/types/craft.ts](../src/types/craft.ts) vs [craft-v2.ts](../src/types/craft-v2.ts) (deprecated / зона только orders / и т.д.).
- **P2-Craft-06** — [weapon-card.tsx](../src/components/ui/weapon-card.tsx): тип `WeaponCardWeapon` (legacy + v2 поля) — свести к `CraftedWeaponV2` + узкие расширения для UI.

### Store и архитектура

- **P2-Store-01** — Вынести из `game-store-composed` координацию **заказов** (как минимум то, что трогает несколько слайсов и ресурсы) в `src/store/cross-slice/` по аналогии с ремонтом/экспедицией.
- **P2-Store-02** — Исследование: типизированная сборка Zustand-слайсов без `set as any` / `get as any` (может потребовать общий тип `GameStore` до объявления slices).
- **P2-Store-03** — Точечный smoke/integration: «инициализация store → одно cross-slice действие → инварианты» (можно позже связать с P3 E2E).

### Репозиторий и примеры

- **P2-Repo-01** — Инвентаризация импортов на `data/`, `types/` в корне и `docs/Random_gen`; план удаления или переноса в `src/`.
- **P2-Repo-02** — Политика для [examples/](../examples/): README «черновик / не поддерживается» или лёгкая проверка типов в отдельном tsconfig.

### Персистентность и сейв

- **P2-Save-01** — Согласовать схему `activeCraft` в [save-payload-schema.ts](../src/lib/save-payload-schema.ts), [api/save/route.ts](../src/app/api/save/route.ts) и клиентском зеркале [use-cloud-save.ts](../src/hooks/use-cloud-save.ts) с финальной моделью v2.

---

## 6. Следующий шаг

1. Выбрать 1–2 задачи из бэклога (часто первыми идут **P2-Craft-01** + **P2-Save-01** или **P2-Craft-02**).  
2. После выполнения крупного шага — строка в журнал [PROJECT_AUDIT.md](PROJECT_AUDIT.md) и при необходимости обновление этого файла (счётчики файлов / новые находки).
