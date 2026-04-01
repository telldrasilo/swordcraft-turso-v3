 /**
 * Миссии сбора ресурсов для локации "Глубины Подземелий"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const gatherAncientOreEpic: MissionTemplate = {
  id: 'depths_gather_ancient_1',
  locationId: 'depths_of_the_world',
  type: 'gather',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Древняя руда',
  description: `Древняя руда и живая руда — материалы, образующиеся только в глубине. Они обладают свойствами, недоступными поверхностным металлам. Древний голем может указать, где искать.`,
  objective: 'Найти древний металл (1-3) и живую руду (1-2)',
  client: { name: 'Древний голем', type: 'merchant', description: 'Выполняет забытую программу' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 52, variance: 0.1, perDifficulty: 26, perRarity: 13 }, deposit: { base: 105, variance: 0.1, perDifficulty: 53, perRarity: 26 } },
  reward: { gold: { base: 480, variance: 0.25, perDifficulty: 240, perRarity: 120 }, glory: { base: 28, variance: 0, perDifficulty: 14, perRarity: 9 }, experience: { base: 165, variance: 0.1, perDifficulty: 83, perRarity: 41 }, warSoul: { base: 95, variance: 0.2, perDifficulty: 48, perRarity: 32 } },
  resources: [
    { materialId: 'ancient_metal', quantity: { base: 2, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
    { materialId: 'living_ore', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],
  enemies: { types: ['deep_horror', 'time_eater'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true, cooldownHours: 20,
};

export const gatherVoidCrystalLegendary: MissionTemplate = {
  id: 'depths_gather_void_1',
  locationId: 'depths_of_the_world',
  type: 'gather',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Кристалл пустоты',
  description: `Кристалл пустоты — материализация небытия. Он существует там, где время и пространство не имеют смыс. Добывать его можно только в самых глубоких залах.`,
  objective: 'Добывать кристалл пустоты (1-2)',
  client: { name: 'Последний хранитель Эон', type: 'scholar', description: 'Единственный знает, как с ним подобраться' },
  duration: { base: 10800, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 65, variance: 0.1, perDifficulty: 33, perRarity: 16 }, deposit: { base: 130, variance: 0.1, perDifficulty: 65, perRarity: 33 } },
  reward: { gold: { base: 620, variance: 0.25, perDifficulty: 310, perRarity: 155 }, glory: { base: 36, variance: 0, perDifficulty: 18, perRarity: 12 }, experience: { base: 210, variance: 0.1, perDifficulty: 105, perRarity: 53 }, warSoul: { base: 130, variance: 0.2, perDifficulty: 65, perRarity: 43 } },
  resources: [
    { materialId: 'void_crystal', quantity: { base: 1, variance: 0.5, perDifficulty: 0, perRarity: 1 } },
  ],
  enemies: { types: ['core_guardian', 'deep_horror'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true, cooldownHours: 26,
};

export const gatherHeartOfMountainLegendary: MissionTemplate = {
  id: 'depths_gather_heart_1',
  locationId: 'depths_of_the_world',
  type: 'gather',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Сердце горы',
  description: `Сердце горы — память самого мира. Оно помнит каждый момент истории и может показать будущее. тому, кто достаточно силён, чтобы выдержать это знание. Найти его можно только в самом центре мира.`,
  objective: 'Добывать сердце горы (1)',
  client: { name: 'Последний хранитель Эон', type: 'scholar', description: 'Хочет передать знания следующему хранителю' },
  duration: { base: 12600, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 }, deposit: { base: 160, variance: 0.1, perDifficulty: 80, perRarity: 40 } },
  reward: { gold: { base: 850, variance: 0.25, perDifficulty: 425, perRarity: 213 }, glory: { base: 50, variance: 0, perDifficulty: 25, perRarity: 17 }, experience: { base: 280, variance: 0.1, perDifficulty: 140, perRarity: 70 }, warSoul: { base: 180, variance: 0.2, perDifficulty: 90, perRarity: 60 } },
  resources: [
    { materialId: 'heart_of_the_mountain', quantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 } },
  ],
  enemies: { types: ['world_shadow', 'core_guardian', 'core_guardian'], count: { base: 4, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 4 },
  isRepeatable: true, cooldownHours: 32,
};

export const depthsGatherMissions: MissionTemplate[] = [
  gatherAncientOreEpic,
  gatherVoidCrystalLegendary,
  gatherHeartOfMountainLegendary,
];
