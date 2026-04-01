/**
 * Миссии сбора ресурсов для локации "Шепчущий Лес"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const gatherSpiritWoodUncommon: MissionTemplate = {
  id: 'whispering_forest_gather_wood_1',
  locationId: 'whispering_forest',
  type: 'gather',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Древесина духов',
  description: `Древесина духов — дерево, впитавшее в себя голоса леса. Оно используется для создания магических инструментов. Друид платит хорошо за качественные образцы.`,
  objective: 'Собрать древесину духов (1-4)',
  client: { name: 'Древний друид Элара', type: 'scholar', description: 'Создаёт магические предметы' },
  duration: { base: 5400, variance: 0.2, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 25, variance: 0.1, perDifficulty: 12, perRarity: 6 },
    deposit: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
  },
  reward: {
    gold: { base: 160, variance: 0.25, perDifficulty: 80, perRarity: 40 },
    glory: { base: 8, variance: 0, perDifficulty: 4, perRarity: 3 },
    experience: { base: 60, variance: 0.1, perDifficulty: 30, perRarity: 15 },
    warSoul: { base: 28, variance: 0.2, perDifficulty: 14, perRarity: 9 },
  },
  resources: [
    { materialId: 'spirit_wood', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],
  isRepeatable: true,
  cooldownHours: 10,
};

export const gatherRareHerbsRare: MissionTemplate = {
  id: 'whispering_forest_gather_herbs_1',
  locationId: 'whispering_forest',
  type: 'gather',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Листья памяти',
  description: `Листья памяти и смола снов — редкие материалы, образующиеся на деревьях у Первого Древа. Они хранят воспоминания и используются в магии разума.`,
  objective: 'Найти листья памяти (1-3) и смолу снов (1-4)',
  client: { name: 'Древний друид Элара', type: 'scholar', description: 'Изучает магию разума' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 280, variance: 0.25, perDifficulty: 140, perRarity: 70 },
    glory: { base: 14, variance: 0, perDifficulty: 7, perRarity: 5 },
    experience: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    warSoul: { base: 48, variance: 0.2, perDifficulty: 24, perRarity: 16 },
  },
  resources: [
    { materialId: 'memory_leaf', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'dream_resin', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],
  enemies: { types: ['tree_spirit'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const gatherAncientSapEpic: MissionTemplate = {
  id: 'whispering_forest_gather_sap_1',
  locationId: 'whispering_forest',
  type: 'gather',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Сок Первого Древа',
  description: `Древний сок — смола Первого Древа, существующего с начала мира. Капля этого сока может дать ответ на любой вопрос или наделить даром понимать все языки.`,
  objective: 'Добывать древний сок (1)',
  client: { name: 'Древний друид Элара', type: 'scholar', description: 'Мечтает о капле древнего сока' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
    deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
  },
  reward: {
    gold: { base: 550, variance: 0.25, perDifficulty: 275, perRarity: 138 },
    glory: { base: 28, variance: 0, perDifficulty: 14, perRarity: 9 },
    experience: { base: 175, variance: 0.1, perDifficulty: 88, perRarity: 44 },
    warSoul: { base: 95, variance: 0.2, perDifficulty: 48, perRarity: 32 },
  },
  resources: [
    { materialId: 'ancient_sap', quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 } },
  ],
  enemies: { types: ['root_guardian', 'whispering_shadow'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 20,
};

export const whisperingForestGatherMissions: MissionTemplate[] = [
  gatherSpiritWoodUncommon,
  gatherRareHerbsRare,
  gatherAncientSapEpic,
];
