import { describe, expect, it } from 'vitest'
import { getRecipeById } from '@/data/recipes/index'
import { BASIC_SWORD_STAGES } from '@/data/recipes/basic-sword-stages'
import type { CraftLinePhase } from '@/types/craft-line'

/** Соответствует TZ §3.3 (индекс → фаза линии). */
const EXPECTED_PHASES: CraftLinePhase[] = [
  ...Array(2).fill('material_preparation' as CraftLinePhase),
  ...Array(17).fill('recipe_forming' as CraftLinePhase),
  ...Array(6).fill('craft_finishing' as CraftLinePhase),
]

describe('basic_sword craft line backbone contract', () => {
  it('рецепт использует тот же порядок стадий, что и BASIC_SWORD_STAGES', () => {
    const r = getRecipeById('basic_sword')
    expect(r).toBeDefined()
    if (!r) return
    expect(r.stages.length).toBe(BASIC_SWORD_STAGES.length)
    for (let i = 0; i < r.stages.length; i++) {
      const a = r.stages[i]
      const b = BASIC_SWORD_STAGES[i]
      expect(a).toBeDefined()
      expect(b).toBeDefined()
      if (a && b) expect(a.stageType).toBe(b.stageType)
    }
  })

  it('каждая стадия имеет уникальные id микроэтапов и craftLinePhase по ТЗ', () => {
    expect(BASIC_SWORD_STAGES.length).toBe(EXPECTED_PHASES.length)
    const ids = new Set<string>()
    for (let i = 0; i < BASIC_SWORD_STAGES.length; i++) {
      const s = BASIC_SWORD_STAGES[i]
      const phase = EXPECTED_PHASES[i]
      expect(s).toBeDefined()
      expect(phase).toBeDefined()
      if (!s || phase == null) continue
      expect(s.craftLinePhase).toBe(phase)
      const steps = s.craftLineMicroSteps
      expect(steps?.length).toBeGreaterThanOrEqual(1)
      if (!steps) continue
      for (const step of steps) {
        expect(ids.has(step.id)).toBe(false)
        ids.add(step.id)
      }
    }
  })
})
