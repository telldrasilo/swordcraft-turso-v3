import { describe, it, expect } from 'vitest'
import {
  FORGOTTEN_FORGE_ALTAR_RECIPE_ID,
  isForgottenForgeAltarRecipe,
} from '@/lib/craft/altar-construction'
import { getRecipeById } from '@/data/recipes'
import { generateCraftStages } from '@/lib/craft/process-generator'
import type { MaterialAssignment } from '@/types/craft-v2'
import { getForgePartMaterialCandidates } from '@/lib/materials/forge-part-material-candidates'
import { canCatalogMaterialSpendInForgeCraft } from '@/lib/craft/inventory-check'

describe('altar construction recipe', () => {
  it('registers recipe id and detector', () => {
    expect(isForgottenForgeAltarRecipe(FORGOTTEN_FORGE_ALTAR_RECIPE_ID)).toBe(true)
    expect(isForgottenForgeAltarRecipe('basic_sword')).toBe(false)
  })

  it('loads recipe with seven parts and macro stages', () => {
    const r = getRecipeById(FORGOTTEN_FORGE_ALTAR_RECIPE_ID)
    expect(r).toBeDefined()
    expect(r?.parts.length).toBe(7)
    expect(r?.stages.length).toBeGreaterThan(10)
  })

  it('keeps phase III reagent parts at tier-2 reachable ranges', () => {
    const r = getRecipeById(FORGOTTEN_FORGE_ALTAR_RECIPE_ID)
    expect(r).toBeDefined()
    if (!r) return

    const alloy = r.parts.find((p) => p.id === 'altar_soul_alloy')
    const peat = r.parts.find((p) => p.id === 'altar_soul_peat')
    const herbs = r.parts.find((p) => p.id === 'altar_soul_herbs')

    expect(alloy?.minQuantity).toBe(2)
    expect(alloy?.maxQuantity).toBe(4)
    expect(peat?.minQuantity).toBe(2)
    expect(peat?.maxQuantity).toBe(5)
    expect(herbs?.minQuantity).toBe(2)
    expect(herbs?.maxQuantity).toBe(4)
  })

  it('includes canonical phase III reagents peat and mist_herbs in planner candidates', () => {
    const r = getRecipeById(FORGOTTEN_FORGE_ALTAR_RECIPE_ID)
    expect(r).toBeDefined()
    if (!r) return

    const peatPart = r.parts.find((p) => p.id === 'altar_soul_peat')
    const herbsPart = r.parts.find((p) => p.id === 'altar_soul_herbs')
    expect(peatPart).toBeDefined()
    expect(herbsPart).toBeDefined()
    if (!peatPart || !herbsPart) return

    const peatCandidates = getForgePartMaterialCandidates(peatPart.id, peatPart.materialTypes).map(
      m => m.identity.id
    )
    const herbsCandidates = getForgePartMaterialCandidates(
      herbsPart.id,
      herbsPart.materialTypes
    ).map(m => m.identity.id)

    expect(peatCandidates).toContain('peat')
    expect(herbsCandidates).toContain('mist_herbs')
    expect(canCatalogMaterialSpendInForgeCraft('peat')).toBe(true)
    expect(canCatalogMaterialSpendInForgeCraft('mist_herbs')).toBe(true)
  })

  it('fieldstone is spendable and appears in altar_base candidates', () => {
    const r = getRecipeById(FORGOTTEN_FORGE_ALTAR_RECIPE_ID)
    expect(r).toBeDefined()
    if (!r) return
    const base = r.parts.find((p) => p.id === 'altar_base')
    expect(base).toBeDefined()
    if (!base) return
    expect(canCatalogMaterialSpendInForgeCraft('fieldstone')).toBe(true)
    const ids = getForgePartMaterialCandidates(base.id, base.materialTypes).map(m => m.identity.id)
    expect(ids).toContain('fieldstone')
  })

  it('generates craft stages without throwing', () => {
    const r = getRecipeById(FORGOTTEN_FORGE_ALTAR_RECIPE_ID)
    expect(r).toBeDefined()
    if (!r) return
    const materials: MaterialAssignment = {}
    for (const p of r.parts) {
      if (p.id === 'altar_base') materials[p.id] = { materialId: 'fieldstone', quantity: p.minQuantity }
      else if (p.id === 'altar_frame') materials[p.id] = { materialId: 'oak', quantity: p.minQuantity }
      else if (p.id === 'altar_brackets') materials[p.id] = { materialId: 'steel', quantity: p.minQuantity }
      else if (p.id === 'altar_binding') materials[p.id] = { materialId: 'raw_leather', quantity: p.minQuantity }
      else if (p.id === 'altar_soul_alloy') materials[p.id] = { materialId: 'silver_alloy', quantity: p.minQuantity }
      else if (p.id === 'altar_soul_peat') materials[p.id] = { materialId: 'peat', quantity: p.minQuantity }
      else if (p.id === 'altar_soul_herbs') materials[p.id] = { materialId: 'mist_herbs', quantity: p.minQuantity }
    }
    const stages = generateCraftStages(r, materials, [], 10, 5)
    expect(stages.length).toBeGreaterThan(0)
  })
})
