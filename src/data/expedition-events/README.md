# Руководство по добавлению событий экспедиций

Этот каталог содержит модульный пул событий для системы экспедиций.

## Структура

```
src/data/expedition-events/
├── index.ts          # Точка входа, объединяет все пулы
├── core.ts           # Универсальные события
├── locations.ts      # Локационные события
├── enemies.ts        # События по врагам
├── social.ts         # Социальные события
├── discovery.ts      # События находок
└── README.md         # Этот файл
```

## Как добавить новое событие

### 1. Выберите категорию

Определите, к какой категории относится ваше событие:

- **`core.ts`** — универсальные события (отдых, путь, погода)
- **`locations.ts`** — привязано к конкретной локации (лес, пещера)
- **`enemies.ts`** — связано с типом врага (гоблины, драконы)
- **`social.ts`** — встречи с NPC, торговля
- **`discovery.ts`** — находки, сокровища, тайны

### 2. Добавьте событие в массив

Найдите соответствующий массив (например, `FOREST_EVENTS` для леса) или создайте новый.

```typescript
{
  id: 'уникальный_идентификатор',
  text: 'Текст события, который увидит игрок',
  type: 'combat',  // Тип: combat | discovery | social | travel | danger | rest | mystery | weather | treasure
  icon: '⚔️',      // Emoji или Lucide icon name
  conditions: {
    // Условия появления (все опциональны)
    locations: ['forest', 'road'],  // Локации
    enemies: ['goblins'],           // Враги
    weather: ['rain', 'storm'],     // Погода
    special: ['boss', 'trap'],      // Особые тэги
    themes: ['combat_heavy'],       // Темы
    minDuration: 300,               // Мин. длительность экспедиции (сек)
    maxDuration: 600,               // Макс. длительность экспедиции (сек)
  },
  weight: 3,  // Вес (1-10, по умолчанию 3) — чем выше, тем чаще появляется
  flags: {
    bossOnly: false,       // Только для экспедиций с боссом
    nightOnly: false,      // Только ночью
    weatherSpecific: false,// Зависит от погоды
  }
}
```

### 3. Обновите экспорт (при необходимости)

Если создали новый массив, добавьте его в соответствующий объединённый массив в конце файла.

### 4. Проверьте типизацию

```bash
npx tsc --noEmit
```

## Доступные тэги

### Локации
`forest` | `cave` | `ruins` | `desert` | `mountain` | `swamp` | `village` | `road` | `dungeon` | `tavern` | `castle` | `temple` | `coast`

### Враги
`goblins` | `wolves` | `undead` | `bandits` | `demons` | `beasts` | `rats` | `trolls` | `dragons` | `cultists` | `spiders` | `skeletons`

### Погода
`clear` | `rain` | `storm` | `fog` | `night` | `snow` | `heat` | `wind`

### Особые
`boss` | `treasure` | `trap` | `puzzle` | `escort` | `ambush` | `rescue` | `siege` | `investigation` | `ritual` | `negotiation`

### Темы
`wilderness` | `urban` | `underground` | `combat_heavy` | `stealth` | `social` | `exploration` | `horror` | `mystery` | `adventure` | `survival`

## Примеры

### Простое событие для леса
```typescript
{
  id: 'forest_find_mushrooms',
  text: 'Найдены ценные грибы',
  type: 'discovery',
  icon: '🍄',
  conditions: {
    locations: ['forest'],
  },
  weight: 3,
}
```

### Сложное событие с боссом
```typescript
{
  id: 'dragon_boss_approach',
  text: 'Громыхание крыльев сотрясает горы!',
  type: 'combat',
  icon: '🐉',
  conditions: {
    enemies: ['dragons'],
    special: ['boss'],
  },
  weight: 5,
  flags: { bossOnly: true },
}
```

### Погодное событие
```typescript
{
  id: 'weather_sandstorm',
  text: 'Песчаная буря заметает следы',
  type: 'weather',
  icon: '🌪️',
  conditions: {
    locations: ['desert'],
    weather: ['storm', 'wind'],
  },
  weight: 4,
}
```

## Генерация событий

События выбираются автоматически при старте экспедиции на основе:

1. **Тэгов экспедиции** — локации, враги, темы
2. **Веса событий** — взвешенный случайный выбор
3. **Длительности экспедиции** — количество событий зависит от времени
4. **Флагов** — особые условия (босс, ночь и т.д.)

## Текущая статистика

Запустите следующий код в консоли браузера или в коде:

```typescript
import { getEventPoolStats } from '@/data/expedition-events'
console.log(getEventPoolStats())
```

## Контрибьюция

При добавлении событий:

1. Сохраняйте единый стиль текста
2. Используйте разнообразие emoji
3. Учитывайте сложность экспедиций
4. Тестируйте в игре
5. Не забывайте про weight (не все события должны быть равновероятны)
