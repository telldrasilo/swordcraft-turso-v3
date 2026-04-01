# План разработки модуля экспедиций

**Последнее обновление:** 2026-04-01

---

## 📊 Общий прогресс

| Категория | Прогресс | Количество |
|-----------|----------|------------|
| 🔧 Инфраструктура | ██████████ 100% | Шаблоны, типы, генераторы |
| 🗺️ Локации | ██████████ 100% | 11/11 |
| 💎 Материалы | ██████████ 100% | ~70/~70 |
| 📜 Миссии | ██████████ 100% | 136/136 |
| 🎲 События | ██████████ 100% | 108/108 |
| ⚖️ Балансировка | ██████████ 100% | GLOBAL_BALANCE_CONFIG |

---

## 🔄 Архитектура материалов (расширяемость)

### Схема связей

```
┌──────────────────────┐     ┌─────────────────────────┐
│   MATERIAL_REGISTRY   │     │    Location.resources    │
│   (все материалы)     │     │   (ссылки по ID + веса) │
│                       │     │                         │
│  id: 'iron_ore'       │────▶│  materialId: 'iron_ore' │
│  rarity: 'common'     │     │  rarity: 'common'       │
│  category: 'ore'      │     │  baseWeight: 100        │
└───────────────────────┘     └───────────┬─────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │      СОБЫТИЯ И МИССИИ          │
                          │                                │
                          │  materialRarity: 'common'      │
                          │  ↓                             │
                          │  Выбирает материал ИЗ локации  │
                          │  с указанной редкостью         │
                          │  ↓                             │
                          │  Учитывает baseWeight как вес  │
                          └───────────────────────────────┘
```

### Как добавить новый материал

```typescript
// 1. Добавить материал в реестр (data/materials/index.ts)
const newMaterial: Material = {
  id: 'crystal_rose',
  name: 'Хрустальная роза',
  description: 'Редкий цветок из магических лесов',
  category: 'herb',
  rarity: 'rare',
  sourceLocations: ['whispering_forest'],
};

// 2. Добавить в локацию (data/locations/...)
resources: [
  // ... существующие
  { materialId: 'crystal_rose', baseWeight: 20, rarity: 'rare', minQuantity: 1, maxQuantity: 2 },
],

// 3. Готово! События с materialRarity: 'rare' будут выдавать этот материал
```

### Как изменить вес материала

```typescript
import { updateResourceInLocation } from '../lib/material-utils';

const updatedLocation = updateResourceInLocation(
  location,
  'wild_herbs',
  { baseWeight: 50 }  // Было 30, чаще попадается
);
```

### Утилиты для управления (lib/material-utils.ts)

| Функция | Назначение |
|---------|------------|
| `addMaterialToRegistry()` | Добавить новый материал в реестр |
| `addResourceToLocation()` | Добавить материал в локацию |
| `updateResourceInLocation()` | Изменить вес/кол-во материала |
| `removeResourceFromLocation()` | Удалить материал из локации |
| `validateLocationMaterials()` | Проверить целостность данных |
| `recalculateRarityDistribution()` | Пересчитать % редкости |

### Утилиты для миссий (lib/mission-utils.ts)

| Функция | Назначение |
|---------|------------|
| `addMissionToRegistry()` | Добавить миссию в реестр |
| `updateMissionInRegistry()` | Обновить миссию |
| `updateMissionReward()` | Изменить награду |
| `updateMissionCost()` | Изменить затраты |
| `removeMissionFromRegistry()` | Удалить миссию |
| `getMissionsForLocation()` | Получить миссии локации |
| `getAvailableMissions()` | Фильтрация по контексту |
| `validateMission()` | Валидация миссии |
| `createHuntMission()` | Фабрика боевой миссии |
| `createGatherMission()` | Фабрика миссии сбора |
| `createScoutMission()` | Фабрика миссии разведки |

### Утилиты для локаций (lib/location-utils.ts)

| Функция | Назначение |
|---------|------------|
| `addLocationToRegistry()` | Добавить локацию |
| `updateLocationInRegistry()` | Обновить локацию |
| `updateLocationResources()` | Обновить ресурсы |
| `addResourceToLocationInRegistry()` | Добавить ресурс в локацию |
| `addNPCToLocation()` | Добавить NPC |
| `addWeatherToLocation()` | Добавить погоду |
| `validateLocation()` | Валидация локации |
| `createForestLocation()` | Фабрика лесной локации |
| `createMineLocation()` | Фабрика шахты |
| `createSwampLocation()` | Фабрика болота |
| `getLocationStats()` | Статистика локации |
| `getRegistryStats()` | Статистика реестра |

