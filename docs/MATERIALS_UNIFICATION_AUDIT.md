# Аудит и унификация материалов/ресурсов

**Статус:** рабочий документ для согласования архитектуры и дорожной карты.  
**Дата обновления:** 2026-04-01 (фаза **3** при **A1**: основной контур **закрыт** — все `worldResourceNodes` мапятся, **TD-INV-2** снят; **остаток** фазы 3 — см. блок **«Фаза 3 — остаток»** ниже и **§8.1**. **TD-DOC-1** в `MATERIALS_ADDING.md`; фаза **5** (UI склада / ENC / единая иконка) — **выполнена** по критерию §5; фазы **4**, **6–7** частично; фаза **2** закрыта. Подземелья вне скоупа.)

## 0. Сводка: что сделано и что осталось

### Сделано

| Область | Фактическое состояние |
|---------|------------------------|
| **Фазы 0, 1, 1b, 2** | **Выполнены** — детали и ссылки в **§8.1**. |
| **Фаза 3 — пилоты 3.1 и 3.2** | Канон стадий сырья для плавки (`REFINING_INPUT_STAGE_MATERIAL_ID`, `getGrantTargetMaterialId`); развод **руда** (`ResourceKey` `iron`, …) vs **слиток** (`ironIngot`, …) в [`inventory-check.ts`](../src/lib/craft/inventory-check.ts); сплавы через `ALLOY_RECIPES`; ремонт по слиткам; лавка: слитки, доски, каменные блоки [`material-shop.ts`](../src/data/material-shop.ts); миграции stash (**STORE_VERSION** 3–4). |
| **Фаза 3 — решение по архитектуре** | Зафиксирован **§3.0 вариант A1**: сохранение `ResourceKey` + `MATERIAL_TO_RESOURCE`; целевой **A2** (один счётчик по `materialId`) не в текущем скоупе. Карта: [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md) **§0**. |
| **Фаза 3 — мост добываемых узлов** | **Все** добываемые `worldResourceNodes` имеют маппинг на `ResourceKey` (таблица **§4.1** + [`data/ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md)); мост [`world-resource-inventory-bridge.ts`](../src/lib/materials/world-resource-inventory-bridge.ts). |
| **TD-INV-2 (учёт)** | **Закрыто (2026-04-01):** бывшие **34** id мапятся через мост [`world-resource-inventory-bridge.ts`](../src/lib/materials/world-resource-inventory-bridge.ts); реестр ENC-only **пуст** [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts); таблица решений [`data/ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md); Vitest партиция [`gatherable-enc-only.test.ts`](../src/lib/materials/gatherable-enc-only.test.ts). |
| **TD-INV-1 (пулы)** | Осознанный пул **`iron`** / **`mithril`** задокументирован в **§4.1**; тесты суммирования stash по пулу [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts). |
| **TD-INV-1 (аналог: wood / leather / stone)** | Пулы **`wood`**, **`leather`**, **`stone`** в режиме **A1** (несколько `materialId` → один `ResourceKey`); тесты «wood, leather, and stone pools» в [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts); карта — [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md) §4–6. |
| **Фаза 3 — крафт / предупреждения** | В [`inventory-check.ts`](../src/lib/craft/inventory-check.ts) вместо немого `Unknown material`: явные `console.warn` с контекстом (`reportCraftMaterialMappingGap`, каталог vs ENC-only vs адаптер legacy) в расчёте стоимости и проверке инвентаря. |
| **Семантика плавки (влияние на игру)** | `oreChargeEfficiency` в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts); `computeRefiningSmeltingOutputMultiplier` в `inventory-check`; при завершении плавки — `smeltingOutputMultiplier` в [`game-store-composed.ts`](../src/store/game-store-composed.ts) / [`craft-slice.ts`](../src/store/slices/craft-slice.ts). См. карту и [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) §0. |
| **TD-INV-2 (политика)** | Новые немапящиеся добываемые id — явный реестр + **TD-DOC-1**; при маппинге — **TD-SEM-4** и синхронизация §4.1 / карты. |
| **Фаза 5 (UI)** | Единый [`MaterialDisplayIcon`](../src/components/ui/material-display-icon.tsx): `MaterialNode.icon` (emoji/PNG) + фолбэк `ResourceIcon`. Склад: имя/редкость/значок по [`getGrantTargetMaterialId`](../src/lib/craft/inventory-check.ts) и каталогу — [`resources-screen.tsx`](../src/components/screens/resources-screen.tsx). ENC: те же значки в [`material-card.tsx`](../src/components/encyclopedia/material-card.tsx); категории **Травы** / **Топливо** — [`getDisplayCategory`](../src/types/materials/material-core.ts), тест [`material-display-category.test.ts`](../src/types/materials/material-display-category.test.ts). |
| **Фазы 4, 7 (часть)** | Лавка: имя из каталога в `getMaterialShopInfo` / [`material-shop.ts`](../src/data/material-shop.ts). Тесты: [`expedition-inventory-chain.test.ts`](../src/lib/materials/expedition-inventory-chain.test.ts), [`material-process-contract.test.ts`](../src/lib/materials/material-process-contract.test.ts). |
| **TD-DATA-1** | Закрыт: роль **`fuel`**, оверрайды плавки, семантика см. [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md). |
| **Документация** | [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md); **§4.1** — полный маппинг добываемых узлов; [`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md) — решения TD-INV-2. |

### Осталось сделать

| Приоритет | Задача |
|-----------|--------|
| **§2.7 дерево / кожа / камень** | **Закрыто для A1** — см. **§2.7.1** (пулы `wood` / `leather` / `stone`, доски `planks`). Отдельные ключи по породам — только при смене модели + миграции. |
| **~~TD-INV-2 (контент)~~** | **Выполнено (2026-04-01):** см. §4.1 и [`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md). |
| **TD-DOC-1** | При новом добываемом id: `gather-material-config.mjs`, мост, карта, при расходе — убрать из ENC-only. |
| **Семантика** | **D:** явные оверрайды для моста **§4.1** — **2026-04-01** ([`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) **§0**). Дальше: **C** (UI крафта), **E** (ремонт + охват), id вне добываемого моста. |
| **Фазы 4–7 (хвост)** | `shop-screen.tsx` без полного хардкода; единый компонент иконки материала; экспертиза при расходе (если по дизайну); интеграционные тесты store / проверка persist для полей плавки; см. **«Бэклог»** ниже. |

### Фаза 3 (вариант A1) — что уже закрыто и что осталось

**Закрыто по §3.0 A1 (инвентарь / маппинг / добыча):**

- пилоты **3.1–3.2** (руда ↔ слиток, stash, лавка, `STORE_VERSION` 3–4);
- пулы **TD-INV-1** (`iron` / `mithril`) и аналог **wood / leather / stone** (**§2.7.1**);
- **TD-INV-2:** все добываемые узлы из [`world-resource-nodes.ts`](../src/data/materials/library/world-resource-nodes.ts) имеют `ResourceKey`; реестр [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts) **пуст**; таблица [`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md);
- планировщик крафта: [`canCatalogMaterialSpendInForgeCraft`](../src/lib/craft/inventory-check.ts), [`forgeSpendBlockReason`](../src/lib/craft/inventory-check.ts), фильтр материалов частей;
- базовый контур **TD-SEM-4** для новых маппингов (оверрайды плавки / `weapon_craft_v2` там, где нужно — см. [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts)).

**Остаток фазы 3 (A1 — не цель A2):**

| Тема | Суть |
|------|------|
| **Жёсткий `MATERIAL_TO_RESOURCE`** | В §5 перечислена цель: по возможности правила из данных и 1:1 списание по `materialId`. Сейчас — ручная таблица + мост; **перенос в данные** = отдельный крупный проход (граница с **A2**). |
| **Материаловедение §2.8 для списываемых id** | Для id в крафте/плавке желателен ревью уровня **Б**; мировые узлы закрыты **1b**; ядро библиотеки (металлы, эталонные узлы) — по приоритету, не блокер A1. |
| **Каталожные id вне `worldResourceNodes`** | Предупреждения [`reportCraftMaterialMappingGap`](../src/lib/craft/inventory-check.ts): немапящиеся **не** добываемые материалы — по мере рецептов или осознанно вне кузницы. |
| **Интеграционные тесты цепочки** | Юнит-тесты инвентаря/моста есть; полный сценарий **экспедиция → stash → списание в v2/горне** ближе к **фазе 7** ([`AGENTS.md`](../AGENTS.md), [`expedition-inventory-chain.test.ts`](../src/lib/materials/expedition-inventory-chain.test.ts) — частичный задел). |
| **Семантика C–E** | UI тултипы, добивание **§6.2** [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md), контракты ремонта — **бэклог**, формально после стабильного списания по id (у добываемых — уже есть). |

**A2** (единый счётчик по `materialId`, отказ от агрегирующих `ResourceKey` для сырья) — **не** входит в «остаток» фазы 3 A1; отдельное решение + миграции.

### Бэклог (приоритет после синхронизации документов)

| Направление | Смысл |
|-------------|--------|
| **3–7 (стык)** | Интеграционные тесты **экспедиция → stash → крафт/горн** в store (формально фаза **7**). UX: немапящиеся каталожные id — блок/подсказка в планировщике (`forgeSpendBlockReason`); добываемые после TD-INV-2 мапятся. |
| **~~TD-INV-2~~** | Закрыто 2026-04-01 — см. [`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md). |
| **Семантика E** | Контрактные тесты для `weapon_craft_v2` / ремонта; опционально `MaterialProcessKind` для ремонта в реестре §4 семантики. |
| **Семантика C (UI)** | Тултипы в планировщике крафта через `getMaterialProcessContribution` без смены формулы списания. |
| **4** | Меньше хардкода в лавке (полный оверлей цен по `materialId`). |
| **6** | Экспертиза при расходе + сверка с `discoverMaterial` на луте. |
| **7 + облако** | Тесты ближе к store; актуальность persist при расширении `ActiveRefining` ([`AGENTS.md`](../AGENTS.md)). |
| **A2** | Вне ближайшего спринта: один счётчик по `materialId` без агрегирующих `ResourceKey`. |

**Баланс:** множитель выхода слитка от `oreChargeEfficiency` меняет темп прогрессии; коэффициенты — [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts); обзор — [`docs/utils/FORMULAS.md`](utils/FORMULAS.md) (плавка).

**Быстрая навигация:** детализация по фазам — **§5**; таблицы маппинга и техдолг строк — **§4.1**; журнал работ — **§8.2**.

---

**Связанные документы:**  
- [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md) — **карта преобразований** (`materialId` ↔ `ResourceKey`, горн/пилорама, начисления); держать в согласовании с правками фазы 3.  
- [`EXPEDITION_MODULE_INTEGRATION_AUDIT.md`](EXPEDITION_MODULE_INTEGRATION_AUDIT.md) — интеграция модуля экспедиций, принцип «канон материалов в проекте».  
- [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) — **смысловые роли материалов в процессах** (принципы, фазы A–E); точки пересечения с этим аудитом — **§5** (таблица синхронизации и пометки у фаз). Чеклист процессного техдолга после переноса каталога — **§6** там же.  
- [`data/MATERIALS_DATA.md`](data/MATERIALS_DATA.md), [`MATERIALS_ADDING.md`](data/MATERIALS_ADDING.md) — справочник данных и чеклист добавления.  
- [`expedition-material-id-map.md`](expedition-material-id-map.md) — соответствие legacy id → канон.

---

## 1. Резюме проблемы

Справочник **`MaterialNode`** в `src/data/materials/library` уже выступает каноном для **энциклопедии** и **id в модуле экспедиций** (`MATERIAL_REGISTRY` строится из `allMaterials`). Однако **игровой учёт количества и расход** для кузницы завязан на отдельный слой — фиксированный объект **`resources`** (`ResourceKey`) и ручной маппинг в `src/lib/craft/inventory-check.ts` (`MATERIAL_TO_RESOURCE`). Награды гильдии пишутся в **`materialStash`**: `Record<string, number>` по id каталога.

В результате:

- один и тот же «предмет в мире» с точки зрения данных может существовать как **`iron_ore`** (каталог + stash после экспедиции), как **`iron`** (ключ склада кузницы и выбор в крафте), как **`ironIngot`** (переработка) — без единого правила, когда что увеличивается и что списывается;
- **крафт v2** и плавка после фазы **2** проверяют и списывают **`resources` + `materialStash`** по `MATERIAL_TO_RESOURCE`; целевое **только `materialId`** без агрегатов `ResourceKey` — фаза **3**;
- для большинства узлов каталога (в т.ч. массы экспедиционных world-resources) **нет** записи в `MATERIAL_TO_RESOURCE`, поэтому они не участвуют в расчёте «сырья для кузницы»;
- **характеристики, класс, описание и экспертиза** по дизайну относятся к **`MaterialNode`**, но **экономика магазина сырья** (`src/data/material-shop.ts`) и **иконки склада** (`resource-icon.tsx`) живут отдельно и не выводятся из каталога;
- после ввода модуля экспедиций добавлено много новых id в локациях; часть узлов в подпапках добываемых материалов (`library/ores`, `organics`, `gems`, …) может быть **минимально заполнена** (обёртки над `buildWorldNode`) — **полнота полей под энциклопедию, прогноз крафта и экспертизу** для этой волны контента не доведена до единого стандарта.

**Цель документа:** зафиксировать текущее состояние, целевую модель (**один id — один учёт — одни характеристики — одна экспертиза**) и разбить работу на **фазы**.

---

## 2. Текущее состояние (аудит потоков)

### 2.1 Канон идентичности и метаданных

| Источник | Назначение | Идентификаторы |
|----------|------------|----------------|
| `src/data/materials/library` | `MaterialNode`: класс, физика, экономика, summary, discovery, icon | `identity.id` |
| `src/modules/expeditions/data/materials` | Проекция для UI модуля | те же id, из `allMaterials` |
| `src/store/slices/encyclopedia-slice.ts` | Экспертиза, открытие | `materialId` = id каталога |
| `docs/expedition-material-id-map.md` | Алиасы legacy → канон | — |

**Вывод:** энциклопедия и экспедиции по **id** согласованы с библиотекой.

### 2.2 Учёт количества (два контура)

| Хранилище | Где меняется | Ключи |
|-----------|--------------|--------|
| `resources` | Золото / `soulEssence`, часть легаси-наград, списания без stash; **сырьё от рабочих и закупок** → см. `materialStash` (прогресс **2.1**) | `ResourceKey` — фиксированный enum в `resources-slice` |
| `materialStash` | Награды гильдии по экспедициям (`guild-expedition-cross-slice`) | произвольная строка = `materialId` из каталога |

**Вывод:** при начислении с экспедиции и при расходе в кузнице используются **разные** хранилища; без явной **конвертации** или **единого инвентаря** лут не влияет на крафт.

### 2.3 Кузница (крафт v2)

- Инвентарь для проверки: `state.resources` + `state.materialStash` в планировщике (`craft-container.tsx` и связанные компоненты).
- Требования и списание: `getCraftingCost` / `calculateCraftRequirements` → `spendCraftingCostWithStash` при старте крафта (`inventory-check.ts`, `resources-slice`).
- Маппинг выбранного `materialId` части оружия → `ResourceKey`: `MATERIAL_TO_RESOURCE` + таблица сплавов `ALLOY_RECIPES`.

**Измерение:** из полного списка каталога (`allMaterials`) значительная доля id **не** имеет маппинга на `ResourceKey` (руды, многие world-resources и пр.) — они **не** попадают в расчёт потребности и списания.

### 2.4 Магазин сырья

- `material-shop.ts`: цены, категории, тексты, иконки (emoji/строки) — **отдельные** от `MaterialNode`.
- Покупка пакетов на экране магазина и недостающих материалов в крафте начисляет **канонический id в `materialStash`** через **`grantResourceKeyFromWorld`** (прогресс **2.1**), если есть маппинг в [`getGrantTargetMaterialId`](../src/lib/craft/inventory-check.ts); золото за покупку по-прежнему в `resources`.

### 2.5 Склад (UI)

- `resources-screen.tsx`: объединяет строки из `resources` и `materialStash`.
- Иконки: для `ResourceKey` — `resource-icon.tsx` (PNG); для stash — часто **заглушка** (инициалы), хотя у узла есть `icon` в каталоге.
- В `resourceIcons` не все ключи из `resources` покрыты (например `leather` в slice есть, в карте иконок — проверять при миграции).

### 2.6 Экспертиза

- Привязана к **id каталога** (`encyclopedia-slice`, `discoverMaterial`, `addMaterialExpertise`).
- Работает для любого открытого материала независимо от того, лежит он в stash или «логически» должен был бы расходоваться в кузне.

**Разрыв:** экспертиза и ENC — про **узел**; фактическое «владение количеством» для кузницы — про **ResourceKey**. Игрок может иметь экспертизу по `iron_ore` и единицы в `materialStash`, но **не** иметь возможности потратить их в текущем крафте.

### 2.7 Принцип стадий: нет агрегатов вроде «просто железа»

**Обязательное правило дизайна и данных:** любая вещь, которая в реальном процессе существует в **разных формах** (руда / слиток / заготовка / обработанное сырьё и т.д.), в игре — это **разные игровые ресурсы**: отдельный **`identity.id`** в библиотеке, отдельная строка инвентаря, отдельная запись экспертизы.

Конкретно:

- **Недопустимо** одно абстрактное «железо», которое одновременно означает руду с экспедиции и металл в кузнице. Должны быть как минимум **две сущности** (по канону проекта): например **`iron_ore`** (железная руда) и **металл/слиток для обработки** — отдельный id (в текущей библиотеке это может быть узел `iron` как металл; при необходимости id переименовывается в духе `iron_ingot` для однозначности в коде и UI — решение фиксируется в фазе контента).
- То же относится ко **всем металлам**, для которых в проекте есть и добыча, и переплавка: медь, олово, серебро, золото, мифрил и т.д. — **руда (или иная форма сырья) ≠ слиток/сплав**.
- Аналогично для **неметаллов**, где уже есть или появятся стадии: **брёвна / необработанное дерево ≠ доски**; **сырец камня ≠ каменные блоки**; **сырая кожа ≠ выделанная**; любые другие пары «сырьё → полуфабрикат» задаются **двумя (и более) id**, а не одним ключом `resources`.

**Перевод между стадиями** только через **явные рецепты** переработки (горн, пилорама, дубление и т.п.): списание id одной стадии, начисление id другой. Запрещено молчаливое приравнивание «на складе лежит руда, а крафт списывает слиток с той же метки».

**Источники начисления** (экспедиция, рабочие, магазин) обязаны указывать **конкретную стадию** (конкретный `materialId`), а не перегруженный агрегат вроде ключа `iron` в `ResourceKey`. Текущие исключения (рудник выдаёт `iron`, магазин продаёт «рудy» под ключом `iron`) помечаются как **технический долг** и устраняются при унификации.

#### 2.7.1 Решение по фазе 3 (модель A1), зафиксировано 2026-04-03

Для **дерева, кожи и камня** на ближайшие релизы принято **оставить осознанные пулы `ResourceKey`** в духе **TD-INV-1** (как для железа/мифрила), без отдельных ключей на каждую породу древесины и без развода «брёвна vs доски» на уровне склада сверх уже существующих **разных `materialId`**:

- **Дерево:** несколько пород (`pine`, `oak`, …) и экспедиционные варианты мапятся на один ключ **`wood`**; **`processed_wood`** → **`planks`**; пилорама — [`refining-recipes.ts`](../src/data/refining-recipes.ts) (`wood_planks`); канон начисления брёвен — `REFINING_INPUT_STAGE_MATERIAL_ID.wood` (представитель **`oak`**). Карта: [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md) §4.
- **Кожа:** варианты сырья/обработки → пул **`leather`** (см. `MATERIAL_TO_RESOURCE` в [`inventory-check.ts`](../src/lib/craft/inventory-check.ts)).
- **Камень:** варианты сырья → **`stone`**, обработка → **`stoneBlocks`** / **`processed_stone`**.

**Ввод отдельных `ResourceKey` по породам или жёсткий развод только брёвен без пула `wood`** = смена продуктовой модели: тогда нужны **`STORE_VERSION`**, миграция stash и обновление §4.1 / карты (аналог пилота **3.2** для металлов). До этого решения пункт «остаток §2.7» в §0 считается **закрытым по архитектуре A1**; дальнейшая работа — только контент (**TD-INV-2**) или осознанная смена модели.

### 2.8 Материаловедение: полнота инженерных полей `MaterialNode`

**Материаловедение** — обязательная часть дизайна SwordCraft: игрок и система крафта опираются на **осмысленные** характеристики материала, а не только на имя и редкость. В коде это **`MaterialNode`**: помимо `identity`, `economy`, текстов и `discovery`, существенны **`physical`**, **`chemical`**, **`arcane`**, **`processing`** (и согласованные **`identity.tags`** / `class`), как в эталонах [`MATERIALS_ADDING.md`](data/MATERIALS_ADDING.md) (`library/woods/oak.ts`, `library/ores/iron_ore.ts` и т.д.).

**Два уровня полноты (оба допустимы на разных этапах дорожной карты):**

| Уровень | Смысл | Типичный источник данных |
|---------|--------|---------------------------|
| **А. Структурный канон** | Все секции `MaterialNode` заполнены, числа **не пустые**: для массовых экспедиционных сырьевых id допустим пресет по роли через `buildWorldNode` ([`library/build-world-node.ts`](../src/data/materials/library/build-world-node.ts)). | Быстрый завод дропа; единая шкала «похоже на органику/руду» |
| **Б. Эталонная проработка** | Значения **сознательно выставлены и сверены** с 2–3 соседями того же `economy.tier` и близкой роли; узел читается как готовый к **прогнозу крафта и балансу**, без «маскирующих» средних дефолтов. | Ручной файл как `oak.ts`, либо явные оверрайды полей поверх фабрики (если команда введёт такой механизм) |

**Правило приоритета:** уровень **Б** обязателен для материалов, которые **реально участвуют в расчёте крафта / переработки**, задают особое поведение (магические металлы, экзотические руды) или объявлены **ключевыми** в геймдизайне. Для «фонового» дропа без списания в кузне на ранних итерациях допустим уровень **А**, пока id не попадает под критерии фазы 1b или не подключается в фазе 3.

**Связь с фазами (см. §5):** лор, тексты и экономика — **фаза 1**; эталонная инженерная проработка — **фаза 1b**; к **фазе 3** любой id, который списывается планировщиком или переработкой, **не должен** опираться только на «случайно подходящие» пресеты без ревью (либо выполнен **1b**, либо явное исключение зафиксировано в чеклисте с техдолгом).

### 2.9 Крафт: канон свойств (`MaterialNode` → параметры расчёта)

**Что уже есть:** любой id из [`materialById`](../src/data/materials/library/index.ts) может быть подан в крафт через **`getMaterialAsLegacy`** → **`adaptMaterialNodeToMaterial`** ([`adapter.ts`](../src/data/materials/adapter.ts)): `properties`, `crafting` (в т.ч. `workability`, `meltingPoint`), `weaponEffects` (бонусы к атаке, прочности, ёмкости души и т.д.), `dominantProperty`, модификаторы времени/риска — всё **выводится** из секций **`physical` / `arcane` / `processing` / `economy`** по **общим формулам** для всех узлов. Иначе говоря, «полная интеграция каталога в математику крафта» на уровне **численного профиля материала** уже задана этим слоем: чем богаче и осмысленнее узел (фазы **1** и **1b**), тем отличнее результат в [`calculator.ts`](../src/lib/craft/calculator.ts) и смежном коде.

**Где цель шире:** если под «каждый материал ведёт себя в крафте по-своему» понимается не только **разный набор инженерных чисел** (и следствий формул), а **явные исключения и правила**, не выводимые из `hardness`/`toughness`/… (например фиксированный бонус только для рукояти, гейт по тегу, особая реакция на технику), этого в типе **`MaterialNode` сегодня нет** — калькулятор их не читает. Путь реализации: расширить схему узла (опциональные поля вроде craft/balance overrides) **или** ввести таблицы модификаторов `(materialId, часть, этап, …)` поверх канона; дублировать второй параллельный каталог только для части id нежелательно.

**Связь с инвентарём:** даже при корректном адаптере материал **экономически не участвует в крафте**, пока количество по его id не проверяется и не списывается в том же контуре, что и экспедиция (§2.3, фазы **2–3**): `MATERIAL_TO_RESOURCE` и перегруженные `ResourceKey` обходят «один id — одно поведение» на этапе **списания**, а не расчёта статов.

---

## 3. Целевая модель (на выходе)

0. **Стадии и формы:** каждая отличимая форма сырья/продукта — **свой** `materialId` и свой счётчик (см. §2.7). Нет универсального ключа «железо» без уточнения; руда, слиток, сплав, доски, блоки — **разные ресурсы** с разными характеристиками в ENC и, возможно, разными цепочками экспертизы.

1. **Один канонический объект на игровой «ресурс» — одна стадия** — по смыслу это **`MaterialNode`** (или выделенный «игровой ресурсный дескриптор», 1:1 с узлом): **класс** (`identity.class` + отображаемая категория), **характеристики** (physical / chemical / arcane / processing / economy и т.д.; требования к глубине проработки — §2.8), **описания** (summary, description), **иконка**, **правила открытия** (discovery). Сплав как отдельная стадия — отдельный узел; смешивание «и руда, и слиток» в одном узле не допускается.

2. **Один счётчик количества на id** в рантайме: начисление (экспедиция, магазин, рабочие, квесты) и расход (крафт, переработка, заказы) работают с **одной** структурой инвентаря, без «двойников» stash vs warehouse, если не оговорены явно **разные фазы хранения** (например только «сырьё на складе» vs «в пути») — но не два несвязанных слоя для одного id.

3. **Энциклопедия:** любой материал, который может выпасть/купиться/быть расходован, **есть** в библиотеке с полным набором полей по стандарту проекта; экспертиза везде привязана к этому id **включая все стадии** (отдельно руда, отдельно слиток, и т.д.).

4. **Крафт:** проверка и списание используют **тот же id и тот же инвентарь**, что и экспедиция; преобразования «руда → металл» только через **рецепты переработки** (отдельная операция), а не через маппинг «любой железный id → один `ResourceKey`».

5. **Магазин / UI:** цены, имена для витрины, иконки **генерируются или верифицируются** из канона (жёсткий override только там, где нужен геймдизайн-исключение); позиция магазина всегда привязана к **конкретной стадии** (конкретный `materialId`), без подмены смысла (руда продаётся как id руды, не как «abstract iron»).

6. **Модуль экспедиций:** только ссылки `materialId` из библиотеки; новые ресурсы — **сначала** полный `MaterialNode` + регистрация, **потом** использование в локациях; дроп всегда в форме **явной стадии** (руда с месторождения — id руды, не id металла).

7. **Крафт и материаловедение:** расчёт итогового оружия опирается на **один канон** — поля `MaterialNode` (напрямую или через единый производный слой вроде адаптера). Материал-специфичные эффекты ниже уровня «формула от `physical`/`arcane`/`processing`» задаются **в данных** (расширения узла или согласованные таблицы), чтобы не поддерживать второй, расходящийся каталог legacy-эффектов только для части id.

---

## 4. Пробелы по контенту (волна экспедиций)

Для id, добавленных под экспедиции (подпапки **`library/`** с добываемыми узлами — см. [`world-resource-nodes.ts`](../src/data/materials/library/world-resource-nodes.ts)), нужно явно проверить по каждому узлу:

- **Материаловедение (§2.8):** для приоритетных id — переход с уровня **А** только на пресетах к уровню **Б** (эталон как `oak.ts`), иначе крафт и ENC теряют предсказуемость;
- заполненность **identity**, **physical/chemical/arcane/processing/economy**, **summary**, **description**, **discovery**, **icon**;
- согласованность **тегов** (ore, wood, …) с правилами отображения и будущими автомаппингами;
- наличие записи в **энциклопедии по умолчанию** или только через открытие — по геймдизайну;
- связь с **переработкой/крафтом** (если ресурс «должен жечься в горне» — рецепт и потребляемые id, не магический `ResourceKey`).

До завершения этой работы формально «ресурс в экспедиции» и «ресурс в системе знаний» совпадают по id, но **игровая полнота**, **материаловедение** и **учёт** — нет.

### 4.1. Техдолг и чеклист добываемых узлов (после переноса каталога)

**Первоисточник списка id и папок:** [`scripts/gather-material-config.mjs`](../scripts/gather-material-config.mjs) (`GATHER_MATERIAL_ORDER`, `GATHER_ID_TO_FOLDER`). Агрегатор каталога: [`world-resource-nodes.ts`](../src/data/materials/library/world-resource-nodes.ts).

#### Накопленный техдолг (ведётся здесь)

| ID | Тема | Суть | Целевое действие |
|----|------|------|-------------------|
| **TD-INV-1** | Агрегаты `ResourceKey` | Несколько рудных `materialId` сливаются в пул **`iron`** / **`mithril`** — расход по ключу, не строго 1:1 id. | **Режим A1:** осознанный пул — ок; контроль в [`inventory-check.test.ts`](../src/lib/craft/inventory-check.ts) («iron and mithril ore pools»). Отдельные ключи на каждый id — только при смене целевой модели (A2). |
| **~~TD-INV-2~~** | Маппинг | Бывшие **34** id закрыты волной **2026-04-01** ([`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md)); реестр ENC-only **пуст**. | Новые добываемые без маппинга — **TD-DOC-1** + при необходимости строка в [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts). |
| **~~TD-DATA-1~~** | ~~Роль vs топливо~~ | **Закрыто (2026-04-01):** у **`coal`**, **`ancient_coal`** — `WorldResourceRole` **`fuel`**, класс узла **`other`**, пресет физики/обработки как у органики-топлива; в экспедиционной фабрике роль **`fuel`** поддержана. Плавка: явный [`MATERIAL_PROCESS_OVERRIDES`](../src/data/materials/material-process-overrides.ts) → `smelt_fuel` (`source: explicit`). В **`weapon_craft_v2`** уголь не тело оружия (`class` не mineral/metal). | — |
| **TD-SEM-1** | Процессы | [`MATERIAL_PROCESS_OVERRIDES`](../src/data/materials/material-process-overrides.ts): **пилот** — топлива, канонические `*_ore` ядра и альтернативные руды (`refining_smelting`); прочие id — эвристики [`getMaterialProcessContribution`](../src/lib/materials/material-process-contribution.ts). | Расширять по мере фаз **C–D**; чеклист [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) §6.2. |
| **TD-DOC-1** | Синхронизация | Любой новый добываемый id требует правок сразу в нескольких местах. | При добавлении: `gather-material-config.mjs` → `refresh-gather-library.mjs`; при необходимости — мост [`world-resource-inventory-bridge.ts`](../src/lib/materials/world-resource-inventory-bridge.ts), [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md), строки ниже §4.1. |

