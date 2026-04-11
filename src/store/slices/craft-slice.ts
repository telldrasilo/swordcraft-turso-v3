/**
 * Craft Slice
 * Управление крафтом оружия, переработкой и инвентарём
 * Использует craft-utils для бизнес-логики
 */

import type { StateCreator } from 'zustand'

// Импорт утилит
import { generateId } from '@/lib/store-utils/generators'
import {
  getQualityGrade,
  getQualityMultiplier,
} from '@/lib/store-utils/craft-utils'

// Импорт нового типа оружия
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'
import type { RefiningRecipe } from '@/data/refining-recipes'
import {
  createRepairWorkbenchQueueItem,
  createReforgeAwakenWorkbenchQueueItem,
  createReforgeBuffWorkbenchQueueItem,
  removeAllPlannedQueueItemsForWeapon,
  reorderPlannedWorkbenchQueueItems,
  type WorkbenchQueueItem,
  type WorkbenchQueueItemKind,
  type WorkbenchQueueItemStatus,
} from '@/lib/workbench/workbench-queue'
import { withRecalculatedPowerScore } from '@/lib/craft/weapon-power-score'

// ================================
// ТИПЫ
// ================================

export type {
  WorkbenchQueueItem,
  WorkbenchRepairQueueItem,
  WorkbenchReforgeAwakenQueueItem,
  WorkbenchReforgeBuffQueueItem,
  WorkbenchQueueItemKind,
  WorkbenchQueueItemStatus,
  RepairQueuePlanItem,
} from '@/lib/workbench/workbench-queue'

/** Тип оружия */
export type WeaponType = 'sword' | 'dagger' | 'axe' | 'mace' | 'spear' | 'hammer' | 'bow' | 'staff'

/** Тир оружия */
export type WeaponTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

/** Материал оружия */
export type WeaponMaterial = 'iron' | 'bronze' | 'steel' | 'silver' | 'gold' | 'mithril'

/** Градация качества */
export type QualityGrade = 'poor' | 'normal' | 'good' | 'excellent' | 'masterwork' | 'legendary'

/** Зачарование на оружии */
export interface WeaponEnchantment {
  id: string
  enchantmentId: string
  appliedAt: number
}

/** Активный крафт */
export interface ActiveCraft {
  recipeId: string | null
  weaponName: string
  progress: number
  startTime: number | null
  endTime: number | null
  quality: number
}

/** Активная переработка */
export interface ActiveRefining {
  recipeId: string | null
  resourceName: string
  progress: number
  startTime: number | null
  endTime: number | null
  amount: number
  /** Множитель выхода плавки по качеству шихты (семантика фазы C); по умолчанию 1 */
  smeltingOutputMultiplier?: number
}

/** Инвентарь оружия */
export interface WeaponInventory {
  weapons: CraftedWeaponV2[]
  maxSlots: number
  /** Трофеи (редкие ресурсы из контрактов v2.0) */
  trophies: Record<string, number>  // { 'boar_fang': 5, 'dragon_scale': 2 }
}

/** Разблокированные рецепты */
export interface UnlockedRecipes {
  weaponRecipes: string[]
  refiningRecipes: string[]
}

/** Источник получения рецепта */
export interface RecipeSource {
  recipeId: string
  source: 'purchase' | 'order' | 'expedition' | 'level' | 'guild_intendant'
  obtainedAt: number
}

/** Источник многоэтапного прогона: очередь ремонта или отдельная сессия на карточке */
export type RepairTechniqueStageRunSource = 'queue' | 'adhoc'

/** Активный таймер этапов ремонта по техникам (переживает смену вкладки кузницы) */
export interface RepairTechniqueStageRunState {
  weaponId: string
  startedAt: number
  techniqueIds: string[]
  executionOpts?: RepairTechniqueExecutionOptions
  /** По умолчанию ведёт себя как прежний прогон без поля в JSON */
  source?: RepairTechniqueStageRunSource
  /** Позиция очереди верстака (для обновления статуса по `queueItemId`). */
  activeQueueItemId?: string
  /** Перековка из очереди: этапы в UI как у ремонта, затем apply. */
  workbenchReforge?: { kind: 'reforge_buff' | 'reforge_awaken'; techniqueId: string }
}

