# Аудит и план внедрения модуля экспедиций (rework)

**Статус:** живой документ — дополняется по мере интеграции.  
**Источник модуля:** `docs/expediions_rework/` (код: `src/modules/expeditions`; спека: `exped/ProjectStructure/`).  
**Дата создания файла:** 2026-04-01.

---

## Принципы (зафиксировано)

1. **Канон контента и логики экспедиций** — новый модуль из `expediions_rework` (локации, миссии, события, баланс модуля, генератор событий). Текущая экспедиционная система в проекте **отключается и удаляется из потока данных** (`expedition-templates`, старый пул событий, селектор и т.д.), а не живёт параллельно.

2. **Всё новое из модуля — часть проекта.** Если в rework появляются сущности, полей или поведения, которых **нет** в кодовой базе (типы миссий, модель активного события, поля активной экспедиции, правила наград, конфиг баланса и пр.), их нужно **внедрить в проект явно**: типы в `src/types`, данные в `src/data`, логика рядом с модулем экспедиций, проводка через store/API/persist **без постоянных «прослоек» и дублирования источников правды**. Допустимы временные адаптеры только на переходный этап с чёткой датой удаления.

3. **Интеграция через рефакторинг**, а не через долговечные костыли. Точки соприкосновения (калькулятор исхода, модификаторы, UI гильдии, сохранения) **перепроектируются** так, чтобы новый контент и новая модель событий были **первоклассными** в архитектуре репозитория. Не оставлять второй параллельный формат «для совместимости» без необходимости.

4. **Канон данных материалов для крафта/энциклопедии** — **проект** (`src/data/materials/**`, `MaterialNode`, теги, экспертиза). Модуль экспедиций не держит параллельную «истину» по материалам: только ссылки на `id` из библиотеки проекта.

5. **Стабильные домены хоста** — оружие (`CraftedWeaponV2` и хелперы), искатели (`Adventurer` / `AdventurerExtended` и провайдеры модификаторов), складские `ResourceKey`, слои энциклопедии и стора **остаются доминирующими по своей области**: новый модуль **не меняет** их контракты ради себя, а **использует** их как входы/выходы. При этом расширение **экспедиционного** слоя (типы, поля гильдии, persist) делается полноценно в проекте.

6. **Материалы в данных экспедиции:**
   - **Уже есть в проекте** — в миссиях/локациях/эффектах модуля все ссылки привести к **тем же `id`**, что в библиотеке проекта (убрать алиасы вида `oak_wood` → `oak`, `iron_ingot` → `iron` и т.д.). Реестр `MATERIAL_REGISTRY` из модуля для таких позиций не использовать как отдельные сущности.
   - **Новые (есть в rework, нет в библиотеке)** — добавить в проект как полноценные `MaterialNode` и подключить ко всем нужным реестрам; данные экспедиций ссылаются только на эти канонические записи.

---

## Обзор модуля `expediions_rework`

| Слой | Содержимое |
|------|------------|
| **Данные** | 11 локаций (tier 1–4), реестр миссий (`MissionTemplate`, `ScalableValue`, договор `exploration` \| `speed`), 108 `EventTemplate` с эффектами (`grant_location_material`, `grant_resource`, …), локальные ресурсы локаций. |
| **Логика** | `event-generator`, `balance-config`, утилиты локаций/миссий/материалов/валидации, тесты. |
| **Контракт с хостом** | `contracts/host-contracts.ts` — ресурсы, оружие, искатели, гильдия, энциклопедия, статистика, квесты восстановления (согласуется с идеей `guild-expedition-cross-slice`). |

Полноценное Next-приложение и `components/ui` из папки rework в основной проект **не переносятся** — только модуль экспедиций и связанные тесты.

**Заметка:** в `exped/ProjectStructure/README.md` упоминается путь `docs/Random_gen2/`; фактически пакет лежит в `docs/expediions_rework` — при переносе поправить ссылки.

---

## Где в проекте сейчас «старое» (к замене)

- `src/data/expedition-templates.ts` — плоские шаблоны.
- `src/data/expedition-events/*`, `src/lib/expedition-event-selector.ts`.
- Типы `src/types/expedition-events.ts` (структура событий в рантайме — возможно расширить/заменить под новый генератор).
- Старт/финиш: `src/store/cross-slice/guild-expedition-cross-slice.ts` — переписать под новый поток (миссии, генератор событий, эффекты). Публичные методы стора можно сохранить или эволюционировать осознанно с обновлением всех вызовов.
- UI: `src/components/guild/expeditions/*` и связанные экраны — под новые сущности (локации, миссии, договор, лог событий с выборами/эффектами).