#### Чеклист: маппинг на склад (`MaterialToResource`)

Слои: **`CORE`** — [`inventory-check.ts`](../src/lib/craft/inventory-check.ts) (`CORE_MATERIAL_TO_RESOURCE`); **`BRIDGE`** — [`world-resource-inventory-bridge.ts`](../src/lib/materials/world-resource-inventory-bridge.ts) (мержится под ядром, коллизии выигрывает ядро).

**Учитываются в горне / крафте v2 / лавке** — есть `ResourceKey` (все добываемые узлы; TD-INV-2 — [`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md)):

| materialId | Папка | ResourceKey | Слой |
|------------|-------|-------------|------|
| ancient_coal | fuels | `coal` | CORE |
| ancient_metal | metals | `ironIngot` | BRIDGE |
| ancient_sap | special | `wood` | BRIDGE |
| acorns | organics | `wood` | BRIDGE |
| ash_dust | organics | `coal` | BRIDGE |
| black_dust | organics | `coal` | BRIDGE |
| bog_iron | ores | `iron` | BRIDGE |
| bones | organics | `leather` | BRIDGE |
| clay | stones | `stone` | BRIDGE |
| coal | fuels | `coal` | CORE |
| cold_iron_ore | ores | `iron` | BRIDGE |
| cryo_fungi | organics | `wood` | BRIDGE |
| decayed_bones | organics | `leather` | BRIDGE |
| deep_clay | stones | `stone` | BRIDGE |
| depth_iron | ores | `iron` | BRIDGE |
| depth_stone | stones | `stone` | BRIDGE |
| dream_resin | organics | `wood` | BRIDGE |
| dragon_bone | special | `leather` | BRIDGE |
| dragon_glass | gems | `stone` | BRIDGE |
| dragon_scale | leathers | `leather` | BRIDGE |
| echo_bark | organics | `wood` | BRIDGE |
| echo_stone | gems | `stone` | BRIDGE |
| eternal_ice | special | `stone` | BRIDGE |
| fire_stone | gems | `stone` | BRIDGE |
| forest_moss | organics | `wood` | BRIDGE |
| frozen_crystals | gems | `stone` | BRIDGE |
| gold_ore | ores | `goldOre` | CORE |
| heart_of_flame | special | `coal` | BRIDGE |
| heart_of_the_mountain | special | `stone` | BRIDGE |
| living_ore | ores | `iron` | BRIDGE |
| memory_leaf | organics | `wood` | BRIDGE |
| mist_herbs | organics | `wood` | BRIDGE |
| mithril_ore | ores | `mithril` | CORE |
| moonstone_shards | gems | `stone` | BRIDGE |
| oak_bark | organics | `wood` | BRIDGE |
| peat | fuels | `coal` | BRIDGE |
| pine | woods | `wood` | CORE |
| pine_resin | organics | `wood` | BRIDGE |
| poison_gland | organics | `leather` | BRIDGE |
| primordial_amber | gems | `stone` | BRIDGE |
| primordial_ice | special | `stone` | BRIDGE |
| red_stone | stones | `stone` | BRIDGE |
| rotten_wood | woods | `wood` | BRIDGE |
| shadow_leather | leathers | `leather` | BRIDGE |
| silver_ore | ores | `silver` | CORE |
| silver_bark | organics | `wood` | BRIDGE |
| silvered_pine | woods | `wood` | BRIDGE |
| soulforge_ember | special | `coal` | BRIDGE |
| spirit_wood | woods | `wood` | BRIDGE |
| star_metal | ores | `mithril` | BRIDGE |
| sulfur | stones | `stone` | BRIDGE |
| swamp_moss | organics | `wood` | BRIDGE |
| toxic_moss | organics | `wood` | BRIDGE |
| void_crystal | gems | `stone` | BRIDGE |
| volcanic_glass | gems | `stone` | BRIDGE |
| whisper_moss | organics | `wood` | BRIDGE |
| wild_herbs | organics | `wood` | BRIDGE |

**Реестр ENC-only:** пуст ([`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts)); партиция — [`gatherable-enc-only.test.ts`](../src/lib/materials/gatherable-enc-only.test.ts).

