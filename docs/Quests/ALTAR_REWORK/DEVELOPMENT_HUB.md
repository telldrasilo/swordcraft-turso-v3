# Алтарь v2 — хаб разработки и журнал

**Назначение:** единая точка входа для внедрения строительства алтаря и расширенного квеста «Эхо забытой кузни»; фиксация решений, статуса этапов и записей по ходу работ.

**Версия хаба:** 1.1  
**Последнее обновление:** 2026-04-09  

---

## 1. Продуктовые решения (источник правды для кода)

| Тема | Решение |
|------|---------|
| Где живёт новый модуль постройки | Экран **«Зачарования»** (`GameScreen: 'altar'`, компонент `altar-screen.tsx`). Не кузница. |
| Устаревший модуль | Вкладка кузницы **«Алтарь»** (`ForgeMainTab: 'altar'`) — рецепт `forgotten_forge_altar_node`, craft v2 в `altar-craft-container.tsx`. Подлежит **полному удалению** после переноса логики; из него **ничего не переносить как эталон** — ориентиры только документы в этой папке и `SPECIFICATION.md`. |
| Терминология в старых черновиках | В `ALTAR_BUILDING_V2.md`, `CHAT.md`, `readme.md` часто написано «вкладка Алтарь» в кузнице — для **нового** модуля это означает **экран «Зачарования»**, пока кузнечную вкладку не удалили. |
| Документация сценария / ГД | Файлы ниже; см. **§3.5** для согласования номеров шагов (канон — `FORGOTTEN_FORGE v2.md` + `CHAT.md`). |
| Опционально: дубликаты доков | В `readme.md` предлагалась копия в `docs/altar-quest/` — по желанию команды; **каноническая папка квеста** — `docs/Quests/ALTAR_REWORK/`. |

---

## 2. Карта документов

| Файл | Содержание | Основная аудитория |
|------|------------|---------------------|
| [readme.md](./readme.md) | План этапов 0–6, чеклисты, критерии релиза, риски, работа в Cursor | Все |
| [SPECIFICATION.md](./SPECIFICATION.md) | Типы, store, события, хуки, примеры кода | Разработчики |
| [ALTAR_BUILDING_V2.md](./ALTAR_BUILDING_V2.md) | Геймдизайн: 5 фаз, микроэтапы, материалы, UX, отмена, сохранение | ГД, UI, store |
| [ALTAR_MATERIAL_BALANCE.md](./ALTAR_MATERIAL_BALANCE.md) | Баланс количеств на старт фаз: `altar-phase-material-balance.ts`, связь с `refining-recipes` | ГД, баланс |
| [ALTAR_CONSTRUCTION_PROGRESS_UI_PLAN.md](./ALTAR_CONSTRUCTION_PROGRESS_UI_PLAN.md) | План UI прогресса стройки (скрытие требований при активной фазе, выравнивание полосы с крафтом/верстаком/ремонтом) | UI, ГД |
| [FORGOTTEN_FORGE v2.md](./FORGOTTEN_FORGE%20v2.md) | Сценарий квеста (шаги, диалоги, ветвления) | Сценаристы, логика квеста |
| [CHAT.md](./CHAT.md) | ТЗ модуля общения: store, диалоги, триггеры, связь с UI | Store, UI |
| **DEVELOPMENT_HUB.md** (этот файл) | Сводка решений, мастер-план, инвентарь кода, журнал | Все |

Связь с остальной документацией проекта: `docs/Quests/FORGOTTEN_FORGE.md`, `docs/systems/ENCHANTMENT_SYSTEM.md`, `docs/systems/ENCHANTMENT_MODULE_*`, `docs/systems/GUILD_SYSTEM.md`, `docs/systems/TUTORIAL_SYSTEM.md`, `docs/systems/ALTAR_CONSTRUCTION_CRAFT_CREATIVE_TZ.md`, `docs/04_TYPES_SYSTEM.md`, `docs/utils/FORMULAS.md` — исторический контекст и типы; при конфликте с v2 **приоритет у документов в `ALTAR_REWORK/`, CHAT и этой §3.5**.

---

## 3. Мастер-план: этапы на всю разработку, параллели, охват

### 3.1 Сводная дорожная карта работ (инкременты)

