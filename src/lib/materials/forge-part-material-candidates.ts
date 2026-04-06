/**
 * Кандидаты материалов для части оружия в планировщике (фаза A крафта).
 * Фильтр по классу + пересечение с семантикой weapon_craft_v2 (см. CRAFT_SYSTEM_ROADMAP §6.10).
 */

import type { MaterialNode } from '@/types/materials/material-core'
import type { MaterialProcessFacet } from '@/types/materials/material-process'
import { allMaterials } from '@/data/materials/library'
import { getMaterialProcessContribution } from '@/lib/materials/material-process-contribution'

/** Маппинг категорий RecipePart.materialTypes → допустимые фасеты (логика ИЛИ внутри union). */
function getRequiredWeaponCraftFacetUnion(categories: string[]): Set<MaterialProcessFacet> {
  const out = new Set<MaterialProcessFacet>()
  for (const cat of categories) {
    switch (cat) {
      case 'metal':
      case 'alloy':
        out.add('weapon_body_metal')
        break
      case 'wood':
        out.add('weapon_body_wood')
        break
      case 'leather':
      case 'bone':
        out.add('weapon_grip_leather')
        break
      case 'stone':
        out.add('weapon_body_mineral')
        break
      case 'gem':
      case 'magical':
        out.add('weapon_inlay_gem')
        break
      default:
        break
    }
  }
  return out
}

/** Классы identity, соответствующие категориям рецепта (как в getMaterialsForPart). */
function allowedClassesFromCategories(allowedCategories: string[]): string[] {
  const categoryToClass: Record<string, string[]> = {
    metal: ['metal'],
    alloy: ['metal'],
    wood: ['wood'],
    leather: ['leather'],
    stone: ['mineral'],
    /** В каталоге самоцветы — `class: mineral`, `tags` включают `gem` (buildWorldNode). */
    gem: ['mineral'],
    /** Широкий пул для частей с магическим инкрустатором / сплавом */
    magical: ['mineral', 'metal'],
  }
  return allowedCategories.flatMap(cat => categoryToClass[cat] || [cat])
}

/**
 * Материалы для выбора в части оружия: класс по рецепту и роль в weapon_craft_v2.
 * Исключает сырьевые стадии без body-ролей (руды и пр. по данным вклада).
 */
export function getForgePartMaterialCandidates(
  _partId: string,
  allowedCategories: string[]
): MaterialNode[] {
  const allowedClasses = allowedClassesFromCategories(allowedCategories)
  const facetUnion = getRequiredWeaponCraftFacetUnion(allowedCategories)

  const byClass = allMaterials.filter(m => allowedClasses.includes(m.identity.class))

  if (facetUnion.size === 0) {
    return byClass
  }

  return byClass.filter(m => {
    const c = getMaterialProcessContribution(m.identity.id, 'weapon_craft_v2')
    if (c.facets.length === 0) return false
    return c.facets.some(f => facetUnion.has(f))
  })
}