**Калькулятор исхода** (`src/lib/expedition-calculator-v2.ts`) и провайдеры модификаторов остаются ядром расчёта, но их **входные типы и источник полей** приводятся к одному согласованному контракту с новой моделью миссии (например единый тип «разрешённой экспедиции для расчёта» в `src/types`, заполняемый из `MissionTemplate` + договора + RNG на старте). Устранить дубли `difficultyInfo` / баланса между старым `expedition-templates` и новым модулем — **одна** модель параметров для UI, persist и калькулятора.

---

## Несоответствия, которые нужно закрыть при подгонке

### Миссия vs калькулятор

В модуле — `MissionTemplate` (масштабируемые поля, договор, редкость миссии). Калькулятор исторически завязан на тип из `expedition-templates.ts`.

**Действие:** в проекте ввести **единый** тип/пайплайн: разрешение миссии при старте → сохранение в `ActiveExpedition` всего нужного для расчёта и UI → обновление `expedition-calculator-v2` (и при необходимости провайдеров) так, чтобы он потреблял этот контракт **напрямую**, без второго параллельного описания той же миссии.

### Типы миссий / экспедиций

У модуля: `gather`, `rescue`, `investigate`, `escort` и др.; в проекте может оставаться узкий `ExpeditionType`.

**Действие:** расширить доменную модель в `src/types` и все зависимые места (калькулятор, теги, UI) так, чтобы **все типы из канонического модуля** были представлены явно; точечный «тихий» маппинг в старый enum — только если он временный до полного рефакторинг-прохода.

### События: старая vs новая модель

Сейчас: `ExpeditionEventTemplate` + фильтры по тегам экспедиции → `ExpeditionEvent[]`.  
Модуль: `EventTemplate` + `generateEventsForMission` → инстансы с `templateId`, временем, статусами.

**Действие:** удалить старый селектор и типы, заменив их **проектными** типами рантайм-событий, согласованными с `EventTemplate` / генератором модуля; обновить persist и UI; реализовать применение эффектов в store (идемпотентность — см. `07_INTEGRATION_CHECKLIST.md`).

### `ActiveExpedition`

У модуля в типах фигурируют `locationId`, контракт и др. У проекта — текущий `src/types/guild.ts` без части полей.

**Действие:** расширить `ActiveExpedition`, версию сохранения / миграцию, облачный save (`guild.activeExpeditions`).

### Репутация

По спецификации модуля начисление `reputation` из результата может не совпадать с действием стора.

**Действие:** явно связать с `addReputation` или убрать из пользовательского контракта.

---

## Материалы и энциклопедия: рабочий порядок (фаза 1, расширенная)

**Зачем одна фаза, а не отдельный план:** экспедиции, библиотека `MaterialNode`, коллекции и `encyclopedia-slice` должны ссылаться на **одни и те же `id`**. Навести порядок в энциклопедии и в процессе добавления материалов логично **в том же спринте**, что маппинг под экспедицию; отдельный план имеет смысл только если нужно выпустить «уборку энциклопедии» **раньше**, чем готовы данные экспедиций.

### 1. Единый канон и разрывы

- **Канон для энциклопедии/крафта v2 по данным:** `MaterialNode` в [`src/data/materials/library/`](src/data/materials/library), агрегатор [`materialById`](src/data/materials/library/index.ts).
- **Проверка консистентности:** все ключи из `initialEncyclopediaState.materialKnowledge` в [`encyclopedia-slice.ts`](src/store/slices/encyclopedia-slice.ts) должны иметь полноценный узел в `materialById` (сейчас есть расхождения — например `coal` в стартовых знаниях при отсутствии узла в library; решение: добавить `MaterialNode` или убрать ключ до появления узла).
- **Legacy:** [`src/data/materials/organic.ts`](src/data/materials/organic.ts) и связанные списки под старый тип `Material` — не смешивать с экспедиционными id без явного маппинга; в доке зафиксировать, что **новые** игровые материалы заводятся как `MaterialNode`, а синхронизация с `organic.ts` — отдельная задача при необходимости.

### 2. Шаблоны по классам материалов

