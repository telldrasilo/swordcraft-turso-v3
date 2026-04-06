/**
 * Локация 1: Окраины Дубовой Рощи
 * Tier 1 - Стартовая локация
 */

import type { Location } from '../../types';

export const oakGroveOutskirts: Location = {
  id: 'oak_grove_outskirts',
  name: 'Окраины Дубовой Рощи',
  description: `Окраины великого дубового леса, граничащие с цивилизованными землями.
Здесь веками велись охота и собирательство, а старые тропы хорошо протоптаны.
Дубы здесь старые и могучие, их кроны создают вечные сумерки внизу.`,

  tier: 1,
  type: 'forest',
  tags: ['forest', 'woodland', 'civilization_border', 'safe_zone', 'hunting_grounds'],

  unlockRequirements: {
    guildLevel: 1,
  },

  resources: [
    // Базовые материалы из проекта
    { materialId: 'oak', baseWeight: 100, rarity: 'common', minQuantity: 3, maxQuantity: 8 },
    { materialId: 'birch', baseWeight: 80, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'iron_ore', baseWeight: 88, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    { materialId: 'coal', baseWeight: 92, rarity: 'common', minQuantity: 2, maxQuantity: 5 },
    // Новые материалы
    { materialId: 'oak_bark', baseWeight: 90, rarity: 'common', minQuantity: 2, maxQuantity: 6 },
    { materialId: 'acorns', baseWeight: 100, rarity: 'common', minQuantity: 5, maxQuantity: 15 },
    { materialId: 'forest_moss', baseWeight: 70, rarity: 'common', minQuantity: 1, maxQuantity: 4 },
    { materialId: 'wild_herbs', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 3 },
  ],

  rarityDistribution: { common: 90, uncommon: 10, rare: 0, epic: 0, legendary: 0 },

  weather: [
    { id: 'clear', name: 'Ясно', chance: 30, effects: [] },
    { id: 'cloudy', name: 'Пасмурно', chance: 35, effects: [
      { type: 'stealth', value: 5, description: 'Легче остаться незамеченным' }
    ]},
    { id: 'light_rain', name: 'Лёгкий дождь', chance: 20, effects: [
      { type: 'stealth', value: 10 },
      { type: 'damage', value: -5, description: 'Огнестрельное оружие менее эффективно' }
    ]},
    { id: 'fog', name: 'Туман', chance: 10, effects: [
      { type: 'stealth', value: 20 },
      { type: 'visibility', value: -20 }
    ]},
    { id: 'storm', name: 'Гроза', chance: 5, effects: [
      { type: 'speed', value: -15 },
      { type: 'damage', value: 10, description: 'Опасные молнии' }
    ]},
  ],

  npcs: {
    hostile: [
      { id: 'wild_boar', name: 'Дикий кабан', levelRange: [1, 3], disposition: 'hostile',
        description: 'Агрессивен при защите потомства' },
      { id: 'forest_wolf', name: 'Лесной волк', levelRange: [2, 4], disposition: 'hostile',
        description: 'Охотится стаями', groupSize: 4 },
      { id: 'alpha_wolf', name: 'Вожак стаи', levelRange: [4, 7], disposition: 'hostile',
        description: 'Огромный серый волк со шрамом, лидер стаи' },
      { id: 'bandit_outcast', name: 'Бандит-отщепенец', levelRange: [2, 5], disposition: 'hostile',
        description: 'Беглые преступники, прячутся в чаще' },
      { id: 'goblin_scout', name: 'Гоблин-разведчик', levelRange: [3, 6], disposition: 'hostile',
        description: 'Смотрящие из глубины леса' },
    ],
    neutral: [
      { id: 'forester', name: 'Лесник', levelRange: [5, 8], disposition: 'neutral',
        description: 'Патрулирует окраины, торгует картами' },
      { id: 'herbalist', name: 'Травница', levelRange: [3, 5], disposition: 'neutral',
        description: 'Собирает травы, может обучить рецептам' },
      { id: 'wandering_merchant', name: 'Бродячий торговец', levelRange: [1, 1], disposition: 'neutral',
        description: 'Появляется случайно, покупает ресурсы' },
    ],
    friendly: [
      { id: 'village_hunter', name: 'Деревенский охотник', levelRange: [4, 6], disposition: 'friendly',
        description: 'Помогает новичкам, даёт квесты' },
      { id: 'young_tracker', name: 'Молодой следопыт', levelRange: [2, 4], disposition: 'friendly',
        description: 'Проводник по безопасным тропам' },
    ],
  },

  plotHook: `Старый лесник Виктор рассказал о странных звуках, доносящихся из заброшенной шахты
на северо-востоке рощи. Дед его деда говорил, что шахта ведёт к древнему капищу,
где друиды когда-то проводили ритуалы. Вход завален, но из щелей иногда пробивается
холодный воздух, пахнущий землёй и железом.`,

  /** Встречающиеся стихии (SPEC §3.2 / §3.8); редкие оси — через редкие события в пуле. */
  presentElements: ['nature', 'earth', 'air'],

  dungeonHook: {
    name: 'Древнее капище друидов',
    description: `За вековым дубом, отмеченным странными рунами, находится скрытый спуск.
Местные легенды гласят, что друиды ушли под землю, спасаясь от чего-то,
что пришло с севера.`,
    entryRequirement: 'oak_talisman',
    difficulty: 'hard',
  },
};

export default oakGroveOutskirts;