### Утилиты для событий (lib/validateEventData.ts)

| Функция | Назначение |
|---------|------------|
| `validateEvent()` | Валидация одного события |
| `validateAllEvents()` | Валидация всех событий |
| `validateEffect()` | Валидация эффекта |
| `validateChoice()` | Валидация выбора |
| `validateConditions()` | Валидация условий |

### Система балансировки (lib/balance-config.ts) ✅ НОВОЕ

| Функция | Назначение |
|---------|------------|
| `applyResourceMultiplier()` | Применить множитель количества ресурсов |
| `applyQualityShift()` | Сдвинуть редкость материалов |
| `applyDropChanceMultiplier()` | Множитель шанса выпадения |
| `applyDurationMultiplier()` | Множитель длительности миссий |
| `applySoftCap()` | Применить софткап для бесконечного прогресса |
| `getRandomValue()` | Получить случайное значение с учётом настроек |
| `resetBalanceConfig()` | Сбросить конфиг к стандартным значениям |

**Пресеты балансировки:**
- `default` — стандартный баланс
- `testing` — ×3 ресурсы, ×0.25 время, noRandom
- `development` — стандарт + логи
- `hardcore` — ×0.5 ресурсы, ×1.5 время
- `endgame` — софткапы включены

---

## ✅ Завершено

### Фаза 1: Фундамент
- [x] Создать структуру модуля
- [x] Определить TypeScript типы (Location, Material, Mission, Event)
- [x] Создать реестр локаций (11 локаций по 4 tier)
- [x] Создать реестр материалов (~70 материалов)
- [x] Создать контракты интеграции (IHostContracts)
- [x] Создать утилиты управления материалами (`material-utils.ts`)
- [x] Создать утилиты управления миссиями (`mission-utils.ts`)
- [x] Создать утилиты управления локациями (`location-utils.ts`)

### Фаза 2: Шаблоны
- [x] Шаблон миссии (`_mission-template.ts`)
  - [x] Типы договоров (exploration/speed)
  - [x] Комиссия гильдии
  - [x] Редкость и сложность
  - [x] Масштабируемые значения (ScalableValue)
  - [x] Функция распределения наград
- [x] Шаблон события (`_event-template.ts`)
  - [x] Типы эффектов (grant_location_material, damage_weapon, etc.)
  - [x] Динамический выбор материалов из локации
  - [x] Условия появления
  - [x] События с выбором

### Фаза 3: Генераторы
- [x] Базовый генератор событий (`event-generator.ts`)
  - [x] Расчёт количества событий
  - [x] Фильтрация по условиям
  - [x] Распределение по времени
  - [x] Разрешение эффектов (подстановка материалов)

### Фаза 3.5: Валидация данных
- [x] Создать утилиту валидации миссий (`validateMissionData.ts`)
- [x] Создать тесты валидации миссий (`missions/index.test.ts`)
- [x] Создать утилиту валидации событий (`validateEventData.ts`)
- [x] Создать тесты валидации событий (`events/index.test.ts`)
- [x] Исправить все ошибки валидации миссий (136/136 валидны)

---

## ⏳ В работе

### Фаза 4: Миссии для локаций ✅ ЗАВЕРШЕНО

Все миссии созданы и валидированы. См. историю ниже.

---

## 📋 Фаза 5: Пул случайных событий

### 5.0. Подготовка валидации событий ✅
- [x] Создать `lib/validateEventData.ts`
- [x] Создать `data/events/index.test.ts`
- [x] Добавить импорт событий в тест

### 5.1. Общие события (common/) - 40 событий ✅ ЗАВЕРШЕНО
**Задача:** Создать базовые события для всех локаций

- [x] **5.1.1. Создать `common/discovery.ts`** (5 событий)
  - [x] `event_common_resource_cache` - Тайник с ресурсами (positive, discovery)
  - [x] `event_common_forgotten_cache` - Забытый схрон (positive, treasure)
  - [x] `event_common_abandoned_camp` - Заброшенный лагерь (neutral, discovery)
  - [x] `event_common_old_grave` - Старая могила (neutral, discovery)
  - [x] `event_common_hidden_passage` - Скрытый проход (positive, discovery)

