import { describe, expect, it } from 'vitest'
import {
  findNextRepairQueueItemIndex,
  findNextRepairQueueItemIndexAfterFailure,
  isEligibleRepairQueueStatus,
} from './repair-queue-next-item'
import type { RepairQueuePlanItem } from '@/store/slices/craft-slice'

function item(
  weaponId: string,
  status: RepairQueuePlanItem['status']
): RepairQueuePlanItem {
  return {
    kind: 'repair',
    queueItemId: `wq_test_${weaponId}`,
    weaponId,
    techniqueIds: [],
    queuedAt: 0,
    status,
  }
}

describe('isEligibleRepairQueueStatus', () => {
  it('allows planned and error', () => {
    expect(isEligibleRepairQueueStatus('planned')).toBe(true)
    expect(isEligibleRepairQueueStatus('error')).toBe(true)
    expect(isEligibleRepairQueueStatus('running')).toBe(false)
    expect(isEligibleRepairQueueStatus('done')).toBe(false)
  })
})

describe('findNextRepairQueueItemIndex', () => {
  it('returns first eligible from start when afterIndex is -1', () => {
    const items = [item('a', 'done'), item('b', 'planned')]
    expect(findNextRepairQueueItemIndex(items, -1)).toBe(1)
  })

  it('prefers indices after afterIndex before wrapping', () => {
    const items = [item('a', 'planned'), item('b', 'planned'), item('c', 'done')]
    expect(findNextRepairQueueItemIndex(items, 0)).toBe(1)
  })

  it('wraps to earlier indices when nothing after', () => {
    const items = [item('a', 'planned'), item('b', 'done')]
    expect(findNextRepairQueueItemIndex(items, 1)).toBe(0)
  })

  it('does not reuse afterIndex so a single failing item does not loop', () => {
    const items = [item('solo', 'error')]
    expect(findNextRepairQueueItemIndex(items, 0)).toBe(-1)
  })

  it('returns -1 when no eligible', () => {
    const items = [item('a', 'done'), item('b', 'running')]
    expect(findNextRepairQueueItemIndex(items, 1)).toBe(-1)
  })
})

describe('findNextRepairQueueItemIndexAfterFailure', () => {
  it('only looks forward', () => {
    const items = [item('a', 'error'), item('b', 'planned')]
    expect(findNextRepairQueueItemIndexAfterFailure(items, 0)).toBe(1)
  })

  it('does not wrap to earlier error entries', () => {
    const items = [item('a', 'error'), item('b', 'error')]
    expect(findNextRepairQueueItemIndexAfterFailure(items, 1)).toBe(-1)
  })
})
