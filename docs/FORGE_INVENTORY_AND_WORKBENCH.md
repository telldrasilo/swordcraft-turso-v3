# Кузница: инвентарь и верстак (текущая структура)

Документ описывает **только** данные и UI, связанные с **инвентарём оружия** и **верстаком** на экране кузницы. Это опорная карта для реорганизации: где что лежит в store, какие компоненты собирают экран, как переключаются вкладки и что дублируется между «Инвентарь» и «Верстак».

Экран кузницы (`ForgeScreen`) содержит и другие верхнеуровневые вкладки; они здесь **не** разбираются.

---

## 1. Точка входа UI

| Файл | Роль |
|------|------|
| `src/components/screens/forge-screen.tsx` | Контейнер кузницы: верхние вкладки, рендер `InventorySection` при `forgeMainTab === 'inventory'` и `WorkbenchScreen` при `'bench'`. |

Для инвентаря и верстака важны:

- бейдж счётчика оружия: `weaponInventory.weapons.length`;
- бейдж очереди верстака: число пунктов в `workbenchQueue` со статусом `planned` или `running`.

---

## 2. Навигация по вкладкам (store)

Состояние хранится в composed store (`src/store/game-store-composed.ts`).

| Поле | Тип (смысл) | Назначение |
|------|----------------|------------|
| `forgeMainTab` | `'craft' \| 'altar' \| 'inventory' \| 'bench'` | Какая **основная** вкладка кузницы активна. Для верстака значение **`bench`**. |
| `forgeBenchSubTab` | `'repair' \| 'reforge'` | **Подвкладка внутри верстака**: ремонт или перековка. |
| `forgeTabRequest` | `ForgeMainTab \| null` | Одноразовый флаг для внешних переходов; после обработки сбрасывается (`clearForgeTabRequest`). |

Методы:

- **`setForgeMainTab(tab)`** — если передать `'repair'` или ref `'reforge'`, внутри выставляется `forgeMainTab: 'bench'` и соответствующий `forgeBenchSubTab`. Иначе `forgeMainTab` становится равным переданному значению (например `'inventory'`).
- **`navigateToForgeTab(tab)`** — переключает экран на кузницу (`currentScreen: 'forge'`) и для `'repair'/'reforge'` дополнительно выставляет `forgeTabRequest: 'bench'` плюс `forgeMainTab: 'bench'` и нужный `forgeBenchSubTab`.

Пример из инвентаря: кнопка «Открыть Ремонт» вызывает `navigateToForgeTab('repair')` (`src/components/forge/inventory-section.tsx`).

---

## 3. Инвентарь оружия

### 3.1. Данные в store (тип `WeaponInventory`)

Определено в `src/store/slices/craft-slice.ts`, живёт в `weaponInventory`:

| Поле | Смысл |
|------|--------|
| `weapons` | Массив экземпляров `CraftedWeaponV2` — единственный список готовых клинков. |
| `maxSlots` | Лимит слотов (по умолчанию 20); добавление нового клинка блокируется при заполнении. |
| `trophies` | `Record<string, number>` — трофеи контрактов; **логически часть инвентаря в store**, отдельного блока на вкладке «Инвентарь» в UI сейчас нет. |

Операции на уровне slice/actions (фрагмент): `addWeapon`, `removeWeapon`, `sellWeapon`, `getWeaponById` — все работают с `weaponInventory.weapons`.

### 3.2. UI вкладки «Инвентарь»

| Файл | Роль |
|------|------|
| `src/components/forge/inventory-section.tsx` | Сетка карточек, фильтры, сводка, баннер «нужен уход», переход на ремонт. |

Поведение:

- **Источник списка**: `useGameStore(state => state.weaponInventory.weapons)` — тот же массив, что и на верстаке.
- **Фильтры и сортировка**: общий persist-слой `inventorySortBy` / `inventoryFilterQuality` / `inventoryFilterDamage` и хук `useInventoryFilter` (см. `inventory-filter-slice.ts`).
- **Сводка карточек**: в т.ч. средняя «мощь» по полю `powerScore` на `CraftedWeaponV2` (см. `docs/utils/FORMULAS.md`).
- **«Нужен уход»**: считает клинки с `activeDamageTags.length > 0` **или** `currentDurability` (fallback `stats.durability`) строго меньше `stats.maxDurability`. Показывает число уникальных оружий в очереди верстака в работе/плане (`workbenchQueue` со статусами `planned`/`running`).
- **Карточка**: `WeaponInventoryCard` с `context` по умолчанию `'inventory'` (проп не передаётся).

Карточка в инвентаре может предлагать отправку на верстак (`sendWeaponToRepairBench`) — см. раздел 5.3.

### 3.3. Компонент карточки (`WeaponInventoryCard`)

