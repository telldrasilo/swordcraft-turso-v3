import { describe, expect, it } from 'vitest'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { basicTechniques } from '@/data/techniques/basic'
import { advancedTechniques } from '@/data/techniques/advanced'
import {
  appendProcessingRefsToRecipeStageTypes,
  applyCombatProcessModsToStageTypes,
  stageRefsFromProcessingOperations,
} from '@/lib/craft/timeline-composition'

describe('timeline-composition (roadmap 4.2)', () => {
  it('orders processing operations and maps stageTypeHint + processingOperationId', () => {
    const ironSmelt = allMaterialProcessingTechniques.find((t) => t.id === 'forge_basic_iron_smelt')
    expect(ironSmelt).toBeDefined()
    if (!ironSmelt) return
    const refs = stageRefsFromProcessingOperations(ironSmelt.id, ironSmelt.processingOperations)
    expect(refs).toEqual([
      {
        stageType: 'prep_forge_ore_smelting',
        durationSeconds: 25,
        sourceTechniqueId: 'forge_basic_iron_smelt',
        processingOperationId: 'forge_basic_iron_smelt_op0',
      },
    ])
  })

  it('appends processing refs after recipe stage types', () => {
    const plan = appendProcessingRefsToRecipeStageTypes(['prep_heating', 'forge_main'], [
      {
        stageType: 'prep_forge_ore_smelting',
        sourceTechniqueId: 'forge_basic_iron_smelt',
        processingOperationId: 'x',
      },
    ])
    expect(plan.stageRefs.map((r) => r.stageType)).toEqual([
      'prep_heating',
      'forge_main',
      'prep_forge_ore_smelting',
    ])
  })
})

describe('timeline-composition (roadmap 4.3)', () => {
  it('applies replaceStage like combat technique mods', () => {
    const celestial = advancedTechniques.find((t) => t.id === 'celestial_hardening')
    expect(celestial).toBeDefined()
    if (!celestial) return
    const out = applyCombatProcessModsToStageTypes(
      ['prep', 'fin_hardening', 'fin_polish'],
      [celestial.processMods]
    )
    expect(out).toEqual(['prep', 'fin_celestial_hardening', 'fin_polish'])
  })

  it('applies addStage after anchor', () => {
    const tech = basicTechniques.find((t) => t.id === 'double_hardening')
    expect(tech?.processMods?.addStage).toBeDefined()
    if (!tech?.processMods) return
    const out = applyCombatProcessModsToStageTypes(
      ['fin_quenching', 'fin_hardening', 'fin_sharpening'],
      [tech.processMods]
    )
    const i = out.indexOf('fin_hardening')
    expect(i).toBeGreaterThan(-1)
    expect(out[i + 1]).toBe('fin_hardening')
  })
})