**Правило сопровождения:** при любом новом добываемом id — мост, эта таблица, [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md), **TD-DOC-1** / **TD-SEM-4** по необходимости.

---

## 5. Фазы работ

**Текущее состояние выполнения по фазам** ведётся в **§8.1**; список сделанного с датами — **§8.2**.

Фазы упорядочены так, чтобы сначала стабилизировать **данные и контракты**, затем **инвентарь и кузницу**, затем **UI и экономику**.

### Синхронизация с [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md)

Два трека **не конкурируют**: смысловой слой (роли в плавке, топливо, керамика, …) опирается на **один и тот же `materialId`**, который списывает игра — то есть на результат **фаз 2–3** этого аудита. Обратно: реестр процессов и роли входов из семантики **подпирают проектирование фазы 3**, чтобы переработка не уехала в хардкод.

| Когда в работе по аудиту | Переключиться на семантику | Вернуться к аудиту |
|--------------------------|----------------------------|-------------------|
| **Фаза 0** (есть артефакты phase0) | Логично **параллельно** открыть семантику **фазу A**: реестр процессов и «какие id на каких цепочках» черпать из той же инвентаризации. | Зафиксировать в реестре процессов те же **стадии** и id, что §2.7 / фаза 3; не вводить роли, противоречащие ещё не мигрированным `ResourceKey`. |
| **Фазы 1–1b** | **Не обязательно**: универсальные поля `MaterialNode` — отдельный слой от процессных ролей. При желании **A** можно вести в фоне. | Продолжать контент и материаловедение по графику аудита; не путать **уровень Б** (§2.8) с заполнением `processContributions`. |
| **Фаза 2** (проектирование единого инвентаря) | Уместно начать семантику **фазу B** (типы + API со **старым поведением как фолбэк**), пока нет массовых данных ролей. | **Не** масштабировать семантику **C–D**, пока не ясно, **откуда и каким id** списывается сырьё в целевом store — иначе данные ролей разойдутся с фактическим расходом. |
| **Фаза 3** | **Основное окно** для семантики **C** (пилот на 1–2 процессах) и **D** (волны по каталогу): роли привязаны к реальному списанию `materialId`. | Сначала для каждого процесса выполнить критерии фазы 3 (1:1 id, без агрегатов), **затем** или **сразу параллельно** навешивать смысловые вклады — не наоборот. |
| **Фазы 4–7** | Семантика **фаза E** (инварианты, тесты контракта) стыкуется с **фазой 7** аудита и с витриной по `materialId` (**4–5**). | Магазин/UI не должны подменять семантикой отсутствие единого инвентаря (закрыть **2** прежде, чем документировать «можно купить = можно потратить в процессе P»). |

