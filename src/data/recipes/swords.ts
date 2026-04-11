/**
 * Базовые рецепты оружия
 * Мечи
 */

import type { WeaponRecipe } from '@/types/craft-v2'
import { createBasicSwordWeaponRecipe } from '@/data/recipes/basic-sword-recipe'
import { createCeremonialSwordWeaponRecipe } from '@/data/recipes/ceremonial-sword-recipe'

export const swordRecipes: WeaponRecipe[] = [
  createBasicSwordWeaponRecipe(),

  createCeremonialSwordWeaponRecipe(),
  
  {
    id: 'long_sword',
    name: 'длинный меч',
    type: 'sword',
    description: 'Удлинённый меч для двуручного или полуторного хвата',
    
    parts: [
      {
        id: 'blade',
        name: 'Лезвие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 4,
        maxQuantity: 5,
        dominantProperty: 'hardness',  // твёрдость = урон
        secondaryProperty: 'weight',   // плотность (вес/баланс)
      },
      {
        id: 'guard',
        name: 'Гарда',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 1,
        maxQuantity: 2,
        optional: false,
        dominantProperty: 'toughness',  // прочность = защита
        secondaryProperty: 'hardness',   // твёрдость (стойкость к ударам)
      },
      {
        id: 'grip',
        name: 'Рукоять',
        materialTypes: ['wood'],
        minQuantity: 1,
        maxQuantity: 1,
        optional: false,
        dominantProperty: 'elasticity',  // гибкость = удобство
        secondaryProperty: 'weight',   // плотность (вес/баланс)
      },
      {
        id: 'pommel',
        name: 'Навершие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 1,
        maxQuantity: 1,
        optional: false,
        dominantProperty: 'weight',   // вес = баланс
        secondaryProperty: 'toughness',  // прочность (стойкость к ударам)
      },
    ],
    
    combatPart: 'blade',
    
    baseStats: {
      attackBase: 50,
      durabilityBase: 65,
      weightBase: 3.2,
      soulCapacityBase: 60,
    },
    
    stages: [
      // Подготовка
      { stageType: 'prep_heating' },
      { stageType: 'prep_tools' },
      
      // Обработка сырья
      { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
      { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
      { stageType: 'proc_smelting', material: 'guard', target: 'guard' },
      { stageType: 'proc_rolling', material: 'guard', target: 'guard' },
      { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
      { stageType: 'proc_smelting', material: 'pommel', target: 'pommel' },
      
      // Формовка (больше времени для длинного лезвия)
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_forging', target: 'blade' },
      { stageType: 'form_heating', target: 'blade' },  // повторный нагрев
      { stageType: 'form_drawing_out', target: 'blade' },
      { stageType: 'form_heating', target: 'guard' },
      { stageType: 'form_shaping', target: 'guard' },
      { stageType: 'form_carving', target: 'grip' },
      { stageType: 'form_heating', target: 'pommel' },
      { stageType: 'form_shaping', target: 'pommel' },
      
      // Сборка
      { stageType: 'asmb_fitting' },
      { stageType: 'asmb_joining' },
      { stageType: 'asmb_wrapping', target: 'grip' },
      { stageType: 'asmb_balancing' },
      
      // Отделка
      { stageType: 'fin_hardening', target: 'blade' },
      { stageType: 'fin_tempering', target: 'blade' },
      { stageType: 'fin_grinding', target: 'blade' },
      { stageType: 'fin_sharpening', target: 'blade' },
      { stageType: 'fin_polishing' },
      { stageType: 'fin_inspection' },
    ],
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 5',
    },
    
    requiredLevel: 5,
  },
]
