# Гайд по интеграции системы Loot

## Обзор

Этот гайд содержит пошаговую инструкцию по интеграции системы случайных находок (Loot System) в основной проект SwordCraft.

---

## Предварительные требования

Перед интеграцией убедитесь, что:

1. ✅ Все файлы системы loot скопированы в проект:
   - `types/expedition-loot.types.ts`
   - `data/loot-tables.ts`
   - `data/knowledge-discoveries.ts`
   - `lib/loot-generator.ts`
   - `lib/loot-integration.ts`
   - `examples/loot-usage.ts` (опционально)

2. ✅ Вы знакомы с архитектурой проекта:
   - Zustand store (Composed Store Pattern)
   - Система экспедиций
   - Система событий экспедиций
   - Система ресурсов и материалов

---

## Шаг 1: Копирование файлов в проект

### 1.1. Копировать типы

**Откуда:** `types/expedition-loot.types.ts`
**Куда:** `src/types/expedition-loot.types.ts`

```bash
cp types/expedition-loot.types.ts src/types/
```

### 1.2. Копировать данные

```bash
cp data/loot-tables.ts src/data/
cp data/knowledge-discoveries.ts src/data/
```

### 1.3. Копировать генератор

```bash
cp lib/loot-generator.ts src/lib/
cp lib/loot-integration.ts src/lib/
```

---

## Шаг 2: Обновление типов экспедиций

### 2.1. Расширить типы событий

Откройте `src/types/expedition-events.ts` и добавьте импорт новых типов:

```typescript
import type {
  LootDrop,
  LootGenerationContext,
  LootGenerationResult,
} from './expedition-loot.types'
```

### 2.2. Расширить интерфейс ExpeditionEvent

Добавьте поле для loot в интерфейс `ExpeditionEvent`:

```typescript
export interface ExpeditionEvent extends ExpeditionEventTemplate {
  instanceId: string
  triggeredAt: number
  shownAt?: number
  order: number
  rewards?: EventReward[]
  rewardTriggered?: boolean
  
  // НОВОЕ: loot drops
  lootDrops?: LootDrop[]
  lootApplied?: boolean
}
```

---

## Шаг 3: Интеграция с expedition-reward-generator

### 3.1. Обновить expedition-reward-generator.ts

Откройте `src/lib/expedition-reward-generator.ts` и добавьте:

```typescript
// Импортировать генератор loot
import { 
  generateLootFromEvent,
  generateLootWithStats,
  createMockContext,
} from './loot-generator'

import type {
  LootDrop,
  LootGenerationContext,
} from '../types/expedition-loot.types'
```

### 3.2. Обновить функцию generateRandomRewards

Замените заглушку на реальную генерацию loot:

```typescript
export function generateRandomRewards(
  event: ExpeditionEvent,
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate
): EventReward[] {
  // Проверяем, нужно ли генерировать loot
  if (event.type !== 'treasure' && event.type !== 'discovery') {
    return []
  }

  // Строим контекст генерации
  const context: LootGenerationContext = {
    adventurer: {
      level: adventurer.combat.level,
      luck: adventurer.combat.luck,
      traits: adventurer.traits.map(t => t.id),
      precision: adventurer.combat.precision,
      power: adventurer.combat.power,
    },
    expedition: {
      difficulty: expedition.difficulty,
      location: expedition.tags?.locations?.[0] || 'forest',
      duration: expedition.duration,
      tags: expedition.tags ? Object.values(expedition.tags).flat() : [],
    },
    timeOfDay: 'day', // TODO: получить из контекста экспедиции
    weather: 'clear', // TODO: получить из контекста экспедиции
    event: event,
  }

  // Генерируем loot
  const lootDrops = generateLootFromEvent(event, context)

  // Сохраняем loot drops в событии (для будущего применения)
  event.lootDrops = lootDrops

  // Преобразуем loot drops в EventReward для обратной совместимости
  const rewards: EventReward[] = lootDrops.map(drop => {
    switch (drop.type) {
      case 'resources':
        const resourceItem = drop.item as any
        return {
          type: 'gold', // TODO: использовать правильный тип
          amount: drop.amount || resourceItem.baseAmount,
          rarity: drop.rarity,
          name: resourceItem.name,
          description: `${drop.amount || resourceItem.baseAmount} ${resourceItem.name}`,
        }
      case 'materials':
        const materialItem = drop.item as any
        return {
          type: 'item',
          itemId: materialItem.id,
          rarity: drop.rarity,
          name: materialItem.name,
          description: materialItem.description,
        }
      case 'recipes':
        const recipeItem = drop.item as any
        return {
          type: 'item',
          itemId: recipeItem.id,
          rarity: drop.rarity,
          name: recipeItem.name,
          description: recipeItem.description,
        }
      case 'knowledge':
        const knowledgeItem = drop.item as any
        return {
          type: 'gold', // Временно, пока не реализовано знания
          amount: knowledgeItem.level ? knowledgeItem.level * 20 : 20,
          rarity: drop.rarity,
          name: knowledgeItem.name,
          description: knowledgeItem.description,
        }
      default:
        return {
          type: 'gold',
          amount: 10,
          rarity: 'common',
          name: 'Золото',
          description: '10 золотых монет',
        }
    }
  })

  return rewards
}
```

