# Аудит: вкладка «Алтарь» в кузнице (сборка узла зачарований)

Документ **самодостаточен**: содержит и канон продуктовой спецификации фазы 2, и фактическое поведение кода, и план доработок. Перечни материалов сняты с помощью `getForgePartMaterialCandidates` + `canCatalogMaterialSpendInForgeCraft` (см. §5.7).

---

## 1. Краткое резюме

- По **канону фазы 2** постройка — это **три именованные операции эпилога** квеста «Эхо забытой кузни»: **по листам чертежа → крепёж → проводка души**; макрофазы I–III в кузнице им соответствуют смыслом, **фаза III** дополнительно расходует реагенты **лунное серебро / болотная зола (образ) / слеза тумана**, сопоставленные с уже существующими **`materialId`** (`silver_alloy`, `peat`, `mist_herbs`).
- В **коде** реализован путь **P1**: один длинный крафт v2 по рецепту **`forgotten_forge_altar_node`**, без отдельного мета-проекта в store. Узел «собран» при **`altarBuiltInForge === true`** после финала стадий.
- **Три макрофазы в UI** — не три сохраняемые игровые сессии, а деление **индекса текущей стадии** на три отрезка (~34% / ~67% от числа сгенерированных стадий). На вкладке отображается **легенда этапов** (планирование) и **подсветка текущей макрофазы** (во время сборки).
- **Реагенты III (`peat`, `mist_herbs`):** к пулу кандидатов планировщика для `altar_soul_peat` / `altar_soul_herbs` добавляется **merge** каноничных id (`getAltarForgeExtraMaterialIds` в `altar-construction.ts` + `getForgePartMaterialCandidates`), т.к. класс материала в каталоге иначе не попадал бы в слот.
- **`fieldstone`:** в **`MATERIAL_TO_RESOURCE`** ядра задан маппинг на ключ **`stone`** — камень доступен для расхода в крафте и в селекторе основания.
- **Ошибки старта крафта:** поле **`lastStartCraftError`** в `use-craft-v2` (не персистится) + объединённый alert на вкладке «Алтарь»; **`clearLastStartCraftError`**.
- **Пресет техник алтаря:** в контейнере к базовому набору добавлены **`double_hardening`**, **`spirit_blessing`**, **`celestial_hardening`** (плюс разблокированные игроком).

О **«пяти фазах»** в старых черновиках: в каноне фазы 2 явно **три** макрофазы эпилога; пяти отдельных чекпоинтов сохранения в store **нет**.

---

## 2. Канон дизайна (фаза 2 постройки алтаря) — сжатое содержание

Ниже — то, что фиксирует продуктовая спецификация постройки (логика квеста, материалы, техники), **без необходимости читать другие файлы**.

### 2.1. Квест как источник смысла этапов

- Шаги **0–6** (экспедиции): дают лор, артефакты в повествовании **(резонаторная матрица, фокусирующая чаша, лунный камертон)** и привязку к локациям (`oak_grove_outskirts`, `red_stone_mines`, `forgotten_mines`, `misty_lowlands`, `rotten_swamp`, `silver_grove`). Золото и риски (страховка и т.д.) уже заложены в квесте.
- Шаг **7 (эпилог)**: архивариус формулирует **три операции** для кузницы:
  1. **Сбор по листам чертежа** — стыковка компонентов по схеме.
  2. **Закрепить крепёж** — рама, скобы, стяжки (зеркальный ключ шага 2 — часть экспедиционного трека в лоре, не обязательный отдельный предмет склада, пока не введён в данных).
  3. **Проводка души** — резонанс, герметизация, настройка «частоты» по схеме.

Пока эти три блока не пройдены в **игровой** механике, **эссенция не течёт** — в коде это согласовано с тем, что полный контент экрана «Зачарования» требует **`altarBuiltInForge`**.

**Вариант артефактов (канон для текущего внедрения): вариант B** — гейт постройки = завершённый квест (**`altarUnlockedByForgottenForgeQuest`**); **отдельные три `materialId` артефактов в stash обязательны не рецептом**. Имена артефактов живут в диалогах/UI прогресса. Фаза III всё равно требует **расход обычных реагентов** по таблице ниже (второй игровой расход после квеста, не повтор мини-игры «очистка чаши» в кузнице).

### 2.2. Таблица лор ↔ обязательные `materialId` (фаза III)

