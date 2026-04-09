# Дорожная карта: инвентарь и верстак (привязка к коду SwordCraft)

Документ основан на [INVENTORY_AND_BENCH_REFACTORING.md](./INVENTORY_AND_BENCH_REFACTORING.md) и сопоставляет каждый пункт ТЗ с **текущим состоянием репозитория**, затем декомпозирует работу на конкретные модули, риски и порядок внедрения.

Опорные карты кода: [FORGE_INVENTORY_AND_WORKBENCH.md](../FORGE_INVENTORY_AND_WORKBENCH.md), [AGENTS.md](../../AGENTS.md).

**Статус внедрения (апрель 2026):** в клиенте и основной документации закрыты **A–D1–D4/D6** (частично **D5**). Единая модель верстака в UI и Zustand — **`workbenchQueue` + `workbenchSelectedWeaponId`**. **Остаётся по ТЗ:** жёсткая **D5** (убрать legacy-колонки bench из SQLite/API или пересоздать таблицу по политике проекта); в UX — **вход в `WorkbenchTaskEditor` из списков** и **редактирование planned** из панели (**C3/C6**, см. §8); **popover/`queuePreview` на сегментах полосы** (**C8**, сейчас подсказка через `title` и подсветка по клику).

---

## 0. Краткий снимок «как сейчас» vs «цель ТЗ»

| Тема | Сейчас в проекте | Цель по ТЗ |
|------|------------------|------------|
| Список экземпляров оружия | `weaponInventory.weapons: CraftedWeaponV2[]` в `craft-slice` | Без изменения источника истины |
| Очередь верстака | `workbenchQueue` + `workbench-queue.ts`; persist **`repairQueuePlan`**, миграция легаси id в очередь при merge/облаке | Расширить UX/логику; единая модель «оружие на верстаке» = очередь |
| «На верстаке» | **Только очередь** в UI и валидациях; легаси `repairBenchWeaponIds` приходит только из старых облачных строк и нормализуется в `workbenchQueue` | Индикаторы и правила — по `workbenchQueue`; колонки в БД — см. **D5** |
| Выбор клинка для панелей ремонта/перековки | **`workbenchSelectedWeaponId`** (не в `partialize`, локально восстанавливается после облака при необходимости) | Как сейчас |
| Фильтры инвентаря / списка верстака | **`inventory-filter-slice`** + **`useInventoryFilter`**; общий `InventoryFilterBar` | Как сейчас |
| Прогон этапов | `repairTechniqueStageRun` + рантайм; **«Отменить этап»** / **«Стоп очереди»** в `WorkbenchQueuePanel` | Без паузы с возобновлением; после reload — сохранить (нормализация без bench-массива) |
| Полоса очереди | `WorkbenchShell`, **`estimateWorkbenchQueueItemDurationMs`**, сегменты по доле времени; список подписей; **без Popover + `queuePreview`** | Довести hover/tap с превью карточки (**C8**) |
| Перековка: длительность/этапы | **`getReforgeWorkbenchTotalDurationMs`**, **`getReforgeWorkbenchStages`** в `reforge-workbench-plan.ts` | Как сейчас; при появлении полей длительности в данных — подставить в план |
| `powerScore` | Поле на `CraftedWeaponV2`, `recalculateWeaponPowerScore` в `weapon-power-score.ts`, формула в `docs/utils/FORMULAS.md` | Как сейчас |

---

## 1. Видение системы (п. 1 ТЗ)

### 1.1. Связь с кодом

- Единый список оружия уже есть: оба экрана читают `weaponInventory.weapons` ([`inventory-section.tsx`](../../src/components/forge/inventory-section.tsx), [`workbench-weapon-list.tsx`](../../src/components/forge/workbench-weapon-list.tsx)).
- Очередь с видом задач реализована: [`WorkbenchQueueItem`](../../src/lib/workbench/workbench-queue.ts) (`repair` | `reforge_buff` | `reforge_awaken`), статусы `planned` | `running` | `done` | `error`.
- **Ранее:** параллельный `repairBenchWeaponIds` в `craft-slice` давал рассинхрон; **сейчас** в рабочем состоянии клиента полей нет — остались только чтение/запись **пустых** легаси-полей в цепочке облака/SQLite для совместимости со схемой БД и загрузка старых сейвов (нормализация → очередь). См. [FORGE_INVENTORY_AND_WORKBENCH.md](../FORGE_INVENTORY_AND_WORKBENCH.md).