| Файл | Роль |
|------|------|
| `src/components/forge/weapon-inventory-card.tsx` | Одна карточка клинка; режим задаётся `context` и опционально `workbenchMode`. |

Режимы:

| `context` | Использование |
|-----------|----------------|
| `'inventory'` | Вкладка «Инвентарь»; кнопки продажи/перехода к ремонту по правилам карточки. |
| `'workbench'` | Центральная карточка на верстаке; подсветка по `workbenchQueue` и `workbenchSelectedWeaponId` (не persist). |
| `'inventory'` + `benchDetail` | Превью в `RepairSection`: блок «на верстаке» и возврат в инвентарь. |
| `'queuePreview'` | Компактное превью в popover сегмента полосы очереди (`WorkbenchQueueSegmentedBar`). |

`workbenchMode`: `'repair' | 'reforge'` — прокидывается только при `context === 'workbench'` (данные для атрибутов/tutorial).

---

## 4. Верстак: иерархия вкладок и компонентов

### 4.1. Два уровня вкладок

1. **Верхний уровень** (`forgeMainTab === 'bench'`): вкладка «Верстак» на полосе `ForgeScreen`.
2. **Внутренний уровень** (`forgeBenchSubTab`): вкладки «Ремонт» / «Перековка» в **правой колонке** `WorkbenchScreen` (Radix `Tabs`, вызов `setForgeMainTab('repair'|'reforge')`).

| Файл | Роль |
|------|------|
| `src/components/forge/workbench-screen.tsx` | Сетка: компактный ряд — центральная карточка — вкладки; очередь через `WorkbenchShell` снизу. |

Порядок блоков сверху вниз внутри `WorkbenchScreen`:

1. **`WorkbenchWeaponList`** — счётчики и **`InventoryFilterBar`** (те же фильтры, что и в инвентаре).
2. Основной ряд (**desktop**): узкий **`WorkbenchCompactWeaponRail`** (вертикально, колонка ~9–10rem) | **`WeaponInventoryCard`** по центру (после выбора в ряду) | вкладки с **`RepairSection`** / **`ReforgeSection`**. Ячейки ряда — **`WorkbenchStripWeaponCell`**: эмодзи типа (`WeaponIcon`), усечённое **`fullName`**, мощь, полоска прочности (пороги цвета как у центральной карточки, хелпер **`durability-bar-tone`**), рамка по **`qualityGrade`**, бейджи ⌛/⚠️/подписи тегов урона (до 3 + `+N`), на десктопе **тултип** с полями и ДВ. **Мобилка:** горизонтальная карусель тех же ячеек, затем карточка, затем вкладки — **без** переключателя «Оружие / Очередь».
3. **`WorkbenchShell`** — `children` = п.1–2; **ниже** — полоса сегментов (или подсказка-заглушка) и **`WorkbenchQueuePanel`**.

Один и тот же диалог **`WorkbenchTaskEditor`** открывается для постановки задачи в очередь из **центральной карточки** и для кнопки «изменить» у пунктов очереди со статусом `planned`. Превью оружия по сегменту полосы — popover (`queuePreview`).

| Файл | Роль |
|------|------|
| `src/components/forge/workbench-shell.tsx` | Под основным контентом: полоса «доля времени» или текст-заглушка; затем панель очереди; `data-tutorial="workbench-shell"`. |
| `src/components/forge/workbench-queue-segmented-bar.tsx` | Визуал сегментов полосы. |
| `src/components/forge/workbench-queue-panel.tsx` | UI очереди: статусы, удаление planned, запуск, панель этапов. |
| `src/components/forge/workbench-weapon-list.tsx` | Только шапка: счётчики + `InventoryFilterBar` / `useInventoryFilter`. |
| `src/components/forge/workbench-compact-weapon-rail.tsx` | Обёртка списка / карусели; прокидывает **`workbenchQueue`** в ячейки. |
| `src/components/forge/workbench-strip-weapon-cell.tsx` | Мини-карточка v2 ряда (имя, мощь, бар, бейджи, тултип). |
| `src/lib/forge/durability-bar-tone.ts` | Процент прочности и классы полосы/текста (`WeaponInventoryCard` и ряд). |
| `src/components/forge/repair-section.tsx` | `RepairCard` для выбранного клинка (детальная карточка — в центре экрана верстака). |
| `src/components/forge/reforge-section.tsx` | Перековка по `workbenchSelectedWeaponId`. |

### 4.2. Хук рантайма очереди

| Файл | Роль |
|------|------|
| `src/hooks/use-workbench-queue-runtime.ts` | Связывает `workbenchQueue`, `repairTechniqueStageRun`, baseline полосы, старт следующего пункта, отчёты, `lastRepair` для баннера в `RepairSection`. |