---

## Шаг 4: Создание loot slice в Zustand store

### 4.1. Создать файл loot-slice.ts

Создайте `src/store/slices/loot-slice.ts`:

```typescript
/**
 * Slice для управления loot
 */

import type { StateCreator } from 'zustand'
import type {
  LootDrop,
  LootGenerationResult,
  LootGenerationStats,
} from '../../types/expedition-loot.types'

export interface LootSlice {
  // State
  lootHistory: LootDrop[]
  lootStats: LootGenerationStats
  
  // Actions
  addLootDrops: (drops: LootDrop[]) => void
  applyLootDrops: (drops: LootDrop[]) => void
  clearLootHistory: () => void
  addLootStat: (category: string, key: string, value: number) => void
}

export const createLootSlice: StateCreator<LootSlice> = (set, get) => ({
  // State
  lootHistory: [],
  lootStats: {
    totalGenerated: 0,
    byType: {
      resources: 0,
      materials: 0,
      recipes: 0,
      knowledge: 0,
    },
    byRarity: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    },
    byLocation: {},
    avgLootPerEvent: 0,
  },
  
  // Actions
  addLootDrops: (drops: LootDrop[]) => {
    set((state) => ({
      lootHistory: [...state.lootHistory, ...drops],
    }))
  },
  
  applyLootDrops: (drops: LootDrop[]) => {
    const { resourcesSlice, encyclopediaSlice } = get()
    
    drops.forEach(drop => {
      switch (drop.type) {
        case 'resources':
          const resourceItem = drop.item as any
          // Добавляем ресурсы
          resourcesSlice.addResource(
            resourceItem.resourceId,
            drop.amount || resourceItem.baseAmount
          )
          break
          
        case 'materials':
          const materialItem = drop.item as any
          // Добавляем материал в энциклопедию
          encyclopediaSlice.addMaterialEntry({
            id: materialItem.id,
            discoveredAt: Date.now(),
          })
          break
          
        case 'recipes':
          const recipeItem = drop.item as any
          // Разблокируем рецепт (TODO: реализовать)
          console.log('TODO: Unlock recipe', recipeItem.id)
          break
          
        case 'knowledge':
          const knowledgeItem = drop.item as any
          // Добавляем знание (TODO: реализовать)
          console.log('TODO: Add knowledge', knowledgeItem.id)
          break
      }
    })
  },
  
  clearLootHistory: () => {
    set({ lootHistory: [] })
  },
  
  addLootStat: (category, key, value) => {
    set((state) => {
      const stats = { ...state.lootStats }
      
      if (category === 'type' && stats.byType[key] !== undefined) {
        stats.byType[key] += value
      } else if (category === 'rarity' && stats.byRarity[key] !== undefined) {
        stats.byRarity[key] += value
      } else if (category === 'location') {
        stats.byLocation[key] = (stats.byLocation[key] || 0) + value
      } else if (category === 'total') {
        stats.totalGenerated += value
      }
      
      // Пересчитываем среднее
      stats.avgLootPerEvent = stats.totalGenerated > 0 
        ? stats.totalGenerated / Math.max(1, Object.keys(stats.byLocation).length)
        : 0
      
      return { lootStats: stats }
    })
  },
})
```

### 4.2. Интегрировать slice в game-store-composed.ts

Откройте `src/store/game-store-composed.ts` и добавьте:

```typescript
import { createLootSlice, type LootSlice } from './slices/loot-slice'

// Добавьте типы
export type GameStore = PlayerSlice 
  & ResourcesSlice 
  & WorkersSlice 
  & CraftSlice 
  & CraftV2Slice 
  & OrdersSlice 
  & GuildSlice 
  & EnchantmentSlice 
  & EncyclopediaSlice 
  & TutorialSlice
  & LootSlice  // НОВОЕ

// Компонуем слайсы
const useGameStore = create<GameStore>()(
  compose(
    persist(
      name: 'swordcraft-store-v3',
      version: 1,
      partialize: (state) => ({ ...state }),
    )
  )
)(
  playerSlice,
  resourcesSlice,
  workersSlice,
  craftSlice,
  craftV2Slice,
  ordersSlice,
  guildSlice,
  enchantmentSlice,
  encyclopediaSlice,
  tutorialSlice,
  createLootSlice,  // НОВОЕ
)
```

---

## Шаг 5: Интеграция с системой экспедиций

### 5.1. Обновить процесс завершения экспедиции

В файле `src/lib/store-utils/expedition-utils.ts` или аналогичном, добавьте применение loot:

```typescript
import { useGameStore } from '@/store'

export function completeExpeditionWithLoot(
  expeditionId: string,
  result: ExpeditionResult
) {
  const store = useGameStore.getState()

  // Применяем результаты экспедиции
  store.completeExpedition(expeditionId, result)
  
  // Применяем loot drops
  if (result.events) {
    result.events.forEach(event => {
      if (event.lootDrops && event.lootDrops.length > 0) {
        // Добавляем в историю
        store.addLootDrops(event.lootDrops)
        
        // Применяем к игроку
        store.applyLootDrops(event.lootDrops)
        
        // Обновляем статистику
        event.lootDrops.forEach(drop => {
          store.addLootStat('type', drop.type, 1)
          store.addLootStat('rarity', drop.rarity, 1)
          if (drop.source?.location) {
            store.addLootStat('location', drop.source.location, 1)
          }
        })
      }
    })
  }
}
```

---

## Шаг 6: UI для отображения loot

### 6.1. Создать компонент для loot

Создайте `src/components/expeditions/LootDisplay.tsx`:

```typescript
import type { LootDrop } from '@/types/expedition-loot.types'

interface LootDisplayProps {
  lootDrops: LootDrop[]
}

export function LootDisplay({ lootDrops }: LootDisplayProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-stone-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-amber-400'
      default: return 'text-stone-400'
    }
  }

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-stone-900/30'
      case 'rare': return 'bg-blue-900/30'
      case 'epic': return 'bg-purple-900/30'
      case 'legendary': return 'bg-amber-900/30'
      default: return 'bg-stone-900/30'
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold">Найденные предметы</h3>
      
      {lootDrops.map((drop, index) => (
        <div
          key={drop.id || index}
          className={`
            p-3 rounded-lg border
            ${getRarityBgColor(drop.rarity)}
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {drop.item.icon || '🎁'}
            </span>
            
            <div className="flex-1">
              <div className="font-semibold">
                {drop.item.name}
              </div>
              
              <div className="text-sm text-gray-400">
                {drop.item.description}
              </div>
              
              {drop.amount && drop.amount > 1 && (
                <div className="text-sm text-blue-400">
                  ×{drop.amount}
                </div>
              )}
            </div>
            
            <div className={`text-sm font-semibold ${getRarityColor(drop.rarity)}`}>
              {drop.rarity.toUpperCase()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 6.2. Интегрировать в ExpeditionResult

Добавьте компонент loot в экран результатов экспедиции.

---

## Шаг 7: Тестирование

### 7.1. Запустить примеры

```bash
# Из корня проекта
npx ts-node examples/loot-usage.ts
```

### 7.2. Unit тесты

Создайте тесты для генератора loot:

```typescript
// src/lib/__tests__/loot-generator.test.ts
import { generateLootFromEvent, createMockContext, createMockEvent } from '../loot-generator'

describe('Loot Generator', () => {
  test('генерирует loot для treasure событий', () => {
    const event = createMockEvent('treasure')
    const context = createMockContext()
    const loot = generateLootFromEvent(event, context)
    
    expect(loot.length).toBeGreaterThan(0)
  })
  
  test('не генерирует loot для travel событий', () => {
    const event = createMockEvent('travel')
    const context = createMockContext()
    const loot = generateLootFromEvent(event, context)
    
    expect(loot.length).toBe(0)
  })
  
  test('учитывает удачу искателя', () => {
    // ... тесты
  })
})
```

### 7.3. Интеграционные тесты

Протестируйте полную цепочку:

1. Запустите экспедицию
2. Проиграйте её до события treasure/discovery
3. Проверьте, что loot был сгенерирован
4. Проверьте, что loot был применён к игроку
5. Проверьте UI отображения loot

---

## Шаг 8: Балансировка

### 8.1. Настроить вероятности

Отредактируйте `data/loot-tables.ts` для настройки баланса:

- Измените `chance` в `MaterialDropChance`
- Измените `baseAmount` и `variance` в `ResourceLoot`
- Добавьте новые материалы или ресурсы

### 8.2. Настроить модификаторы редкости

Отредактируйте `lib/loot-generator.ts`:

- Измените `DEFAULT_LOOT_CONFIG.rarityModifiers`
- Настройте `BASE_RARITY_DISTRIBUTION`

### 8.3. Настроить веса типов loot

Отредактируйте `lib/loot-generator.ts`:

- Измените `DEFAULT_LOOT_CONFIG.typeWeights`

---

## Шаг 9: Мониторинг и логирование

### 9.1. Добавить логирование

Добавьте логирование для отладки:

```typescript
// В generateLootFromEvent
console.log('[Loot] Generating loot for event:', event.id, 'type:', event.type)
console.log('[Loot] Context:', context)
console.log('[Loot] Generated:', lootDrops.length, 'drops')
```

### 9.2. Метрики

Собирайте метрики для баланса:

- Среднее количество loot на экспедицию
- Распределение по типам loot
- Распределение по редкости
- Популярные локации для loot

---

## Шаг 10: Документирование

Обновите документацию проекта:

1. Добавьте раздел в `docs/systems/EXPEDITION_SYSTEM.md` про loot
2. Обновите `docs/README.md` с новой системой
3. Создайте `docs/LOOT_SYSTEM.md` с подробным описанием

---

## Поиск и устранение проблем

### Проблема: Loot не генерируется

**Возможные причины:**
- Неверный тип события
- Отсутствует таблица дропа для локации
- Проверьте условия в таблицах дропа

**Решение:**
- Проверьте, что тип события — `treasure` или `discovery`
- Проверьте наличие таблицы дропа для локации
- Добавьте логирование для отладки

### Проблема: Loot не применяется

**Возможные причины:**
- Не реализован метод в slice
- Ошибка в типах
- Проблема с путями импортов

**Решение:**
- Проверьте реализацию `applyLootDrops` в loot-slice
- Проверьте типы в `types/expedition-loot.types.ts`
- Проверьте импорты

### Проблема: UI не отображает loot

**Возможные причины:**
- Не передан `lootDrops` в компонент
- Ошибка в компоненте
- Проблема со стилями

**Решение:**
- Проверьте пропсы в компоненте `LootDisplay`
- Проверьте консоль на ошибки
- Проверьте Tailwind классы

---

## Контрольный список интеграции

Проверьте все пункты перед завершением:

- [ ] Все файлы скопированы в проект
- [ ] Типы экспедиций обновлены
- [ ] `expedition-reward-generator` обновлён
- [ ] `loot-slice` создан
- [ ] `game-store-composed` обновлён
- [ ] Экспедиции интегрированы
- [ ] UI компонент создан
- [ ] Примеры запущены успешно
- [ ] Unit тесты написаны и пройдены
- [ ] Интеграционные тесты пройдены
- [ ] Баланс настроен
- [ ] Логирование добавлено
- [ ] Документация обновлена

---

## Следующие шаги

После успешной интеграции можно:

1. Добавить новые типы loot (например, баффы, дебаффы)
2. Добавить босс-специфичный loot
3. Реализовать систему наборов (set bonus)
4. Добавить торговлю loot между игроками
5. Создать достижения для сбора loot

---

## Поддержка

Если возникнут вопросы или проблемы:

1. Проверьте `expedition_loot_system_specification.md` для понимания архитектуры
2. Запустите `examples/loot-usage.ts` для примеров
3. Проверьте `types/expedition-loot.types.ts` для типов
4. Обратитесь к команде проекта для помощи

---

Удачи с интеграцией! 🎉
