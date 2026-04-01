/**
 * Composed Game Store v2
 * Слой сборки слайсов + cross-slice действия (ремонт, экспедиции, заказы и т.д.).
 * Размер файла ~1400 строк; cross-slice ремонт вынесен в `src/store/cross-slice/repair-cross-slice.ts`.
 *
 * Архитектура:
 * - Slices: Инкапсуляция бизнес-логики по доменам
 * - Composed: Координация cross-slice операций
 * - Utils: Чистые функции для расчётов
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ================================
// SLICE IMPORTS
// ================================

import { createPlayerSlice } from './slices/player-slice'
import type { PlayerSlice, Player, GameStatistics } from './slices/player-slice'
import { initialPlayer, initialStatistics } from './slices/player-slice'

import { createResourcesSlice } from './slices/resources-slice'
import type { ResourcesSlice, Resources, ResourceKey, CraftingCost } from './slices/resources-slice'
import { initialResources } from './slices/resources-slice'

import { createWorkersSlice } from './slices/workers-slice'
import type { WorkersSlice, Worker, WorkerClass, ProductionBuilding } from './slices/workers-slice'
import { initialBuildings, workerClassData } from './slices/workers-slice'

import { createCraftSlice } from './slices/craft-slice'
import type { CraftSlice, ActiveCraft, ActiveRefining, WeaponInventory, UnlockedRecipes, RecipeSource, WeaponType, WeaponTier, WeaponMaterial, QualityGrade } from './slices/craft-slice'
import type { CraftedWeaponV2, ActiveCraftV2, CraftPlan } from '@/types/craft-v2'
import { initialActiveRefining, initialWeaponInventory, initialUnlockedRecipes } from './slices/craft-slice'

import { createEncyclopediaSlice } from './slices/encyclopedia-slice'
import type { EncyclopediaSlice } from './slices/encyclopedia-slice'

// ================================
// DATA IMPORTS
// ================================

import type { RefiningRecipe } from '@/data/refining-recipes'
import { refiningRecipes } from '@/data/refining-recipes'
import {
  areEnchantmentsCompatible,
  getEnchantment,
  MAX_ENCHANTMENTS_PER_WEAPON,
} from '@/data/enchantments'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { RepairOption, RepairType, ExecuteRepairResult } from '@/data/repair-system'

// ================================
// UTILITY IMPORTS
// ================================

import { generateId } from '@/lib/store-utils/generators'
import { TIER_NUMBER_TO_STRING } from '@/lib/store-utils/constants'
import {
  calculateHireCost,
  getFireRefund,
} from '@/lib/store-utils/worker-utils'
import {
  calculateSacrificeValue as calculateSacrificeValueUtil,
} from '@/lib/store-utils/enchantment-utils'
import { buildRepairCrossSlice } from '@/store/cross-slice/repair-cross-slice'
import { buildGuildExpeditionCrossSlice } from '@/store/cross-slice/guild-expedition-cross-slice'
import { buildOrderCrossSlice } from '@/store/cross-slice/order-cross-slice'

// ================================
// ADDITIONAL TYPE IMPORTS
// ================================

import {
  initialGuildState,
  type GuildState,
  type Adventurer,
  type ActiveExpedition,
  getGuildReputationLevel,
  GUILD_LEVELS,
} from '@/types/guild'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { KnownAdventurer } from '@/types/known-adventurer'
import {
  getKnownAdventurerInfo,
  getMetInfoText,
} from '@/lib/known-adventurers-manager'
import {
  calculateExpeditionResult as calculateExpeditionResultV2,
  type ExpeditionCalculation,
} from '@/lib/expedition-calculator-v2'
import {
  generateAdventurerPool,
  ADVENTURER_LIFETIME,
} from '@/lib/adventurer-generator'
import type { ExpeditionResult } from './slices/guild-slice'

// ================================
// ДОПОЛНИТЕЛЬНЫЕ SLICE IMPORTS
// ================================

import { createOrdersSlice } from './slices/orders-slice'
import type { OrdersSlice, NPCOrder } from './slices/orders-slice'
import { initialOrdersState } from './slices/orders-slice'
import { type OrderGenerationContext } from '@/lib/store-utils/order-achievable-utils'

import type { TutorialState, TutorialActions } from './slices/tutorial-slice'
import { initialTutorialState } from './slices/tutorial-slice'

// ================================
// ОСТАВШИЕСЯ ТИПЫ (не в slices)
// ================================

export type GameScreen = 'forge' | 'resources' | 'workers' | 'shop' | 'guild' | 'dungeons' | 'altar' | 'encyclopedia'

// ================================
// CROSS-SLICE ACTIONS INTERFACE
// ================================

/**
 * Cross-slice операции требуют координации между несколькими slices
 * Эти функции остаются в composed store
 */
