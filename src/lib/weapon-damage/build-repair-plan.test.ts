import { describe, expect, it } from 'vitest'
import {
  buildWeaponRepairPlan,
  getApplicableRepairTechniquesForTags,
  getApplicableRepairTechniquesForTagsUnlocked,
  getUncoveredActiveTags,
  isRepairTechniqueUnlocked,
  repairPlanUsesOnlyBasicTechniques,
} from './build-repair-plan'

describe('build-repair-plan', () => {
  it('getApplicableRepairTechniquesForTags with no tags returns all basic techniques', () => {
    const list = getApplicableRepairTechniquesForTags([])
    expect(list.some((t) => t.id === 'durability_maintenance')).toBe(true)
    expect(list.some((t) => t.id === 'edge_truing')).toBe(true)
    expect(list.some((t) => t.id === 'basic_elemental_stabilization')).toBe(true)
    expect(list.every((t) => t.repairTier === 'basic')).toBe(true)
  })

  it('getApplicableRepairTechniquesForTags returns techniques that clear any active tag', () => {
    const list = getApplicableRepairTechniquesForTags(['physical_slash_chip', 'unknown_tag'])
    expect(list.some((t) => t.id === 'edge_truing')).toBe(true)
    expect(list.some((t) => t.id === 'haft_tightening')).toBe(false)
  })

  it('buildWeaponRepairPlan includes durability maintenance stages', () => {
    const plan = buildWeaponRepairPlan(['durability_maintenance'])
    expect(plan).not.toBeNull()
    if (!plan) return
    expect(plan.stages.length).toBe(3)
    expect(plan.techniqueIds).toEqual(['durability_maintenance'])
  })

  it('buildWeaponRepairPlan merges stages in technique order and sums costs', () => {
    const plan = buildWeaponRepairPlan(['edge_truing', 'haft_tightening'])
    expect(plan).not.toBeNull()
    if (!plan) return
    expect(plan.techniqueIds).toEqual(['edge_truing', 'haft_tightening'])
    expect(plan.stages.length).toBe(3 + 3)
    expect(plan.stages[0].sourceTechniqueId).toBe('edge_truing')
    expect(plan.stages[3].sourceTechniqueId).toBe('haft_tightening')
    expect(plan.totalGold).toBe(0)
    expect(plan.mergedMaterials.ironIngot).toBe(1)
    expect(plan.mergedMaterials.wood).toBe(2)
  })

  it('buildWeaponRepairPlan returns null for unknown technique id', () => {
    expect(buildWeaponRepairPlan(['edge_truing', 'no_such'])).toBeNull()
  })

  it('buildWeaponRepairPlan dedupes duplicate technique ids', () => {
    const once = buildWeaponRepairPlan(['edge_truing'])
    const dup = buildWeaponRepairPlan(['edge_truing', 'edge_truing'])
    expect(once).not.toBeNull()
    expect(dup).not.toBeNull()
    if (!once || !dup) return
    expect(dup.stages.length).toBe(once.stages.length)
    expect(dup.totalGold).toBe(once.totalGold)
  })

  it('getUncoveredActiveTags lists tags not cleared by selection', () => {
    expect(
      getUncoveredActiveTags(['physical_slash_chip', 'physical_loose_fitting'], ['edge_truing'])
    ).toEqual(['physical_loose_fitting'])
    expect(getUncoveredActiveTags(['physical_slash_chip'], ['edge_truing'])).toEqual([])
  })

  it('isRepairTechniqueUnlocked: basic always true; specialized needs id in list', () => {
    expect(isRepairTechniqueUnlocked('edge_truing', [])).toBe(true)
    expect(isRepairTechniqueUnlocked('notch_filing', [])).toBe(false)
    expect(isRepairTechniqueUnlocked('notch_filing', ['notch_filing'])).toBe(true)
  })

  it('repairPlanUsesOnlyBasicTechniques', () => {
    expect(repairPlanUsesOnlyBasicTechniques([])).toBe(true)
    expect(repairPlanUsesOnlyBasicTechniques(['edge_truing', 'haft_tightening'])).toBe(true)
    expect(
      repairPlanUsesOnlyBasicTechniques([
        'basic_metal_stress_relief',
        'basic_elemental_stabilization',
      ])
    ).toBe(true)
    expect(repairPlanUsesOnlyBasicTechniques(['edge_truing', 'notch_filing'])).toBe(false)
  })

  it('getApplicableRepairTechniquesForTagsUnlocked filters specialized without purchase', () => {
    const tag = 'physical_gouge_chunk'
    const all = getApplicableRepairTechniquesForTags([tag])
    expect(all.some((t) => t.id === 'notch_filing')).toBe(true)
    expect(all.some((t) => t.id === 'edge_truing')).toBe(true)
    const locked = getApplicableRepairTechniquesForTagsUnlocked([tag], [])
    expect(locked.some((t) => t.id === 'notch_filing')).toBe(false)
    expect(locked.some((t) => t.id === 'edge_truing')).toBe(true)
    const unlocked = getApplicableRepairTechniquesForTagsUnlocked([tag], ['notch_filing'])
    expect(unlocked.some((t) => t.id === 'notch_filing')).toBe(true)
  })
})
