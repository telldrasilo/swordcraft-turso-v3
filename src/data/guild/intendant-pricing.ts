/**
 * Данные интенданта: витрина покупаемых рецептов и UI-токены редкости.
 * Вынесено из legacy recipe-shop, чтобы не держать прямую зависимость.
 */

export type IntendantRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface IntendantRecipePrice {
  recipeId: string
  name: string
  gold: number
  requiredLevel: number
  rarity: IntendantRarity
  description: string
}

export const intendantWeaponRecipePrices: IntendantRecipePrice[] = [
  {
    recipeId: 'long_sword',
    name: 'Длинный меч',
    gold: 200,
    requiredLevel: 5,
    rarity: 'uncommon',
    description: 'Чертёж удлинённого меча. Можно купить у торговца.',
  },
  {
    recipeId: 'battle_axe',
    name: 'Боевой топор',
    gold: 250,
    requiredLevel: 5,
    rarity: 'uncommon',
    description: 'Чертёж тяжёлого топора. Можно купить у торговца.',
  },
]

export const intendantRefiningRecipePrices: IntendantRecipePrice[] = [
  {
    recipeId: 'bronze_ingot',
    name: 'Бронзовый слиток',
    gold: 100,
    requiredLevel: 5,
    rarity: 'uncommon',
    description: 'Рецепт бронзового сплава. Основы металлургии.',
  },
  {
    recipeId: 'steel_ingot',
    name: 'Стальной слиток',
    gold: 200,
    requiredLevel: 8,
    rarity: 'rare',
    description: 'Рецепт закалённой стали. Требует мастерства.',
  },
]

export const intendantRarityColors: Record<IntendantRarity, string> = {
  common: 'text-stone-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
}

export const intendantRarityBgColors: Record<IntendantRarity, string> = {
  common: 'bg-stone-700/50',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  epic: 'bg-purple-900/30',
  legendary: 'bg-amber-900/30',
}

export const intendantRarityBorderColors: Record<IntendantRarity, string> = {
  common: 'border-stone-600',
  uncommon: 'border-green-600',
  rare: 'border-blue-600',
  epic: 'border-purple-600',
  legendary: 'border-amber-600',
}