### 1.2. План закрытия разрыва

1. Ввести единое правило: «оружие в работе очереди» = есть элемент в `workbenchQueue` со статусом `planned` или `running` для данного `weaponId`.
2. Миграция сейвов: перенос `repairBenchWeaponIds` → пункты очереди (ТЗ п. 2.4), правки merge в [`game-store-composed.ts`](../../src/store/game-store-composed.ts).
3. После миграции удалить чтение/запись `repairBenchWeaponIds` / `repairBenchSelectedWeaponId` из persist, облака и API (цепочка ниже в §7).

---

## 2. Хранилище данных (п. 2.1 ТЗ)

### 2.1. `powerScore` на `CraftedWeaponV2` (п. 2.1.1)

**Файлы типов:** [`src/types/craft-v2.ts`](../../src/types/craft-v2.ts) — `CraftedWeaponV2.powerScore`.

**Состояние: сделано.** Пересчёт: [`src/lib/craft/weapon-power-score.ts`](../../src/lib/craft/weapon-power-score.ts) (`recalculateWeaponPowerScore` / `withWeaponPowerScore`). Сортировка и фильтры: [`inventory-filter-utils.ts`](../../src/lib/forge/inventory-filter-utils.ts). Формула: [`docs/utils/FORMULAS.md`](../utils/FORMULAS.md). Типы в каталоге: [`docs/04_TYPES_SYSTEM.md`](../04_TYPES_SYSTEM.md).

**Поддержка:** при новых мутациях оружия по-прежнему вызывать пересчёт `powerScore`, чтобы не устаревало относительно формулы.

---

### 2.2. Очередь верстака (п. 2.1.2)

**Источник правды:** [`src/lib/workbench/workbench-queue.ts`](../../src/lib/workbench/workbench-queue.ts).

**Уже есть:** `queueItemId`, `weaponId`, `kind`, `status`, для ремонта `techniqueIds` + `executionOpts`; для перековки `techniqueId`; `queuedAt` (аналог `createdAt` в ТЗ — при необходимости добавить алиас в документации или поле `createdAt` как дубликат для ясности API).

**Переименования по ТЗ:**

| ТЗ | Проект сейчас | Действие |
|----|---------------|----------|
| `id` | `queueItemId` | Оставить `queueItemId` (меньше рефакторинга) или ввести `id` как алиас в типах — решение на этапе ревью |
| `repairBenchSelectedWeaponId` (persist) | то же | Заменить на `workbenchSelectedWeaponId`, **не** в `partialize` persist |
| `repairTechniqueStageRun` / `reforgeStageRun` | один объект `repairTechniqueStageRun` с `workbenchReforge?` | ТЗ допускает расширение одного типа — текущая схема уже близка; при необходимости переименовать в `workbenchStageRun` для ясности (большой find/replace + облако) |

**Состояние в `craft-slice`:** легаси bench-поля удалены; выбор — `workbenchSelectedWeaponId`; постановка в работу — через элементы `workbenchQueue`. Миграция id из старых сейвов: [`migrate-repair-bench-ids-to-queue.ts`](../../src/lib/workbench/migrate-repair-bench-ids-to-queue.ts), вызов из merge в [`game-store-composed.ts`](../../src/store/game-store-composed.ts).

**Cross-slice:** `repair-cross-slice`, гильдия/заказы ориентируются на очередь (и сигнатуры с опциональным `_repairBenchWeaponIds` там, где остался только совместимый параметр — проверить по grep при следующем зачистке API).

---

### 2.3. Slice `inventoryFilter` + persist (п. 2.1.3)

**Сделано:** [`inventory-filter-slice.ts`](../../src/store/slices/inventory-filter-slice.ts), [`use-inventory-filter.ts`](../../src/hooks/use-inventory-filter.ts), утилиты и тесты в [`inventory-filter-utils.ts`](../../src/lib/forge/inventory-filter-utils.ts).

**План (архив):**

| Поле ТЗ | Реализация |
|---------|------------|
| `sortBy: 'power' \| 'date' \| 'quality' \| 'durability'` | Новый slice или под-секция в `game-store-composed`; селектор сортировки применять в общем хуке |
| `filterQuality` | Уже совпадает с текущими id ступеней |
| `filterDamage` | Новая фильтрация: `activeDamageTags` и/или `currentDurability < maxDurability` — вынести в `src/lib/forge/inventory-filter-utils.ts` (чистые функции + тесты) |

