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
| Шина событий | `src/lib/event-bus.ts` (или существующий паттерн проекта — сейчас отдельного `eventBus` нет) |
| События квеста | Хук в духе `useForgottenForgeQuestEvents` — `layout` или корневой клиентский провайдер (см. `readme.md` этап 2) |
| Диалоги | `src/data/quests/forgotten-forge-dialogue.ts` (расширение существующего) |

---

## 6. Этапы внедрения (из readme) — статус

Отметки: `[ ]` не начато · `[~]` в работе · `[x]` готово.

Детализация и параллели — **§3**. Гейты по шагам — **§3.5** (не полагаться только на readme).

### Этап 0. Подготовка и типизация
- [ ] Типы: `QuestForgottenForgeState`, `AltarConstructionState`, `AltarPhase`, `AltarStage`, `AltarPhaseConfig` (и действия) — по `SPECIFICATION.md`
- [ ] Store: новые поля и начальные значения без полной логики
- [ ] `materialStash` / квестовые предметы: флаг `isQuestItem`, если ещё нет

### Этап 1. Базовая механика строительства
- [ ] `altarPhasesConfig` для фаз I–V по `ALTAR_BUILDING_V2.md`
- [ ] Actions: `startAltarPhase`, `completeAltarPhase`, `cancelAltarPhase`, `updateAltarProgress`
- [ ] Тик прогресса активной фазы
- [ ] `canStartPhase`, `consumeMaterialsForPhase`
- [ ] Базовый UI на экране **«Зачарования»** (не в кузнице): дорожная карта, старт, прогресс, отмена
- [ ] Событие `altar:phaseCompleted`; отмена без возврата материалов; persist

### Этап 2. Квест: флаги, триггеры, чат
- [ ] Store квеста: `step`, `waitingForCraftAfterPhase2`, действия
- [ ] Диалоги по шагам; `selectArchivistChoice`
- [ ] Подписки: `expedition:completed`, `craft:completed`, `altar:phaseCompleted`
- [ ] Хук событий в layout / app

### Этап 3. UI цели и блокировка фаз
- [ ] `AltarQuestGoal` (см. `SPECIFICATION.md` п.5)
- [ ] Блокировка «Начать фазу» по **§3.5** (не по устаревшей таблице readme)
- [ ] Подсказки «Сначала выполните задание архивариуса»

### Этап 4. Предметы, техники, экспедиции
- [ ] Выдача артефактов и техник по сценарию; `isQuestItem`; фаза III только проверка наличия
- [ ] `requiredItems` / `questTag` в данных экспедиций; списание при отправке
- [ ] Подсказки в UI при нехватке ресурсов

### Этап 5. Финал и режим «алтарь готов»
- [ ] Шаг 18 / завершение фазы V → `altarBuiltInForge = true` (или переименование флага по SPEC)
- [ ] Скрыть панель цели; подвкладки «Зачарование» и «Улучшение алтаря» (заглушка)
- [ ] Нет повторного запуска квеста

### Этап 6. Тесты, баланс, отладка
- [ ] Полный проход 0 → финал; reload на каждом шаге; краевые случаи
- [ ] Нет эксплойта отмены фаз
- [ ] Dev-сброс квеста (например `window.resetForgottenForgeQuest()`)

---

## 7. Критерии приёмки (кратко)

С полным списком — [readme.md §5](./readme.md). Дополнить вручную: **постройка доступна с экрана «Зачарования»**; **вкладка «Алтарь» в кузнице отсутствует**; прогресс сейва совместим с облаком при включённом Turso; гейты по **§3.5**.

---

## 8. Риски (из readme + кодовая база)

- Синхронизация событий между крафтом, экспедициями и алтарём; отсутствие готовой шины — заложить модуль рано (**волна C**).
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

- Store: `src/store/game-store-composed.ts` — `altarUnlockedByForgottenForgeQuest`, `altarBuiltInForge`, `ForgeMainTab`, `navigateToForgeTab`
- Квест: `src/store/slices/forgotten-forge-quest-slice.ts`
- Экран зачарований: `src/components/screens/altar-screen.tsx`
- Доступ: `src/lib/enchantment-screen-access.ts`
- Диалоги (заготовка): `src/data/quests/forgotten-forge-dialogue.ts`
- Крафт v2: `src/hooks/use-craft-v2.ts`

---

*Конец хаба. Обновляйте §6 и §9 по мере работ; §3.5 — при любом изменении сценария v2 или CHAT; при смене имени флага «собран в кузнице» — обновить §4 и §10 одновременно.*
