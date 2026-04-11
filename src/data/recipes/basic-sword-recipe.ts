/**
 * Фабрика рецепта `basic_sword` — единая точка для каталога и материализатора шаблона v0.
 */

import type { WeaponRecipe } from '@/types/craft-v2'
import { BASIC_SWORD_STAGES } from '@/data/recipes/basic-sword-stages'

export function createBasicSwordWeaponRecipe(): WeaponRecipe {
  return {
    id: 'basic_sword',
    name: 'меч',
    type: 'sword',
    description: 'Стандартный прямой меч с крестовидной гардой',

    parts: [
      {
        id: 'blade',
        name: 'Лезвие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 3,
        maxQuantity: 4,
        dominantProperty: 'hardness',
        secondaryProperty: 'weight',
      },
      {
        id: 'guard',
        name: 'Гарда',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 1,
        maxQuantity: 1,
        optional: false,
        dominantProperty: 'toughness',
        secondaryProperty: 'hardness',
      },
      {
        id: 'grip',
        name: 'Рукоять',
        materialTypes: ['wood'],
        minQuantity: 1,
        maxQuantity: 1,
        optional: false,
        dominantProperty: 'elasticity',
        secondaryProperty: 'weight',
      },
      {
        id: 'pommel',
        name: 'Навершие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 1,
        maxQuantity: 1,
        optional: false,
        dominantProperty: 'weight',
        secondaryProperty: 'toughness',
      },
    ],

    combatPart: 'blade',

    baseStats: {
      attackBase: 40,
      durabilityBase: 60,
      weightBase: 2.5,
      soulCapacityBase: 50,
    },

    stages: BASIC_SWORD_STAGES,

    source: {
      rarity: 'common',
    },

    requiredLevel: 1,
  }
}
