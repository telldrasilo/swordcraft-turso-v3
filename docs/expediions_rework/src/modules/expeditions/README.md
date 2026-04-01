# Модуль экспедиций

Автономный модуль для системы локаций, миссий и экспедиций в IDLE-игре про кузнеца.

---

## 📊 Статистика модуля

| Категория | Количество | Статус |
|-----------|------------|--------|
| 🗺️ Локации | 11 | ✅ Готово |
| 💎 Материалы | ~70 | ✅ Готово |
| 📜 Миссии | 136 | ✅ Готово |
| 🎲 События | 108 | ✅ Готово |
| ⚖️ Балансировка | Global Config | ✅ Готово |

### Распределение по Tier

| Tier | Локации | Миссии | События |
|------|---------|--------|---------|
| Tier 1 | 3 | 36 | 24 |
| Tier 2 | 3 | 36 | 24 |
| Tier 3 | 3 | 40 | 12 |
| Tier 4 | 2 | 24 | 8 |
| Common | — | — | 40 |

---

## 📁 Структура модуля

```
src/modules/expeditions/
├── index.ts                    # Публичный API модуля
├── README.md                   # Этот файл
├── PLAN.md                     # План разработки
│
├── types/                      # TypeScript типы
│   ├── index.ts
│   ├── location.types.ts       # Типы локаций
│   ├── resource.types.ts       # Типы материалов
│   ├── expedition.types.ts     # Типы экспедиций
│   └── mission.types.ts        # Типы миссий
│
├── data/                       # Статические данные
│   ├── locations/
│   │   ├── index.ts            # Реестр локаций (11 шт)
│   │   └── tier*.ts            # Локации по уровням
│   │
│   ├── materials/
│   │   └── index.ts            # Реестр материалов (~70 шт)
│   │
│   ├── missions/
│   │   ├── _mission-template.ts  # Шаблон миссии
│   │   ├── index.ts              # Реестр миссий (136 шт)
│   │   └── {location_id}/        # Папки для каждой локации
│   │
│   └── events/
│       ├── _event-template.ts    # Шаблон события
│       ├── index.ts              # Реестр событий (108 шт)
│       ├── common/               # Общие события (40 шт)
│       │   ├── discovery.ts      # Находки (5)
│       │   ├── danger.ts         # Опасности (5)
│       │   ├── travel.ts         # Путевые (5)
│       │   ├── social.ts         # Социальные (5)
│       │   ├── environment.ts    # Окружение (3)
│       │   ├── treasure.ts       # Сокровища (3)
│       │   ├── mystery.ts        # Загадки (4)
│       │   ├── combat.ts         # Боевые (3)
│       │   ├── rest.ts           # Отдых (3)
│       │   └── supernatural.ts   # Сверхъестественное (4)
│       └── {location_id}/        # События для локаций (68 шт)
│
├── lib/                        # Утилиты и логика
│   ├── index.ts                # Экспорт всех утилит
│   ├── balance-config.ts       # Глобальная балансировка
│   ├── event-generator.ts      # Генератор событий
│   ├── location-utils.ts       # Утилиты локаций
│   ├── material-utils.ts       # Утилиты материалов
│   ├── mission-utils.ts        # Утилиты миссий
│   ├── validateEventData.ts    # Валидация событий
│   └── validateMissionData.ts  # Валидация миссий
│
└── contracts/                  # Интерфейсы интеграции
    ├── index.ts
    └── host-contracts.ts       # IHostContracts
```

---

## 🔧 Интеграция

### Базовый импорт

```typescript
import {
  // Типы
  type Location,
  type Material,
  type MissionTemplate,
  type EventTemplate,
  type GeneratedEvent,

  // Данные
  LOCATION_REGISTRY,
  MATERIAL_REGISTRY,
  MISSION_REGISTRY,
  EVENT_REGISTRY,

  // Утилиты
  getLocationById,
  getMissionsForLocation,
  getEventsForLocation,
  generateEventsForMission,
  resolveEventEffects,

  // Балансировка
  GLOBAL_BALANCE_CONFIG,
  applyResourceMultiplier,
  getRandomValue,
} from '@/modules/expeditions';
```

### Создание экспедиции

```typescript
import {
  getLocationById,
  getMissionsForLocation,
  generateEventsForMission,
  resolveEventEffects,
  filterEventsByConditions,
} from '@/modules/expeditions';

// 1. Получить локацию
const location = getLocationById('oak_grove_outskirts');
if (!location) throw new Error('Location not found');

// 2. Получить доступные миссии
const missions = getMissionsForLocation(location.id);
const mission = missions[0];

// 3. Сгенерировать события для миссии
const events = generateEventsForMission({
  mission,
  location,
  contractType: 'exploration',
  seed: Date.now(),
});

// 4. Создать экспедицию
const expedition = {
  id: `expedition_${Date.now()}`,
  missionId: mission.id,
  locationId: location.id,
  status: 'active',
  startTime: Date.now(),
  duration: mission.duration.base,
  events,
};

// 5. При срабатывании события
function onEventTriggered(event: GeneratedEvent) {
  const template = EVENT_REGISTRY.find(e => e.id === event.templateId);
  if (!template) return;

  // Разрешить эффекты (подставить материалы из локации)
  const effects = resolveEventEffects(template.effects, location, Date.now());

  // Применить эффекты к игроку
  for (const effect of effects) {
    switch (effect.type) {
      case 'grant_material':
        player.inventory.add(effect.materialId, effect.quantity);
        break;
      case 'grant_resource':
        player.resources[effect.resourceId] += effect.quantity;
        break;
      case 'damage_adventurer':
        player.health -= effect.quantity;
        break;
      // ... другие эффекты
    }
  }
}
```