| Образ в лоре (шаг 4 / эпилог) | Зафиксированный `materialId` | Комментарий канона |
|--------------------------------|------------------------------|---------------------|
| Лунное серебро | `silver_alloy` | Сплав в каталоге; при необходимости — руда `silver_ore` и переплавка |
| Болотная зола (образ) | `peat` | Торф; tier 1, узел каталога |
| Слеза тумана | `mist_herbs` | Трава туманных низин; связь с миссией шага 4 |

**Опционально при балансе** (только существующие id, без выдуманных цепочек): `moonstone_shards`, `echo_stone`, `pine_resin`, `bog_iron`, `toxic_moss` — в **текущем рецепте** отдельных слотов под них **нет**, это запас на усиление фазы III.

### 2.3. Материалы фаз I–II (канон)

Обычные tier **1–2**: руды и продукты переплавки, **`fieldstone`**, `red_stone`, `clay`, `oak`, `pine`, `raw_leather`, `copper_ore`, `tin_ore`, `silver_ore` и т.д. — по доступности локаций. Учёт склада и переплавки — общий для крафта v2.

### 2.4. Техники (канон)

- **Правило:** не вводить технику, которая нужна **только** на одной стадии алтаря и больше нигде; второе применение — улучшение алтаря, поздний крафт, перековка.
- **Уже в проекте (примеры из спецификации):** `basic_forging`, `folded_steel`, `double_hardening`; для магического акцента III — `spirit_blessing`; `celestial_hardening` — если узкий материал совместим.
- **Новые id** (если базовых мало для гейта стадий) — в духе `altar_blueprint_alignment` и т.п., с **вторым применением**; продажа за репутацию интенданта — отдельное решение.
- **Техники обработки (плавка):** `getPlannerUnlockedTechniqueIds` + `unlockedMaterialProcessingTechniqueIds` — без лишних новых обработок, если хватает уровня и переплавки.

### 2.5. Интендант (канон)

- Не добавлять «маски / снаряжение» как товары только из реплик квеста.
- Для продаваемых **техник крафта** в спецификации предусмотрен kind вроде **`craft_technique`**, unlock в стор, persist/облако. **В коде проекта** вид `craft_technique` в каталоге интенданта и покупка уже реализованы; вкладка алтаря подмешивает к выбору **`unlockedCraftTechniqueIds`** (включая купленные у интенданта).

### 2.6. Поток данных (канон)

```
Квест 0–6 → эпилог 7 → altarUnlockedByForgottenForgeQuest
         → вкладка «Алтарь» → сборка (макрофазы I–III; III + реагенты §2.2)
         → setAltarBuiltInForge(true) → дальнейший контент модуля зачарований (эссенция/UI — отдельные фазы)
```

### 2.7. Smoke-приёмка (канон)

1. Чертёж есть (`altarUnlockedByForgottenForgeQuest`), узел не собран (`altarBuiltInForge === false`).
2. Игрок на вкладке «Алтарь» проходит рецепт `forgotten_forge_altar_node`.
3. После финала — `setAltarBuiltInForge(true)`, **оружие в инвентарь не добавляется**.
4. Экран «Зачарования» выходит из состояния «соберите узел» к доступному контенту (сейчас — плейсхолдер следующей фазы).

---

## 3. Где в UI и навигация (код)

| Место | Поведение |
|--------|-----------|
| Кузница | Кнопка **«Алтарь»** только при `altarUnlockedByForgottenForgeQuest`. |
| Защита | При `forgeMainTab === 'altar'` без чертежа вкладка сбрасывается на **«Крафт»**. |
| После сборки | Текст «узел собран», кнопка на экран меню **«Зачарования»** (`GameScreen === 'altar'`). |
| Меню «Зачарования» | Полный гейт контента: tier‑2 локации + чертёж + `altarBuiltInForge` (`canAccessEnchantmentAltarScreen`, `canUseEnchantmentAltarContent`). |

Переход из меню в кузницу на алтарь: **`navigateToForgeTab('altar')`**.

---

## 4. Флаги в Zustand (код)

| Поле | Назначение |
|------|------------|
| `altarUnlockedByForgottenForgeQuest` | Завершён эпилог квеста (чертёж). |
| `altarBuiltInForge` | Завершена игровая сборка узла. |
| `craftV2Persisted` | Незавершённый крафт узла возможен (как у оружия). |
| `forgeMainTab` | В т.ч. значение `'altar'`. |

**Миграция:** старые сейвы без `altarBuiltInForge`, но с завершённым квестом, могли получить `altarBuiltInForge: true` (совместимость) — учитывать в отладке.

