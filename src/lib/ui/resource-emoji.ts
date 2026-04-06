/**
 * Эмодзи вместо PNG для склада и наследованных `icon: '/icons/resources/*.png'` в каталоге.
 * Позже можно заменить на графику без смены ключей — вернуть пути/Image в компонентах.
 */

export type ResourceIconRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export const RESOURCE_ICON_META: Record<
  string,
  { emoji: string; name: string; rarity: ResourceIconRarity }
> = {
  gold: { emoji: '🪙', name: 'Золото', rarity: 'uncommon' },
  soulEssence: { emoji: '💜', name: 'Эссенция душ', rarity: 'epic' },
  wood: { emoji: '🪵', name: 'Дерево', rarity: 'common' },
  stone: { emoji: '🪨', name: 'Камень', rarity: 'common' },
  iron: { emoji: '⛏️', name: 'Железо', rarity: 'uncommon' },
  coal: { emoji: '🖤', name: 'Уголь', rarity: 'common' },
  copper: { emoji: '🟠', name: 'Медь', rarity: 'uncommon' },
  tin: { emoji: '🔩', name: 'Олово', rarity: 'uncommon' },
  silver: { emoji: '🤍', name: 'Серебро', rarity: 'rare' },
  goldOre: { emoji: '✨', name: 'Зол. руда', rarity: 'rare' },
  mithril: { emoji: '💎', name: 'Мифрил', rarity: 'legendary' },
  leather: { emoji: '🧶', name: 'Кожа', rarity: 'common' },
  ironIngot: { emoji: '⚙️', name: 'Жел. слиток', rarity: 'rare' },
  copperIngot: { emoji: '🟧', name: 'Мед. слиток', rarity: 'rare' },
  tinIngot: { emoji: '⬜', name: 'Олов. слиток', rarity: 'rare' },
  bronzeIngot: { emoji: '🥉', name: 'Бронза', rarity: 'rare' },
  steelIngot: { emoji: '⚔️', name: 'Сталь', rarity: 'epic' },
  silverIngot: { emoji: '🔪', name: 'Сер. слиток', rarity: 'epic' },
  goldIngot: { emoji: '🥇', name: 'Зол. слиток', rarity: 'epic' },
  mithrilIngot: { emoji: '💠', name: 'Мифр. слиток', rarity: 'legendary' },
  planks: { emoji: '📐', name: 'Доски', rarity: 'uncommon' },
  stoneBlocks: { emoji: '🧱', name: 'Блоки камня', rarity: 'uncommon' },
}

/** Только эмодзи по ResourceKey (кузница, подсказки). */
export const RESOURCE_KEY_EMOJI: Record<string, string> = Object.fromEntries(
  Object.entries(RESOURCE_ICON_META).map(([k, v]) => [k, v.emoji])
)

/** Дефолтные значки узлов мира по роли (`buildWorldNode`, экспедиции). */
export const WORLD_ROLE_ICON_EMOJI: Record<string, string> = {
  ore: '⛏️',
  stone: '🪨',
  gem: '💎',
  wood: '🪵',
  organic: '🌿',
  metal: '⚙️',
  leather: '🧶',
  fuel: '🖤',
  special: '✨',
}

const LEGACY_PNG_EMOJI: Record<string, string> = {
  'gold.png': '🪙',
  'soulessence.png': '💜',
  'wood.png': '🪵',
  'stone.png': '🪨',
  'iron.png': '⛏️',
  'coal.png': '🖤',
  'copper.png': '🟠',
  'tin.png': '🔩',
  'silver.png': '🤍',
  'goldore.png': '✨',
  'mithril.png': '💎',
  'leather.png': '🧶',
  'miningot.png': '⚙️',
  'copperingot.png': '🟧',
  'tiningot.png': '⬜',
  'bronzeingot.png': '🥉',
  'steelingot.png': '⚔️',
  'silveringot.png': '🔪',
  'goldingot.png': '🥇',
  'mithrilingot.png': '💠',
  'planks.png': '📐',
  'stoneblocks.png': '🧱',
  'ironore.png': '⛏️',
  'copperore.png': '🟠',
  'tinore.png': '⬜',
}

/**
 * Старые пути `public/icons/resources/*.png` из данных каталога → эмодзи.
 */
export function emojiFromLegacyResourcePngPath(iconPath: string): string | null {
  const t = iconPath.trim()
  if (!t.includes('/icons/resources/')) return null
  const base = (t.split('/').pop() ?? '').toLowerCase()
  return LEGACY_PNG_EMOJI[base] ?? null
}
