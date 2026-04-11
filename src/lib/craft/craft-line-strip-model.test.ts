import { describe, expect, it } from 'vitest'
import { buildTechniqueBracketSpans, thermalBandForStageType } from '@/lib/craft/craft-line-strip-model'
import type { CraftLineSegment } from '@/types/craft-line'

describe('craft-line-strip-model', () => {
  it('buildTechniqueBracketSpans объединяет подряд идущие сегменты одной техники', () => {
    const segments: CraftLineSegment[] = [
      {
        source: 'technique',
        techniqueRef: { kind: 'craft', id: 'basic_forging' },
        microTaskIndex: 0,
        durationShare: 0.05,
        colorToken: 'craftLine.recipe_forming',
        label: 'a',
      },
      {
        source: 'technique',
        techniqueRef: { kind: 'craft', id: 'basic_forging' },
        microTaskIndex: 1,
        durationShare: 0.05,
        colorToken: 'craftLine.recipe_forming',
        label: 'b',
      },
      {
        source: 'recipe_backbone',
        recipeId: 'basic_sword',
        stageIndex: 0,
        stableId: 'x',
        durationShare: 0.9,
        colorToken: 'craftLine.recipe_forming',
        label: 'c',
      },
    ]
    const spans = buildTechniqueBracketSpans(segments)
    expect(spans).toHaveLength(1)
    expect(spans[0].widthPct).toBeCloseTo(10, 5)
    expect(spans[0].leftPct).toBe(0)
  })

  it('thermalBandForStageType: плавка горячая, полировка холодная', () => {
    expect(thermalBandForStageType('proc_smelting')).toBe('hot')
    expect(thermalBandForStageType('fin_polishing')).toBe('cryo')
  })
})
