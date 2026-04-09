import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type {
  InventoryFilterDamage,
  InventoryFilterQuality,
  InventorySortBy,
} from '@/store/slices/inventory-filter-slice'

function weaponPowerSortKey(w: CraftedWeaponV2): number {
  if (typeof w.powerScore === 'number' && Number.isFinite(w.powerScore)) {
    return w.powerScore
  }
  return w.stats.attack
}

function isWeaponDamaged(w: CraftedWeaponV2): boolean {
  const tags = w.activeDamageTags?.length ?? 0
  if (tags > 0) return true
  const cur = w.currentDurability ?? w.stats.durability
  return cur < w.stats.maxDurability
}

export function filterWeaponsByInventoryFilters(
  weapons: readonly CraftedWeaponV2[],
  filterQuality: InventoryFilterQuality,
  filterDamage: InventoryFilterDamage
): CraftedWeaponV2[] {
  let out = [...weapons]
  if (filterQuality !== 'all') {
    out = out.filter((w) => w.qualityGrade === filterQuality)
  }
  if (filterDamage === 'damaged') {
    out = out.filter(isWeaponDamaged)
  } else if (filterDamage === 'undamaged') {
    out = out.filter((w) => !isWeaponDamaged(w))
  }
  return out
}

export function sortWeaponsByInventorySort(
  weapons: readonly CraftedWeaponV2[],
  sortBy: InventorySortBy
): CraftedWeaponV2[] {
  const arr = [...weapons]
  arr.sort((a, b) => {
    switch (sortBy) {
      case 'power':
        return weaponPowerSortKey(b) - weaponPowerSortKey(a)
      case 'date':
        return b.createdAt - a.createdAt
      case 'quality':
        return b.quality - a.quality
      case 'durability': {
        const da = a.currentDurability ?? a.stats.durability
        const db = b.currentDurability ?? b.stats.durability
        return db - da
      }
      default:
        return 0
    }
  })
  return arr
}

export function applyInventoryListFilters(
  weapons: readonly CraftedWeaponV2[],
  params: {
    sortBy: InventorySortBy
    filterQuality: InventoryFilterQuality
    filterDamage: InventoryFilterDamage
  }
): CraftedWeaponV2[] {
  const filtered = filterWeaponsByInventoryFilters(
    weapons,
    params.filterQuality,
    params.filterDamage
  )
  return sortWeaponsByInventorySort(filtered, params.sortBy)
}