| Волна | Содержание | Выход | Основные документы |
|------|------------|--------|-------------------|
| **A. Фундамент** | Типы (`AltarPhase`, `AltarStage`, `AltarPhaseConfig`, состояние квеста с `step`, `waitingForCraftAfterPhase2`), начальные поля store, персист/partialize, `isQuestItem` для артефактов | Сборка зелёная, сейв не ломается | SPEC §1, readme этап 0 |
| **B. Ядро строительства** | `altarPhasesConfig` (все материалы и микроэтапы из ALTAR_BUILDING_V2), `canStartPhase` / `consumeMaterialsForPhase`, actions, тик `updateAltarProgress`, отмена, восстановление таймера после reload, анти-чит по «перемотке времени» как в ГД | Можно пройти фазу I–V в отрыве от квеста (dev) или с зафиксированным step | ALTAR_BUILDING_V2 §2–4, SPEC §6–7 |
| **C. Событийная шина** | Единая точка: `altar:phaseCompleted`, `craft:completed`, `expedition:completed` с `questTag` / `locationId`; подписка квеста (хук + layout) | Квест реагирует на события без циклических импортов | SPEC §2–4, CHAT §4 |
| **D. Квест и чат** | Расширение `forgotten-forge-quest-slice`, диалоги по шагам, `selectArchivistChoice`, синхронизация с `game-messages-dock`, без нарушения CHAT §9 | Прогон шагов 0–6 и сцен стройки по §3.5 | FORGOTTEN_FORGE v2, CHAT §3 |
| **E. UI «Зачарования»** | Дорожная карта фаз, экран активной фазы, `AltarQuestGoal`, гейты по step, подсказки блокировки | Игрок видит цель и не стартует «не ту» фазу | CHAT §5, SPEC §5, ALTAR_BUILDING_V2 §3 |
| **F. Экспедиции и экономика** | `questTag`, `requiredItems`, списание при старте/успехе, валидация в UI гильдии, подсказки цели | Частоты без кожи, благословение без трав — не уезжают | FORGOTTEN_FORGE v2 шаги 11–14, readme этап 4 |
| **G. Финал и замена legacy** | Шаг 18 → `altarBuiltInForge`, подвкладки «Зачарование» / «Улучшение алтаря», удаление `ForgeMainTab: 'altar'`, рецепта, миграции сейвов | Один поток на экране зачарований; кузница без алтаря | readme этап 5, §4 хаба |
| **H. Закалка** | Полный проход, баланс длительностей, edge cases, dev-reset, логи | Критерии readme §5 + облако | readme этап 6 |

Волны **A→B** и **A→C** частично последовательны (C нужен минимальный emit из B). **D** можно вести параллельно с **B** после того как зафиксированы имена событий и поля step. **E** зависит от **B** (UI прогресса) и **D** (goal copy). **F** пересекается с **D**. **G** — после того как **E+F** закрывают сценарий.

### 3.2 Что делать параллельно

| Трек 1 (системы) | Трек 2 (контент) | Трек 3 (доки/типы) |
|------------------|------------------|---------------------|
| Конфиг фаз + чистые функции `canStartPhase` / consume | Наполнение `forgotten-forge-dialogue.ts` из v2 (можно после каркаса событий) | Обновление `docs/04_TYPES_SYSTEM.md` при новых полях |
| Шина событий (новый модуль `src/lib/event-bus.ts` или аналог) | Данные экспедиций: `questTag`, `requiredItems`, дубликаты локаций для «особых» заездов | `docs/systems/ENCHANTMENT_*` после удаления кузнечного алтаря |
| Интеграция `craft:completed` в `use-craft-v2` / store | Покупка `clay_firing` у интенданта (если ещё не в данных) | `cloud-save-feature.ts` + Prisma при новых полях |
| UI дорожной карты на `altar-screen` | Таблица материалов по фазам из ALTAR_BUILDING_V2 (баланс) | AGENTS.md не обязателен; при необходимости — ссылка на хаб |

### 3.3 Затрагиваемые модули кода (расширенный охват)