- [x] **5.1.2. Создать `common/danger.ts`** (5 событий)
  - [x] `event_common_trap` - Ловушка (negative, danger)
  - [x] `event_common_ambush` - Засада (negative, combat)
  - [x] `event_common_unstable_ground` - Неустойчивая почва (negative, danger)
  - [x] `event_common_sudden_storm` - Внезапный шторм (negative, environment)
  - [x] `event_common_poisonous_plant` - Ядовитое растение (negative, danger)

- [x] **5.1.3. Создать `common/travel.ts`** (5 событий)
  - [x] `event_common_crossroads` - Перекрёсток (neutral, travel)
  - [x] `event_common_ford` - Брод (neutral, travel)
  - [x] `event_common_shortcut` - Короткий путь (positive, travel)
  - [x] `event_common_obstacle` - Препятствие (negative, travel)
  - [x] `event_common_guide_offer` - Предложение проводника (choice, travel)

- [x] **5.1.4. Создать `common/social.ts`** (5 событий)
  - [x] `event_common_wanderer` - Странник (neutral, social)
  - [x] `event_common_refugee` - Беженец (choice, social)
  - [x] `event_common_merchant` - Бродячий торговец (positive, social)
  - [x] `event_common_beggar` - Нищий (choice, social)
  - [x] `event_common_lost_child` - Потерянный ребёнок (choice, social)

- [x] **5.1.5. Создать `common/environment.ts`** (3 события)
  - [x] `event_common_eerie_silence` - Зловещая тишина (neutral, environment)
  - [x] `event_common_falling_stars` - Падающие звёзды (positive, environment)
  - [x] `event_common_dense_fog` - Густой туман (negative, environment)

- [x] **5.1.6. Создать `common/treasure.ts`** (3 события)
  - [x] `event_common_hidden_stash` - Скрытый тайник (positive, treasure)
  - [x] `event_common_old_chest` - Старый сундук (choice, treasure)
  - [x] `event_common_looted_caravan` - Разграбленный караван (neutral, treasure)

- [x] **5.1.7. Создать `common/mystery.ts`** (4 события)
  - [x] `event_common_strange_totem` - Странный тотем (choice, discovery)
  - [x] `event_common_whispering_wind` - Шепчущий ветер (neutral, discovery)
  - [x] `event_common_rune_marking` - Руновая метка (choice, discovery)
  - [x] `event_common_fresh_tracks` - Свежие следы (neutral, discovery)

- [x] **5.1.8. Создать `common/index.ts`** с экспортами

- [x] **5.1.9. Создать `common/combat.ts`** (3 события)
  - [x] `event_common_hunting_predator` - Охотящийся хищник (negative, combat)
  - [x] `event_common_territory_guardian` - Страж территории (choice, combat)
  - [x] `event_common_necromancer_servants` - Слуги некроманта (negative, combat)

- [x] **5.1.10. Создать `common/rest.ts`** (3 события)
  - [x] `event_common_peaceful_glade` - Благоприятная поляна (positive, rest)
  - [x] `event_common_old_well` - Старый колодец (positive, rest)
  - [x] `event_common_abandoned_shelter` - Заброшенное укрытие (choice, rest)

- [x] **5.1.11. Создать `common/supernatural.ts`** (4 события)
  - [x] `event_common_ghostly_fire` - Призрачный огонь (choice, environment)
  - [x] `event_common_time_loop` - Временная петля (negative, environment)
  - [x] `event_common_voice_from_deep` - Голос из глубины (choice, discovery)
  - [x] `event_common_forgotten_deity` - Забытое божество (neutral, discovery)

- [x] **5.1.12. Обновить `common/index.ts`** с новыми экспортами

- [x] **5.1.13. Запустить валидацию** `npm test -- events/index.test.ts`

**Итого: 40 событий | 11 тестов ✅**

### 5.2. События Tier 1 - Окраины Дубовой Рощи (oak-grove-outskirts/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для лесной локации

- [x] **5.2.1. Создать `oak-grove-outskirts/forest.ts`** (4 события)
  - [x] `event_oak_forest_spirit` - Дух леса (choice, discovery)
  - [x] `event_oak_ancient_tree` - Древнее дерево (positive, discovery)
  - [x] `event_oak_fairy_ring` - Ведьмин круг (choice, environment)
  - [x] `event_oak_animal_signs` - Следы зверей (neutral, travel)

