/**
 * Тесты для утилит миссий
 */

import { describe, it, expect } from 'vitest';
import {
  addMissionToRegistry,
  addMissionsToRegistry,
  updateMissionInRegistry,
  updateMissionReward,
  updateMissionCost,
  updateMissionDuration,
  updateMissionEnemies,
  removeMissionFromRegistry,
  getMissionsForLocation,
  getMissionsByType,
  getMissionsByDifficulty,
  getMissionsByRarity,
  getMissionsForGuildLevel,
  getAvailableMissions,
  validateMission,
  validateAllMissions,
  createHuntMission,
  createGatherMission,
  createScoutMission,
} from './mission-utils';
import type { MissionTemplate } from '../data/missions/_mission-template';
import type { Location } from '../types';

// Создаём моковую миссию на основе реального шаблона
const createMockMission = (overrides: Partial<MissionTemplate> = {}): MissionTemplate => ({
  id: 'test_mission',
  locationId: 'test_location',
  type: 'hunt',
  rarity: 'common',
  difficulty: 'normal',
  name: 'Test Mission',
  description: 'A test mission for testing purposes',
  objective: 'Complete the test',
  client: {
    name: 'Test Client',
    type: 'commoner',
  },
  duration: {
    base: 3600,
    variance: 0.2,
    perDifficulty: 600,
    perRarity: 300,
  },
  cost: {
    supplies: { base: 15, variance: 0.1, perDifficulty: 8, perRarity: 4 },
    deposit: { base: 30, variance: 0.1, perDifficulty: 15, perRarity: 8 },
  },
  reward: {
    gold: { base: 80, variance: 0.2, perDifficulty: 40, perRarity: 20 },
    glory: { base: 3, variance: 0, perDifficulty: 2, perRarity: 1 },
    experience: { base: 35, variance: 0.1, perDifficulty: 18, perRarity: 9 },
    warSoul: { base: 10, variance: 0.2, perDifficulty: 5, perRarity: 3 },
  },
  enemies: {
    types: ['wolf'],
    count: { base: 4, variance: 0.25, perDifficulty: 2, perRarity: 0 },
    levelBonus: 0,
  },
  isRepeatable: true,
  cooldownHours: 6,
  ...overrides,
});

// Моковая локация
const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  id: 'test_location',
  name: 'Test Location',
  description: 'A test location',
  tier: 1,
  type: 'forest',
  tags: [],
  unlockRequirements: { guildLevel: 1 },
  resources: [],
  rarityDistribution: { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  weather: [],
  npcs: {
    hostile: [{ id: 'wolf', name: 'Wolf', levelRange: [1, 3], disposition: 'hostile', description: 'A wild wolf' }],
    neutral: [],
    friendly: [],
  },
  plotHook: '',
  ...overrides,
});

describe('addMissionToRegistry', () => {
  it('should add mission to empty registry', () => {
    const mission = createMockMission();
    const result = addMissionToRegistry([], mission);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test_mission');
  });

  it('should add mission to existing registry', () => {
    const mission1 = createMockMission({ id: 'mission-1' });
    const mission2 = createMockMission({ id: 'mission-2' });

    const result = addMissionToRegistry([mission1], mission2);

    expect(result).toHaveLength(2);
  });

  it('should not add duplicate mission', () => {
    const mission = createMockMission();
    const result = addMissionToRegistry([mission], mission);

    expect(result).toHaveLength(1);
  });
});

describe('addMissionsToRegistry', () => {
  it('should add multiple missions', () => {
    const missions = [
      createMockMission({ id: 'm1' }),
      createMockMission({ id: 'm2' }),
      createMockMission({ id: 'm3' }),
    ];

    const result = addMissionsToRegistry([], missions);

    expect(result).toHaveLength(3);
  });
});

describe('updateMissionInRegistry', () => {
  it('should update mission name', () => {
    const mission = createMockMission();
    const result = updateMissionInRegistry([mission], 'test_mission', { name: 'Updated Mission' });

    expect(result[0].name).toBe('Updated Mission');
  });

  it('should not modify other missions', () => {
    const mission1 = createMockMission({ id: 'm1', name: 'Mission 1' });
    const mission2 = createMockMission({ id: 'm2', name: 'Mission 2' });

    const result = updateMissionInRegistry([mission1, mission2], 'm1', { name: 'Updated' });

    expect(result[0].name).toBe('Updated');
    expect(result[1].name).toBe('Mission 2');
  });
});

