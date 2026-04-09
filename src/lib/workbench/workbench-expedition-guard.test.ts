import { describe, expect, it } from 'vitest'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import {
  countPlannedWorkbenchItemsForWeapon,
  isWorkbenchDispatchSessionActive,
  shouldPromptExpeditionWorkbenchQueueDialog,
} from '@/lib/workbench/workbench-expedition-guard'

const repairQueued = (weaponId: string, status: WorkbenchQueueItem['status']): WorkbenchQueueItem => ({
  kind: 'repair',
  queueItemId: `${weaponId}-${status}`,
  weaponId,
  techniqueIds: [],
  status,
  queuedAt: 0,
})

describe('workbench-expedition-guard', () => {
  it('detects active dispatch session from running queue item', () => {
    const q = [repairQueued('w1', 'planned'), repairQueued('w2', 'running')]
    expect(isWorkbenchDispatchSessionActive(q, null)).toBe(true)
  })

  it('detects active dispatch session from stage run source queue', () => {
    expect(isWorkbenchDispatchSessionActive([], { source: 'queue' })).toBe(true)
  })

  it('no session when only planned', () => {
    const q = [repairQueued('w1', 'planned')]
    expect(isWorkbenchDispatchSessionActive(q, null)).toBe(false)
  })

  it('prompt only when weapon has planned and session not active', () => {
    const q = [repairQueued('w1', 'planned')]
    expect(shouldPromptExpeditionWorkbenchQueueDialog('w1', q, null)).toBe(true)
    expect(shouldPromptExpeditionWorkbenchQueueDialog('w2', q, null)).toBe(false)
  })

  it('no prompt when session active', () => {
    const q = [repairQueued('w1', 'planned'), repairQueued('w2', 'running')]
    expect(shouldPromptExpeditionWorkbenchQueueDialog('w1', q, null)).toBe(false)
  })

  it('counts planned items per weapon', () => {
    const q = [
      repairQueued('w1', 'planned'),
      repairQueued('w1', 'planned'),
      repairQueued('w1', 'running'),
    ]
    expect(countPlannedWorkbenchItemsForWeapon('w1', q)).toBe(2)
  })
})
