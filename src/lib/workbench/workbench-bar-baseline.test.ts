import { describe, expect, it } from 'vitest'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import {
  buildWorkbenchBarSegmentViews,
  findActiveSegmentIndex,
  freezeWorkbenchBarBaseline,
} from '@/lib/workbench/workbench-bar-baseline'

const repairItem = (
  queueItemId: string,
  weaponId: string,
  status: WorkbenchQueueItem['status'] = 'planned'
): WorkbenchQueueItem => ({
  kind: 'repair',
  queueItemId,
  weaponId,
  techniqueIds: ['edge_truing'],
  status,
  queuedAt: 0,
})

describe('workbench-bar-baseline', () => {
  it('freezeWorkbenchBarBaseline keeps order and normalizes widths', () => {
    const q = [repairItem('a', 'w1'), repairItem('b', 'w2')]
    const f = freezeWorkbenchBarBaseline(q)
    expect(f.order).toEqual(['a', 'b'])
    expect(f.widthPctById['a'] + f.widthPctById['b']).toBeCloseTo(100, 5)
  })

  it('with baseline, removed queue item keeps segment width', () => {
    const baseline = freezeWorkbenchBarBaseline([
      repairItem('a', 'w1', 'done'),
      repairItem('b', 'w2', 'planned'),
    ])
    const liveAfterRemove = [repairItem('a', 'w1', 'done')]
    const segs = buildWorkbenchBarSegmentViews(baseline, liveAfterRemove, { w1: 'Меч', w2: 'Топор' })
    expect(segs).toHaveLength(2)
    expect(segs[1].item).toBeNull()
    expect(segs[1].widthPct).toBe(baseline.widthPctById['b'])
  })

  it('findActiveSegmentIndex', () => {
    const segs = buildWorkbenchBarSegmentViews(null, [repairItem('x', 'w1', 'running')], {
      w1: 'Клинок',
    })
    expect(findActiveSegmentIndex(segs, 'x')).toBe(0)
    expect(findActiveSegmentIndex(segs, 'y')).toBe(-1)
  })
})