Ниже у каждой фазы аудита добавлена краткая пометка **«Семантика»** с отсылкой к фазам A–E того документа.

### Фаза 0 — Инвентаризация и критерии готовности

- **Артефакты:** [`MATERIALS_PHASE0_INVENTORY.md`](MATERIALS_PHASE0_INVENTORY.md), [`MATERIALS_PHASE0_INVENTORY.json`](MATERIALS_PHASE0_INVENTORY.json) — пересборка: `npm run materials:phase0` (скрипт [`scripts/generate-materials-phase0.ts`](../scripts/generate-materials-phase0.ts), логика [`src/lib/materials/phase0-inventory.ts`](../src/lib/materials/phase0-inventory.ts)).
- Зафиксировать список всех `materialId`, встречающихся в: экспедициях, рецептах, магазине, `resources`, `materialShopItems`, legacy `Material`.
- Отдельно выписать **все агрегирующие и двусмысленные ключи** (`iron`, `wood` как «и брёвна, и доски», и т.п.) и места, где форма стадии не различена — это список на устранение.
- Для каждого id и каждой стадии в цепочке (руда → слиток → …): статус узла в library (полный / заглушка), маппинг в `MATERIAL_TO_RESOURCE` (временный), откуда начисляется/куда списывается.
- **Критерий:** таблица «id / стадия → источники начисления → места расхода → пробелы»; нет одной строки инвентаря на две формы одного металла/дерева.
- **Семантика:** параллельно можно начать **фазу A** [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md): реестр процессов и допустимых ролей входа опирается на эту инвентаризацию; решения по процессам **не должны** ломать §2.7 до фазы 3.

