import { describe, expect, it } from 'vitest'
import { weaponRecipes } from '@/data/weapon-recipes'
import { getCraftingCost } from '@/lib/craft/inventory-check'
import { calculateMaterialCostForOrder } from '@/lib/store-utils/order-achievable-utils'
import { craftingResourceCostMapToGoldApprox } from '@/lib/store-utils/order-material-cost-gold'

describe('craftingResourceCostMapToGoldApprox', () => {
  it('использует RESOURCE_SELL_PRICES согласованно для заказов и награды', () => {
    const cost = craftingResourceCostMapToGoldApprox({ ironIngot: 3, coal: 5, planks: 2 })
    // 3*4 + 5*1.5 + 2*0.5 = 12 + 7.5 + 1 = 20.5
    expect(cost).toBeCloseTo(20.5, 6)
  })

  it('совпадает с calculateMaterialCostForOrder для legacy iron_sword', () => {
    const recipe = weaponRecipes.find(r => r.id === 'iron_sword')
    if (!recipe) throw new Error('fixture')
    const fromOrderUtils = calculateMaterialCostForOrder(recipe).totalCost
    const fromMap = craftingResourceCostMapToGoldApprox(
      getCraftingCost(recipe, {}) as Record<string, number>
    )
    expect(fromOrderUtils).toBe(fromMap)
  })
})