interface CrossSliceActions {
  // Workers + Resources
  hireWorkerWithCost: (workerClass: WorkerClass) => boolean
  fireWorkerWithRefund: (workerId: string) => void
  upgradeBuildingWithCost: (buildingId: string) => boolean

  // Craft V2 + Resources + Player
  setShouldPurchaseMaterials: (should: boolean) => void
  
  // Refining + Resources + Player
  startRefiningWithResources: (recipe: RefiningRecipe, amount: number) => boolean
  completeRefiningWithResources: () => boolean

  // Weapons + Resources + Statistics
  sellWeaponWithGold: (weaponId: string) => boolean
  addWeaponWithStats: (weapon: CraftedWeaponV2) => void
  addWeaponV2: (weapon: CraftedWeaponV2) => void

  // Enchantments + Resources + Statistics
  sacrificeWeaponForEssence: (weaponId: string) => { soulEssence: number; bonusGold: number } | null
  unlockEnchantmentWithCost: (enchantmentId: string) => boolean

  // Repair + Resources + Workers
  executeWeaponRepair: (weaponId: string, repairType: RepairType) => ExecuteRepairResult
  repairWeaponWithResources: (weaponId: string) => { success: boolean; cost: number; repairedAmount: number }

  // Guild + Resources + Craft + Player
  startExpeditionFull: (expedition: ExpeditionTemplate, adventurer: Adventurer, weapon: CraftedWeaponV2, extendedAdventurer?: AdventurerExtended) => boolean
  completeExpeditionFull: (expeditionId: string) => ExpeditionResult | null

  // Emergency
  canGetEmergencyHelp: () => boolean
  getEmergencyHelp: () => boolean

  // Orders
  generateOrder: (context: OrderGenerationContext) => NPCOrder | null
  acceptOrder: (orderId: string) => boolean
  completeOrder: (orderId: string, weaponId: string) => boolean
  expireOrder: (orderId: string) => void
  getActiveOrder: () => NPCOrder | undefined

  // Tutorial
  nextTutorialStep: () => void
  skipTutorial: () => void
  completeTutorialStep: (stepId: string) => void
  isTutorialActive: () => boolean

  // Enchantments (simple)
  enchantWeapon: (weaponId: string, enchantmentId: string) => boolean
  removeEnchantment: (weaponId: string, enchantmentId: string) => boolean
  isEnchantmentUnlocked: (enchantmentId: string) => boolean
  addWarSoulToWeapon: (weaponId: string, points: number, durabilityLoss?: number, epicGain?: number) => boolean

  // Recipes
  unlockRecipe: (recipeId: string, source: 'purchase' | 'order' | 'expedition' | 'level') => boolean
  canRefine: (recipe: RefiningRecipe, amount: number) => boolean

  // Guild helpers
  refreshAdventurers: () => void
  initializeAdventurers: () => void
  cancelExpedition: (expeditionId: string) => boolean
  startRecoveryQuest: (questId: string) => boolean
  completeRecoveryQuest: (questId: string) => boolean
  declineRecoveryQuest: (questId: string) => void
  addGlory: (amount: number) => void
  addReputation: (amount: number) => void
  getAdventurerById: (id: string) => Adventurer | undefined
  getActiveExpeditionById: (id: string) => ActiveExpedition | undefined
  isWeaponInExpedition: (weaponId: string) => boolean

  // Known Adventurers
  getKnownAdventurer: (adventurerId: string) => KnownAdventurer | undefined
  getMetBadge: (adventurerId: string) => { isKnown: boolean; text: string; className: string } | null
  calculateExpedition: (adventurer: AdventurerExtended, expedition: ExpeditionTemplate, weapon: CraftedWeaponV2) => ExpeditionCalculation

