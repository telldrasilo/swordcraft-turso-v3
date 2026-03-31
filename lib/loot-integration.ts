/**
 * Интеграционный слой для системы loot
 * Предоставляет интерфейсы для интеграции с Zustand store
 * 
 * ПРИМЕЧАНИЕ: Это заглушки для будущего подключения.
 * Реализуйте эти методы при интеграции в основной проект.
 */

import type {
  LootDrop,
  LootGenerationContext,
  ResourceLoot,
  MaterialLoot,
  RecipeLoot,
  KnowledgeLoot,
} from '../types/expedition-loot.types'

// ================================
// ИНТЕРФЕЙСЫ ИНТЕГРАЦИИ
// ================================

/**
 * Интерфейс хранилища для интеграции
 */
export interface LootStoreIntegration {
  // Ресурсы
  addResources(resourceId: string, amount: number): void
  
  // Материалы
  addMaterial(materialId: string, amount: number): void
  hasMaterial(materialId: string): boolean
  
  // Рецепты
  unlockRecipe(recipeId: string): void
  isRecipeUnlocked(recipeId: string): boolean
  
  // Знания
  addKnowledge(knowledgeId: string): void
  hasKnowledge(knowledgeId: string): boolean
  
  // Статистика
  incrementStat(stat: string, amount: number): void
}

/**
 * Результат применения loot
 */
export interface ApplyLootResult {
  success: boolean
  applied: LootDrop[]
  failed: LootDrop[]
  errors: Array<{ drop: LootDrop; message: string }>
}

// ================================
// ЗАГЛУШКИ ХРАНИЛИЩА
// ================================

/**
 * Заглушка хранилища для автономной работы
 * При интеграции замените на реальные методы Zustand store
 */
export const LOOT_STORE_STUB: LootStoreIntegration = {
  addResources(resourceId: string, amount: number): void {
    console.log(`[STUB] Adding ${amount} of resource ${resourceId}`)
    // TODO: Реализовать при интеграции
  },
  
  addMaterial(materialId: string, amount: number): void {
    console.log(`[STUB] Adding ${amount} of material ${materialId}`)
    // TODO: Реализовать при интеграции
  },
  
  hasMaterial(materialId: string): boolean {
    console.log(`[STUB] Checking if has material ${materialId}`)
    // TODO: Реализовать при интеграции
    return false
  },
  
  unlockRecipe(recipeId: string): void {
    console.log(`[STUB] Unlocking recipe ${recipeId}`)
    // TODO: Реализовать при интеграции
  },
  
  isRecipeUnlocked(recipeId: string): boolean {
    console.log(`[STUB] Checking if recipe ${recipeId} is unlocked`)
    // TODO: Реализовать при интеграции
    return false
  },
  
  addKnowledge(knowledgeId: string): void {
    console.log(`[STUB] Adding knowledge ${knowledgeId}`)
    // TODO: Реализовать при интеграции
  },
  
  hasKnowledge(knowledgeId: string): boolean {
    console.log(`[STUB] Checking if has knowledge ${knowledgeId}`)
    // TODO: Реализовать при интеграции
    return false
  },
  
  incrementStat(stat: string, amount: number): void {
    console.log(`[STUB] Incrementing stat ${stat} by ${amount}`)
    // TODO: Реализовать при интеграции
  },
}

// ================================
// ФУНКЦИИ ИНТЕГРАЦИИ
// ================================

/**
 * Применить loot drops к хранилищу
 */
export function applyLootDrops(
  drops: LootDrop[],
  store: LootStoreIntegration = LOOT_STORE_STUB
): ApplyLootResult {
  const result: ApplyLootResult = {
    success: true,
    applied: [],
    failed: [],
    errors: [],
  }

  for (const drop of drops) {
    try {
      applySingleLootDrop(drop, store)
      result.applied.push(drop)
    } catch (error) {
      result.failed.push(drop)
      result.errors.push({
        drop,
        message: error instanceof Error ? error.message : String(error),
      })
      result.success = false
    }
  }

  return result
}

/**
 * Применить один loot drop
 */
function applySingleLootDrop(
  drop: LootDrop,
  store: LootStoreIntegration
): void {
  switch (drop.type) {
    case 'resources':
      applyResourceLoot(drop.item as ResourceLoot, drop.amount || 1, store)
      break
    case 'materials':
      applyMaterialLoot(drop.item as MaterialLoot, drop.amount || 1, store)
      break
    case 'recipes':
      applyRecipeLoot(drop.item as RecipeLoot, store)
      break
    case 'knowledge':
      applyKnowledgeLoot(drop.item as KnowledgeLoot, store)
      break
    default:
      throw new Error(`Unknown loot type: ${(drop as any).type}`)
  }
}

/**
 * Применить ресурсный loot
 */
function applyResourceLoot(
  item: ResourceLoot,
  amount: number,
  store: LootStoreIntegration
): void {
  store.addResources(item.resourceId, amount)
  store.incrementStat(`resources.${item.resourceId}`, amount)
}

/**
 * Применить материалный loot
 */
function applyMaterialLoot(
  item: MaterialLoot,
  amount: number,
  store: LootStoreIntegration
): void {
  // Проверяем, нет ли уже этого материала
  if (store.hasMaterial(item.id)) {
    // Если есть, просто увеличиваем количество
    store.addMaterial(item.id, amount)
  } else {
    // Если нет, добавляем новый материал
    store.addMaterial(item.id, amount)
    store.incrementStat('materials.new', 1)
  }
  
  store.incrementStat(`materials.${item.category}`, amount)
}