Облако: поля алтаря сериализуются в слое сохранений при включённом Turso.

**Dev:** `completeForgottenForgeQuestDev` выдаёт чертёж без прохождения квеста.

---

## 5. Рецепт `forgotten_forge_altar_node` (код)

Файл: `src/data/recipes/altar-construction.ts`. Id: `FORGOTTEN_FORGE_ALTAR_RECIPE_ID` в `src/lib/craft/altar-construction.ts`.

- В общем каталоге рецепт не виден без явного id в `unlockedRecipes`; на алтаре передаются **`unlockedRecipes: [id]`** и **`fixedRecipeId`**.
- `requiredLevel`: 1; тип `sword`; `combatPart`: `altar_base`.

### 5.1. Семь частей (данные)

| Часть | Подпись | `materialTypes` | min–max | Примечание к канону |
|-------|---------|-------------------|---------|----------------------|
| `altar_base` | I. Основание (камень) | `stone` | 4–6 | В т.ч. **`fieldstone`** (маппинг на склад) |
| `altar_frame` | I. Каркас | `wood` | 3–5 | |
| `altar_brackets` | II. Крепёж | `metal`, `alloy` | 2–4 | |
| `altar_binding` | II. Стяжки | `leather` | 1–2 | |
| `altar_soul_alloy` | III. Лунное серебро | `metal`, `alloy` | 2–4 | В т.ч. **`silver_alloy`** |
| `altar_soul_peat` | III. Болотная зола | `other` | 2–5 | Плюс **merge** **`peat`** (канон §2.2) |
| `altar_soul_herbs` | III. Слеза тумана | `wood` | 2–4 | Плюс **merge** **`mist_herbs`** (канон §2.2) |

Стадии: от `prep_*` через обработку частей и `asmb_*` к `fin_tempering`, `proc_drying`, `form_carving`, `fin_spirit_blessing`, полировка, инспекция; у части финала III заданы **увеличенные длительности** (`baseDurationOverride`), что согласовано с итерацией баланса tier‑2 из спецификации.

---

## 6. Кандидаты материалов в планировщике (код)

Цепочка: **`getForgePartMaterialCandidates`** (включая **`mergeAltarForgeExtraNodes`** для `altar_soul_peat` / `altar_soul_herbs`) → **`canCatalogMaterialSpendInForgeCraft`** → в UI ещё **`filterForgeExpertiseMaterials`** (экспертиза ≥ **10**).

### 6.1. `altar_base` (`stone`) — 11 id (после шагов 1+2)

`basic_stone`, `clay`, `deep_clay`, `depth_stone`, `fieldstone`, `granite`, `marble`, `obsidian`, `processed_stone`, `red_stone`, `sulfur`

### 6.2. `altar_frame` (`wood`) — 13 id

`ash`, `birch`, `ebony`, `ironwood`, `mahogany`, `maple`, `oak`, `pine`, `processed_wood`, `rotten_wood`, `silvered_pine`, `spirit_wood`, `walnut`

### 6.3. `altar_brackets` / `altar_soul_alloy` (`metal`+`alloy`) — 15 id

`ancient_metal`, `bronze`, `cold_iron`, `copper`, `copper_alloy`, `gold`, `gold_alloy`, `high_carbon_steel`, `iron_alloy`, `mithril_alloy`, `silver`, `silver_alloy`, `steel`, `tin`, `tin_alloy`

### 6.4. `altar_binding` (`leather`) — 7 id

`bull_leather`, `dragon_leather`, `dragon_scale`, `hardened_leather`, `raw_leather`, `shadow_leather`, `tanned_leather`

### 6.5. `altar_soul_peat` (`other`) — 10 id

`ancient_coal`, `ancient_sap`, `coal`, `dragon_bone`, `eternal_ice`, `heart_of_flame`, `heart_of_the_mountain`, **`peat`**, `primordial_ice`, `soulforge_ember`

### 6.6. `altar_soul_herbs` (`wood`) — 14 id

Как §6.2 плюс **`mist_herbs`** (добавлено merge’ем для канона §2.2).

### 6.7. Команда пересборки списков (актуализировать после правок каталога)

```bash
npx tsx -e "import { getForgePartMaterialCandidates } from './src/lib/materials/forge-part-material-candidates.ts'; import { canCatalogMaterialSpendInForgeCraft } from './src/lib/craft/inventory-check.ts'; import { forgottenForgeAltarConstructionRecipe } from './src/data/recipes/altar-construction.ts'; for (const p of forgottenForgeAltarConstructionRecipe.parts) { const ids = getForgePartMaterialCandidates(p.id,p.materialTypes).filter(m=>canCatalogMaterialSpendInForgeCraft(m.identity.id)).map(m=>m.identity.id).sort(); console.log(p.id, ids.join(', ')); }"
```

