/**
 * Баланс материалов старта макрофаз алтаря v2 (Forgotten Forge).
 *
 * Все количества для проверки/списания со склада задаются здесь — при плейтесте править этот файл
 * (и при необходимости рецепты в `refining-recipes.ts`, от которых считаются производные фазы I).
 *
 * Конфиг этапов и техник остаётся в `altar-phases-config.ts`.
 *
 * @see docs/Quests/ALTAR_REWORK/ALTAR_MATERIAL_BALANCE.md
 */

import type { AltarRequiredMaterialDisplayHint } from '@/types/altar-construction'
import { refiningRecipes } from '@/data/refining-recipes'

// =============================================================================
// Фаза I — «сырые» величины ГД
// =============================================================================

/** Сколько слитков железа подразумевается под плавку в кузнице (UI и расчёт руды/угля плавки). */
export const ALTAR_PHASE1_IRON_ALLOY_EQUIV = 8

/** Уголь только на работы площадки (без плавки слитков). */
export const ALTAR_PHASE1_CONSTRUCTION_COAL = 12

const phase1Base = {
  fieldstone: 20,
  clay: 25,
  oak: 15,
  birch: 8,
  raw_leather: 6,
} as const

const ironIngotRefiningRecipe = refiningRecipes.find((r) => r.id === 'iron_ingot')
const ironOrePerIngot =
  ironIngotRefiningRecipe?.inputs.find((i) => i.resource === 'iron')?.amount ?? 3
const coalPerIronIngotFromRecipe = ironIngotRefiningRecipe?.extraCost?.coal ?? 0

/** Железная руда на складе (эквивалент слитков × рецепт `iron_ingot`). */
export const ALTAR_PHASE1_IRON_ORE_REQUIRED =
  ALTAR_PHASE1_IRON_ALLOY_EQUIV * ironOrePerIngot

/** Уголь под плавку слитков фазы I (`extraCost` × число слитков). */
export const ALTAR_PHASE1_SMELT_COAL =
  ALTAR_PHASE1_IRON_ALLOY_EQUIV * coalPerIronIngotFromRecipe

/** Весь уголь фазы I: стройка + плавка. */
export const ALTAR_PHASE1_COAL_REQUIRED =
  ALTAR_PHASE1_CONSTRUCTION_COAL + ALTAR_PHASE1_SMELT_COAL

export const ALTAR_PHASE1_REQUIRED_MATERIALS: Record<string, number> = {
  ...phase1Base,
  coal: ALTAR_PHASE1_COAL_REQUIRED,
  iron_ore: ALTAR_PHASE1_IRON_ORE_REQUIRED,
}

export const ALTAR_PHASE1_MATERIAL_DISPLAY_HINTS: Partial<
  Record<string, AltarRequiredMaterialDisplayHint>
> = {
  iron_ore: {
    labelMaterialId: 'iron_alloy',
    producedQuantity: ALTAR_PHASE1_IRON_ALLOY_EQUIV,
  },
}

// =============================================================================
// Фазы II–V — материалы старта (прямые числа)
// =============================================================================

export const ALTAR_PHASE2_REQUIRED_MATERIALS: Record<string, number> = {
  iron_alloy: 16,
  steel: 12,
  coal: 20,
  raw_leather: 10,
  oak: 12,
  bronze: 8,
  copper_alloy: 10,
}

export const ALTAR_PHASE3_REQUIRED_MATERIALS: Record<string, number> = {
  resonator_matrix: 1,
  focusing_chalice: 1,
  lunar_tuning_fork: 1,
  clay: 30,
  coal: 10,
  silver_alloy: 4,
  steel: 6,
}

export const ALTAR_PHASE4_REQUIRED_MATERIALS: Record<string, number> = {
  copper_alloy: 18,
  tin_alloy: 12,
  coal: 15,
  steel: 10,
  silver_alloy: 6,
  raw_leather: 6,
}

export const ALTAR_PHASE5_REQUIRED_MATERIALS: Record<string, number> = {
  mist_herbs: 8,
  peat: 6,
  coal: 10,
  steel: 8,
  silver_alloy: 4,
}
