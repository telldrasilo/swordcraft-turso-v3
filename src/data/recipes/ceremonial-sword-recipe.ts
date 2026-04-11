/**
 * Фабрика рецепта `ceremonial_sword` — общая точка для каталога и `RecipeDefinitionV0`.
 * Хребет без микроэтапов ТЗ (плоский `stages`), иначе совпадает с каркасом `basic_sword`.
 */

import type { WeaponRecipe } from '@/types/craft-v2'

export function createCeremonialSwordWeaponRecipe(): WeaponRecipe {
  return {
    id: 'ceremonial_sword',
    name: 'церемониальный меч',
    type: 'sword',
    description: 'Меч с массивным навершием — металл, камень или самоцвет для баланса и украшения',

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
        materialTypes: ['metal', 'alloy', 'stone', 'gem'],
        minQuantity: 1,
        maxQuantity: 1,
        optional: false,
        dominantProperty: 'weight',
        secondaryProperty: 'toughness',
      },
    ],

    combatPart: 'blade',

    baseStats: {
      attackBase: 38,
      durabilityBase: 58,
      weightBase: 2.6,
      soulCapacityBase: 52,
    },

    stages: [
      { stageType: 'prep_heating' },
      { stageType: 'prep_tools' },
      { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
      { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
      { stageType: 'proc_smelting', material: 'guard', target: 'guard' },
      { stageType: 'proc_rolling', material: 'guard', target: 'guard' },
      { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
      { stageType: 'proc_smelting', material: 'pommel', target: 'pommel' },
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_forging', target: 'blade' },
      { stageType: 'form_heating', target: 'guard' },
      { stageType: 'form_shaping', target: 'guard' },
      { stageType: 'form_carving', target: 'grip' },
      { stageType: 'form_heating', target: 'pommel' },
      { stageType: 'form_shaping', target: 'pommel' },
      { stageType: 'asmb_fitting' },
      { stageType: 'asmb_joining' },
      { stageType: 'asmb_wrapping', target: 'grip' },
      { stageType: 'asmb_balancing' },
      { stageType: 'fin_hardening', target: 'blade' },
      { stageType: 'fin_tempering', target: 'blade' },
      { stageType: 'fin_grinding', target: 'blade' },
      { stageType: 'fin_sharpening', target: 'blade' },
      { stageType: 'fin_polishing' },
      { stageType: 'fin_inspection' },
    ],

    source: {
      rarity: 'uncommon',
    },

    requiredLevel: 3,
  }
}
