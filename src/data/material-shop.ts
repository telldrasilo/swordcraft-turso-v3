/**
 * Материалы в магазине
 * Цены и наличие сырья для покупки
 *
 * Фаза 3 аудита: руда (`iron`, `copper`, …) → `grantResourceKeyFromWorld` → stash `*_ore`;
 * слитки / доски / блоки → stash по `RESOURCE_GRANT_STASH_FALLBACK` в inventory-check (`*_alloy`, `processed_wood`, …).
 *
 * Фаза 4: название и emoji витрины подтягиваются из каталога (`materialById`), без импорта inventory-check (нет цикла).
 */

import { REFINING_INPUT_STAGE_MATERIAL_ID } from '@/data/refining-recipes'
import { materialById } from '@/data/materials/library'
import { emojiFromLegacyResourcePngPath, RESOURCE_KEY_EMOJI } from '@/lib/ui/resource-emoji'
import type { ResourceKey } from '@/store/slices/resources-slice'

export interface MaterialShopItem {
  resourceKey: ResourceKey
  name: string
  icon: string
  basePrice: number // Базовая цена за единицу
  available: boolean // Доступно ли в магазине
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

function getShopCatalogMaterialId(resourceKey: ResourceKey): string | null {
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
  const mid = getShopCatalogMaterialId(item.resourceKey)
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

/**
 * Материалы, доступные для покупки в магазине
 */
export const materialShopItems: MaterialShopItem[] = [
  // --- Руды (сырьевая стадия; в stash — `*_ore` где задано) ---
  {
    resourceKey: 'iron',
    name: 'Железная руда',
    icon: '⛏️',
    basePrice: 4,
    available: true,
    description: 'Руда для плавки. После переработки — железный слиток.',
    category: 'metal',
  },
  {
    resourceKey: 'copper',
    name: 'Медная руда',
    icon: '🟠',
    basePrice: 5,
    available: true,
    description: 'Руда для плавки в медный слиток.',
    category: 'metal',
  },
  {
    resourceKey: 'tin',
    name: 'Оловянная руда',
    icon: '⚪',
    basePrice: 5,
    available: true,
    description: 'Руда для плавки; слитки идут в бронзу и сплавы.',
    category: 'metal',
  },
  {
    resourceKey: 'silver',
    name: 'Серебряная руда',
    icon: '⬜',
    basePrice: 12,
    available: true,
    description: 'Руда для плавки серебряного слитка.',
    category: 'metal',
  },
  {
    resourceKey: 'goldOre',
    name: 'Золотая руда',
    icon: '🟡',
    basePrice: 25,
    available: true,
    description: 'Руда для плавки золотого слитка.',
    category: 'special',
  },
  {
    resourceKey: 'mithril',
    name: 'Мифриловая руда',
    icon: '💎',
    basePrice: 100,
    available: false,
    description: 'Легендарная руда. Обычно только с экспедиций.',
    category: 'special',
  },

  // --- Слитки и сплавы (переработка → крафт / ремонт) ---
  {
    resourceKey: 'ironIngot',
    name: 'Железный слиток',
    icon: '🔩',
    basePrice: 14,
    available: true,
    description: 'Переплавленное железо. Клинки и детали узла «железо».',
    category: 'metal',
  },
  {
    resourceKey: 'copperIngot',
    name: 'Медный слиток',
    icon: '🪙',
    basePrice: 18,
    available: true,
    description: 'Готовый медный металл после горна.',
    category: 'metal',
  },
  {
    resourceKey: 'tinIngot',
    name: 'Оловянный слиток',
    icon: '◽',
    basePrice: 18,
    available: true,
    description: 'Олово после плавки; для бронзы и сплавов.',
    category: 'metal',
  },
  {
    resourceKey: 'bronzeIngot',
    name: 'Бронзовый слиток',
    icon: '🥉',
    basePrice: 32,
    available: true,
    description: 'Сплав меди и олова. Прочнее на старте.',
    category: 'metal',
  },
  {
    resourceKey: 'steelIngot',
    name: 'Стальной слиток',
    icon: '⚙️',
    basePrice: 48,
    available: true,
    description: 'Закалённая сталь после переработки.',
    category: 'metal',
  },
  {
    resourceKey: 'silverIngot',
    name: 'Серебряный слиток',
    icon: '🔲',
    basePrice: 42,
    available: true,
    description: 'Чистое серебро для магических сплавов и клинков.',
    category: 'metal',
  },
  {
    resourceKey: 'goldIngot',
    name: 'Золотой слиток',
    icon: '🥇',
    basePrice: 95,
    available: true,
    description: 'Благородный металл после плавки золотой руды.',
    category: 'special',
  },
  {
    resourceKey: 'mithrilIngot',
    name: 'Мифриловый слиток',
    icon: '💠',
    basePrice: 320,
    available: true,
    description: 'Редчайший слиток. Дорого — зато без ожидания плавки.',
    category: 'special',
  },

  // --- Топливо ---
  {
    resourceKey: 'coal',
    name: 'Уголь',
    icon: '⚫',
    basePrice: 2,
    available: true,
    description: 'Топливо для горна и закалки.',
    category: 'fuel',
  },

  // --- Дерево: брёвна и доски ---
  {
    resourceKey: 'wood',
    name: 'Дерево',
    icon: '🪵',
    basePrice: 1,
    available: true,
    description: 'Сырьё (брёвна); для пилорамы — доски.',
    category: 'wood',
  },
  {
    resourceKey: 'planks',
    name: 'Доски',
    icon: '🪚',
    basePrice: 2,
    available: true,
    description: 'Обработанное дерево (`processed_wood` в каталоге). Рукояти и заготовки.',
    category: 'wood',
  },

  // --- Камень: сырьё и блоки ---
  {
    resourceKey: 'stone',
    name: 'Камень',
    icon: '🪨',
    basePrice: 1,
    available: true,
    description: 'Необработанный камень для карьера.',
    category: 'stone',
  },
  {
    resourceKey: 'stoneBlocks',
    name: 'Каменные блоки',
    icon: '🧱',
    basePrice: 4,
    available: true,
    description: 'Обтёсанные блоки после переработки.',
    category: 'stone',
  },
]

// ================================
// ФУНКЦИИ
// ================================

/**
 * Получить цену материала
 * @param resourceKey Ключ ресурса
 * @param quantity Количество
 * @param premiumMultiplier Множитель стоимости при покупке из крафта (1.1 = +10%)
 */
export function getMaterialPrice(
  resourceKey: ResourceKey,
  quantity: number,
  premiumMultiplier: number = 1
): number {
  const item = materialShopItems.find(i => i.resourceKey === resourceKey)
  if (!item) return 0

  return Math.ceil(item.basePrice * quantity * premiumMultiplier)
}

/**
 * Проверить, можно ли купить материал
 */
export function canBuyMaterial(resourceKey: ResourceKey): boolean {
  const item = materialShopItems.find(i => i.resourceKey === resourceKey)
  return item?.available ?? false
}

/**
 * Получить информацию о материале для магазина
 */
export function getMaterialShopInfo(resourceKey: ResourceKey): MaterialShopItem | undefined {
  const raw = materialShopItems.find(i => i.resourceKey === resourceKey)
  return raw ? enrichShopItemFromCatalog(raw) : undefined
}

/**
 * Получить все доступные для покупки материалы
 */
export function getAvailableShopMaterials(): MaterialShopItem[] {
  return materialShopItems.filter(i => i.available).map(enrichShopItemFromCatalog)
}

/**
 * Получить материалы по категории
 */
export function getMaterialsByCategory(category: MaterialShopItem['category']): MaterialShopItem[] {
  return materialShopItems
    .filter(i => i.category === category && i.available)
    .map(enrichShopItemFromCatalog)
}

/**
 * Рассчитать общую стоимость покупки материалов
 */
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