/** Состояние крафта */
export interface CraftState {
  /**
   * Выбранные техники до запуска ремонта (черновик; тот же клинок на верстаке).
   * Не персистится.
   */
  repairBenchTechniqueDraft: { weaponId: string; techniqueIds: string[] } | null
  /**
   * Очередь верстака (ремонт / перековка). В JSON persist и облаке ключ — `repairQueuePlan`.
   */
  workbenchQueue: WorkbenchQueueItem[]
  /**
   * Выбранное оружие в UI верстака (создание задачи, детали). Не persist.
   */
  workbenchSelectedWeaponId: string | null
  /**
   * После «стоп очереди»: не запускать следующий пункт автоматически (не persist).
   */
  workbenchQueueAdvanceBlocked: boolean
  /**
   * Запущенные этапы ремонта: время старта и параметры для завершения после таймера.
   * Персистится (Zustand persist + облако при включённом Turso).
   */
  repairTechniqueStageRun: RepairTechniqueStageRunState | null
  activeRefining: ActiveRefining
  weaponInventory: WeaponInventory
  unlockedRecipes: UnlockedRecipes
  recipeSources: RecipeSource[]
  unlockedEnchantments: string[]
  /** Техники обработки материала в кузне (`material-processing-techniques`) */
  unlockedMaterialProcessingTechniqueIds: string[]
  /** Узкоспециализированные техники ремонта, купленные у интенданта (`repairTier: specialized`). */
  unlockedRepairTechniqueIds: string[]
  /** Спец-техники крафта, купленные у интенданта (`craft_technique`). */
  unlockedCraftTechniqueIds: string[]
  /** Спец-техники перековки, купленные у интенданта (`reforgeTier: specialized`); дублирует/дополняет разблокировку через кузню. */
  unlockedReforgeTechniqueIds: string[]
}