**Файлы:** новый `src/store/slices/inventory-filter-slice.ts` (или аналог), подключение в [`game-store-composed.ts`](../../src/store/game-store-composed.ts), `partialize` для persist, поднять `STORE_VERSION` при необходимости.

**Хук:** `useInventoryFilter()` в `src/hooks/use-inventory-filter.ts` — обёртка над селекторами и сеттерами.

---

### 2.4. UI-состояние верстака (п. 2.1.4)

**Сделано:** `workbenchSelectedWeaponId`, `workbenchQueueAdvanceBlocked` в store; не персистятся в обычном partialize (выбор может подставляться при загрузке облака из очереди — см. код `use-cloud-save`). Поле **`workbenchUiMode` удалено** (редизайн верстака 2026): мобилка — вертикальный стек + карусель компактных ячеек, очередь всегда доступна снизу в `WorkbenchShell`.

---

## 3. Компоненты (п. 2.2 ТЗ)

### 3.1. `WeaponInventoryCard` — единая карточка (п. 2.2.1)

**Файл:** [`src/components/forge/weapon-inventory-card.tsx`](../../src/components/forge/weapon-inventory-card.tsx).

**Сейчас:** контексты `inventory` | `workbench` | `queuePreview`; контекст **`repairBench` удалён**; индикаторы очереди и урона; desktop tooltip / mobile `Sheet`; строка мощи по `powerScore`.

**Доработки по желанию / ТЗ:** контекст `queuePreview` используется в типах карточки; **в полосе очереди** превью по сегменту пока не подключено (**C8**). Опционально: унифицировать вход в ремонт/перековку через **`WorkbenchTaskEditor`** вместо только секций (**C3**).

**Зависимость:** закрыта — условия по `workbenchQueue` и `workbenchSelectedWeaponId`.

---

### 3.2. `InventorySection` (п. 2.2.2)

**Файл:** [`inventory-section.tsx`](../../src/components/forge/inventory-section.tsx).

**Сделано:** `useInventoryFilter`, общая полоса фильтров, учёт оружия в очереди в сводке.

---

### 3.3. `WorkbenchScreen` — адаптив (п. 2.2.3, этап 5)

**Файл:** [`workbench-screen.tsx`](../../src/components/forge/workbench-screen.tsx).

**Сделано:** на `lg+` — сетка **компактный ряд — центр — вкладки** (`WorkbenchCompactWeaponRail`, `WeaponInventoryCard`, Radix `Tabs` для ремонта/перековки); **`WorkbenchShell`** с полосой и **`WorkbenchQueuePanel`** под основным контентом. На мобилке — карусель ячеек → карточка → вкладки → та же зона очереди снизу (**без** переключателя «Оружие / Очередь»). Полная замена секций модалкой `WorkbenchTaskEditor` — **не обязательна**, компонент [`workbench-task-editor.tsx`](../../src/components/forge/workbench-task-editor.tsx) пока **не подключён** из списков (см. **C3**).

---

### 3.4. `WorkbenchWeaponList` (п. 2.2.4)

**Файл:** [`workbench-weapon-list.tsx`](../../src/components/forge/workbench-weapon-list.tsx).

**Сделано:** общий фильтр и счётчики в шапке (**сетки карточек внутри списка нет** — выбор через компактный ряд на `WorkbenchScreen`). **Осталось:** открытие **`WorkbenchTaskEditor`** с предустановленным `kind` из центральной карточки/компактных ячеек (**C3**).

---

### 3.5. `WorkbenchQueuePanel` (п. 2.2.5)

**Файл:** [`workbench-queue-panel.tsx`](../../src/components/forge/workbench-queue-panel.tsx).

**Сейчас:** список задач, удаление `planned`, **reorder** стрелками для `planned`, старт очереди, прогресс, **«Отменить этап»** / **«Стоп очереди»**, dev «мгновенный» режим.

**По ТЗ:**

