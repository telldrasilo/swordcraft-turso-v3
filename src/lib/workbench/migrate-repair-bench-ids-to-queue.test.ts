import { describe, expect, it } from 'vitest'
import { appendRepairQueueItemsFromLegacyBenchIds } from '@/lib/workbench/migrate-repair-bench-ids-to-queue'
import { createRepairWorkbenchQueueItem } from '@/lib/workbench/workbench-queue'

describe('appendRepairQueueItemsFromLegacyBenchIds', () => {
  it('adds empty repair planned for each bench id not yet in queue', () => {
    const { queue, addedCount } = appendRepairQueueItemsFromLegacyBenchIds({
      benchIds: ['w1', 'w2'],
      queue: [],
    })
    expect(addedCount).toBe(2)
    expect(queue).toHaveLength(2)
    expect(queue.every((i) => i.kind === 'repair' && i.status === 'planned')).toBe(true)
    expect(queue.map((i) => i.weaponId).sort()).toEqual(['w1', 'w2'])
    expect(queue.every((i) => i.kind === 'repair' && i.techniqueIds.length === 0)).toBe(true)
  })

  it('does nothing for empty bench ids', () => {
    const existing = [createRepairWorkbenchQueueItem({ weaponId: 'w1', techniqueIds: ['a'] })]
    const { queue, addedCount } = appendRepairQueueItemsFromLegacyBenchIds({
      benchIds: [],
      queue: existing,
    })
    expect(addedCount).toBe(0)
    expect(queue).toEqual(existing)
  })

  it('skips weapon when repair planned or running already exists', () => {
    const planned = createRepairWorkbenchQueueItem({ weaponId: 'w1', techniqueIds: ['x'] })
    const { queue, addedCount } = appendRepairQueueItemsFromLegacyBenchIds({
      benchIds: ['w1', 'w2'],
      queue: [planned],
    })
    expect(addedCount).toBe(1)
    expect(queue).toHaveLength(2)
    const w1 = queue.filter((i) => i.weaponId === 'w1')
    expect(w1).toHaveLength(1)
    expect(w1[0].kind === 'repair' ? w1[0].techniqueIds : []).toEqual(['x'])
    expect(queue.some((i) => i.weaponId === 'w2')).toBe(true)
  })

  it('still adds if only reforge exists for weapon', () => {
    const reforge = {
      kind: 'reforge_buff' as const,
      queueItemId: 'q1',
      weaponId: 'w1',
      techniqueId: 't1',
      status: 'planned' as const,
      queuedAt: 1,
    }
    const { queue, addedCount } = appendRepairQueueItemsFromLegacyBenchIds({
      benchIds: ['w1'],
      queue: [reforge],
    })
    expect(addedCount).toBe(1)
    expect(queue).toHaveLength(2)
    expect(queue.some((i) => i.kind === 'repair' && i.weaponId === 'w1')).toBe(true)
  })
})
