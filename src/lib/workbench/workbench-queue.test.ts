import { describe, expect, it } from 'vitest'
import {
  estimateWorkbenchQueueItemDurationMs,
  normalizeWorkbenchQueueFromSave,
  removeAllPlannedQueueItemsForWeapon,
  createRepairWorkbenchQueueItem,
  findNextWorkbenchQueueItemIndex,
  findNextPlannedWorkbenchQueueItemIndex,
  reorderPlannedWorkbenchQueueItems,
} from '@/lib/workbench/workbench-queue'

describe('normalizeWorkbenchQueueFromSave', () => {
  it('migrates legacy repair row without kind and queueItemId', () => {
    const q = normalizeWorkbenchQueueFromSave([
      {
        status: 'planned',
        weaponId: 'w1',
        techniqueIds: ['edge_truing'],
        queuedAt: 100,
      },
    ])
    expect(q).toHaveLength(1)
    expect(q[0]?.kind).toBe('repair')
    expect(q[0]?.weaponId).toBe('w1')
    expect((q[0] as { techniqueIds: string[] }).techniqueIds).toEqual(['edge_truing'])
    expect(q[0]?.queueItemId).toMatch(/^wq_w1_100_0$/)
  })

  it('returns empty for non-array', () => {
    expect(normalizeWorkbenchQueueFromSave(null)).toEqual([])
  })
})

describe('removeAllPlannedQueueItemsForWeapon', () => {
  it('removes only planned for weaponId', () => {
    const a = createRepairWorkbenchQueueItem({
      weaponId: 'a',
      techniqueIds: ['edge_truing'],
    })
    const b = createRepairWorkbenchQueueItem({
      weaponId: 'b',
      techniqueIds: ['edge_truing'],
    })
    const running = { ...a, status: 'running' as const }
    const next = removeAllPlannedQueueItemsForWeapon([a, b, running], 'a')
    expect(next).toHaveLength(2)
    expect(next.some((x) => x.weaponId === 'a' && x.status === 'planned')).toBe(false)
    expect(next.some((x) => x.weaponId === 'a' && x.status === 'running')).toBe(true)
    expect(next.some((x) => x.weaponId === 'b')).toBe(true)
  })
})

describe('estimateWorkbenchQueueItemDurationMs', () => {
  it('is positive for repair with known techniques', () => {
    const item = createRepairWorkbenchQueueItem({
      weaponId: 'w',
      techniqueIds: ['edge_truing'],
    })
    const ms = estimateWorkbenchQueueItemDurationMs(item)
    expect(ms).toBeGreaterThan(0)
  })
})

describe('reorderPlannedWorkbenchQueueItems', () => {
  it('swaps two planned rows', () => {
    const a = createRepairWorkbenchQueueItem({ weaponId: 'a', techniqueIds: ['edge_truing'] })
    const b = createRepairWorkbenchQueueItem({ weaponId: 'b', techniqueIds: ['edge_truing'] })
    const next = reorderPlannedWorkbenchQueueItems([a, b], 0, 1)
    expect(next?.map((x) => x.weaponId)).toEqual(['b', 'a'])
  })

  it('returns null when moving running item', () => {
    const a = { ...createRepairWorkbenchQueueItem({ weaponId: 'a', techniqueIds: ['edge_truing'] }), status: 'running' as const }
    const b = createRepairWorkbenchQueueItem({ weaponId: 'b', techniqueIds: ['edge_truing'] })
    expect(reorderPlannedWorkbenchQueueItems([a, b], 0, 1)).toBe(null)
  })
})

describe('findNextPlannedWorkbenchQueueItemIndex', () => {
  it('skips error rows and does not wrap into them', () => {
    const err = {
      ...createRepairWorkbenchQueueItem({ weaponId: 'a', techniqueIds: ['edge_truing'] }),
      status: 'error' as const,
    }
    const nextPlanned = createRepairWorkbenchQueueItem({
      weaponId: 'b',
      techniqueIds: ['edge_truing'],
    })
    expect(findNextPlannedWorkbenchQueueItemIndex([err, nextPlanned], 0)).toBe(1)
    expect(findNextPlannedWorkbenchQueueItemIndex([nextPlanned, err], 1)).toBe(0)
  })
})

describe('findNextWorkbenchQueueItemIndex', () => {
  it('advances from completed repair to planned reforge in same pack', () => {
    const doneRepair = {
      ...createRepairWorkbenchQueueItem({ weaponId: 'w', techniqueIds: ['edge_truing'] }),
      status: 'done' as const,
    }
    const reforge = {
      kind: 'reforge_buff' as const,
      queueItemId: 'wq_reforge_1',
      weaponId: 'w',
      techniqueId: 'reforge_buff_attack_01',
      status: 'planned' as const,
      queuedAt: 1,
    }
    expect(findNextWorkbenchQueueItemIndex([doneRepair, reforge], 0)).toBe(1)
  })
})