### Фаза 1 — Контент: довести MaterialNode для экспедиционных ресурсов

- Для каждого world-resource / нового id: привести поля к стандарту [`MATERIALS_ADDING.md`](data/MATERIALS_ADDING.md); убрать пустые/дефолтные заглушки, где они маскируют непроработанность **в лоре и метаданных каталога** (`identity`, `summary`, `description`, `economy`, `discovery`, `icon`, теги).
- Допустимо опираться на **`buildWorldNode`** для **структурной** заполненности `physical` / `chemical` / `arcane` / `processing` (уровень **А**, §2.8), пока материал не попал в перечень фазы **1b** и не подключён к списанию в крафте.
- Синхронизировать **имена и описания** с тем, что ожидают тексты миссий (при необходимости править данные миссий, не второй «лор» в модуле).
- **Критерий:** `allMaterials` не содержит узлов «только для дропа» без описания и экономики; энциклопедия **читаема** для всех дропаемых id; инженерные поля либо осознанно на пресете роли, либо пройдены в фазе **1b**.
- **Семантика:** **не обязательна**; лор и `identity.tags` могут **подсказать** будущие роли (топливо, керамика), но заполнение процессного слоя (C–D) отложить до **фазы 3** и единого расхода по id.

### Фаза 1b — Материаловедение: эталонная проработка свойств

- **Цель:** для согласованного **списка приоритетов** (на основе фазы 0: дроп + крафт + переработка + ключевые цепочки; можно вести отдельный чек-лист в документации или флаг в артефакте инвентаризации) каждый узел довести до **уровня Б** (§2.8): как минимум **то же внимание к числам**, что у эталонов `library/woods/oak.ts` / `library/ores/iron_ore.ts` — ручной `MaterialNode` или эквивалентная явная калибровка всех секций, а не «дефолт средней органики/руды» без ревью.
- **Реализация (добываемые узлы):** централизованные оверлайды [`gather-material-science-overrides.ts`](../src/data/materials/library/gather-material-science-overrides.ts) подмешиваются в [`build-world-node.ts`](../src/data/materials/library/build-world-node.ts) после пресета роли; полнота набора id = весь [`worldResourceNodes`](../src/data/materials/library/world-resource-nodes.ts). Тесты: [`phase1b-material-science.test.ts`](../src/lib/materials/phase1b-material-science.test.ts), сбор приоритетов: [`phase1b-priority.ts`](../src/lib/materials/phase1b-priority.ts). «Ядро» библиотеки (металлы, отдельные руды/камни/древесина без `buildWorldNode`) по-прежнему задаётся полными файлами как эталоны.
- **Сверка:** для каждого такого id — сравнение с 2–3 соседями по `economy.tier` и роли; фиксация отклонений в комментарии у данных или в приложении к инвентаризации, если отклонение осознанное (уникальное свойство материала).
- **Критерий:** по завершении для множества приоритетов нет необоснованных пресетов; при появлении автоматических тестов (диапазоны, консистентность с классом) — они зелёные; любой материал, который **фаза 3** начинает списывать в переработке/крафте, **либо** уже прошёл **1b**, **либо** имеет явную пометку техдолга с дедлайном фазы 3.
- **Семантика:** универсальные оси (`physical` / …) и процессные **роли** — разные слои; **1b** не заменяет **B–D** семантики. Имеет смысл лишь не противоречить заявленным в **A** категориям входов (если реестр уже ведётся).

### Фаза 2 — Единый инвентарь количеств (архитектура store)

- Спроектировать **одну** структуру: например `inventory: Record<MaterialId, number>` или сохранить `resources` только для **явно нематериальных** сущностей (`gold`, `soulEssence`) + всё остальное по id каталога.
- Миграция сохранений: слить `materialStash` и количества из `resources`, согласовав конфликты (`iron` vs `iron_ore` — по правилам фазы 3).
- Обновить `guild-expedition-cross-slice`, рабочих, магазин, заказы — **одна** функция начисления/списания по id (или по нормализованному id).
- **Критерий:** после награды экспедиции тот же id увеличивается в том же объекте, который читает крафт.
- **Фаза 2 — итог интеграции (закрыта по текущим планам; экран подземелий не менялся — отдельный редизайн):** для материалов из [`MATERIAL_TO_RESOURCE`](../src/lib/craft/inventory-check.ts) проверка и списание объединяют **`resources` + `materialStash`**: [`getAvailableAmountForResourceKey`](../src/lib/craft/inventory-check.ts), [`applyCraftingCostSpend`](../src/lib/craft/inventory-check.ts), [`getRefiningCraftingCost`](../src/lib/craft/inventory-check.ts), [`canAffordCraftingCostWithStash`](../src/lib/craft/inventory-check.ts); в store — **`canAffordCraftingCostWithStash`**, **`spendCraftingCostWithStash`** ([`resources-slice.ts`](../src/store/slices/resources-slice.ts)); [`checkInventoryForCraft`](../src/lib/craft/inventory-check.ts) и UI планировщика получают stash. **`startRefiningWithResources` / `canRefine`** ([`game-store-composed.ts`](../src/store/game-store-composed.ts)) используют тот же контур. **Ремонт:** [`executeRepair`](../src/lib/store-utils/repair-utils.ts), [`repair-cross-slice.ts`](../src/store/cross-slice/repair-cross-slice.ts), [`repair-card.tsx`](../src/components/ui/repair-card.tsx). **Приход материалов:** [`getGrantTargetMaterialId`](../src/lib/craft/inventory-check.ts) + **`grantResourceKeyFromWorld`** — рабочие ([`use-game-loop.ts`](../src/hooks/use-game-loop.ts)), крафт/лавка, выход плавки, бонусы заказов → **`materialStash`** (золото / `soulEssence` только в `resources`). **Лавка:** [`removeResourceKeyFromPools`](../src/lib/craft/inventory-check.ts), **`sellResource`**, [`useFormattedResources`](../src/store/game-store-composed.ts), [`shop-screen.tsx`](../src/components/screens/shop-screen.tsx). **Миграция сейвов:** [`migrateLegacyMaterialResourcesToStash`](../src/lib/craft/inventory-check.ts) при подъёме persist **`STORE_VERSION` = 2** ([`game-store-composed.ts`](../src/store/game-store-composed.ts)); облако — поле **`materialStash`** + та же миграция при загрузке ([`use-cloud-save.ts`](../src/hooks/use-cloud-save.ts), `saveVersion` 4, [`save-payload-schema.ts`](../src/lib/save-payload-schema.ts)). Уголь каталога: `coal` / `ancient_coal` → `coal`. **Целевая модель «только `MaterialId` без `ResourceKey` для сырья»** — **фаза 3** (§3).
- **Семантика:** после стабилизации **целевой** схемы store уместно начать **фазу B** (типы + единая функция вклада материала в процесс со **строгим фолбэком на текущее поведение**). Массовое заполнение ролей (**D**) — **после** того, как ясно, какие id реально списываются в каких экранах; иначе смысловые данные уйдут в сторону от факта.

### Фаза 3 — Правила сырья, переработка и крафт

#### 3.0. Целевая архитектура завершения фазы 3 (зафиксировано 2026-04-01)

**Вариант A1 (мягкий финиш):** сохраняем **`ResourceKey`** и [`MATERIAL_TO_RESOURCE`](../src/lib/craft/inventory-check.ts) как слой агрегации для кузницы; расход по-прежнему через мост **`resources` + `materialStash`**. Цели закрытия фазы 3 при A1:

- убрать **двусмысленность** внутри ключей (руда vs слиток — уже **3.2**; дерево/кожа — отдельные проходы);
- **документировать пулы** руды (**TD-INV-1**) и тестами;
- для добываемых id **без** маппинга — явный реестр **ENC-only** (**TD-INV-2**): [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts) + партиция в CI ([`gatherable-enc-only.test.ts`](../src/lib/materials/gatherable-enc-only.test.ts)). **По состоянию на 2026-04-01:** реестр **пуст** (все узлы мапятся); новые немапящиеся id — **TD-DOC-1**.

**Вариант A2** (единый счётчик по `materialId`, `ResourceKey` только валюта) — **не** входит в текущую итерацию; возможен позже с миграцией persist / облака.

**Семантика:** после стабилизации маппинга для процесса расширять **C–D** и инварианты **E**; порядок — см. таблицу синхронизации выше в §5.

- **Пилот 3.1 (код):** единая таблица **`REFINING_INPUT_STAGE_MATERIAL_ID`** в [`refining-recipes.ts`](../src/data/refining-recipes.ts); канонические руды в stash; маппинг `iron_ore` → `iron` (`ResourceKey` **только руда** для плавки); миграция алиасов stash; см. журнал §8.2.
- **Пилот 3.2 — развод руды и слитка (`iron` / цветмет / золото / мифрил):** в [`MATERIAL_TO_RESOURCE`](../src/lib/craft/inventory-check.ts) каталожный металл **`iron` / `copper` / … / `mithril`** (крафт v2, клинок «железо») мапится на **`*Ingot`**, а `*_ore` остаются на ключах **руды** (`iron`, `copper`, …); сплавы в **`ALLOY_RECIPES`** расходуют слитки; ремонт ([`repair-utils.ts`](../src/lib/store-utils/repair-utils.ts)) и тесты синхронизированы; **[`STORE_VERSION` 4**](../src/store/game-store-composed.ts); в [`material-shop.ts`](../src/data/material-shop.ts) — позиция **`ironIngot`** для покупки слитка и копирайт «руда vs слиток». Дерево/кожа/камень при A1 — **§2.7.1**; смена модели — отдельный проход с миграцией.
- **Материаловедение:** для каждого `materialId`, который **участвует в списании** при переработке или финишном крафте, свойства узла должны быть **ревьюнуты** (итог фазы **1b**), иначе формулы и баланс опираются на случайные пресеты; см. §2.8.
- Устранить агрегаты: **рудник / экспедиция / магазин** выдают id **рудной стадии** (`iron_ore`, …); **плавка** переводит в id **слитка/металла**; крафт лезвия списывает **металл/слиток**, а не руду напрямую (если не заложен особый рецепт). Аналогично для дерева, камня, кожи и остальных цепочек в проекте.
- Каждая цепочка стадий описана в данных: таблица переработки / рецепты (`ore → ingot`, `log → planks`, …) без схлопывания в один `ResourceKey`.
- Заменить жёсткий `MATERIAL_TO_RESOURCE` на правило из данных: **по возможности 1:1** «выбранный в планировщике `materialId` → списание того же id»; где нужен сплав — раскрытие по **рецепту сплава** из данных, а не свёртка «любое дерево → `wood`» без указания, брёвна это или доски (целевой вариант — разные id и явный расход).
- Для легаси-маппинга типа «`birch` → `wood`» запланировать замену на трактовку **брёвен породы vs доски** (отдельные узлы/стадии), если в дизайне дерево в крафте — не абстрактная масса.
- **Критерий:** нет ключей в инвентаре, смешивающих две формы одного материала; `getCraftingCost` и экспедиция оперируют одними и теми же id стадий; нет «немых» `console.warn('Unknown material')` для каталожных id.
- **Семантика:** **главное окно** для **C–D**: для каждого переведённого процесса задавать роли и вклад материалов поверх уже корректного списания id. Если процесс ещё на `ResourceKey` — сначала довести критерий фазы 3 для этого контура, **затем** вешать семантику; обратный порядок ведёт к рассинхрону данных и UI.

### Фаза 4 — Магазин и цены

- Вывести витрину из каталога или единого «торгового оверлея» (цена, доступность) с привязкой к `materialId`; минимизировать дубли имён в `material-shop.ts`.
- **Критерий:** изменение имени/редкости в `MaterialNode` не требует ручного дубля в магазине (кроме исключений).
- **Семантика:** витрина по `materialId` (критерий аудита) должна согласовываться с тем, что id **можно потратить** в процессах с явными ролями; при необходимости подсветки ролей в UI — опираться на тот же контракт, что **фаза B** семантики.

### Фаза 5 — UI склада, иконки, энциклопедии

- Склад: для каждой позиции использовать **icon из `MaterialNode`** (или единый fallback), убрать рассинхрон имён stash vs каталог.
- `resource-icon.tsx`: либо маппинг id каталога → PNG, либо единый компонент «иконка материала» из поля узла.
- Энциклопедия: убедиться, что фильтры/категории покрывают новые классы (herb, ore и т.д.) и что **все** получаемые в игре материалы либо открываются через дроп, либо осознанно скрыты до условия.
- **Критерий:** игрок видит один и тот же название и значок в ENC, на складе и в тултипах крафта.
- **Семантика:** отображение «роль в переработке» в ENC/тултипах — опционально и **после** стабильных данных **C–D**; не подменяет закрытие фаз **2–3** по учёту.

### Фаза 6 — Экспертиза и метрики

- Проверить пороги знаний для новых материалов; `discoverMaterial` при начислении лута согласован с отображением в ENC.
- При необходимости связать прирост экспертизы с **фактическим расходом** id (не только дроп).
- **Критерий:** нет материалов с количеством > 0 в едином инвентаре, но без записи знаний, если по дизайну они «должны быть известны».
- **Семантика:** привязка роста экспертизы к **расходу** id усиливает ценность процессных ролей; вводить после того, как расход в **фазе 3** идёт по каноническому `materialId`.

### Фаза 7 — Тесты, сохранения, облако

- Юнит-тесты: начисление экспедиции → списание крафтом для выборочных цепочек (руда, дерево, сплав).
- Миграция persist / cloud-save: новая схема полей ([`AGENTS.md`](../AGENTS.md) — `cloud-save-feature.ts`).
- **Критерий:** CI зелёный; старые сейвы поднимаются или версионируются.
- **Семантика:** **фаза E** (инварианты: «id участвует в процессе P ⇒ задан вклад или зарегистрирован фолбэк») логично включить в CI рядом с тестами цепочек «экспедиция → списание»; см. [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md).

---

## 6. Риски и зависимости

- **Семантика ключей:** после **3.2** ключ `iron` на складе = **руда** (плавка, те же `RawResource`); крафт клинка по узлу **`iron`** тратит **`ironIngot`** (+ stash `iron_alloy` и т.д.). Оставшийся техдолг — дерево/кожа/совмещение `ResourceKey` и чистый `materialId` (§3 далее).
- **Имена в библиотеке:** если узел `iron` исторически означал «металл», а не руду, документировать и при необходимости **переименовать id** (например `iron_ingot`) для ясности в коде и Save; перенос рефов по репозиторию.
- **Объём правок:** затронуты store, крафт, рабочие, магазин, UI, сохранения — фазы 2–3 критичны по порядку.
- **Баланс:** разделение стадий и единый инвентарь меняют темп прогрессии (нужна плавка перед крафтом металла) — калибровка дропа, цен, времени переработки.

---

## 7. Краткий чеклист «одинаковые ресурсы везде»

| Место | Сейчас | После унификации |
|-------|--------|------------------|
| Энциклопедия | `MaterialNode` | Каждая **стадия** — свой узёл; без смешения руды и слитка в одной карточке |
| Экспедиции (награда) | `materialStash[id]` | Тот же `id` в общем инвентаре; дроп **в форме сырья** (руда, брёвна, …), не «металл сразу», если так задумано лором |
| Кузница (проверка/списание) | `resources` + маппинг; **v2, плавка, ремонт:** stash + resources для id из `MATERIAL_TO_RESOURCE` (§5 фаза 2, прогресс 2.1) | Тот же инвентарь + **тот же id стадии**, что в ENC; сплавы/слитки — отдельные id |
| Переработка (рецепты `refining-recipes`) | **`resources` + stash** по `MATERIAL_TO_RESOURCE` при старте из store (прогресс 2.1); workers / стадии — по-прежнему отдельно | Явные цепочки **руда → слиток**, **брёвна → доски**, … с отдельными id на каждом шаге |
| Магазин | `ResourceKey` | Позиция = конкретный `materialId` стадии (руда продаётся как руда, слиток — как слиток) |
| Рабочие / закупки / плавка (не подземелья) | через **`grantResourceKeyFromWorld`** → `materialStash` + миграция legacy из `resources` | В фазе **3** — начисление только каноническим `materialId` стадии |
| Экспертиза | `materialId` | Отдельная экспертиза там, где отдельные стадии (руда и слиток — разные записи, если обе открываются) |
| Материаловедение (§2.8) | Часто только пресет `buildWorldNode` | Для приоритетных id — эталон **Б** (как `oak.ts`); для списываемых в фазе 3 — обязательно до подключения к крафту |
| Параметры для калькулятора крафта | `getMaterialAsLegacy`: формулы от `MaterialNode` (§2.9) | Тот же единый путь; при появлении правил «не из формулы» — поля узла или таблицы; без расходящегося legacy-каталога |
| Уникальные правила крафта (исключения) | Не моделируются в типе узла | Явные данные в схеме или модификаторах; см. §2.9 |