describe('updateMissionReward', () => {
  it('should update gold reward', () => {
    const mission = createMockMission();
    const result = updateMissionReward([mission], 'test_mission', {
      gold: { base: 200, variance: 0.1, perDifficulty: 50, perRarity: 25 },
    });

    expect(result[0].reward.gold.base).toBe(200);
  });
});

describe('updateMissionCost', () => {
  it('should update supplies cost', () => {
    const mission = createMockMission();
    const result = updateMissionCost([mission], 'test_mission', {
      supplies: { base: 50, variance: 0.1, perDifficulty: 10, perRarity: 5 },
    });

    expect(result[0].cost.supplies.base).toBe(50);
  });
});

describe('updateMissionDuration', () => {
  it('should update mission duration', () => {
    const mission = createMockMission();
    const result = updateMissionDuration([mission], 'test_mission', {
      base: 7200,
      variance: 0.3,
      perDifficulty: 1200,
      perRarity: 600,
    });

    expect(result[0].duration.base).toBe(7200);
  });
});

describe('updateMissionEnemies', () => {
  it('should update enemy types', () => {
    const mission = createMockMission();
    const result = updateMissionEnemies([mission], 'test_mission', {
      types: ['bear', 'boar'],
    });

    expect(result[0].enemies?.types).toContain('bear');
    expect(result[0].enemies?.types).toContain('boar');
  });
});

describe('removeMissionFromRegistry', () => {
  it('should remove mission by id', () => {
    const mission1 = createMockMission({ id: 'm1' });
    const mission2 = createMockMission({ id: 'm2' });

    const result = removeMissionFromRegistry([mission1, mission2], 'm1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m2');
  });

  it('should return empty array when removing from empty registry', () => {
    const result = removeMissionFromRegistry([], 'nonexistent');
    expect(result).toHaveLength(0);
  });
});

describe('getMissionsForLocation', () => {
  it('should filter missions by location', () => {
    const missions = [
      createMockMission({ id: 'm1', locationId: 'loc-a' }),
      createMockMission({ id: 'm2', locationId: 'loc-b' }),
      createMockMission({ id: 'm3', locationId: 'loc-a' }),
    ];

    const result = getMissionsForLocation(missions, 'loc-a');

    expect(result).toHaveLength(2);
    expect(result.every(m => m.locationId === 'loc-a')).toBe(true);
  });
});

describe('getMissionsByType', () => {
  it('should filter missions by type', () => {
    const missions = [
      createMockMission({ id: 'm1', type: 'hunt' }),
      createMockMission({ id: 'm2', type: 'gather' }),
      createMockMission({ id: 'm3', type: 'hunt' }),
    ];

    const result = getMissionsByType(missions, 'hunt');

    expect(result).toHaveLength(2);
    expect(result.every(m => m.type === 'hunt')).toBe(true);
  });
});

describe('getMissionsByDifficulty', () => {
  it('should filter missions by difficulty', () => {
    const missions = [
      createMockMission({ id: 'm1', difficulty: 'easy' }),
      createMockMission({ id: 'm2', difficulty: 'hard' }),
      createMockMission({ id: 'm3', difficulty: 'easy' }),
    ];

    const result = getMissionsByDifficulty(missions, 'easy');

    expect(result).toHaveLength(2);
  });
});

describe('getMissionsByRarity', () => {
  it('should filter missions by rarity', () => {
    const missions = [
      createMockMission({ id: 'm1', rarity: 'common' }),
      createMockMission({ id: 'm2', rarity: 'rare' }),
      createMockMission({ id: 'm3', rarity: 'common' }),
    ];

    const result = getMissionsByRarity(missions, 'common');

    expect(result).toHaveLength(2);
  });
});

describe('getMissionsForGuildLevel', () => {
  it('should return missions available for guild level', () => {
    const missions = [
      createMockMission({ id: 'm1', requirements: { minGuildLevel: 1 } }),
      createMockMission({ id: 'm2', requirements: { minGuildLevel: 5 } }),
      createMockMission({ id: 'm3', requirements: { minGuildLevel: 3 } }),
    ];

    const result = getMissionsForGuildLevel(missions, 3);

    expect(result).toHaveLength(2);
    expect(result.map(m => m.id)).toContain('m1');
    expect(result.map(m => m.id)).toContain('m3');
  });
});

