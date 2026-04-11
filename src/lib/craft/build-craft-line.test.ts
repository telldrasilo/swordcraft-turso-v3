import { describe, expect, it } from 'vitest'
import {
  buildCraftLine,
  buildCraftLineFromPlan,
  collectCraftLineRefsFromPlan,
  craftLineCaptionAtOverallProgress,
} from '@/lib/craft/build-craft-line'
import type { CraftPlan } from '@/types/craft-v2'
import { isCraftLineTechniqueSegment } from '@/types/craft-line'

describe('buildCraftLine (ENC P5b)', () => {
  it('normalizes duration shares to sum 1', () => {
    const segments = buildCraftLine([
      { kind: 'craft', id: 'basic_forging' },
      { kind: 'material_processing', id: 'forge_basic_iron_smelt' },
    ])
    expect(segments.length).toBeGreaterThan(0)
    const sum = segments.reduce((s, x) => s + x.durationShare, 0)
    expect(sum).toBeCloseTo(1, 5)
  })

  it('places material processing before combat techniques (§12.3)', () => {
    const segments = buildCraftLine([
      { kind: 'craft', id: 'basic_forging' },
      { kind: 'material_processing', id: 'forge_basic_iron_smelt' },
    ])
    const firstProcIdx = segments.findIndex(
      s => isCraftLineTechniqueSegment(s) && s.techniqueRef.kind === 'material_processing'
    )
    const firstCraftIdx = segments.findIndex(
      s => isCraftLineTechniqueSegment(s) && s.techniqueRef.kind === 'craft'
    )
    expect(firstProcIdx).toBeGreaterThanOrEqual(0)
    expect(firstCraftIdx).toBeGreaterThanOrEqual(0)
    expect(firstProcIdx).toBeLessThan(firstCraftIdx)
  })

  it('buildCraftLineFromPlan collects smelting then craft ids', () => {
    const plan: CraftPlan = {
      recipeId: 'basic_sword',
      materials: { blade: { materialId: 'iron_alloy', quantity: 1 } },
      techniques: ['basic_forging'],
      shouldPurchaseMaterials: false,
      partMaterialSupply: {
        blade: { mode: 'ore_smelt', processingTechniqueId: 'forge_basic_iron_smelt' },
      },
      estimatedTime: 100,
      estimatedStats: {
        attack: 1,
        durability: 1,
        maxDurability: 1,
        weight: 1,
        balance: 1,
        soulCapacity: 1,
        repairPotential: 1,
        enchantSlots: 0,
        enchantPower: 0,
      },
      estimatedQuality: 'common',
    }
    const refs = collectCraftLineRefsFromPlan(plan)
    expect(refs[0]).toEqual({ kind: 'material_processing', id: 'forge_basic_iron_smelt' })
    expect(refs.some(r => r.kind === 'craft' && r.id === 'basic_forging')).toBe(true)
    const seg = buildCraftLineFromPlan(plan)
    expect(seg.reduce((s, x) => s + x.durationShare, 0)).toBeCloseTo(1, 5)
  })

  it('craftLineCaptionAtOverallProgress returns a label', () => {
    const segments = buildCraftLine([
      { kind: 'material_processing', id: 'forge_basic_iron_smelt' },
      { kind: 'craft', id: 'basic_forging' },
    ])
    const cap = craftLineCaptionAtOverallProgress(segments, 0.01)
    expect(typeof cap).toBe('string')
    expect(cap?.length).toBeGreaterThan(0)
  })
})