| Зона | Файлы / области |
|------|------------------|
| Store | `src/store/game-store-composed.ts`, `src/store/slices/forgotten-forge-quest-slice.ts`, новый или расширенный слайс строительства; `partialize` / миграции |
| Экран зачарований | `src/components/screens/altar-screen.tsx`; возможно `src/components/enchantment/*` |
| Крафт v2 | `src/hooks/use-craft-v2.ts`, завершение крафта → emit `craft:completed` |
| Экспедиции | `src/lib/expedition-start-validation.ts`, `src/lib/expedition-calculator-v2.ts` (если затронуты награды), данные в `src/data/**`, UI `src/components/guild/expeditions/*` |
| Гильдия / интендант | Особые задания, каталоги, возможные покупки техник (`src/data/guild/intendant-catalog.ts` и др.) |
| Сообщения | `src/components/layout/game-messages-dock.tsx`, канал архивариуса (без ломки типов — CHAT §9) |
| Персист | `src/hooks/use-cloud-save.ts`, `src/lib/normalize-forgotten-forge-persist.ts`, `src/lib/save-payload-schema.ts`, `src/app/api/save/route.ts` при расширении payload |
| Инвентарь | Материалы-артефакты, `isQuestItem`, исключение из списания фазы III |
| Доступ к экрану | `src/lib/enchantment-screen-access.ts` |
| Тесты | `src/lib/**.test.ts` для чистых функций; не монолит store без необходимости |
| Удаление legacy | См. **§4** |

### 3.4 Документация проекта — держать под рукой

| Когда | Документ |
|-------|----------|
| Любое изменение типов / персиста | `docs/04_TYPES_SYSTEM.md`, `src/lib/cloud-save-feature.ts`, AGENTS.md (порядок чтения) |
| Экспедиции, модификаторы | `docs/systems/GUILD_SYSTEM.md`, `docs/expedition-material-id-map.md` при смене id |
| Зачарования, доступ | `docs/systems/ENCHANTMENT_SYSTEM.md` |
| Формулы / экспертиза / крафт | `docs/utils/FORMULAS.md`, `docs/utils/CRAFT_CALCULATOR.md` |
| После вырезания кузнечного алтаря | `docs/systems/ALTAR_FORGE_TAB_AUDIT.md`, `docs/systems/ENCHANTMENT_MODULE_PHASE2_*.md` — актуализировать под «только Зачарования» |

### 3.5 Канон: шаг квеста ↔ фаза строительства и события

Источник: **[FORGOTTEN_FORGE v2.md](./FORGOTTEN_FORGE%20v2.md)** и **[CHAT.md](./CHAT.md)**. Ниже — ориентир для гейтов кнопки «Начать фазу» и обработчиков событий.

| Условие | Разрешённая макрофаза | Примечание |
|---------|------------------------|------------|
| После диалога шага 7: `step === 8` | **Фаза I** | readme §3 говорит «шаг 7» — **устарело относительно v2** |
| `step === 9`, фаза II завершена не была; не ждём крафт | **Фаза II** | После завершения фазы I → `step` 9 |
| После фазы II: по **CHAT** шаг остаётся **9**, `waitingForCraftAfterPhase2 === true` | Старт **фазы III запрещён** | Сначала `craft:completed` |
| После крафта (v2): `step === 11` → экспедиции за техниками | Стройка недоступна до получения трёх техник | Последовательность шагов 11→12→13→14 — см. v2 |
| `step === 14` (все три техники есть) | **Фаза III** | readme «шаг 13» — **не совпадает** с v2 |
| После фазы III и экспедиции за `spirit_blessing`: `step === 16` | **Фаза IV** | |
| `step === 17` | **Фаза V** | После завершения фазы IV |
| После фазы V | `step === 18`, финал, `altarBuiltInForge === true` | |

**События (имена из SPEC):** `altar:phaseCompleted`, `craft:completed`, `expedition:completed`. Пример в **SPECIFICATION.md §4** (псевдокод хука) **не синхронизирован** с таблицей выше и с веткой «фаза II → ожидание крафта» из CHAT — при кодировании опираться на **§3.5** и CHAT §4, не копировать числа `setStep` из примера вслепую.

### 3.6 Известные расхождения в пакете документов

| Место | Проблема | Действие |
|-------|-----------|----------|
| readme §3 этап 3 | Номера шагов для гейта фаз I–V (7/8/13/15/16) | Заменить на **§3.5 хаба** или выпустить патч readme |
| SPEC §4 пример `onAltarPhaseComplete` | Другая логика шагов относительно v2 | Не использовать как единственный источник |
| FORGOTTEN_FORGE v2 §Шаг 9 | В тексте встречается «Действие: step = 10» перед веткой с `waitingForCraftAfterPhase2` | При реализации следовать **CHAT §4.1** (шаг не уходит на 10 до крафта) |
| ALTAR_BUILDING_V2 §3.4 | «Вкладка Алтарь в кузнице» | Читать как **экран Зачарования** после переноса |

