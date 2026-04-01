import { describe, expect, it, vi } from 'vitest'
import type { ResourceKey } from '@/store/slices/resources-slice'
import type { Worker } from '@/store/slices/workers-slice'
import { buildRepairCrossSlice } from './repair-cross-slice'

function mockState(over: Partial<ReturnType<typeof baseState>> = {}) {
  return { ...baseState(), ...over }
}

function baseState() {
  return {
    weaponInventory: { weapons: [] as import('@/types/craft-v2').CraftedWeaponV2[] },
    workers: [] as Worker[],
    resources: { gold: 0 } as { gold: number } & Partial<Record<ResourceKey, number>>,
    spendResource: vi.fn(),
    canAfford: vi.fn(() => true),
    updateWorkerStamina: vi.fn(),
  }
}

describe('buildRepairCrossSlice', () => {
  it('executeWeaponRepair returns error when weapon missing', () => {
    const set = vi.fn()
    const get = vi.fn(() => mockState())
    const { executeWeaponRepair } = buildRepairCrossSlice(set, get)
    const r = executeWeaponRepair('no_such', 'quick')
    expect(r.success).toBe(false)
    expect(r.error).toBe('Оружие не найдено')
  })

  it('getRepairOptions returns empty when weapon missing', () => {
    const set = vi.fn()
    const get = vi.fn(() => mockState())
    const { getRepairOptions } = buildRepairCrossSlice(set, get)
    expect(getRepairOptions('none')).toEqual([])
  })

  it('getWeaponRepairCost returns 0 when weapon missing', () => {
    const set = vi.fn()
    const get = vi.fn(() => mockState())
    const { getWeaponRepairCost } = buildRepairCrossSlice(set, get)
    expect(getWeaponRepairCost('none')).toBe(0)
  })
})
