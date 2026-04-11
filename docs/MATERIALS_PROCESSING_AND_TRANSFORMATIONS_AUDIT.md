# Полный аудит: материалы и преобразования (процессинг)

**Дата:** 2026-04-09  
**Цель:** зафиксировать, как устроены учёт материалов, пулы склада, переработка и где заложены упрощения — как основа для доработки процессинга.

**Метод:** сверка кода (`src/lib/craft/inventory-check.ts`, `src/data/refining-recipes.ts`, мост добычи, store, семантика процессов) и существующей карты [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md). Числовые срезы ниже получены скриптом на репозитории (tsx).

---

## 1. Краткий вывод

Игра стоит на **архитектуре A1**: агрегирующие ключи `ResourceKey` в `resources` + каталожный `materialStash` по `materialId`, связь через **`MATERIAL_TO_RESOURCE`**. Для игрока канон — **энциклопедия** (`materialId`), не верхняя панель агрегатов.

**Процессинг в узком смысле** (отдельные здания) сейчас описан **10 рецептами** в `refining-recipes.ts`: одна линейная цепочка «руда → слиток», бронза/сталь как особые случаи горна, плюс **пилорама** и **карьер** с фиксированными коэффициентами. Всё остальное различие материалов в этих цепочках **схлопывается в пулы** или влияет только через **множитель выхода плавки** (`oreChargeEfficiency`) и семантические фасеты крафта — без отдельных рецептов дубления/выделки/кожевницы и т.д.

---

## 2. Два слоя инвентаря и мост

| Механизм | Файл / тип | Назначение |
|----------|------------|------------|
| `resources: Resources` | `resources-slice.ts` | Скаляры по `ResourceKey` (руда, слитки, wood, stone, coal, … плюс валюта). |
| `materialStash` | тот же slice | `Record<materialId, quantity>` — дроп экспедиций, покупки через `grantResourceKeyFromWorld`, миграции. |
| Полный маппинг `materialId → ResourceKey` | `WORLD_RESOURCE_TO_RESOURCE_KEY` + `CORE_MATERIAL_TO_RESOURCE` в `inventory-check.ts` | Без записи материал **не участвует** в списании крафта v2 / горна / лавки (см. `canCatalogMaterialSpendInForgeCraft`). |
| Начисление по ключу в stash | `getGrantTargetMaterialId` | Руда и сырьё → канон из `REFINING_INPUT_STAGE_MATERIAL_ID`; слитки/доски/блоки → `RESOURCE_GRANT_STASH_FALLBACK` (`iron_alloy`, `processed_wood`, …). |

**Порядок слияния:** мост добываемых id, затем ядро; при коллизии **побеждает ядро** (задокументировано в `world-resource-inventory-bridge.ts`).

**Списание с пула:** `applyCraftingCostSpend` — сначала **stash** по всем `materialId`, отсортированным по id, затем **скаляр `resources[key]`** (`spendSingleResourceKeyFromPools`).

---

## 3. Каталог vs склад кузницы

| Показатель | Значение |
|------------|----------|
| Узлов в `materialById` (библиотека + world nodes + мосты + квест) | **101** |
| Уникальных `materialId` в `MATERIAL_TO_RESOURCE` | **96** |
| Каталожных id **без** маппинга на `ResourceKey` | **5** |

**Id без маппинга (не тратятся через пулы кузницы):**

| `materialId` | Контекст |
|----------------|----------|
| `flint`, `bloodstone` | Есть узлы и семантика крафта в оверрайдах для части материалов; **нет** строки в `MATERIAL_TO_RESOURCE` — списание через forge-пулы невозможно, пока не добавят мост. |
| `resonator_matrix`, `focusing_chalice`, `lunar_tuning_fork` | Квестовые артефакты из `quest` — ожидаемо вне экономики плавки. |