---

## 4. Инвентарь кода: устаревший модуль (кузница → удалить)

Ниже — стартовый список для рефакторинга/удаления после готовности нового потока на экране «Зачарования». Перед удалением прогнать поиск по репозиторию: `altar-forge`, `AltarForge`, `forgotten_forge_altar_node`, `altar-craft`, `FORGOTTEN_FORGE_ALTAR_RECIPE_ID`.

| Область | Файлы / символы |
|---------|-----------------|
| UI кузницы | `src/components/forge/altar-forge-section.tsx`, `src/components/forge/altar-craft-container.tsx` |
| Экран кузницы | `src/components/screens/forge-screen.tsx` — вкладка `altar`, импорт `AltarForgeSection` |
| Store | `ForgeMainTab` включает `'altar'` — убрать вкладку и миграции, где `forgeMainTab === 'altar'` (`game-store-composed.ts`) |
| Рецепт и данные | `src/data/recipes/altar-construction.ts`, запись в `src/data/recipes/index.ts` |
| Логика крафта алтаря | `src/lib/craft/altar-construction.ts`, тест `altar-construction.test.ts` |
| Кандидаты материалов | `src/lib/materials/forge-part-material-candidates.ts` — ветка `mergeAltarForgeExtraNodes` / `getAltarForgeExtraMaterialIds` |
| Планировщик | `src/components/forge/craft-v2/craft-planner.tsx` — комментарий/режим «один фиксированный рецепт (вкладка Алтарь)» |
| Экран зачарований (сейчас) | `src/components/screens/altar-screen.tsx` — редиректы «соберите узел в кузнице» заменить на новый модуль постройки |
| Доступ | `src/lib/enchantment-screen-access.ts` — пересмотреть гейт `altarBuiltInForge` после смены модели (имя флага в SPEC — синхронизировать с документом) |
| Персист / облако | `altarBuiltInForge`, `altarUnlockedByForgottenForgeQuest` в `use-cloud-save.ts`, `normalize-forgotten-forge-persist.ts`, Prisma при необходимости |

Документация, которая описывает **старый** P1-поток и потребует обновления после удаления: `docs/systems/ALTAR_FORGE_TAB_AUDIT.md`, `docs/systems/ENCHANTMENT_MODULE_PHASE2_*.md`, фрагменты `ALTAR_CONSTRUCTION_CRAFT_CREATIVE_TZ.md` про вкладку в кузнице.

---

## 5. Инвентарь кода: целевое размещение (зачарования)

| Назначение | Куда класть новое (ориентир) |
|------------|------------------------------|
| Главный UI постройки / дорожная карта фаз | `src/components/screens/altar-screen.tsx` и/или `src/components/enchantment/` (создать по конвенции проекта) |
| Конфиг фаз I–V | `src/data/altar/` или `src/lib/altar/` — как в `SPECIFICATION.md` / `ALTAR_BUILDING_V2.md` |
| Слайсы store | `questForgottenForge*`, `altarConstruction*` — пути из `SPECIFICATION.md` (уточнить под фактическую структуру `src/store/slices/`) |
| Шина событий | `src/lib/game-events.ts` — типизированные `on` / `emit` |
| События квеста | Хук в духе `useForgottenForgeQuestEvents` — `layout` или корневой клиентский провайдер (см. `readme.md` этап 2) |
| Диалоги | `src/data/quests/forgotten-forge-dialogue.ts` (расширение существующего) |

---

## 6. Этапы внедрения (из readme) — статус

Отметки: `[ ]` не начато · `[~]` в работе · `[x]` готово.

Детализация и параллели — **§3**. Гейты по шагам — **§3.5** (не полагаться только на readme).

### Этап 0. Подготовка и типизация
- [x] Типы: `ForgottenForgeQuestState` (расширение), `AltarConstructionState`, `AltarPhase`, `AltarStage`, `AltarPhaseConfig` — по `SPECIFICATION.md`
- [x] Store: новые поля и начальные значения без полной логики (`altarConstruction`, `materialStashQuestItemIds`, merge/persist **STORE_VERSION 28**)
- [x] Квестовые предметы: `materialStashQuestItemIds` + опционально `addMaterialToStash(..., { markQuestItem: true })`

