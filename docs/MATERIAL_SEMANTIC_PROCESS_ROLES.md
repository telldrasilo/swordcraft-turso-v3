# Смысловая модель материалов: роли в процессах

**Последнее обновление:** 2026-04-01 — **фаза D:** явные `weapon_craft_v2` для камней/гемов/`dragon_scale` моста [**§4.1** аудита](MATERIALS_UNIFICATION_AUDIT.md); синхронизация с аудитом **§8** (фазы **6–7**); **§0** — актуальный бэклог. **2026-04-02:** пилот **C**, ранняя волна **D** (деревья моста / `ancient_metal` / `shadow_leather`), черновик **E** — [`material-process-contract.test.ts`](../src/lib/materials/material-process-contract.test.ts). Отдельного `MaterialProcessKind` для ремонта в реестре §4 пока нет.

Документ задаёт **принципы** и **фазы работ**, на которые можно опираться при переработке каталога материалов так, чтобы ресурсы отличались не только числами в `physical` / `chemical` / …, а **концептуально** — через участие в игровых **процессах** (плавка, обжиг, пропитка, как топливо, как носитель магии и т.д.).

**Связанные документы:**

- Унификация инвентаря и стадий сырья: [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md) (**§0** — сводка сделано/осталось); **карта `materialId` ↔ склад** — [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md)
- Чеклист полей `MaterialNode`: [`data/MATERIALS_ADDING.md`](data/MATERIALS_ADDING.md)
- Типы: [`src/types/materials/material-core.ts`](../src/types/materials/material-core.ts)

---

## 0. Сводка: семантика — сделано и осталось

### Сделано

| Элемент | Состояние |
|---------|-----------|
| **Фаза A** | Реестр процессов в **§4**: `weapon_craft_v2`, `refining_smelting`; привязка к коду (`inventory-check`, `refining-recipes`, store). |
| **Фаза B** | Типы [`material-process.ts`](../src/types/materials/material-process.ts); единая точка [`getMaterialProcessContribution`](../src/lib/materials/material-process-contribution.ts); тесты [`material-process-contribution.test.ts`](../src/lib/materials/material-process-contribution.test.ts). |
| **Пилот оверрайдов (TD-SEM-1 часть)** | [`MATERIAL_PROCESS_OVERRIDES`](../src/data/materials/material-process-overrides.ts): топлива (`smelt_fuel`), канонические `*_ore` и альтернативные/редкие руды (`smelt_ore_charge`); остальное — эвристики по тегам / `identity.class`. |
| **TD-DATA-1 / TD-SEM-2 (уголь)** | Роль **`fuel`** в данных; явные фасеты плавки; в **`weapon_craft_v2`** уголь не тело оружия. |
| **§6.2 чеклист** | Строки для углей, торфа, руд, мостовых материалов, gems, органики — помечены **Готово** или «ок до процесса C»; после волны **D** уточнены `pine`, `rotten_wood`, `ancient_metal`, … — см. **§6.2**. |
| **Связка с аудитом 3 (A1)** | Реестр немапящихся id — [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts) (**пуст** после TD-INV-2); новые id без маппинга — **TD-DOC-1** + **TD-SEM-4** при подключении к расходу. |
| **Фаза C (пилот, плавка)** | `oreChargeEfficiency` в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts); `getRefiningOreChargeEfficiency` в [`material-process-contribution.ts`](../src/lib/materials/material-process-contribution.ts); `computeRefiningSmeltingOutputMultiplier` в [`inventory-check.ts`](../src/lib/craft/inventory-check.ts); при завершении плавки — `Math.floor(output * smeltingOutputMultiplier)` в [`game-store-composed.ts`](../src/store/game-store-composed.ts), поле в [`craft-slice.ts`](../src/store/slices/craft-slice.ts) (`ActiveRefining.smeltingOutputMultiplier`). |
| **Фаза D (мост §4.1, 2026-04-01)** | Помимо ранее волны **D** (`pine`, `rotten_wood`, …, `ancient_metal`, `shadow_leather`, TD-INV-2 wood/leather/coal): явные **`weapon_craft_v2`** для камней моста (`clay`, `deep_clay`, `depth_stone`, `red_stone`, `sulfur` → `weapon_body_mineral`), самоцветов моста (`dragon_glass`, `echo_stone`, … → `weapon_inlay_gem`), `dragon_scale` → `weapon_grip_leather` — [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts), тесты [`material-process-contribution.test.ts`](../src/lib/materials/material-process-contribution.test.ts). Хвост **D** вне добываемого моста — см. «Осталось». |
| **Фаза E (частично)** | Контракт плавки/топлива — [`material-process-contract.test.ts`](../src/lib/materials/material-process-contract.test.ts). Цепочки **«приход в stash → списание»** в CI — [`materials-phase7-store-chain.test.ts`](../src/store/materials-phase7-store-chain.test.ts) + чистые проверки [`expedition-inventory-chain.test.ts`](../src/lib/materials/expedition-inventory-chain.test.ts) (**аудит фаза 7**). Остаётся: явные инварианты по **ремонту** и по всем id **weapon_craft_v2** с расходом; опционально процесс ремонта в реестре §4. |

