import { describe, expect, it } from 'vitest'
import { weaponRecipes } from '@/data/weapon-recipes'
import type { NPCOrder } from '@/types/npc-order'
import { initialResources } from '@/store/slices/resources-slice'
import { initialUnlockedRecipes } from '@/store/slices/craft-slice'
import {
  calculateMaterialCostForOrder,
  calculateMaxAchievableAttack,
  calculateMinAchievableQuality,
  checkCanAffordRecipeMaterials,
  checkOrderAchievability,
  generateMaterialAdvance,
} from './order-achievable-utils'

const ironSwordRaw = weaponRecipes.find(r => r.id === 'iron_sword')
if (!ironSwordRaw) throw new Error('fixture: iron_sword recipe')
const ironSword = ironSwordRaw

const baseOrder = (): NPCOrder => ({
  id: 'ord1',
  clientName: 'c',
  clientTitle: 't',
  clientIcon: 'i',
  weaponType: 'sword',
  material: 'iron',
  minQuality: 25,
  goldReward: 100,
  fameReward: 5,
  status: 'available',
  requiredLevel: 1,
  requiredFame: 0,
})

describe('calculateMinAchievableQuality', () => {
  it('grows with player level', () => {
    expect(calculateMinAchievableQuality(1)).toBeLessThan(calculateMinAchievableQuality(10))
  })
})

describe('calculateMaxAchievableAttack', () => {
  it('returns positive attack for a recipe', () => {
    const atk = calculateMaxAchievableAttack(ironSword, 5)
    expect(atk).toBeGreaterThan(0)
  })
})

describe('checkCanAffordRecipeMaterials', () => {
  it('returns true when inventory covers recipe.cost', () => {
    const rich = {
      ...initialResources,
      ironIngot: 100,
      coal: 100,
      planks: 100,
    }
    expect(checkCanAffordRecipeMaterials(ironSword, rich)).toBe(true)
  })

  it('returns false when a resource is short', () => {
    const poor = { ...initialResources, ironIngot: 0, coal: 99, planks: 99 }
    expect(checkCanAffordRecipeMaterials(ironSword, poor)).toBe(false)
  })
})

describe('calculateMaterialCostForOrder', () => {
  it('aggregates sell prices for recipe cost entries', () => {
    const { materials, totalCost } = calculateMaterialCostForOrder(ironSword)
    expect(materials.length).toBeGreaterThan(0)
    expect(totalCost).toBeGreaterThan(0)
  })
})

describe('generateMaterialAdvance', () => {
  it('caps advance at half of original reward', () => {
    const adv = generateMaterialAdvance(ironSword, 100)
    expect(adv).not.toBeNull()
    if (!adv) throw new Error('expected advance')
    expect(adv.totalCost).toBeLessThanOrEqual(50)
  })
})

describe('checkOrderAchievability', () => {
  const contextOk = {
    playerLevel: 10,
    playerFame: 100,
    playerResources: { ...initialResources },
    unlockedRecipes: initialUnlockedRecipes,
    existingClients: [],
  }

  it('returns achievable for a basic iron sword order', () => {
    const r = checkOrderAchievability(baseOrder(), contextOk)
    expect(r.achievable).toBe(true)
  })

  it('fails when level requirement is too high', () => {
    const r = checkOrderAchievability(
      { ...baseOrder(), requiredLevel: 100 },
      contextOk
    )
    expect(r.achievable).toBe(false)
  })

  it('fails when fame requirement is too high', () => {
    const r = checkOrderAchievability(
      { ...baseOrder(), requiredFame: 99999 },
      contextOk
    )
    expect(r.achievable).toBe(false)
  })

  it('fails when recipe is not unlocked', () => {
    const r = checkOrderAchievability(baseOrder(), {
      ...contextOk,
      unlockedRecipes: { weaponRecipes: [], refiningRecipes: [] },
    })
    expect(r.achievable).toBe(false)
  })
})