/** Actions для крафта */
export interface CraftActions {
  startRefining: (
    recipe: RefiningRecipe,
    amount: number,
    options?: { smeltingOutputMultiplier?: number }
  ) => boolean
  updateRefiningProgress: (progress: number) => void
  completeRefining: () => boolean
  isRefining: () => boolean
  sellWeapon: (weaponId: string) => boolean
  getWeaponById: (weaponId: string) => CraftedWeaponV2 | undefined
  addWeapon: (weapon: CraftedWeaponV2) => void
  removeWeapon: (weaponId: string) => boolean
  unlockRecipe: (
    recipeId: string,
    source: 'purchase' | 'order' | 'expedition' | 'level' | 'guild_intendant'
  ) => boolean
  isRecipeUnlocked: (recipeId: string) => boolean
  getRecipeSource: (recipeId: string) => RecipeSource | undefined
  unlockEnchantment: (enchantmentId: string) => boolean
  isEnchantmentUnlocked: (enchantmentId: string) => boolean
  unlockMaterialProcessingTechnique: (techniqueId: string) => boolean
  /** Боевые приёмы крафта (квест, интендант и т.д.) */
  unlockCraftTechnique: (techniqueId: string) => boolean
  addWarSoulToWeapon: (
    weaponId: string,
    points: number,
    durabilityLoss?: number,
    epicGain?: number,
    appendDamageTags?: ActiveDamageTagEntry[]
  ) => boolean
  /** Поставить клинок на верстак ремонта (заменяет предыдущий слот). */
  sendWeaponToRepairBench: (weaponId: string) => { success: boolean; error?: string }
  /** Выбрать активный клинок из очереди верстака. */
  selectRepairBenchWeapon: (weaponId: string) => { success: boolean; error?: string }
  /** Убрать клинок с верстака без ремонта (очередь + выбор UI). */
  returnWeaponFromRepairBench: (weaponId?: string) => void
  /** Добавить/обновить план ремонта для клинка. */
  upsertRepairQueuePlan: (payload: {
    weaponId: string
    techniqueIds: string[]
    executionOpts?: RepairTechniqueExecutionOptions
  }) => { success: boolean; error?: string }
  /** Удалить запланированный пункт очереди верстака по id. */
  removeWorkbenchPlannedItem: (queueItemId: string) => void
  /** Очистить весь план ремонта. */
  clearRepairQueuePlan: () => void
  /** Обновить статус позиции в очереди верстака по `queueItemId`. */
  setWorkbenchQueueItemStatus: (
    queueItemId: string,
    status: WorkbenchQueueItemStatus,
    errorMessage?: string
  ) => void
  /** Добавить перековку в конец очереди верстака. */
  enqueueWorkbenchReforge: (payload: {
    weaponId: string
    techniqueId: string
    kind: 'reforge_buff' | 'reforge_awaken'
  }) => void
  /** Снять все запланированные пункты очереди для клинка (экспедиция §6.1). */
  removeAllPlannedWorkbenchItemsForWeapon: (weaponId: string) => void
  setRepairBenchTechniqueDraft: (
    draft: { weaponId: string; techniqueIds: string[] } | null
  ) => void
  beginRepairTechniqueStageRun: (payload: {
    weaponId: string
    techniqueIds: string[]
    executionOpts?: RepairTechniqueExecutionOptions
    startedAt?: number
    source?: RepairTechniqueStageRunSource
    activeQueueItemId?: string
    workbenchReforge?: { kind: 'reforge_buff' | 'reforge_awaken'; techniqueId: string }
  }) => void
  clearRepairTechniqueStageRun: () => void
  setWorkbenchSelectedWeaponId: (weaponId: string | null) => void
  reorderWorkbenchQueue: (fromIndex: number, toIndex: number) => void
  updateWorkbenchPlannedItem: (
    queueItemId: string,
    patch: {
      kind: WorkbenchQueueItemKind
      techniqueIds?: string[]
      techniqueId?: string
      executionOpts?: RepairTechniqueExecutionOptions
    }
  ) => { success: boolean; error?: string }
  cancelActiveWorkbenchStageRun: () => void
  setWorkbenchQueueAdvanceBlocked: (blocked: boolean) => void
}

/** Полный тип slice */
export type CraftSlice = CraftState & CraftActions

// ================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
// ================================

export const initialActiveCraft: ActiveCraft = {
  recipeId: null,
  weaponName: 'Нет активного крафта',
  progress: 0,
  startTime: null,
  endTime: null,
  quality: 0,
}

export const initialActiveRefining: ActiveRefining = {
  recipeId: null,
  resourceName: 'Нет активной переработки',
  progress: 0,
  startTime: null,
  endTime: null,
  amount: 0,
}

export const initialWeaponInventory: WeaponInventory = {
  weapons: [],
  maxSlots: 20,
  trophies: {},
}

export const initialUnlockedRecipes: UnlockedRecipes = {
  /** Строгая политика: бесплатно только семейство мечей; остальные формы — у интенданта. */
  weaponRecipes: ['basic_sword'],
  refiningRecipes: ['iron_ingot', 'copper_ingot', 'tin_ingot', 'wood_planks', 'stone_blocks'],
}

// ================================
// SLICE
// ================================

export const createCraftSlice: StateCreator<
  CraftSlice,
  [],
  [],
  CraftSlice
