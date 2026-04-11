---
name: technique-wiring
description: >-
  SwordCraft: добавить новую технику и подключить её в реестрах, UI и тестах — боевые приёмы,
  обработка материалов, изучение, перековка, ремонт; микрозадачи (microTasks) и ссылки на roadmap.
  Use when adding a technique, registering craft/material processing/reforge/repair/study, or
  "подключить технику в проект".
---

# Technique wiring — подключение техники в SwordCraft

Канон процесса и энциклопедии: **[docs/ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md](../../../docs/ENCYCLOPEDIA_MATERIALS_TECHNIQUES_ROADMAP.md)** — **§3** (семейства), **§10** (микрозадачи), **§12** (**Крафтовая линия**: порядок техник `craftLinePhase` / `craftLineOrder`, блоки и микроэтапы на полосе, доли времени), **§4** (фазы). Материалы и операции: **[docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md](../../../docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md)** **§3.2**, **§5**.

Общий контекст проекта: **[AGENTS.md](../../../AGENTS.md)**.

## Когда применять

- Новая **боевая техника** ковки (`Technique`).
- Новая **техника обработки материала** (`MaterialProcessingTechnique`) / операции плавки, дерева, камня, кожи.
- Новые строки **изучения**, **перековки**, **ремонта**.
- Нужно прописать **микрозадачи** (ход работы для игрока и задел под таймлайн).

## Перед кодом

1. Определить **семейство** (энциклопедия §3): `craft` | `material_processing` | `material_study` | `reforge` | `repair`.
2. Прочитать **§10.2** ENC roadmap: поле **`microTasks`**, тип `TechniqueMicroTask` — для стабильных **`id`** шагов см. **[technique-microtasks](../technique-microtasks/SKILL.md)**.
3. Проверить **§4.1** ENC roadmap (риски: порядок на **Крафтовой линии**, `craftLinePhase`, сканер после A2).
4. Проверить **несовместимости**: `incompatibleWithCraftTechniqueIds`, `incompatibleWithMaterialProcessingTechniqueIds`, перековка `sourceCraftTechniqueId`, алтарь `requiredMaterialProcessingTechniqueIds` в данных фаз.

## Чеклист по семействам

### Боевые приёмы (`Technique`)

| Шаг | Файлы |
|-----|--------|
| Запись | [`src/data/techniques/basic.ts`](../../../src/data/techniques/basic.ts) или [`advanced.ts`](../../../src/data/techniques/advanced.ts) |
| Реестр | [`src/data/techniques/index.ts`](../../../src/data/techniques/index.ts) подхватывает массивы автоматически |
| Тип | [`src/types/craft-v2.ts`](../../../src/types/craft-v2.ts) — при расширении полей (например `microTasks`) обновить интерфейс и документацию |
| Связь | Калькулятор [`src/lib/craft/calculator.ts`](../../../src/lib/craft/calculator.ts), прогноз, планировщик Craft v2 |
| Микрозадачи | Массив шагов в данных техники; краткие подписи для игрока |

### Обработка материалов (`MaterialProcessingTechnique`)

| Шаг | Файлы |
|-----|--------|
| Запись | [`src/data/material-processing-techniques.ts`](../../../src/data/material-processing-techniques.ts) |
| Операции | `processingOperations` + при необходимости [`refining-recipes.ts`](../../../src/data/refining-recipes.ts), мост [`inventory-check.ts`](../../../src/lib/craft/inventory-check.ts) |
| Таймлайн | [`src/lib/craft/process-generator.ts`](../../../src/lib/craft/process-generator.ts), [`use-craft-v2.ts`](../../../src/hooks/use-craft-v2.ts) |
| Тесты | [`material-processing-techniques.test.ts`](../../../src/data/material-processing-techniques.test.ts), [`material-processing-techniques-operations.test.ts`](../../../src/data/material-processing-techniques-operations.test.ts) |
| Микрозадачи | Явный список **или** временный fallback из операций (ENC §10.3) |

### Изучение в энциклопедии

| Шаг | Файлы |
|-----|--------|
| Запись | [`src/data/material-study-techniques.ts`](../../../src/data/material-study-techniques.ts), тип [`src/types/material-study.ts`](../../../src/types/material-study.ts) |
| Store | [`src/store/slices/encyclopedia-slice.ts`](../../../src/store/slices/encyclopedia-slice.ts) при изменении контракта сессий |

### Перековка

| Шаг | Файлы |
|-----|--------|
| Запись | [`src/data/reforge/reforge-techniques-registry.ts`](../../../src/data/reforge/reforge-techniques-registry.ts) |
| Применение | [`src/lib/reforge/apply.ts`](../../../src/lib/reforge/apply.ts), дока `docs/systems/ENCHANTMENT_MODULE_PHASE1.md` |

### Ремонт

| Шаг | Файлы |
|-----|--------|
| Запись | [`src/data/weapon-damage/repair-techniques-registry.ts`](../../../src/data/weapon-damage/repair-techniques-registry.ts) |
| Тип | [`src/types/weapon-repair.ts`](../../../src/types/weapon-repair.ts) |
| Связь | Теги урона, [`repair-cross-slice`](../../../src/store/cross-slice/repair-cross-slice.ts) |

## Микрозадачи и Крафтовая линия (когда §10/§12 внедрены)

- **Имена и id шагов:** **[technique-microtasks](../technique-microtasks/SKILL.md)**.
- Каждая запись: хотя бы **один** осмысленный шаг или явно пустой массив до контента.
- Пример формулировок: короткие глаголы / существительные («Обжиг руды», «Цементация»), без дублирования полного `description`.
- Если техника уже имеет **`stages`** (ремонт) или **`processingOperations`**, синхронизировать смысл с `microTasks`, чтобы энциклопедия, **Крафтовая линия** и таймлайн не расходились.
- **Порядок на линии:** у новой техники задать **фазу линии** и при необходимости **`craftLineOrder`** (см. ENC **§12.3**): обработка материала / плавка — раньше боевых приёмов и финишной сборки, если нет явного исключения в данных.
- **Цвет блока:** зарезервировать токен темы для техники или семейства (ENC **§12.1**), чтобы полоска была стабильной в кузнице и других экранах.

## После изменений

По [AGENTS.md](../../../AGENTS.md): `npm run lint`, `npm run test`, `npm run type-check`. Затронуты типы/игровые системы — обновить [docs/04_TYPES_SYSTEM.md](../../../docs/04_TYPES_SYSTEM.md) или целевой `docs/systems/*` по правилам репозитория.

## Антипаттерны

- Добавлять технику только в UI без записи в **источник правды** реестра.
- Дублировать длинные цепочки шагов только в хардкоде сообщений крафта вместо данных микрозадач (**§10.6** ENC roadmap).
- Путать **боевую** технику (`data/techniques`) и **обработку материала** (`material-processing-techniques.ts`) — разные контуры ([MATERIALS_SINGLE_SOURCE_ROADMAP §5.4](../../../docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md)).

## Связь с другими skills

- **[material-definition-wizard](../material-definition-wizard/SKILL.md)** — новый **материал** каталога, не техника.
- **[materials-a2-wave](../materials-a2-wave/SKILL.md)** — волна склада A2 и `materialId`; при технике обработки с новыми расходами сверяться с A2 и `inventory-check`.
- **[weapon-recipe-authoring](../weapon-recipe-authoring/SKILL.md)** — новый **рецепт оружия** и регистрация в `allRecipes`; с техниками согласовывать при изменении процесса крафта под рецепт.