---

## 7. Ресурсы, горн, закупка (код)

- Старт: **`validateMaterialProcessingPlan`** → **`getCraftingCost`** → **`spendCraftingCostWithStash`** (атомарно; при неудаче крафт не начинается).
- **База угля +3** к требованиям в `checkInventoryForCraft` — как у обычного v2.
- Закупка: флаг **`shouldPurchaseMaterials`**, **`onBuyMaterials`**; `materialPrices` с алтаря пустой, цена может подставляться через **`getMaterialPrice`** по ресурсному ключу.
- **Отмена** после старта: **`cancelCraft`** не возвращает уже списанные материалы.
- **Ошибки внутри `startCraft`** (нет рецепта, экспертиза, план обработки, пустые стадии): **`lastStartCraftError`** в состоянии хука + русскоязычный текст; сброс при успешном старте, **`clearLastStartCraftError`**, отмене крафта, завершении. Не входит в **`craftV2Persisted`**.

---

## 8. Техники (код vs канон)

- **Алтарный контейнер** добавляет к пулу: `basic_forging`, `balanced_design`, `folded_steel`, **`double_hardening`**, **`spirit_blessing`**, **`celestial_hardening`** и объединяет с **`unlockedCraftTechniqueIds`** (в т.ч. с интенданта).

Обработка сырья: **`unlockedMaterialProcessingTechniqueIds`** + **`getPlannerUnlockedTechniqueIds`**.

---

## 9. Завершение крафта (код)

Ветка **`isForgottenForgeAltarRecipe`**: экспертиза через `queueMicrotask`, **`setAltarBuiltInForge(true)`**, сброс **`craftV2Persisted`**, **нет** оружия в инвентаре, **нет** `rollWeaponOutcome`. UI «completed» без карточки клинка.

---

## 10. Квест (код, связь)

- Разблокировка чертежа: **`forgottenForgeQuest.status === 'completed'`** после эпилога или dev.
- Нужен tier‑2 в доступных локациях для выхода квеста из `locked`.
- Алтарь в кузнице **не** читает шаги 1–6, только флаг чертежа.

---

## 11. Расхождения «спецификация ↔ реализация» (сводка)

| Канон | Факт в коде |
|--------|-------------|
| Фаза III **`peat`** / **`mist_herbs`** | ✓ Доступны через **extra-merge** в `getForgePartMaterialCandidates` |
| **`fieldstone`** tier 1–2 | ✓ **`MATERIAL_TO_RESOURCE` → `stone`** |
| Опциональные усилители III (`moonstone_shards`, …) | Отдельных слотов нет (будущий баланс) |
| Три операции эпилога | Один крафт; три **UI**-макрофазы по доле стадий ✓ |
| Вариант B без предметов артефактов | ✓ |
| P1 рецепт + финал без `CraftedWeaponV2` | ✓ |
| Баланс III (диапазоны qty, длительности) | В данных отражён ✓ |
| UX макрофаз, ошибки старта, пресет техник | ✓ (`altar-craft-container`, `use-craft-v2`) |

---

## 12. Дальнейший бэклог (после переработки 2026)

- **P4:** опциональные доп. материалы III (`moonstone_shards` и др.) — отдельные слоты или требования, только после баланса.
- **Риск:** если **`startCraft`** падает **после** **`spendCraftingCostWithStash`** в потоке алтаря, материалы уже списаны — при появлении таких кейсов стоит перенести валидации выше списания или ввести откат (отдельная задача).

---

## 13. Чеклист полноты аудита

| Тема | Учтено |
|------|--------|
| Канон фазы 2 (эпилог, реагенты, вариант B, техники, интендант) | §2 |
| Один крафт P1, три UI-макрофазы, merge реагентов | §1, §5–§6 |
| Списки материалов по слотам | §6 |
| fieldstone / peat / mist_herbs | §1, §6 |
| Уголь +3, отмена, закупка, lastStartCraftError | §7 |
| Финал без оружия, флаги, миграция | §4, §9 |
| Меню «Зачарования», квест | §3, §10 |
| Оставшийся бэклог | §12 |

При изменении каталога материалов перегенерируйте §6 командой §6.7.