Реестр **ENC-only** добычи ([`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts)) **пуст**: все волновые id подключены к мосту.

---

## 4. Переработка (`refining-recipes.ts`): фактический охват

Типы входов: `RawResource` — ровно **8** металлических «рудных» ключей + `wood` + `stone`. Типы выходов `RefinedResource`: слитки (включая бронзу/сталь), `planks`, `stoneBlocks`.

### 4.1 Таблица рецептов

| id | Здание | Входы (ключи) | Выход | Примечание |
|----|--------|-----------------|-------|------------|
| `iron_ingot` | smelter | 3×`iron` + 2 coal | 1×`ironIngot` | Базовая плавка |
| `copper_ingot` | smelter | 3×`copper` + 2 coal | 1×`copperIngot` | |
| `tin_ingot` | smelter | 3×`tin` + 2 coal | 1×`tinIngot` | |
| `bronze_ingot` | smelter | 2×`copper` + 1×`tin` + 4 coal | 2×`bronzeIngot` | `isAlloy` |
| `steel_ingot` | smelter | 4×`iron` + 5 coal | 1×`steelIngot` | **Не** сплав Cu/Sn; отдельный геймплейный путь от «стали» в крафте через `ALLOY_RECIPES` |
| `silver_ingot` | smelter | 3×`silver` + 3 coal | 1×`silverIngot` | |
| `gold_ingot` | smelter | 3×`goldOre` + 4 coal | 1×`goldIngot` | |
| `mithril_ingot` | smelter | 2×`mithril` + 8 coal | 1×`mithrilIngot` | |
| `wood_planks` | sawmill | 2×`wood` | 1×`planks` | Без угля |
| `stone_blocks` | quarry | 3×`stone` | 1×`stoneBlocks` | Без угля |

**За пределами таблицы:** нет рецептов для **кожи**, **отдельных пород/камней**, огранки **гемов**, обжига **глины**, вторичного **лома** кроме как через общий пул (см. §5), нет цепочек «сырьё → промежуточная стадия» кроме руда/слиток и wood/planks/stone/block.

### 4.2 Множитель выхода плавки (качество шихты)

Для рецептов горна при старте считается `computeRefiningSmeltingOutputMultiplier`: средневзвешенный `oreChargeEfficiency` по фактически списанным единицам **рудных** ключей и stash-узлам, мапящимся на эти ключи. Коэффициенты заданы явно в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts) для канонических руд и альтернатив (`bog_iron`, `depth_iron`, …, `star_metal`).

При завершении: `Math.floor(recipe.output.amount * amount * mult)` в `completeRefiningWithResources` (`game-store-composed.ts`).

**Не покрыто:** пилорама и карьер **не** используют аналогичный множитель по породе/камню; качество древесины/камня из каталога на выход досок/блоков не зависит.

---

## 5. Пулы: где «всё одинаково»

Ниже — осознанные упрощения A1/TD-INV-2.

### 5.1 Металлы

- Все варианты железной руды (канон + `bog_iron`, `depth_iron`, …) → **`ResourceKey` `iron`**; выплавка **одним** рецептом `iron_ingot`.
- `star_metal` → пул **`mithril`** (не отдельный ключ).
- `ancient_metal` → пул **`ironIngot`** (находка «как слиток», минуя горн).

### 5.2 Дерево

- Все перечисленные породы + множество органики моста (кора, мох, …) → **`wood`**.
- Пилорама: **2 wood → 1 planks**; порода не меняет рецепт, только косвенно — если бы учитывалась в multiplier (сейчас нет).
- Начисление `wood` из мира → представитель stash **`oak`** (`REFINING_INPUT_STAGE_MATERIAL_ID.wood`).

### 5.3 Камень

- Базовые камни + множество минералов/«гемов» моста → **`stone`**; обработка **3 stone → 1 stoneBlocks**.
- Нет отдельной цепочки для глины, серы, кристаллов и т.д. на уровне `refining-recipes`.

### 5.4 Кожа и «органика в пуле кожи»

- Все стадии кожи из ядра + `bones`, `dragon_scale`, … → **`leather`**.
- **Нет** рецепта дубления/пропитки в `refining-recipes`; отличия — только семантика частей (`weapon_grip_leather`) и параметры материала в каталоге.

### 5.5 Топливо

- `coal`, `ancient_coal`, `peat`, пыль/эмберы моста → **`coal`**; учёт в горне через общий ключ.

---

## 6. Кузница vs горн: расхождение путей (важно для дизайна)

| Материал каталога | Раскрытие в стоимости крафта (`ALLOY_RECIPES` / прямой ключ) | Параллель в горне |
|-------------------|--------------------------------------------------------------|-------------------|
| `steel`, `high_carbon_steel` | Железные **слитки** + уголь (отдельные количества) | Рецепт `steel_ingot`: железная **руда** + много угля → стальной слиток |
| `silver_alloy` | Железный + серебряный слиток + уголь | — |
| `bronze` | Прямой ключ `bronzeIngot` (без записи в `ALLOY_RECIPES` в `inventory-check`) | Плавка из **руд** меди/олова |

Игрок может копить **рудный** и **слиточный** пути к одному и тому же «названию» металла в UI каталога; **баланс и время** между ними не унифицированы одной формулой — это логический хвост для будущей унификации процессинга.

---

## 7. Техники обработки материала в кузне (`material-processing-techniques.ts`)

Отдельный реестр от боевых техник: задаёт **вставки этапов** таймлайна и привязку к `refiningRecipeId` для режима «руда в горне перед ковкой» (`ore_smelt`). Есть бонусы **качества прогноза** и **сужения разброса** — но не отдельная физическая цепочка переработки каждого id.

Резолв каталога для техник: древесина ≠ `processed_wood` → якорится на `processed_wood`; часть камней → на `processed_stone` — **унификация UI/плана**, не новое здание.

---

## 8. Семантика процессов (`material-process-contribution.ts`)

Два зарегистрированных процесса: `refining_smelting`, `weapon_craft_v2`.

- **Плавка:** оверрайды + эвристика тегов (`ore`, `fuel`, …).
- **Крафт частей:** оверрайды + эвристика `class` / `gem` / руда в минералах.

Это влияет на **роли в UI и множитель руды**; не добавляет новых зданий или рецептов в `refining-recipes.ts`.

---

## 9. Энциклопедия при списании со скаляра `resources`

При `spendCraftingCostWithStash`, если часть списания идёт с **числового** поля `resources[key]` (после исчерпания stash по конкретным `materialId`), дельта по этому ключу в `applyPoolSpendDeltasToEncyclopedia` **делится поровну** между всеми каталожными id, мапящимися на ключ (`getCatalogMaterialIdsForResourceKey`). Это упрощение учёта «какие именно брёвна сожгли», а не точное сопоставление партии.

---

## 10. По файлам: источники правды

| Тема | Файл |
|------|------|
| Маппинг материал → ключ, списание, множитель плавки | `src/lib/craft/inventory-check.ts` |
| Рецепты зданий | `src/data/refining-recipes.ts` |
| Мост добываемых id | `src/lib/materials/world-resource-inventory-bridge.ts` |
| Оверрайды плавки и ролей | `src/data/materials/material-process-overrides.ts` |
| Чтение вкладов | `src/lib/materials/material-process-contribution.ts` |
| Старт/завершение переработки | `src/store/game-store-composed.ts` (`startRefiningWithResources`, `completeRefiningWithResources`) |
| Stash / grant / spend | `src/store/slices/resources-slice.ts` |
| Техники «руда в кузне» | `src/data/material-processing-techniques.ts` |
| Лавка | `src/data/material-shop.ts` |
| Карта потоков (человекочитаемо) | `docs/RESOURCE_TRANSFORMATION_MAP.md` |
| Дорожная карта семантики | `docs/MATERIAL_SEMANTIC_PROCESS_ROLES.md` |

---

## 11. Направления доработки процессинга (бэклог по результатам аудита)

Ниже — не требования, но **согласованные с кодом** точки роста, если убирать упрощения:

1. **Расширить `RawResource` / рецепты** — отдельные ключи или рецепты для пород, кожевницы, глины/керамики, огранки камня; либо многостадийные цепочки с промежуточными `materialId`.
2. **Согласовать пути стали/сплавов** между горном и `ALLOY_RECIPES`, чтобы не было двух несопоставимых экономик.
3. **Множители / время для пилорамы и карьера** по категориям материала (аналог `oreChargeEfficiency`).
4. **Маппинг `flint` / `bloodstone`** на `ResourceKey`, если они должны расходоваться как прочие минералы.
5. **Точечный учёт encyclopedia** при списании со скаляра — если важно, какой именно id пула израсходован.
6. Автогенерация отчётов (`materials:resource-map` из AGENTS.md) — снизит расхождение таблиц и кода при росте числа рецептов.

---

*Документ создан как снимок состояния кода; при изменении маппинга или `refining-recipes` обновляйте §3–§5 и таблицы вручную или через скрипт сверки.*