  // Repair helpers
  getRepairOptions: (weaponId: string) => RepairOption[]
  getBestBlacksmith: () => Worker | null
  getWeaponRepairCost: (weaponId: string) => number
  getMaxRepairPercent: (weaponId: string) => number

  // Craft helpers
  getWeaponById: (weaponId: string) => CraftedWeaponV2 | undefined
  isRecipeUnlocked: (recipeId: string) => boolean
  getRecipeSource: (recipeId: string) => RecipeSource | undefined
  setCurrentScreen: (screen: GameScreen) => void

  // Craft state checks
  isCrafting: () => boolean
  isRefining: () => boolean
  updateCraftProgress: (progress: number) => void
  updateRefiningProgress: (progress: number) => void

  // Craft V2 persistence
  setCraftV2Persisted: (data: Partial<CraftV2Persisted>) => void

  // Game state
  resetGame: () => void
}

// ================================
// ADDITIONAL STATE (не в slices)
// ================================

export interface CraftV2Persisted {
  activeCraft: ActiveCraftV2 | null
  plan: CraftPlan | null
  completedWeapon: CraftedWeaponV2 | null
  stage: 'planning' | 'crafting' | 'completed'
  preview: any | null
  weaponName: any | null
}

export const initialCraftV2Persisted: CraftV2Persisted = {
  activeCraft: null,
  plan: null,
  completedWeapon: null,
  stage: 'planning',
  preview: null,
  weaponName: null,
}

interface AdditionalState {
  currentScreen: GameScreen
  guild: GuildState
  knownAdventurers: KnownAdventurer[]
  tutorial: TutorialState
  craftV2Persisted: CraftV2Persisted
  shouldPurchaseMaterials: boolean // Добавил для галочки закупки
}

const initialAdditionalState: AdditionalState = {
  currentScreen: 'forge',
  guild: initialGuildState,
  knownAdventurers: [],
  tutorial: initialTutorialState,
  craftV2Persisted: initialCraftV2Persisted,
  shouldPurchaseMaterials: false, // Добавил для галочки закупки
}

// ================================
// FULL STORE TYPE
// ================================

/** Публичный `completeOrder` задаётся в CrossSliceActions (2 args); slice-метод с 3 args только для внутренней склейки. */
export type GameStore = PlayerSlice & ResourcesSlice & WorkersSlice & CraftSlice & Omit<OrdersSlice, 'completeOrder'> & TutorialActions & AdditionalState & CrossSliceActions & EncyclopediaSlice

// ================================
// STORE CREATION
// ================================

const STORE_VERSION = 1
const STORE_NAME = 'swordcraft-store-v2'