- [x] **5.2.2. Создать `oak-grove-outskirts/wildlife.ts`** (4 события)
  - [x] `event_oak_wolf_howl` - Волчий вой (negative, danger)
  - [x] `event_oak_boar_charge` - Кабанья атака (negative, combat)
  - [x] `event_oak_deer_sighting` - Лось на тропе (neutral, travel)
  - [x] `event_oak_hunted_prey` - Добыча охотника (positive, discovery)

- [x] **5.2.3. Создать `oak-grove-outskirts/index.ts`**

- [x] **5.2.4. Обновить импорт в `events/index.test.ts`**

- [x] **5.2.5. Запустить валидацию**

**Итого: 8 событий | 11 тестов ✅**

### 5.3. События Tier 1 - Рудники Красного Камня (red-stone-mines/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для шахты

- [x] **5.3.1. Создать `red-stone-mines/underground.ts`** (4 события)
  - [x] `event_mine_cave_in` - Обвал (negative, danger)
  - [x] `event_mine_gas_pocket` - Газовый карман (negative, danger)
  - [x] `event_mine_ore_vein` - Богатая жила (positive, treasure)
  - [x] `event_mine_flooded_tunnel` - Затопленный туннель (choice, travel)

- [x] **5.3.2. Создать `red-stone-mines/miners.ts`** (4 события)
  - [x] `event_mine_ghost_miner` - Призрак шахтёра (neutral, social)
  - [x] `event_mine_abandoned_equipment` - Брошенное оборудование (positive, discovery)
  - [x] `event_mine_trapped_miner` - Заваленный шахтёр (choice, social)
  - [x] `event_mine_old_camp` - Старый лагерь (neutral, rest)

- [x] **5.3.3. Создать `red-stone-mines/index.ts`**

- [x] **5.3.4. Обновить импорт, запустить валидацию**

**Итого: 8 событий | 11 тестов ✅**

### 5.4. События Tier 1 - Туманные Низины (misty-lowlands/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для болота

- [x] **5.4.1. Создать `misty-lowlands/fog.ts`** (4 события)
  - [x] `event_misty_fog_voices` - Голоса в тумане (choice, environment)
  - [x] `event_misty_ghost_encounter` - Туманный призрак (choice, combat)
  - [x] `event_misty_fog_clearing` - Просвет в тумане (positive, discovery)
  - [x] `event_misty_submerged_bells` - Затонувшие колокола (neutral, environment)

- [x] **5.4.2. Создать `misty-lowlands/swamp.ts`** (4 события)
  - [x] `event_misty_quicksand` - Зыбучие пески (negative, danger)
  - [x] `event_misty_bog_walker` - Болтоходец (choice, combat)
  - [x] `event_misty_herbalist_hut` - Хижина на сваях (positive, social)
  - [x] `event_misty_leech_ambush` - Засада пиявок (negative, danger)

- [x] **5.4.3. Создать `misty-lowlands/index.ts`**
- [x] **5.4.4. Обновить импорт, запустить валидацию**

**Итого: 8 событий | 53 теста ✅**

### 5.5. События Tier 2 - Серебряный Бор (silver-grove/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для магического леса

- [x] **5.5.1. Создать `silver-grove/lunar.ts`** (4 события)
  - [x] `event_silver_moon_wolf` - Лунный волк (choice, combat)
  - [x] `event_silver_shadow_hunter` - Теневой охотник (negative, danger)
  - [x] `event_silver_moonlight` - Лунное озарение (positive, discovery)
  - [x] `event_silver_werewewolf` - Оборотень-одиночка (choice, combat)

- [x] **5.5.2. Создать `silver-grove/silver.ts`** (4 события)
  - [x] `event_silver_ore_vein` - Серебряная жила (positive, discovery)
  - [x] `event_silver_silversmith` - Серебряных дел мастер (choice, social)
  - [x] `event_silver_spider` - Серебряный паук (negative, danger)
  - [x] `event_silver_forest_maiden` - Лесная дева (positive, social)

- [x] **5.5.3. Создать `silver-grove/index.ts`**
- [x] **5.5.4. Обновить импорт, запустить валидацию**

**Итого: 8 событий | 53 теста ✅**

### 5.6. События Tier 2 - Забытые Шахты (forgotten-mines/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для древних шахт