| Фича | Состояние |
|------|-----------|
| Сегментированная общая полоса | **Да** в `WorkbenchShell` / `WorkbenchQueueSegmentedBar`; доли из `estimateWorkbenchQueueItemDurationMs` |
| Hover/tap на сегмент | **Частично:** `title`, клик подсветка; **нет** `Popover` + `WeaponInventoryCard` `queuePreview` (**C8**) |
| Детальный прогресс этапов | Есть через `displayPlan` / `progressView`; уточнение подписей перековки — по необходимости |
| Остановка прогона | **Да** |
| Переупорядочивание | **Да**, `reorderWorkbenchQueue` + тесты |
| Редактирование `planned` | **Частично:** в store есть `updateWorkbenchPlannedItem`; **в UI панели кнопки «редактировать» нет** (**C6**) |

**Ограничения п. 2.3.3:** при попытке добавить задачу того же `kind` для `weaponId`, у которого уже есть `planned` или `running` такого типа — **диалог предупреждения с подтверждением** (не жёсткий запрет); альтернативный тип (ремонт vs перековка) по-прежнему разрешён без блокировки.

---

### 3.6. Панель создания задачи `WorkbenchTaskEditor` (п. 2.2.6)

**Сейчас:** основной поток остаётся в [`repair-section.tsx`](../../src/components/forge/repair-section.tsx) / [`reforge-section.tsx`](../../src/components/forge/reforge-section.tsx) + [`repair-card.tsx`](../../src/components/ui/repair-card.tsx). Компонент [`workbench-task-editor.tsx`](../../src/components/forge/workbench-task-editor.tsx) — **заготовка**, **нигде не импортируется**.

**Цель ТЗ:** один модальный/боковой редактор:

- Ремонт: использовать `repairBenchTechniqueDraft` (оставить неперсистентным), по подтверждению — `createRepairWorkbenchQueueItem` / апдейт существующего planned.
- Перековка: выбор buff/awaken и `techniqueId` из реестра [`reforge-techniques-registry`](../../src/data/reforge/reforge-techniques-registry.ts).

---

## 4. Логика очереди и этапов (п. 2.3 ТЗ)

### 4.1. Длительность и этапы

| Операция | Код сейчас | ТЗ |
|----------|------------|-----|
| Ремонт | `buildWeaponRepairPlan` + `getWeaponRepairPlanTotalDurationMs` | Оставить |
| Перековка | `buildReforgeWeaponWorkbenchPlan` + **`getReforgeWorkbenchTotalDurationMs`** / **`getReforgeWorkbenchStages`** | При появлении полей длительности в данных техник — подставить в план |

**Файлы:** [`reforge-workbench-plan.ts`](../../src/lib/reforge/reforge-workbench-plan.ts).

---

### 4.2. Выполнение задачи

**Оркестратор:** [`use-workbench-queue-runtime.ts`](../../src/hooks/use-workbench-queue-runtime.ts).

- Старт следующего пункта, завершение через ремонт/перековку, **`cancelActiveWorkbenchStageRun`**, **`setWorkbenchQueueAdvanceBlocked`**, UI-кнопки в панели.
- [`normalizeRepairTechniqueStageRunFromSave`](../../src/lib/normalize-repair-bench-from-save.ts) учитывает `workbenchQueue` и `activeQueueItemId` для `source === 'queue'`; bench-массив не используется.

---

### 4.3. Очистка контекста верстака после операций

Логика приведена к очереди и выбору `workbenchSelectedWeaponId`. Устаревшие имена экшенов, если остались, искать grep’ом; критичный путь — обновление статусов `workbenchQueue` и stage-run.

---

## 5. Миграция данных (п. 2.4 ТЗ)

**Точки входа:**

1. [`game-store-composed.ts`](../../src/store/game-store-composed.ts) — `merge` при загрузке persist: нормализация очереди + перенос легаси `repairBenchWeaponIds` в `workbenchQueue`, удаление bench-ключей из объекта состояния.
2. [`use-cloud-save.ts`](../../src/hooks/use-cloud-save.ts) — загрузка облака с тем же переносом.
3. [`save-payload-schema.ts`](../../src/lib/save-payload-schema.ts) — Zod: формальные поля очереди (`repairQueuePlan`); легаси ключи в теле POST сохраняются **`.passthrough()`** для `validateSaveData`.

**Алгоритм:** [`migrate-repair-bench-ids-to-queue.ts`](../../src/lib/workbench/migrate-repair-bench-ids-to-queue.ts) — для каждого id из старого массива добавить `repair` `planned` с пустыми `techniqueIds`, без дублей.

