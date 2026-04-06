# Фаза 5 — контент локаций и событий (план работ)

**Назначение:** рабочий документ для **творческого и дата-дизайн** закрытия [ELEMENTAL_PLATFORM_IMPLEMENTATION.md](./ELEMENTAL_PLATFORM_IMPLEMENTATION.md) **фазы 5** (подзадачи 5.1–5.3): события с `damage_weapon`, маппинг на канонические теги, синхронизация с [ELEMENTAL_PLATFORM_SPEC.md](./ELEMENTAL_PLATFORM_SPEC.md) **§3.3–§3.5**.

**Канон по правилам:** §3.2.1 (фильтр `elemental_*` по `presentElements`), §3.3 (полнота осей и физики), §3.5 (чеклист), §3.8 (тиры и редкие стихии).

**Снимок репозитория:** разделы **2–6, 8** ниже синхронизированы с кодом по состоянию на **2026-04-05** (фаза 5 по данным и тегам закрыта; план остаётся шпаргалкой для будущего контента).

---

## Как пользоваться этим документом в Cursor

1. **Не пытайтесь закрыть всё одним промптом.** Используйте **батчи** из [раздела 10](#10-батчи-для-пошагового-выполнения-в-cursor): у каждого есть границы, файлы и критерий готовности.
2. В каждом запросе прикрепляйте **`@docs/systems/ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md`** и при сомнениях **`@docs/systems/ELEMENTAL_PLATFORM_SPEC.md`**.
3. После каждого батча: `npm run test`, `npm run type-check`, `npm run lint` (или доверьте CI).
4. **Один PR на батч** или логичную группу (меньше конфликтов в `event-template-to-damage-tags.ts` и `ELEMENTAL_PLATFORM_SPEC.md`).

---

## 1. Цели и критерий «готово»

| Цель | Проверка |
| ----- | -------- |
| Для **каждой** оси из колонки «Шрам» §3 — минимум одна цепочка: событие с `damage_weapon` → маппинг `elemental_*` → локация с этой осью в `presentElements` | Таблица §3.5 в SPEC: колонка «шаблон» ≠ TBD |
| Для **каждого** `physical_*` из §2 — минимум одно событие, которое может выдать тег (общее или локальное), плюс строка в §3.5 | То же |
| Редкие оси (**`light`** и др. по §3.8) | Низкий `weight` в пуле **существующей** локации; не обязательно держать ось в `presentElements`, если канон — «редкое событие» |
| Дисциплина | Каждая новая строка в [`EVENT_TEMPLATE_TO_DAMAGE_TAGS`](../../src/data/weapon-damage/event-template-to-damage-tags.ts) согласована с текстом события и с `presentElements` для стихий |

**Не смешивать:** видимые теги и шрамы — по SPEC; заказы NPC и `hiddenTags` — отдельно.

### 1.1. Определение «фаза 5 закрыта»

Считать работу завершённой, когда одновременно:

- В **§3.5** SPEC нет **TBD** в колонке «шаблон события» для **всех** строк стихий и физики (или осознанно оставленные исключения описаны в примечании к строке).
- Для **каждого** указанного шаблона есть: `damage_weapon` в данных → строка в `EVENT_TEMPLATE_TO_DAMAGE_TAGS` → теги из `DAMAGE_TAG_REGISTRY`.
- Для стихий: ось из `elemental_*` **входит** в `presentElements` **хотя бы одной** локации, где крутится событие (иначе фильтр §3.2.1 обнулит тег — см. [раздел 6](#6-предпосылки-presentelements-и-фильтр-§321)).
- В [Worklog](ELEMENTAL_PLATFORM_IMPLEMENTATION.md#worklog) добавлена запись (фаза 5.2–5.3).

---

## 2. Инвентаризация: локации (12)

Поле **`presentElements`** уже задано в [`src/modules/expeditions/data/locations/`](../../src/modules/expeditions/data/locations/) (tier1 — `tier1.ts`, `tier1-red-stone.ts`, `tier1-misty.ts`; tier2 — `tier2.ts`; tier3 — `tier3.ts`; tier4 — `tier4.ts`). Реестр: [`locations/index.ts`](../../src/modules/expeditions/data/locations/index.ts) (`LOCATION_REGISTRY`).

| `id` | Название (RU) | Tier | `presentElements` (оси) |
| ----- | ------------- | ---- | ------------------------ |
| `oak_grove_outskirts` | Окраины Дубовой Рощи | 1 | `nature`, `earth`, `air` |
| `red_stone_mines` | Рудники Красного Камня | 1 | `earth`, `fire`, `air` |
| `misty_lowlands` | Туманные Низины | 1 | `water`, `air`, `darkness` |
| `silver_grove` | Серебряный Бор | 2 | `nature`, `light`, `air`, `lightning` |
| `forgotten_mines` | Забытые Шахты | 2 | `earth`, `darkness`, `air` |
| `rotten_swamp` | Гнилое Болото | 2 | `poison`, `water`, `corrosion` |
| `frost_iron_ridge` | Кряж Морозного Железа | 3 | `frost`, `earth`, `air` |
| `ash_wastes` | Пепельные Пустоши | 3 | `fire`, `air`, `earth` |
| `whispering_forest` | Шепчущий Лес | 3 | `nature`, `arcane`, `darkness` |
| `dragon_scars` | Драконьи Шрамы | 4 | `fire`, `blood`, `light`, `lightning` |
| `depths_of_the_world` | Глубины Подземелий | 4 | `space`, `blood`, `skverna`, `darkness`, `arcane` |

**Заметки по §3.8 (лор уже согласован с полями):**

- Tier 4: `dragon_scars` и `depths_of_the_world` закрывают кровь / скверну / пространство / тьму; на драконьих Шрамах также **`light`** и **`lightning`** (грозы в лоре); в глубинах — **`arcane`** помимо тьмы/крови/скверны/пространства.
- Ранняя экзотика: `whispering_forest` — `arcane`, `nature`, `darkness`; `ash_wastes` / `frost_iron_ridge` — усиление `fire` / `frost` / `air`.

---

## 3. Инвентаризация: миссии

Реестр: [`src/modules/expeditions/data/missions/index.ts`](../../src/modules/expeditions/data/missions/index.ts) (`MISSION_REGISTRY`, `MISSIONS_BY_LOCATION`).

**Всего миссий:** 136 (прогон: импорт `MISSION_REGISTRY.length`).

| `locationId` | Число миссий | Типичные файлы в папке локации |
| ------------- | ------------ | -------------------------------- |
| `oak_grove_outskirts` | 16 | `hunt`, `scout`, `gather`, `rescue`, `escort` |
| `red_stone_mines` | 13 | сбор/шахта и др. |
| `misty_lowlands` | 12 | |
| `silver_grove` | 12 | |
| `forgotten_mines` | 12 | |
| `rotten_swamp` | 12 | |
| `frost_iron_ridge` | 12 | |
| `ash_wastes` | 12 | |
| `whispering_forest` | 12 | |
| `dragon_scars` | 12 | |
| `depths_of_the_world` | 11 | охота/разведка/расследование и др. |

Миссии задают длительность, сложность и пул **случайных событий** в рантайме; сами теги повреждений к оружию приходят из **событий** (`damage_weapon` + маппинг), не из «итога миссии» без события (SPEC §1).

---

## 4. Инвентаризация: события

Реестр: [`src/modules/expeditions/data/events/index.ts`](../../src/modules/expeditions/data/events/index.ts) — **133** шаблона (`EVENT_REGISTRY`): **40** общих (`common/`) + события по локациям (см. комментарий в `events/index.ts`).

### 4.1. События с эффектом `damage_weapon`

Шаблонов с `damage_weapon` в **основных** `effects` или в **любой** ветке `choices` — десятки (общие + локальные `elemental.ts` и др.). Полный перечень не дублируется здесь; источник правды — `grep damage_weapon` в [`src/modules/expeditions/data/events/`](../../src/modules/expeditions/data/events/).

**Регресс-тест:** [`event-template-damage-coverage.test.ts`](../../src/data/weapon-damage/event-template-damage-coverage.test.ts) — у каждого шаблона из `EVENT_REGISTRY`, где в данных есть `damage_weapon`, есть строка в [`EVENT_TEMPLATE_TO_DAMAGE_TAGS`](../../src/data/weapon-damage/event-template-to-damage-tags.ts).

**§3.4 / choice:** квалификация тегов после миссии использует **тот же детерминированный выбор ветки**, что и превью лута (`getEffectsForEventResolution`, сид от `expedition.startedAt` + порядок события). См. [ELEMENTAL_PLATFORM_SPEC.md](./ELEMENTAL_PLATFORM_SPEC.md) §3.4 (v1.0.6), [`expedition-post-mission-damage.ts`](../../src/lib/expedition-post-mission-damage.ts).

### 4.2. Маппинг «событие → теги повреждений»

Файл: [`src/data/weapon-damage/event-template-to-damage-tags.ts`](../../src/data/weapon-damage/event-template-to-damage-tags.ts) — **все 9** `physical_*` из §2 и **15** стихийных `elemental_*` из реестра покрыты хотя бы одним шаблоном; отдельные строки для локальных дублей (напр. пепел / рудники для огня/земли).

---

## 5. Чеклист SPEC §3.5 (актуально)

В [ELEMENTAL_PLATFORM_SPEC.md](./ELEMENTAL_PLATFORM_SPEC.md) **§3.5** таблицы стихий и физики **заполнены** id шаблонов и локациями (без **TBD** в колонке шаблона для канонических строк); версия канона **v1.0.6+**. При новых событиях с `damage_weapon` — обновлять §3.5 и маппинг в одном заходе.

---

## 6. Предпосылки: `presentElements` и фильтр §3.2.1

Сборщик [`expedition-post-mission-damage.ts`](../../src/lib/expedition-post-mission-damage.ts) отбрасывает **`elemental_*`**, если соответствующей **оси** нет в `presentElements` локации экспедиции.

**Следствие:** прежде чем добавлять событие с `elemental_lightning_arc`, на **какой-то** локации, где оно будет в пуле, в данных должно быть `presentElements: [..., 'lightning', ...]`.

**Аудит осей (код локаций, 2026-04):**

| Ось | Есть ли у ≥1 локации в `presentElements`? | Заметка |
| --- | ---------------------------------------- | -------- |
| Все оси из §3.6, используемые в `elemental_*` | **да** | в т.ч. `lightning` — `silver_grove`, `dragon_scars`; `arcane` — `whispering_forest`, `depths_of_the_world` |

Новые события на локации без нужной оси по-прежнему отфильтруются сборщиком §3.2.1 — проверять `presentElements` при контенте.

---

## 7. Матрица: стихии (ось → тег → якорные локации)

Ориентир для контента; **тег** фиксирован в SPEC §3. Якорь можно дублировать на соседних биомах с тем же `presentElements`.

| Ось | Тэг `elemental_*` | Где логичнее всего (id локаций) | Тон сцен (намёки) |
| --- | ------------------- | -------------------------------- | ----------------- |
| `fire` | `elemental_fire_scorch` | `ash_wastes`, `red_stone_mines` | жара, искры, жар печи / лавы |
| `water` | `elemental_water_soak` | `misty_lowlands`, `rotten_swamp` | дождь, туман, топь |
| `earth` | `elemental_earth_grit` | `red_stone_mines`, `forgotten_mines`, `frost_iron_ridge` | обвал породы, песок, крошка в механизмах |
| `air` | `elemental_air_shear` | `frost_iron_ridge`, `ash_wastes` | порывы, разрежение, «поющее» лезвие |
| `lightning` | `elemental_lightning_arc` | `silver_grove`, `dragon_scars` | удар током, дуга по стали |
| `frost` | `elemental_frost_bite` | `frost_iron_ridge` | иней, отморозок кромки |
| `poison` | `elemental_poison_etch` | `rotten_swamp` | кислота болота, яд существа |
| `corrosion` | `elemental_corrosion_rot` | `rotten_swamp` | гниение металла, кислотный туман |
| `space` | `elemental_space_shift` | `depths_of_the_world` | искажение геометрии, мираж лезвия |
| `darkness` | `elemental_darkness_stain` | `misty_lowlands`, `forgotten_mines`, `whispering_forest`, `depths_of_the_world` | тьма, тень на металле |
| `light` | `elemental_light_sear` | `silver_grove`, `dragon_scars` | лунный/солнечный ожог, вспышка (низкий `weight` §3.8) |
| `nature` | `elemental_nature_bloom` | `oak_grove_outskirts`, `whispering_forest` | споры, сок, корни в щелях |
| `arcane` | `elemental_arcane_noise` | `whispering_forest`, `depths_of_the_world` | магический резонанс, руны |
| `blood` | `elemental_blood_mark` | `dragon_scars`, `depths_of_the_world` | кровь на стали после боя |
| `skverna` | `elemental_skverna_taint` | `depths_of_the_world` | слизь, серость, «неправильный» металл |

---

## 8. Матрица: физика (тег → пример шаблона в маппинге)

| Тэг §2 | Пример шаблона в `EVENT_TEMPLATE_TO_DAMAGE_TAGS` | Примечание |
| ------ | ------------------------------------------------- | ---------- |
| `physical_slash_chip` | `event_common_obstacle`, `event_common_trap` | общие |
| `physical_loose_fitting` | `event_common_trap`, `event_common_unstable_ground` | |
| `physical_gouge_chunk` | `event_common_hunting_predator` | |
| `physical_bend_warp` | `event_common_territory_guardian` | при ветке с `damage_weapon` и переданном `startedAt` |
| `physical_blunt_dull` | `event_oak_boar_charge` | |
| `physical_crack_fissure` | `event_mine_cave_in` | |
| `physical_impact_dent` | `event_forgotten_cave_in` | |
| `physical_puncture_gouge` | `event_rotten_glass_reeds` | |
| `physical_handle_split` | `event_misty_swollen_haft` | |

---

## 9. Политика «общие» vs «локальные» события

| Ситуация | Рекомендация |
| -------- | ------------- |
| Повреждение универсально (ловушка, зверь, обвал) | `common/` + узкие `conditions`; один маппинг на шаблон |
| Стихия жёстко привязана к биому | Предпочтительно папка локации + `locationIds` в условиях **или** отдельный шаблон только для этой локации — меньше «тихих» отсечений фильтром |
| Редкая стихия (`light`, частично `lightning`) | Низкий `weight`, одна-две истории, не раздувать пул |

---

## 10. Батчи для пошагового выполнения в Cursor

Каждый батч — **один промпт** с границами. Шаблон:

```text
Контекст: @docs/systems/ELEMENTAL_PLATFORM_PHASE5_CONTENT_PLAN.md, §10 батч N.
Сделай только описанное; не меняй остальные батчи. После правок: test, type-check, lint.
```

| № | Содержание | Основные файлы | Критерий готовности |
| --- | ---------- | -------------- | ------------------- |
| **0** | Решения по §6: куда добавить `lightning` (и при необходимости `arcane` на глубинах); правка `presentElements` в `data/locations/*.ts` | `tier3.ts`, `tier4.ts` и др. | Оси согласованы с таблицей §7; type-check |
| **1** | Закрыть **физические дыры**: новые/изменённые события + маппинг для `physical_impact_dent`, `physical_puncture_gouge`, `physical_handle_split` | `events/**`, `event-template-to-damage-tags.ts` | Три тега есть в маппинге; §3.5 физика обновлена для этих строк |
| **2** | Стихии **tier 1–2** (например `fire`, `water`, `earth`, `poison`, `corrosion`, `nature` — по очереди или группой по биому) | локальные `events/*`, маппинг, §3.5 | Каждая сделанная ось: событие + маппинг + строка SPEC |
| **3** | Стихии **tier 3** (`frost`, `air`, усиление `fire`/`earth` в пепле/кряже) | `frost-iron-ridge`, `ash-wastes` | То же |
| **4** | Стихии **tier 4** + глубины (`space`, `skverna`, `blood`, `darkness`, `lightning` после батча 0) | `dragon-scars`, `depths-of-the-world` | То же |
| **5** | **Редкие** каналы: `elemental_light_sear`, при необходимости дубли крови/молнии с низким `weight` | выбранные пулы | §3.8 соблюдён; §3.5 без противоречий |
| **6** | Долги §4.1: маппинг для всех шаблонов с `damage_weapon` **или** удаление/замена урона оружия | `event-template-to-damage-tags.ts`, частично события | Нет «висящего» `damage_weapon` без осознанного решения |
| **7** | **§3.4:** проверка `choice`-событий с уроном по оружию (`event_common_territory_guardian` и др.) — ветка, попадающая в снимок, совпадает с автoresolve | `expedition-module-events-host` / снимки (по коду) | Теги доходят до сборщика; при необходимости тест |
| **8** | SPEC §3.5 полностью, Worklog, финальный прогон | `ELEMENTAL_PLATFORM_SPEC.md`, `ELEMENTAL_PLATFORM_IMPLEMENTATION.md` | Все TBD сняты или помечены осознанно; worklog запись |

**Статус (2026-04-05):** батчи **0–8** закрыты по текущему канону: `presentElements`, события и маппинг, [`ELEMENTAL_PLATFORM_SPEC.md`](./ELEMENTAL_PLATFORM_SPEC.md) §3.5/§3.4, worklog в [ELEMENTAL_PLATFORM_IMPLEMENTATION.md](./ELEMENTAL_PLATFORM_IMPLEMENTATION.md). Этот документ остаётся гайдом для **новых** правок контента.

Нумерация батчей **гибкая**: порядок 2–4 можно менять, но **батч 0** (оси) логично до массовых `elemental_*`.

---

## 11. Детальный план работ (логические этапы A–E)

### Этап A — сетка «ось / тэг → локация-якорь»

1. Для **каждой** строки стихий §3.5 сверить **матрицу §7** с `presentElements`.
2. Для **`light`:** редкие события + §3.8; не обязательно везде показывать ось на карточке, если канон — редкий пул.

### Этап B — новые или доработанные события

1. Текст повреждения клинка + `damage_weapon` (или итог одной ветки после автoresolve — §3.4).
2. Регистрация в [`events/index.ts`](../../src/modules/expeditions/data/events/index.ts).
3. Условия так, чтобы стихия не попадала в чужие биомы без смысла (фильтр — страховка).

### Этап C — маппинг и баланс весов

1. `EVENT_TEMPLATE_TO_DAMAGE_TAGS` для каждого шаблона с уроном по оружию, который должен давать видимый тег.
2. `weight`: обычное / редкое по §3.8.

### Этап D — физика (см. матрицу §8)

### Этап E — документация

1. §3.5 в SPEC.
2. Worklog.
3. `npm run test`, `npm run type-check`, `npm run lint`.

---

## 12. Технические файлы (чеклист разработчика)

| Действие | Файл / место |
| --------- | -------------- |
| Шаблоны событий | `src/modules/expeditions/data/events/**/*.ts` |
| Реестр событий | `src/modules/expeditions/data/events/index.ts` |
| Маппинг на теги | `src/data/weapon-damage/event-template-to-damage-tags.ts` |
| Канонические id тегов | `src/data/weapon-damage/damage-tag-registry.ts` |
| Фильтр после миссии | `src/lib/expedition-post-mission-damage.ts` |
| Тесты сборщика | `src/lib/expedition-post-mission-damage.test.ts` |
| Авторезолв / снимки choice | `src/lib/expedition-module-events-host.ts` (и связанные; батч 7) |

---

## 13. Подводные камни

- **Новый id тега** без строки в `DAMAGE_TAG_REGISTRY` и SPEC §2–§3 — запрещено; только существующие `physical_*` / `elemental_*`.
- **`damage_weapon` без маппинга** — игрок теряет видимый тег; либо маппинг, либо убрать эффект осознанно.
- **`choice` + урон по оружию** — пока автoresolve не кладёт итог ветки в снимок, теги из веток могут не учитываться (§3.4); батч 7.
- **Параллельные ветки git**, правящие один и тот же маппинг или §3.5, дают конфликты; сериализуйте батчи 6–8 или назначайте разные файлы агентам.
- **Тест `expedition-post-mission-damage`:** при добавлении новых пар событие→тег имеет смысл расширить кейсы фильтра по `presentElements`.

---

## 14. Опционально: обновить снимок чисел

```bash
npx tsx -e "import { MISSION_REGISTRY } from './src/modules/expeditions/data/missions/index.ts'; import { EVENT_REGISTRY } from './src/modules/expeditions/data/events/index.ts'; console.log('missions', MISSION_REGISTRY.length, 'events', EVENT_REGISTRY.length);"
```

---

## 15. Связанные документы

- [ELEMENTAL_PLATFORM_SPEC.md](./ELEMENTAL_PLATFORM_SPEC.md) — §3.3–§3.6, §3.8
- [ELEMENTAL_PLATFORM_IMPLEMENTATION.md](./ELEMENTAL_PLATFORM_IMPLEMENTATION.md) — фаза 5, worklog
- [ELEMENTAL_REGISTRY_COVERAGE.md](./ELEMENTAL_REGISTRY_COVERAGE.md) — аудит реестра тегов (если расширяете канон)
