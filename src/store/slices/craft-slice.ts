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

// ================================
// ТИПЫ
// ================================

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

/** Активный таймер этапов ремонта по техникам (переживает смену вкладки кузницы) */
export interface RepairTechniqueStageRunState {
  weaponId: string
  startedAt: number
  techniqueIds: string[]
  executionOpts?: RepairTechniqueExecutionOptions
}

/** Состояние крафта */
export interface CraftState {
  /** Оружие на верстаке «Ремонт» (не показывается в списке инвентаря кузницы) */
  repairBenchWeaponId: string | null
  /**
   * Выбранные техники до запуска ремонта (черновик; тот же клинок на верстаке).
   * Не персистится.
   */
  repairBenchTechniqueDraft: { weaponId: string; techniqueIds: string[] } | null
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
  addWarSoulToWeapon: (
    weaponId: string,
    points: number,
    durabilityLoss?: number,
    epicGain?: number,
    appendDamageTags?: ActiveDamageTagEntry[]
  ) => boolean
  /** Поставить клинок на верстак ремонта (заменяет предыдущий слот). */
  sendWeaponToRepairBench: (weaponId: string) => { success: boolean; error?: string }
  /** Убрать клинок с верстака без ремонта. */
  returnWeaponFromRepairBench: () => void
  setRepairBenchTechniqueDraft: (
    draft: { weaponId: string; techniqueIds: string[] } | null
  ) => void
  beginRepairTechniqueStageRun: (payload: {
    weaponId: string
    techniqueIds: string[]
    executionOpts?: RepairTechniqueExecutionOptions
    startedAt?: number
  }) => void
  clearRepairTechniqueStageRun: () => void
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
  repairBenchWeaponId: null,
  repairBenchTechniqueDraft: null,
  repairTechniqueStageRun: null,
  activeRefining: initialActiveRefining,
  weaponInventory: initialWeaponInventory,
  unlockedRecipes: initialUnlockedRecipes,
  recipeSources: [],
  unlockedEnchantments: [],
  unlockedMaterialProcessingTechniqueIds: [],
  unlockedRepairTechniqueIds: [],
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
      const onBench = state.repairBenchWeaponId === weaponId
      return {
        repairBenchWeaponId: onBench ? null : state.repairBenchWeaponId,
        repairBenchTechniqueDraft: onBench ? null : state.repairBenchTechniqueDraft,
        repairTechniqueStageRun:
          onBench || state.repairTechniqueStageRun?.weaponId === weaponId
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

  addWeapon: (weapon) => set((state) => ({
    weaponInventory: {
      ...state.weaponInventory,
      weapons: [...state.weaponInventory.weapons, weapon],
    }
  })),

  removeWeapon: (weaponId) => {
    const state = get()
    const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
    if (!weapon) return false
    
    set((state) => {
      const onBench = state.repairBenchWeaponId === weaponId
      return {
        repairBenchWeaponId: onBench ? null : state.repairBenchWeaponId,
        repairBenchTechniqueDraft: onBench ? null : state.repairBenchTechniqueDraft,
        repairTechniqueStageRun:
          onBench || state.repairTechniqueStageRun?.weaponId === weaponId
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
    set({
      repairBenchWeaponId: weaponId,
      repairBenchTechniqueDraft: null,
      repairTechniqueStageRun: null,
    })
    return { success: true }
  },

  returnWeaponFromRepairBench: () =>
    set({
      repairBenchWeaponId: null,
      repairBenchTechniqueDraft: null,
      repairTechniqueStageRun: null,
    }),

  setRepairBenchTechniqueDraft: (draft) => set({ repairBenchTechniqueDraft: draft }),

  beginRepairTechniqueStageRun: (payload) => {
    const startedAt = payload.startedAt ?? Date.now()
    set({
      repairTechniqueStageRun: {
        weaponId: payload.weaponId,
        startedAt,
        techniqueIds: payload.techniqueIds,
        executionOpts: payload.executionOpts,
      },
      repairBenchTechniqueDraft: null,
    })
  },

  clearRepairTechniqueStageRun: () => set({ repairTechniqueStageRun: null }),

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
        weapons: state.weaponInventory.weapons.map(w => 
          w.id === weaponId ? {
            ...w,
            warSoul: Math.min(w.maxWarSoul ?? Infinity, w.warSoul + points),
            currentDurability: newDurability,
            epicMultiplier: newEpicMultiplier,
            adventureCount: w.adventureCount + 1,
            activeDamageTags: extra,
            repairCondition,
          } : w
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