### Фильтрация событий по тегам

```typescript
import { filterEventsByConditions, getEventsForLocation } from '@/modules/expeditions';

// Получить события с учётом тегов локации
const allEvents = getEventsForLocation('forgotten_mines');

const filteredEvents = filterEventsByConditions(allEvents, {
  locationId: 'forgotten_mines',
  locationType: 'mine',
  locationTags: ['underground', 'deep', 'ancient_structures'],
  locationTier: 2,
  missionType: 'hunt',
  missionDifficulty: 'normal',
  progress: 50, // % прогресса миссии
});
```

### Балансировка

```typescript
import {
  GLOBAL_BALANCE_CONFIG,
  applyResourceMultiplier,
  getRandomValue,
  resetBalanceConfig,
} from '@/modules/expeditions';

// Применить пресет
GLOBAL_BALANCE_CONFIG.applyPreset('testing'); // testing | development | hardcore | endgame

// Или настроить вручную
GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier = 2.0;
GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier = 0.5;
GLOBAL_BALANCE_CONFIG.rewards.goldMultiplier = 3.0;

// Использовать при расчёте наград
const gold = applyResourceMultiplier(mission.reward.gold.base, 'gold');
const materials = applyResourceMultiplier(5, 'material');
const variance = getRandomValue(10, 0.2); // base=10, variance=±20%

// Сбросить к стандартным значениям
resetBalanceConfig();
```

---

## 🎲 Система событий

### Типы событий

| Тип | Вес | Описание |
|-----|-----|----------|
| positive | 35% | Позитивные (находки, удача) |
| negative | 25% | Негативные (опасности, урон) |
| neutral | 30% | Нейтральные (встречи, выбор пути) |
| choice | 10% | С выбором (решение игрока) |

### Категории событий

| Категория | Количество | Примеры |
|-----------|------------|---------|
| discovery | 22 | Находки, открытия |
| danger | 19 | Ловушки, природные угрозы |
| combat | 16 | Враги, засады |
| social | 16 | Встречи с NPC |
| environment | 14 | Погода, природные явления |
| treasure | 9 | Сокровища, тайники |
| travel | 8 | Путь, препятствия |
| rest | 4 | Места для отдыха |

### Условия появления

```typescript
conditions: {
  // Фильтр по типу локации
  locationTypes: ['forest', 'mountain'],

  // Фильтр по тегам (ИЛИ)
  locationTags: ['ancient_structures', 'deep'],

  // Фильтр по tier (1-4)
  locationTiers: [2, 3, 4],

  // Фильтр по типу миссии
  missionTypes: ['hunt', 'scout'],

  // Прогресс миссии (0-100)
  minProgress: 20,
  maxProgress: 80,
}
```

---

## 💰 Экономика миссий

### Поток награды

```
┌─────────────────────────────────────────────────────────────┐
│                   НАГРАДА ОТ ЗАКАЗЧИКА                       │
│                    (фиксированная сумма)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  КОМИССИЯ ГИЛЬДИИ                            │
│         15% база + 2% за уровень гильдии (макс 30%)          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              ОСТАТОК К РАСПРЕДЕЛЕНИЮ                         │
└────────┬─────────────────────────────────────┬──────────────┘
         │                                     │
         ▼                                     ▼
┌─────────────────────┐               ┌─────────────────────┐
│   ДОГОВОР 80/20     │               │   ДОГОВОР 50/50     │
│  (Исследование)     │               │     (Скорость)      │
├─────────────────────┤               ├─────────────────────┤
│ Кузнец: 20% золота  │               │ Кузнец: 50% золота  │
│ Искатель: 80%       │               │ Искатель: 50%       │
├─────────────────────┤               ├─────────────────────┤
│ +50% к материалам   │               │ -30% к материалам   │
│ Стандартное время   │               │ -30% к времени      │
│ +20% событий        │               │ -20% событий        │
└─────────────────────┘               └─────────────────────┘
```

---

## ⚙️ Утилиты

### Валидация данных

```typescript
import { validateMission, validateEvent } from '@/modules/expeditions';

// Проверить миссию
const result = validateMission(mission);
if (!result.valid) {
  console.error('Ошибки:', result.errors);
}

// Проверить событие
const eventResult = validateEvent(event);
```

### Создание контента

```typescript
import {
  createHuntMission,
  createGatherMission,
  createScoutMission,
  addMissionToRegistry,
} from '@/modules/expeditions';

// Создать миссию охоты
const huntMission = createHuntMission({
  locationId: 'oak_grove_outskirts',
  enemyType: 'wild_boar',
  difficulty: 'easy',
});

// Добавить в реестр
addMissionToRegistry(huntMission);
```

---

## 📝 Разработка

### Добавление новой локации

1. Создать файл `data/locations/tier{n}/{location_id}.ts`
2. Импортировать в `data/locations/index.ts`
3. Добавить миссии в `data/missions/{location_id}/`
4. Добавить события в `data/events/{location_id}/`

### Добавление новых событий

1. Определить категорию (common/ или {location_id}/)
2. Создать событие по шаблону
3. Добавить теги для фильтрации
4. Запустить валидацию: `npm test`

### Запуск тестов

```bash
# Все тесты модуля
npm test -- src/modules/expeditions

# Только события
npm test -- events/index.test.ts

# Только миссии
npm test -- missions/index.test.ts
```

---

## 📚 Связанные файлы

- `PLAN.md` — детальный план разработки с чек-листами
- `_mission-template.ts` — шаблон и типы миссий
- `_event-template.ts` — шаблон и типы событий
- `contracts/host-contracts.ts` — интерфейсы интеграции
