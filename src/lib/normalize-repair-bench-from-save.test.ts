import { describe, expect, it } from 'vitest'
import {
  normalizeRepairBenchWeaponIdFromSave,
  normalizeRepairTechniqueStageRunFromSave,
} from './normalize-repair-bench-from-save'

describe('normalizeRepairBenchWeaponIdFromSave', () => {
  it('returns null for empty or missing', () => {
    expect(normalizeRepairBenchWeaponIdFromSave(undefined, [{ id: 'a' }])).toBe(null)
    expect(normalizeRepairBenchWeaponIdFromSave(null, [{ id: 'a' }])).toBe(null)
    expect(normalizeRepairBenchWeaponIdFromSave('', [{ id: 'a' }])).toBe(null)
  })

  it('returns id when weapon exists', () => {
    expect(normalizeRepairBenchWeaponIdFromSave('w1', [{ id: 'w1' }, { id: 'w2' }])).toBe('w1')
  })

  it('returns null when id not in inventory', () => {
    expect(normalizeRepairBenchWeaponIdFromSave('missing', [{ id: 'w1' }])).toBe(null)
  })
})

describe('normalizeRepairTechniqueStageRunFromSave', () => {
  const run = {
    weaponId: 'w1',
    startedAt: 1_700_000_000_000,
    techniqueIds: ['t1'],
  }

  it('returns null when raw missing or invalid', () => {
    expect(normalizeRepairTechniqueStageRunFromSave(null, 'w1', [{ id: 'w1' }])).toBe(null)
    expect(normalizeRepairTechniqueStageRunFromSave({}, 'w1', [{ id: 'w1' }])).toBe(null)
  })

  it('returns null when bench id mismatches', () => {
    expect(normalizeRepairTechniqueStageRunFromSave(run, null, [{ id: 'w1' }])).toBe(null)
    expect(normalizeRepairTechniqueStageRunFromSave(run, 'w2', [{ id: 'w1' }, { id: 'w2' }])).toBe(null)
  })

  it('returns null when weapon not in inventory', () => {
    expect(normalizeRepairTechniqueStageRunFromSave(run, 'w1', [{ id: 'w2' }])).toBe(null)
  })

  it('returns normalized run when valid', () => {
    expect(
      normalizeRepairTechniqueStageRunFromSave(run, 'w1', [{ id: 'w1' }])
    ).toEqual(run)
  })
})
