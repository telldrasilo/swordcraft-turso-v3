---
name: materials-a2-wave
description: >-
  SwordCraft: чеклист PR для волны A2 (фаза 2 roadmap) — единый склад materialStash,
  домены плавка/дерево/камень/кожа, scope-файлы a2-*-domain-scope, inventory-check,
  тесты цепочек, §11/§12. Use when the user runs an A2 wave, materials phase 2 stash
  migration subdomain, quarry/smelter/sawmill/leather pool work, or "волна каталога склада".
---

# Materials A2 wave (фаза 2)

Канон процесса: **[docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md](../../../docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md)** — **§7** (фаза 2), **§3.6** (Craft/ремонт/перековка/алтарь), **§8.5** (контракт + тесты). Не смешивать с **фазой 3** (операции в техниках) в одном большом PR.

## Когда применять

- Новая **подволна 2.2–2.3** по ограниченному домену (`ResourceKey` + связанные `materialId`).
- Правки **начислений/списаний** (`grantResourceKeyFromWorld`, `addMaterialToStash`, `spendCraftingCostWithStash`, refining).
- Подготовка или точечное закрытие **2.4** (мосты в `inventory-check`, миграция persist).

Для **нового узла каталога** и JSON спецификации материала — skill **[material-definition-wizard](../material-definition-wizard/SKILL.md)**; этот skill — про **волну склада A2** и согласованность пулов.

## Перед кодом

1. Прочитать **§12** и последние строки **§11** в roadmap — какой домен следующий.
2. Открыть существующие образцы: [`src/lib/craft/a2-smelting-domain-scope.ts`](../../../src/lib/craft/a2-smelting-domain-scope.ts), [`a2-wood-domain-scope.ts`](../../../src/lib/craft/a2-wood-domain-scope.ts), при наличии — `a2-stone-domain-scope.ts`, `a2-leather-domain-scope.ts`.
3. Уточнить рецепты/ключи: [`src/data/refining-recipes.ts`](../../../src/data/refining-recipes.ts), маппинг [`src/lib/craft/inventory-check.ts`](../../../src/lib/craft/inventory-check.ts) (`getGrantTargetMaterialId`, `getAvailableAmountForResourceKey`, `CORE_MATERIAL_TO_RESOURCE`).

## Чеклист PR (выполнять по порядку)

### 1. Инвентаризация домена

- Список **ResourceKey** и **materialId** пула домена.
- Таблица **начислений**: лавка ([`material-shop.ts`](../../../src/data/material-shop.ts), [`shop-screen.tsx`](../../../src/components/screens/shop-screen.tsx)), экспедиции, заказы, здания/tick, автозакупка крафта — всё ли ведёт в согласованный пул (stash + legacy `resources` через `getAvailableAmountForResourceKey`).
- Списание: [`resources-slice.ts`](../../../src/store/slices/resources-slice.ts), [`game-store-composed.ts`](../../../src/store/game-store-composed.ts) (`startRefiningWithResources` / `completeRefiningWithResources`).

### 2. Поведение и мосты

- При смене канала начисления: суммарные пулы для **ремонта** и UI не должны ломаться ([`repair-utils`](../../../src/lib/store-utils/repair-utils.ts)).
- Не удалять строки маппинга в `inventory-check` без аудита **persist** (`migrateLegacyMaterialResourcesToStash`, `STORE_VERSION` в `game-store-composed`) — см. roadmap **2.4**.

### 3. Тесты

- Расширить или добавить блок в [`src/lib/craft/inventory-check.test.ts`](../../../src/lib/craft/inventory-check.test.ts): сценарий **stash-only** → списание (как для smelting/wood/stone/leather).
- При затрагивании store: узкие тесты рядом (например [`resources-stash-debit.test.ts`](../../../src/store/resources-stash-debit.test.ts)).
- Обязательно зелёный **`material-catalog-contract`** ([`src/lib/materials/material-catalog-contract.ts`](../../../src/lib/materials/material-catalog-contract.ts)); новый тип ссылок на `materialId` — новая строка сканера (**§8.5**).

### 4. Команды (как CI)

По [AGENTS.md](../../../AGENTS.md): `npm run lint`, `npm run test`, `npm run type-check`, `npm run build`. Быстрая проверка контракта: `npm run audit:materials`.

### 5. Документация

- Одна строка **§11 Worklog** + обновить **§12** (и при необходимости **§13**) в roadmap.
- **[docs/RESOURCE_TRANSFORMATION_MAP.md](../../../docs/RESOURCE_TRANSFORMATION_MAP.md)** — только если менялись id цепочек переработки.
- **§10** roadmap: отмечать `[x]` только по факту закрытого инварианта.

### 6. Ручной смоук (описание PR)

По **§3.6**: один проход крафта/обработки в зоне домена + **ремонт** на том же сейве, если задействованы те же `ResourceKey`; при карьере — `stone_blocks`; при плавке — слиток и т.д.

## Антипаттерны

- Big-bang на весь реестр + store + UI без промежуточного зелёного контракта.
- Полагаться на верхнюю панель ресурсов как на источник правды (см. [LEGACY_UI.md](../../../docs/LEGACY_UI.md)).
- Добавлять сканер **0.2** для ремонта/перековки, пока в данных нет явных `materialId` — тогда строка в **§11** «осознанный пропуск».

## Связь с material-definition-wizard

Новый **материал в каталоге** → wizard + registry manifest + контракт. **Волна A2** → этот skill: согласование пулов склада и тестов цепочки для уже существующих или новых id в экономике горна/пилорамы/карьера.