### Осталось сделать

| Элемент | Что именно |
|---------|------------|
| **Фаза C (расширение)** | Другие процессы по мере геймдизайна; **UI крафта** — тултипы ролей через `getMaterialProcessContribution` **без** смены формулы списания. |
| **Фаза D** | **Мост.world-resource + §6.2:** явные оверрайды закрыты (**2026-04-01**). Дальше — id **вне** таблицы добываемых узлов в **§4.1** аудита, новые процессы (керамика/флюс в реестре §4), добивка по мере рецептов. |
| **TD-SEM-1** | Расширять [`MATERIAL_PROCESS_OVERRIDES`](../src/data/materials/material-process-overrides.ts) при новых списаниях. |
| **TD-SEM-3** | Следующий шаг после `oreChargeEfficiency`: при необходимости время плавки / отдельные **params** (см. **§6.1**). |
| **TD-SEM-4** | При подключении добываемого id к расходу: оверрайды + тесты (**аудит §4.1**). Волна **34** id закрыта **2026-04-01** ([`ENC_TD_INV2_WAVE_TABLE.md`](data/ENC_TD_INV2_WAVE_TABLE.md)). |
| **Фаза E** | Расширить контракт и тесты на **ремонт** и систематический охват id **`weapon_craft_v2`** (сейчас в CI: общая трата пулов при крафте — [`materials-phase7-store-chain.test.ts`](../src/store/materials-phase7-store-chain.test.ts); плавка/топливо — [`material-process-contract.test.ts`](../src/lib/materials/material-process-contract.test.ts)); опционально `weapon_repair` в реестре **§4**. |
| **Реестр §4** | Дополнять таблицу при появлении новых операций; журнал **§5**. |

**Приоритетный бэклог (кросс-ссылка)** — [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md) **§0**: волна **TD-INV-2** и экспертиза/store-цепочки по аудиту **закрыты** (фазы **6–7** в **§8.1**); для семантики остаются в первую очередь **лавка (фаза 4)**, **идеал фазы 3 / A2**, **UI ролей (фаза C)**, расширение **фазы E**; архитектура wood/leather/stone при A1 — **§2.7.1** аудита.

**Навигация:** принципы — **§2**; фазы A–E — **§4**; техдолг и чеклист материалов — **§6**.

---

## 1. Зачем отдельный смысловой слой

Сейчас большинство материалов описываются **одной универсальной схемой** шкал (плотность, жёсткость, реактивность, обрабатываемость…). Это удобно для общих формул и адаптера в крафт, но **не выражает явно** разницу «топливо vs сырьё керамики vs руда»: различие часто сводится к тегам, тексту и подобранным числам в тех же осях.

**Цель смысловой переработки:** игрок и код могут опираться на то, **какую роль** материал играет в **конкретном процессе**, а универсальные числа остаются для тонкой настройки, вторичных множителей и ENC.

---

## 2. Принципы

### 2.1. Процессы первичны, материалы вторичны

Сначала фиксируется **контракт процесса**: какие **категории входов** допустимы, какой **смысл** у каждой категории, какие **выходы и модификаторы** возможны. Материал **не обязан** иметь запись для каждого процесса в игре — но если процесс его использует, поведение должно быть **явно задано или явно унаследовано** от фолбэка (см. 2.5).