Цель: не один «общий пример», а **короткие эталоны по `identity.class`**, чтобы числа и теги не рассинхронились.

- Опираться на тип [`MaterialNode`](src/types/materials/material-core.ts) и **живые файлы** в library: для металлов — [`library/metals/iron.ts`](src/data/materials/library/metals/iron.ts), минералы/камни — [`library/stones/flint.ts`](src/data/materials/library/stones/flint.ts) или [`obsidian.ts`](src/data/materials/library/stones/obsidian.ts), древесина — [`library/woods/oak.ts`](src/data/materials/library/woods/oak.ts) / [`ironwood.ts`](src/data/materials/library/woods/ironwood.ts), кожа — [`library/leathers/tanned_leather.ts`](src/data/materials/library/leathers/tanned_leather.ts), руды — [`library/ores/iron_ore.ts`](src/data/materials/library/ores/iron_ore.ts).
- Для классов с малым числом примеров (`organic`, `other`, условные «травы»/комхим) — **ввести 1–2 опорных новых узла** в фазе 1 и описать в документации диапазоны `economy.tier` / `physical` относительно них.
- В документации дать **чеклист по секциям** `identity` → `physical` → `chemical` → `arcane` → `processing` → `economy` → `summary` → `discovery` → `description` / `icon` / `version` (и опционально `recipe`).

### 3. Документация «как добавлять материал»

- Расширить [`docs/data/MATERIALS_DATA.md`](docs/data/MATERIALS_DATA.md): навигация, канон `MaterialNode`, ссылка на тип, шаги добавления (файл в `library/**` → экспорт из подпапки → запись в [`library/index.ts`](src/data/materials/library/index.ts) → коллекция в [`src/data/materials/collections/`](src/data/materials/collections) → политика энциклопедии).
- Либо вынести детальный гайд в **`docs/data/MATERIALS_ADDING.md`** (предпочтительно при росте объёма), а в `MATERIALS_DATA.md` оставить краткое оглавление и ссылку.
- Обновить при необходимости [`docs/04_TYPES_SYSTEM.md`](docs/04_TYPES_SYSTEM.md) по материальному блоку (если меняются договорённости по классам/коллекциям).
- В [`AGENTS.md`](AGENTS.md) в блоке про материалы добавить одну строку: «полный гайд: …».

### 4. Порядок в энциклопедии (concrete)

- Инвентаризация: `Object.keys(initialEncyclopediaState.materialKnowledge)` vs `materialById`; привести к согласованному набору (добавить узлы или убрать ключи).
- Политика **открытия** для новых материалов экспедиции: задокументировать (стартовая экспертиза 0 / только через `discoverMaterial` / исключения для «базовых» рессурсов).
- При появлении новых коллекций (например органика) — подключить к UI энциклопедии, если оно фильтрует по коллекциям.

### 5. Экспедиция (как раньше, в той же фазе)

1. Сверка всех `materialId` в данных [`src/modules/expeditions/data/locations/`](src/modules/expeditions/data/locations) и в [`src/modules/expeditions/data/materials/index.ts`](src/modules/expeditions/data/materials/index.ts).
2. Таблица соответствий «id модуля → канонический id проекта»; правка данных экспедиции.
3. Новые `MaterialNode` для id без узла; регистрация в library/collections.
4. Автотест: каждый экспедиционный `materialId` ∈ `materialById`.

---

## План фаз внедрения (черновик)