Используется только из `WorkbenchScreen`.

---

## 5. Состояние верстака и ремонта в store (craft slice)

Всё ниже — часть `CraftState` в `src/store/slices/craft-slice.ts` и соответствующие actions в composed store.

### 5.1. Очередь верстака

| Поле | Смысл |
|------|--------|
| `workbenchQueue` | Массив `WorkbenchQueueItem`: единая очередь ремонта и перековки. |

Типы пунктов (`src/lib/workbench/workbench-queue.ts`):

- `kind: 'repair'` — `techniqueIds`, опционально `executionOpts`;
- `kind: 'reforge_buff'` — одна `techniqueId`;
- `kind: 'reforge_awaken'` — одна `techniqueId`.

Статусы: `planned` | `running` | `done` | `error`.

**Persist / облако**: в JSON по-прежнему ключ **`repairQueuePlan`** (имя историческое); фактически сериализуется массив `workbenchQueue`. Нормализация при загрузке — `normalizeWorkbenchQueueFromSave`.

### 5.2. Выбор верстака и черновик ремонта

| Поле | Персист | Смысл |
|------|---------|--------|
| `workbenchSelectedWeaponId` | нет | Активный клинок: компактный ряд, центральная карточка, `RepairSection` / `ReforgeSection`. |
| `workbenchQueueAdvanceBlocked` | нет | Флаг «стоп очереди» — после текущего шага не автозапускать следующий пункт. |
| `repairBenchTechniqueDraft` | нет | `{ weaponId, techniqueIds }` — черновик техник до постановки в очередь. |

Легаси-ключи `repairBenchWeaponIds` / `repairBenchSelectedWeaponId` в persist **удалены** (версия 27+); при merge и облаке старые значения используются только для миграции в `workbenchQueue`.

Actions: `sendWeaponToRepairBench` (выбор), `selectRepairBenchWeapon`, `returnWeaponFromRepairBench` (очистка очереди по клинку), `upsertRepairQueuePlan`, `reorderWorkbenchQueue`, `updateWorkbenchPlannedItem`, `cancelActiveWorkbenchStageRun`, и т.д. — см. `craft-slice.ts`.

### 5.3. Запуск этапов (общий раннер для ремонта и перековки из очереди)

| Поле | Персист | Смысл |
|------|---------|--------|
| `repairTechniqueStageRun` | да | Активный прогон этапов: `weaponId`, `techniqueIds`, `startedAt`, `source: 'queue' \| 'adhoc'`, `activeQueueItemId`, опционально `workbenchReforge` для перековки из очереди. |

Очередь и этот прогон связаны: при выполнении из очереди `source === 'queue'` и статусы пунктов обновляются по завершению.

### 5.4. Baseline полосы верстака

| Поле | Смысл |
|------|--------|
| `workbenchBarBaseline` | Снимок для сегментированной полосы (`freezeWorkbenchBarBaseline` в рантайме); задаётся через `setWorkbenchBarBaseline`. |

Логика представления сегментов: `src/lib/workbench/workbench-bar-baseline.ts`.

---

## 6. Согласованность модели

1. **Один набор фильтров инвентаря** на вкладке «Инвентарь» и списке верстака (persist).
2. **«На верстаке»** в UI: уникальные клинки с пунктами очереди `planned` / `running` в `workbenchQueue`.
3. **Навигация**: подвкладки верстака через `setForgeMainTab('repair'|'reforge')` → `forgeMainTab: 'bench'`.

---

## 7. Карта файлов (кратко)

```
src/components/screens/forge-screen.tsx          # верхние вкладки кузницы
src/components/forge/inventory-section.tsx      # вкладка Инвентарь
src/components/forge/workbench-screen.tsx        # вкладка Верстак + подвкладки
src/components/forge/workbench-shell.tsx
src/components/forge/workbench-queue-panel.tsx
src/components/forge/workbench-compact-weapon-rail.tsx
src/components/forge/workbench-strip-weapon-cell.tsx
src/lib/forge/durability-bar-tone.ts
src/components/forge/workbench-weapon-list.tsx
src/components/forge/repair-section.tsx
src/components/forge/reforge-section.tsx
src/components/forge/weapon-inventory-card.tsx  # карточка: inventory | workbench | queuePreview
src/components/ui/repair-card.tsx               # панель техник/этапов ремонта выбранного клинка
src/hooks/use-workbench-queue-runtime.ts
src/store/slices/craft-slice.ts                # WeaponInventory, очередь, bench, stage run
src/lib/workbench/workbench-queue.ts           # типы и нормализация очереди
src/lib/workbench/workbench-bar-baseline.ts   # сегменты полосы
```

---

*Документ отражает состояние кода на момент правки; при реорганизации сверять с перечисленными путями.*
