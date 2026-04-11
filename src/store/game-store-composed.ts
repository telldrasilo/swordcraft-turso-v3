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
import {
  migrateActiveCraftForgeMaterials,
  migrateCraftedWeaponForgeMaterials,
  migrateCraftPlanForgeMaterials,
} from '@/lib/craft/forge-material-migrate'
import {
  migrateActiveCraftV2RecipeId,
  migrateCraftedWeaponV2RecipeId,
  migrateCraftPlanRecipeId,
  migrateUnlockedWeaponRecipeIds,
} from '@/lib/recipe-id-migrate'

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
import {
  createInventoryFilterSlice,
  defaultInventoryFilterState,
  normalizeInventoryFilterFromMerged,
} from './slices/inventory-filter-slice'
import type { InventoryFilterSlice } from './slices/inventory-filter-slice'
import type {
  CraftSlice,
  ActiveCraft,
  ActiveRefining,
  WeaponInventory,
  UnlockedRecipes,
  RecipeSource,
  WeaponType,
  WeaponTier,
  WeaponMaterial,
  QualityGrade,
  RepairTechniqueStageRunState,
} from './slices/craft-slice'
import type { CraftedWeaponV2, ActiveCraftV2, CraftPlan } from '@/types/craft-v2'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'
import type { MaterialStudySession } from '@/types/material-study'
import { initialActiveRefining, initialWeaponInventory, initialUnlockedRecipes } from './slices/craft-slice'

import { createEncyclopediaSlice, initialEncyclopediaState } from './slices/encyclopedia-slice'
import type { EncyclopediaSlice } from './slices/encyclopedia-slice'
import {
  createForgottenForgeQuestSlice,
  initialForgottenForgeQuestSlice,
} from './slices/forgotten-forge-quest-slice'
import type { ForgottenForgeQuestSlice } from './slices/forgotten-forge-quest-slice'
import {
  FORGOTTEN_FORGE_QUEST_STEP_MAX,
  type ForgottenForgeQuestState,
} from '@/types/forgotten-forge-quest'
import type { AltarConstructionState, AltarPhase } from '@/types/altar-construction'
import { initialAltarConstructionState } from '@/types/altar-construction'
import { getAltarPhaseConfig } from '@/data/altar/altar-phases-config'
import {
  altarConstructionStateAfterPhaseComplete,
  canStartAltarPhase,
  computeAltarConstructionTick,
  consumeMaterialsForAltarPhase,
} from '@/lib/altar/altar-construction-phase'
import { gameEvents } from '@/lib/game-events'
import { normalizeAltarConstructionFromSave } from '@/lib/normalize-forgotten-forge-persist'
import { mergeCraftRoadmapStarterKnowledge } from '@/lib/materials/craft-roadmap-starter-knowledge'
import { normalizeMaterialStudySessionsFromSave } from '@/lib/materials/normalize-material-study-sessions'
import {
  DEFAULT_TECHNIQUE_KIND_TAB,
  isEncyclopediaTechniqueKindTab,
} from '@/lib/encyclopedia/encyclopedia-technique-sections'

// ================================
// DATA IMPORTS
// ================================

import { mergeActiveRefiningFromSave } from '@/lib/save-craft-normalize'
import {
  normalizeRepairBenchSelectedWeaponIdFromSave,
  normalizeRepairBenchWeaponIdsFromSave,
  normalizeRepairTechniqueStageRunFromSave,
} from '@/lib/normalize-repair-bench-from-save'
import { normalizeWorkbenchQueueFromSave } from '@/lib/workbench/workbench-queue'
import { withRecalculatedPowerScore } from '@/lib/craft/weapon-power-score'
import { appendRepairQueueItemsFromLegacyBenchIds } from '@/lib/workbench/migrate-repair-bench-ids-to-queue'
import type { WorkbenchBarBaseline } from '@/lib/workbench/workbench-bar-baseline'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import { createDiscoveredMaterialKnowledge } from '@/types/materials/knowledge'
import type { RefiningRecipe } from '@/data/refining-recipes'
import { refiningRecipes } from '@/data/refining-recipes'
import {
  areEnchantmentsCompatible,
  getEnchantment,
  MAX_ENCHANTMENTS_PER_WEAPON,
} from '@/data/enchantments'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { RepairOption, ExecuteRepairResult } from '@/data/repair-system'

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
import {
  canAffordRefiningStart,
  computeRefiningSmeltingOutputMultiplier,
  getAvailableAmountForResourceKey,
  getGrantTargetMaterialId,
  migrateLegacyMaterialResourcesToStash,
} from '@/lib/craft/inventory-check'
import {
  migrateCraftedWeaponV2DamageFields,
  normalizeWeaponDamageInMergedState,
} from '@/lib/weapon-damage/migrate-crafted-weapon-damage'
import { applyReforgeTechniquePure, isReforgeTechniqueUnlocked } from '@/lib/reforge'
import { getReforgeTechniqueById } from '@/data/reforge/reforge-techniques-registry'
import { buildReforgeCatalogMaterialDebit } from '@/lib/reforge/reforge-catalog-spend'

// ================================
// ADDITIONAL TYPE IMPORTS
// ================================

import {
  initialGuildState,
  type GuildState,
  type Adventurer,
  type ActiveExpedition,
  type StartExpeditionFullOptions,
  GUILD_LEVELS,
} from '@/types/guild'
import {
  clampReputationToRankCap,
  getRankUpCost,
  MAX_GUILD_LEVEL,
  migrateGuildReputationTierFromLegacy,
} from '@/lib/guild-reputation-tier'
import {
  getIntendantOfferById,
  getIntendantRepairTechniqueOffer,
  getIntendantReforgeTechniqueOffer,
} from '@/data/guild/intendant-catalog'
import type { ContractTier } from '@/types/contract'
import { CONTRACT_REQUIREMENTS } from '@/types/contract'
import { canOfferContract, createContract, terminateContract } from '@/lib/contract-manager'
import { convertToExtended } from '@/lib/adventurer-converter'
import type { ContractType } from '@/modules/expeditions/data/missions/_mission-template'
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

/** Вкладки экрана гильдии (заказы / экспедиции / …) */
export type GuildScreenTab =
  | 'orders'
  | 'expeditions'
  | 'adventurers'
  | 'intendant'
  | 'stats'

/** Подвкладки группы «Верстак» (ремонт / перековка) */
export type ForgeBenchSubTab = 'repair' | 'reforge'

/** Вкладки экрана кузницы (синхронизация с `ForgeScreen`); верстак — одна вкладка `bench`. */
export type ForgeMainTab = 'craft' | 'inventory' | 'bench'