---

## 8. Статус фаз и журнал выполненных работ

**Правило ведения:** при закрытии этапа или существенном PR обновляйте **сводку §8.1** (статус + краткий комментарий) и добавляйте запись в **журнал §8.2** (дата ISO, фаза, что сделано, ссылки на файлы/PR по желанию). Статусы: `не начата` · `в работе` · `частично` · **`выполнена`**.

### 8.1. Сводка по фазам

| Фаза | Статус | Комментарий |
|------|--------|-------------|
| **0** — инвентаризация | **выполнена** | Артефакты [`MATERIALS_PHASE0_INVENTORY.md`](MATERIALS_PHASE0_INVENTORY.md) / [`.json`](MATERIALS_PHASE0_INVENTORY.json); `npm run materials:phase0`; [`scripts/generate-materials-phase0.ts`](../scripts/generate-materials-phase0.ts); [`src/lib/materials/phase0-inventory.ts`](../src/lib/materials/phase0-inventory.ts); тесты phase0. |
| **1** — контент `MaterialNode` (лор/метаданные) | **выполнена** | Для **всего** [`allMaterials`](../src/data/materials/library/index.ts): пороги полноты `summary.basic` / `description` и диапазон `economy` закреплены в [`src/lib/materials/phase1-catalog-content.test.ts`](../src/lib/materials/phase1-catalog-content.test.ts) (константы — [`phase1-content-thresholds.ts`](../src/lib/materials/phase1-content-thresholds.ts)); экспедиционный лут дублируется в [`expedition-material-content.test.ts`](../src/lib/materials/expedition-material-content.test.ts). Синхронизация копирайта миссий — по мере правок имён в библиотеке. **Не входит в фазу 1:** эталон **Б** материаловедения (§2.8) — это **фаза 1b**. |
| **1b** — материаловедение (уровень Б, §2.8) | **выполнена** (добываемые узлы) | Для всех узлов `worldResourceNodes`: явные оверлайды [`gather-material-science-overrides.ts`](../src/data/materials/library/gather-material-science-overrides.ts) + CI [`phase1b-material-science.test.ts`](../src/lib/materials/phase1b-material-science.test.ts). Ядро библиотеки — отдельные полные `MaterialNode`. Уточнение чисел под формулы крафта после фазы 3 — отдельный проход. |
| **2** — единый инвентарь store | **выполнена** (контур интеграции) | Мост stash ↔ расход/приход, лавка, **migrateLegacyMaterialResourcesToStash** + persist v2 + облако `materialStash`. Искл.: подземелья. Физически один объект `Record<MaterialId>` без дубля `resources` для сырья — **фаза 3**. |
| **3** — стадии, переработка, крафт без агрегатов | **выполнена** (контур **A1**) / **частично** (идеал §5) | **§3.0 A1:** **3.1–3.2**, **TD-INV-2**, пулы, мост, планировщик — см. **§0 «Фаза 3 — остаток»**. Не закрыто как «идеал фазы 3» из §5: правило списания из данных вместо ручного `MATERIAL_TO_RESOURCE` (граница A2); интеграционные тесты цепочки (часть переносится в фазу **7**). |
| **4** — магазин из каталога | **частично** | Цены/категории в данных; **отображаемое имя и emoji** витрины из `MaterialNode` через [`material-shop.ts`](../src/data/material-shop.ts). Полный оверлей цен по каждому `materialId` без дубля `materialShopItems` — нет. |
| **5** — UI склада / иконки / ENC | **выполнена** | [`MaterialDisplayIcon`](../src/components/ui/material-display-icon.tsx); склад — каталог + [`getGrantTargetMaterialId`](../src/lib/craft/inventory-check.ts) [`resources-screen.tsx`](../src/components/screens/resources-screen.tsx); карточки ENC — [`material-card.tsx`](../src/components/encyclopedia/material-card.tsx); фильтры **Травы** / **Топливо** + [`encyclopedia.ts`](../src/data/materials/encyclopedia.ts). |
| **6** — экспертиза и метрики | **выполнена** | `discoverMaterial` при `addMaterialToStash` / `grantResourceKeyFromWorld`; прирост экспертизы по формуле **use** при списании через `spendCraftingCostWithStash` и `sellResource` (`computePoolSpendDeltas`, `useMaterialAmount`); синхронизация ENC со stash при **persist merge** и **cloud `applyLoadedData`**. |
| **7** — тесты цепочек, сейвы, облако | **выполнена** | Интеграция store: [`materials-phase7-store-chain.test.ts`](../src/store/materials-phase7-store-chain.test.ts) (руда / дерево / сплав → `spendCraftingCostWithStash`); чистые цепочки — [`expedition-inventory-chain.test.ts`](../src/lib/materials/expedition-inventory-chain.test.ts); семантика **E** — [`material-process-contract.test.ts`](../src/lib/materials/material-process-contract.test.ts). **`activeRefining`** в Zustand `partialize` + нормализация при загрузке [`mergeActiveRefiningFromSave`](../src/lib/save-craft-normalize.ts) в persist `merge` и [`use-cloud-save.ts`](../src/hooks/use-cloud-save.ts). |

### 8.2. Журнал (хронология, новые записи сверху)

