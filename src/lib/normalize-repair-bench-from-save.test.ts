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
    expect(normalizeRepairTechniqueStageRunFromSave(null, [{ id: 'w1' }])).toBe(null)
    expect(normalizeRepairTechniqueStageRunFromSave({}, [{ id: 'w1' }])).toBe(null)
  })

  it('returns null when weapon not in inventory', () => {
    expect(normalizeRepairTechniqueStageRunFromSave(run, [{ id: 'w2' }])).toBe(null)
  })

  it('returns normalized adhoc run when weapon in inventory (no legacy bench list)', () => {
    expect(normalizeRepairTechniqueStageRunFromSave(run, [{ id: 'w1' }])).toEqual(run)
  })

  it('returns null for queue run when activeQueueItemId missing from queue snapshot', () => {
    const qRun = {
      ...run,
      source: 'queue' as const,
      activeQueueItemId: 'missing-q',
    }
    expect(
      normalizeRepairTechniqueStageRunFromSave(qRun, [{ id: 'w1' }], [
        {
          kind: 'repair' as const,
          queueItemId: 'q-other',
          weaponId: 'w1',
          status: 'running' as const,
          techniqueIds: ['t1'],
          queuedAt: 1,
        },
      ])
    ).toBe(null)
  })

  it('accepts queue run when queue contains the item', () => {
    const qRun = {
      ...run,
      source: 'queue' as const,
      activeQueueItemId: 'q1',
    }
    expect(
      normalizeRepairTechniqueStageRunFromSave(qRun, [{ id: 'w1' }], [
        {
          kind: 'repair' as const,
          queueItemId: 'q1',
          weaponId: 'w1',
          status: 'running' as const,
          techniqueIds: ['t1'],
          queuedAt: 1,
        },
      ])
    ).toEqual(qRun)
  })
})