/** SSR / Node: нельзя трогать `localStorage` — иначе ReferenceError и пустая страница «Error». */
function getSsrSafeLocalStorage(): Storage {
  if (typeof window === 'undefined') {
    const noop = () => {}
    return {
      getItem: () => null,
      setItem: noop,
      removeItem: noop,
      clear: noop,
      key: () => null,
      length: 0,
    } as Storage
  }
  return localStorage
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const ordersSlice = createOrdersSlice(set as any, get as any, {} as any)
      return ({
      // === SLICE STATES ===
      // Player slice
      ...createPlayerSlice(set as any, get as any, {} as any),
      
      // Resources slice
      ...createResourcesSlice(set as any, get as any, {} as any),
      
      // Workers slice
      ...createWorkersSlice(set as any, get as any, {} as any),
      
      // Craft slice
      ...createCraftSlice(set as any, get as any, {} as any),

      // Orders slice
      ...ordersSlice,

      // Encyclopedia slice
      ...createEncyclopediaSlice(set as any, get as any, {} as any),

      // Tutorial actions (без state - state в AdditionalState)
      nextTutorialStep: () => set((state) => {
        const nextStep = state.tutorial.currentStep + 1
        return {
          tutorial: {
            ...state.tutorial,
            isActive: nextStep < 6, // TUTORIAL_STEPS.length
            currentStep: nextStep,
          }
        }
      }),
      
      skipTutorial: () => set((state) => ({
        tutorial: { ...state.tutorial, isActive: false, skipped: true }
      })),
      
      completeTutorialStep: (stepId) => set((state) => {
        if (state.tutorial.completedSteps.includes(stepId)) return state
        return {
          tutorial: {
            ...state.tutorial,
            completedSteps: [...state.tutorial.completedSteps, stepId],
          }
        }
      }),
      
      isTutorialActive: () => {
        const state = get()
        return state.tutorial.isActive && !state.tutorial.skipped
      },
      
      resetTutorial: () => set({ tutorial: initialTutorialState }),

      // === ADDITIONAL STATE ===
      ...initialAdditionalState,

      // === CROSS-SLICE ACTIONS ===
      // Будут реализованы в следующей части

      // Workers + Resources
      hireWorkerWithCost: (workerClass) => {
        const state = get()
        if (state.workers.length >= state.maxWorkers) return false

        const cost = calculateHireCost(
          workerClass,
          state.workers.filter(w => w.class === workerClass).length
        )

        if (!state.canAfford({ gold: cost })) return false

        // Списываем золото
        state.spendResource('gold', cost)

        // Создаём рабочего через slice action
        const hired = state.hireWorker(workerClass)

        if (hired) {
          // Обновляем статистику
          state.updateStatistics({ totalWorkersHired: state.statistics.totalWorkersHired + 1 })
        }

        return hired
      },

      fireWorkerWithRefund: (workerId) => {
        const state = get()
        const worker = state.workers.find(w => w.id === workerId)
        if (!worker) return

        // Возвращаем часть золота
        const refund = getFireRefund(worker)
        state.addResource('gold', refund)

        // Удаляем рабочего
        state.fireWorker(workerId)
      },

      upgradeBuildingWithCost: (buildingId) => {
        const state = get()
        const building = state.buildings.find(b => b.id === buildingId)
        if (!building) return false

        const cost = building.level * 100

        if (!state.canAfford({ gold: cost })) return false

        state.spendResource('gold', cost)
        return state.upgradeBuilding(buildingId)
      },

      // Refining + Resources + Player
      startRefiningWithResources: (recipe, amount) => {
        const state = get()

        if (state.activeRefining.recipeId) return false
        if (state.player.level < recipe.requiredLevel) return false

        // Проверяем и списываем ресурсы
        for (const input of recipe.inputs) {
          if (!state.canAfford({ [input.resource]: input.amount * amount })) return false
        }
        const extraCoal = (recipe.extraCost?.coal ?? 0) * amount
        if (extraCoal > 0 && !state.canAfford({ coal: extraCoal })) return false

        // Списываем
        for (const input of recipe.inputs) {
          state.spendResource(input.resource as ResourceKey, input.amount * amount)
        }
        if (extraCoal > 0) {
          state.spendResource('coal', extraCoal)
        }

        return state.startRefining(recipe, amount)
      },

      completeRefiningWithResources: () => {
        const state = get()
        if (!state.activeRefining.recipeId) return false

        // Находим рецепт
        const recipe = refiningRecipes.find(r => r.id === state.activeRefining.recipeId)
        if (!recipe) return false

        // Начисляем ресурсы
        const outputAmount = recipe.output.amount * state.activeRefining.amount
        state.addResource(recipe.output.resource as ResourceKey, outputAmount)

        // Обновляем статистику
        state.updateStatistics({ totalRefines: state.statistics.totalRefines + 1 })

        // Даём опыт
        const exp = Math.floor(state.activeRefining.amount * 5)
        state.addExperience(exp)

        // Очищаем
        return state.completeRefining()
      },

      // Weapons + Resources + Statistics
      sellWeaponWithGold: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        // Начисляем золото
        state.addResource('gold', weapon.sellPrice)

        // Удаляем оружие
        state.removeWeapon(weaponId)

        // Статистика
        state.updateStatistics({
          weaponsSold: state.statistics.weaponsSold + 1,
          totalGoldEarned: state.statistics.totalGoldEarned + weapon.sellPrice,
        })

        return true
      },

      addWeaponWithStats: (weapon) => {
        const state = get()
        state.addWeapon(weapon)
        state.updateStatistics({ totalCrafts: state.statistics.totalCrafts + 1 })
      },

      addWeaponV2: (weapon: CraftedWeaponV2) => {
        const state = get()
        
        // Проверка лимита слотов
        if (state.weaponInventory.weapons.length >= state.weaponInventory.maxSlots) {
          console.warn('Инвентарь полон')
          return
        }
        
        // Добавляем оружие
        state.addWeapon(weapon)
        
        // Обновляем статистику
        state.updateStatistics({ totalCrafts: state.statistics.totalCrafts + 1 })
      },

      // Enchantments + Resources + Statistics
      sacrificeWeaponForEssence: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return null

        const tierStr = TIER_NUMBER_TO_STRING[weapon.tier] ?? 'common'
        const result = calculateSacrificeValueUtil(
          weapon.quality,
          tierStr,
          weapon.warSoul,
          weapon.epicMultiplier
        )

        // Начисляем
        state.addResource('soulEssence', result.soulEssence)
        if (result.bonusGold > 0) {
          state.addResource('gold', result.bonusGold)
        }

        // Удаляем оружие
        state.removeWeapon(weaponId)

        // Статистика
        state.updateStatistics({ weaponsSacrificed: state.statistics.weaponsSacrificed + 1 })

        return result
      },

      unlockEnchantmentWithCost: (enchantmentId) => {
        const state = get()

        // TODO: получить данные зачарования
        // const enchantment = enchantments.find(e => e.id === enchantmentId)
        // if (!enchantment) return false

        // if (!canAffordEnchantment(enchantment, state.resources)) return false

        // Списываем ресурсы
        // ...

        return state.unlockEnchantment(enchantmentId)
      },

      ...buildRepairCrossSlice(set as never, get as never),
      ...buildGuildExpeditionCrossSlice(set as never, get as never),

      // Emergency
      canGetEmergencyHelp: () => {
        const state = get()
        return state.workers.length === 0 && state.resources.gold < 50
      },

      getEmergencyHelp: () => {
        const state = get()
        if (!state.canGetEmergencyHelp()) return false

        state.addResource('gold', 100)
        state.updateStatistics({ totalWorkersHired: state.statistics.totalWorkersHired + 1 })

        return true
      },

      // Orders slice methods are available directly from createOrdersSlice
      // No delegation needed to avoid infinite recursion
      ...buildOrderCrossSlice(set as never, get as never, ordersSlice),

      // Enchantments (simple)
      enchantWeapon: (weaponId, enchantmentId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        const enchantment = state.unlockedEnchantments.includes(enchantmentId)
        if (!enchantment) return false

        const currentCount = weapon.enchantments?.length || 0
        if (currentCount >= MAX_ENCHANTMENTS_PER_WEAPON) return false

        // Проверяем совместимость
        const newEnchData = getEnchantment(enchantmentId)
        if (!newEnchData) return false
        if (weapon.enchantments && !areEnchantmentsCompatible(weapon.enchantments, newEnchData)) {
          return false
        }

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? {
                    ...w,
                    enchantments: [
                      ...(w.enchantments || []),
                      { id: generateId(), enchantmentId, appliedAt: Date.now() }
                    ],
                  }
                : w
            ),
          },
        }))

        state.updateStatistics({ enchantmentsApplied: state.statistics.enchantmentsApplied + 1 })
        return true
      },

      removeEnchantment: (weaponId, enchantmentId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon || !weapon.enchantments) return false

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? { ...w, enchantments: w.enchantments?.filter(e => e.enchantmentId !== enchantmentId) }
                : w
            ),
          },
        }))

        return true
      },

      isEnchantmentUnlocked: (enchantmentId) => {
        return get().unlockedEnchantments.includes(enchantmentId)
      },

      addWarSoulToWeapon: (weaponId, points, durabilityLoss = 5, epicGain = 0.05) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        const newDurability = Math.max(0, weapon.currentDurability - durabilityLoss)
        const newEpicMultiplier = Math.min(5.0, weapon.epicMultiplier + epicGain)

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? {
                    ...w,
                    warSoul: Math.min(w.maxWarSoul ?? Infinity, w.warSoul + points),
                    currentDurability: newDurability,
                    epicMultiplier: newEpicMultiplier,
                    adventureCount: w.adventureCount + 1,
                  }
                : w
            ),
          },
        }))

        return true
      },

      // Recipes
      unlockRecipe: (recipeId, source) => {
        const state = get()

        // Определяем тип рецепта
        const isWeaponRecipe = recipeId.includes('sword') || recipeId.includes('dagger') ||
                              recipeId.includes('axe') || recipeId.includes('mace') ||
                              recipeId.includes('spear') || recipeId.includes('hammer')

        if (isWeaponRecipe) {
          if (state.unlockedRecipes.weaponRecipes.includes(recipeId)) return false

          set((s) => ({
            unlockedRecipes: {
              ...s.unlockedRecipes,
              weaponRecipes: [...s.unlockedRecipes.weaponRecipes, recipeId],
            },
            recipeSources: [...s.recipeSources, { recipeId, source, obtainedAt: Date.now() }],
          }))
        } else {
          if (state.unlockedRecipes.refiningRecipes.includes(recipeId)) return false

          set((s) => ({
            unlockedRecipes: {
              ...s.unlockedRecipes,
              refiningRecipes: [...s.unlockedRecipes.refiningRecipes, recipeId],
            },
            recipeSources: [...s.recipeSources, { recipeId, source, obtainedAt: Date.now() }],
          }))
        }

        state.updateStatistics({ recipesUnlocked: state.statistics.recipesUnlocked + 1 })
        return true
      },

      canRefine: (recipe, amount) => {
        const state = get()
        if (state.player.level < recipe.requiredLevel) return false

        for (const input of recipe.inputs) {
          if ((state.resources[input.resource as ResourceKey] || 0) < input.amount * amount) {
            return false
          }
        }
        const coalNeed = (recipe.extraCost?.coal ?? 0) * amount
        if (coalNeed > 0 && state.resources.coal < coalNeed) {
          return false
        }

        return true
      },

      // Guild helpers
      refreshAdventurers: () => {
        const state = get()
        const pool = generateAdventurerPool(state.guild.level)

        set((s) => ({
          guild: {
            ...s.guild,
            adventurers: pool,
            adventurerRefreshAt: Date.now() + ADVENTURER_LIFETIME,
          },
        }))
      },

      initializeAdventurers: () => {
        const state = get()
        if (state.guild.adventurers.length === 0) {
          state.refreshAdventurers()
        }
      },

      cancelExpedition: (expeditionId) => {
        const state = get()
        const expedition = state.guild.activeExpeditions.find(e => e.id === expeditionId)
        if (!expedition) return false

        // Возвращаем часть затрат (используем suppliesCost вместо cost.supplies)
        const refund = Math.floor(expedition.suppliesCost * 0.5)
        state.addResource('gold', refund)

        set((s) => ({
          guild: {
            ...s.guild,
            activeExpeditions: s.guild.activeExpeditions.filter(e => e.id !== expeditionId),
          },
        }))

        return true
      },

      startRecoveryQuest: (questId) => {
        const state = get()
        const quest = state.guild.recoveryQuests.find(q => q.id === questId)
        if (!quest || quest.status !== 'available') return false

        if (!state.canAfford({ gold: quest.cost })) return false

        state.spendResource('gold', quest.cost)

        const startedAt = Date.now()
        const endsAt = startedAt + quest.duration * 1000

        set((s) => ({
          guild: {
            ...s.guild,
            recoveryQuests: s.guild.recoveryQuests.map(q =>
              q.id === questId ? { ...q, status: 'active', startedAt, endsAt } : q
            ),
          },
        }))

        return true
      },

      completeRecoveryQuest: (questId) => {
        const state = get()
        const quest = state.guild.recoveryQuests.find(q => q.id === questId)
        if (!quest || quest.status !== 'active') return false

        // Возвращаем оружие (добавляем как CraftedWeaponV2)
        if (quest.lostWeaponData) {
          state.addWeaponV2(quest.lostWeaponData)
        }

        set((s) => ({
          guild: {
            ...s.guild,
            recoveryQuests: s.guild.recoveryQuests.filter(q => q.id !== questId),
          },
        }))

        return true
      },

      declineRecoveryQuest: (questId) => {
        set((s) => ({
          guild: {
            ...s.guild,
            recoveryQuests: s.guild.recoveryQuests.filter(q => q.id !== questId),
          },
        }))
      },

      addGlory: (amount) => {
        set((s) => ({
          guild: {
            ...s.guild,
            glory: s.guild.glory + amount,
          },
        }))
      },

      addReputation: (amount) => {
        set((s) => {
          const newReputation = s.guild.reputation + amount
          const newTotalReputation = s.guild.totalReputation + amount

          // Рассчитываем новый уровень гильдии на основе репутации
          const newLevel = getGuildReputationLevel(newReputation)
          const oldLevel = s.guild.level

          // Если уровень вырос, обновляем maxKnownAdventurers
          let newMaxKnownAdventurers = s.guild.maxKnownAdventurers
          if (newLevel > oldLevel) {
            const levelData = GUILD_LEVELS.find(l => l.level === newLevel)
            if (levelData) {
              newMaxKnownAdventurers = levelData.maxKnownAdventurers
            }
          }

          return {
            guild: {
              ...s.guild,
              reputation: newReputation,
              totalReputation: newTotalReputation,
              level: newLevel,
              maxKnownAdventurers: newMaxKnownAdventurers,
            },
          }
        })
      },

      getAdventurerById: (id) => get().guild.adventurers.find(a => a.id === id),
      getActiveExpeditionById: (id) => get().guild.activeExpeditions.find(e => e.id === id),

      isWeaponInExpedition: (weaponId) => {
        return get().guild.activeExpeditions.some(e => e.weaponId === weaponId)
      },

      // Known Adventurers
      getKnownAdventurer: (adventurerId) => {
        return get().knownAdventurers.find(ka => ka.adventurerId === adventurerId)
      },

      getMetBadge: (adventurerId) => {
        const known = getKnownAdventurerInfo(get().knownAdventurers, adventurerId)
        if (!known) return null

        return {
          isKnown: true,
          text: getMetInfoText(known),
          className: 'badge-known',
        }
      },

      calculateExpedition: (adventurer, expedition, weapon) => {
        return calculateExpeditionResultV2(
          adventurer,
          expedition,
          get().guild.level,
          weapon.stats.attack,
          weapon.currentDurability,
          weapon.type as any,
          weapon.id,
          weapon.qualityRank,
          weapon.epicMultiplier,
          weapon.combatMaterialId,
          weapon.quality
        )
      },

      // Craft helpers
      getWeaponById: (weaponId) => get().weaponInventory.weapons.find(w => w.id === weaponId),

      isRecipeUnlocked: (recipeId) => {
        const state = get()
        return state.unlockedRecipes.weaponRecipes.includes(recipeId) ||
               state.unlockedRecipes.refiningRecipes.includes(recipeId)
      },

      getRecipeSource: (recipeId) => get().recipeSources.find(s => s.recipeId === recipeId),

      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      // Craft state checks (многоступенчатый крафт — craftV2Persisted)
      isCrafting: () => get().craftV2Persisted.stage === 'crafting',
      isRefining: () => get().activeRefining.recipeId !== null,
      updateCraftProgress: (_progress) => {
        /* legacy v1 одношкальный прогресс удалён; тик в useCraftV2 */
      },
      updateRefiningProgress: (progress) => set((s) => ({
        activeRefining: { ...s.activeRefining, progress: Math.min(100, progress) }
      })),

      setCraftV2Persisted: (data: Partial<CraftV2Persisted>) => {
        set((state) => ({
          craftV2Persisted: { ...state.craftV2Persisted, ...data },
        }))
      },

      setShouldPurchaseMaterials: (should: boolean) => {
        set({ shouldPurchaseMaterials: should })
      },

      resetGame: () => {
        const initialState = {
          player: initialPlayer,
          resources: initialResources,
          workers: [],
          buildings: initialBuildings,
          weaponInventory: initialWeaponInventory,
          unlockedRecipes: initialUnlockedRecipes,
          recipeSources: [],
          unlockedEnchantments: [],
          guild: initialGuildState,
          knownAdventurers: [],
          orders: initialOrdersState.orders,
          tutorial: initialTutorialState,
          statistics: initialStatistics,
          activeRefining: initialActiveRefining,
          craftV2Persisted: initialCraftV2Persisted,
        }

        set(initialState as any)

        // Очищаем хранилища браузера
        if (typeof window !== 'undefined') {
          localStorage.removeItem('swordcraft-store')
          localStorage.removeItem('swordcraft-offline-backup')
          localStorage.removeItem('swordcraft-last-session')
          localStorage.removeItem(STORE_NAME)
        }
      },
    })
  },
  {
    name: STORE_NAME,
    version: STORE_VERSION,
    storage: createJSONStorage(getSsrSafeLocalStorage),
    partialize: (state) => ({
      player: state.player,
      resources: state.resources,
      statistics: state.statistics,
      workers: state.workers,
      buildings: state.buildings,
      maxWorkers: state.maxWorkers,
      weaponInventory: state.weaponInventory,
      unlockedRecipes: state.unlockedRecipes,
      recipeSources: state.recipeSources,
      unlockedEnchantments: state.unlockedEnchantments,
      guild: state.guild,
      knownAdventurers: state.knownAdventurers,
      orders: state.orders,
      activeOrderId: state.activeOrderId,
      tutorial: state.tutorial,
      currentScreen: state.currentScreen,
      craftV2Persisted: state.craftV2Persisted,
      shouldPurchaseMaterials: state.shouldPurchaseMaterials,
      materialKnowledge: state.materialKnowledge,
    }),
    merge: (persistedState: any, currentState) => {
      if (!persistedState || typeof persistedState !== 'object') {
        return currentState
      }
      const persisted = persistedState as Record<string, any>
      const merged = { ...currentState }
      for (const key of Object.keys(persisted)) {
        if (typeof persisted[key] !== 'function') {
          (merged as any)[key] = persisted[key]
        }
      }
      merged.guild = {
        ...currentState.guild,
        ...(persisted.guild ?? {}),
      }
      merged.statistics = {
        ...initialStatistics,
        ...((persisted.statistics as Partial<GameStatistics> | undefined) ?? {}),
      }
      // P2-Craft-04: убрано поле slice activeCraft; старые persist-файлы могли содержать ключ
      if ('activeCraft' in (merged as Record<string, unknown>)) {
        delete (merged as Record<string, unknown>)['activeCraft']
      }
      return merged
    },
  }
)
)