describe('getAvailableMissions', () => {
  it('should filter by multiple criteria', () => {
    const missions = [
      createMockMission({
        id: 'm1',
        locationId: 'loc-a',
        type: 'hunt',
        difficulty: 'easy',
        rarity: 'common',
      }),
      createMockMission({
        id: 'm2',
        locationId: 'loc-b',
        type: 'hunt',
        difficulty: 'easy',
        rarity: 'common',
      }),
      createMockMission({
        id: 'm3',
        locationId: 'loc-a',
        type: 'gather',
        difficulty: 'easy',
        rarity: 'common',
      }),
    ];

    const result = getAvailableMissions(missions, {
      locationId: 'loc-a',
      type: 'hunt',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m1');
  });
});

describe('validateMission', () => {
  it('should return no errors for valid mission', () => {
    const mission = createMockMission();
    const location = createMockLocation();
    const errors = validateMission(mission, location);

    expect(errors).toHaveLength(0);
  });

  it('should return error for empty id', () => {
    const mission = createMockMission({ id: '' });
    const errors = validateMission(mission);

    expect(errors.some(e => e.field === 'id')).toBe(true);
  });

  it('should return error for missing locationId', () => {
    const mission = createMockMission({ locationId: '' });
    const errors = validateMission(mission);

    expect(errors.some(e => e.field === 'locationId')).toBe(true);
  });

  it('should return error when enemy not in location NPCs', () => {
    const mission = createMockMission({
      enemies: {
        types: ['dragon'],
        count: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
        levelBonus: 0,
      },
    });
    const location = createMockLocation();

    const errors = validateMission(mission, location);

    expect(errors.some(e => e.field === 'enemies.types')).toBe(true);
  });

  it('should return error for negative gold reward', () => {
    const mission = createMockMission({
      reward: {
        ...createMockMission().reward,
        gold: { base: -10, variance: 0.2, perDifficulty: 0, perRarity: 0 },
      },
    });

    const errors = validateMission(mission);

    expect(errors.some(e => e.field === 'reward.gold')).toBe(true);
  });

  it('should return error for negative cost', () => {
    const mission = createMockMission({
      cost: {
        supplies: { base: -5, variance: 0.1, perDifficulty: 0, perRarity: 0 },
        deposit: { base: 30, variance: 0.1, perDifficulty: 0, perRarity: 0 },
      },
    });

    const errors = validateMission(mission);

    expect(errors.some(e => e.field === 'cost')).toBe(true);
  });

  it('should return error for zero duration', () => {
    const mission = createMockMission({
      duration: { base: 0, variance: 0.1, perDifficulty: 0, perRarity: 0 },
    });

    const errors = validateMission(mission);

    expect(errors.some(e => e.field === 'duration')).toBe(true);
  });

  it('should return error for repeatable mission without cooldown', () => {
    const mission = createMockMission({
      isRepeatable: true,
      cooldownHours: 0,
    });

    const errors = validateMission(mission);

    expect(errors.some(e => e.field === 'cooldownHours')).toBe(true);
  });
});

describe('validateAllMissions', () => {
  it('should validate all missions and return all errors', () => {
    const missions = [
      createMockMission({ id: 'm1' }),
      createMockMission({ id: '', }), // Invalid
    ];
    const locations = [createMockLocation()];

    const errors = validateAllMissions(missions, locations);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.missionId === 'unknown')).toBe(true);
  });
});

describe('createHuntMission', () => {
  it('should create hunt mission with correct type', () => {
    const mission = createHuntMission({
      id: 'hunt_wolves',
      locationId: 'forest',
      name: 'Wolf Hunt',
      description: 'Hunt wolves in the forest',
      objective: 'Kill 5 wolves',
      enemyTypes: ['wolf'],
    });

    expect(mission.type).toBe('hunt');
    expect(mission.enemies?.types).toContain('wolf');
    expect(mission.isRepeatable).toBe(true);
  });
});

describe('createGatherMission', () => {
  it('should create gather mission with correct type', () => {
    const mission = createGatherMission({
      id: 'gather_herbs',
      locationId: 'forest',
      name: 'Herb Gathering',
      description: 'Gather herbs',
      objective: 'Collect 10 herbs',
    });

    expect(mission.type).toBe('gather');
    expect(mission.difficulty).toBe('easy');
    expect(mission.isRepeatable).toBe(true);
  });
});

describe('createScoutMission', () => {
  it('should create scout mission with correct type', () => {
    const mission = createScoutMission({
      id: 'scout_area',
      locationId: 'forest',
      name: 'Scout the Area',
      description: 'Scout the forest',
      objective: 'Map the area',
    });

    expect(mission.type).toBe('scout');
    expect(mission.client.type).toBe('guild');
    expect(mission.isRepeatable).toBe(true);
  });
});