| Дата | Фаза | Сделано |
|------|------|---------|
| 2026-04-01 | **семантика D** | Закрытие моста **§4.1** в [`MATERIAL_PROCESS_OVERRIDES`](../src/data/materials/material-process-overrides.ts): `weapon_craft_v2` для `clay`, `deep_clay`, `depth_stone`, `red_stone`, `sulfur`, самоцветов моста, `dragon_scale`; Vitest [`material-process-contribution.test.ts`](../src/lib/materials/material-process-contribution.test.ts); [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) **§0** / **§6.2** / журнал **§5**. |
| 2026-04-01 | **7** | Тесты цепочки stash → списание: [`materials-phase7-store-chain.test.ts`](../src/store/materials-phase7-store-chain.test.ts); **`mergeActiveRefiningFromSave`**, Vitest [`save-craft-normalize.test.ts`](../src/lib/save-craft-normalize.test.ts); persist **`activeRefining`** [`game-store-composed.ts`](../src/store/game-store-composed.ts); облако [`use-cloud-save.ts`](../src/hooks/use-cloud-save.ts); чеклист [`cloud-save-feature.ts`](../src/lib/cloud-save-feature.ts). |
| 2026-04-01 | **6** | Открытие знаний при приходе в stash: [`resources-slice.ts`](../src/store/slices/resources-slice.ts); расход → **useMaterialAmount** [`encyclopedia-slice.ts`](../src/store/slices/encyclopedia-slice.ts); дельты пулов [`inventory-check.ts`](../src/lib/craft/inventory-check.ts); загрузка: [`game-store-composed.ts`](../src/store/game-store-composed.ts) persist merge, [`use-cloud-save.ts`](../src/hooks/use-cloud-save.ts); `createDiscoveredMaterialKnowledge` [`knowledge.ts`](../src/types/materials/knowledge.ts); Vitest [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts), [`encyclopedia-slice.test.ts`](../src/store/slices/encyclopedia-slice.test.ts). |
| 2026-04-01 | **5** | Единый значок материала [`MaterialDisplayIcon`](../src/components/ui/material-display-icon.tsx); склад: имена/иконки через каталог и `getGrantTargetMaterialId` [`resources-screen.tsx`](../src/components/screens/resources-screen.tsx); ENC: [`material-card.tsx`](../src/components/encyclopedia/material-card.tsx); категории `herbs` / `fuels` в [`material-core.ts`](../src/types/materials/material-core.ts), группировка [`encyclopedia.ts`](../src/data/materials/encyclopedia.ts); Vitest [`material-display-category.test.ts`](../src/types/materials/material-display-category.test.ts). |
| 2026-04-01 | **3 (TD-INV-2 закрыт)** | Волна снятия **34** id с ENC-only: мост [`world-resource-inventory-bridge.ts`](../src/lib/materials/world-resource-inventory-bridge.ts), реестр [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts) пуст, **TD-SEM-4** в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts), таблица [`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md), §4.1 / [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md) / [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md); Vitest [`gatherable-enc-only.test.ts`](../src/lib/materials/gatherable-enc-only.test.ts), [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts). |
| 2026-04-03 | **3 (A1)** | **§2.7.1:** фиксация пулов wood/leather/stone при A1; **TD-INV-2** — подтверждение заморозки в §4.1; планировщик: [`canCatalogMaterialSpendInForgeCraft`](../src/lib/craft/inventory-check.ts), фильтр [`PartMaterialSelector`](../src/components/forge/craft-v2/planner/PartMaterialSelector.tsx), [`forgeSpendBlockReason`](../src/lib/craft/inventory-check.ts) в `checkInventoryForCraft` / [`MaterialsCheck`](../src/components/forge/craft-v2/planner/MaterialsCheck.tsx); чеклист **TD-DOC-1** в [`MATERIALS_ADDING.md`](data/MATERIALS_ADDING.md). |
| 2026-04-02 | **3 + семантика C/D/E (часть) + 4–5–7 (часть)** | Пулы **wood/leather/stone** (тесты [`inventory-check.test.ts`](../src/lib/craft/inventory-check.ts)); явные предупреждения крафта ([`inventory-check.ts`](../src/lib/craft/inventory-check.ts)); **TD-INV-2** политика заморозки (**§4.1**, [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts)); пилот **C**: `oreChargeEfficiency`, `computeRefiningSmeltingOutputMultiplier`, выход слитка в [`game-store-composed.ts`](../src/store/game-store-composed.ts) / [`craft-slice.ts`](../src/store/slices/craft-slice.ts); волна **D** оверрайдов `weapon_craft_v2` в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts); черновик **E** — [`material-process-contract.test.ts`](../src/lib/materials/material-process-contract.test.ts); лавка из каталога ([`material-shop.ts`](../src/data/material-shop.ts)); склад stash-glyph ([`resources-screen.tsx`](../src/components/screens/resources-screen.tsx)); `leather` в [`resource-icon.tsx`](../src/components/ui/resource-icon.tsx); тесты цепочек [`expedition-inventory-chain.test.ts`](../src/lib/materials/expedition-inventory-chain.test.ts). Карта и **FORMULAS** дополнены под плавку. |
| 2026-04-02 | **документ** | Синхронизация **§0**, **§8.1**, бэклог §0, журнал §8.2; [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) §0 / §5 / §6. |
| 2026-04-01 | **документ** | **§0:** сводка «сделано / осталось» по фазе 3 и смежным задачам; обновлена шапка. Параллельно — [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) **§0** и уточнение **TD-SEM-4** (**§6.1**). |
| 2026-04-01 | **3** (план + A1) | **§3.0:** зафиксирован мягкий финиш **A1**; [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts) — реестр **34** id (**TD-INV-2**), Vitest партиции с `worldResourceNodes`; тесты пулов **`iron`** / **`mithril`** (**TD-INV-1**) в [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts). |
| 2026-04-01 | **семантика B** | **TD-DATA-1 закрыт:** `WorldResourceRole` **`fuel`**, угли в данных и [`expedition/factory.ts`](../src/data/materials/library/expedition/factory.ts); явные оверрайды плавки в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts); тесты [`material-process-contribution.test.ts`](../src/lib/materials/material-process-contribution.test.ts); §4.1 / [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) §6.2. |
| 2026-04-01 | **документ** | **§4.1:** техдолг после переноса каталога (TD-INV/DATA/DOC/SEM), чеклист **23** id с `ResourceKey` и **34** без маппинга; перекрёстные ссылки с [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md) §6. |
| 2026-04-01 | **документ** | Единая карта для разработчиков: [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md) (Mermaid + таблицы + сопровождение); ссылки из [`README.md`](README.md), [`AGENTS.md`](../AGENTS.md), шапка этого аудита. |
| 2026-04-01 | **3** (лавка) | [`material-shop.ts`](../src/data/material-shop.ts): все слитки (`ironIngot` … `mithrilIngot`), **доски** (`planks`), **каменные блоки** (`stoneBlocks`), выровненные описания руд; тест [`material-shop.test.ts`](../src/data/material-shop.test.ts). |
| 2026-04-01 | **3** (3.2) | Развод пула: **`MATERIAL_TO_RESOURCE`** — металл `iron`/`copper`/… → `*Ingot`, руда `*_ore` → ключи руды; **`ALLOY_RECIPES`** на слитках; ремонт по `ironIngot`; Vitest (inventory-check, repair-utils, material-sorting); **`STORE_VERSION` 4**; лавка **`ironIngot`**. |
| 2026-04-01 | **3** (пилот 3.1) | Канонические id руд в начислениях и stash: [`REFINING_INPUT_STAGE_MATERIAL_ID`](../src/data/refining-recipes.ts), [`getGrantTargetMaterialId`](../src/lib/craft/inventory-check.ts), маппинг `iron_ore` / `gold_ore` / … в [`MATERIAL_TO_RESOURCE`](../src/lib/craft/inventory-check.ts), нормализация легаси-ключей в [`migrateLegacyMaterialResourcesToStash`](../src/lib/craft/inventory-check.ts), **`STORE_VERSION` 3** ([`game-store-composed.ts`](../src/store/game-store-composed.ts)). Vitest — [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts). |
| 2026-04-01 | **2** (Turso / API) | Персист **`materialStash`** на сервере: колонка через `ensureGameSavesColumns` в [`db.ts`](../src/lib/db.ts); POST/GET — `formatSaveData`, `validateSaveData` (`normalizeMaterialStashPayload`), INSERT/UPDATE/`createNewSave` в [`route.ts`](../src/app/api/save/route.ts); модель [`prisma/schema.prisma`](../prisma/schema.prisma). Клиентский payload больше не теряет склад при синхронизации. |
| 2026-04-01 | **2** (закрытие) | **Миграция:** `migrateLegacyMaterialResourcesToStash`, `STORE_VERSION` 2 + `migrate` в [`game-store-composed.ts`](../src/store/game-store-composed.ts); `materialStash` в облачном payload / [`applyLoadedData`](../src/hooks/use-cloud-save.ts), `saveVersion` 4, Zod [`save-payload-schema.ts`](../src/lib/save-payload-schema.ts). Тесты — [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts). Подземелья не трогались (отдельный редизайн). |
| 2026-04-01 | **2.1** | **Начисления в stash** (`getGrantTargetMaterialId`, `grantResourceKeyFromWorld`) и **лавка:** продажа/UI — `removeResourceKeyFromPools`, `sellResource`, `useFormattedResources`, [`shop-screen.tsx`](../src/components/screens/shop-screen.tsx). Рабочие — [`use-game-loop.ts`](../src/hooks/use-game-loop.ts); крафт — [`craft-container.tsx`](../src/components/forge/craft-v2/craft-container.tsx); плавка/заказы — [`game-store-composed.ts`](../src/store/game-store-composed.ts), [`order-cross-slice.ts`](../src/store/cross-slice/order-cross-slice.ts). |
| 2026-04-01 | **2.1** (часть фазы **2**) | Ремонт оружия: `executeRepair(..., materialStash)`, `getRepairOptionCraftingCost`, списание через `spendCraftingCostWithStash` в [`repair-cross-slice.ts`](../src/store/cross-slice/repair-cross-slice.ts); доступность в [`repair-card.tsx`](../src/components/ui/repair-card.tsx). Тесты — [`repair-utils.test.ts`](../src/lib/store-utils/repair-utils.test.ts). |
| 2026-04-01 | **2.1** (часть фазы **2**) | Переработка: `getRefiningCraftingCost`, `canAffordCraftingCostWithStash` в slice; `startRefiningWithResources` / `canRefine` в [`game-store-composed.ts`](../src/store/game-store-composed.ts) списывают через `spendCraftingCostWithStash` (тот же мост stash ↔ `ResourceKey`, что у крафта v2). Тесты — [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts). Реестр семантики `refining_smelting` — см. [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md). |
| 2026-04-01 | **2.1** (часть фазы **2**) + семантика | Крафт v2: `getAvailableAmountForResourceKey`, `applyCraftingCostSpend`, `spendCraftingCostWithStash`; `checkInventoryForCraft(..., materialStash)`; планировщик и селектор материалов учитывают stash; маппинг `coal`/`ancient_coal`. Тесты в [`inventory-check.test.ts`](../src/lib/craft/inventory-check.test.ts). Семантика: крафт по-прежнему расходует `ResourceKey`, но лут экспедиций по каталожным id из маппинга **реально тратится** — задел под **C** (`weapon_craft_v2`). |
| 2026-04-01 | семантика **A/B** | Реестр процессов, типы [`material-process.ts`](../src/types/materials/material-process.ts), [`getMaterialProcessContribution`](../src/lib/materials/material-process-contribution.ts) — см. [`MATERIAL_SEMANTIC_PROCESS_ROLES.md`](MATERIAL_SEMANTIC_PROCESS_ROLES.md). |
| 2026-04-02 | **1b** | Централизованные оверлайды материаловедения для всех world-resources; merge в `buildWorldNode`; [`phase1b-priority.ts`](../src/lib/materials/phase1b-priority.ts), [`phase1b-material-science.test.ts`](../src/lib/materials/phase1b-material-science.test.ts). |
| 2026-04-02 | **1** | Полный охват каталога: тест `phase1-catalog-content.test.ts` на все `allMaterials`; общие пороги `phase1-content-thresholds.ts`; рефакторинг `expedition-material-content.test.ts` на те же константы. |
| 2026-04-02 | документ | В аудит добавлены §2.8 (материаловедение), фаза **1b**, уточнения фаз **1** и **3**; введены §8.1–8.2 для статуса и журнала. |
| 2026-04-01 | **1** (и смежный контент) | Доведены тексты и пороги для id из экспедиционного лута; доработан [`build-world-node.ts`](../src/data/materials/library/build-world-node.ts) (дефолты лора); расширены описания в подпапках добываемых материалов; добавлен/прокачан [`expedition-material-content.test.ts`](../src/lib/materials/expedition-material-content.test.ts); синхронизация имён в комментариях миссий (`misty-lowlands`, `red-stone-mines`, `rotten-swamp` gather). |
| 2026-04-01 | **структура** | Каталог добычи: узлы перенесены из `world-resources/` в типовые папки `library` + [`world-resource-nodes.ts`](../src/data/materials/library/world-resource-nodes.ts), конфиг [`gather-material-config.mjs`](../scripts/gather-material-config.mjs), refresh/split скрипты. |
| ≤ 2026-04-01 | **0** | Зафиксирована инвентаризация: отчёты phase0, генератор, библиотечная логика инвентаризации и тесты (см. §5 фаза 0). |

---

*Правки целевой модели и критериев фаз — по мере реализации. **Статус выполнения и фактические работы — §8.***
