# Loot System - Система случайных находок для экспедиций

## Быстрый старт

### Что это?

Система Loot System генерирует случайные находки (loot) для искателей во время экспедиций. Loot может включать:

- **Resources**: Базовые ресурсы (gold, wood, iron и т.д.)
- **Materials**: Специальные материалы (rare essences, magic stones)
- **Recipes**: Рецепты крафта оружия
- **Knowledge**: Знания (информация о врагах, локациях)

### Где использовать?

Loot генерируется только при событиях определённых типов:

- `treasure` — сундук, тайник, добыча врагов
- `discvery` — открытие, исследование, находка

Другие типы событий не генерируют loot.

---

## Структура проекта

```
loot-system/
├── types/
│   └── expedition-loot.types.ts    # Все TypeScript типы
├── data/
│   ├── loot-tables.ts              # Таблицы дропа по локациям
│   └── knowledge-discoveries.ts    # База знаний
├── lib/
│   ├── loot-generator.ts            # Генератор loot
│   └── loot-integration.ts         # Слой интеграции
├── examples/
│   └── loot-usage.ts              # Примеры использования
├── expedition_loot_system_specification.md  # Полная спецификация
├── INTEGRATION_GUIDE.md          # Гайд по интеграции
└── README_LOOT_SYSTEM.md          # Этот файл
```

---

## Зависимости от основного проекта

Минимальные зависимости для автономной работы:

### Требуемые типы

Система использует следующие типы из основного проекта (ПЕРЕКОПИРОВАНО для автономности):

- `LocationTag` — типы локаций (forest, cave, ruins и т.д.)
- `ExpeditionDifficulty` — сложности экспедиций (easy, normal, hard и т.д.)
- `ExpeditionEventType` — типы событий (treasure, discovery, combat и т.д.)

При интеграции в основной проект эти типы можно заменить на импорты из:
- `src/types/expedition-tags.ts` (LocationTag)
- `src/data/expedition-templates.ts` (ExpeditionDifficulty)
- `src/types/expedition-events.ts` (ExpeditionEventType)

### Необходимые системы

Для полной работы требуется:

1. **Zustand Store** — для применения loot к игроку
2. **Система экспедиций** — для генерации событий
3. **Система ресурсов** — для добавления ресурсов
4. **Система материалов** — для добавления материалов
5. **Энциклопедия** — для разблокировки материалов/знаний

---

## Как тестировать автономно

### 1. Запуск примеров

```bash
# Из корня проекта
npx ts-node examples/loot-usage.ts
```

Это запустит все 10 примеров и покажет работу системы.

### 2. Использование в коде

```typescript
import { generateLootFromEvent, createMockContext, createMockEvent } from './lib/loot-generator'

// Создать событие
const event = createMockEvent('treasure')

// Создать контекст
const context = createMockContext({
  expedition: {
    difficulty: 'normal',
    location: 'forest',
    duration: 600,
  },
  adventurer: {
    level: 15,
    luck: 25,
    traits: ['lucky_star', 'explorer'],
  },
})

// Генерировать loot
const loot = generateLootFromEvent(event, context)

console.log('Сгенерировано:', loot.length, 'loot')
loot.forEach(drop => {
  console.log(`[${drop.rarity}] ${drop.type}:`, drop.item)
})
```

### 3. Принудительные параметры (для тестирования)

```typescript
import { generateLootFromEvent } from './lib/loot-generator'

const options = {
  forceType: 'materials',      // Только материалы
  forceRarity: 'rare',        // Только rare редкость
  minCount: 3,                // Минимум 3 loot
  maxCount: 5,                // Максимум 5 loot
}

const loot = generateLootFromEvent(event, context, options)
```

---

## Архитектура системы

### Основные компоненты

1. **Генератор (loot-generator.ts)** — генерирует loot на основе контекста
2. **Данные (loot-tables.ts, knowledge-discoveries.ts)** — таблицы дропа и знания
3. **Интеграция (loot-integration.ts)** — применяет loot к игроку
4. **Типы (expedition-loot.types.ts)** — все TypeScript типы

### Поток данных

```
Событие экспедиции (ExpeditionEvent)
    ↓
Проверка типа события
    ↓ (treasure/discovery)
Контекст генерации (LootGenerationContext)
    ├─ Характеристики искателя
    ├─ Параметры экспедиции
    └─ Время/погода
    ↓
Выбор типа loot (resources/materials/recipes/knowledge)
    ↓
Выбор редкости (с учётом удачи, типа события, traits)
    ↓
Генерация loot из таблиц дропа
    ↓
Применение к игроку (через Zustand store)
```

