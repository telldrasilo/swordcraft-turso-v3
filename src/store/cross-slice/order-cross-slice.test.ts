import { describe, it, expect, vi } from 'vitest'
import { buildOrderCrossSlice } from './order-cross-slice'
import type { NPCOrder } from '@/types/npc-order'

describe('buildOrderCrossSlice', () => {
  it('expireOrder marks available order as expired and clears activeOrderId', () => {
    const orders: NPCOrder[] = [
      {
        id: 'ord1',
        clientName: 'A',
        clientTitle: 't',
        clientIcon: 'i',
        weaponType: 'sword',
        material: 'iron',
        minQuality: 10,
        goldReward: 50,
        fameReward: 2,
        status: 'available',
        requiredLevel: 1,
        requiredFame: 0,
        deadline: Date.now() + 60_000,
      },
    ]
    let patch: { orders: NPCOrder[]; activeOrderId: string | null } | undefined
    const set = vi.fn((fn: (s: { orders: NPCOrder[]; activeOrderId: string | null }) => unknown) => {
      patch = fn({ orders, activeOrderId: 'ord1' }) as typeof patch
    })

    const { expireOrder } = buildOrderCrossSlice(
      set as (p: unknown) => void,
      () =>
        ({
          weaponInventory: { weapons: [] },
          orders,
          activeOrderId: 'ord1',
          player: { level: 1 },
          resources: {},
          statistics: { ordersCompleted: 0, totalGoldEarned: 0 },
          addResource: vi.fn(),
          addFame: vi.fn(),
          addReputation: vi.fn(),
          updateStatistics: vi.fn(),
          removeWeapon: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
      { completeOrder: vi.fn(), takeAdvance: vi.fn() }
    )

    expireOrder('ord1')
    expect(set).toHaveBeenCalledTimes(1)
    expect(patch?.orders[0]?.status).toBe('expired')
    expect(patch?.activeOrderId).toBeNull()
  })
})