### Этап 1. Базовая механика строительства
- [x] `altarPhasesConfig` для фаз I–V (`src/data/altar/altar-phases-config.ts`); **количества материалов** — `src/data/altar/altar-phase-material-balance.ts` ([`ALTAR_MATERIAL_BALANCE.md`](./ALTAR_MATERIAL_BALANCE.md))
- [x] Actions: `startAltarConstructionPhase`, завершение/отмена, `updateAltarConstructionProgress` в store
- [x] Тик прогресса (`use-altar-construction-tick.ts`)
- [x] `canStartAltarPhase`, `consumeMaterialsForAltarPhase` (`src/lib/altar/`)
- [x] Базовый UI на экране **«Зачарования»**: дорожная карта, старт, прогресс, отмена (`altar-screen.tsx`)
- [x] Событие `altar:phaseCompleted` через `game-events`; отмена без возврата материалов; persist

### Этап 2. Квест: флаги, триггеры, чат
- [x] Store квеста: `step`, `waitingForCraftAfterPhase2`, действия
- [x] Диалоги по шагам v2: `forgotten-forge-dialogue.ts` (шаги 0–7, стройка, крафт, техники, финал); реплики в чат через `useForgottenForgeQuestEvents` + слайс
- [x] `selectArchivistChoice` и интеграция с доком
- [x] Подписки: `expedition:completed`, `craft:completed`, `altar:phaseCompleted`
- [x] Хук `useForgottenForgeQuestEvents` в layout

### Этап 3. UI цели и блокировка фаз
- [x] `AltarQuestGoal` (`src/components/enchantment/altar-quest-goal.tsx`)
- [x] Блокировка «Начать фазу» по **§3.5** (`altar-quest-gates.ts` + экран)
- [x] Подсказки при блокировке фазы

### Этап 4. Предметы, техники, экспедиции
- [x] Выдача артефактов и техник по сценарию; `isQuestItem`; фаза III — проверка наличия
- [x] `linkedQuestTag` / `requiredItems` в данных экспедиций; списание при отправке (guild cross-slice)
- [x] Подсказки в UI цели при нехватке ресурсов

### Этап 5. Финал и режим «алтарь готов»
- [x] Завершение фазы V → шаг 18 / `altarBuiltInForge` (хук квеста)
- [x] Панель цели скрывается после финала; подвкладки «Зачарование» / «Улучшение алтаря» на экране
- [x] Повторный запуск квеста не предусмотрен сценарием (статус/шаг в store)

