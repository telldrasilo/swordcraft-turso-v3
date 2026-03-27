/**
 * Composed Game Store v2
 * Тонкий слой сборки (~300 строк)
 * 
 * Архитектура:
 * - Slices: Инкапсуляция бизнес-логики по доменам
 * - Composed: Координация cross-slice операций
 * - Utils: Чистые функции для расчётов
 */

import { create, StateCreator } from 'zustand'
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
import { initialActiveCraft, initialActiveRefining, initialWeaponInventory, initialUnlockedRecipes } from './slices/craft-slice'

import { createEncyclopediaSlice } from './slices/encyclopedia-slice'
import type { EncyclopediaSlice } from './slices/encyclopedia-slice'

// ================================
// DATA IMPORTS
// ================================

import { WeaponRecipe, weaponRecipes } from '@/data/weapon-recipes'
import { RefiningRecipe, refiningRecipes } from '@/data/refining-recipes'
import {
  Enchantment,
  canAffordEnchantment,
  areEnchantmentsCompatible,
  MAX_ENCHANTMENTS_PER_WEAPON,
} from '@/data/enchantments'
import { expeditionTemplates, ExpeditionTemplate } from '@/data/expedition-templates'
import {
  RepairOption,
  RepairType,
  ExecuteRepairResult,
} from '@/data/repair-system'

// ================================
// UTILITY IMPORTS
// ================================

import { generateId } from '@/lib/store-utils/generators'
import { RESOURCE_SELL_PRICES, PLAYER_TITLES } from '@/lib/store-utils/constants'
import { getTitleByLevel, addExperience as addExperienceUtil } from '@/lib/store-utils/player-utils'
import {
  calculateHireCost,
  getFireRefund,
  calculateAverageQuality,
  WORKER_CLASS_DATA,
} from '@/lib/store-utils/worker-utils'
import {
  getQualityGrade as getQualityGradeUtil,
  calculateCraftQuality as calculateCraftQualityUtil,
  calculateAttack as calculateAttackUtil,
  calculateSellPrice as calculateSellPriceUtil,
  calculateCraftExperience,
  createWeapon,
} from '@/lib/store-utils/craft-utils'
import {
  calculateSacrificeValue as calculateSacrificeValueUtil,
} from '@/lib/store-utils/enchantment-utils'
import {
  findBestBlacksmith,
  getRepairOptionsForWeapon,
  calculateRepairCost,
  calculateMaxRepairPercent,
  executeRepair as executeRepairUtil,
  getMaterialDeductions,
  type WeaponForRepair,
} from '@/lib/store-utils/repair-utils'
import {
  calculateExpeditionOutcome,
  updateKnownAdventurersAfterMission,
  createRecoveryQuest,
  createHistoryEntry,
  updateGuildStats,
  calculateExpeditionPreview,
  type WeaponForExpedition,
} from '@/lib/store-utils/expedition-utils'

// Expedition event system
import { selectEventsForExpedition } from '@/lib/expedition-event-selector'

// ================================
// ADDITIONAL TYPE IMPORTS
// ================================

import {
  initialGuildState,
  GuildState,
  Adventurer,
  ActiveExpedition,
  RecoveryQuest,
  getGuildReputationLevel,
  getMaxActiveExpeditions,
  calculateReputationGain,
  GUILD_LEVELS,
} from '@/types/guild'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { KnownAdventurer, MissionResultForStats } from '@/types/known-adventurer'
import { KNOWN_ADVENTURERS_CONFIG } from '@/types/known-adventurer'
import {
  updateKnownAdventurer,
  getKnownAdventurerInfo,
  getMetInfoText,
  getContractAvailabilityText,
} from '@/lib/known-adventurers-manager'
import {
  calculateExpeditionResult as calculateExpeditionResultV2,
  type ExpeditionCalculation,
} from '@/lib/expedition-calculator-v2'
import {
  generateAdventurerPool,
  isAdventurerExpired,
  ADVENTURER_LIFETIME,
  getAdventurerFullName,
} from '@/lib/adventurer-generator'
import { ExpeditionResult } from './slices/guild-slice'

// ================================
// ДОПОЛНИТЕЛЬНЫЕ SLICE IMPORTS
// ================================