### 2.2. Два слоя данных не конкурируют, а дополняют друг друга

| Слой | Назначение |
|------|------------|
| **Универсальный** (`physical`, `chemical`, `arcane`, `processing` в `MaterialNode`) | Общие формулы, адаптер legacy-крафта, грубые отличия, читаемость в ENC. |
| **Смысловой** (роли в процессах, фасеты, вклад в тип `P`) | Явная семантика: «это топливо», «это тело керамики», «флюс», «связующее», «руда для восстановителя» и т.д.; параметры, имеющие смысл **только** в контексте процесса. |

Запрещено дублировать один и тот же смысл в пяти разных полях без документированной связи. Если смысл процессный — он живёт в смысловом слое; если нужен только для формулы остроты/прочности клинка — в универсальном.

### 2.3. Роли и фасеты — ограниченный словарь

Вводится **конечный** (расширяемый по версиям) набор **ролей материала в процессах** и при необходимости **фасетов** (например `fuel`, `ceramic_body`, `ore_charge`, `flux`, `tanning_agent`, `bind_resin`…). Новые значения добавляются осознанно, с обновлением этого документа и типов.

Произвольные строковые теги в `identity.tags` остаются для лора, фильтров UI и будущих систем; **игровые правила** процессов по возможности читают **нормализованные** роли из смыслового слоя, а не «есть ли подстрока в тегах».

### 2.4. Минимальная полнота данных

Для материала, участвующего в процессе `P`:

- либо задан **явный** вклад (параметры + роль),
- либо задокументирован **фолбэк** класса/роли world-resource или класса `MaterialIdentity.class`,
- либо процесс **запрещает** этот материал с понятным сообщением / без молчаливого деграда.

Не допускается неограниченное «всё органическое везде одинаково», если по дизайну процесс различает типы сырья.

### 2.5. Фолбэки явные и версионируемые

Дефолт вида «если нет записи — вести себя как generic_mineral» допустим **только** если он назван в коде/документе и покрыт тестом. Иначе при расширении каталога новые id незаметно схлопываются с соседними.

### 2.6. Один вход для игровой логики

Код процессов и крафта не размазывает чтение: единая функция/модуль уровня «**вклад материала `materialId` в процесс `processKind`**» (или эквивалент по этапам). Прямой разбор десятков полей `MaterialNode` в UI-компонентах без этого слоя — техдолг.

### 2.7. Обратная совместимость поэтапная

Пока процесс не переведён на смысловой слой, продолжают действовать текущие формулы (`getMaterialAsLegacy`, маппинги ресурсов). Переход **по процессам**, не «большой взрыв».

### 2.8. Согласование с дорожной картой инвентаря

