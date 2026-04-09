/**
 * Рецепт сборки узла зачарований (квест Forgotten Forge, вариант §4.1 B).
 * Части — материальные слоты I/II/III; без отдельных materialId артефактов квеста в stash.
 */

import type { WeaponRecipe } from '@/types/craft-v2'
import { FORGOTTEN_FORGE_ALTAR_RECIPE_ID } from '@/lib/craft/altar-construction'

export const forgottenForgeAltarConstructionRecipe: WeaponRecipe = {
  id: FORGOTTEN_FORGE_ALTAR_RECIPE_ID,
  name: 'Узел зачарований',
  type: 'sword',
  description:
    'Сборка древнего узла по чертежу: основание и каркас, крепёж, проводка души (лунное серебро, торф, туманные травы).',

  parts: [
    {
      id: 'altar_base',
      name: 'I. Основание (камень)',
      materialTypes: ['stone'],
      minQuantity: 4,
      maxQuantity: 6,
      dominantProperty: 'hardness',
      secondaryProperty: 'weight',
    },
    {
      id: 'altar_frame',
      name: 'I. Каркас (древесина)',
      materialTypes: ['wood'],
      minQuantity: 3,
      maxQuantity: 5,
      dominantProperty: 'elasticity',
      secondaryProperty: 'weight',
    },
    {
      id: 'altar_brackets',
      name: 'II. Крепёж (металл)',
      materialTypes: ['metal', 'alloy'],
      minQuantity: 2,
      maxQuantity: 4,
      dominantProperty: 'toughness',
      secondaryProperty: 'hardness',
    },
    {
      id: 'altar_binding',
      name: 'II. Стяжки (кожа)',
      materialTypes: ['leather'],
      minQuantity: 1,
      maxQuantity: 2,
      dominantProperty: 'toughness',
      secondaryProperty: 'elasticity',
    },
    {
      id: 'altar_soul_alloy',
      name: 'III. Лунное серебро (сплав)',
      materialTypes: ['metal', 'alloy'],
      minQuantity: 2,
      maxQuantity: 4,
      dominantProperty: 'conductivity',
      secondaryProperty: 'hardness',
    },
    {
      id: 'altar_soul_peat',
      name: 'III. Болотная зола (торф)',
      materialTypes: ['other'],
      minQuantity: 2,
      maxQuantity: 5,
      dominantProperty: 'weight',
      secondaryProperty: 'hardness',
    },
    {
      id: 'altar_soul_herbs',
      name: 'III. Слеза тумана (травы)',
      materialTypes: ['wood'],
      minQuantity: 2,
      maxQuantity: 4,
      dominantProperty: 'conductivity',
      secondaryProperty: 'elasticity',
    },
  ],

  combatPart: 'altar_base',

  baseStats: {
    attackBase: 0,
    durabilityBase: 100,
    weightBase: 10,
    soulCapacityBase: 0,
  },

  stages: [
    { stageType: 'prep_tools' },
    { stageType: 'prep_heating' },
    { stageType: 'proc_sawing', material: 'altar_base', target: 'altar_base' },
    { stageType: 'form_shaping', target: 'altar_base' },
    { stageType: 'proc_sawing', material: 'altar_frame', target: 'altar_frame' },
    { stageType: 'form_carving', target: 'altar_frame' },
    { stageType: 'proc_smelting', material: 'altar_brackets', target: 'altar_brackets' },
    { stageType: 'form_forging', target: 'altar_brackets' },
    { stageType: 'proc_tanning', material: 'altar_binding', target: 'altar_binding' },
    { stageType: 'asmb_fitting' },
    { stageType: 'asmb_joining' },
    { stageType: 'asmb_wrapping', target: 'altar_binding' },
    { stageType: 'fin_tempering', target: 'altar_soul_alloy', baseDurationOverride: 55 },
    {
      stageType: 'proc_drying',
      material: 'altar_soul_peat',
      target: 'altar_soul_peat',
      baseDurationOverride: 45,
    },
    { stageType: 'form_carving', target: 'altar_soul_herbs', baseDurationOverride: 45 },
    { stageType: 'fin_spirit_blessing', baseDurationOverride: 60 },
    { stageType: 'fin_polishing' },
    { stageType: 'fin_inspection' },
  ],

  source: {
    rarity: 'rare',
    unlockCondition: 'Квест «Эхо забытой кузни» (эпилог)',
  },

  requiredLevel: 1,
}
