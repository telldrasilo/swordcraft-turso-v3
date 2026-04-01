 /**
 * Миссии разведки для локации "Глубины Подземелий"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const scoutUpperDepthsEpic: MissionTemplate = {
  id: 'depths_scout_upper_1',
  locationId: 'depths_of_the_world',
  type: 'scout',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Верхние уровни',
  description: `Дух глубины хочет составить карту верхних уровней. Пространство здесь искажено, и обычные карты бесполезны. Нужно пройти по туннелям и отметить ориентиры.`,
  objective: 'Составить карту верхних уровней',
  client: { name: 'Дух глубины', type: 'scholar', description: 'Помогает найти путь' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 50, variance: 0.1, perDifficulty: 25, perRarity: 13 }, deposit: { base: 100, variance: 0.1, perDifficulty: 50, perRarity: 25 } },
  reward: { gold: { base: 400, variance: 0.2, perDifficulty: 200, perRarity: 100 }, glory: { base: 24, variance: 0, perDifficulty: 12, perRarity: 8 }, experience: { base: 145, variance: 0.1, perDifficulty: 73, perRarity: 36 }, warSoul: { base: 80, variance: 0.2, perDifficulty: 40, perRarity: 27 } },
  isRepeatable: true, cooldownHours: 18,
};

export const scoutCoreChamberLegendary: MissionTemplate = {
  id: 'depths_scout_core_1',
  locationId: 'depths_of_the_world',
  type: 'scout',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Дорога к Сердцу',
  description: `Последний хранитель хочет найти безопасный путь к Сердцу мира. Тот, кто коснётся его, увидит рождение и смерть мира. Но путь охраняют древние стражи.`,
  objective: 'Найти путь к Сердцу мира',
  client: { name: 'Последний хранитель Эон', type: 'scholar', description: 'Охраняет вход к сердцу' },
  duration: { base: 10800, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 65, variance: 0.1, perDifficulty: 33, perRarity: 16 }, deposit: { base: 130, variance: 0.1, perDifficulty: 65, perRarity: 33 } },
  reward: { gold: { base: 600, variance: 0.2, perDifficulty: 300, perRarity: 150 }, glory: { base: 35, variance: 0, perDifficulty: 18, perRarity: 12 }, experience: { base: 200, variance: 0.1, perDifficulty: 100, perRarity: 50 }, warSoul: { base: 120, variance: 0.2, perDifficulty: 60, perRarity: 40 } },
  enemies: { types: ['ancient_guardian', 'core_guardian'], count: { base: 3, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true, cooldownHours: 24,
};

export const depthsScoutMissions: MissionTemplate[] = [
  scoutUpperDepthsEpic,
  scoutCoreChamberLegendary,
];