Смысловой слой **не заменяет** единый инвентарь по `materialId` ([`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md), фазы 2–3). Имеет смысл вводить вклад в процессах **после** или **параллельно** с уточнением стадий сырья, чтобы «топливо» и «руда» не списывались с одного перегруженного ключа.

---

## 3. Рекомендуемая форма данных (концепт)

Точная форма типов решается в фазе **B**; на уровне принципов:

- **`processContributions`**: частичная карта `ProcessKind → { primaryRole, params… }`, где `params` зависят от процесса (например для плавки: качество топлива, доля восстановителя; для керамики: пластичность обжига).
- или **`materialFacets: Facet[]`** + правила **композиции** фасетов в вклад по процессу в коде.

Критично: избегать **N полей на каждый материал**, если поле используется единицами id — лучше вложенная структура по процессам или по фасетам.

---

## 4. Фазы работы

Фазы **независимы** от нумерации фаз в [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md), но должны **стыковаться**: инвентарь и стадии (аудит **2–3**) — обязательный контекст для процессов, где списывается конкретный `materialId`. В аудите добавлена таблица и пометки **«Семантика»** у фаз 0–7 — см. §5 там.

**Завершение фазы 3 в режиме A1** (аудит **§3.0**): сохраняются `ResourceKey` и [`MATERIAL_TO_RESOURCE`](../src/lib/craft/inventory-check.ts); добываемые id без маппинга временно в [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts) (сейчас пуст). Расширение **C–D** — для id с реальным списанием; подключение нового id ⇒ мост + оверрайды **TD-SEM-4** + не держать в ENC-only.

**Когда из семантики обязательно вернуться к аудиту:**

| Семантика | Вернуться к аудиту, если… |
|-----------|---------------------------|
| **A** | Реестр процессов требует **других стадий или id**, чем заложено в §2.7 / артефактах phase0 — сначала обновить инвентаризацию и целевую модель стадий (**фазы 0, 3**). |
| **B** | Нет утверждённой схемы **единого инвентаря** (**аудит 2**) — типы и API семантики всё равно вводить можно, но не привязывать тесты к списанию до ясности store. |
| **C–D** | Выбранный процесс ещё списывает **`ResourceKey`** / `MATERIAL_TO_RESOURCE`, а не целевой `materialId` — **сначала довести контур аудита 3** для этого процесса, потом вклады. |
| **E** | Инварианты «id в процессе» конфликтуют с **двойным stash/resources** — закрыть **аудит 2** для затронутых потоков. |

Полная двусторонняя шпаргалка: [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md) → **§5**, блок «Синхронизация с MATERIAL_SEMANTIC_PROCESS_ROLES».

### Фаза A — Реестр процессов и семантика

**Цель:** список процессов, которые игра **уже** выполняет или планирует в горизонте переработки (плавка, обжиг, дубление, смолы, заказы, ключевые этапы крафта v2).

**Задачи:**

- для каждого процесса: допустимые **роли входа**, ожидаемый **выход**, где в коде сейчас зашита логика;
- таблица «процесс → какие `materialId` / классы уже задействованы»;
- зафиксировать **нецели** (что сознательно не моделируем в первой волне).

**Критерий готовности:** документ или раздел реестра согласован командой; есть опорный список `ProcessKind` (или эквивалент).

**Аудит:** опираться на **фазу 0** (артефакты, id на цепочках); не противоречить **§2.7**; при расхождении — правка аудита в приоритете.

#### Реестр процессов — итерация 1 (минимальный контракт)

Зафиксированный список `MaterialProcessKind` и привязка к коду. Расширение — новая строка здесь + union в [`src/types/materials/material-process.ts`](../src/types/materials/material-process.ts).

| Процесс (смысл) | `MaterialProcessKind` | Где в коде | Списание / учёт сейчас |
|-----------------|----------------------|------------|-------------------------|
| Крафт оружия v2 (материалы по частям, стоимость) | `weapon_craft_v2` | [`src/lib/craft/inventory-check.ts`](../src/lib/craft/inventory-check.ts) (`getCraftingCost`, `checkInventoryForCraft`, `applyCraftingCostSpend`), [`resources-slice.ts`](../src/store/slices/resources-slice.ts) (`spendCraftingCostWithStash`), UI крафта | **`ResourceKey` + stash**; после **аудит 3.2** узел каталога **`iron`** (металл клинка) мапится на **`ironIngot`**, руда — на ключ **`iron`** только через **`iron_ore`** и т.д.; сплавы — слитки в **`ALLOY_RECIPES`**. Целевое **1:1 spend по `materialId`** без свёртки в ключ — дальше по аудиту **3**. |
| Пакетная переработка «плавка слитка» (рецепты) | `refining_smelting` | [`src/data/refining-recipes.ts`](../src/data/refining-recipes.ts) (`REFINING_INPUT_STAGE_MATERIAL_ID` — каноническая стадия сырья на `RawResource`), [`getRefiningCraftingCost`](../src/lib/craft/inventory-check.ts), [`game-store-composed.ts`](../src/store/game-store-composed.ts) (`startRefiningWithResources`, `canRefine`), этап `proc_smelting` в [`src/data/stages/processing.ts`](../src/data/stages/processing.ts) | Списание входов: **`resources` + `materialStash`**, лут и начисления по [`getGrantTargetMaterialId`](../src/lib/craft/inventory-check.ts) кладут **`iron_ore`** и др. в stash; узлы руд также в [`MATERIAL_TO_RESOURCE`](../src/lib/craft/inventory-check.ts) → тот же пул `ResourceKey`, что рецепт (**аудит пилот 3.1**). Целевой учёт **без** общего пула руда+металл — следующий шаг аудита **3**. |
| Пакетная переработка «дубление / кожевня» (stash-рецепт) | `refining_tanning` | Тип в [`material-process.ts`](../src/types/materials/material-process.ts); рецепт **`tanned_leather_tan`** в [`refining-recipes.ts`](../src/data/refining-recipes.ts) (`stashInputsPerBatch`, выход `tanned_leather`); постройка **`tannery`**; техника [`forge_basic_leather_tan`](../src/data/material-processing-techniques.ts); этап [`prep_forge_leather_tan`](../src/data/stages/preparation.ts); мост [`getEffectiveRefiningRecipeId`](../src/lib/craft/processing-technique-refining-bridge.ts) | Списание/приход через тот же контур плавки: **`applyRefiningStartSpend`** в [`resources-slice.ts`](../src/store/slices/resources-slice.ts); семантика кожи и пула `leather` — [`RESOURCE_TRANSFORMATION_MAP.md`](RESOURCE_TRANSFORMATION_MAP.md) §8, волна **2.4f**. |

**Нецели итерации 1 (сознательно позже):** обжиг керамики, **прочие** процессы заказов NPC, часть начислений экспедиционного лута — по мере появления в реестре. Для них пока нет значения в `MaterialProcessKind`; вклад материала не запрашивается.

**Статус фазы A:** реестр для двух процессов **зафиксирован**; дальнейшие процессы добавляются по той же схеме.

---

### Фаза B — Типы и пустой смысловой слой

**Цель:** типы в `src/types/` и **опциональное** поле на `MaterialNode` (или параллельная мапа `Record<MaterialId, SemanticProfile>`, если не хотите трогать каждый файл сразу).

**Задачи:**

- ввести типы ролей, процессов, вкладов;
- описать в [`docs/04_TYPES_SYSTEM.md`](04_TYPES_SYSTEM.md) кратко новые сущности;
- реализовать **`getMaterialProcessContribution(materialId, processKind)`** (или имя по конвенции проекта) с **текущим поведением = существующие формулы** там, где смысловых данных ещё нет (прозрачный фолбэк).

**Статус (2026-04-01):** выполнено **ядро B**: типы [`material-process.ts`](../src/types/materials/material-process.ts), оверрайды [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts), [`getMaterialProcessContribution`](../src/lib/materials/material-process-contribution.ts), тесты [`material-process-contribution.test.ts`](../src/lib/materials/material-process-contribution.test.ts). **Фаза C (пилот):** имеет смысл подключить чтение вклада в UI/формулы там, где процесс уже «семантически» важен; **крафт v2** после [**аудита 2.1**](../MATERIALS_UNIFICATION_AUDIT.md) реально списывает лут из stash для смапленных id — можно использовать `getMaterialProcessContribution` для подсказок ролей (топливо/руда) без смены формулы списания.

**Критерий готовности:** сборка и тесты зелёные; новый API не ломает игру; поведение без данных совпадает с предыдущим в пилотных местах.

**Аудит:** логично начинать при **проработанном проекте фазы 2**; до закрытия **3** для пилотного процесса — только фолбэки без «художественных» ролей, влияющих на баланс списания.

---

### Фаза C — Пилот на одном–двух процессах

**Цель:** доказать ценность модели на узком срезе.

**Задачи:**

- выбрать процесс с контрастными материалами (например «топливо vs не-топливо» в плавке, или керамика vs камень);
- задать смысловые данные для **небольшого** набора id;
- перевести **только** этот процесс на чтение `getMaterialProcessContribution` (или аналог);
- обновить документацию системы ([`systems/FORGE_SYSTEM.md`](systems/FORGE_SYSTEM.md) / ресурсы — по месту).

**Критерий готовности:** два материала с близкими универсальными числами, но **разной ролью**, дают **различимый** результат в пилотном процессе; есть тест на регрессию.

**Аудит:** пилот только там, где **фаза 3** обеспечила списание **`materialId`** в согласовании с экспедицией/магазином (**2**); иначе — вернуться к аудиту.

---

### Фаза D — Миграция каталога волнами

**Цель:** покрыть смысловым слоем материалы по приоритету.

**Задачи:**

- волна 1: все id на **критических цепочках** (плавка, основной крафт, переработка из аудита);
- волна 2: экспедиционный дроп, заказы;
- волна 3: хвост каталога, decorative/low impact;
- для добываемых узлов (`library/{ores,organics,…}/`, см. [`world-resource-nodes.ts`](../src/data/materials/library/world-resource-nodes.ts)): данные в spec, отдельной таблице по id (аналог [`gather-material-science-overrides.ts`](../src/data/materials/library/gather-material-science-overrides.ts) для **чисел**, [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts) для **фаз C–D**) или полных файлах;
- дублирующие по смыслу теги в `identity.tags` **привести в соответствие** с ролями там, где они использовались как костыль.

**Критерий готовности:** для каждого процесса из фазы A либо явный охват id, либо осознанное исключение в реестре.

**Аудит:** волны **D** привязать к приоритетам из **фазы 0** и критериям **3**; новые id из **1/1b** подключать к процессам по мере появления в цепочках списания.

---

### Фаза E — Инварианты, тесты, контроль качества

**Цель:** не допустить новых «безликих» материалов.

**Задачи:**

- тесты: материал с тегом/ролью `fuel` **обязан** иметь вклад в процесс, где горение учитывается (если процесс внедрен);
- отчёт или линт: список id без смыслового профиля, но участвующих в процессе `P`;
- периодический аудит: пары материалов с **идентичным** вкладом во все подключённые процессы — осознанное решение или доработка.

**Критерий готовности:** CI отлавливает регрессии контракта; правила добавления материала обновлены в [`data/MATERIALS_ADDING.md`](data/MATERIALS_ADDING.md).

**Аудит:** цепочки stash → списание и сохранения — **фаза 7** [**§8.1**](../MATERIALS_UNIFICATION_AUDIT.md) (CI: [`materials-phase7-store-chain.test.ts`](../src/store/materials-phase7-store-chain.test.ts), persist/`mergeActiveRefiningFromSave`). Далее — явные инварианты **E** по ремонту и по смене витрины (**4**).

---

## 5. Журнал решений

При смене словаря ролей, фолбэков или контракта процесса добавляйте строку:

| Дата | Решение | Ссылка (PR / коммит) |
|------|---------|------------------------|
| 2026-04-01 | **Фаза D (закрытие моста §4.1):** явные `weapon_craft_v2` для камней, самоцветов моста и `dragon_scale`; **§6.2** / **§0** обновлены. | [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts), [`material-process-contribution.test.ts`](../src/lib/materials/material-process-contribution.test.ts) |
| 2026-04-01 | Синхронизация с аудитом **§8:** фазы **6–7** (ENC/экспертиза, stash→spend CI, `activeRefining` в persist/облаке). **§0** здесь: **фаза E** переведена в «частично», уточнён бэклог vs закрытые пункты аудита. | [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md) **§8.2** |
| 2026-04-02 | **Пилот C/D/E (часть):** `oreChargeEfficiency` → множитель выхода плавки ([`inventory-check.ts`](../src/lib/craft/inventory-check.ts), store); волна **`weapon_craft_v2`** для мостовых id; контракт [`material-process-contract.test.ts`](../src/lib/materials/material-process-contract.test.ts). Обновлены **§0**, **§6.1 TD-SEM-3**, **§6.2**, журнал; бэклог — [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md) §0. | синхронизация с аудитом **§8.2** |
| 2026-04-01 | **§0:** таблицы «семантика — сделано / осталось»; шапка и **TD-SEM-4** привязаны к [`gatherable-enc-only.ts`](../src/lib/materials/gatherable-enc-only.ts) | синхронизация с аудитом **§0** |
| 2026-04-02 | Приняты принципы и фазы A–E | инициализация документа |
| 2026-04-02 | Синхронизация с [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md): таблица §5 ↔ §4, пометки «Аудит» у фаз A–E | двусторонняя шпаргалка |
| 2026-04-01 | **A:** реестр итерации 1 (`weapon_craft_v2`, `refining_smelting`). **B:** типы, `getMaterialProcessContribution`, оверрайды, Vitest | см. §4 «Реестр», код в `src/types/materials/material-process.ts`, `src/lib/materials/material-process-contribution.ts` |
| 2026-04-01 | Связка с [**аудитом 2.1**](../MATERIALS_UNIFICATION_AUDIT.md) | Крафт v2 учитывает и списывает `materialStash` через `MATERIAL_TO_RESOURCE`; процесс `weapon_craft_v2` в реестре обновлён по факту кода. |
| 2026-04-01 | **2.1:** начисление рабочих/магазина в stash | [`getGrantTargetMaterialId`](../src/lib/craft/inventory-check.ts), `grantResourceKeyFromWorld` — см. журнал аудита §8.2. |
| 2026-04-01 | **2.1:** ремонт в том же контуре stash | [`executeRepair`](../src/lib/store-utils/repair-utils.ts) + [`repair-cross-slice`](../src/store/cross-slice/repair-cross-slice.ts) + [`repair-card`](../src/components/ui/repair-card.tsx); при появлении `weapon_repair` в реестре процесса §4 — привязать сюда. |
| 2026-04-01 | **2.1:** `refining_smelting` в store | `startRefiningWithResources` / `canRefine` используют `getRefiningCraftingCost`, `canAffordCraftingCostWithStash`, `spendCraftingCostWithStash`; реестр §4 и журнал аудита §8.2 синхронизированы. |
| 2026-04-01 | **аудит 3.1** + реестр | Канонические id стадий сырья для плавки/начислений: `REFINING_INPUT_STAGE_MATERIAL_ID` в `refining-recipes.ts`; реестр §4 уточнён по факту связки лут ↔ горн. |
| 2026-04-01 | **аудит 3.2** + реестр | Руда (`iron`, …) vs слиток (`ironIngot`, …) в `MATERIAL_TO_RESOURCE` и крафте; строка `weapon_craft_v2` в §4 обновлена. |
| 2026-04-01 | **Техдолг переноса каталога** | Введены §6 (семантика: TD-SEM, чеклист оверрайдов) и согласованный §4.1 в [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md) (TD-INV/DOC/DATA, таблицы 23/34 id). |

---

## 6. Техдолг переноса каталога и чеклист семантики

**Контекст:** добываемые узлы перенесены из удалённой папки `world-resources/` в типовые подпапки [`library/`](../src/data/materials/library/) (см. журнал [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md) §8.2). Ниже — техдолг **процессного слоя** и приоритеты для фаз **C–D**; учёт `ResourceKey` и полная таблица «id × папка × маппинг» — в аудите **§4.1**.

### 6.1. Накопленный техдолг (семантика)

| ID | Суть | Связь с аудитом |
|----|------|-------------------|
| **TD-SEM-1 Явные оверрайды** | **Частично закрыто (пилот):** в [`MATERIAL_PROCESS_OVERRIDES`](../src/data/materials/material-process-overrides.ts) — топлива (`smelt_fuel`), канонические руды ядра `iron_ore` … `mithril_ore` (`smelt_ore_charge`), альтернативные/редкие руды добычи (`bog_iron` … `star_metal`). Остальные материалы — эвристики в [`getMaterialProcessContribution`](../src/lib/materials/material-process-contribution.ts). | Дальше — волны **C–D** и расширение узла при необходимости **params**. |
| **TD-SEM-2 Роль `buildWorldNode` vs теги** | Для углей **согласовано:** роль **`fuel`**, не `stone`; плавка дополнительно зафиксирована оверрайдом. Риск «роль без тега» для **других** материалов остаётся — покрывать оверрайдами или обязательными тегами при добавлении id. | **TD-DATA-1** в аудите §4.1 закрыт. |
| **TD-SEM-3 Одинаковые фасеты при разных id** | Альтернативные руды те же фасеты `smelt_ore_charge`, что и `iron_ore`, но **различие шихты по балансу выхода слитка** введено через **`oreChargeEfficiency`** в оверрайде (средневзвешенный множитель в `computeRefiningSmeltingOutputMultiplier`). Следующий шаг при необходимости — время плавки или иные **params** без дублирования смысла в тегах. | Совпадает с **TD-INV-1** в аудите §4.1; см. [`FORMULAS.md`](utils/FORMULAS.md) (плавка). |
| **TD-SEM-4** | Бывший хвост **34** ENC-only закрыт **2026-04-01**; реестр пуст. | Любой **новый** немапящийся добываемый id: при подключении к горну/крафту — оверрайд или эвристика + тест; не держать в ENC-only. |

### 6.2. Чеклист: приоритет явных вкладов (`MATERIAL_PROCESS_OVERRIDES` или расширение узла)

Отметка **Готово** — есть явная запись или принято оставить эвристику до пилота **C**.

| materialId (группа) | `refining_smelting` (сейчас) | `weapon_craft_v2` (сейчас) | Действие |
|---------------------|------------------------------|---------------------------|----------|
| `coal`, `ancient_coal` | **`explicit`** `smelt_fuel` | пусто (`class` **`other`**) | **Готово** (роль `fuel` + оверрайд). |
| `peat` | **`explicit`** `smelt_fuel` | пусто (`class` **`other`**) | **Готово** по плавке; в крафте v2 не тело частей (аналог угля по классу). |
| `iron_ore`, `copper_ore`, `tin_ore`, `silver_ore`, `gold_ore`, `mithril_ore` | **`explicit`** `smelt_ore_charge` | пусто (руда) | **Готово** (ядро каталога, как у альтернативных руд). |
| `bog_iron`, `depth_iron`, `cold_iron_ore`, `living_ore` | **`explicit`** `smelt_ore_charge` + **`oreChargeEfficiency`** (пилот **C**) | пусто (руда) | **Готово** для плавки; дробный выход vs `iron_ore` — в данных оверрайда. |
| `star_metal` | **`explicit`** `smelt_ore_charge` + **`oreChargeEfficiency`** | пусто | **Готово** для плавки (пул `mithril`); баланс — множитель выхода. |
| `ancient_metal` | пусто | **`explicit`** `weapon_body_metal` в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts) | Расход по маппингу аудита §4.1; эвристику класса дублирует оверрайд для явности **D**. |
| Камни моста (`red_stone`, `clay`, `deep_clay`, `depth_stone`, `sulfur`) | пусто | **`explicit`** `weapon_body_mineral` (**фаза D**) | **Готово** для вклада в крафт; керамика/флюс — отдельный `ProcessKind` позже. |
| Кожи моста (`dragon_scale`, …) | пусто | **`explicit`** `weapon_grip_leather` где нужно (**фаза D** для чешуи) | **Готово** для моста; прочие кожи — эвристика класса или оверрайд. |
| Самоцветы моста (`dragon_glass`, `echo_stone`, …) | пусто | **`explicit`** `weapon_inlay_gem` (**фаза D**, пул `stone` на складе) | **Готово** для крафта; плавка самоцветов — вне реестра §4. |
| **Большинство `organics/*`, `special/*` без топлива/руды** | пусто | `organic_reagent` / пусто | При вводе алхимии/обжига — завести `ProcessKind` и волну **D**. |

### 6.3. Правило обновления

1. Изменился [`gather-material-config.mjs`](../scripts/gather-material-config.mjs) или маппинг в [`inventory-check.ts`](../src/lib/craft/inventory-check.ts) / мосте — обновить **§4.1** аудита и при необходимости строки **§6.2** здесь.  
2. Добавлен оверрайд в [`material-process-overrides.ts`](../src/data/materials/material-process-overrides.ts) — дополнить [`material-process-contribution.test.ts`](../src/lib/materials/material-process-contribution.test.ts) и кратко журнал §5 выше.

---

*Дальнейшие правки принципов и фаз — по мере согласования дизайна и реализации; статус выполнения фиксируйте в журнале §5 и при необходимости в [`MATERIALS_UNIFICATION_AUDIT.md`](MATERIALS_UNIFICATION_AUDIT.md). Чеклисты переноса и маппинга — **аудит §4.1**, процессный долг — **§6** этого файла.*