/**
 * Применить рецептовый loot
 */
function applyRecipeLoot(
  item: RecipeLoot,
  store: LootStoreIntegration
): void {
  // Проверяем, не разблокирован ли уже рецепт
  if (store.isRecipeUnlocked(item.id)) {
    // Если рецепт уже разблокирован, можно дать альтернативную награду
    // Например: золото вместо рецепта
    const goldAmount = item.tier === 'legendary' ? 100 : 
                       item.tier === 'epic' ? 50 :
                       item.tier === 'rare' ? 30 : 20
    store.addResources('gold', goldAmount)
    store.incrementStat('loot.recipe_alternative', 1)
  } else {
    // Разблокируем рецепт
    store.unlockRecipe(item.id)
    store.incrementStat('recipes.unlocked', 1)
  }
}

/**
 * Применить знание как loot
 */
function applyKnowledgeLoot(
  item: KnowledgeLoot,
  store: LootStoreIntegration
): void {
  // Проверяем, нет ли уже этого знания
  if (store.hasKnowledge(item.id)) {
    // Если есть, можно дать альтернативную награду
    const goldAmount = item.level ? item.level * 20 : 20
    store.addResources('gold', goldAmount)
    store.incrementStat('loot.knowledge_alternative', 1)
  } else {
    // Если нет, добавляем знание
    store.addKnowledge(item.id)
    store.incrementStat('knowledge.discovered', 1)
    
    // Применяем бонусы, если они есть
    if (item.bonuses) {
      Object.entries(item.bonuses).forEach(([bonus, value]) => {
        store.incrementStat(`bonuses.${bonus}`, value)
      })
    }
  }
}

// ================================
// ИНТЕГРАЦИЯ С SYSTEM EVENTS
// ================================

/**
 * Обработать событие экспедиции и применить loot
 */
export function handleExpeditionEvent(
  event: any,
  context: LootGenerationContext,
  store: LootStoreIntegration = LOOT_STORE_STUB
): ApplyLootResult {
  // Проверяем, нужно ли генерировать loot
  const eventTypesWithLoot = ['treasure', 'discovery']
  if (!eventTypesWithLoot.includes(event.type)) {
    return {
      success: true,
      applied: [],
      failed: [],
      errors: [],
    }
  }

  // Генерируем loot
  const { generateLootFromEvent } = require('./loot-generator')
  const drops = generateLootFromEvent(event, context)

  // Применяем loot
  return applyLootDrops(drops, store)
}

/**
 * Получить резюме применённого loot для UI
 */
export function getLootSummary(drops: LootDrop[]): {
  totalItems: number
  byType: Record<string, number>
  byRarity: Record<string, number>
  goldAmount: number
} {
  const summary = {
    totalItems: drops.length,
    byType: {} as Record<string, number>,
    byRarity: {} as Record<string, number>,
    goldAmount: 0,
  }

  drops.forEach(drop => {
    // По типам
    summary.byType[drop.type] = (summary.byType[drop.type] || 0) + 1

    // По редкости
    summary.byRarity[drop.rarity] = (summary.byRarity[drop.rarity] || 0) + 1

    // Подсчёт золота
    if (drop.type === 'resources') {
      const item = drop.item as ResourceLoot
      if (item.resourceId === 'gold') {
        summary.goldAmount += drop.amount || item.baseAmount
      }
    }
  })

  return summary
}

// ================================
// ИНСТРУКЦИИ ПО ИНТЕГРАЦИИ
// ================================

/**
 * ПРИМЕР ИНТЕГРАЦИИ С ZUSTAND STORE
 * 
 * 1. Создайте slice для loot в src/store/slices/loot-slice.ts:
 * 
 * ```typescript
 * const createLootSlice: StateCreator<LootSlice> = (set) => ({
 *   lootHistory: [],
 *   
 *   applyLootDrops: (drops: LootDrop[]) => {
 *     drops.forEach(drop => {
 *       switch (drop.type) {
 *         case 'resources':
 *           set((state) => ({
 *             resources: {
 *               ...state.resources,
 *               [drop.item.resourceId]: 
 *                 (state.resources[drop.item.resourceId] || 0) + drop.amount
 *             }
 *           }))
 *           break
 *         case 'materials':
 *           set((state) => ({
 *             materials: [...state.materials, drop.item]
 *           }))
 *           break
 *         // ... другие типы
 *       }
 *     })
 *   },
 * })
 * ```
 * 
 * 2. Обновите экспорт в src/store/game-store-composed.ts:
 * 
 * ```typescript
 * import { createLootSlice } from './slices/loot-slice'
 * 
 * const useGameStore = create<GameStore>()(
 *   compose(
 *     // ... middleware
 *   )
 * )(
 *   // ... другие слайсы
 *   createLootSlice,
 * )
 * ```
 * 
 * 3. Обновите экспедиции для вызова генератора loot:
 * 
 * ```typescript
 * import { generateLootFromEvent } from '@/lib/loot-generator'
 * 
 * // В функции завершения экспедиции
 * const handleEventResult = (event: ExpeditionEvent) => {
 *   const context = buildLootContext(expedition, adventurer)
 *   const loot = generateLootFromEvent(event, context)
 *   
 *   if (loot.length > 0) {
 *     useGameStore.getState().applyLootDrops(loot)
 *   }
 * }
 * ```
 */

// ================================
// ЭКСПОРТЫ
// ================================

export {
  LOOT_STORE_STUB,
  applyLootDrops,
  handleExpeditionEvent,
  getLootSummary,
}

export type {
  LootStoreIntegration,
  ApplyLootResult,
}