### Комбинированный подход для редкости

Редкость loot определяется по формуле:

```
Базовая редкость (от сложности)
  + Модификатор удачи искателя
  + Модификатор типа события
  + Модификатор traits
  = Итоговая редкость
```

Пример:
- Сложность: Normal (40% common, 40% rare, 20% epic)
- Удача: 40 (+6% к редким)
- Тип события: treasure (+5% к редким)
- Traits: lucky_star (+5% к редким)

Итого: 29% common, 40% rare, 26% epic, 5% legendary

---

## Конфигурация

### Базовая конфигурация

Находится в `types/expedition-loot.types.ts`:

```typescript
export const DEFAULT_LOOT_CONFIG = {
  // Шанс выпадения loot при событиях
  baseLootChance: {
    treasure: 80,   // 80% при treasure
    discovery: 60,   // 60% при discovery
  },
  
  // Максимальное количество loot за событие
  maxLootPerEvent: 3,
  
  // Шанс множественного loot
  multipleLootChance: 20, // 20% шанс 2+ loot
  
  // Веса типов loot
  typeWeights: {
    resources: 40,
    materials: 30,
    knowledge: 20,
    recipes: 10,
  },
  
  // Модификаторы редкости
  rarityModifiers: {
    luckPerPoint: 0.4,      // 0.4% за единицу удачи
    treasureBonus: 5,        // +5% к rare при treasure
    discoveryBonus: 3,        // +3% к rare при discovery
    luckyStarBonus: 5,       // +5% от lucky_star trait
    keenEyeBonus: 3,         // +3% от keen_eye trait
  },
}
```

### Настройка таблиц дропа

Таблицы дропа находятся в `data/loot-tables.ts`:

```typescript
export const FOREST_LOOT_TABLE: LootTable = {
  location: 'forest',
  maxLootPerEvent: 3,
  multipleLootChance: 25,
  
  resources: [
    {
      resourceId: 'wood',
      baseAmount: 10,
      variance: 5,
      name: 'Древесина',
      icon: '🪵',
    },
    // ... больше ресурсов
  ],
  
  materials: [
    {
      materialId: 'oak',
      chance: 40,
      minRarity: 'common',
      maxRarity: 'common',
      conditions: {},
    },
    {
      materialId: 'ironwood',
      chance: 12,
      minRarity: 'rare',
      maxRarity: 'rare',
      conditions: {
        timeOfDay: 'night', // Только ночью
      },
    },
    // ... больше материалов
  ],
}
```

---

## Примеры использования

### Пример 1: Базовое использование

```typescript
import { generateLootFromEvent, createMockContext, createMockEvent } from './lib/loot-generator'

const event = createMockEvent('treasure')
const context = createMockContext({
  expedition: {
    difficulty: 'normal',
    location: 'forest',
    duration: 600,
  },
  adventurer: {
    level: 15,
    luck: 25,
    traits: [],
  },
})

const loot = generateLootFromEvent(event, context)
console.log('Loot:', loot)
```

### Пример 2: Ночная экспедиция

```typescript
const nightContext = createMockContext({
  timeOfDay: 'night',
  expedition: { location: 'forest', ... },
})

// Может выпасть ironwood (только ночью)
const loot = generateLootFromEvent(event, nightContext)
```

### Пример 3: Искатель с высоким luck

```typescript
const highLuckContext = createMockContext({
  adventurer: {
    level: 20,
    luck: 50, // Очень высокая удача
    traits: ['lucky_star'],
  },
})

// Больше шансов на rare/epic loot
const loot = generateLootFromEvent(event, highLuckContext)
```

### Пример 4: Статистика генерации

```typescript
import { generateLootWithStats } from './lib/loot-generator'

const result = generateLootWithStats(event, context)

console.log('Всего loot:', result.totalCount)
console.log('По типам:', result.stats)
console.log('По редкости:', result.rarityStats)
```

---

## Документация

### Основные файлы документации

1. **expedition_loot_system_specification.md** — полная спецификация системы
   - Архитектура
   - Типы и интерфейсы
   - Логика генерации
   - Примеры использования
   - Тестирование

2. **INTEGRATION_GUIDE.md** — пошаговый гайд по интеграции
   - Копирование файлов
   - Обновление типов
   - Интеграция с Zustand store
   - Создание UI компонентов
   - Тестирование
   - Балансировка