/** Навигация: основная вкладка или подрежим верстака (`repair` / `reforge` открывают `bench` с нужным sub). */
export type ForgeTabNavigate = ForgeMainTab | ForgeBenchSubTab

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

  // Repair + Resources (кузнец = игрок)
  /**
   * Ремонт по техникам и этапам. Без видимых тегов — только `durability_maintenance` (стоимость как у
   * базового ремонта прочности на вкладке «Ремонт»). Профиль броска → таблицы `repair-system` в `repair-utils`.
   */
  executeWeaponRepairByTechniques: (
    weaponId: string,
    techniqueIds: string[],
    opts?: import('@/types/repair-execution').RepairTechniqueExecutionOptions
  ) => ExecuteRepairResult
  /** Проверка плана и материалов перед стартом этапов (очередь верстака — на текущий склад). */
  preflightWeaponRepairByTechniques: (
    weaponId: string,
    techniqueIds: string[],
    opts?: import('@/types/repair-execution').RepairTechniqueExecutionOptions
  ) => ExecuteRepairResult

  // Guild + Resources + Craft + Player
  startExpeditionFull: (
    expedition: ExpeditionTemplate,
    adventurer: Adventurer,
    weapon: CraftedWeaponV2,
    extendedAdventurer?: AdventurerExtended,
    options?: StartExpeditionFullOptions
  ) => boolean
  completeExpeditionFull: (expeditionId: string) => ExpeditionResult | null
  skipExpeditionToNextEvent: (expeditionId: string) => void
  skipExpeditionTimelineToEnd: (expeditionId: string) => void
  offerGuildContract: (
    adventurer: Adventurer,
    tier: ContractTier,
    adventurerExtended?: AdventurerExtended
  ) => { success: boolean; reason?: string }
  /** Расторжение контракта по инициативе гильдии: штраф из `contract-manager`, искатель убирается из списка */
  terminateGuildContract: (adventurerId: string) => { success: boolean; reason?: string }

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
  acknowledgeWeaponRepairGuidance: () => void

  // Enchantments (simple)
  enchantWeapon: (weaponId: string, enchantmentId: string) => boolean
  removeEnchantment: (weaponId: string, enchantmentId: string) => boolean
  isEnchantmentUnlocked: (enchantmentId: string) => boolean
  addWarSoulToWeapon: (
    weaponId: string,
    points: number,
    durabilityLoss?: number,
    epicGain?: number,
    appendDamageTags?: ActiveDamageTagEntry[]
  ) => boolean

  // Recipes
  unlockRecipe: (
    recipeId: string,
    source: 'purchase' | 'order' | 'expedition' | 'level' | 'guild_intendant'
  ) => boolean
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
  /** Списать очки репутации текущего ранга (интендант и т.п.). */
  spendGuildReputation: (amount: number) => boolean
  /** Повысить ранг гильдии, потратив накопленный прогресс в ранге. */
  guildRankUp: () => boolean
  /** Отладка: шаг уровня гильдии (±1); сбрасывает прогресс в текущем ранге. */
  devAdjustGuildLevel: (delta: number) => void
  /** Покупка предложения интенданта за репутацию. */
  purchaseIntendantOffer: (offerId: string) => { success: boolean; reason?: string }
  getAdventurerById: (id: string) => Adventurer | undefined
  getActiveExpeditionById: (id: string) => ActiveExpedition | undefined
  isWeaponInExpedition: (weaponId: string) => boolean

  // Known Adventurers
  getKnownAdventurer: (adventurerId: string) => KnownAdventurer | undefined
  getMetBadge: (adventurerId: string) => { isKnown: boolean; text: string; className: string } | null
  calculateExpedition: (
    adventurer: AdventurerExtended,
    expedition: ExpeditionTemplate,
    weapon: CraftedWeaponV2,
    contractType?: ContractType
  ) => ExpeditionCalculation

  // Repair helpers (мастерство от уровня игрока)
  getRepairOptions: (weaponId: string) => RepairOption[]
  getPlayerLevelForRepair: () => number
  startWeaponDeepInspect: (weaponId: string) => { success: boolean; error?: string }
  completeWeaponDeepInspect: (weaponId: string) => { success: boolean; error?: string }

  // Craft helpers
  getWeaponById: (weaponId: string) => CraftedWeaponV2 | undefined
  isRecipeUnlocked: (recipeId: string) => boolean
  getRecipeSource: (recipeId: string) => RecipeSource | undefined
  setCurrentScreen: (screen: GameScreen) => void
  /** Перейти в кузницу на выбранную вкладку (для ссылок из инвентаря и т.п.) */
  navigateToForgeTab: (tab: ForgeTabNavigate) => void
  /** Сброс запроса вкладки после применения в `ForgeScreen` */
  clearForgeTabRequest: () => void
  /** Активная вкладка экрана гильдии (синхрон с `GuildScreen` Tabs) */
  setGuildScreenTab: (tab: GuildScreenTab) => void
  /** Ремонт: перейти в гильдию → интендант → фильтр «Техники ремонта», к карточке техники */
  navigateToGuildIntendantRepairTechnique: (repairTechniqueId: string) => void
  clearIntendantRepairTechniqueFocus: () => void
  /** Перековка: гильдия → интендант → фильтр «Перековка», к карточке техники */
  navigateToGuildIntendantReforgeTechnique: (reforgeTechniqueId: string) => void
  clearIntendantReforgeTechniqueFocus: () => void
  /** Гильдия → Экспедиции → «Особые задания» (квест FF и т.п.) */
  navigateToGuildForgottenForgeSpecialQuest: () => void
  /** Текущая подвкладка кузницы; `repair`/`reforge` переключают верстак без смены верхнего ряда */
  setForgeMainTab: (tab: ForgeTabNavigate) => void
  /** Узел алтаря собран в кузнице (завершение рецепта сборки; вкладка «Алтарь»). */
  setAltarBuiltInForge: (built: boolean) => void
  startAltarConstructionPhase: (phase: AltarPhase) => boolean
  cancelAltarConstructionPhase: () => void
  /** Тик прогресса активной макрофазы (reload-safe). */
  updateAltarConstructionProgress: (nowMs?: number) => void
  /** Отладка стройки алтаря: следующий микроэтап (на последнем — завершить фазу). */
  devAltarConstructionSkipToNextStage: () => void
  /** Отладка: мгновенно завершить активную фазу. */
  devAltarConstructionCompleteActivePhase: () => void
  /** Полоса очереди: зафиксировать/сбросить baseline (не в persist). */
  setWorkbenchBarBaseline: (baseline: WorkbenchBarBaseline | null) => void

  /** Перековка: применение к клинку из инвентаря (верстак — через очередь или UI выбора). */
  applyReforgeTechnique: (
    weaponId: string,
    techniqueId: string
  ) => import('@/lib/reforge').ApplyReforgeResult

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
  /** Прогноз min–max (разброс крафта); может отсутствовать в старых сейвах */
  forecast: any | null
  weaponName: any | null
}

export const initialCraftV2Persisted: CraftV2Persisted = {
  activeCraft: null,
  plan: null,
  completedWeapon: null,
  stage: 'planning',
  preview: null,
  forecast: null,
  weaponName: null,
}

interface AdditionalState {
  currentScreen: GameScreen
  guild: GuildState
  knownAdventurers: KnownAdventurer[]
  tutorial: TutorialState
  craftV2Persisted: CraftV2Persisted
  shouldPurchaseMaterials: boolean // Добавил для галочки закупки
  /** Не персистится; выставляется перед переходом в кузницу */
  forgeTabRequest: ForgeMainTab | null
  /** Активная подвкладка кузницы (переживает размонтирование экрана) */
  forgeMainTab: ForgeMainTab
  /** Подвкладка внутри «Верстак»: ремонт или перековка */
  forgeBenchSubTab: ForgeBenchSubTab
  /** Не персистится; зафиксированные доли полосы очереди на старте сессии §8.5 */
  workbenchBarBaseline: WorkbenchBarBaseline | null
  /** Чертёж и артефакты после квеста «Эхо забытой кузни» (доступ вкладки «Алтарь» в кузнице) */
  altarUnlockedByForgottenForgeQuest: boolean
  /** Узел алтаря собран в кузнице (отдельно от гейта квеста; см. ENCHANTMENT_MODULE_PHASE2) */
  altarBuiltInForge: boolean
  /** Не персистится; синхрон с вкладками `GuildScreen` */
  guildScreenTab: GuildScreenTab
  /** Не персистится; id техники ремонта — проскроллить карточку в интенданте */
  intendantRepairTechniqueFocusId: string | null
  /** Не персистится; id техники перековки — проскроллить карточку в интенданте */
  intendantReforgeTechniqueFocusId: string | null
  /** Не персистится; инкремент — вкладка экспедиций «Особые задания» */
  guildExpeditionsSpecialTabNonce: number
  /** Прогресс строительства алтаря v2 (фазы I–V). Флаги дублируют верхнеуровневые altar* при merge. */
  altarConstruction: AltarConstructionState
}

const initialAdditionalState: AdditionalState = {
  currentScreen: 'forge',
  guild: initialGuildState,
  knownAdventurers: [],
  tutorial: initialTutorialState,
  craftV2Persisted: initialCraftV2Persisted,
  shouldPurchaseMaterials: false, // Добавил для галочки закупки
  forgeTabRequest: null,
  forgeMainTab: 'craft',
  forgeBenchSubTab: 'repair',
  workbenchBarBaseline: null,
  altarUnlockedByForgottenForgeQuest: false,
  altarBuiltInForge: false,
  guildScreenTab: 'orders',
  intendantRepairTechniqueFocusId: null,
  intendantReforgeTechniqueFocusId: null,
  guildExpeditionsSpecialTabNonce: 0,
  altarConstruction: { ...initialAltarConstructionState },
}

// ================================
// FULL STORE TYPE
// ================================

/** Публичный `completeOrder` задаётся в CrossSliceActions (2 args); slice-метод с 3 args только для внутренней склейки. */
export type GameStore = PlayerSlice &
  ResourcesSlice &
  WorkersSlice &
  CraftSlice &
  InventoryFilterSlice &
  Omit<OrdersSlice, 'completeOrder'> &
  TutorialActions &
  AdditionalState &
  CrossSliceActions &
  EncyclopediaSlice &
  ForgottenForgeQuestSlice

// ================================
// STORE CREATION
// ================================

