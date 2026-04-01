/**
 * Миссии разведки для локации "Шепчущий Лес"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const scoutPathUncommon: MissionTemplate = {
  id: 'whispering_forest_scout_path_1',
  locationId: 'whispering_forest',
  type: 'scout',
  rarity: 'uncommon',
  difficulty: 'hard',
  name: 'Тропа без голосов',
  description: `Глухой отшельник знает тропу через лес, где голоса не слышны. Он готов показать начало пути, но дальше нужно идти самому, отмечая безопасные места.`,
  objective: 'Отметить безопасную тропу через лес',
  client: { name: 'Глухой отшельник', type: 'commoner', description: 'Не слышит голосов, безопасен' },
  duration: { base: 5400, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 25, variance: 0.1, perDifficulty: 12, perRarity: 6 },
    deposit: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 },
  },
  reward: {
    gold: { base: 140, variance: 0.2, perDifficulty: 70, perRarity: 35 },
    glory: { base: 7, variance: 0, perDifficulty: 4, perRarity: 2 },
    experience: { base: 55, variance: 0.1, perDifficulty: 28, perRarity: 14 },
    warSoul: { base: 24, variance: 0.2, perDifficulty: 12, perRarity: 8 },
  },
  isRepeatable: true,
  cooldownHours: 10,
};

export const scoutFirstTreeRare: MissionTemplate = {
  id: 'whispering_forest_scout_tree_1',
  locationId: 'whispering_forest',
  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Первое Древо',
  description: `Древний друид хочет найти Первое Древо — дерево, которое было посажено в начале мира. Оно вбирает в себя все голоса и может дать ответ на любой вопрос.`,
  objective: 'Найти путь к Первому Древу',
  client: { name: 'Древний друид Элара', type: 'scholar', description: 'Ищёт древнюю мудрость' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 38, variance: 0.1, perDifficulty: 19, perRarity: 10 },
    deposit: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 },
  },
  reward: {
    gold: { base: 250, variance: 0.2, perDifficulty: 125, perRarity: 63 },
    glory: { base: 14, variance: 0, perDifficulty: 7, perRarity: 5 },
    experience: { base: 95, variance: 0.1, perDifficulty: 48, perRarity: 24 },
    warSoul: { base: 45, variance: 0.2, perDifficulty: 23, perRarity: 15 },
  },
  enemies: { types: ['tree_spirit', 'whispering_shadow'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 1 },
  isRepeatable: true,
  cooldownHours: 14,
};

export const scoutRootsRare: MissionTemplate = {
  id: 'whispering_forest_scout_roots_1',
  locationId: 'whispering_forest',
  type: 'scout',
  rarity: 'rare',
  difficulty: 'extreme',
  name: 'Корни мира',
  description: `Под лесом — не земля, а корни, уходящие в бесконечность. Говорят, они пронизывают весь мир, и там, где собираются вместе, можно услышать голос самого мира.`,
  objective: 'Найти место, где корни сходятся',
  client: { name: 'Дух дерева-друга', type: 'scholar', description: 'Хочет услышать голос мира' },
  duration: { base: 7200, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: {
    supplies: { base: 40, variance: 0.1, perDifficulty: 20, perRarity: 10 },
    deposit: { base: 80, variance: 0.1, perDifficulty: 40, perRarity: 20 },
  },
  reward: {
    gold: { base: 280, variance: 0.2, perDifficulty: 140, perRarity: 70 },
    glory: { base: 16, variance: 0, perDifficulty: 8, perRarity: 5 },
    experience: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    warSoul: { base: 50, variance: 0.2, perDifficulty: 25, perRarity: 17 },
  },
  enemies: { types: ['root_guardian', 'tree_spirit'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true,
  cooldownHours: 16,
};

export const whisperingForestScoutMissions: MissionTemplate[] = [
  scoutPathUncommon,
  scoutFirstTreeRare,
  scoutRootsRare,
];