- [x] **5.6.1. Создать `forgotten-mines/ancient.ts`** (4 события)
  - [x] `event_forgotten_ancient_machinery` - Древний механизм (choice, discovery)
  - [x] `event_forgotten_sealed_door` - Запечатанная дверь (choice, treasure)
  - [x] `event_forgotten_ancient_guardian` - Древний страж (negative, combat)
  - [x] `event_forgotten_echoes` - Эхо прошлого (neutral, environment)

- [x] **5.6.2. Создать `forgotten-mines/depth.ts`** (4 события)
  - [x] `event_forgotten_deep_crawler` - Глубинный ползун (negative, combat)
  - [x] `event_forgotten_echo_beast` - Эхо-тварь (choice, danger)
  - [x] `event_forgotten_ghost_miner` - Призрак древнего шахтёра (choice, social)
  - [x] `event_forgotten_cave_in` - Обвал (negative, danger)

- [x] **5.6.3. Создать `forgotten-mines/index.ts`**
- [x] **5.6.4. Обновить импорт, запустить валидацию**

**Итого: 8 событий | 53 теста ✅**

### 5.7. События Tier 2 - Гнилое Болото (rotten-swamp/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для токсичного болота

- [x] **5.7.1. Создать `rotten-swamp/toxic.ts`** (4 события)
  - [x] `event_rotten_poison_fog` - Ядовитый туман (negative, danger)
  - [x] `event_rotten_disease` - Болезнь (negative, danger)
  - [x] `event_rotten_alchemist_cache` - Схрон алхимика (positive, treasure)
  - [x] `event_rotten_poisoner` - Отравитель-отшельник (choice, social)

- [x] **5.7.2. Создать `rotten-swamp/undead.ts`** (4 события)
  - [x] `event_rotten_drowned` - Гнилой утопленник (choice, combat)
  - [x] `event_rotten_corpse_eater` - Трупоед (neutral, social)
  - [x] `event_rotten_swamp_lich` - Болото-лич (negative, combat)
  - [x] `event_rotten_drowned_spirit` - Дух утопленника (choice, social)

- [x] **5.7.3. Создать `rotten-swamp/index.ts`**
- [x] **5.7.4. Обновить импорт, запустить валидацию**

**Итого: 8 событий | 53 теста ✅**

### 5.8. События Tier 3 - Кряж Морозного Железа (frost-iron-ridge/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для ледяных гор

- [x] **5.8.1. Создать `frost-iron-ridge/cold.ts`** (4 события)
  - [x] `event_frost_blizzard` - Метель (negative, environment)
  - [x] `event_frost_frozen_traveler` - Замёрзший путник (choice, social)
  - [x] `event_frost_ice_cave` - Ледяная пещера (positive, discovery)
  - [x] `event_frost_giant_trail` - След великана (neutral, danger)

- [x] **5.8.2. Создать `frost-iron-ridge/index.ts`**
- [x] **5.8.3. Обновить импорт, запустить валидацию**

**Итого: 4 события | 53 теста ✅**

### 5.9. События Tier 3 - Пепельные Пустоши (ash-wastes/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для вулканической зоны

- [x] **5.9.1. Создать `ash-wastes/fire.ts`** (4 события)
  - [x] `event_ash_eruption` - Извержение (negative, danger)
  - [x] `event_ash_fire_elemental` - Огненный элементаль (choice, combat)
  - [x] `event_ash_buried_city` - Погребённый город (positive, discovery)
  - [x] `event_ash_heat_wave` - Жара (negative, environment)

- [x] **5.9.2. Создать `ash-wastes/index.ts`**
- [x] **5.9.3. Обновить импорт, запустить валидацию**

**Итого: 4 события | 53 теста ✅**

### 5.10. События Tier 3 - Шепчущий Лес (whispering-forest/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для магического леса

- [x] **5.10.1. Создать `whispering-forest/magic.ts`** (4 события)
  - [x] `event_whisper_voices` - Голоса леса (choice, environment)
  - [x] `event_whisper_ancient_druid` - Древний друид (positive, social)
  - [x] `event_whisper_memory_tree` - Древо памяти (positive, discovery)
  - [x] `event_whisper_shadow_self` - Теневое "я" (choice, danger)

- [x] **5.10.2. Создать `whispering-forest/index.ts`**
- [x] **5.10.3. Обновить импорт, запустить валидацию**

**Итого: 4 события | 53 теста ✅**

