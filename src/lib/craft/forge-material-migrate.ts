/**
 * Миграции materialId в планах крафта v2 (фаза A: канон слитка на складе).
 */

import type { ActiveCraftV2, CraftedWeaponV2, CraftPlan } from '@/types/craft-v2'

/** Абстрактный каталожный id → каноническая стадия для кузницы / stash. */
export const FORGE_MATERIAL_STAGE_ALIASES: Readonly<Record<string, string>> = {
  iron: 'iron_alloy',
  mithril: 'mithril_alloy',
}

function mapMaterialId(materialId: string): string {
  return FORGE_MATERIAL_STAGE_ALIASES[materialId] ?? materialId
}

export function migrateCraftPlanForgeMaterials(plan: CraftPlan | null): CraftPlan | null {
  if (!plan?.materials) return plan
  let changed = false
  const materials = { ...plan.materials }
  for (const [partId, assign] of Object.entries(materials)) {
    const nextId = mapMaterialId(assign.materialId)
    if (nextId !== assign.materialId) {
      materials[partId] = { ...assign, materialId: nextId }
      changed = true
    }
  }
  return changed ? { ...plan, materials } : plan
}

export function migrateActiveCraftForgeMaterials(active: ActiveCraftV2 | null): ActiveCraftV2 | null {
  if (!active) return active
  const plan = migrateCraftPlanForgeMaterials(active.plan)
  if (plan === active.plan) return active
  if (plan == null) return active
  return { ...active, plan }
}

export function migrateCraftedWeaponForgeMaterials(weapon: CraftedWeaponV2): CraftedWeaponV2 {
  let changed = false
  const materials = weapon.materials.map(entry => {
    const nextId = mapMaterialId(entry.materialId)
    if (nextId === entry.materialId) return entry
    changed = true
    return { ...entry, materialId: nextId }
  })
  const combatNext = mapMaterialId(weapon.combatMaterialId)
  if (combatNext !== weapon.combatMaterialId) {
    changed = true
  }
  const hiddenTags = weapon.hiddenTags.map(t => {
    const m = mapMaterialId(t)
    if (m !== t) changed = true
    return m
  })
  return changed
    ? { ...weapon, materials, combatMaterialId: combatNext, hiddenTags }
    : weapon
}
