import { describe, expect, it } from 'vitest'
import { incrementScarWeightsFromClearedTags, normalizeTopScarWeights } from './scar-weights'

describe('normalizeTopScarWeights', () => {
  it('оставляет не более трёх ключей с max весом', () => {
    expect(
      normalizeTopScarWeights({
        a: 1,
        b: 5,
        c: 3,
        d: 2,
      })
    ).toEqual({ b: 5, c: 3, d: 2 })
  })

  it('при равных весах стабильно по имени ключа', () => {
    expect(
      normalizeTopScarWeights({
        z: 2,
        m: 2,
        a: 2,
        b: 2,
      })
    ).toEqual({ a: 2, b: 2, m: 2 })
  })
})

describe('incrementScarWeightsFromClearedTags', () => {
  it('физический тег → scar_*', () => {
    const r = incrementScarWeightsFromClearedTags(undefined, undefined, ['physical_slash_chip'])
    expect(r.physicalScarWeights).toEqual({ scar_slash_ragged: 1 })
    expect(r.elementalScarWeights).toEqual({})
  })

  it('стихийный тег → ось', () => {
    const r = incrementScarWeightsFromClearedTags(undefined, undefined, ['elemental_frost_bite'])
    expect(r.elementalScarWeights).toEqual({ frost: 1 })
    expect(r.physicalScarWeights).toEqual({})
  })

  it('скверна → ось skverna', () => {
    const r = incrementScarWeightsFromClearedTags(undefined, undefined, ['elemental_skverna_taint'])
    expect(r.elementalScarWeights).toEqual({ skverna: 1 })
  })

  it('накопление и усечение топ-3 в группе', () => {
    let p: Record<string, number> | undefined
    let e: Record<string, number> | undefined
    const tags = [
      'physical_slash_chip',
      'physical_blunt_dull',
      'physical_gouge_chunk',
      'physical_loose_fitting',
    ]
    for (const t of tags) {
      const r = incrementScarWeightsFromClearedTags(p, e, [t])
      p = r.physicalScarWeights
      e = r.elementalScarWeights
    }
    expect(p).toBeDefined()
    const finalPhysical = p as Record<string, number>
    expect(Object.keys(finalPhysical).length).toBe(3)
    expect(Object.values(finalPhysical).reduce((a, b) => a + b, 0)).toBe(3)
  })
})