### 5.11. События Tier 4 - Драконьи Шрамы (dragon-scars/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для драконьих земель

- [x] **5.11.1. Создать `dragon-scars/dragon.ts`** (4 события)
  - [x] `event_dragon_flight` - Полёт дракона (negative, danger)
  - [x] `event_dragon_hoard` - Клад дракона (positive, treasure)
  - [x] `event_dragon_wyrmling` - Дракончик (choice, combat)
  - [x] `event_dragon_scorched_earth` - Выжженная земля (negative, environment)

- [x] **5.11.2. Создать `dragon-scars/index.ts`**
- [x] **5.11.3. Обновить импорт, запустить валидацию**

**Итого: 4 события | 53 теста ✅**

### 5.12. События Tier 4 - Глубины Подземелий (depths-of-the-world/) ✅ ЗАВЕРШЕНО
**Задача:** Создать события для глубин

- [x] **5.12.1. Создать `depths-of-the-world/eldritch.ts`** (4 события)
  - [x] `event_depths_void_whisper` - Шёпот бездны (choice, danger)
  - [x] `event_depths_ancient_machine` - Древняя машина (choice, discovery)
  - [x] `event_depths_living_rock` - Живая порода (negative, combat)
  - [x] `event_depths_heart_of_mountain` - Сердце горы (positive, treasure)

- [x] **5.12.2. Создать `depths-of-the-world/index.ts`**
- [x] **5.12.3. Обновить импорт, запустить валидацию**

**Итого: 4 события | 53 теста ✅**

### 5.13. Финализация событий ✅ ЗАВЕРШЕНО

- [x] **5.13.1. Создать главный `events/index.ts`** с экспортами всех событий
- [x] **5.13.2. Запустить полную валидацию** всех событий
- [x] **5.13.3. Проверить распределение типов и категорий**
- [x] **5.13.4. Проверить баланс весов**

**Итого: 108 событий | 11 тестов ✅**

**Распределение по типам:**
- positive: 25 (23%)
- negative: 30 (28%)
- neutral: 18 (17%)
- choice: 35 (32%)

**Распределение по категориям:**
- combat: 16 | discovery: 22 | travel: 8 | social: 16
- environment: 14 | treasure: 9 | danger: 19 | rest: 4

**Баланс весов:**
- Диапазон: 6-25
- Средний: ~13
- Основной диапазон (10-15): 83% событий

---

## ✅ Фаза 5 ЗАВЕРШЕНА

Все события созданы, валидированы и готовы к использованию.

---

## 📋 Фаза 6: Интеграция ✅ ЗАВЕРШЕНО

- [x] Обновить главный `index.ts` с экспортами миссий
- [x] Обновить главный `index.ts` с экспортами событий
- [x] Создать реестры миссий (уже есть в data/missions/index.ts)
- [x] Создать реестры событий (уже есть в data/events/index.ts)
- [x] Протестировать генерацию событий (19 тестов ✅)
- [x] Написать документацию по интеграции (README.md обновлён)

**Итоговый API модуля:**
- Экспорт всех типов (Location, Material, Mission, Event)
- Экспорт всех реестров (LOCATION_REGISTRY, MISSION_REGISTRY, EVENT_REGISTRY)
- Экспорт утилит (getLocations, getMissions, getEvents, generateEvents)
- Экспорт балансировки (GLOBAL_BALANCE_CONFIG, applyMultipliers)
- Экспорт валидации (validateMission, validateEvent)

---

## 📝 Шаблоны для создания

### Миссия (буквально копировать)

```typescript
import { MissionTemplate } from '../../missions/_mission-template';

export const missionNameHere: MissionTemplate = {
  id: 'location_type_name_variant',
  locationId: 'location_id_here',
  
  type: 'hunt', // hunt | scout | clear | gather | rescue | delivery | escort | investigate
  rarity: 'common', // common | uncommon | rare | epic | legendary
  difficulty: 'easy', // easy | normal | hard | extreme
  
  name: 'Название миссии',
  description: `Литературное описание из 3-6 предложений.