| Фаза | Содержание |
|------|------------|
| 0 | ✅ **Сделано:** код модуля в `src/modules/expeditions` (копия из `docs/expediions_rework/src/modules/expeditions`), без мини-приложения. Импорты относительные внутри модуля; публичный вход — `import { … } from '@/modules/expeditions'`. `tsc` и `npm run test` проходят. Исправления под строгий TS: тип `EventTemplate.effects`, `ResolvedEffectType`, `chance` у эффектов, пресеты `balance-config`, экспорт `BalancePreset`, фильтр событий `LocationType`, дублирующие `export type`, баг реэкспорта `escortMerchantCommon` из `hunt`, дефолт `plotHook` в `createLocation`, тесты. |
| 1 | ✅ **Материалы + энциклопедия + дока** (вкл. 1b): маппинг id; `library`/`collections`; аудит `materialKnowledge` vs `materialById`; **единый каталог** — добыча в экспедиции = тот же `MaterialNode`. **1b:** вкладки `organics`/`gems`, `getDisplayCategory`; переключатель «только открытые»; карточка «не изучено»; `library/world-resources/items/*.ts` + `buildWorldNode` (без тега `expedition`); `library/index.ts` — `worldResourceNodes`; `expeditionMaterialNodes` — алиас из `expedition/index.ts`; реген из `expedition/nodes.ts` + `scripts/gen-world-resource-nodes-from-expedition.mjs` / `split-world-resource-nodes.mjs`. |
| 2 | ✅ **Сделано:** единый баланс сложности [`expedition-difficulty-balance.ts`](../../src/lib/expedition-difficulty-balance.ts) → `difficultyInfo` (шаблоны/UI) и `DIFFICULTY_INFO` (модуль); канон типов [`expedition-domain.ts`](../../src/types/expedition-domain.ts); расширение `ExpeditionType` / сильных–слабых сторон / UI; мост [`expedition-mission-bridge.ts`](../../src/lib/expedition-mission-bridge.ts) + тесты; калькулятор v2 использует `enemyTypes` с шаблона; советы искателей берут `levelRange` из `difficultyInfo`. |
| 3 | ✅ **Сделано:** [`expedition-module-events-host.ts`](../src/lib/expedition-module-events-host.ts) — `buildExpeditionStartEvents` + `aggregateModuleEventEffectsForCompletion`; `startExpeditionFull` / `completeExpeditionFull` в [`guild-expedition-cross-slice.ts`](../src/store/cross-slice/guild-expedition-cross-slice.ts); шаблон при завершении из `expeditionTemplates` или `getMissionById` + мост; поля `ActiveExpedition` (`locationId`, `missionTemplateId`, `contractType`, `moduleEventSnapshots`); на шаблоне — `moduleMissionId` / `moduleContractType`; бонусы шанса успеха и золота из эффектов; `discoverMaterial` по `grant_material`; тест `expedition-module-events-host.test.ts`. |
| 4 | ✅ **Сделано:** список экспедиций — только `MISSION_REGISTRY` → `missionModuleToCalculatorTemplate` в [`expedition-templates.ts`](../src/data/expedition-templates.ts); удалены [`expedition-event-selector.ts`](../src/lib/expedition-event-selector.ts) и каталог [`src/data/expedition-events/`](../src/data/expedition-events/) (старый пул); без миссии модуля `buildExpeditionStartEvents` даёт пустой график; тесты калькулятора и хоста переведены на id миссий дубравы. |
| 5 | ✅ **Сделано (ядро):** доска миссий по локациям [`ExpeditionLocationMissionBoard.tsx`](../src/components/guild/expeditions/ExpeditionLocationMissionBoard.tsx) + [`expeditions-section.tsx`](../src/components/guild/expeditions-section.tsx); договор `exploration` \| `speed` при старте; в журнале [`ExpeditionEventLog.tsx`](../src/components/guild/expeditions/ExpeditionEventLog.tsx) — read-only варианты из `getEventById`; отладка [`expedition-dev-tools.ts`](../src/lib/expedition-dev-tools.ts) (`NODE_ENV=development` или `NEXT_PUBLIC_EXPEDITION_DEV_TOOLS=true`): слайдеры баланса, скип до следующего события / к концу таймера на [`active-expedition-card.tsx`](../src/components/guild/active-expedition-card.tsx); опции старта и скипы в store (`StartExpeditionFullOptions`, `skipExpeditionToNextEvent`, `skipExpeditionTimelineToEnd`). |
| 6 | Persist, API save, миграции сейвов, `expeditionModuleVersion` при необходимости. |
| 7 | Документация (`docs/systems/*`, `04_TYPES_SYSTEM.md`) и тесты (кросс-слайс, генератор, материалы). |

---

## Баланс сложности: два слоя (не путать)

После фазы 2 **единый канон для игрока/UI и калькулятора гильдии** — [`expedition-difficulty-balance.ts`](../src/lib/expedition-difficulty-balance.ts) (`EXPEDITION_DIFFICULTY_BALANCE` → `difficultyInfo`, `DIFFICULTY_INFO`, мост миссии).