> = (set, get) => ({
  // State
  repairBenchTechniqueDraft: null,
  workbenchQueue: [],
  workbenchSelectedWeaponId: null,
  workbenchQueueAdvanceBlocked: false,
  repairTechniqueStageRun: null,
  activeRefining: initialActiveRefining,
  weaponInventory: initialWeaponInventory,
  unlockedRecipes: initialUnlockedRecipes,
  recipeSources: [],
  unlockedEnchantments: [],
  unlockedMaterialProcessingTechniqueIds: [],
  unlockedRepairTechniqueIds: [],
  unlockedCraftTechniqueIds: [],
  unlockedReforgeTechniqueIds: [],

  // Actions - Переработка
  startRefining: (recipe, amount, options) => {
    const state = get()
    if (state.activeRefining.recipeId) return false
    // Проверка ресурсов делается в game-store
    
    const now = Date.now()
    const endTime = now + recipe.processTime * 1000 * amount
    const smeltingOutputMultiplier =
      options?.smeltingOutputMultiplier != null && options.smeltingOutputMultiplier > 0
        ? options.smeltingOutputMultiplier
        : 1

    set({
      activeRefining: {
        recipeId: recipe.id,
        resourceName: recipe.name,
        progress: 0,
        startTime: now,
        endTime: endTime,
        amount,
        smeltingOutputMultiplier,
      }
    })
    return true
  },

  updateRefiningProgress: (progress) => set((state) => ({
    activeRefining: { ...state.activeRefining, progress: Math.min(100, progress) }
  })),

  completeRefining: () => {
    const state = get()
    if (!state.activeRefining.recipeId) return false
    
    // Начисление ресурсов делается в game-store
    set({ activeRefining: initialActiveRefining })
    return true
  },

  isRefining: () => get().activeRefining.recipeId !== null,

  // Actions - Инвентарь
  sellWeapon: (weaponId) => {
    const state = get()
    const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
    if (!weapon) return false
    
    // Начисление золота делается в game-store
    set((state) => {
      const inWorkbench = state.workbenchQueue.some((item) => item.weaponId === weaponId)
      const clearSel = state.workbenchSelectedWeaponId === weaponId
      return {
        workbenchSelectedWeaponId: clearSel ? null : state.workbenchSelectedWeaponId,
        repairBenchTechniqueDraft:
          state.repairBenchTechniqueDraft?.weaponId === weaponId
            ? null
            : state.repairBenchTechniqueDraft,
        workbenchQueue: inWorkbench
          ? state.workbenchQueue.filter((item) => item.weaponId !== weaponId)
          : state.workbenchQueue,
        repairTechniqueStageRun:
          state.repairTechniqueStageRun?.weaponId === weaponId
            ? null
            : state.repairTechniqueStageRun,
        weaponInventory: {
          ...state.weaponInventory,
          weapons: state.weaponInventory.weapons.filter(w => w.id !== weaponId),
        },
      }
    })
    return true
  },

  getWeaponById: (weaponId) => get().weaponInventory.weapons.find(w => w.id === weaponId),

  addWeapon: (weapon) =>
    set((state) => ({
      weaponInventory: {
        ...state.weaponInventory,
        weapons: [...state.weaponInventory.weapons, withRecalculatedPowerScore(weapon)],
      },
    })),

  removeWeapon: (weaponId) => {
    const state = get()
    const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
    if (!weapon) return false
    
    set((state) => {
      const inWorkbench = state.workbenchQueue.some((item) => item.weaponId === weaponId)
      const clearSel = state.workbenchSelectedWeaponId === weaponId
      return {
        workbenchSelectedWeaponId: clearSel ? null : state.workbenchSelectedWeaponId,
        repairBenchTechniqueDraft:
          state.repairBenchTechniqueDraft?.weaponId === weaponId
            ? null
            : state.repairBenchTechniqueDraft,
        workbenchQueue: inWorkbench
          ? state.workbenchQueue.filter((item) => item.weaponId !== weaponId)
          : state.workbenchQueue,
        repairTechniqueStageRun:
          state.repairTechniqueStageRun?.weaponId === weaponId
            ? null
            : state.repairTechniqueStageRun,
        weaponInventory: {
          ...state.weaponInventory,
          weapons: state.weaponInventory.weapons.filter(w => w.id !== weaponId),
        },
      }
    })
    return true
  },

  sendWeaponToRepairBench: (weaponId) => {
    const w = get().weaponInventory.weapons.find((x) => x.id === weaponId)
    if (!w) return { success: false, error: 'Оружие не найдено' }
    set((state) => ({
      workbenchSelectedWeaponId: weaponId,
      repairBenchTechniqueDraft:
        state.repairBenchTechniqueDraft?.weaponId === weaponId
          ? state.repairBenchTechniqueDraft
          : null,
      repairTechniqueStageRun:
        state.repairTechniqueStageRun?.weaponId === weaponId ? state.repairTechniqueStageRun : null,
    }))
    return { success: true }
  },

  selectRepairBenchWeapon: (weaponId) => {
    const state = get()
    if (!state.weaponInventory.weapons.some((w) => w.id === weaponId)) {
      return { success: false, error: 'Оружие не найдено' }
    }
    set({
      workbenchSelectedWeaponId: weaponId,
      repairBenchTechniqueDraft:
        state.repairBenchTechniqueDraft?.weaponId === weaponId
          ? state.repairBenchTechniqueDraft
          : null,
      repairTechniqueStageRun:
        state.repairTechniqueStageRun?.weaponId === weaponId ? state.repairTechniqueStageRun : null,
    })
    return { success: true }
  },

  returnWeaponFromRepairBench: (weaponId) =>
    set((state) => {
      const targetId = weaponId ?? state.workbenchSelectedWeaponId
      if (!targetId) return {}
      const nextWorkbenchSel =
        state.workbenchSelectedWeaponId === targetId ? null : state.workbenchSelectedWeaponId
      return {
        workbenchSelectedWeaponId: nextWorkbenchSel,
        repairBenchTechniqueDraft:
          state.repairBenchTechniqueDraft?.weaponId === targetId
            ? null
            : state.repairBenchTechniqueDraft,
        repairTechniqueStageRun:
          state.repairTechniqueStageRun?.weaponId === targetId
            ? null
            : state.repairTechniqueStageRun,
        workbenchQueue: state.workbenchQueue.filter((item) => item.weaponId !== targetId),
      }
    }),

  upsertRepairQueuePlan: ({ weaponId, techniqueIds, executionOpts }) => {
    if (techniqueIds.length === 0) {
      return { success: false, error: 'Выберите техники ремонта перед добавлением в очередь' }
    }
    const state = get()
    if (!state.weaponInventory.weapons.some((w) => w.id === weaponId)) {
      return { success: false, error: 'Оружие не найдено' }
    }
    set((s) => {
      const idx = s.workbenchQueue.findIndex((item) => item.weaponId === weaponId && item.kind === 'repair')
      if (idx >= 0) {
        const existing = s.workbenchQueue[idx]
        if (existing.kind !== 'repair') {
          return {}
        }
        const nextItem: WorkbenchQueueItem = {
          ...existing,
          techniqueIds: [...techniqueIds],
          ...(executionOpts ? { executionOpts } : {}),
          status: 'planned',
          queuedAt: Date.now(),
          errorMessage: undefined,
        }
        const next = [...s.workbenchQueue]
        next[idx] = nextItem
        return { workbenchQueue: next }
      }
      const nextItem = createRepairWorkbenchQueueItem({
        weaponId,
        techniqueIds,
        ...(executionOpts ? { executionOpts } : {}),
      })
      return { workbenchQueue: [...s.workbenchQueue, nextItem] }
    })
    return { success: true }
  },

  removeWorkbenchPlannedItem: (queueItemId) =>
    set((state) => {
      const target = state.workbenchQueue.find((i) => i.queueItemId === queueItemId)
      if (!target || target.status !== 'planned') return {}
      return {
        workbenchQueue: state.workbenchQueue.filter((item) => item.queueItemId !== queueItemId),
        repairTechniqueStageRun:
          state.repairTechniqueStageRun?.activeQueueItemId === queueItemId
            ? null
            : state.repairTechniqueStageRun,
      }
    }),

  enqueueWorkbenchReforge: ({ weaponId, techniqueId, kind }) =>
    set((state) => ({
      workbenchQueue: [
        ...state.workbenchQueue,
        kind === 'reforge_buff'
          ? createReforgeBuffWorkbenchQueueItem({ weaponId, techniqueId })
          : createReforgeAwakenWorkbenchQueueItem({ weaponId, techniqueId }),
      ],
    })),

  removeAllPlannedWorkbenchItemsForWeapon: (weaponId) =>
    set((state) => ({
      workbenchQueue: removeAllPlannedQueueItemsForWeapon(state.workbenchQueue, weaponId),
    })),

  clearRepairQueuePlan: () =>
    set((state) => ({
      workbenchQueue: state.workbenchQueue.filter((item) => item.status !== 'planned'),
      repairTechniqueStageRun:
        state.repairTechniqueStageRun?.source === 'queue' ? null : state.repairTechniqueStageRun,
    })),

  setWorkbenchQueueItemStatus: (queueItemId, status, errorMessage) =>
    set((state) => ({
      workbenchQueue: state.workbenchQueue.map((item) =>
        item.queueItemId !== queueItemId
          ? item
          : {
              ...item,
              status,
              ...(errorMessage ? { errorMessage } : { errorMessage: undefined }),
            }
      ),
    })),

  setRepairBenchTechniqueDraft: (draft) => set({ repairBenchTechniqueDraft: draft }),

  beginRepairTechniqueStageRun: (payload) => {
    const startedAt = payload.startedAt ?? Date.now()
    set({
      repairTechniqueStageRun: {
        weaponId: payload.weaponId,
        startedAt,
        techniqueIds: payload.techniqueIds,
        executionOpts: payload.executionOpts,
        ...(payload.source ? { source: payload.source } : {}),
        ...(payload.activeQueueItemId ? { activeQueueItemId: payload.activeQueueItemId } : {}),
        ...(payload.workbenchReforge ? { workbenchReforge: payload.workbenchReforge } : {}),
      },
      repairBenchTechniqueDraft: null,
      workbenchQueueAdvanceBlocked: false,
    })
  },

  clearRepairTechniqueStageRun: () => set({ repairTechniqueStageRun: null }),

  setWorkbenchSelectedWeaponId: (weaponId) => set({ workbenchSelectedWeaponId: weaponId }),

  reorderWorkbenchQueue: (fromIndex, toIndex) =>
    set((state) => {
      const next = reorderPlannedWorkbenchQueueItems(state.workbenchQueue, fromIndex, toIndex)
      if (!next) return {}
      return { workbenchQueue: next }
    }),

  updateWorkbenchPlannedItem: (queueItemId, patch) => {
    const state = get()
    const idx = state.workbenchQueue.findIndex((i) => i.queueItemId === queueItemId)
    if (idx < 0) return { success: false, error: 'Пункт не найден' }
    const item = state.workbenchQueue[idx]
    if (item.status !== 'planned') return { success: false, error: 'Можно менять только запланированные задачи' }
    if (item.kind !== patch.kind) return { success: false, error: 'Несовпадение типа задачи' }

    let nextItem: WorkbenchQueueItem
    if (patch.kind === 'repair') {
      const techniqueIds = patch.techniqueIds ?? (item.kind === 'repair' ? item.techniqueIds : [])
      if (techniqueIds.length === 0) {
        return { success: false, error: 'Выберите техники ремонта' }
      }
      nextItem = {
        kind: 'repair',
        queueItemId: item.queueItemId,
        weaponId: item.weaponId,
        status: 'planned',
        queuedAt: Date.now(),
        techniqueIds: [...techniqueIds],
        ...(patch.executionOpts ? { executionOpts: patch.executionOpts } : {}),
      }
    } else {
      const techniqueId = patch.techniqueId ?? (item.kind !== 'repair' ? item.techniqueId : '')
      if (!techniqueId) return { success: false, error: 'Выберите технику перековки' }
      const base = {
        queueItemId: item.queueItemId,
        weaponId: item.weaponId,
        status: 'planned' as const,
        queuedAt: Date.now(),
        techniqueId,
      }
      nextItem =
        patch.kind === 'reforge_buff'
          ? { kind: 'reforge_buff', ...base }
          : { kind: 'reforge_awaken', ...base }
    }

    set((s) => ({
      workbenchQueue: s.workbenchQueue.map((i) => (i.queueItemId === queueItemId ? nextItem : i)),
    }))
    return { success: true }
  },

  cancelActiveWorkbenchStageRun: () =>
    set((state) => {
      const run = state.repairTechniqueStageRun
      if (!run?.activeQueueItemId) {
        return { repairTechniqueStageRun: null }
      }
      const qid = run.activeQueueItemId
      return {
        repairTechniqueStageRun: null,
        workbenchQueue: state.workbenchQueue.map((item) =>
          item.queueItemId === qid && item.status === 'running'
            ? { ...item, status: 'planned' as const, errorMessage: undefined }
            : item
        ),
      }
    }),

  setWorkbenchQueueAdvanceBlocked: (blocked) => set({ workbenchQueueAdvanceBlocked: blocked }),

  // Actions - Рецепты
  unlockRecipe: (recipeId, source) => {
    const state = get()
    if (state.unlockedRecipes.weaponRecipes.includes(recipeId) ||
        state.unlockedRecipes.refiningRecipes.includes(recipeId)) {
      return false
    }
    
    // Определение типа рецепта делается в game-store
    
    const newSource: RecipeSource = {
      recipeId,
      source,
      obtainedAt: Date.now(),
    }
    
    set((state) => ({
      recipeSources: [...state.recipeSources, newSource],
    }))
    
    return true
  },

  isRecipeUnlocked: (recipeId) => {
    const state = get()
    return state.unlockedRecipes.weaponRecipes.includes(recipeId) ||
           state.unlockedRecipes.refiningRecipes.includes(recipeId)
  },

  getRecipeSource: (recipeId) => get().recipeSources.find(s => s.recipeId === recipeId),

  // Actions - Зачарования
  unlockEnchantment: (enchantmentId) => {
    const state = get()
    if (state.unlockedEnchantments.includes(enchantmentId)) return false
    
    set((state) => ({
      unlockedEnchantments: [...state.unlockedEnchantments, enchantmentId]
    }))
    return true
  },

  isEnchantmentUnlocked: (enchantmentId) => get().unlockedEnchantments.includes(enchantmentId),

  unlockMaterialProcessingTechnique: (techniqueId) => {
    const state = get()
    if (state.unlockedMaterialProcessingTechniqueIds.includes(techniqueId)) return false
    set(s => ({
      unlockedMaterialProcessingTechniqueIds: [
        ...s.unlockedMaterialProcessingTechniqueIds,
        techniqueId,
      ],
    }))
    return true
  },

  unlockCraftTechnique: (techniqueId) => {
    const state = get()
    if (!techniqueId || state.unlockedCraftTechniqueIds.includes(techniqueId)) return false
    set((s) => ({
      unlockedCraftTechniqueIds: [...s.unlockedCraftTechniqueIds, techniqueId],
    }))
    return true
  },

  // Actions - Война душ
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
    
    set((state) => ({
      weaponInventory: {
        ...state.weaponInventory,
        weapons: state.weaponInventory.weapons.map((w) =>
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
      }
    }))
    return true
  },
})

// ================================
// ЭКСПОРТ УТИЛИТ (для game-store)
// ================================

// Реэкспорт утилит для использования в game-store
export { generateId, getQualityGrade, getQualityMultiplier }

/** Легаси-модель оружия (v1) — для редких импортов и док */
export type { CraftedWeapon } from '@/types/craft'
