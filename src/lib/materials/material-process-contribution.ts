/**
 * Единая точка чтения смыслового вклада материала в процесс (фаза B).
 * Пока без изменения баланса: эвристики по тегам/классу + явные оверрайды.
 */

import { MATERIAL_PROCESS_OVERRIDES } from '@/data/materials/material-process-overrides'
import { materialById } from '@/data/materials'
import type { MaterialNode } from '@/types/materials/material-core'
import type {
  MaterialProcessContribution,
  MaterialProcessFacet,
  MaterialProcessKind,
  MaterialRefiningSmeltingParams,
} from '@/types/materials/material-process'

export function getRefiningOreChargeEfficiency(materialId: string): number {
  const c = getMaterialProcessContribution(materialId, 'refining_smelting')
  return c.refiningSmelting?.oreChargeEfficiency ?? 1
}

export function getMaterialProcessContribution(
  materialId: string,
  processKind: MaterialProcessKind
): MaterialProcessContribution {
  const forced = MATERIAL_PROCESS_OVERRIDES[materialId]?.[processKind]
  if (forced != null && Array.isArray(forced.facets)) {
    let refiningSmelting: MaterialRefiningSmeltingParams | undefined
    if (processKind === 'refining_smelting' && forced.facets.length > 0) {
      if (typeof forced.oreChargeEfficiency === 'number') {
        refiningSmelting = { oreChargeEfficiency: forced.oreChargeEfficiency }
      } else if (forced.facets.includes('smelt_ore_charge')) {
        refiningSmelting = { oreChargeEfficiency: 1 }
      }
    }
    return { facets: [...forced.facets], source: 'explicit', refiningSmelting }
  }

  const node = materialById[materialId]
  if (!node) {
    return { facets: [], source: 'unknown' }
  }

  switch (processKind) {
    case 'refining_smelting':
      return inferRefiningSmelting(node)
    case 'weapon_craft_v2':
      return inferWeaponCraftV2(node)
  }
}

function inferRefiningSmelting(node: MaterialNode): MaterialProcessContribution {
  const tags = node.identity.tags
  const facets: MaterialProcessFacet[] = []

  if (tags.some(t => t === 'fuel' || t === 'carbon')) {
    facets.push('smelt_fuel')
  }
  if (tags.includes('ore') || tags.includes('iron-bearing')) {
    facets.push('smelt_ore_charge')
  }

  if (facets.length > 0) {
    const refiningSmelting: MaterialRefiningSmeltingParams | undefined = facets.includes(
      'smelt_ore_charge'
    )
      ? { oreChargeEfficiency: 1 }
      : undefined
    return { facets, source: 'inferred_tags', refiningSmelting }
  }

  return { facets: [], source: 'class_fallback' }
}

function inferWeaponCraftV2(node: MaterialNode): MaterialProcessContribution {
  const { class: cls, tags } = node.identity

  /** Руда в крафте частей оружия не выбирается как материал части; семантика — переработка. */
  if (tags.includes('ore') && cls === 'mineral') {
    return { facets: [], source: 'class_fallback' }
  }

  if (tags.includes('gem')) {
    return { facets: ['weapon_inlay_gem'], source: 'inferred_tags' }
  }

  switch (cls) {
    case 'metal':
      return { facets: ['weapon_body_metal'], source: 'class_fallback' }
    case 'wood':
      return { facets: ['weapon_body_wood'], source: 'class_fallback' }
    case 'leather':
      return { facets: ['weapon_grip_leather'], source: 'class_fallback' }
    case 'mineral':
      return { facets: ['weapon_body_mineral'], source: 'class_fallback' }
    case 'organic':
      return { facets: ['organic_reagent'], source: 'class_fallback' }
    default:
      return { facets: [], source: 'class_fallback' }
  }
}

/** Подписи фасетов для UI планировщика крафта (фаза C семантики — без смены формул). */
const WEAPON_CRAFT_UI_LABELS: Partial<Record<MaterialProcessFacet, string>> = {
  weapon_body_metal: 'металл клинка и корпуса',
  weapon_body_wood: 'древесина деталей',
  weapon_body_mineral: 'камень / минерал деталей',
  weapon_inlay_gem: 'инкрустация, самоцвет',
  weapon_grip_leather: 'хват и мягкие накладки',
  organic_reagent: 'органический компонент',
}

/**
 * Одна строка для тултипа крафта: роли материала в weapon_craft_v2.
 * Не показывает плавку (`refining_smelting`) — только контекст кузницы.
 */
export function formatWeaponCraftV2RoleHint(materialId: string): string | null {
  const c = getMaterialProcessContribution(materialId, 'weapon_craft_v2')
  const parts = c.facets.map(f => WEAPON_CRAFT_UI_LABELS[f]).filter(Boolean) as string[]
  if (parts.length === 0) return null
  return `В крафте: ${parts.join(' · ')}`
}