/** … 29: стройка на экране зачарований; вкладка кузницы «Алтарь» удалена. 30: A2 **2.4** — повторный sweep `resources`→`materialStash` (`migrateLegacyMaterialResourcesToStash`). 31: хвост 2.4 — снова sweep после ввода stash-only пула **coal**. */
const STORE_VERSION = 33
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

      ...createInventoryFilterSlice(set as any, get as any, {} as any),

      // Orders slice
      ...ordersSlice,

      // Encyclopedia slice
      ...createEncyclopediaSlice(set as any, get as any, {} as any),

      ...createForgottenForgeQuestSlice(set as never, get as never),

      // Tutorial actions (без state - state в AdditionalState)
      nextTutorialStep: () => set((state) => {
        const nextStep = state.tutorial.currentStep + 1
        if (nextStep >= 6) {
          const shouldGrant = !state.tutorial.starterForgeExpertiseGranted
          return {
            tutorial: {
              ...state.tutorial,
              isActive: false,
              currentStep: nextStep,
              starterForgeExpertiseGranted: shouldGrant ? true : state.tutorial.starterForgeExpertiseGranted,
            },
            ...(shouldGrant
              ? { materialKnowledge: mergeCraftRoadmapStarterKnowledge(state.materialKnowledge) }
              : {}),
          }
        }
        return {
          tutorial: {
            ...state.tutorial,
            isActive: true,
            currentStep: nextStep,
          },
        }
      }),

      skipTutorial: () =>
        set((state) => {
          const already = state.tutorial.starterForgeExpertiseGranted
          return {
            tutorial: {
              ...state.tutorial,
              isActive: false,
              skipped: true,
              starterForgeExpertiseGranted: true,
            },
            ...(!already
              ? { materialKnowledge: mergeCraftRoadmapStarterKnowledge(state.materialKnowledge) }
              : {}),
          }
        }),

      completeTutorialStep: (stepId) =>
        set((state) => {
          if (state.tutorial.completedSteps.includes(stepId)) return state
          const completedSteps = [...state.tutorial.completedSteps, stepId]
          const milestones = new Set(['crafting', 'final'])
          const shouldGrant = milestones.has(stepId) && !state.tutorial.starterForgeExpertiseGranted
          return {
            tutorial: {
              ...state.tutorial,
              completedSteps,
              starterForgeExpertiseGranted: shouldGrant
                ? true
                : state.tutorial.starterForgeExpertiseGranted,
            },
            ...(shouldGrant
              ? { materialKnowledge: mergeCraftRoadmapStarterKnowledge(state.materialKnowledge) }
              : {}),
          }
        }),
      
      isTutorialActive: () => {
        const state = get()
        return state.tutorial.isActive && !state.tutorial.skipped
      },
      
      resetTutorial: () => set({ tutorial: initialTutorialState }),

      acknowledgeWeaponRepairGuidance: () =>
        set((state) => ({
          tutorial: {
            ...state.tutorial,
            weaponRepairGuidancePending: false,
            weaponRepairGuidanceConsumed: true,
          },
        })),

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

        if (!canAffordRefiningStart(recipe, amount, state.resources, state.materialStash)) {
          return false
        }

        const smeltingOutputMultiplier = computeRefiningSmeltingOutputMultiplier(
          recipe,
          amount,
          state.resources,
          state.materialStash
        )

        if (!state.applyRefiningStartSpend(recipe, amount)) return false

        return state.startRefining(recipe, amount, { smeltingOutputMultiplier })
      },

      completeRefiningWithResources: () => {
        const state = get()
        if (!state.activeRefining.recipeId) return false

        // Находим рецепт
        const recipe = refiningRecipes.find(r => r.id === state.activeRefining.recipeId)
        if (!recipe) return false

        // Начисляем продукт: канон A2 — `addMaterialToStash` при известном каталожном id (см. a2-smelting-domain-scope)
        const mult = state.activeRefining.smeltingOutputMultiplier ?? 1
        const outputAmount = Math.max(
          0,
          Math.floor(recipe.output.amount * state.activeRefining.amount * mult)
        )
        const outKey = recipe.output.resource as ResourceKey
        const outCatalogId =
          recipe.stashOutputMaterialId ?? getGrantTargetMaterialId(outKey)
        if (outCatalogId) {
          state.addMaterialToStash(outCatalogId, outputAmount)
        } else {
          state.grantResourceKeyFromWorld(outKey, outputAmount)
        }

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

      offerGuildContract: (adventurer, tier, adventurerExtended) => {
        const state = get()
        const extended = adventurerExtended ?? convertToExtended(adventurer)
        const contracted = state.guild.contractedAdventurers
        if (contracted.some((c) => c.adventurerId === adventurer.id)) {
          return { success: false, reason: 'Уже есть контракт с этим искателем' }
        }

        const hist = state.guild.history.filter(
          (h) =>
            h.adventurerData?.id === adventurer.id || h.adventurerName === adventurer.name
        )
        const missionsCompleted = hist.length
        const successRate =
          missionsCompleted > 0
            ? Math.round((hist.filter((h) => h.success).length / missionsCompleted) * 100)
            : 0

        const gate = canOfferContract(
          tier,
          state.guild.level,
          contracted.length,
          missionsCompleted,
          successRate,
          state.resources.gold,
          state.guild.glory
        )
        if (!gate.can) return { success: false, reason: gate.reason }

        const req = CONTRACT_REQUIREMENTS[tier]
        if (!state.canAfford({ gold: req.requiredResources.gold })) {
          return { success: false, reason: 'Недостаточно золота' }
        }
        const gloryCost = req.requiredResources.glory ?? 0
        if (gloryCost > 0 && state.guild.glory < gloryCost) {
          return { success: false, reason: 'Недостаточно славы гильдии' }
        }

        state.spendResource('gold', req.requiredResources.gold)
        if (gloryCost > 0) {
          set((s) => ({
            guild: {
              ...s.guild,
              glory: Math.max(0, s.guild.glory - gloryCost),
            },
          }))
        }

        const newContract = createContract(extended, tier)
        set((s) => ({
          guild: {
            ...s.guild,
            contractedAdventurers: [...s.guild.contractedAdventurers, newContract],
          },
        }))
        return { success: true }
      },

      terminateGuildContract: (adventurerId: string) => {
        const state = get()
        const entry = state.guild.contractedAdventurers.find((c) => c.adventurerId === adventurerId)
        if (!entry) {
          return { success: false, reason: 'Контракт не найден' }
        }
        if (state.guild.activeExpeditions.some((e) => e.adventurerId === adventurerId)) {
          return { success: false, reason: 'Искатель в экспедиции — дождитесь завершения миссии' }
        }
        const { penalty } = terminateContract(entry, 'По инициативе гильдии')
        if (!state.canAfford({ gold: penalty.gold })) {
          return { success: false, reason: 'Недостаточно золота для штрафа за расторжение' }
        }
        if (penalty.glory > 0 && state.guild.glory < penalty.glory) {
          return { success: false, reason: 'Недостаточно славы гильдии для штрафа' }
        }
        state.spendResource('gold', penalty.gold)
        set((s) => ({
          guild: {
            ...s.guild,
            glory: Math.max(0, s.guild.glory - penalty.glory),
            contractedAdventurers: s.guild.contractedAdventurers.filter(
              (c) => c.adventurerId !== adventurerId
            ),
          },
        }))
        return { success: true }
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
            weapons: s.weaponInventory.weapons.map((w) =>
              w.id === weaponId
                ? withRecalculatedPowerScore({
                    ...w,
                    enchantments: [
                      ...(w.enchantments || []),
                      { id: generateId(), enchantmentId, appliedAt: Date.now() },
                    ],
                  })
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
            weapons: s.weaponInventory.weapons.map((w) =>
              w.id === weaponId
                ? withRecalculatedPowerScore({
                    ...w,
                    enchantments: w.enchantments?.filter((e) => e.enchantmentId !== enchantmentId),
                  })
                : w
            ),
          },
        }))

        return true
      },

      isEnchantmentUnlocked: (enchantmentId) => {
        return get().unlockedEnchantments.includes(enchantmentId)
      },

      addWarSoulToWeapon: (weaponId, points, durabilityLoss = 5, epicGain = 0.05, appendDamageTags) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        const newDurability = Math.max(0, weapon.currentDurability - durabilityLoss)
        const newEpicMultiplier = Math.min(5.0, weapon.epicMultiplier + epicGain)
        const extra = appendDamageTags?.length
          ? [...weapon.activeDamageTags, ...appendDamageTags]
          : weapon.activeDamageTags
        const repairCondition = appendDamageTags?.length ? 'needsProperRepair' : weapon.repairCondition

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map((w) =>
              w.id === weaponId
                ? withRecalculatedPowerScore({
                    ...w,
                    warSoul: Math.min(w.maxWarSoul ?? Infinity, w.warSoul + points),
                    currentDurability: newDurability,
                    epicMultiplier: newEpicMultiplier,
                    adventureCount: w.adventureCount + 1,
                    activeDamageTags: extra,
                    repairCondition,
                  })
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
        return canAffordRefiningStart(recipe, amount, state.resources, state.materialStash)
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
        if (amount <= 0) return
        set((s) => {
          const level = s.guild.level
          let newRep = s.guild.reputation + amount
          newRep = clampReputationToRankCap(level, newRep)
          return {
            guild: {
              ...s.guild,
              reputation: newRep,
              totalReputation: s.guild.totalReputation + amount,
            },
          }
        })
      },

      spendGuildReputation: (amount) => {
        if (amount <= 0) return false
        const state = get()
        if (state.guild.reputation < amount) return false
        set({
          guild: {
            ...state.guild,
            reputation: state.guild.reputation - amount,
          },
        })
        return true
      },

      guildRankUp: () => {
        const s = get()
        const level = s.guild.level
        if (level >= MAX_GUILD_LEVEL) return false
        const cost = getRankUpCost(level)
        if (cost <= 0 || s.guild.reputation < cost) return false
        const newLevel = level + 1
        const levelData = GUILD_LEVELS.find((l) => l.level === newLevel)
        set({
          guild: {
            ...s.guild,
            level: newLevel,
            reputation: s.guild.reputation - cost,
            maxKnownAdventurers: levelData?.maxKnownAdventurers ?? s.guild.maxKnownAdventurers,
          },
        })
        return true
      },

      devAdjustGuildLevel: (delta: number) => {
        if (delta === 0) return
        const s = get()
        const next = Math.max(1, Math.min(MAX_GUILD_LEVEL, s.guild.level + delta))
        if (next === s.guild.level) return
        const levelData = GUILD_LEVELS.find((l) => l.level === next)
        set({
          guild: {
            ...s.guild,
            level: next,
            reputation: 0,
            maxKnownAdventurers: levelData?.maxKnownAdventurers ?? s.guild.maxKnownAdventurers,
          },
        })
      },

      purchaseIntendantOffer: (offerId) => {
        const offer = getIntendantOfferById(offerId)
        if (!offer) return { success: false, reason: 'unknown_offer' }
        const state = get()
        if (state.guild.level < offer.minGuildLevel) {
          return { success: false, reason: 'guild_level' }
        }
        if (offer.kind === 'repair_technique') {
          if (state.unlockedRepairTechniqueIds.includes(offer.targetId)) {
            return { success: false, reason: 'already_unlocked' }
          }
          if (state.guild.reputation < offer.costReputation) {
            return { success: false, reason: 'reputation' }
          }
          const spent = get().spendGuildReputation(offer.costReputation)
          if (!spent) return { success: false, reason: 'reputation' }
          set((s) => ({
            unlockedRepairTechniqueIds: [...s.unlockedRepairTechniqueIds, offer.targetId],
          }))
          return { success: true }
        }
        if (offer.kind === 'craft_technique') {
          if (state.unlockedCraftTechniqueIds.includes(offer.targetId)) {
            return { success: false, reason: 'already_unlocked' }
          }
          if (state.guild.reputation < offer.costReputation) {
            return { success: false, reason: 'reputation' }
          }
          const spent = get().spendGuildReputation(offer.costReputation)
          if (!spent) return { success: false, reason: 'reputation' }
          set((s) => ({
            unlockedCraftTechniqueIds: [...s.unlockedCraftTechniqueIds, offer.targetId],
          }))
          return { success: true }
        }
        if (offer.kind === 'reforge_technique') {
          const tech = getReforgeTechniqueById(offer.targetId)
          if (!tech) return { success: false, reason: 'unknown_offer' }
          const reforgeCtx = {
            guildLevel: state.guild.level,
            playerLevel: state.player.level,
            unlockedMaterialProcessingTechniqueIds: state.unlockedMaterialProcessingTechniqueIds,
            unlockedReforgeTechniqueIds: state.unlockedReforgeTechniqueIds,
          }
          if (isReforgeTechniqueUnlocked(tech, reforgeCtx)) {
            return { success: false, reason: 'already_unlocked' }
          }
          if (state.guild.reputation < offer.costReputation) {
            return { success: false, reason: 'reputation' }
          }
          const spent = get().spendGuildReputation(offer.costReputation)
          if (!spent) return { success: false, reason: 'reputation' }
          set((s) => ({
            unlockedReforgeTechniqueIds: [...s.unlockedReforgeTechniqueIds, offer.targetId],
          }))
          return { success: true }
        }
        const already =
          offer.kind === 'weapon_recipe'
            ? state.unlockedRecipes.weaponRecipes.includes(offer.targetId)
            : state.unlockedRecipes.refiningRecipes.includes(offer.targetId)
        if (already) return { success: false, reason: 'already_unlocked' }
        if (state.guild.reputation < offer.costReputation) {
          return { success: false, reason: 'reputation' }
        }
        const spent = get().spendGuildReputation(offer.costReputation)
        if (!spent) return { success: false, reason: 'reputation' }
        const unlocked = get().unlockRecipe(offer.targetId, 'guild_intendant')
        if (!unlocked) {
          set((st) => ({
            guild: {
              ...st.guild,
              reputation: st.guild.reputation + offer.costReputation,
            },
          }))
          return { success: false, reason: 'unlock_failed' }
        }
        return { success: true }
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

      calculateExpedition: (adventurer, expedition, weapon, contractType = 'exploration') => {
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
          weapon.quality,
          contractType
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

      navigateToForgeTab: (tab) =>
        tab === 'repair' || tab === 'reforge'
          ? set({
              currentScreen: 'forge',
              forgeTabRequest: 'bench',
              forgeMainTab: 'bench',
              forgeBenchSubTab: tab,
            })
          : set({ currentScreen: 'forge', forgeTabRequest: tab, forgeMainTab: tab }),

      clearForgeTabRequest: () => set({ forgeTabRequest: null }),

      setGuildScreenTab: (tab: GuildScreenTab) => set({ guildScreenTab: tab }),

      navigateToGuildIntendantRepairTechnique: (repairTechniqueId: string) => {
        const offer = getIntendantRepairTechniqueOffer(repairTechniqueId)
        if (!offer) return
        set({
          currentScreen: 'guild',
          guildScreenTab: 'intendant',
          intendantRepairTechniqueFocusId: repairTechniqueId,
        })
      },

      clearIntendantRepairTechniqueFocus: () => set({ intendantRepairTechniqueFocusId: null }),

      navigateToGuildIntendantReforgeTechnique: (reforgeTechniqueId: string) => {
        const offer = getIntendantReforgeTechniqueOffer(reforgeTechniqueId)
        if (!offer) return
        set({
          currentScreen: 'guild',
          guildScreenTab: 'intendant',
          intendantReforgeTechniqueFocusId: reforgeTechniqueId,
        })
      },

      clearIntendantReforgeTechniqueFocus: () => set({ intendantReforgeTechniqueFocusId: null }),

      navigateToGuildForgottenForgeSpecialQuest: () =>
        set((s) => ({
          currentScreen: 'guild',
          guildScreenTab: 'expeditions',
          guildExpeditionsSpecialTabNonce: (s.guildExpeditionsSpecialTabNonce ?? 0) + 1,
        })),

      setForgeMainTab: (tab) =>
        tab === 'repair' || tab === 'reforge'
          ? set({ forgeMainTab: 'bench', forgeBenchSubTab: tab })
          : set({ forgeMainTab: tab }),

      setAltarBuiltInForge: (built: boolean) => set({ altarBuiltInForge: built }),

      startAltarConstructionPhase: (phase: AltarPhase) => {
        const state = get()
        if (
          !canStartAltarPhase({
            phase,
            materialStash: state.materialStash,
            unlockedCraftTechniqueIds: state.unlockedCraftTechniqueIds,
            unlockedMaterialProcessingTechniqueIds: state.unlockedMaterialProcessingTechniqueIds,
            construction: state.altarConstruction,
          })
        ) {
          return false
        }
        const nextStash = consumeMaterialsForAltarPhase(
          phase,
          state.materialStash,
          state.materialStashQuestItemIds
        )
        if (!nextStash) return false
        const cfg = getAltarPhaseConfig(phase)
        const now = Date.now()
        set({
          materialStash: nextStash,
          altarConstruction: {
            ...state.altarConstruction,
            altarUnlocked: state.altarUnlockedByForgottenForgeQuest,
            altarBuilt: state.altarBuiltInForge,
            activePhase: phase,
            activePhaseStartTime: now,
            activePhaseStageIndex: 0,
            activePhaseStageStartTime: now,
            activePhaseStages: cfg.stages.map((s) => ({ ...s })),
          },
        })
        return true
      },

      cancelAltarConstructionPhase: () => {
        const state = get()
        if (state.altarConstruction.activePhase == null) return
        set({
          altarConstruction: {
            ...state.altarConstruction,
            activePhase: null,
            activePhaseStartTime: 0,
            activePhaseStageIndex: 0,
            activePhaseStageStartTime: 0,
            activePhaseStages: [],
          },
        })
      },

      updateAltarConstructionProgress: (nowMs = Date.now()) => {
        const state = get()
        const tick = computeAltarConstructionTick(state.altarConstruction, nowMs)
        if (tick.kind === 'noop') return
        if (tick.kind === 'update') {
          set({
            altarConstruction: {
              ...state.altarConstruction,
              ...tick.patch,
            },
          })
          return
        }
        const { phase, constructionAfter } = tick
        set({
          altarConstruction: {
            ...constructionAfter,
            altarUnlocked: state.altarUnlockedByForgottenForgeQuest,
            altarBuilt: state.altarBuiltInForge,
          },
        })
        queueMicrotask(() => {
          gameEvents.emit('altar:phaseCompleted', { phase })
        })
      },

      devAltarConstructionSkipToNextStage: () => {
        const state = get()
        const ac = state.altarConstruction
        if (ac.activePhase == null || ac.activePhaseStages.length === 0) return
        const idx = ac.activePhaseStageIndex
        const last = ac.activePhaseStages.length - 1
        if (idx < last) {
          set({
            altarConstruction: {
              ...ac,
              activePhaseStageIndex: idx + 1,
              activePhaseStageStartTime: Date.now(),
            },
          })
          return
        }
        get().devAltarConstructionCompleteActivePhase()
      },

      devAltarConstructionCompleteActivePhase: () => {
        const state = get()
        const ac = state.altarConstruction
        const phase = ac.activePhase
        const next = altarConstructionStateAfterPhaseComplete(ac)
        if (next == null || phase == null) return
        set({
          altarConstruction: {
            ...next,
            altarUnlocked: state.altarUnlockedByForgottenForgeQuest,
            altarBuilt: state.altarBuiltInForge,
          },
        })
        queueMicrotask(() => {
          gameEvents.emit('altar:phaseCompleted', { phase })
        })
      },

      setWorkbenchBarBaseline: (baseline) => set({ workbenchBarBaseline: baseline }),

      applyReforgeTechnique: (weaponId, techniqueId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find((w) => w.id === weaponId)
        if (!weapon) return { ok: false, reason: 'no_weapon' }
        const technique = getReforgeTechniqueById(techniqueId)
        const catalogDebit =
          technique != null ? buildReforgeCatalogMaterialDebit(technique) : {}
        if (
          Object.keys(catalogDebit).length > 0 &&
          !get().canDebitManyFromStash(catalogDebit)
        ) {
          return { ok: false, reason: 'insufficient_catalog_materials' }
        }
        const result = applyReforgeTechniquePure(weapon, techniqueId, {
          guildLevel: state.guild.level,
          playerLevel: state.player.level,
          unlockedMaterialProcessingTechniqueIds: state.unlockedMaterialProcessingTechniqueIds,
          unlockedReforgeTechniqueIds: state.unlockedReforgeTechniqueIds,
        }, Math.random)
        if (!result.ok) return result
        if (Object.keys(catalogDebit).length > 0 && !get().tryDebitManyFromStash(catalogDebit)) {
          return { ok: false, reason: 'insufficient_catalog_materials' }
        }
        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map((w) =>
              w.id === weaponId ? withRecalculatedPowerScore(result.weapon) : w
            ),
          },
        }))
        return result
      },

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
          materialStash: {} as Record<string, number>,
          materialStashQuestItemIds: [],
          workers: [],
          buildings: initialBuildings,
          weaponInventory: initialWeaponInventory,
          repairBenchTechniqueDraft: null,
          workbenchQueue: [],
          workbenchSelectedWeaponId: null,
          workbenchQueueAdvanceBlocked: false,
          repairTechniqueStageRun: null,
          unlockedRecipes: initialUnlockedRecipes,
          recipeSources: [],
          unlockedEnchantments: [],
          unlockedMaterialProcessingTechniqueIds: [],
          unlockedRepairTechniqueIds: [],
          unlockedCraftTechniqueIds: [],
          unlockedReforgeTechniqueIds: [],
          guild: initialGuildState,
          knownAdventurers: [],
          orders: initialOrdersState.orders,
          tutorial: initialTutorialState,
          statistics: initialStatistics,
          activeRefining: initialActiveRefining,
          craftV2Persisted: initialCraftV2Persisted,
          forgeTabRequest: null,
          forgeMainTab: 'craft',
          forgeBenchSubTab: 'repair',
          workbenchBarBaseline: null,
          altarUnlockedByForgottenForgeQuest: false,
          altarBuiltInForge: false,
          altarConstruction: { ...initialAltarConstructionState },
          guildScreenTab: 'orders',
          intendantRepairTechniqueFocusId: null,
          intendantReforgeTechniqueFocusId: null,
          guildExpeditionsSpecialTabNonce: 0,
          ...initialEncyclopediaState,
          ...initialForgottenForgeQuestSlice,
          ...defaultInventoryFilterState,
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
      materialStash: state.materialStash,
      materialStashQuestItemIds: state.materialStashQuestItemIds,
      statistics: state.statistics,
      workers: state.workers,
      buildings: state.buildings,
      maxWorkers: state.maxWorkers,
      repairQueuePlan: state.workbenchQueue,
      repairTechniqueStageRun: state.repairTechniqueStageRun,
      weaponInventory: state.weaponInventory,
      unlockedRecipes: state.unlockedRecipes,
      recipeSources: state.recipeSources,
      unlockedEnchantments: state.unlockedEnchantments,
      unlockedMaterialProcessingTechniqueIds: state.unlockedMaterialProcessingTechniqueIds,
      unlockedRepairTechniqueIds: state.unlockedRepairTechniqueIds,
      unlockedCraftTechniqueIds: state.unlockedCraftTechniqueIds,
      unlockedReforgeTechniqueIds: state.unlockedReforgeTechniqueIds,
      inventorySortBy: state.inventorySortBy,
      inventoryFilterQuality: state.inventoryFilterQuality,
      inventoryFilterDamage: state.inventoryFilterDamage,
      guild: state.guild,
      knownAdventurers: state.knownAdventurers,
      orders: state.orders,
      activeOrderId: state.activeOrderId,
      tutorial: state.tutorial,
      currentScreen: state.currentScreen,
      forgeMainTab: state.forgeMainTab,
      forgeBenchSubTab: state.forgeBenchSubTab,
      craftV2Persisted: state.craftV2Persisted,
      activeRefining: state.activeRefining,
      shouldPurchaseMaterials: state.shouldPurchaseMaterials,
      materialKnowledge: state.materialKnowledge,
      materialStudySessions: state.materialStudySessions,
      lastEncyclopediaTab: state.lastEncyclopediaTab,
      lastEncyclopediaTechniqueKindTab: state.lastEncyclopediaTechniqueKindTab,
      gameMessages: state.gameMessages,
      forgottenForgeQuest: state.forgottenForgeQuest,
      forgottenForgePhase: state.forgottenForgePhase,
      archivistDialogue: state.archivistDialogue,
      archivistPendingChoices: state.archivistPendingChoices,
      archivistForgottenForgeTaskBannerAfterEntryId: state.archivistForgottenForgeTaskBannerAfterEntryId ?? null,
      altarUnlockedByForgottenForgeQuest: state.altarUnlockedByForgottenForgeQuest,
      altarBuiltInForge: state.altarBuiltInForge,
      altarConstruction: state.altarConstruction,
      messagesDockEncyclopediaReadUpToTs: state.messagesDockEncyclopediaReadUpToTs,
      messagesDockArchivistReadUpToTs: state.messagesDockArchivistReadUpToTs,
    }),
    migrate: (persistedState, oldVersion) => {
      if (
        !persistedState ||
        typeof persistedState !== 'object' ||
        Array.isArray(persistedState)
      ) {
        return persistedState
      }
      const p = persistedState as Record<string, unknown>
      if (oldVersion < 4) {
        const resources = {
          ...initialResources,
          ...((p.resources as Partial<Resources> | undefined) ?? {}),
        }
        const stash =
          p.materialStash != null && typeof p.materialStash === 'object' && !Array.isArray(p.materialStash)
            ? { ...(p.materialStash as Record<string, number>) }
            : {}
        const m = migrateLegacyMaterialResourcesToStash(resources, stash)
        return { ...p, resources: m.resources, materialStash: m.materialStash }
      }
      if (oldVersion < 5) {
        const next = { ...p } as Record<string, unknown>
        const ur = next['unlockedRecipes'] as { weaponRecipes?: string[] } | undefined
        if (ur?.weaponRecipes) {
          next['unlockedRecipes'] = {
            ...ur,
            weaponRecipes: migrateUnlockedWeaponRecipeIds(ur.weaponRecipes),
          }
        }
        const craftV2 = next['craftV2Persisted'] as Record<string, unknown> | undefined
        if (craftV2 && typeof craftV2 === 'object') {
          const plan = migrateCraftPlanForgeMaterials(
            migrateCraftPlanRecipeId((craftV2['plan'] as CraftPlan | null) ?? null)
          )
          const activeCraft = migrateActiveCraftForgeMaterials(
            migrateActiveCraftV2RecipeId((craftV2['activeCraft'] as ActiveCraftV2 | null) ?? null)
          )
          next['craftV2Persisted'] = { ...craftV2, plan, activeCraft }
        }
        const inv = next['weaponInventory'] as { weapons?: CraftedWeaponV2[] } | undefined
        if (inv?.weapons?.length) {
          next['weaponInventory'] = {
            ...inv,
            weapons: inv.weapons.map(w =>
              migrateCraftedWeaponForgeMaterials(migrateCraftedWeaponV2RecipeId(w))
            ),
          }
        }
        return next
      }
      if (oldVersion < 6) {
        const next = { ...p } as Record<string, unknown>
        const craftV2 = next['craftV2Persisted'] as Record<string, unknown> | undefined
        if (craftV2 && typeof craftV2 === 'object') {
          const plan = migrateCraftPlanForgeMaterials((craftV2['plan'] as CraftPlan | null) ?? null)
          const activeCraft = migrateActiveCraftForgeMaterials(
            (craftV2['activeCraft'] as ActiveCraftV2 | null) ?? null
          )
          next['craftV2Persisted'] = { ...craftV2, plan, activeCraft }
        }
        const inv = next['weaponInventory'] as { weapons?: CraftedWeaponV2[] } | undefined
        if (inv?.weapons?.length) {
          next['weaponInventory'] = {
            ...inv,
            weapons: inv.weapons.map(migrateCraftedWeaponForgeMaterials),
          }
        }
        return next
      }
      if (oldVersion < 7) {
        const next = { ...p } as Record<string, unknown>
        if (!Array.isArray(next['materialStudySessions'])) next['materialStudySessions'] = []
        if (!Array.isArray(next['gameMessages'])) next['gameMessages'] = []
        const tut = next['tutorial'] as Record<string, unknown> | undefined
        if (tut && typeof tut === 'object' && !('starterForgeExpertiseGranted' in tut)) {
          next['tutorial'] = { ...tut, starterForgeExpertiseGranted: true }
        }
        return next
      }
      if (oldVersion < 8) {
        const next = { ...p } as Record<string, unknown>
        if (!Array.isArray(next['unlockedMaterialProcessingTechniqueIds'])) {
          next['unlockedMaterialProcessingTechniqueIds'] = []
        }
        return next
      }
      if (oldVersion < 9) {
        const next = { ...p } as Record<string, unknown>
        const g = next['guild'] as Record<string, unknown> | undefined
        if (g && typeof g === 'object' && !Array.isArray(g['contractedAdventurers'])) {
          next['guild'] = { ...g, contractedAdventurers: [] }
        }
        return next
      }
      if (oldVersion < 10) {
        const next = { ...p } as Record<string, unknown>
        const inv = next['weaponInventory'] as { weapons?: CraftedWeaponV2[] } | undefined
        if (inv?.weapons?.length) {
          next['weaponInventory'] = {
            ...inv,
            weapons: inv.weapons.map(migrateCraftedWeaponV2DamageFields),
          }
        }
        const guildRaw = next['guild'] as GuildState | undefined
        if (guildRaw && typeof guildRaw === 'object') {
          next['guild'] = {
            ...guildRaw,
            activeExpeditions: Array.isArray(guildRaw.activeExpeditions)
              ? guildRaw.activeExpeditions.map((e) => ({
                  ...e,
                  weaponData: migrateCraftedWeaponV2DamageFields(e.weaponData),
                }))
              : [],
            recoveryQuests: Array.isArray(guildRaw.recoveryQuests)
              ? guildRaw.recoveryQuests.map((q) => ({
                  ...q,
                  lostWeaponData: migrateCraftedWeaponV2DamageFields(q.lostWeaponData),
                }))
              : [],
          }
        }
        const craftV2 = next['craftV2Persisted'] as
          | { completedWeapon?: CraftedWeaponV2 | null }
          | undefined
        if (craftV2 && typeof craftV2 === 'object' && craftV2.completedWeapon) {
          next['craftV2Persisted'] = {
            ...craftV2,
            completedWeapon: migrateCraftedWeaponV2DamageFields(craftV2.completedWeapon),
          }
        }
        return next
      }
      if (oldVersion < 17) {
        const next = { ...p } as Record<string, unknown>
        const blueprint = next['altarUnlockedByForgottenForgeQuest'] === true
        if (typeof next['altarBuiltInForge'] !== 'boolean') {
          next['altarBuiltInForge'] = blueprint
        }
        return next
      }
      if (oldVersion < 18) {
        const next = { ...p } as Record<string, unknown>
        const g = next['guild'] as GuildState | undefined
        if (g && typeof g === 'object') {
          next['guild'] = migrateGuildReputationTierFromLegacy(g)
        }
        return next
      }
      if (oldVersion < 19) {
        const next = { ...p } as Record<string, unknown>
        if (!Array.isArray(next['unlockedRepairTechniqueIds'])) {
          next['unlockedRepairTechniqueIds'] = []
        }
        return next
      }
      if (oldVersion < 20) {
        const next = { ...p } as Record<string, unknown>
        if (!Array.isArray(next['unlockedReforgeTechniqueIds'])) {
          next['unlockedReforgeTechniqueIds'] = []
        }
        return next
      }
      if (oldVersion < 21) {
        const next = { ...p } as Record<string, unknown>
        if (typeof next['messagesDockEncyclopediaReadUpToTs'] !== 'number') {
          next['messagesDockEncyclopediaReadUpToTs'] = 0
        }
        if (typeof next['messagesDockArchivistReadUpToTs'] !== 'number') {
          next['messagesDockArchivistReadUpToTs'] = 0
        }
        return next
      }
      if (oldVersion < 22) {
        const next = { ...p } as Record<string, unknown>
        if (!Array.isArray(next['unlockedCraftTechniqueIds'])) {
          next['unlockedCraftTechniqueIds'] = []
        }
        return next
      }
      if (oldVersion < 23) {
        const next = { ...p } as Record<string, unknown>
        if (!Array.isArray(next['repairBenchWeaponIds'])) {
          next['repairBenchWeaponIds'] = []
        }
        if (typeof next['repairBenchSelectedWeaponId'] !== 'string') {
          next['repairBenchSelectedWeaponId'] = null
        }
        if (!Array.isArray(next['repairQueuePlan'])) {
          next['repairQueuePlan'] = []
        }
        return next
      }
      if (oldVersion < 24) {
        const next = { ...p } as Record<string, unknown>
        const raw = next['repairQueuePlan']
        next['repairQueuePlan'] = normalizeWorkbenchQueueFromSave(Array.isArray(raw) ? raw : [])
        next['repairBenchWeaponIds'] = []
        next['repairBenchSelectedWeaponId'] = null
        return next
      }
      if (oldVersion < 25) {
        const next = { ...p } as Record<string, unknown>
        const fm = next['forgeMainTab']
        if (fm === 'repair' || fm === 'reforge') {
          next['forgeBenchSubTab'] = fm
          next['forgeMainTab'] = 'bench'
        }
        if (next['forgeBenchSubTab'] !== 'repair' && next['forgeBenchSubTab'] !== 'reforge') {
          next['forgeBenchSubTab'] = 'repair'
        }
        return next
      }
      if (oldVersion < 26) {
        const next = { ...p } as Record<string, unknown>
        normalizeInventoryFilterFromMerged(next)
        return next
      }
      if (oldVersion < 27) {
        const next = { ...p } as Record<string, unknown>
        delete next['repairBenchWeaponIds']
        delete next['repairBenchSelectedWeaponId']
        delete next['repairBenchWeaponId']
        return next
      }
      if (oldVersion < 30) {
        const next = { ...p } as Record<string, unknown>
        const resources = {
          ...initialResources,
          ...((next.resources as Partial<Resources> | undefined) ?? {}),
        }
        const stash =
          next.materialStash != null && typeof next.materialStash === 'object' && !Array.isArray(next.materialStash)
            ? { ...(next.materialStash as Record<string, number>) }
            : {}
        const m = migrateLegacyMaterialResourcesToStash(resources, stash)
        return { ...next, resources: m.resources, materialStash: m.materialStash }
      }
      if (oldVersion < 31) {
        const next = { ...p } as Record<string, unknown>
        const resources = {
          ...initialResources,
          ...((next.resources as Partial<Resources> | undefined) ?? {}),
        }
        const stash =
          next.materialStash != null && typeof next.materialStash === 'object' && !Array.isArray(next.materialStash)
            ? { ...(next.materialStash as Record<string, number>) }
            : {}
        const m = migrateLegacyMaterialResourcesToStash(resources, stash)
        return { ...next, resources: m.resources, materialStash: m.materialStash }
      }
      if (oldVersion < 32) {
        const next = { ...p } as Record<string, unknown>
        const t = next.lastEncyclopediaTab
        if (t !== 'materials' && t !== 'techniques') {
          next.lastEncyclopediaTab = 'materials'
        }
        return next
      }
      if (oldVersion < 33) {
        const next = { ...p } as Record<string, unknown>
        const k = next.lastEncyclopediaTechniqueKindTab
        if (!isEncyclopediaTechniqueKindTab(k)) {
          next.lastEncyclopediaTechniqueKindTab = DEFAULT_TECHNIQUE_KIND_TAB
        }
        return next
      }
      return persistedState
    },
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
      const weapons = (merged as { weaponInventory?: { weapons?: { id?: string }[] } })
        .weaponInventory?.weapons ?? []
      const benchIds = normalizeRepairBenchWeaponIdsFromSave(
        (merged as { repairBenchWeaponIds?: unknown }).repairBenchWeaponIds,
        (merged as { repairBenchWeaponId?: unknown }).repairBenchWeaponId,
        weapons
      )
      const rawWorkbenchQueue = (merged as { repairQueuePlan?: unknown }).repairQueuePlan
      let workbenchQueueNormalized = normalizeWorkbenchQueueFromSave(
        Array.isArray(rawWorkbenchQueue) ? rawWorkbenchQueue : []
      )
      const migrated = appendRepairQueueItemsFromLegacyBenchIds({
        benchIds,
        queue: workbenchQueueNormalized,
      })
      if (migrated.addedCount > 0) {
        workbenchQueueNormalized = migrated.queue
      }
      ;(merged as { workbenchQueue: typeof workbenchQueueNormalized }).workbenchQueue =
        workbenchQueueNormalized
      delete (merged as Record<string, unknown>)['repairQueuePlan']
      normalizeInventoryFilterFromMerged(merged as Record<string, unknown>)
      const legacyWorkbenchSelected = normalizeRepairBenchSelectedWeaponIdFromSave(
        (merged as { repairBenchSelectedWeaponId?: unknown }).repairBenchSelectedWeaponId,
        benchIds
      )
      if (
        (merged as { workbenchSelectedWeaponId?: string | null }).workbenchSelectedWeaponId == null &&
        legacyWorkbenchSelected
      ) {
        ;(merged as { workbenchSelectedWeaponId: string | null }).workbenchSelectedWeaponId =
          legacyWorkbenchSelected
      }
      delete (merged as Record<string, unknown>)['repairBenchWeaponIds']
      delete (merged as Record<string, unknown>)['repairBenchSelectedWeaponId']
      delete (merged as Record<string, unknown>)['repairBenchWeaponId']
      ;(merged as { repairTechniqueStageRun: RepairTechniqueStageRunState | null }).repairTechniqueStageRun =
        normalizeRepairTechniqueStageRunFromSave(
          (merged as { repairTechniqueStageRun?: unknown }).repairTechniqueStageRun,
          weapons,
          workbenchQueueNormalized
        )
      merged.guild = {
        ...currentState.guild,
        ...(persisted.guild ?? {}),
      }
      if (!Array.isArray(merged.guild.contractedAdventurers)) {
        merged.guild.contractedAdventurers = []
      }
      merged.statistics = {
        ...initialStatistics,
        ...((persisted.statistics as Partial<GameStatistics> | undefined) ?? {}),
      }
      if (
        !('materialStash' in merged) ||
        merged.materialStash == null ||
        typeof merged.materialStash !== 'object'
      ) {
        ;(merged as { materialStash: Record<string, number> }).materialStash = {}
      }
      const stashQuest = (merged as { materialStashQuestItemIds?: unknown }).materialStashQuestItemIds
      if (!Array.isArray(stashQuest)) {
        ;(merged as { materialStashQuestItemIds: string[] }).materialStashQuestItemIds = []
      } else {
        const seen = new Set<string>()
        const dedup: string[] = []
        for (const x of stashQuest) {
          if (typeof x === 'string' && x.length > 0 && !seen.has(x)) {
            seen.add(x)
            dedup.push(x)
          }
        }
        ;(merged as { materialStashQuestItemIds: string[] }).materialStashQuestItemIds = dedup
      }
      // P2-Craft-04: убрано поле slice activeCraft; старые persist-файлы могли содержать ключ
      if ('activeCraft' in (merged as Record<string, unknown>)) {
        delete (merged as Record<string, unknown>)['activeCraft']
      }
      if (!Array.isArray((merged as { materialStudySessions?: unknown }).materialStudySessions)) {
        ;(merged as { materialStudySessions: unknown[] }).materialStudySessions = []
      }
      ;(merged as { materialStudySessions: MaterialStudySession[] }).materialStudySessions =
        normalizeMaterialStudySessionsFromSave(
          (merged as { materialStudySessions: unknown[] }).materialStudySessions
        )
      if (!Array.isArray((merged as { gameMessages?: unknown }).gameMessages)) {
        ;(merged as { gameMessages: unknown[] }).gameMessages = []
      }
      const encTab = (merged as { lastEncyclopediaTab?: unknown }).lastEncyclopediaTab
      if (encTab !== 'materials' && encTab !== 'techniques') {
        ;(merged as { lastEncyclopediaTab: 'materials' | 'techniques' }).lastEncyclopediaTab =
          'materials'
      }
      const encKindTab = (merged as { lastEncyclopediaTechniqueKindTab?: unknown })
        .lastEncyclopediaTechniqueKindTab
      if (!isEncyclopediaTechniqueKindTab(encKindTab)) {
        ;(merged as { lastEncyclopediaTechniqueKindTab: typeof DEFAULT_TECHNIQUE_KIND_TAB }).lastEncyclopediaTechniqueKindTab =
          DEFAULT_TECHNIQUE_KIND_TAB
      }
      ;(merged as { encyclopediaFocusTechniqueRef: null }).encyclopediaFocusTechniqueRef = null
      ;(merged as { encyclopediaFocusMaterialId: null }).encyclopediaFocusMaterialId = null
      if (
        !Array.isArray(
          (merged as { unlockedMaterialProcessingTechniqueIds?: unknown }).unlockedMaterialProcessingTechniqueIds
        )
      ) {
        ;(merged as { unlockedMaterialProcessingTechniqueIds: string[] }).unlockedMaterialProcessingTechniqueIds =
          []
      }
      if (!Array.isArray((merged as { unlockedRepairTechniqueIds?: unknown }).unlockedRepairTechniqueIds)) {
        ;(merged as { unlockedRepairTechniqueIds: string[] }).unlockedRepairTechniqueIds = []
      }
      if (!Array.isArray((merged as { unlockedCraftTechniqueIds?: unknown }).unlockedCraftTechniqueIds)) {
        ;(merged as { unlockedCraftTechniqueIds: string[] }).unlockedCraftTechniqueIds = []
      }
      if (!Array.isArray((merged as { unlockedReforgeTechniqueIds?: unknown }).unlockedReforgeTechniqueIds)) {
        ;(merged as { unlockedReforgeTechniqueIds: string[] }).unlockedReforgeTechniqueIds = []
      }
      const tutMerged = (merged as { tutorial?: typeof initialTutorialState }).tutorial
      merged.tutorial = {
        ...initialTutorialState,
        ...(tutMerged ?? {}),
        starterForgeExpertiseGranted:
          tutMerged?.starterForgeExpertiseGranted ?? initialTutorialState.starterForgeExpertiseGranted,
        weaponRepairGuidanceConsumed:
          tutMerged?.weaponRepairGuidanceConsumed ??
          initialTutorialState.weaponRepairGuidanceConsumed,
        weaponRepairGuidancePending: false,
      }
      ;(merged as { activeRefining: typeof initialActiveRefining }).activeRefining =
        mergeActiveRefiningFromSave(persisted.activeRefining)
      // Фаза 6 (аудит материалов): любой материал на складе без записи в ENC получает открытие при загрузке
      const stash = (merged as { materialStash: Record<string, number> }).materialStash
      const mk: Record<string, MaterialKnowledge> = {
        ...(merged as { materialKnowledge?: Record<string, MaterialKnowledge> }).materialKnowledge ?? {},
      }
      for (const [mid, qty] of Object.entries(stash)) {
        if ((qty ?? 0) > 0 && !mk[mid]) {
          mk[mid] = createDiscoveredMaterialKnowledge(mid)
        }
      }
      ;(merged as { materialKnowledge: Record<string, MaterialKnowledge> }).materialKnowledge = mk
      normalizeWeaponDamageInMergedState(merged as Parameters<typeof normalizeWeaponDamageInMergedState>[0])
      const invPower = (merged as { weaponInventory?: WeaponInventory }).weaponInventory
      if (invPower?.weapons?.length) {
        ;(merged as { weaponInventory: WeaponInventory }).weaponInventory = {
          ...invPower,
          weapons: invPower.weapons.map((w) => withRecalculatedPowerScore(w)),
        }
      }
      const m = merged as {
        forgeMainTab?: ForgeMainTab | 'shop' | 'repair' | 'reforge'
        forgeBenchSubTab?: ForgeBenchSubTab
      }
      if (m.forgeMainTab == null) m.forgeMainTab = 'craft'
      if (m.forgeMainTab === 'shop') m.forgeMainTab = 'craft'
      if (m.forgeMainTab === 'repair' || m.forgeMainTab === 'reforge') {
        m.forgeBenchSubTab = m.forgeMainTab
        m.forgeMainTab = 'bench'
      }
      if (m.forgeMainTab === 'bench') {
        if (m.forgeBenchSubTab !== 'repair' && m.forgeBenchSubTab !== 'reforge') {
          m.forgeBenchSubTab = 'repair'
        }
      } else if (m.forgeBenchSubTab !== 'repair' && m.forgeBenchSubTab !== 'reforge') {
        m.forgeBenchSubTab = 'repair'
      }
      ;(merged as { forgeBenchSubTab: ForgeBenchSubTab }).forgeBenchSubTab =
        m.forgeBenchSubTab ?? 'repair'
      const ff = merged as {
        forgottenForgeQuest?: ForgottenForgeQuestState
        forgottenForgePhase?: string
        archivistDialogue?: { thread?: unknown[] }
        archivistPendingChoices?: unknown
        altarUnlockedByForgottenForgeQuest?: boolean
        altarBuiltInForge?: boolean
      }
      if (!ff.forgottenForgeQuest || typeof ff.forgottenForgeQuest !== 'object') {
        ff.forgottenForgeQuest = initialForgottenForgeQuestSlice.forgottenForgeQuest
      }
      {
        const fq = ff.forgottenForgeQuest
        if (typeof fq.waitingForCraftAfterPhase2 !== 'boolean') {
          fq.waitingForCraftAfterPhase2 = false
        }
        if (typeof fq.lastStepChangeAt !== 'number' || !Number.isFinite(fq.lastStepChangeAt)) {
          fq.lastStepChangeAt = null
        }
        if (typeof fq.step !== 'number' || !Number.isFinite(fq.step) || fq.step < 0) {
          fq.step = 0
        } else {
          fq.step = Math.min(FORGOTTEN_FORGE_QUEST_STEP_MAX, Math.floor(fq.step))
        }
      }
      if (ff.forgottenForgePhase == null) {
        ff.forgottenForgePhase = initialForgottenForgeQuestSlice.forgottenForgePhase
      }
      if (!ff.archivistDialogue?.thread || !Array.isArray(ff.archivistDialogue.thread)) {
        ff.archivistDialogue = initialForgottenForgeQuestSlice.archivistDialogue
      }
      if (ff.archivistPendingChoices !== null && ff.archivistPendingChoices !== undefined) {
        if (!Array.isArray(ff.archivistPendingChoices)) {
          ff.archivistPendingChoices = null
        }
      } else if (ff.archivistPendingChoices === undefined) {
        ff.archivistPendingChoices = null
      }
      if (typeof ff.altarUnlockedByForgottenForgeQuest !== 'boolean') {
        ff.altarUnlockedByForgottenForgeQuest = false
      }
      {
        const fqU = ff.forgottenForgeQuest
        if (
          ff.altarUnlockedByForgottenForgeQuest !== true &&
          fqU &&
          (fqU.status === 'completed' ||
            (fqU.status === 'active' && typeof fqU.step === 'number' && fqU.step >= 7))
        ) {
          ff.altarUnlockedByForgottenForgeQuest = true
        }
      }
      if (typeof ff.altarBuiltInForge !== 'boolean') {
        ff.altarBuiltInForge = false
      }
      const mdd = merged as {
        messagesDockEncyclopediaReadUpToTs?: number
        messagesDockArchivistReadUpToTs?: number
      }
      if (typeof mdd.messagesDockEncyclopediaReadUpToTs !== 'number') {
        mdd.messagesDockEncyclopediaReadUpToTs = 0
      }
      if (typeof mdd.messagesDockArchivistReadUpToTs !== 'number') {
        mdd.messagesDockArchivistReadUpToTs = 0
      }
      const bannerAnchor = merged as { archivistForgottenForgeTaskBannerAfterEntryId?: string | null }
      if (
        bannerAnchor.archivistForgottenForgeTaskBannerAfterEntryId != null &&
        typeof bannerAnchor.archivistForgottenForgeTaskBannerAfterEntryId !== 'string'
      ) {
        bannerAnchor.archivistForgottenForgeTaskBannerAfterEntryId = null
      }
      if (bannerAnchor.archivistForgottenForgeTaskBannerAfterEntryId === undefined) {
        bannerAnchor.archivistForgottenForgeTaskBannerAfterEntryId = null
      }
      ;(merged as { altarConstruction: AltarConstructionState }).altarConstruction =
        normalizeAltarConstructionFromSave(
          (merged as { altarConstruction?: unknown }).altarConstruction,
          {
            altarUnlocked: ff.altarUnlockedByForgottenForgeQuest === true,
            altarBuilt: ff.altarBuiltInForge === true,
          }
        )
      if ((m.forgeMainTab as string) === 'altar') {
        m.forgeMainTab = 'craft'
      }
      {
        const fq = ff.forgottenForgeQuest
        if (
          fq.status === 'completed' &&
          fq.step === 7 &&
          ff.altarBuiltInForge !== true
        ) {
          fq.status = 'active'
          fq.step = 8
          if (ff.forgottenForgePhase === 'completed') {
            ff.forgottenForgePhase = 'open'
          }
        }
        if (fq.status === 'completed' && fq.step === 7 && ff.altarBuiltInForge === true) {
          fq.step = 18
        }
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
  const materialStash = useGameStore((state) => state.materialStash)

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return Math.floor(num).toString()
  }

  const total = (key: keyof typeof resources) =>
    getAvailableAmountForResourceKey(resources, materialStash, key)

  return {
    ...resources,
    formatted: {
      gold: formatNumber(resources.gold),
      soulEssence: formatNumber(resources.soulEssence),
      wood: formatNumber(total('wood')),
      stone: formatNumber(total('stone')),
      iron: formatNumber(total('iron')),
      coal: formatNumber(total('coal')),
      copper: formatNumber(total('copper')),
      tin: formatNumber(total('tin')),
      silver: formatNumber(total('silver')),
      goldOre: formatNumber(total('goldOre')),
      mithril: formatNumber(total('mithril')),
      ironIngot: formatNumber(total('ironIngot')),
      copperIngot: formatNumber(total('copperIngot')),
      tinIngot: formatNumber(total('tinIngot')),
      bronzeIngot: formatNumber(total('bronzeIngot')),
      steelIngot: formatNumber(total('steelIngot')),
      silverIngot: formatNumber(total('silverIngot')),
      goldIngot: formatNumber(total('goldIngot')),
      mithrilIngot: formatNumber(total('mithrilIngot')),
      planks: formatNumber(total('planks')),
      stoneBlocks: formatNumber(total('stoneBlocks')),
      leather: formatNumber(total('leather')),
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
