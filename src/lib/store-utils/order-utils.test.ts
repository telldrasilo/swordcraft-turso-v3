import { describe, expect, it } from 'vitest'
import { weaponRecipes } from '@/data/weapon-recipes'
import type { NPCOrder } from '@/types/npc-order'
import {
  calculateFameReward,
  calculateGoldReward,
  calculateGoldRewardRange,
  canAcceptOrder,
  checkExpiredOrders,
  checkWeaponMatchesOrder,
  completeOrder,
  getOrderRemainingTime,
  isOrderExpired,
} from './order-utils'

const ironSwordRecipeRaw = weaponRecipes.find(r => r.id === 'iron_sword')
if (!ironSwordRecipeRaw) throw new Error('fixture: iron_sword recipe')
const ironSwordRecipe = ironSwordRecipeRaw

describe('calculateGoldReward', () => {
  it('uses numeric material cost when provided', () => {
    const r = calculateGoldReward(40, 'sword', 'iron', 5, 50)
    expect(r).toBeGreaterThanOrEqual(30)
    expect(r).toBeLessThanOrEqual(200)
  })

  it('uses legacy recipe cost when passed', () => {
    const r = calculateGoldReward(30, 'sword', 'iron', 3, ironSwordRecipe)
    expect(r).toBeGreaterThanOrEqual(30)
  })
})

describe('calculateGoldRewardRange', () => {
  it('interpolates current reward between min and max quality', () => {
    const range = calculateGoldRewardRange(40, 'sword', 'iron', 2, 40)
    expect(range.min).toBeLessThanOrEqual(range.max)
    expect(range.current(40)).toBe(range.min)
    expect(range.current(100)).toBe(range.max)
    const mid = range.current(70)
    expect(mid).toBeGreaterThanOrEqual(range.min)
    expect(mid).toBeLessThanOrEqual(range.max)
  })
})

describe('calculateFameReward', () => {
  it('increases slightly with min quality', () => {
    const low = calculateFameReward(10, 0)
    const high = calculateFameReward(50, 0)
    expect(high).toBeGreaterThanOrEqual(low)
  })
})

describe('canAcceptOrder', () => {
  it('requires available status and no active order', () => {
    expect(canAcceptOrder({
      orderStatus: 'in_progress',
      hasActiveOrder: false,
      playerLevel: 10,
      playerFame: 100,
      requiredLevel: 1,
      requiredFame: 0,
    }).can).toBe(false)

    expect(canAcceptOrder({
      orderStatus: 'available',
      hasActiveOrder: true,
      playerLevel: 10,
      playerFame: 100,
      requiredLevel: 1,
      requiredFame: 0,
    }).can).toBe(false)

    expect(canAcceptOrder({
      orderStatus: 'available',
      hasActiveOrder: false,
      playerLevel: 10,
      playerFame: 100,
      requiredLevel: 1,
      requiredFame: 0,
    }).can).toBe(true)
  })

  it('blocks when level or fame is too low', () => {
    expect(canAcceptOrder({
      orderStatus: 'available',
      hasActiveOrder: false,
      playerLevel: 1,
      playerFame: 0,
      requiredLevel: 5,
      requiredFame: 0,
    }).can).toBe(false)

    expect(canAcceptOrder({
      orderStatus: 'available',
      hasActiveOrder: false,
      playerLevel: 10,
      playerFame: 0,
      requiredLevel: 1,
      requiredFame: 100,
    }).can).toBe(false)
  })
})

describe('checkWeaponMatchesOrder', () => {
  it('validates type, quality, attack, material', () => {
    const base = {
      weaponQuality: 50,
      weaponAttack: 30,
      weaponType: 'sword',
      weaponMaterial: 'iron',
      orderMinQuality: 40,
      orderWeaponType: 'sword',
    }
    expect(checkWeaponMatchesOrder({ ...base }).matches).toBe(true)

    expect(checkWeaponMatchesOrder({ ...base, weaponType: 'axe' }).matches).toBe(false)

    expect(checkWeaponMatchesOrder({ ...base, weaponQuality: 30 }).matches).toBe(false)

    expect(checkWeaponMatchesOrder({
      ...base,
      orderMinAttack: 50,
      weaponAttack: 20,
    }).matches).toBe(false)

    expect(checkWeaponMatchesOrder({
      ...base,
      orderMaterial: 'steel',
    }).matches).toBe(false)
  })
})

describe('completeOrder', () => {
  it('delegates to weapon check and pays rewards on success', () => {
    const ok = completeOrder({
      orderId: 'o1',
      weaponId: 'w1',
      weaponQuality: 50,
      weaponAttack: 30,
      weaponType: 'sword',
      weaponRecipeId: 'iron_sword',
      orderMinQuality: 40,
      orderWeaponType: 'sword',
      orderGoldReward: 80,
      orderFameReward: 5,
    })
    expect(ok.success).toBe(true)
    expect(ok.goldEarned).toBe(80)
    expect(ok.fameEarned).toBe(5)
  })

  it('returns error when weapon does not match', () => {
    const bad = completeOrder({
      orderId: 'o1',
      weaponId: 'w1',
      weaponQuality: 20,
      weaponAttack: 30,
      weaponType: 'sword',
      weaponRecipeId: 'iron_sword',
      orderMinQuality: 40,
      orderWeaponType: 'sword',
      orderGoldReward: 80,
      orderFameReward: 5,
    })
    expect(bad.success).toBe(false)
    expect(bad.error).toBeDefined()
  })
})

describe('order deadlines', () => {
  it('detects expiry and remaining seconds', () => {
    expect(isOrderExpired(1000, 1001)).toBe(true)
    expect(isOrderExpired(2000, 1000)).toBe(false)
    expect(getOrderRemainingTime(5000, 4000)).toBe(1)
  })

  it('marks available orders expired when past deadline', () => {
    const past = Date.now() - 1000
    const orders: NPCOrder[] = [{
      id: 'o1',
      clientName: 'a',
      clientTitle: 'b',
      clientIcon: 'c',
      weaponType: 'sword',
      minQuality: 10,
      goldReward: 1,
      fameReward: 1,
      status: 'available',
      requiredLevel: 1,
      requiredFame: 0,
      deadline: past,
    }]
    const next = checkExpiredOrders(orders)
    expect(next[0]?.status).toBe('expired')
  })
})