import { createOrdersSlice } from './slices/orders-slice'
import type { OrdersSlice, NPCOrder } from './slices/orders-slice'
import { initialOrdersState } from './slices/orders-slice'
import { type OrderGenerationContext } from '@/lib/store-utils/order-achievable-utils'
import { calculateGoldReward } from '@/lib/store-utils/order-utils'

import { createTutorialSlice } from './slices/tutorial-slice'
import type { TutorialSlice, TutorialState, TutorialActions } from './slices/tutorial-slice'
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
  
  // Craft + Resources + Player
  startCraftWithResources: (recipe: WeaponRecipe) => boolean
  completeCraftWithExperience: () => CraftedWeaponV2 | null

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

type GameStore = PlayerSlice & ResourcesSlice & WorkersSlice & CraftSlice & OrdersSlice & TutorialActions & AdditionalState & CrossSliceActions & EncyclopediaSlice

// ================================
// STORE CREATION
// ================================

const STORE_VERSION = 1
const STORE_NAME = 'swordcraft-store-v2'

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
          workerClassData[workerClass].baseCost,
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
        const refund = getFireRefund(worker.hireCost)
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

      // Craft + Resources + Player
      startCraftWithResources: (recipe) => {
        const state = get()

        // Проверки
        if (state.activeCraft.recipeId) return false
        if (!state.isRecipeUnlocked(recipe.id)) return false
        if (state.player.level < recipe.requiredLevel) return false
        if (!state.canAfford(recipe.cost)) return false

        // Списываем ресурсы
        state.spendResources(recipe.cost)

        // Запускаем крафт
        return state.startCraft(recipe)
      },

      completeCraftWithExperience: () => {
        const state = get()
        if (!state.activeCraft.recipeId) return null

        const recipeId = state.activeCraft.recipeId
        const recipe = weaponRecipes.find(r => r.id === recipeId)

        if (!recipe) return null

        // Рассчитываем качество
        const workersQuality = state.getWorkersQuality()

        // Создаём уникальное оружие
        const weapon = createWeapon({
          recipeId: recipe.id,
          recipeName: recipe.name,
          recipeType: recipe.type,
          recipeTier: recipe.tier,
          recipeMaterial: recipe.material,
          recipeBaseSellPrice: recipe.baseSellPrice,
          recipeCost: recipe.cost,
          workersQuality: workersQuality,
          playerLevel: state.player.level,
        })

        // Добавляем в инвентарь
        state.addWeapon(weapon)

        // Начисляем опыт
        const exp = calculateCraftExperience(weapon.quality)
        state.addExperience(exp)

        // Обновляем статистику
        state.updateStatistics({ totalCrafts: state.statistics.totalCrafts + 1 })

        // Очищаем активный крафт
        set((s) => ({
          activeCraft: initialActiveCraft
        }))

        return weapon
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
        if (recipe.extraCost && !state.canAfford({ coal: recipe.extraCost.coal * amount })) return false

        // Списываем
        for (const input of recipe.inputs) {
          state.spendResource(input.resource as ResourceKey, input.amount * amount)
        }
        if (recipe.extraCost) {
          state.spendResource('coal', recipe.extraCost.coal * amount)
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

        const result = calculateSacrificeValueUtil(weapon)

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

      // Repair + Resources + Workers
      executeWeaponRepair: (weaponId, repairType) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) {
          return { success: false, cost: 0, repairedAmount: 0, durabilityLeft: 0 }
        }

        const blacksmith = findBestBlacksmith(state.workers)
        if (!blacksmith) {
          return { success: false, cost: 0, repairedAmount: 0, durabilityLeft: 0 }
        }

        const weaponForRepair: WeaponForRepair = {
          id: weapon.id,
          durability: weapon.durability,
          maxDurability: weapon.maxDurability,
          quality: weapon.quality,
        }

        const result = executeRepairUtil(
          weaponForRepair,
          repairType,
          blacksmith,
          state.resources
        )

        if (result.success) {
          // Списываем ресурсы
          for (const [resource, amount] of Object.entries(result.costs)) {
            state.spendResource(resource as ResourceKey, amount)
          }

          // Обновляем оружие
          set((s) => ({
            weaponInventory: {
              ...s.weaponInventory,
              weapons: s.weaponInventory.weapons.map(w =>
                w.id === weaponId
                  ? { ...w, durability: result.durabilityLeft }
                  : w
              ),
            },
          }))
        }

        return result
      },

      repairWeaponWithResources: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return { success: false, cost: 0, repairedAmount: 0 }

        const blacksmith = findBestBlacksmith(state.workers)
        if (!blacksmith) return { success: false, cost: 0, repairedAmount: 0 }

        const cost = calculateRepairCost(weapon.quality, weapon.maxDurability - weapon.durability)
        const maxRepair = calculateMaxRepairPercent(blacksmith)

        if (!state.canAfford({ gold: cost })) return { success: false, cost, repairedAmount: 0 }

        const repairedAmount = Math.floor((weapon.maxDurability - weapon.durability) * maxRepair / 100)

        state.spendResource('gold', cost)

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? { ...w, durability: Math.min(w.maxDurability, w.durability + repairedAmount) }
                : w
            ),
          },
        }))

        return { success: true, cost, repairedAmount }
      },

      // Guild + Resources + Craft + Player
      startExpeditionFull: (expedition, adventurer, weapon, extendedAdventurer) => {
        const state = get()

        // Проверяем лимит активных экспедиций
        const maxActive = getMaxActiveExpeditions(state.guild.level)
        if (state.guild.activeExpeditions.length >= maxActive) {
          return false
        }

        // Проверяем ресурсы
        const totalCost = expedition.cost.supplies + expedition.cost.deposit
        if (!state.canAfford({ gold: totalCost })) return false

        // Проверяем оружие (используем новые поля CraftedWeaponV2)
        if (weapon.currentDurability <= 10) return false
        if (weapon.stats.attack < expedition.minWeaponAttack) return false

        // Списываем
        state.spendResource('gold', totalCost)

        // Генерируем события для экспедиции
        const startedAt = Date.now()
        const eventResult = selectEventsForExpedition(expedition, startedAt)

        // Создаём экспедицию с правильными полями типа ActiveExpedition
        const newExpedition: ActiveExpedition = {
          id: generateId(),
          expeditionId: expedition.id,
          expeditionName: expedition.name,
          expeditionIcon: expedition.icon,
          adventurerId: adventurer.id,
          adventurerName: getAdventurerFullName(adventurer),
          adventurerData: adventurer,
          adventurerExtended: extendedAdventurer,
          weaponId: weapon.id,
          weaponName: weapon.fullName,
          weaponData: weapon,
          startedAt: startedAt,
          endsAt: startedAt + expedition.duration * 1000,
          deposit: expedition.cost.deposit,
          suppliesCost: expedition.cost.supplies,
          events: eventResult.events, // Добавляем сгенерированные события
        }

        set((s) => ({
          guild: {
            ...s.guild,
            activeExpeditions: [...s.guild.activeExpeditions, newExpedition],
          },
        }))

        return true
      },

      completeExpeditionFull: (expeditionId) => {
        const state = get()
        const expedition = state.guild.activeExpeditions.find(e => e.id === expeditionId)
        if (!expedition) return null

        const template = expeditionTemplates.find(t => t.id === expedition.expeditionId)
        if (!template) return null

        const weapon = state.weaponInventory.weapons.find(w => w.id === expedition.weaponId)
        if (!weapon) return null

        // Используем extended данные искателя если есть
        const adventurerExtended = expedition.adventurerExtended

        // Рассчитываем результат используя калькулятор v2
        const calculation = calculateExpeditionResultV2(
          adventurerExtended || {
            id: expedition.adventurerId,
            identity: { firstName: expedition.adventurerName, lastName: '', gender: 'male' },
            combat: { level: 10, rarity: 'common', power: 25, precision: 25, endurance: 25, luck: 25, combatStyle: 'berserker', preferredWeapons: [], avoidedWeapons: [] },
            personality: { primaryTrait: 'brave', secondaryTrait: 'honourable', motivations: ['gold'], socialTags: [], riskTolerance: 'balanced' },
            strengths: [],
            weaknesses: [],
            requirements: { minAttack: 0 },
            createdAt: Date.now(),
            expiresAt: Date.now() + 86400000,
          },
          template,
          state.guild.level,
          weapon.stats.attack,
          weapon.currentDurability,
          weapon.type as any,
          weapon.id
        )

        // Определяем успех на основе шанса
        const roll = Math.random() * 100
        const success = roll < calculation.successChance
        const isCrit = success && Math.random() * 100 < calculation.critChance

        // Рассчитываем финальные награды
        const commission = Math.floor(calculation.commission * (isCrit ? 1.5 : 1))
        const warSoul = Math.floor(calculation.warSoul * (isCrit ? 1.5 : 1))
        const glory = Math.floor((template.reward.baseWarSoul * 0.1 + (success ? 5 : 2)) * (isCrit ? 1.5 : 1))

        // Рассчитываем износ оружия
        const weaponWear = calculation.weaponWear

        // Определяем потерю оружия при провале
        const weaponLossChance = calculation.weaponLossChance
        const weaponLost = !success && Math.random() * 100 < weaponLossChance

        const result: ExpeditionResult = {
          success,
          commission,
          warSoul,
          bonusGold: 0,
          glory,
          reputation: success ? calculateReputationGain('expedition', template.reward.baseGold, state.player.level) : 0,
          weaponWear,
          weaponLost,
          isCrit,
        }

        // Начисляем награды
        if (result.commission > 0) {
          state.addResource('gold', result.commission)
        }
        if (result.warSoul > 0 && weapon) {
          // Расчёт эпичности для экспедиций (базовый + бонус за успех/крит)
          const baseEpicGain = 0.05
          const successBonus = result.success ? 0.03 : 0
          const critBonus = result.isCrit ? 0.05 : 0
          const epicGain = baseEpicGain + successBonus + critBonus + (Math.random() * 0.02)
          
          state.addWarSoulToWeapon(weapon.id, result.warSoul, result.weaponWear, epicGain)
        }
        if (result.glory) {
          // Добавляем славу гильдии
          set((s) => ({
            guild: {
              ...s.guild,
              glory: s.guild.glory + result.glory,
            },
          }))
        }

        // Начисляем репутацию за экспедицию (только при успехе)
        // Репутация уже включена в result.reputation

        // Обработка потери оружия при провале
        if (result.weaponLost) {
          const recoveryQuest: RecoveryQuest = {
            id: generateId(),
            lostWeaponId: weapon.id,
            lostWeaponData: weapon,
            originalExpeditionId: expedition.expeditionId,
            originalExpeditionName: expedition.expeditionName,
            cost: Math.floor(expedition.deposit * 0.5),
            duration: template.duration * 2,
            status: 'available',
          }
          set((s) => ({
            guild: {
              ...s.guild,
              recoveryQuests: [...s.guild.recoveryQuests, recoveryQuest],
            },
          }))
          state.removeWeapon(weapon.id)
        }

        // Даём опыт
        state.addExperience(result.success ? 20 : 5)

        // Удаляем экспедицию и добавляем в историю
        set((s) => ({
          guild: {
            ...s.guild,
            activeExpeditions: s.guild.activeExpeditions.filter(e => e.id !== expeditionId),
            history: [...s.guild.history, {
              id: generateId(),
              expeditionName: expedition.expeditionName,
              expeditionIcon: expedition.expeditionIcon,
              adventurerName: expedition.adventurerName,
              adventurerData: expedition.adventurerData,
              adventurerExtended: expedition.adventurerExtended,
              weaponName: expedition.weaponName,
              completedAt: Date.now(),
              success: result.success,
              commission: result.commission,
              warSoul: result.warSoul,
              glory: result.glory,
              weaponLost: result.weaponLost,
              isCrit: result.isCrit,
            }],
          },
        }))

        return result
      },

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
      takeAdvance: (orderId, amount) => {
        const state = get()
        const order = state.orders.find(o => o.id === orderId)
        if (!order) return { success: false, taken: 0 }

        const result = ordersSlice.takeAdvance(orderId, amount)
        if (result.success) {
          state.addResource('gold', result.taken)
        }
        return result
      },

      completeOrder: (orderId, weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        // Получаем заказ для расчёта репутации
        const order = state.orders.find(o => o.id === orderId)
        if (!order) return false

        // Рассчитываем награду динамически на основе качества оружия
        const baseReward = calculateGoldReward(
          weapon.quality,
          order.weaponType,
          order.material,
          state.player.level,
          order.materialCost || 0
        )

        // Если был аванс материалов, вычитаем его из награды
        const advanceTaken = order.advanceTaken || 0
        const materialAdvanceCost = order.materialAdvance?.totalCost || 0
        const totalAdvance = advanceTaken + materialAdvanceCost
        const finalGoldReward = Math.max(1, baseReward - totalAdvance)

        const result = ordersSlice.completeOrder(orderId, weaponId, {
          quality: weapon.quality,
          attack: weapon.stats.attack,
          type: weapon.type,
          recipeId: weapon.recipeId,
          hiddenTags: weapon.hiddenTags, // Добавляем hiddenTags для проверки заказа
        })
        if (!result.success) return false

        // Перезаписываем награду динамически рассчитанным значением
        result.rewards.gold = finalGoldReward

        // Награды за заказ (уже рассчитаны с учётом аванса)
        state.addResource('gold', result.rewards.gold)
        state.addFame(result.rewards.fame)

        // Начисляем репутацию за выполнение заказа
        const reputationGain = calculateReputationGain('craft', result.rewards.gold, state.player.level)
        state.addReputation(reputationGain)

        // Бонусные предметы заказа
        if (result.rewards.bonusItems) {
          for (const bonus of result.rewards.bonusItems) {
            if (bonus.resource in state.resources) {
              state.addResource(bonus.resource as ResourceKey, bonus.amount)
            }
          }
        }

        // Сдача заказа расходует выбранное оружие
        state.removeWeapon(weaponId)

        // Обновляем статистику
        state.updateStatistics({
          ordersCompleted: state.statistics.ordersCompleted + 1,
          totalGoldEarned: state.statistics.totalGoldEarned + finalGoldReward,
        })

        return true
      },

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
        if (weapon.enchantments && !areEnchantmentsCompatible(weapon.enchantments.map(e => e.enchantmentId), enchantmentId)) {
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
        if (recipe.extraCost && state.resources.coal < recipe.extraCost.coal * amount) {
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
        const known = get().knownAdventurers.find(ka => ka.adventurerId === adventurerId)
        if (!known) return null

        const info = getKnownAdventurerInfo(known)
        return {
          isKnown: true,
          text: getMetInfoText(info),
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

      // Repair helpers
      getRepairOptions: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return []

        return getRepairOptionsForWeapon(weapon, state.workers)
      },

      getBestBlacksmith: () => {
        return findBestBlacksmith(get().workers)
      },

      getWeaponRepairCost: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return 0

        return calculateRepairCost(weapon.quality, weapon.maxDurability - weapon.durability)
      },

      getMaxRepairPercent: (weaponId) => {
        const blacksmith = findBestBlacksmith(get().workers)
        return blacksmith ? calculateMaxRepairPercent(blacksmith) : 0
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

      // Craft state checks
      isCrafting: () => get().activeCraft.recipeId !== null,
      isRefining: () => get().activeRefining.recipeId !== null,
      updateCraftProgress: (progress) => set((s) => ({
        activeCraft: { ...s.activeCraft, progress: Math.min(100, progress) }
      })),
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
          activeCraft: initialActiveCraft,
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
    storage: createJSONStorage(() => localStorage),
    // Сохраняем только важные части состояния
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
    }),
  }
)
)

// ================================
// RE-EXPORTS (для обратной совместимости)
// ================================

export {
  // Player
  Player,
  GameStatistics,
  initialPlayer,
  initialStatistics,

  // Resources
  Resources,
  ResourceKey,
  CraftingCost,
  initialResources,

  // Workers
  Worker,
  WorkerClass,
  ProductionBuilding,
  initialBuildings,
  workerClassData,

  // Craft
  ActiveCraft,
  ActiveRefining,
  WeaponInventory,
  UnlockedRecipes,
  RecipeSource,
  WeaponType,
  WeaponTier,
  WeaponMaterial,
  QualityGrade,
  initialActiveCraft,
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