### Этап 6. Тесты, баланс, отладка
- [x] Автопроверка критического пути по событиям алтаря/крафта: [`forgotten-forge-event-transitions.test.ts`](../../../src/lib/quests/forgotten-forge-event-transitions.test.ts) (логика совпадает с [`useForgottenForgeQuestEvents`](../../../src/hooks/use-forgotten-forge-quest-events.ts))
- [ ] Операционный sign-off: полный ручной прогон по [§6.1](#61-приёмочный-чеклист-ручной) (reload на ключевых шагах)
- [x] Юнит-тесты на чистые функции стройки / гейты (см. `src/lib/altar/*.test.ts`)
- [x] Dev-сброс: `window.resetForgottenForgeQuest()` в dev ([`useForgottenForgeQuestEvents`](../../../src/hooks/use-forgotten-forge-quest-events.ts) → `resetForgottenForgeQuestDev` в слайсе)

### 6.1 Приёмочный чеклист (ручной)

Перед релизом команда отмечает прогон (ориентир — [readme §5](./readme.md) и [FORGOTTEN_FORGE v2.md](./FORGOTTEN_FORGE%20v2.md), гейты — **§3.5**).

| Шаг | Действие | Reload после |
|-----|-----------|--------------|
| 1 | Квест активирован, экспедиции 1–6, три артефакта в stash | После шага 6 |
| 2 | Диалог шага 7 → шаг 8, чертёж, фаза I на «Зачарованиях» | После шага 8 |
| 3 | Фаза I → событие, шаг 9; фаза II → ожидание крафта, варианты `ff_pw_*` | Во время ожидания крафта |
| 4 | Крафт v2 → шаг 11; три FF-экспедиции → техники; фаза III | После шага 14 |
| 5 | Экспедиция благословения → фазы IV–V → финал, подвкладки enchant/upgrade | После шага 18 |
| 6 | Отмена активной фазы стройки — материалы не возвращаются | — |
| 7 | Недостаток `requiredItems` — кнопка экспедиции недоступна | — |

---

## 7. Критерии приёмки (кратко)

С полным списком — [readme.md §5](./readme.md). Дополнить вручную: **постройка доступна с экрана «Зачарования»**; **вкладка «Алтарь» в кузнице отсутствует**; прогресс сейва совместим с облаком при включённом Turso; гейты по **§3.5**.

---

## 8. Риски (из readme + кодовая база)

- Синхронизация событий между крафтом, экспедициями и алтарём — модуль **`game-events`**; новые emit подключать после commit в Zustand.
- Атомарное списание материалов при старте фазы.
- Техники-заглушки: `clay_firing`, `frequency_tuning`, `spirit_blessing` и др.
- Миграция сохранений: старые сейвы с `forgeMainTab: 'altar'` и прогрессом рецепта `forgotten_forge_altar_node` — описать в журнале при появлении стратегии.
- Несогласованность номеров шагов между документами — держать **§3.5** актуальным.

---

## 9. Журнал разработки

Правила ведения: новая запись сверху — **дата (ISO)**, **краткий заголовок**, **что сделано**, **ссылки на PR/коммиты**, **заметки на будущее**.

### Шаблон записи

```text
### YYYY-MM-DD — Заголовок

- Сделано: …
- Файлы: …
- Следующие шаги: …
```

### Записи

### 2026-04-09 — Post-v2: smoke-тесты переходов, баланс фазы IV, облако persist, чеклист §6.1

- Сделано: вынесена чистая логика [`forgotten-forge-event-transitions.ts`](../../../src/lib/quests/forgotten-forge-event-transitions.ts), хук переведён на неё; тесты критического пути; фаза IV ~10800 с ([`altar-phases-config`](../../../src/data/altar/altar-phases-config.ts)); тест roundtrip `forgottenForgePersist` для формы cloud-save; §6.1 ручной чеклист; уточнён dev-reset в §6; ссылка на следующий эпик в [ENCHANTMENT_MODULE_PHASE2_IMPLEMENTATION_ROADMAP.md](../../systems/ENCHANTMENT_MODULE_PHASE2_IMPLEMENTATION_ROADMAP.md).
- Следующие шаги: отметить в таблице §6.1 фактический ручной прогон; при Turso — один E2E-сейв вручную.

### 2026-04-09 — Диалоги v2 в чате, dev-сброс, тесты гейтов, синхронизация §6/readme

- Сделано: расширен `forgotten-forge-dialogue.ts` по **FORGOTTEN_FORGE v2**; сообщения после фаз I–V, крафта и экспедиций за техники; финал с выбором ответа; `appendArchivistLines` + обновлён `useForgottenForgeQuestEvents`; ветка «ожидание крафта» после фазы II (`FF_PHASE2_WAIT_CRAFT_*`); `resetForgottenForgeQuestDev` и `window.resetForgottenForgeQuest` в dev; `altar-quest-gates.test.ts`; комментарий целевых сумм длительностей в `altar-phases-config.ts`; §6 хаба и readme v1.1.
- Файлы: `src/data/quests/forgotten-forge-dialogue.ts`, `src/hooks/use-forgotten-forge-quest-events.ts`, `src/store/slices/forgotten-forge-quest-slice.ts`, `src/lib/altar/altar-quest-gates.test.ts`, `src/data/altar/altar-phases-config.ts`, `docs/Quests/ALTAR_REWORK/DEVELOPMENT_HUB.md`, `docs/Quests/ALTAR_REWORK/readme.md`
- Следующие шаги: ручной полный проход команды; итерации баланса микроэтапов по плейтесту.

### 2026-04-09 — M1–M5: стройка на «Зачарованиях», квест §3.5, экспедиции, удаление вкладки кузницы

- Сделано: `altarPhasesConfig` + `canStartAltarPhase` / `consumeMaterialsForAltarPhase` / тик `updateAltarConstructionProgress` + `game-events`; actions в `game-store-composed`; хук тика; UI дорожной карты на `altar-screen.tsx`, `AltarQuestGoal`; `useForgottenForgeQuestEvents` + переходы шагов; расширение FF экспедиций (`linkedQuestTag`, шаги 11–15, артефакты в stash, техники, траты shadow_leather / mist_herbs); эпилог → шаг 8; `STORE_VERSION` 29; удалены рецепт/вкладка кузницы «Алтарь»; `canAccessForgottenForgeEnchantmentFlow` для доступа к стройке без legacy-сборки.
- Файлы: `src/lib/altar/*`, `src/data/altar/*`, `src/hooks/use-altar-construction-tick.ts`, `src/hooks/use-forgotten-forge-quest-events.ts`, `src/components/screens/altar-screen.tsx`, `src/components/enchantment/altar-quest-goal.tsx`, `src/store/slices/forgotten-forge-quest-slice.ts`, `src/data/quests/forgotten-forge.ts`, `src/store/cross-slice/guild-expedition-cross-slice.ts`, `src/types/guild.ts`, `src/lib/enchantment-screen-access.ts`, и др.
- Следующие шаги: полнота диалогов v2, баланс длительностей, `npm run build` в CI.

### 2026-04-09 — Этап 0: типы и заготовка store

- Сделано: `src/types/altar-construction.ts`; расширен `ForgottenForgeQuestState` (`step` до 18, `waitingForCraftAfterPhase2`, `lastStepChangeAt`); `materialStashQuestItemIds` и `altarConstruction` в store + partialize/merge; `normalizeForgottenForgePersistFromSave` / облачный `forgottenForgePersist`; `addMaterialToStash` с `markQuestItem`; тесты нормализации; `docs/04_TYPES_SYSTEM.md` §11.
- Файлы: `src/types/altar-construction.ts`, `src/types/forgotten-forge-quest.ts`, `src/types/index.ts`, `src/store/slices/resources-slice.ts`, `src/store/game-store-composed.ts`, `src/lib/normalize-forgotten-forge-persist.ts`, `src/lib/normalize-forgotten-forge-persist.test.ts`, `src/hooks/use-cloud-save.ts`, `src/store/slices/forgotten-forge-quest-slice.ts`, `docs/04_TYPES_SYSTEM.md`
- Следующие шаги: волна B — `altarPhasesConfig` и actions строительства (этап 1 readme).

### 2026-04-09 — Мастер-план и §3.5–3.6

- Сделано: перечитаны все документы в `ALTAR_REWORK`; в хаб добавлены мастер-план (волны A–H), параллельные треки, расширенный охват модулей и проектной доки; зафиксирована **каноническая матрица шаг ↔ фаза** по FORGOTTEN_FORGE v2 + CHAT; отмечены расхождения readme/SPEC/v2; уточнено, что отдельного `eventBus` в коде пока нет; этап 3 в §6 связан с §3.5.
- Файлы: `docs/Quests/ALTAR_REWORK/DEVELOPMENT_HUB.md`
- Следующие шаги: при старте кода — волна A (типы + store); параллельно черновик `event-bus`; патч `readme.md` §3 этап 3 под §3.5 (по желанию).

### 2026-04-09 — Создан DEVELOPMENT_HUB v1.0

- Сделано: первый хаб с инвентарём legacy и чеклистами readme.
- Файлы: `docs/Quests/ALTAR_REWORK/DEVELOPMENT_HUB.md`
- Следующие шаги: см. запись выше.

---

## 10. Быстрые ссылки на реализацию в репозитории

- Store: `src/store/game-store-composed.ts` — `altarUnlockedByForgottenForgeQuest`, `altarBuiltInForge`, `ForgeMainTab` (`craft` \| `inventory` \| `bench`), `navigateToForgeTab`
- Квест: `src/store/slices/forgotten-forge-quest-slice.ts`
- Экран зачарований: `src/components/screens/altar-screen.tsx`
- Доступ: `src/lib/enchantment-screen-access.ts`
- Диалоги: `src/data/quests/forgotten-forge-dialogue.ts`; шина: `src/lib/game-events.ts`
- Крафт v2: `src/hooks/use-craft-v2.ts`
- Нормализация FF/облако: `src/lib/normalize-forgotten-forge-persist.ts`

---

*Конец хаба. Обновляйте §6 и §9 по мере работ; §3.5 — при любом изменении сценария v2 или CHAT; при смене имени флага «собран в кузнице» — обновить §4 и §10 одновременно.*
