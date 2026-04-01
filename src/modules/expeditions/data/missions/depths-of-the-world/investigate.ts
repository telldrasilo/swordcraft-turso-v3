 /**
 * Миссии расследования для локации "Глубины Подземелий"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const investigateAnomaliesEpic: MissionTemplate = {
  id: 'depths_investigate_anomalies_1',
  locationId: 'depths_of_the_world',
  type: 'investigate',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Темпоральные аномалии',
  description: `Безумный исследователь изучает темпоральные аномалии — места, где время течёт иначе. Он говорит, что это может быть ключом к поним природу глубин. Нужно изучить его, чтобы использовать их.`,
  objective: 'Исследовать темпоральные аномалии',
  client: { name: 'Безумный исследователь', type: 'scholar', description: 'Говорит на мёртвых языках' },
  duration: { base: 9000, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 48, variance: 0.1, perDifficulty: 24, perRarity: 12 }, deposit: { base: 95, variance: 0.1, perDifficulty: 48, perRarity: 24 } },
  reward: { gold: { base: 380, variance: 0.2, perDifficulty: 190, perRarity: 95 }, glory: { base: 22, variance: 0, perDifficulty: 11, perRarity: 7 }, experience: { base: 140, variance: 0.1, perDifficulty: 70, perRarity: 35 }, warSoul: { base: 75, variance: 0.2, perDifficulty: 38, perRarity: 25 } },
  enemies: { types: ['time_eater'], count: { base: 2, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true, cooldownHours: 18,
};

export const investigateCoreLegendary: MissionTemplate = {
  id: 'depths_investigate_core_1',
  locationId: 'depths_of_the_world',
  type: 'investigate',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Сердце мира',
  description: `Последний хранитель хочет, чтобы кто знают, истинную природу Сердца мира. Но существует ли- память о входе в систему., Кто кто может воздействие.`,
  objective: 'Найти истину о Сердце мира',
  client: { name: 'Последний хранитель Эон', type: 'scholar', description: 'Охраняет вход к сердцу' },
  duration: { base: 10800, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 60, variance: 0.1, perDifficulty: 30, perRarity: 15 }, deposit: { base: 120, variance: 0.1, perDifficulty: 60, perRarity: 30 } },
  reward: { gold: { base: 550, variance: 0.2, perDifficulty: 275, perRarity: 138 }, glory: { base: 32, variance: 0, perDifficulty: 16, perRarity: 11 }, experience: { base: 190, variance: 0.1, perDifficulty: 95, perRarity: 48 }, warSoul: { base: 110, variance: 0.2, perDifficulty: 55, perRarity: 37 } },
  enemies: { types: ['core_guardian', 'world_shadow'], count: { base: 4, variance: 0.5, perDifficulty: 1, perRarity: 0 }, levelBonus: 4 },
  isRepeatable: true, cooldownHours: 24,
};

export const depthsInvestigateMissions: MissionTemplate[] = [
  investigateAnomaliesEpic,
  investigateCoreLegendary,
];
