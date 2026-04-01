/**
 * Боевые миссии для локации "Глубины Подземелий"
 */

import type { MissionTemplate } from '../../missions/_mission-template';

export const huntDeepHorrorsEpic: MissionTemplate = {
  id: 'depths_hunt_horrors_1',
  locationId: 'depths_of_the_world',
  type: 'hunt',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Ужасы глубины',
  description: `Глубинные ужасы — существа из чистой тьмы, существующие вне нормальной реальности. Они охотятся на всё, что несёт свет. Дух глубины просит зачистить верхние уровни.`,
  objective: 'Уничтожить 4-6 глубинных ужасов',
  client: { name: 'Дух глубины', type: 'scholar', description: 'Помогает найти путь' },
  duration: { base: 9000, variance: 0.2, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 48, variance: 0.1, perDifficulty: 24, perRarity: 12 }, deposit: { base: 95, variance: 0.1, perDifficulty: 48, perRarity: 24 } },
  reward: { gold: { base: 450, variance: 0.2, perDifficulty: 225, perRarity: 113 }, glory: { base: 26, variance: 0, perDifficulty: 13, perRarity: 9 }, experience: { base: 155, variance: 0.1, perDifficulty: 78, perRarity: 39 }, warSoul: { base: 85, variance: 0.2, perDifficulty: 43, perRarity: 28 } },
  enemies: { types: ['deep_horror'], count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true, cooldownHours: 16,
};

export const huntTimeEatersEpic: MissionTemplate = {
  id: 'depths_hunt_time_1',
  locationId: 'depths_of_the_world',
  type: 'hunt',
  rarity: 'epic',
  difficulty: 'extreme',
  name: 'Пожиратели времени',
  description: `Пожиратели времени — существа, питающиеся самим временем. Их прикосновение старит на годы. Безумный исследователь говорит, что они охраняют темпоральные аномалии.`,
  objective: 'Уничтожить 3-5 пожирателей времени',
  client: { name: 'Безумный исследователь', type: 'scholar', description: 'Говорит на мёртвых языках' },
  duration: { base: 9000, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 52, variance: 0.1, perDifficulty: 26, perRarity: 13 }, deposit: { base: 105, variance: 0.1, perDifficulty: 53, perRarity: 26 } },
  reward: { gold: { base: 480, variance: 0.2, perDifficulty: 240, perRarity: 120 }, glory: { base: 28, variance: 0, perDifficulty: 14, perRarity: 9 }, experience: { base: 160, variance: 0.1, perDifficulty: 80, perRarity: 40 }, warSoul: { base: 90, variance: 0.2, perDifficulty: 45, perRarity: 30 } },
  enemies: { types: ['time_eater'], count: { base: 3, variance: 0.3, perDifficulty: 2, perRarity: 0 }, levelBonus: 2 },
  isRepeatable: true, cooldownHours: 18,
};

export const huntCoreGuardianLegendary: MissionTemplate = {
  id: 'depths_hunt_guardian_1',
  locationId: 'depths_of_the_world',
  type: 'hunt',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Стражи ядра',
  description: `Стражи ядра — последняя линия защиты перед Сердцем мира. Они древнее самих богов и не позволят никому приблизиться. Последний хранитель говорит, что нужно пройти мимо них.`,
  objective: 'Победить 2-3 стражей ядра',
  client: { name: 'Последний хранитель Эон', type: 'scholar', description: 'Охраняет вход к сердцу' },
  duration: { base: 10800, variance: 0.25, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 62, variance: 0.1, perDifficulty: 31, perRarity: 16 }, deposit: { base: 125, variance: 0.1, perDifficulty: 63, perRarity: 31 } },
  reward: { gold: { base: 620, variance: 0.2, perDifficulty: 310, perRarity: 155 }, glory: { base: 34, variance: 0, perDifficulty: 17, perRarity: 11 }, experience: { base: 200, variance: 0.1, perDifficulty: 100, perRarity: 50 }, warSoul: { base: 115, variance: 0.2, perDifficulty: 58, perRarity: 38 } },
  enemies: { types: ['core_guardian'], count: { base: 2, variance: 0.25, perDifficulty: 1, perRarity: 0 }, levelBonus: 3 },
  isRepeatable: true, cooldownHours: 22,
};

export const huntWorldShadowLegendary: MissionTemplate = {
  id: 'depths_hunt_shadow_1',
  locationId: 'depths_of_the_world',
  type: 'hunt',
  rarity: 'legendary',
  difficulty: 'extreme',
  name: 'Тень мира',
  description: `Тень мира — отражение всего сущего. Она существует, пока существует мир, и знает все его тайны. Победить её невозможно — можно лишь заставить отступить.`,
  objective: 'Отразить атаку Тени мира',
  client: { name: 'Последний хранитель Эон', type: 'scholar', description: 'Единственный знает способ' },
  duration: { base: 12600, variance: 0.3, perDifficulty: 600, perRarity: 300 },
  cost: { supplies: { base: 75, variance: 0.1, perDifficulty: 38, perRarity: 19 }, deposit: { base: 150, variance: 0.1, perDifficulty: 75, perRarity: 38 } },
  reward: { gold: { base: 800, variance: 0.2, perDifficulty: 400, perRarity: 200 }, glory: { base: 45, variance: 0, perDifficulty: 23, perRarity: 15 }, experience: { base: 250, variance: 0.1, perDifficulty: 125, perRarity: 63 }, warSoul: { base: 150, variance: 0.2, perDifficulty: 75, perRarity: 50 } },
  enemies: { types: ['world_shadow', 'core_guardian', 'deep_horror', 'deep_horror'], count: { base: 5, variance: 0.2, perDifficulty: 2, perRarity: 0 }, levelBonus: 4 },
  isRepeatable: true, cooldownHours: 28,
};

export const depthsHuntMissions: MissionTemplate[] = [huntDeepHorrorsEpic, huntTimeEatersEpic, huntCoreGuardianLegendary, huntWorldShadowLegendary];
