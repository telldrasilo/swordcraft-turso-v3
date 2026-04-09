import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildOrderCrossSlice } from './order-cross-slice'
import type { NPCOrder } from '@/types/npc-order'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

import { toast } from '@/hooks/use-toast'

describe('buildOrderCrossSlice', () => {
  beforeEach(() => {
    vi.mocked(toast).mockClear()
  })
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

  it('completeOrder returns false and toasts when weapon has visible damage tags', () => {
    const damaged = {
      id: 'w1',
      quality: 80,
      currentDurability: 40,
      stats: { attack: 30, maxDurability: 100, durability: 40 },
      type: 'sword',
      recipeId: 'iron_sword',
      hiddenTags: ['sword', 'iron'],
      activeDamageTags: [{ tagId: 'physical_slash_chip', severity: 'light' as const, appliedAt: 0 }],
      repairCondition: 'ok' as const,
    } as unknown as CraftedWeaponV2

    const order: NPCOrder = {
      id: 'ord1',
      clientName: 'A',
      clientTitle: 't',
      clientIcon: 'i',
      weaponType: 'sword',
      material: 'iron',
      minQuality: 10,
      goldReward: 50,
      fameReward: 2,
      status: 'in_progress',
      requiredLevel: 1,
      requiredFame: 0,
      deadline: Date.now() + 60_000,
    }

    const completeOrderInner = vi.fn().mockReturnValue({ success: true, rewards: { gold: 50, fame: 2 } })

    const { completeOrder } = buildOrderCrossSlice(
      vi.fn() as (p: unknown) => void,
      () =>
        ({
          weaponInventory: { weapons: [damaged] },
          workbenchQueue: [],
          repairTechniqueStageRun: null,
          orders: [order],
          activeOrderId: 'ord1',
          player: { level: 5 },
          resources: { gold: 0 },
          statistics: { ordersCompleted: 0, totalGoldEarned: 0 },
          addResource: vi.fn(),
          grantResourceKeyFromWorld: vi.fn(),
          addFame: vi.fn(),
          addReputation: vi.fn(),
          updateStatistics: vi.fn(),
          removeWeapon: vi.fn(),
        }) as never,
      { completeOrder: completeOrderInner, takeAdvance: vi.fn() }
    )

    expect(completeOrder('ord1', 'w1')).toBe(false)
    expect(completeOrderInner).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: expect.stringMatching(/не принимают/i),
      })
    )
  })
})