// ================================
// RE-EXPORTS (для обратной совместимости)
// ================================

export type {
  Player,
  GameStatistics,
  Resources,
  ResourceKey,
  CraftingCost,
  Worker,
  WorkerClass,
  ProductionBuilding,
  ActiveCraft,
  ActiveRefining,
  WeaponInventory,
  UnlockedRecipes,
  RecipeSource,
  WeaponType,
  WeaponTier,
  WeaponMaterial,
  QualityGrade,
}

export type { CraftedWeapon } from '@/types/craft'

export {
  initialPlayer,
  initialStatistics,
  initialResources,
  initialBuildings,
  workerClassData,
  initialActiveRefining,
  initialWeaponInventory,
  initialUnlockedRecipes,
}

// ================================
// HELPER HOOKS
// ================================

/**
 * Hook для форматирования ресурсов с сокращениями
 */
export const useFormattedResources = () => {
  const resources = useGameStore((state) => state.resources)

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return Math.floor(num).toString()
  }

  return {
    ...resources,
    formatted: {
      gold: formatNumber(resources.gold),
      soulEssence: formatNumber(resources.soulEssence),
      wood: formatNumber(resources.wood),
      stone: formatNumber(resources.stone),
      iron: formatNumber(resources.iron),
      coal: formatNumber(resources.coal),
      copper: formatNumber(resources.copper),
      tin: formatNumber(resources.tin),
      silver: formatNumber(resources.silver),
      goldOre: formatNumber(resources.goldOre),
      mithril: formatNumber(resources.mithril),
      ironIngot: formatNumber(resources.ironIngot),
      copperIngot: formatNumber(resources.copperIngot),
      tinIngot: formatNumber(resources.tinIngot),
      bronzeIngot: formatNumber(resources.bronzeIngot),
      steelIngot: formatNumber(resources.steelIngot),
      silverIngot: formatNumber(resources.silverIngot),
      goldIngot: formatNumber(resources.goldIngot),
      mithrilIngot: formatNumber(resources.mithrilIngot),
      planks: formatNumber(resources.planks),
      stoneBlocks: formatNumber(resources.stoneBlocks),
    },
  }
}

/**
 * Hook для расчёта стоимости найма рабочего
 */
export const useWorkerHireCost = (workerClass: WorkerClass): number => {
  const workers = useGameStore((state) => state.workers)
  const classData = workerClassData[workerClass]
  const sameClassCount = workers.filter(w => w.class === workerClass).length
  return Math.floor(classData.baseCost * (1 + sameClassCount * 0.5))
}
