# Документация модуля экспедиций

**Версия:** 1.0
**Дата обновления:** 2026-04-01

---

## 📋 Индекс

1. [Обзор модуля](#1-обзор-модуля)
2. [Архитектура и структура](#2-архитектура-и-структура)
3. [Система локаций](#3-система-локаций)
4. [Система миссий](#4-система-миссий)
5. [Система событий](#5-система-событий)
6. [Система материалов](#6-система-материалов)
7. [Система балансировки](#7-система-балансировки)
8. [Экономика и награды](#8-экономика-и-награды)
9. [Прочность оружия](#9-прочность-оружия)
10. [API модуля](#10-api-модуля)
11. [Интеграция с основным проектом](#11-интеграция-с-основным-проектом)

---

## 1. Обзор модуля

### 1.1 Назначение

Модуль экспедиций представляет собой автономную систему для управления локациями, миссиями и случайными событиями в IDLE-игре про кузнеца. Основная задача модуля — предоставить полноценную инфраструктуру для отправки искателей на миссии с генерацией случайных событий, распределением наград и управлением ресурсами.

Модуль спроектирован как автономный компонент, который может быть легко интегрирован в основной проект или использоваться независимо. Все данные хранятся в статических файлах TypeScript, что обеспечивает типобезопасность и отличную поддержку со стороны IDE. Система балансировки вынесена в централизованный конфиг, позволяя настраивать все параметры игры из одного места.

### 1.2 Статистика контента

| Категория | Количество | Статус |
|-----------|------------|--------|
| Локации | 11 | Готово |
| Материалы | ~70 | Готово |
| Миссии | 136 | Готово |
| События | 108 | Готово |
| Категории событий | 10 | Готово |
| Типов миссий | 8 | Готово |

### 1.3 Ключевые особенности

Модуль обладает рядом важных характеристик, которые определяют его архитектуру и способы использования. Во-первых, это полная автономность — модуль не зависит от внешних сервисов и может работать в изоляции. Во-вторых, централизованная балансировка позволяет менять параметры всей игры через единый конфигурационный файл. В-третьих, динамическая система событий автоматически подставляет материалы из ресурсов локации, обеспечивая тематическое соответствие.

Дополнительные преимущества включают поддержку seeded random для детерминированной генерации, что критически важно для тестирования и воспроизводимости результатов. Модуль также предоставляет развитую систему тегов для фильтрации событий по локациям, типам миссий и другим параметрам.

---

## 2. Архитектура и структура

### 2.1 Структура директорий

Модуль организован в чёткую иерархическую структуру, где каждый компонент имеет своё логическое место:

```
src/modules/expeditions/
├── index.ts                    # Публичный API модуля
├── README.md                   # Краткое описание
├── PLAN.md                     # План разработки
│
├── types/                      # TypeScript типы
│   ├── index.ts               # Экспорт всех типов
│   ├── location.types.ts      # Типы локаций
│   ├── resource.types.ts      # Типы материалов
│   ├── expedition.types.ts    # Типы экспедиций
│   └── mission.types.ts       # Типы миссий
│
├── data/                       # Статические данные
│   ├── locations/             # Локации (11 шт)
│   │   ├── index.ts           # Реестр
│   │   ├── tier1.ts           # Окраины Дубовой Рощи
│   │   ├── tier1-red-stone.ts # Рудники Красного Камня
│   │   ├── tier1-misty.ts     # Туманные Низины
│   │   ├── tier2.ts           # Tier 2 локации
│   │   ├── tier3.ts           # Tier 3 локации
│   │   └── tier4.ts           # Tier 4 локации
│   │
│   ├── materials/             # Материалы (~70 шт)
│   │   └── index.ts           # Реестр материалов
│   │
│   ├── missions/              # Миссии (136 шт)
│   │   ├── _mission-template.ts  # Шаблон
│   │   ├── index.ts              # Реестр
│   │   └── {location_id}/        # По папкам локаций
│   │
│   └── events/                # События (108 шт)
│       ├── _event-template.ts    # Шаблон
│       ├── index.ts              # Реестр
│       ├── common/               # Общие события (40)
│       └── {location_id}/        # События локаций (68)
│
├── lib/                        # Утилиты и логика
│   ├── index.ts               # Экспорт утилит
│   ├── balance-config.ts      # Глобальная балансировка
│   ├── event-generator.ts     # Генератор событий
│   ├── location-utils.ts      # Утилиты локаций
│   ├── material-utils.ts      # Утилиты материалов
│   └── mission-utils.ts       # Утилиты миссий
│
└── contracts/                  # Интерфейсы интеграции
    ├── index.ts
    └── host-contracts.ts      # IHostContracts
```

### 2.2 Публичный API

Модуль экспортирует чётко определённый набор функций и типов через файл `index.ts`:

```typescript
// Типы
export type { Location, Material, MissionTemplate, EventTemplate } from './types';
export type { Rarity, LocationTier, LocationType } from './types/location.types';

// Реестры данных
export { LOCATION_REGISTRY, getLocationById, getLocationsByTier } from './data/locations';
export { MATERIAL_REGISTRY, getMaterialById, getMaterialName } from './data/materials';
export { MISSION_REGISTRY, MISSIONS_BY_LOCATION, getMissionsForLocation } from './data/missions';
export { EVENT_REGISTRY, getEventsForLocation, filterEventsByConditions } from './data/events';

// Утилиты генерации
export { generateEventsForMission, resolveEventEffects } from './lib/event-generator';

// Балансировка
export {
  GLOBAL_BALANCE_CONFIG,
  applyResourceMultiplier,
  applyDurationMultiplier,
  getRandomValue,
  resetBalanceConfig,
} from './lib/balance-config';
```

### 2.3 Принципы проектирования

Архитектура модуля следует нескольким ключевым принципам. Первый — разделение данных и логики. Все статические данные (локации, миссии, события) хранятся в папке `data/`, а вся вычислительная логика — в `lib/`. Это упрощает добавление нового контента без изменения кода.

Второй принцип — масштабируемость через конфигурацию. Вместо хардкода значений используются масштабируемые структуры с параметрами base, variance, perDifficulty, perRarity. Это позволяет автоматически масштабировать награды и параметры в зависимости от сложности миссии.

Третий принцип — детерминизм при необходимости. Через seeded random можно гарантировать одинаковые результаты при одном и том же seed, что критически важно для тестирования и отладки.

---

## 3. Система локаций

### 3.1 Обзор локаций

Локации представляют собой игровые зоны, где искатели выполняют миссии. Каждая локация имеет уникальный набор ресурсов, врагов, погодных условий и сюжетных зацепок. Локации разделены на 4 тира по уровню сложности.

**Tier 1 (Начальный уровень):**
- Окраины Дубовой Рощи (`oak_grove_outskirts`) — лесная локация с базовыми ресурсами
- Рудники Красного Камня (`red_stone_mines`) — шахты с медью и камнем
- Туманные Низины (`misty_lowlands`) — болотистая местность с торфом

**Tier 2 (Средний уровень):**
- Серебряный Бор (`silver_grove`) — сосновый лес на сереброносных жилах
- Забытые Шахты (`forgotten_mines`) — древние туннели с загадками
- Гнилое Болото (`rotten_swamp`) — токсичная местность с уникальными ресурсами

**Tier 3 (Высокий уровень):**
- Кряж Морозного Железа (`frost_iron_ridge`) — горы с вечной мерзлотой
- Пепельные Пустоши (`ash_wastes`) — вулканическая зона
- Шепчущий Лес (`whispering_forest`) — магический лес

**Tier 4 (Эндгейм):**
- Драконьи Шрамы (`dragon_scars`) — место древней битвы драконов
- Глубины Подземелий (`depths_of_the_world`) — самые глубокие пещеры

### 3.2 Структура локации

Каждая локация описывается интерфейсом `Location` со следующими полями:

```typescript
interface Location {
  // Идентификация
  id: string;                  // Уникальный ID
  name: string;                // Название для UI
  description: string;         // Атмосферное описание (3-6 предложений)

  // Классификация
  tier: LocationTier;          // 1 | 2 | 3 | 4
  type: LocationType;          // 'forest' | 'mine' | 'swamp' | ...
  tags: LocationTag[];         // Теги для фильтрации событий

  // Доступ
  unlockRequirements: LocationUnlockRequirements;

  // Ресурсы
  resources: LocationResource[];
  rarityDistribution: RarityDistribution;

  // Условия
  weather: WeatherCondition[];

  // Население
  npcs: {
    hostile: LocationNPC[];
    neutral: LocationNPC[];
    friendly: LocationNPC[];
  };

  // Сюжет
  plotHook: string;
  dungeonHook?: DungeonHook;
}
```

### 3.3 Типы локаций и теги

Тип локации определяет общую категорию, а теги позволяют более точно описать особенности:

| Тип | Описание | Пример тегов |
|-----|----------|--------------|
| forest | Лесные массивы | ancient_trees, night_danger, lunar_magic |
| mine | Шахты и пещеры | underground, deep, ancient_structures |
| swamp | Болота | toxic, decay, poison, undead |
| mountain | Горы | cold, high_altitude, dragons |
| volcanic | Вулканические зоны | fire, lava, ash |
| underground | Подземелья | dark, deep, ancient |
| magical | Магические места | spirits, reality_distortion |

Теги используются системой событий для фильтрации — событие появится только если локация имеет соответствующие теги.

### 3.4 Система ресурсов локации

Каждая локация содержит массив ресурсов, которые могут быть найдены искателями:

```typescript
interface LocationResource {
  materialId: string;      // ID материала
  baseWeight: number;      // Базовый шанс выпадения
  rarity: Rarity;          // Редкость материала
  minQuantity: number;     // Минимальное количество
  maxQuantity: number;     // Максимальное количество
  seasonalModifier?: SeasonalModifier;
}
```

Распределение редкости по тирам локаций:

| Tier | Common | Uncommon | Rare | Epic | Legendary |
|------|--------|----------|------|------|-----------|
| 1 | 90% | 10% | 0% | 0% | 0% |
| 2 | 70% | 20% | 10% | 0% | 0% |
| 3 | 50% | 25% | 20% | 5% | 0% |
| 4 | 30% | 30% | 25% | 14% | 1% |

### 3.5 Требования для разблокировки

Локации могут требовать определённые условия для доступа:

```typescript
interface LocationUnlockRequirements {
  guildLevel: number;               // Минимальный уровень гильдии
  completedLocations?: string[];    // ID пройденных локаций
  requiredItems?: string[];         // Необходимые предметы
  questCompleted?: string;          // ID завершённого квеста
}
```

Функция проверки доступности:

```typescript
function isLocationAvailable(
  locationId: string,
  guildLevel: number,
  completedLocations: string[] = [],
  completedQuests: string[] = [],
  ownedItems: string[] = []
): boolean
```

---

## 4. Система миссий

### 4.1 Типы миссий

Модуль поддерживает 8 типов миссий, каждый со своими особенностями:

| Тип | Иконка | Описание | Предпочтительный договор |
|-----|--------|----------|--------------------------|
| hunt | 🗡️ | Охота на существ | exploration |
| scout | 🔭 | Разведка местности | exploration |
| clear | ⚔️ | Зачистка территории | speed |
| gather | 🎒 | Сбор ресурсов | exploration |
| rescue | 🆘 | Спасение персонажа | speed |
| delivery | 📦 | Доставка груза | speed |
| escort | 🛡️ | Сопровождение | speed |
| investigate | 🔍 | Расследование | exploration |

### 4.2 Сложность миссии

Сложность влияет на все параметры миссии — от количества врагов до награды:

| Сложность | Множитель времени | Шанс успеха | Штраф за провал | Множитель стоимости |
|-----------|-------------------|-------------|-----------------|---------------------|
| easy | 0.5x (30 мин) | 85% | 50% | 0.8x |
| normal | 1.0x (1 час) | 70% | 70% | 1.0x |
| hard | 2.0x (2 часа) | 50% | 100% | 1.5x |
| extreme | 4.0x (4 часа) | 30% | 150% | 2.5x |

### 4.3 Редкость миссии

Редкость определяет базовую награду и бонусы:

| Редкость | Вес генерации | Множитель награды | Бонус материалов | Мин. уровень гильдии |
|----------|---------------|-------------------|------------------|---------------------|
| common | 100 | 1.0x | +0% | 1 |
| uncommon | 40 | 1.5x | +15% | 2 |
| rare | 15 | 2.5x | +30% | 4 |
| epic | 5 | 4.0x | +50% | 7 |
| legendary | 1 | 8.0x | +100% | 10 |

### 4.4 Структура миссии

Полная структура шаблона миссии:

```typescript
interface MissionTemplate {
  // Идентификация
  id: string;
  locationId: string;

  // Классификация
  type: MissionType;
  rarity: MissionRarity;
  difficulty: MissionDifficulty;

  // Литературное описание
  name: string;
  description: string;      // 3-6 предложений
  objective: string;        // Чёткая цель

  // Заказчик
  client: MissionClient;

  // Время (масштабируемое)
  duration: ScalableValue;

  // Затраты (платит кузнец)
  cost: MissionCost;

  // Награда от заказчика
  reward: MissionReward;

  // Враги (для боевых миссий)
  enemies?: MissionEnemies;

  // Ресурсы (для gather миссий)
  resources?: MissionResourceTarget[];

  // Требования
  requirements?: MissionRequirements;

  // Повторяемость
  isRepeatable: boolean;
  cooldownHours: number;
}
```

### 4.5 Масштабируемые значения

Ключевая особенность системы — масштабируемые значения, которые автоматически адаптируются под сложность и редкость:

```typescript
interface ScalableValue {
  base: number;           // Базовое значение
  variance: number;       // ±процент случайности (0.2 = ±20%)
  perDifficulty: number;  // Добавка за уровень сложности
  perRarity: number;      // Добавка за уровень редкости
}
```

Пример расчёта награды:

```typescript
// Миссия: common, normal
reward.gold = { base: 50, variance: 0.2, perDifficulty: 25, perRarity: 15 }

// Расчёт:
// base = 50 + 25 * 1 (normal) + 15 * 0 (common) = 75
// withVariance = 75 ± 20% = 60-90

// Миссия: rare, hard
// base = 50 + 25 * 2 (hard) + 15 * 2 (rare) = 130
// withVariance = 130 ± 20% = 104-156
```

### 4.6 Договоры

Договоры определяют распределение награды между кузнецом и искателем:

**Договор исследования (80/20):**
- Кузнец: 20% золота (аренда оружия)
- Искатель: 80% золота
- Бонус: +50% к шансу найти материалы
- Длительность: стандартная
- Событий: +20% шанс

**Договор скорости (50/50):**
- Кузнец: 50% золота
- Искатель: 50% золота
- Штраф: -30% к материалам
- Длительность: -30%
- Событий: -20% шанс

---

## 5. Система событий

### 5.1 Типы событий

События разделены на 4 типа по характеру воздействия:

| Тип | Вес | Иконка | Описание |
|-----|-----|--------|----------|
| positive | 35% | ✨ | Позитивные события — находки, удача |
| negative | 25% | ⚠️ | Негативные события — опасности, урон |
| neutral | 30% | 💬 | Нейтральные события — встречи, выбор пути |
| choice | 10% | ❓ | События с выбором — решение игрока |

### 5.2 Категории событий

События дополнительно классифицируются по категориям:

| Категория | Количество | Примеры |
|-----------|------------|---------|
| discovery | 22 | Находки, открытия, тайники |
| danger | 19 | Ловушки, природные угрозы |
| combat | 16 | Враги, засады, стычки |
| social | 16 | Встречи с NPC, торговцы |
| environment | 14 | Погода, природные явления |
| treasure | 9 | Сокровища, ценности |
| travel | 8 | Путь, препятствия |
| rest | 4 | Места для отдыха |

### 5.3 Структура события

```typescript
interface EventTemplate {
  // Идентификация
  id: string;
  name: string;

  // Классификация
  type: EventType;           // positive | negative | neutral | choice
  category: EventCategory;

  // Текст
  title: string;
  description: string;       // 2-4 предложения
  flavorText?: string;

  // Условия появления
  conditions: EventConditions;

  // Эффекты
  effects: EventEffect[];

  // Для событий с выбором
  choices?: EventChoice[];

  // Вес при выборе
  weight: number;

  // Иконка
  icon: string;
}
```

### 5.4 Система условий появления

События имеют развитую систему условий, определяющих когда и где они могут появиться:

```typescript
interface EventConditions {
  // Фильтр по локации
  locationIds?: string[];        // Конкретные локации
  locationTypes?: LocationType[]; // Типы: forest, mine, swamp
  locationTags?: string[];       // Теги (ИЛИ)
  locationTiers?: number[];      // Тиры: [1, 2, 3]

  // Фильтр по миссии
  missionTypes?: MissionType[];
  missionDifficulties?: MissionDifficulty[];
  missionRarities?: string[];

  // Окружение
  weather?: string[];
  timeOfDay?: ('day' | 'night' | 'dawn' | 'dusk')[];

  // Прогресс миссии
  minProgress?: number;          // 0-100
  maxProgress?: number;

  // Вероятность
  baseChance?: number;

  // Требования
  requiresItems?: string[];
  requiresTraits?: string[];
}
```

### 5.5 Типы эффектов событий

События могут применять различные эффекты к игроку:

| Эффект | Описание | Параметры |
|--------|----------|-----------|
| grant_location_material | Выдать материал из локации | materialRarity, materialQuantity |
| grant_resource | Выдать фиксированный ресурс | resourceId, quantity |
| damage_weapon | Урон оружию | modifier (%) |
| damage_adventurer | Урон искателю | modifier (%) |
| modify_success_chance | Модификатор успеха | modifier (%) |
| modify_duration | Изменить время | modifier (сек) |
| modify_gold_reward | Модификатор награды | modifier (%) |
| spawn_enemy | Дополнительный враг | enemyType |
| narrative_only | Только текст | description |

### 5.6 Динамические материалы

Важная особенность системы — материалы подставляются динамически из ресурсов локации:

```typescript
{
  type: 'grant_location_material',
  materialRarity: 'common',    // Взять обычный материал ИЗ локации
  materialQuantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 0 },
  description: '+2-3 ресурса из локации'
}
```

Это обеспечивает тематическое соответствие — в шахтах находятся руды, в лесах — древесина и травы.

### 5.7 Количество событий

Количество событий рассчитывается автоматически:

```typescript
count = baseCount                                    // 2 база
     + durationMinutes * perMinuteDuration          // +1 на ~33 минуты
     + locationTier * perLocationTier               // +0.3 за tier
     + difficultyLevel * perDifficulty              // +0.3 за уровень
     + rarityLevel * perRarity                      // +0.2 за редкость
     + contractBonus[contractType]                  // ±1 за договор

// Ограничения
count = max(minCount, min(maxCount, count))         // 2-6 событий
```

### 5.8 Распределение по времени

События распределяются по времени миссии с элементом случайности:

```typescript
times[i] = (missionDuration / (eventCount + 1)) * i
         ± 20% variance
```

Это создаёт эффект реального прохождения — события происходят в разные моменты времени, а не одновременно.

---

## 6. Система материалов

### 6.1 Категории материалов

Материалы разделены на 9 категорий:

| Категория | Описание | Примеры |
|-----------|----------|---------|
| ore | Руда | iron_ore, copper_ore, mithril_ore |
| ingot | Слитки | iron_ingot, steel_ingot, mithril_ingot |
| wood | Дерево | oak_wood, pine_wood, spirit_wood |
| leather | Кожа | raw_leather, tanned_leather, shadow_leather |
| stone | Камень | stone, coal, flint |
| gem | Драгоценные камни | moonstone_shards, volcanic_glass |
| herb | Травы | wild_herbs, mist_herbs, toxic_moss |
| special | Специальные | heart_of_flame, heart_of_the_mountain |
| component | Компоненты | oak_bark, poison_gland, dragon_bone |

### 6.2 Редкость материалов

| Редкость | Цвет | Вес | Описание |
|----------|------|-----|----------|
| common | Серый | 100 | Стандартные материалы |
| uncommon | Зелёный | 40 | Улучшенные материалы |
| rare | Синий | 15 | Редкие материалы |
| epic | Фиолетовый | 5 | Эпические материалы |
| legendary | Оранжевый | 1 | Легендарные материалы |

### 6.3 Структура материала

```typescript
interface Material {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  rarity: Rarity;

  // Базовые свойства для крафта
  properties?: MaterialProperties;

  // Где добывается
  sourceLocations?: string[];

  // Для UI
  icon?: string;
  stackSize?: number;
}
```

### 6.4 Свойства материалов

Материалы могут иметь свойства, влияющие на крафт:

```typescript
interface MaterialProperties {
  hardness?: number;       // 0-100 — твёрдость
  weight?: number;         // Относительный вес
  conductivity?: number;   // Для металлов
  flexibility?: number;    // Для дерева/кожи
  magicAffinity?: number;  // Совместимость с магией
}
```

### 6.5 Материалы по локациям

Каждая локация имеет уникальный набор материалов. Пример для Забытых Шахт:

| Material ID | Название | Редкость | Количество |
|-------------|----------|----------|------------|
| tin_ore | Оловянная руда | common | 4-10 |
| coal | Уголь | common | 3-8 |
| iron_ore | Железная руда | common | 2-5 |
| deep_clay | Глубинная глина | common | 2-5 |
| ancient_coal | Древний уголь | uncommon | 1-3 |
| echo_stone | Эхо-камень | uncommon | 1-2 |
| black_dust | Чёрная пыль | uncommon | 1-3 |
| depth_iron | Глубинное железо | rare | 1-2 |

---

## 7. Система балансировки

### 7.1 Глобальный конфиг

Централизованная система балансировки находится в `lib/balance-config.ts`:

```typescript
const GLOBAL_BALANCE_CONFIG = {
  resources: {
    quantityMultiplier: 1.0,    // Множитель количества
    qualityShift: 0,            // Сдвиг редкости
    dropChanceMultiplier: 1.0,  // Множитель шанса выпадения
  },

  duration: {
    missionDurationMultiplier: 1.0,   // Множитель длительности миссий
    eventTimeMultiplier: 1.0,          // Множитель времени событий
  },

  rewards: {
    goldMultiplier: 1.0,
    experienceMultiplier: 1.0,
    gloryMultiplier: 1.0,
    warSoulMultiplier: 1.0,
  },

  softCaps: {
    enabled: false,             // Включить софткапы
    decayStartPoint: 100,       // Точка начала затухания
    decayRate: 0.01,            // Коэффициент затухания
    minMultiplier: 0.1,         // Минимальный множитель
  },

  debug: {
    verboseLogs: false,
    forceRarity: null,          // Принудительная редкость
    noRandom: false,            // Отключить случайность
    fixedSeed: null,            // Фиксированный seed
  },
};
```

### 7.2 Пресеты балансировки

Система поддерживает готовые пресеты для разных сценариев:

**default** — стандартный баланс:
- Все множители = 1.0
- Софткапы отключены

**testing** — для тестирования:
- Количество ресурсов ×3
- Длительность ×0.25
- Награды ×3-5
- Детерминированная генерация (seed=42)

**development** — для разработки:
- Стандартные значения
- Подробное логирование

**hardcore** — хардкор режим:
- Ресурсы ×0.5
- Длительность ×1.5
- Сдвиг редкости -1

**endgame** — эндгейм:
- Включены софткапы
- Затухание после 100 часов

### 7.3 Функции применения

```typescript
// Применить множитель ресурсов
applyResourceMultiplier(baseQuantity, resourceType): number

// Применить сдвиг редкости
applyQualityShift(baseRarity): Rarity

// Применить множитель длительности
applyDurationMultiplier(baseDuration): number

// Получить случайное значение с variance
getRandomValue(base, variance): number

// Применить софткап
applySoftCap(baseValue, progress): number
```

### 7.4 Софткапы для бесконечного прогресса

Система софткапов предотвращает экспоненциальный рост ресурсов:

```
effectiveValue = baseValue / (1 + (progress - startPoint) * decayRate)

Пример при decayRate = 0.01:
- До 100 часов: полная награда
- 150 часов: награда ×0.67
- 200 часов: награда ×0.50
- Минимум: награда ×0.1
```

---

## 8. Экономика и награды

### 8.1 Поток награды

Награда проходит через несколько этапов распределения:

```
НАГРАДА ОТ ЗАКАЗЧИКА (фиксированная сумма)
         │
         ▼
┌─────────────────────────────────────┐
│      КОМИССИЯ ГИЛЬДИИ               │
│  15% база + 2% за уровень гильдии   │
│         (макс 30%)                  │
└─────────────────────────────────────┘
         │
         ▼
ОСТАТОК К РАСПРЕДЕЛЕНИЮ
         │
    ┌────┴────┐
    ▼         ▼
80/20       50/50
(Исслед.)   (Скорость)
```

### 8.2 Комиссия гильдии

```typescript
const GUILD_COMMISSION = {
  basePercent: 15,
  perGuildLevel: 2,
  maxPercent: 30,

  calculate(guildLevel): number {
    return min(30, 15 + (guildLevel - 1) * 2);
  }
};

// Примеры:
// guildLevel 1: 15%
// guildLevel 5: 23%
// guildLevel 10: 30% (максимум)
```

### 8.3 Расчёт итоговой награды

```typescript
function calculateRewardDistribution(
  totalGold: number,
  guildLevel: number,
  contractType: ContractType,
  materials: MaterialReward[],
  warSoul: number,
  glory: number,
  experience: number
): RewardDistribution {
  // 1. Комиссия гильдии
  const commission = totalGold * GUILD_COMMISSION.calculate(guildLevel) / 100;

  // 2. Оставшаяся сумма
  const remaining = totalGold - commission;

  // 3. Распределение по договору
  const contract = CONTRACT_CONFIG[contractType];
  const blacksmithGold = remaining * contract.blacksmithGoldPercent / 100;
  const adventurerGold = remaining - blacksmithGold;

  // 4. Материалы с модификатором договора
  const adjustedMaterials = materials.map(m => ({
    ...m,
    quantity: m.quantity * contract.materialFindMultiplier
  }));

  return { commission, blacksmithGold, adventurerGold, materials: adjustedMaterials, ... };
}
```

### 8.4 Пример расчёта

Миссия: rare, hard, договор исследования

```
Базовая награда: 130 золота (с учётом сложности и редкости)
Уровень гильдии: 5

1. Комиссия гильдии: 130 × 23% = 30 золота
2. Остаётся: 130 - 30 = 100 золота
3. Распределение 80/20:
   - Кузнец: 100 × 20% = 20 золота
   - Искатель: 100 × 80% = 80 золота
4. Материалы: ×1.5 (бонус исследования)
5. Душа войны: база + бонусы событий
```

---

## 9. Прочность оружия

### 9.1 Система износа

Оружие теряет прочность во время миссий. Система спроектирована так, чтобы оружие требовало ремонта каждые 3-4 миссии.

**Константы:**
```typescript
const REPAIR_THRESHOLD = 20;           // Порог ремонта
const AVG_MISSIONS_TO_REPAIR = 3.5;    // Среднее число миссий до ремонта

const DURABILITY_LOSS_BY_DIFFICULTY = {
  easy: 0.7,
  normal: 1.0,
  hard: 1.4,
  extreme: 2.0,
};
```

### 9.2 Формула потери прочности

```typescript
function calculateDurabilityLoss(
  maxDurability: number,
  difficulty: string,
  durationSeconds: number,
  durabilityLossMultiplier: number = 1.0
): number {
  // Базовая потеря (чтобы хватило на 3-4 миссии)
  const lossRate = (maxDurability - REPAIR_THRESHOLD) / AVG_MISSIONS_TO_REPAIR;

  // Множители
  const difficultyModifier = DURABILITY_LOSS_BY_DIFFICULTY[difficulty];
  const durationModifier = durationSeconds / 3600;  // Нормализация к 1 часу

  // Итоговая потеря
  return max(1, floor(lossRate * difficultyModifier * durationModifier * durabilityLossMultiplier));
}
```

### 9.3 Примеры расчёта

Оружие с maxDurability = 100:

```
Миссия normal, 1 час:
  lossRate = (100 - 20) / 3.5 = 22.9
  totalLoss = 22.9 × 1.0 × 1.0 = 23 прочности

Миссия hard, 2 часа:
  totalLoss = 22.9 × 1.4 × 2.0 = 64 прочности

Миссия easy, 30 минут:
  totalLoss = 22.9 × 0.7 × 0.5 = 8 прочности
```

### 9.4 Потеря от негативных событий

Дополнительная потеря прочности от негативных событий:

```typescript
function calculateEventDurabilityLoss(
  maxDurability: number,
  baseLossPercent: number = 0.05  // 5% от доступной прочности
): number {
  const availableDurability = maxDurability - REPAIR_THRESHOLD;
  return max(1, floor(availableDurability * baseLossPercent));
}

// Пример: событие с 5% потерей
// (100 - 20) × 0.05 = 4 прочности
```

---

## 10. API модуля

### 10.1 GET Endpoints

**Получить доступные миссии:**
```
GET /api/expeditions?action=available-missions

Response: {
  missions: [{
    id, name, type, difficulty, rarity, description, objective,
    duration, cost, reward, client, location, enemies
  }]
}
```

**Сгенерировать оружие:**
```
GET /api/expeditions?action=generate-weapon

Response: {
  weapon: {
    id, name, type, attack, durability, maxDurability, quality, icon
  }
}
```

**Сгенерировать искателя:**
```
GET /api/expeditions?action=generate-adventurer

Response: {
  adventurer: {
    id, name, rarity, level, power, precision, endurance, luck,
    combatStyle, traits, icon
  }
}
```

**Получить конфиг балансировки:**
```
GET /api/expeditions?action=balance-config

Response: {
  config: {
    quantityMultiplier, qualityShift, durationMultiplier, warSoulMultiplier
  },
  presets: ['default', 'testing', 'development', 'hardcore', 'endgame'],
  constants: {
    repairThreshold: 20,
    avgMissionsToRepair: 3.5,
    difficultyModifiers: { easy: 0.7, normal: 1.0, hard: 1.4, extreme: 2.0 }
  }
}
```

### 10.2 POST Endpoints

**Начать миссию:**
```
POST /api/expeditions
Body: {
  action: 'start-mission',
  missionId: string,
  weapon: Weapon,
  adventurer: Adventurer,
  rewardSplit: '50/50' | '70/30',
  balanceMultipliers?: { quantity, duration }
}

Response: {
  mission: { id, name, type, difficulty, duration, location },
  weapon, adventurer, rewardSplit,
  events: GeneratedEvent[],
  durabilityLoss: { base, fromEvents, total },
  rewards: {
    base: { gold, glory, experience, warSoul },
    guildShare: { gold, glory },
    adventurerShare: { gold, glory },
    totalWarSoul
  },
  startTime: number
}
```

**Обновить баланс:**
```
POST /api/expeditions
Body: {
  action: 'update-balance',
  quantityMultiplier?: number,
  qualityShift?: number,
  durationMultiplier?: number
}

Response: { success: true, config: {...} }
```

### 10.3 Программный API

```typescript
import {
  // Данные
  LOCATION_REGISTRY,
  MATERIAL_REGISTRY,
  MISSION_REGISTRY,
  EVENT_REGISTRY,

  // Утилиты
  getLocationById,
  getMaterialById,
  getMissionsForLocation,
  getEventsForLocation,
  filterEventsByConditions,

  // Генерация
  generateEventsForMission,
  resolveEventEffects,

  // Баланс
  GLOBAL_BALANCE_CONFIG,
  applyResourceMultiplier,
  getRandomValue,
} from '@/modules/expeditions';

// Пример использования
const location = getLocationById('forgotten_mines');
const missions = getMissionsForLocation('forgotten_mines');
const events = getEventsForLocation('forgotten_mines');

// Фильтрация событий
const filtered = filterEventsByConditions(events, {
  locationId: 'forgotten_mines',
  locationType: 'mine',
  locationTags: ['underground', 'deep'],
  locationTier: 2,
  missionType: 'hunt',
  missionDifficulty: 'normal',
  progress: 50,
});

// Генерация событий для миссии
const generatedEvents = generateEventsForMission({
  mission: missions[0],
  location,
  contractType: 'exploration',
  seed: Date.now(),
});
```

---

## 11. Интеграция с основным проектом

### 11.1 Интерфейс хоста

Модуль определяет интерфейс для интеграции с основным проектом:

```typescript
interface IHostContracts {
  // Получить данные искателя
  getAdventurer(id: string): Promise<Adventurer | null>;
  getAdventurerExtended(id: string): Promise<AdventurerExtended | null>;

  // Получить данные оружия
  getWeapon(id: string): Promise<CraftedWeaponV2 | null>;

  // Управление ресурсами
  addResource(resourceId: string, amount: number): Promise<void>;
  removeResource(resourceId: string, amount: number): Promise<boolean>;

  // Управление материалами
  addMaterial(materialId: string, amount: number): Promise<void>;

  // Уведомления
  notify(event: string, data: unknown): void;
}
```

### 11.2 Создание экспедиции

```typescript
async function createExpedition(
  missionId: string,
  adventurerId: string,
  weaponId: string,
  contractType: ContractType
): Promise<ActiveExpedition> {
  // 1. Получить данные
  const mission = MISSION_REGISTRY.find(m => m.id === missionId);
  const location = getLocationById(mission.locationId);
  const adventurer = await host.getAdventurer(adventurerId);
  const weapon = await host.getWeapon(weaponId);

  // 2. Сгенерировать события
  const events = generateEventsForMission({
    mission,
    location,
    contractType,
    seed: Date.now(),
  });

  // 3. Создать экспедицию
  return {
    id: `expedition_${Date.now()}`,
    missionId,
    locationId: location.id,
    adventurerId,
    weaponId,
    startTime: Date.now(),
    duration: applyDurationMultiplier(mission.duration.base),
    events,
    status: 'active',
  };
}
```

### 11.3 Обработка событий

```typescript
async function handleEvent(
  expedition: ActiveExpedition,
  event: GeneratedEvent
): Promise<void> {
  const template = EVENT_REGISTRY.find(e => e.id === event.templateId);
  const location = getLocationById(expedition.locationId);

  // Разрешить эффекты
  const effects = resolveEventEffects(template.effects, location, Date.now());

  for (const effect of effects) {
    switch (effect.type) {
      case 'grant_material':
        await host.addMaterial(effect.materialId, effect.quantity);
        break;

      case 'grant_resource':
        await host.addResource(effect.resourceId, effect.quantity);
        break;

      case 'damage_weapon':
        // Уменьшить прочность оружия
        await host.notify('weapon_damaged', {
          weaponId: expedition.weaponId,
          amount: effect.quantity
        });
        break;

      case 'damage_adventurer':
        // Уменьшить HP искателя
        await host.notify('adventurer_damaged', {
          adventurerId: expedition.adventurerId,
          amount: effect.quantity
        });
        break;
    }
  }
}
```

### 11.4 Завершение экспедиции

```typescript
async function completeExpedition(
  expedition: ActiveExpedition
): Promise<ExpeditionResult> {
  const mission = MISSION_REGISTRY.find(m => m.id === expedition.missionId);
  const location = getLocationById(expedition.locationId);

  // 1. Рассчитать потерю прочности
  const baseLoss = calculateDurabilityLoss(
    expedition.weaponData.maxDurability,
    mission.difficulty,
    expedition.duration
  );
  const eventLoss = expedition.events.reduce(
    (sum, e) => sum + (e.effects?.durabilityLoss || 0), 0
  );

  // 2. Собрать награды
  const totalGold = calculateValue(mission.reward.gold, mission.difficulty, mission.rarity, 'gold');
  const totalWarSoul = mission.reward.warSoul.base +
    expedition.events.reduce((sum, e) => sum + (e.effects?.warSoul || 0), 0);

  // 3. Распределить награду
  const distribution = calculateRewardDistribution(
    totalGold,
    expedition.guildLevel,
    expedition.contractType,
    collectedMaterials,
    totalWarSoul,
    mission.reward.glory.base,
    mission.reward.experience.base
  );

  // 4. Выдать награды
  await host.addResource('gold', distribution.blacksmithGold);
  await host.addResource('warSoul', distribution.warSoul);

  for (const material of distribution.materials) {
    await host.addMaterial(material.materialId, material.quantity);
  }

  return {
    success: true,
    commission: distribution.guildCommission,
    warSoul: distribution.warSoul,
    materialsFound: distribution.materials,
    weaponWear: baseLoss + eventLoss,
  };
}
```

---

## Заключение

Модуль экспедиций представляет собой полноценную систему для управления контентом IDLE-игры. Его архитектура обеспечивает:

1. **Автономность** — модуль может работать независимо или интегрироваться в основной проект
2. **Гибкость** — система масштабируемых значений и централизованной балансировки
3. **Расширяемость** — чёткая структура для добавления нового контента
4. **Тематичность** — динамическая привязка событий к локациям через теги и ресурсы
5. **Тестируемость** — поддержка seeded random и пресеты для тестирования

Для добавления нового контента следуйте шаблонам в `_mission-template.ts` и `_event-template.ts`, а для настройки баланса используйте `GLOBAL_BALANCE_CONFIG`.