Второе предложение развивает сюжет.
Третье добавляет деталей.
Четвёртое создаёт атмосферу.
Пятое намекает на опасности.
Шестое даёт чёткую цель.`,
  objective: 'Чёткая цель одной строкой',
  
  client: {
    name: 'Имя заказчика',
    type: 'farmer', // farmer | merchant | noble | guild | military | scholar | commoner
    description: 'Краткое описание',
  },
  
  duration: {
    base: 1800, // 30 мин = 1800 сек
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },
  
  cost: {
    supplies: { base: 10, variance: 0.1, perDifficulty: 5, perRarity: 3 },
    deposit: { base: 20, variance: 0.1, perDifficulty: 10, perRarity: 5 },
  },
  
  reward: {
    gold: { base: 50, variance: 0.2, perDifficulty: 25, perRarity: 15 },
    glory: { base: 2, variance: 0, perDifficulty: 1, perRarity: 1 },
    experience: { base: 20, variance: 0.1, perDifficulty: 10, perRarity: 5 },
    warSoul: { base: 5, variance: 0.2, perDifficulty: 3, perRarity: 2 },
  },
  
  enemies: {
    types: ['enemy_type_from_location'],
    count: { base: 3, variance: 0.3, perDifficulty: 1, perRarity: 0 },
    levelBonus: 0,
  },
  
  isRepeatable: true,
  cooldownHours: 4,
};
```

### Событие (буквально копировать)

```typescript
import { EventTemplate } from '../_event-template';

export const eventNameHere: EventTemplate = {
  id: 'event_category_name',
  name: 'Название события',
  type: 'positive', // positive | negative | neutral | choice
  category: 'discovery', // combat | discovery | travel | social | environment | treasure | danger | rest
  
  title: 'Заголовок для UI',
  description: `Описание события из 2-4 предложений.
Развитие ситуации.
Детали окружения.`,
  flavorText: 'Курсивный текст для атмосферы',
  
  conditions: {
    locationTypes: ['forest'], // Типы локаций
    minProgress: 10,
    maxProgress: 90,
  },
  
  effects: [
    {
      type: 'grant_location_material', // ← Материал ИЗ локации!
      materialRarity: 'common', // common | uncommon | rare | epic
      materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
      description: '+2-3 ресурса из локации',
    },
  ],
  
  weight: 25,
  icon: '📦',
};
```

### Событие с выбором

```typescript
import { EventTemplate } from '../_event-template';

export const choiceEventHere: EventTemplate = {
  id: 'event_choice_example',
  name: 'Название события',
  type: 'choice',
  category: 'discovery',
  
  title: 'Заголовок для UI',
  description: 'Описание ситуации с выбором...',
  
  conditions: {
    locationTypes: ['forest', 'mountain'],
  },
  
  choices: [
    {
      id: 'choice_a',
      text: 'Вариант А',
      effects: [
        { type: 'grant_location_material', materialRarity: 'uncommon', 
          materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
          description: 'Найти редкий материал' },
      ],
      resultText: 'Результат выбора А',
    },
    {
      id: 'choice_b',
      text: 'Вариант Б',
      effects: [
        { type: 'narrative_only', description: 'Ничего не произошло' },
      ],
      resultText: 'Результат выбора Б',
    },
  ],
  
  weight: 15,
  icon: '❓',
};
```

---

## 🎯 Приоритеты

1. **Общие события (common/)** — база для всех локаций
2. **События Tier 1** — для тестирования механик
3. **События Tier 2-3** — средний контент
4. **События Tier 4** — эндгейм
5. **Интеграция** — финализация

---

## 📋 Чек-лист перед началом работы над событиями

- [x] Изучить `_event-template.ts`
- [x] Создать валидацию событий (`validateEventData.ts`)
- [x] Создать тесты валидации (`events/index.test.ts`)
- [ ] Выбрать категорию событий для работы
- [ ] Создать файлы событий
- [ ] Экспортировать в `index.ts`
- [ ] Запустить валидацию

---

## 📊 Целевое количество событий

| Категория | Количество | Описание |
|-----------|------------|----------|
| common/discovery | 5 | Находки |
| common/danger | 5 | Опасности |
| common/travel | 5 | Путевые |
| common/social | 5 | Встречи |
| **common/total** | **20** | |
| Tier 1 (x3 локации) | 12x3=36 | По 4 события x 4 категории |
| Tier 2 (x3 локации) | 12x3=36 | По 4 события x 4 категории |
| Tier 3 (x3 локации) | 12x3=36 | По 4 события x 4 категории |
| Tier 4 (x2 локации) | 8x2=16 | По 4 события x 4 категории |
| **Итого** | **~60-80** | |

---

*Обновлять этот файл после каждой сессии работы*