3. **README_LOOT_SYSTEM.md** — этот файл (обзор для разработчиков)

### Дополнительная документация

- `types/expedition-loot.types.ts` — комментарии во всех типах
- `examples/loot-usage.ts` — 10 подробных примеров
- `data/loot-tables.ts` — комментарии к таблицам дропа
- `data/knowledge-discoveries.ts` — комментарии к знаниям

---

## Интеграция в основной проект

Подробная инструкция находится в `INTEGRATION_GUIDE.md`.

Краткий обзор:

1. **Копировать файлы** — перенести все файлы в проект
2. **Обновить типы** — интегрировать с существующими типами
3. **Обновить генератор наград** — подключить к expedition-reward-generator
4. **Создать loot slice** — добавить в Zustand store
5. **Интегрировать с экспедициями** — применять loot при завершении
6. **Создать UI** — отображать найденный loot
7. **Протестировать** — unit и интеграционные тесты

---

## Балансировка

### Настройка вероятностей

**Файл:** `data/loot-tables.ts`

- Измените `chance` в таблицах дропа
- Измените `baseAmount` и `variance` для ресурсов
- Добавьте новые материалы или ресурсы

### Настройка редкости

**Файл:** `lib/loot-generator.ts`

- Измените `BASE_RARITY_DISTRIBUTION`
- Измените `DEFAULT_LOOT_CONFIG.rarityModifiers`

### Настройка типов loot

**Файл:** `lib/loot-generator.ts`

- Измените `DEFAULT_LOOT_CONFIG.typeWeights`

---

## Расширение системы

### Добавление нового типа loot

1. Добавить тип в `LootType` в `types/expedition-loot.types.ts`
2. Создать провайдер в `loot-generator.ts`
3. Добавить данные в `loot-tables.ts`
4. Обновить веса в `DEFAULT_LOOT_CONFIG.typeWeights`

### Добавление новой локации

1. Добавить локацию в `LocationTag`
2. Создать таблицу дропа в `loot-tables.ts`
3. Добавить материалы/ресурсы в таблицу
4. Добавить знания в `knowledge-discoveries.ts`

### Добавление новых знаний

1. Создать знание в `knowledge-discoveries.ts`
2. Добавить в таблицу дропа для локаций
3. Реализовать бонусы в loot-integration.ts

---

## Поиск и устранение проблем

### Loot не генерируется

**Возможные причины:**
- Неверный тип события (не treasure/discovery)
- Отсутствует таблица дропа для локации
- Не выполняются условия в таблицах дропа

**Решение:**
- Проверьте тип события
- Проверьте наличие таблицы дропа
- Добавьте логирование для отладки

### Loot не применяется

**Возможные причины:**
- Не реализован метод в slice
- Ошибка в типах
- Проблема с путями импортов

**Решение:**
- Проверьте реализацию `applyLootDrops`
- Проверьте типы
- Проверьте импорты

### UI не отображает loot

**Возможные причины:**
- Не передан `lootDrops` в компонент
- Ошибка в компоненте
- Проблема со стилями

**Решение:**
- Проверьте пропсы в компоненте
- Проверьте консоль на ошибки
- Проверьте Tailwind классы

---

## Поддержка

### Где искать помощь

1. **Документация** — `expedition_loot_system_specification.md`
2. **Примеры** — `examples/loot-usage.ts`
3. **Интеграция** — `INTEGRATION_GUIDE.md`
4. **Типы** — `types/expedition-loot.types.ts`

### Логирование

Для отладки включите логирование:

```typescript
// В loot-generator.ts
console.log('[Loot] Generating loot for event:', event.id)
console.log('[Loot] Context:', context)
console.log('[Loot] Generated:', lootDrops.length, 'drops')
```

---

## Контрольный список перед использованием

- [ ] Все файлы системы скопированы
- [ ] Типы импортированы корректно
- [ ] Генератор loot подключен к событиям
- [ ] Zustand store интегрирован
- [ ] UI компонент создан
- [ ] Примеры запущены успешно
- [ ] Баланс настроен
- [ ] Документация прочитана

---

## Лицензия

Часть проекта SwordCraft. Используется в соответствии с лицензией проекта.

---

## Версия

Версия: 1.0.0  
Дата: 2026-03-28  
Статус: Ready for integration

---

**Удачи с интеграцией!** 🎉