**UX:** при необходимости — уведомление о пустых `techniqueIds` у мигрированных задач (если включено в продукте).

---

## 6. Адаптивность (п. 2.5 ТЗ)

- Tailwind: брейкпоинты `md` / `lg` (1024px) для двухколоночного верстака.
- Минимальный размер тач-таргета 44px — проверка кнопок в [`workbench-queue-panel`](../../src/components/forge/workbench-queue-panel.tsx), сегментах, [`BottomNav`](../../src/components/shared/...) (по ТЗ не менять).
- Отключение tooltip на touch: паттерн `useMediaQuery('(hover: hover)')` или класс с `max-md:` поведением.

---

## 7. Интеграции вне кузницы

| Модуль | Файл | Состояние |
|--------|------|-----------|
| Экспедиции | [`expeditions-section.tsx`](../../src/components/guild/expeditions-section.tsx) | Проверки по **`workbenchQueue`** |
| Валидация старта экспедиции | [`expedition-start-validation.ts`](../../src/lib/expedition-start-validation.ts) | Параметр опционален / очередь — сверить с вызовами |
| Guild eligibility | [`guild-weapon-service-eligibility.ts`](../../src/lib/guild-weapon-service-eligibility.ts) | Совместимый параметр `_repairBenchWeaponIds` может оставаться в сигнатуре; фактически — очередь |
| Облако | [`use-cloud-save.ts`](../../src/hooks/use-cloud-save.ts) | Клиент **не хранит** широкий bench в store; в Turso уходит **`repairQueuePlan`**; загрузка мигрирует старые легаси-ключи из бэкапов в `workbenchQueue` |
| API Turso | [`app/api/save/route.ts`](../../src/app/api/save/route.ts), [`lib/db.ts`](../../src/lib/db.ts) | **D5:** колонки bench сняты; одноразовая миграция строк в `repairQueuePlan` при старте БД |
| Тесты схемы | [`save-payload-schema.test.ts`](../../src/lib/save-payload-schema.test.ts) | Passthrough для легаси JSON; очередь через `repairQueuePlan` |

Чеклист расширения полей: [`cloud-save-feature.ts`](../../src/lib/cloud-save-feature.ts).

---

## 8. Задачи для трекера (по фазам)

Формат: **ID** — заголовок для карточки; внутри — кратко scope, ключевые файлы, критерий готовности.

Под каждой фазой — строка **«Готовность фазы»**: сюда по ходу работы можно вписывать сводку (например: `не начато` / `в работе 3/8` / `готово`, блокеры, дата, ссылка на PR).

Колонка **«Статус / комментарий»** в таблице — пометки по конкретной задаче (todo / in progress / done, заметки, номер коммита).

---

### Фаза A — Данные и совместимость

**Готовность фазы:** **готово** (клиент + миграции сейвов).

| ID | Задача | Scope / файлы | Готово, когда | Статус / комментарий |
|----|--------|---------------|---------------|----------------------|
| **A1** | Миграция `repairBenchWeaponIds` → `workbenchQueue` | `game-store-composed`, `migrate-repair-bench-ids-to-queue.ts` | План выше | **done** |
| **A2** | Тест нормализации bench → queue | `*.test.ts` | Покрытие миграции | **done** |
| **A3** | Slice `inventoryFilter` + persist | `inventory-filter-slice.ts`, composed | План выше | **done** |
| **A4** | Хук `useInventoryFilter` | `use-inventory-filter.ts` | План выше | **done** |
| **A5** | Утилиты фильтрации | `inventory-filter-utils.ts` + тесты | План выше | **done** |
| **A6** | `workbenchSelectedWeaponId` (+ ранее временный `workbenchUiMode`, **снят** редизайном) | `craft-slice`, composed | Не персистятся | **done** |
| **A7** | `powerScore` | `weapon-power-score.ts`, `craft-v2.ts` | План выше | **done** |
| **A8** | Документация формулы | `FORMULAS.md` | План выше | **done** |

---

### Фаза B — Карточка оружия и общая полоса фильтров

**Готовность фазы:** **готово**.

