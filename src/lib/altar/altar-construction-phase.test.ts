import { describe, expect, it } from 'vitest'
import type { AltarConstructionState } from '@/types/altar-construction'
import {
  ALTAR_PHASE1_COAL_REQUIRED,
  ALTAR_PHASE1_IRON_ORE_REQUIRED,
} from '@/data/altar/altar-phase-material-balance'
import {
  canStartAltarPhase,
  computeAltarConstructionTick,
  consumeMaterialsForAltarPhase,
  getEffectiveUnlockedCraftTechniques,
  isMaterialProcessingTechniqueEffectiveUnlocked,
} from '@/lib/altar/altar-construction-phase'

const emptyAc = (): AltarConstructionState => ({
  altarUnlocked: true,
  altarBuilt: false,
  completedPhases: [],
  activePhase: null,
  activePhaseStartTime: 0,
  activePhaseStageIndex: 0,
  activePhaseStageStartTime: 0,
  activePhaseStages: [],
})

describe('consumeMaterialsForAltarPhase', () => {
  it('phase 1 spends iron ore (not ingots) per smelt requirement', () => {
    const stash: Record<string, number> = {
      fieldstone: 20,
      clay: 25,
      coal: ALTAR_PHASE1_COAL_REQUIRED,
      oak: 15,
      birch: 8,
      iron_ore: ALTAR_PHASE1_IRON_ORE_REQUIRED,
      raw_leather: 6,
    }
    const next = consumeMaterialsForAltarPhase(1, stash, [])
    expect(next).not.toBeNull()
    if (!next) return
    expect(next.iron_ore).toBe(0)
    expect(next.iron_alloy ?? 0).toBe(0)
    expect(next.coal).toBe(0)
  })

  it('skips spending ids marked as quest items on phase 3', () => {
    const stash = {
      resonator_matrix: 1,
      focusing_chalice: 1,
      lunar_tuning_fork: 1,
      clay: 40,
      coal: 20,
      silver_alloy: 10,
      steel: 10,
    }
    const questIds = ['resonator_matrix', 'focusing_chalice', 'lunar_tuning_fork']
    const next = consumeMaterialsForAltarPhase(3, stash, questIds)
    expect(next).not.toBeNull()
    if (!next) return
    expect(next.resonator_matrix).toBe(1)
    expect(next.focusing_chalice).toBe(1)
    expect(next.lunar_tuning_fork).toBe(1)
    expect(next.clay).toBeLessThan(stash.clay)
  })

  it('returns null when quest artifact missing even on phase 3', () => {
    const stash = { clay: 99, coal: 99, silver_alloy: 99, steel: 99 }
    expect(consumeMaterialsForAltarPhase(3, stash, [])).toBeNull()
  })
})

describe('canStartAltarPhase', () => {
  it('requires previous macro phase', () => {
    const ac = emptyAc()
    const stash: Record<string, number> = {}
    expect(
      canStartAltarPhase({
        phase: 2,
        materialStash: stash,
        unlockedCraftTechniqueIds: ['folded_steel', 'double_hardening'],
        unlockedMaterialProcessingTechniqueIds: [],
        construction: ac,
      })
    ).toBe(false)
  })

  it('phase 1: counts default forge iron smelt as unlocked', () => {
    const ac = emptyAc()
    const stash: Record<string, number> = {
      fieldstone: 20,
      clay: 25,
      coal: ALTAR_PHASE1_COAL_REQUIRED,
      oak: 15,
      birch: 8,
      iron_ore: ALTAR_PHASE1_IRON_ORE_REQUIRED,
      raw_leather: 6,
    }
    expect(
      canStartAltarPhase({
        phase: 1,
        materialStash: stash,
        unlockedCraftTechniqueIds: [],
        unlockedMaterialProcessingTechniqueIds: [],
        construction: ac,
      })
    ).toBe(true)
  })
})

describe('isMaterialProcessingTechniqueEffectiveUnlocked', () => {
  it('treats forge_basic_iron_smelt as unlocked by default', () => {
    expect(isMaterialProcessingTechniqueEffectiveUnlocked('forge_basic_iron_smelt', [])).toBe(true)
  })

  it('requires store entry for non-default techniques', () => {
    expect(isMaterialProcessingTechniqueEffectiveUnlocked('forge_fine_iron_smelt', [])).toBe(false)
    expect(isMaterialProcessingTechniqueEffectiveUnlocked('forge_fine_iron_smelt', ['forge_fine_iron_smelt'])).toBe(
      true
    )
  })
})

describe('computeAltarConstructionTick', () => {
  it('advances two stages when enough time passed', () => {
    const t0 = 1_000_000
    const ac: AltarConstructionState = {
      ...emptyAc(),
      activePhase: 1,
      activePhaseStartTime: t0,
      activePhaseStageIndex: 0,
      activePhaseStageStartTime: t0,
      activePhaseStages: [
        { id: 'a420', name: 'A', durationSec: 10, description: '' },
        { id: 'b420', name: 'B', durationSec: 5, description: '' },
      ],
    }
    const r = computeAltarConstructionTick(ac, t0 + 12_000)
    expect(r.kind).toBe('update')
    if (r.kind === 'update') {
      expect(r.patch.activePhaseStageIndex).toBe(1)
    }
  })

  it('completes phase after final stage elapsed', () => {
    const t0 = 2_000_000
    const ac: AltarConstructionState = {
      ...emptyAc(),
      activePhase: 1,
      activePhaseStartTime: t0,
      activePhaseStageIndex: 0,
      activePhaseStageStartTime: t0,
      activePhaseStages: [{ id: 's1', name: 'S', durationSec: 2, description: '' }],
    }
    const r = computeAltarConstructionTick(ac, t0 + 3_000)
    expect(r.kind).toBe('phaseComplete')
    if (r.kind === 'phaseComplete') {
      expect(r.phase).toBe(1)
      expect(r.constructionAfter.completedPhases).toContain(1)
      expect(r.constructionAfter.activePhase).toBeNull()
    }
  })
})

describe('getEffectiveUnlockedCraftTechniques', () => {
  it('includes baseline', () => {
    const s = getEffectiveUnlockedCraftTechniques(['spirit_blessing'])
    expect(s.has('basic_forging')).toBe(true)
    expect(s.has('spirit_blessing')).toBe(true)
  })
})