Отдельно, **только в данных миссий модуля**, остаётся [`MISSION_DIFFICULTY_CONFIG`](../src/modules/expeditions/data/missions/_mission-template.ts) (`easy` \| `normal` \| `hard` \| `extreme` без `legendary`): множители длительности, «база» успеха, стоимость и т.п. для **генерации контента миссий**. Это не вторая «истина» для шанса провала/потери оружия в калькуляторе v2, а сценарный слой. **На будущее:** при желании жёстко привязать коэффициенты миссий к `ExpeditionDifficulty` / тиру из `EXPEDITION_DIFFICULTY_BALANCE` или явно задокументировать таблицу соответствия `MissionDifficulty` → показатели хоста.

---

## Чеклист приёмки (из модуля)

Использовать как ориентир: `docs/expediions_rework/exped/ProjectStructure/07_INTEGRATION_CHECKLIST.md` — старт/отказ, события, завершение, крит, слава, потеря оружия, War Soul, квест восстановления, награды событий (vNext), persist и облако.

---

## Журнал доработок (по ходу работ)

| Дата | Изменение |
|------|-----------|
| 2026-04-01 | Создан файл: первичный аудит, принципы канона модуля vs хоста, стратегия материалов, план фаз. |
| 2026-04-01 | Уточнены принципы: отключение старой системы; всё новое из модуля — полноценно в проекте; интеграция через рефакторинг, не через долговечные костыли; калькулятор и типы событий — согласование контрактов, а не вечный «мост». |
| 2026-04-01 | **Фаза 0:** перенос модуля в `src/modules/expeditions`, правки компиляции/тестов; источник в `docs/expediions_rework` сохранять как эталон до полного слияния или удалить позже. |
| 2026-04-01 | **План фазы 1 уточнён:** в одном треке с экспедиционными материалами — наведение порядка в энциклопедии (`materialKnowledge` vs `library`), шаблоны по типам материалов, документация добавления новых материалов; отдельный план только если энциклопедия выпускается без блока экспедиций. |
| 2026-04-01 | **Фаза 1 (материалы):** таблица маппинга `docs/expedition-material-id-map.md`; новые `MaterialNode` через `library/expedition/` + регистрация в `library/index.ts`; локации/миссии переведены на канон (`oak`/`birch`/`pine`, `fieldstone`, `obsidian`, `cold_iron`, `bloodstone`); `MATERIAL_REGISTRY` модуля строится из `allMaterials`; коллекции переведены на фильтры по `allMaterials`; тест `expedition-material-integrity.test.ts`; дока `MATERIALS_ADDING.md`, обновления `MATERIALS_DATA.md`, `AGENTS.md`, `04_TYPES_SYSTEM.md`. |
| 2026-04-01 | **Фаза 1b:** энциклопедия — категории `organics`/`gems`, отображение всех записей каталога (переключатель «только открытые»), карточка «не изучено»; материалы добычи — каталог `library/world-resources/` (файл на id), без тега `expedition`; интеграция в `allMaterials`. |
| 2026-04-01 | **Фаза 1b завершена:** `world-resources` (58 узлов), скрипты `gen-world-resource-nodes-from-expedition.mjs` / `split-world-resource-nodes.mjs`; UI энциклопедии + `materialsByClass` дополнен `organic`/`other`. |
| 2026-04-01 | **Фаза 2 (часть 1):** `expedition-domain.ts`; синхронизация модуля `expedition.types` / `MissionType`; `expedition-mission-bridge.ts`; расширены strengths/weaknesses/adventurer UI/quotes; поле `enemyTypes` на шаблоне и в калькуляторе v2. |
| 2026-04-01 | **Фаза 2 (завершение):** `EXPEDITION_DIFFICULTY_BALANCE` как единственный источник чисел сложности; `difficultyInfo` собирается из баланса + презентация; `DIFFICULTY_INFO` модуля — проекция баланса; тест синхронизации хост/модуль. |
| 2026-04-01 | **Фаза 3:** генератор событий модуля в старте экспедиции; persist-снимки событий; при завершении — эффекты без веток выбора (`modify_success_chance`, золото, материалы → энциклопедия); fallback шаблона расчёта через миссию модуля. |
| 2026-04-01 | **Фаза 4:** единый источник шаблонов гильдии — миссии модуля; удалён legacy-пул событий и селектор; ломающее изменение: id экспедиций в сейвах/истории со старыми шаблонами больше не совпадают с реестром (миграция при необходимости — отдельно). |
| 2026-04-01 | **Фаза 5 (первая итерация):** UI гильдии — локации и миссии; договор; журнал с текстом вариантов choice; dev-инструменты баланса и ускорения таймлайна. |

*(Добавлять строки по мере внедрения.)*