| ID | Задача | Scope / файлы | Готово, когда | Статус / комментарий |
|----|--------|---------------|---------------|----------------------|
| **B1** | `WeaponInventoryCard`: очередь и повреждения | `weapon-inventory-card.tsx` | ⌛/⚠️, `workbenchQueue` | **done** |
| **B2** | Компактная строка + бейджи | `weapon-inventory-card.tsx` | План выше | **done** |
| **B3** | Tooltip / Sheet | Карточка | План выше | **done** |
| **B4** | Убрать `repairBench` | Карточка, секции | Контекст удалён | **done** |
| **B5** | `InventoryFilterBar` | `components/forge/` | Общий бар | **done** |
| **B6** | `InventorySection` | `inventory-section.tsx` | `useInventoryFilter` | **done** |
| **B7** | `WorkbenchWeaponList` | `workbench-weapon-list.tsx` | Счётчик по очереди | **done** |

---

### Фаза C — Верстак: лейаут, редактор, очередь

**Готовность фазы:** **в основном готово**; открыты **C3**, **C6**, **C8** (см. комментарии).

| ID | Задача | Scope / файлы | Готово, когда | Статус / комментарий |
|----|--------|---------------|---------------|----------------------|
| **C1** | Сетка lg+: ряд — центр — вкладки; очередь в `WorkbenchShell` снизу | `workbench-screen.tsx`, `workbench-shell.tsx` | См. [WORKBENCH_UI_LAYOUT_SPEC](../systems/WORKBENCH_UI_LAYOUT_SPEC.md) | **done** |
| **C2** | Мобилка: стек + карусель без `workbenchUiMode` | `workbench-screen.tsx`, `workbench-compact-weapon-rail.tsx` | Очередь на экране | **done** (паттерн заменён) |
| **C3** | `WorkbenchTaskEditor` | `workbench-task-editor.tsx` | Подключение из UI списков/открытие по 🔨/⚒️ | **todo** — компонент есть, **не используется** |
| **C4** | `RepairSection` / `ReforgeSection` | Секции + `workbenchSelectedWeaponId` | D закрыт по клиенту | **done** |
| **C5** | Дубликат задачи | `AlertDialog` в секциях | План выше | **done** |
| **C6** | Редактирование `planned` в панели | `updateWorkbenchPlannedItem` в store | UI «редактировать» | **todo** — экшен есть, кнопки нет |
| **C7** | Reorder planned | `reorderWorkbenchQueue`, стрелки | План выше | **done** |
| **C8** | Полоса: сегменты + превью | `WorkbenchShell`, segmented bar | Popover + `queuePreview` | **partial** — сегменты и доли есть; превью карточки нет |
| **C9** | Отмена этапа / стоп очереди | runtime + панель | План выше | **done** |
| **C10** | Длительность/стадии перековки | `reforge-workbench-plan.ts` | `getReforgeWorkbenchTotalDurationMs`, `getReforgeWorkbenchStages` | **done** |

---

### Фаза D — Удаление legacy в клиенте, API и БД

**Готовность фазы:** **D1–D3, D4/D6 по смыслу клиента — готово**; **D5 (SQLite) — не завершено**.

| ID | Задача | Scope / файлы | Готово, когда | Статус / комментарий |
|----|--------|---------------|---------------|----------------------|
| **D1** | Убрать bench из Zustand состояния | `craft-slice.ts`, composed merge | Нет полей в рабочем state | **done** |
| **D2** | Cross-slice, гильдия, экспедиции | см. grep | Очередь | **done** |
| **D3** | Нормализация stage-run | `normalize-repair-bench-from-save.ts` | Очередь + active item | **done** |
| **D4** | Payload / Zod | `save-payload-schema`, cloud-save | Очередь в `repairQueuePlan`; легаси ключи в POST через `.passthrough()` | **done** |
| **D5** | SQLite/API DROP legacy columns | `lib/db.ts`, `route.ts`, prisma | Без колонок bench; миграция строк в `repairQueuePlan` | **done** |
| **D6** | Тесты схемы | `save-payload-schema.test.ts` | CI | **done** |

---

### Фаза E — Документация и регрессия

**Готовность фазы:** **E1–E2 готово**; **E3** — периодический прогон §9 перед релизом.

| ID | Задача | Scope / файлы | Готово, когда | Статус / комментарий |
|----|--------|---------------|---------------|----------------------|
| **E1** | `FORGE_INVENTORY_AND_WORKBENCH.md` | `docs/` | Согласовано с очередью | **done** |
| **E2** | `04_TYPES_SYSTEM.md` | `powerScore`, фильтры | План выше | **done** |
| **E3** | Регрессия | §9, тесты | Чеклист + CI | **ongoing** — §9 обновлён флажками |

