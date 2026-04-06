# Внедрение платформы осей урона и стихий — план и worklog

**Связанный канон:** [ELEMENTAL_PLATFORM_SPEC.md](./ELEMENTAL_PLATFORM_SPEC.md) **v1.0.6** — единственный источник терминов, таблиц §2–§3, чеклиста **§3.5**, словаря **§3.6** и правил шрамов.

**Назначение этого файла:** пошаговый **план внедрения** в код и контент + **рабочий журнал** (worklog) итераций. Всё, что меняет канон (новые id тэгов, строки словаря, строки чеклиста), **сначала фиксируется в SPEC**, затем в коде.

---

## Как вести этот документ

### Роли

| Роль | Обязанность |
| ----- | ------------ |
| Канон | Только [ELEMENTAL_PLATFORM_SPEC.md](./ELEMENTAL_PLATFORM_SPEC.md) — таблицы повреждений, шрамов, §3.5, §3.6. |
| Этот файл | Фазы, задачи, статусы, записи worklog, ссылки на PR/коммиты. |

### Правила

1. **Не дублировать** таблицы тэгов из SPEC — ссылаться на §2–§3 и номер строки чеклиста §3.5 при необходимости.
2. При закрытии задачи, затрагивающей контент событий или локации: **обновить SPEC §3.5** (шаблон события, локации) в том же PR или следующим.
3. При добавлении/смене строк UI для осей: **обновить SPEC §3.6** и код словаря в одном заходе.
4. Каждая **итерация** (см. ниже) проходит цикл: **подготовка → внедрение → тестирование → проверка**; в worklog пишется краткий итог и дата.
5. Worklog ведётся **сверху вниз** в разделе [Worklog](#worklog) (новые записи — в начало блока текущей фазы или в общий стек с датой).

### Шаблон записи worklog

```text
### YYYY-MM-DD — краткий заголовок
- Фаза: X.Y
- Сделано: …
- SPEC обновлён: да/нет (что именно)
- Проверка: `npm run test` / ручной сценарий …
- Следующие шаги: …
```

---

## Итерационный цикл (каждая подзадача фазы)

| Этап | Содержание |
| ----- | ----------- |
| **Подготовка** | Прочитать SPEC; список затрагиваемых файлов; типы; критерий готовности. |
| **Внедрение** | Код + данные; без расширения канона без правки SPEC. |
| **Тестирование** | `npm run test` (релевантные тесты), `npm run type-check`, при UI — дымовой сценарий. |
| **Проверка** | Соответствие SPEC; при контенте — строка в §3.5 заполнена; словарь — §3.6. |

---

## Фазы внедрения

### Фаза 0 — Выравнивание типов и реестров (фундамент)

**Цель:** единые типы для осей стихий, мап `elemental_*` → ось, заготовка под `presentElements` без полного контента.

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 0.1 | Константа/тип `ElementAxisId` (union строк из колонки «Шрам» §3); экспорт из одного модуля. | §3 |
| 0.2 | `ELEMENTAL_DAMAGE_TAG_TO_AXIS: Record<string, ElementAxisId>` — все `elemental_*` из §3. | §3.2.1 |
| 0.3 | `ELEMENTAL_AXIS_LABELS` — копия §3.6 для UI (или i18n id → строка из SPEC). | §3.6 |
| 0.4 | Поле `presentElements?: ElementAxisId[]` на `Location` (опционально пустое до фазы 5). | §3.2 |

**Критерий завершения фазы:** type-check; тест на полноту мапы для всех строк §3 (см. SPEC §3.7).

---

### Фаза 1 — Сборщик тегов и фильтр стихий

**Цель:** `buildActiveDamageTagsFromMissionSnapshots` принимает `presentElements` (или `locationId` + резолв); `elemental_*` фильтруются по оси.

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 1.1 | Сигнатура + реализация фильтра в `expedition-post-mission-damage.ts`. | §3.2.1 |
| 1.2 | Вызов из `guild-expedition-cross-slice` с передачей контекста локации. | §3.2.1 |
| 1.3 | Тесты по §3.7 + кейсы из SPEC. | §3.7 |

**Критерий:** тесты зелёные; без `presentElements` поведение согласовано с продуктом (документировать в worklog, при смене — обновить SPEC §3.7).

**Редкие стихии (SPEC §3.8):** если событие с `elemental_light_*` или другой узкой осью входит в пул **редко**, но локация не должна постоянно показывать эту ось в «Встречающиеся стихии», возможны два канона — выбрать при внедрении и зафиксировать в worklog:

1. Ось добавляется в `presentElements` локации, где такое событие возможно (редкость только через вес события), **или**
2. Расширение сборщика: для явно перечисленных `templateId` разрешать тэг без оси в `presentElements` (исключение по событию).

До выбора — не блокировать контент; SPEC уже допускает редкие события как канал.

---

### Фаза 2 — Реестр повреждений и маппинг старых id

**Цель:** `DAMAGE_TAG_REGISTRY` на канонические `physical_*` / `elemental_*`; `event-template-to-damage-tags` обновлён; тесты/импорты.

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 2.1 | Замена id по таблице «Маппинг» в §5 SPEC. | §5 |
| 2.2 | Обновить `allowedRepairTechniqueIds`, тексты UI в реестре. | §2–§3 |
| 2.3 | Прогнать `grep`/тесты на старые id. | — |

---

### Фаза 3 — Техники ремонта и материалы

**Цель:** расширить `REPAIR_TECHNIQUE_REGISTRY` под канонические тэги; `clearsTagIds`; материалы из §3.1 SPEC.

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 3.1 | По одной или нескольким техникам на недостающие тэги. | §3.1 |
| 3.2 | Баланс стоимости — в пределах существующей экономики. | §3.1 |

---

### Фаза 4 — Шрамы на экземпляре (данные + ремонт)

**Цель:** хранение весов шрамов, топ-3+топ-3, инкремент при успешном ремонте; `cloud-save-feature` при новых полях.

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 4.1 | Поля на `WeaponLegacy` / `CraftedWeaponV2` по §1.1 SPEC. | §1.1 |
| 4.2 | Логика нормализации топ-3 физ. / топ-3 стих. | §1.1 |
| 4.3 | Подключить к `executeWeaponRepairByTechniques` (или актуальному пути ремонта). | §1 |

---

### Фаза 5 — Контент: локации и события

**Цель:** заполнить `presentElements` по локациям; события с `damage_weapon` и маппингом; закрыть строки **§3.5** в SPEC.

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 5.1 | Пройти локации tier 1–4; проставить `presentElements` по §3.8. | §3.8 |
| 5.2 | Добавить/править события; редкие стихии (в т.ч. `light`) — **редкие события** по §3.8. | §3.5, §3.8 |
| 5.3 | Обновить таблицы §3.5 (убрать TBD где готово). | §3.5 |

---

### Фаза 6 — UI экспедиций

**Цель:** строка «Встречающиеся стихии:» на карточке; лог одной колонкой; убрать выбор веток в событиях гильдии; авторазрешение + снимки эффектов (§3.4 SPEC).

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 6.1 | Карточка экспедиции + словарь §3.6. | §3.2, §3.6 |
| 6.2 | `ExpeditionEventLog` — компактный одноколоночный вид. | §3.4 |
| 6.3 | Убрать/заменить choice UI; итог эффектов в снимках. | §3.4 |

---

### Фаза 7 — Зачарования (опционально, после стабилизации)

**Цель:** потребление шрамов/осей в модуле зачарований — только после готовности данных по фазам 4–5.

| Подзадача | Описание | SPEC |
| --------- | --------- | ----- |
| 7.1 | Контракт с `ENCHANTMENT_SYSTEM.md`; чтение весов шрамов. | §1, §4 в SPEC |

---

## Worklog

*(Новые записи добавлять выше; дата в формате ISO.)*

### 2026-04-05 — Фаза 5 (батч 8): синхронизация [`ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md`](docs/systems/ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md)

- Сделано: актуализированы разделы 2 (оси `dragon_scars` / `depths_of_the_world`), 4–6, 8, таблица батчей §10 — соответствие коду и закрытию фазы 5 по данным; убраны устаревшие формулировки про TBD и «7 шаблонов».
- SPEC обновлён: нет
- Проверка: не требуется (только документация)

### 2026-04-05 — Фаза 5 (батчи 6–7): маппинг `damage_weapon`, резолв `choice` для тегов

- Сделано: [`eventResolutionSeedForSnapshot`](src/lib/expedition-event-loot.ts) + передача `expeditionStartedAtMs` в [`buildActiveDamageTagsFromMissionSnapshots`](src/lib/expedition-post-mission-damage.ts) из [`guild-expedition-cross-slice`](src/store/cross-slice/guild-expedition-cross-slice.ts). Квалификация тегов использует те же эффекты, что детерминированный выбор ветки `choices`, что и превью лута (`getEffectsForEventResolution`). Тест покрытия: [`event-template-damage-coverage.test.ts`](src/data/weapon-damage/event-template-damage-coverage.test.ts) (все шаблоны с `damage_weapon` в данных имеют строку в [`EVENT_TEMPLATE_TO_DAMAGE_TAGS`](src/data/weapon-damage/event-template-to-damage-tags.ts)).
- SPEC обновлён: §3.4 (v1.0.6)
- Проверка: `npm run test`, `npm run type-check`

### 2026-04-05 — Фаза 5 (батчи 3 и 5): пепел, природа в лесу, молния на Шрамах

- Фаза: 5.3 и §7 матрица — [`ash-wastes/elemental.ts`](src/modules/expeditions/data/events/ash-wastes/elemental.ts) (огонь/воздух/земля); [`event_whisper_root_nature`](src/modules/expeditions/data/events/whispering-forest/elemental.ts) на `whispering_forest`; [`event_dragon_lightning_fork`](src/modules/expeditions/data/events/dragon-scars/elemental.ts) (низкий вес) на `dragon_scars`. Маппинг в [`event-template-to-damage-tags.ts`](src/data/weapon-damage/event-template-to-damage-tags.ts). Реестр событий: **133** ([`events/index.ts`](src/modules/expeditions/data/events/index.ts)). SPEC §3.5 — v1.0.5.
- SPEC обновлён: да
- Проверка: `npm run test`, `npm run type-check`, `npm run lint`

### 2026-04-05 — Фаза 5 (стихии): реестр `elemental_*`, события, маппинг, §3.5

- Фаза: 5 (батчи контента по [`ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md`](docs/systems/ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md)): 12 новых `elemental_*` в [`damage-tag-registry.ts`](src/data/weapon-damage/damage-tag-registry.ts); техники `elemental_prima_treatment` / `elemental_veil_treatment` в [`repair-techniques-registry.ts`](src/data/weapon-damage/repair-techniques-registry.ts); по одному модулю `elemental.ts` на локацию (oak, red stone, misty, silver, forgotten, rotten, frost, whisper, dragon, depths) + маппинг шаблонов в [`event-template-to-damage-tags.ts`](src/data/weapon-damage/event-template-to-damage-tags.ts). Итого событий в реестре на тот момент: 128; затем 133 — см. запись worklog выше. Тест реестра: 24 тега ([`weapon-damage-data.test.ts`](src/data/weapon-damage/weapon-damage-data.test.ts)).
- SPEC обновлён: да (§3.5 таблица стихий, v1.0.4)
- Проверка: `npm run test`, `npm run type-check`, `npm run lint`
- Следующие шаги: при необходимости — доп. события/`ash_wastes` по плану; Фаза 7 (зачарования) отдельно

### 2026-04-05 — Фаза 5 (часть): оси на локациях, физика §3.5, события

- Фаза: 5.2–5.3 (частично): `lightning` в `presentElements` у `dragon_scars`, `silver_grove`; `arcane` у `depths_of_the_world`. Три новых `physical_*` в [`damage-tag-registry.ts`](src/data/weapon-damage/damage-tag-registry.ts) и [`repair-techniques-registry.ts`](src/data/weapon-damage/repair-techniques-registry.ts). События: `event_forgotten_cave_in` (+урон оружия), `event_rotten_glass_reeds`, `event_misty_swollen_haft`; маппинг в [`event-template-to-damage-tags.ts`](src/data/weapon-damage/event-template-to-damage-tags.ts). §3.5 SPEC — таблица физики с id шаблонов.
- SPEC обновлён: да (v1.0.3)
- Проверка: `npm run test`, `npm run type-check`, `npm run lint`
- Следующие шаги: стихии `elemental_*` по §3.5 и батчи 2–5 из [`ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md`](docs/systems/ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md)

### 2026-04-05 — Фазы 4–6 и аудит: шрамы, локации, UI экспедиций

- Фаза: 4.1–4.3, 5 (presentElements по локациям), 6 (карточка стихий, журнал), опциональный аудит реестра
- Сделано: `physicalScarWeights` / `elementalScarWeights` на `WeaponLegacy`; [`scar-weights.ts`](src/lib/weapon-damage/scar-weights.ts), [`physical-damage-to-scar.ts`](src/data/weapon-damage/physical-damage-to-scar.ts); инкремент при успешном ремонте и авто-ремонте в [`repair-cross-slice.ts`](src/store/cross-slice/repair-cross-slice.ts); нормализация топ-3+топ-3; тесты [`scar-weights.test.ts`](src/lib/weapon-damage/scar-weights.test.ts). Все 12 локаций — заполнен `presentElements` (§3.8). [`ExpeditionSelectionCard`](src/components/guild/expeditions/ExpeditionSelectionCard.tsx): строка «Встречающиеся стихии». [`ExpeditionEventLog`](src/components/guild/expeditions/ExpeditionEventLog.tsx): единый нейтральный стиль строк; вместо списка веток — пояснение про выбор искателя. Документ аудита: [`ELEMENTAL_REGISTRY_COVERAGE.md`](docs/systems/ELEMENTAL_REGISTRY_COVERAGE.md).
- SPEC обновлён: да (§3.5 статус `presentElements` + события TBD); `docs/04_TYPES_SYSTEM.md` — поля шрамов
- Проверка: `npm run test`, `npm run type-check`, `npm run lint`
- Следующие шаги: Фаза 7 (зачарования) при готовности; события с `elemental_*` по §3.5

### 2026-04-05 — Фазы 2–3: канонические id тегов, реестр, техники, миграция сейвов

- Фаза: 2.1–2.3, 3.1–3.2 (смысл: `clearsTagIds` под новые id; расширение материалов/техник по §3.1 — без новых техник, только смена id)
- Сделано: `DAMAGE_TAG_REGISTRY` переведён на 9 канонических `physical_*` / `elemental_*` (SPEC §2–§3); `EVENT_TEMPLATE_TO_DAMAGE_TAGS`, `damage-tag-inspection-options`, `REPAIR_TECHNIQUE_REGISTRY.clearsTagIds`; тесты и фикстуры; в `migrateCraftedWeaponV2DamageFields` — маппинг старых id → канон для `activeDamageTags` и счётчиков по `weaponLegacy`. Решения по §5: `notch_deep` → `physical_gouge_chunk`; `guard_bent` / `warp_slight` → `physical_bend_warp`; `soul_leak_minor` → `elemental_skverna_taint` (особый G1-путь сохранён).
- SPEC обновлён: да (таблица §5 с колонкой «Принято в репозитории», ссылка на миграцию)
- Проверка: `npm run test`, `npm run type-check`, `npm run lint`
- Следующие шаги: Фаза 4 (шрамы на экземпляре) / контент Фазы 5 по плану

### 2026-04-05 — Фазы 0–1: оси, `presentElements`, фильтр в сборщике тегов

- Фаза: 0.1–0.5, 1.1–1.3
- Сделано: модуль `src/data/weapon-damage/elemental-axes.ts` (`ElementAxisId`, `ELEMENTAL_DAMAGE_TAG_TO_AXIS`, `ELEMENTAL_AXIS_LABELS`, `isElementalDamageTagAllowedOnLocation`); поле `presentElements?: ElementAxisId[]` на `Location`; в `buildActiveDamageTagsFromMissionSnapshots` опциональный `presentElements` и фильтр `elemental_*`; в `guild-expedition-cross-slice` передаётся `getLocationById(expedition.locationId)?.presentElements ?? []`. Тесты полноты мапы и §3.7 (`elemental-axes.test.ts`, `expedition-post-mission-damage.test.ts`).
- Поведение без локации / без поля на локации: при завершении экспедиции в сборщик уходит **пустой** массив осей → все `elemental_*` отсекаются; **не** фильтруются только при явной передаче `presentElements: undefined` в `buildActiveDamageTagsFromMissionSnapshots` (unit-тесты и явный opt-out).
- SPEC обновлён: нет
- Проверка: `npm run test`, `npm run type-check`
- Следующие шаги: Фаза 2 (реестр id тэгов) по плану

---

## Версии этого документа

| Версия | Дата | Изменение |
| ------ | ---- | --------- |
| 0.8 | 2026-04-05 | Worklog: батч 8 — PHASE5_CONTENT_PLAN синхронизирован с репозиторием |
| 0.7 | 2026-04-05 | Worklog: батчи 6–7 — маппинг/choice-сид для тегов после миссии |
| 0.6 | 2026-04-05 | Worklog: ash_wastes / whisper nature / dragon lightning; 133 события; SPEC v1.0.5 |
| 0.5 | 2026-04-05 | Worklog: фаза 5 стихии (реестр, события, маппинг, §3.5 стихии, 128 событий); ссылка на SPEC v1.0.4 |
| 0.4 | 2026-04-05 | Worklog: фаза 5 частично (оси lightning/arcane, 3 физ. тега, события, §3.5 физика) |
| 0.3 | 2026-04-05 | Worklog: фазы 4–6 (шрамы, presentElements, UI журнала/карточки), ELEMENTAL_REGISTRY_COVERAGE |
| 0.2 | 2026-04-05 | Worklog: фазы 2–3 (реестр id, техники, миграция) |
| 0.1 | 2026-04-05 | Первый выпуск: фазы 0–7, правила worklog, ссылка на SPEC v1.0 |
