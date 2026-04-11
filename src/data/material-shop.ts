/**
 * Материалы в магазине
 * Стартовый ассортимент покупки — §3.5 MATERIALS_SINGLE_SOURCE_ROADMAP: iron_ore, coal, birch.
 * Расширение: новые строки + условие видимости (вне скоупа текущего рефакторинга).
 *
 * Начисление: `grantResourceKeyFromWorld` по `resourceKey`, либо `addMaterialToStash` при `stashMaterialId`.
 */

import { REFINING_INPUT_STAGE_MATERIAL_ID } from '@/data/refining-recipes'
import { materialById } from '@/data/materials/library'
import { emojiFromLegacyResourcePngPath, RESOURCE_KEY_EMOJI } from '@/lib/ui/resource-emoji'
import type { ResourceKey } from '@/store/slices/resources-slice'

export interface MaterialShopItem {
  /** Стабильный id оффера (разблокировки — точка расширения по roadmap). */
  offerId: string
  resourceKey: ResourceKey
  /**
   * Если задано, покупка начисляет этот каталожный id на склад напрямую
   * (когда `grantResourceKeyFromWorld(resourceKey)` дал бы другой id).
   */
  stashMaterialId?: string
  name: string
  icon: string
  basePrice: number
  available: boolean
  description: string
  category: 'metal' | 'fuel' | 'wood' | 'stone' | 'special'
}

/** Те же представители stash, что `getGrantTargetMaterialId` в inventory-check (дубль намеренно). */
const SHOP_STASH_GRANT_FALLBACK: Partial<Record<ResourceKey, string>> = {
  leather: 'raw_leather',
  planks: 'processed_wood',
  stoneBlocks: 'processed_stone',
  ironIngot: 'iron_alloy',
  copperIngot: 'copper_alloy',
  tinIngot: 'tin_alloy',
  bronzeIngot: 'bronze',
  steelIngot: 'steel',
  silverIngot: 'silver_alloy',
  goldIngot: 'gold_alloy',
  mithrilIngot: 'mithril_alloy',
}

/** Канал покупки: id для `addMaterialToStash` (лавка, контракт). */
export function getShopCatalogMaterialId(item: MaterialShopItem): string | null {
  if (item.stashMaterialId) return item.stashMaterialId
  const resourceKey = item.resourceKey
  if (resourceKey === 'gold' || resourceKey === 'soulEssence') return null
  const fromRefining =
    REFINING_INPUT_STAGE_MATERIAL_ID[resourceKey as keyof typeof REFINING_INPUT_STAGE_MATERIAL_ID]
  if (fromRefining !== undefined) return fromRefining
  const fb = SHOP_STASH_GRANT_FALLBACK[resourceKey]
  if (fb !== undefined) return fb
  if (materialById[resourceKey]) return resourceKey
  return null
}

function displayIconFromCatalogNode(
  rawIcon: string | undefined,
  resourceKey: ResourceKey,
  fallback: string
): string {
  const t = rawIcon?.trim()
  if (!t) return fallback
  const fromPath = emojiFromLegacyResourcePngPath(t)
  if (fromPath) return fromPath
  if (t.startsWith('/') && t.toLowerCase().endsWith('.png')) {
    return RESOURCE_KEY_EMOJI[resourceKey] ?? fallback
  }
  return t
}

function enrichShopItemFromCatalog(item: MaterialShopItem): MaterialShopItem {
  const mid = getShopCatalogMaterialId(item)
  const node = mid ? materialById[mid] : undefined
  if (!node?.identity?.name) return item
  return {
    ...item,
    name: node.identity.name,
    icon: displayIconFromCatalogNode(node.icon, item.resourceKey, item.icon),
  }
}

// ================================
// ДАННЫЕ МАГАЗИНА
// ================================

export const materialShopItems: MaterialShopItem[] = [
  {
    offerId: 'shop_iron_ore',
    resourceKey: 'iron',
    stashMaterialId: 'iron_ore',
    name: 'Железная руда',
    icon: '⛏️',
    basePrice: 4,
    available: true,
    description: 'Руда для плавки (каталог: iron_ore).',
    category: 'metal',
  },
  {
    offerId: 'shop_coal',
    resourceKey: 'coal',
    stashMaterialId: 'coal',
    name: 'Уголь',
    icon: '⚫',
    basePrice: 2,
    available: true,
    description: 'Топливо для горна.',
    category: 'fuel',
  },
  {
    offerId: 'shop_birch',
    resourceKey: 'wood',
    stashMaterialId: 'birch',
    name: 'Берёза',
    icon: '🪵',
    basePrice: 1,
    available: true,
    description: 'Древесина берёзы (каталог: birch).',
    category: 'wood',
  },
  {
    offerId: 'shop_mithril_ore_locked',
    resourceKey: 'mithril',
    name: 'Мифриловая руда',
    icon: '💎',
    basePrice: 100,
    available: false,
    description: 'Легендарная руда. Обычно только с экспедиций.',
    category: 'special',
  },
]

/** Все каталожные id, на которые ссылаются офферы лавки (включая недоступные). Для material-catalog-contract. */
export function collectShopOfferCatalogMaterialIds(): string[] {
  const ids = new Set<string>()
  for (const item of materialShopItems) {
    const mid = getShopCatalogMaterialId(item)
    if (mid) ids.add(mid)
  }
  return [...ids]
}

// ================================
// ФУНКЦИИ
// ================================

export function getMaterialPrice(
  resourceKey: ResourceKey,
  quantity: number,
  premiumMultiplier: number = 1
): number {
  const item = materialShopItems.find((i) => i.resourceKey === resourceKey)
  if (!item) return 0

  return Math.ceil(item.basePrice * quantity * premiumMultiplier)
}

export function canBuyMaterial(resourceKey: ResourceKey): boolean {
  const item = materialShopItems.find((i) => i.resourceKey === resourceKey)
  return item?.available ?? false
}

export function getMaterialShopInfo(resourceKey: ResourceKey): MaterialShopItem | undefined {
  const raw = materialShopItems.find((i) => i.resourceKey === resourceKey)
  return raw ? enrichShopItemFromCatalog(raw) : undefined
}

export function getAvailableShopMaterials(): MaterialShopItem[] {
  return materialShopItems.filter((i) => i.available).map(enrichShopItemFromCatalog)
}

export function getMaterialsByCategory(category: MaterialShopItem['category']): MaterialShopItem[] {
  return materialShopItems
    .filter((i) => i.category === category && i.available)
    .map(enrichShopItemFromCatalog)
}

export function calculateTotalPurchaseCost(
  materials: { resourceKey: ResourceKey; quantity: number }[],
  premiumMultiplier: number = 1.1
): { total: number; breakdown: { resourceKey: ResourceKey; quantity: number; price: number }[] } {
  const breakdown = materials.map(({ resourceKey, quantity }) => ({
    resourceKey,
    quantity,
    price: getMaterialPrice(resourceKey, quantity, premiumMultiplier),
  }))

  const total = breakdown.reduce((sum, item) => sum + item.price, 0)

  return { total, breakdown }
}