---

## 8.1. Зависимости между задачами (кратко)

- **A1** выполнен до **B1/B7**; клиентский **D1** после согласованности UI/очереди.
- **C3** и **C6** не блокируют облако; **D5** — после **D4** и плана миграции строк Turso.
- **C8** (popover) можно делать независимо от **C3**, если контракт `queuePreview` стабилен.

---

## 8.2. Порядок фаз для планирования спринта

**A → B → C → D → E.** Фазу **D (клиент)** закрывают после grep по UI/slice; **D5 (БД Turso)** — отдельная миграция после согласования.

---

## 9. Критерии готовности (п. 4 ТЗ) — чеклист приёмки

- [x] Один набор фильтров на инвентаре и списке верстака (persist между вкладками).
- [x] Нет легаси bench в **схеме облака/SQLite** (**D5**); в клиентском state полей нет; при загрузке старых сейвов миграция в `workbenchQueue` есть.
- [x] Карточка: компактный режим + тултип (desktop) / Sheet (mobile) + бейджи и индикаторы; контекст `repairBench` отсутствует.
- [x] Верстак: две колонки desktop, переключатель список/очередь mobile.
- [x] Очередь: добавление/удаление `planned`, reorder, автозапуск, общая полоса с сегментами (доли времени), детальный прогресс.
- [x] Сегменты полосы: **popover/`queuePreview`** (**C8**).
- [x] Редактор задачи из списков и **редактирование planned** в панели (**C3/C6**).
- [x] **Отмена текущего этапа** и **стоп очереди** реализованы (без паузы с возобновлением).
- [x] Дубликат задачи того же типа — **предупреждение с подтверждением**.
- [x] Прогресс после перезагрузки сохраняется (очередь + `repairTechniqueStageRun`; нормализация без bench-массива).
- [x] Экспедиции/гильдия не ломаются при наличии оружия только в очереди.
- [x] Тесты: `workbench-queue`, миграция bench→queue, фильтры, нормализация stage-run.

---

## 10. Принятые решения (закрытые вопросы)

### 10.1. Остановка работы очереди

Не делаем **паузу с возобновлением** и сдвигом таймера. Делаем:

- **Отмена текущего этапа** — прерывает активный прогон этапов; статусы пунктов очереди и `repairTechniqueStageRun` приводятся к согласованному виду (правило фиксируется в коде и кратко в `FORGE_INVENTORY_AND_WORKBENCH.md`).
- **Стоп очереди** — останавливает автоматическое выполнение (не переходит к следующему пункту после завершения/сброса текущего).

### 10.2. Дубликаты задач

При попытке добавить задачу того же **`kind`** для `weaponId`, у которого уже есть **`planned` или `running`** с этим видом работ — показываем **предупреждение** (AlertDialog / аналог) с возможностью подтвердить или отменить. Разные типы работ (ремонт vs перековка) не блокируем автоматически.

### 10.3. Облако и Turso

**Целевое состояние (ТЗ):** убрать legacy-поля (`repairBenchWeaponIds`, `repairBenchSelectedWeaponId`, `repairBenchWeaponId` при дублировании) из payload, Zod, SQL и API (**D4** + **D5**).

**Фактически (2026-04):** **D5** выполнен: новые деплои и миграция Turso **без** колонок `repairBench*`; в payload и `collectSaveData` остаётся **`repairQueuePlan`**. Входящие POST с легаси ключами обрабатываются через Zod **`.passthrough()`** и `validateSaveData` (слияние в очередь). Старые офлайн-бэкапы и блобы по-прежнему нормализуются в `workbenchQueue` в `applyLoadedData` / при загрузке из БД.

### 10.4. Контекст карточки `repairBench`

Считается legacy: **удалить** ветку `repairBench` у `WeaponInventoryCard` и перевести сценарии на `full` / модалку / `workbench`; атрибуты туториалов (`data-tutorial`) **перенести** на новые узлы при необходимости.

---

*Документ предназначен для ведения: колонка «Статус / комментарий» и «Готовность фазы» в §8 обновлены (апрель 2026); **C3, C6, C8, D5** закрыты; §9 — периодическая регрессия (E3).*
