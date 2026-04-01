/**
 * Тесты для шаблона событий
 */

import { describe, it, expect } from 'vitest';
import {
  EVENT_TYPE_CONFIG,
  EVENT_COUNT_CONFIG,
  calculateEventCount,
  selectMaterialFromLocation,
  getMaterialsByRarityFromLocation,
  distributeEventsByTime,
  EXAMPLE_POSITIVE_EVENT,
  EXAMPLE_NEGATIVE_EVENT,
  EXAMPLE_CHOICE_EVENT,
} from './_event-template';
import type { LocationResource, Rarity } from '../../types';

describe('EVENT_TYPE_CONFIG', () => {
  it('should have all event types', () => {
    expect(EVENT_TYPE_CONFIG.positive).toBeDefined();
    expect(EVENT_TYPE_CONFIG.negative).toBeDefined();
    expect(EVENT_TYPE_CONFIG.neutral).toBeDefined();
    expect(EVENT_TYPE_CONFIG.choice).toBeDefined();
  });

  it('should have weights summing to 100', () => {
    const totalWeight = Object.values(EVENT_TYPE_CONFIG)
      .reduce((sum, config) => sum + config.weight, 0);

    expect(totalWeight).toBe(100);
  });

  it('should have icons for all types', () => {
    for (const config of Object.values(EVENT_TYPE_CONFIG)) {
      expect(config.icon).toBeDefined();
      expect(config.icon.length).toBeGreaterThan(0);
    }
  });

  it('should have positive as most common', () => {
    expect(EVENT_TYPE_CONFIG.positive.weight).toBeGreaterThan(EVENT_TYPE_CONFIG.negative.weight);
    expect(EVENT_TYPE_CONFIG.positive.weight).toBeGreaterThan(EVENT_TYPE_CONFIG.neutral.weight);
    expect(EVENT_TYPE_CONFIG.positive.weight).toBeGreaterThan(EVENT_TYPE_CONFIG.choice.weight);
  });
});

describe('EVENT_COUNT_CONFIG', () => {
  it('should have valid base count', () => {
    expect(EVENT_COUNT_CONFIG.baseCount).toBeGreaterThan(0);
  });

  it('should have min <= max', () => {
    expect(EVENT_COUNT_CONFIG.minCount).toBeLessThanOrEqual(EVENT_COUNT_CONFIG.maxCount);
  });

  it('should have reasonable limits', () => {
    expect(EVENT_COUNT_CONFIG.minCount).toBeGreaterThanOrEqual(1);
    expect(EVENT_COUNT_CONFIG.maxCount).toBeLessThanOrEqual(20);
  });

  it('should have contract bonuses', () => {
    expect(EVENT_COUNT_CONFIG.contractBonus.exploration).toBeGreaterThan(0);
    expect(EVENT_COUNT_CONFIG.contractBonus.speed).toBeLessThan(0);
  });
});

describe('calculateEventCount', () => {
  it('should return minimum count for short missions', () => {
    const result = calculateEventCount(60, 1, 'easy', 'common', 'exploration');
    expect(result).toBeGreaterThanOrEqual(EVENT_COUNT_CONFIG.minCount);
  });

  it('should increase with duration', () => {
    const short = calculateEventCount(300, 1, 'easy', 'common', 'exploration');
    const long = calculateEventCount(3600, 1, 'easy', 'common', 'exploration');

    expect(long).toBeGreaterThanOrEqual(short);
  });

  it('should increase with location tier', () => {
    const tier1 = calculateEventCount(3600, 1, 'normal', 'common', 'exploration');
    const tier4 = calculateEventCount(3600, 4, 'normal', 'common', 'exploration');

    expect(tier4).toBeGreaterThanOrEqual(tier1);
  });

  it('should increase with difficulty', () => {
    const easy = calculateEventCount(3600, 2, 'easy', 'common', 'exploration');
    const hard = calculateEventCount(3600, 2, 'hard', 'common', 'exploration');

    expect(hard).toBeGreaterThanOrEqual(easy);
  });

  it('should increase with rarity', () => {
    const common = calculateEventCount(3600, 2, 'normal', 'common', 'exploration');
    const rare = calculateEventCount(3600, 2, 'normal', 'rare', 'exploration');

    expect(rare).toBeGreaterThanOrEqual(common);
  });

  it('should be higher for exploration contract', () => {
    const exploration = calculateEventCount(3600, 2, 'normal', 'common', 'exploration');
    const speed = calculateEventCount(3600, 2, 'normal', 'common', 'speed');

    expect(exploration).toBeGreaterThan(speed);
  });

  it('should not exceed maximum', () => {
    const result = calculateEventCount(86400, 4, 'extreme', 'epic', 'exploration');
    expect(result).toBeLessThanOrEqual(EVENT_COUNT_CONFIG.maxCount);
  });

  it('should not go below minimum', () => {
    const result = calculateEventCount(0, 1, 'easy', 'common', 'speed');
    expect(result).toBeGreaterThanOrEqual(EVENT_COUNT_CONFIG.minCount);
  });
});

describe('selectMaterialFromLocation', () => {
  const createMockResources = (): LocationResource[] => [
    { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'silver', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'gold', baseWeight: 15, rarity: 'rare', minQuantity: 1, maxQuantity: 1 },
    { materialId: 'mithril', baseWeight: 5, rarity: 'epic', minQuantity: 1, maxQuantity: 1 },
  ];

  it('should return null for empty resources', () => {
    const result = selectMaterialFromLocation([], 'common');
    expect(result).toBeNull();
  });

  it('should return material of specific rarity', () => {
    const resources = createMockResources();
    const result = selectMaterialFromLocation(resources, 'rare');

    expect(result).not.toBeNull();
    expect(result?.rarity).toBe('rare');
    expect(result?.materialId).toBe('gold');
  });

  it('should return null if rarity not found', () => {
    const resources = createMockResources();
    const result = selectMaterialFromLocation(resources, 'legendary');

    expect(result).toBeNull();
  });

  it('should return any material when rarity is "any"', () => {
    const resources = createMockResources();
    const result = selectMaterialFromLocation(resources, 'any');

    expect(result).not.toBeNull();
    expect(resources.map(r => r.materialId)).toContain(result?.materialId);
  });

  it('should be deterministic with seed', () => {
    const resources = createMockResources();

    const result1 = selectMaterialFromLocation(resources, 'any', 12345);
    const result2 = selectMaterialFromLocation(resources, 'any', 12345);
    const result3 = selectMaterialFromLocation(resources, 'any', 12345);

    expect(result1?.materialId).toBe(result2?.materialId);
    expect(result2?.materialId).toBe(result3?.materialId);
  });

  it('should respect weights in selection', () => {
    const resources: LocationResource[] = [
      { materialId: 'common_mat', baseWeight: 90, rarity: 'common', minQuantity: 1, maxQuantity: 1 },
      { materialId: 'rare_mat', baseWeight: 10, rarity: 'common', minQuantity: 1, maxQuantity: 1 },
    ];

    // Run multiple times and count occurrences
    const counts: Record<string, number> = { common_mat: 0, rare_mat: 0 };
    for (let i = 0; i < 100; i++) {
      const result = selectMaterialFromLocation(resources, 'common', i);
      if (result) {
        counts[result.materialId]++;
      }
    }

    // Common material should be selected more often due to higher weight
    expect(counts.common_mat).toBeGreaterThan(counts.rare_mat);
  });
});

describe('getMaterialsByRarityFromLocation', () => {
  const resources: LocationResource[] = [
    { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'copper', baseWeight: 40, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'silver', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    { materialId: 'gold', baseWeight: 15, rarity: 'rare', minQuantity: 1, maxQuantity: 1 },
  ];

  it('should return only common materials', () => {
    const result = getMaterialsByRarityFromLocation(resources, 'common');
    expect(result).toHaveLength(2);
    expect(result.every(r => r.rarity === 'common')).toBe(true);
  });

  it('should return only rare materials', () => {
    const result = getMaterialsByRarityFromLocation(resources, 'rare');
    expect(result).toHaveLength(1);
    expect(result[0].materialId).toBe('gold');
  });

  it('should return empty array for missing rarity', () => {
    const result = getMaterialsByRarityFromLocation(resources, 'legendary');
    expect(result).toHaveLength(0);
  });
});

describe('distributeEventsByTime', () => {
  it('should return correct number of times', () => {
    const count = 5;
    const duration = 3600;
    const times = distributeEventsByTime(count, duration);

    expect(times).toHaveLength(count);
  });

  it('should return times within mission duration', () => {
    const duration = 3600;
    const times = distributeEventsByTime(5, duration);

    for (const time of times) {
      expect(time).toBeGreaterThanOrEqual(0);
      expect(time).toBeLessThan(duration);
    }
  });

  it('should return sorted times', () => {
    const times = distributeEventsByTime(5, 3600);

    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
    }
  });

  it('should be deterministic with seed', () => {
    const times1 = distributeEventsByTime(5, 3600, 12345);
    const times2 = distributeEventsByTime(5, 3600, 12345);

    expect(times1).toEqual(times2);
  });

  it('should return empty array for zero count', () => {
    const times = distributeEventsByTime(0, 3600);
    expect(times).toHaveLength(0);
  });

  it('should handle single event', () => {
    const times = distributeEventsByTime(1, 3600);
    expect(times).toHaveLength(1);
    expect(times[0]).toBeGreaterThan(0);
    expect(times[0]).toBeLessThan(3600);
  });
});

describe('EXAMPLE_POSITIVE_EVENT', () => {
  it('should be a valid event template', () => {
    expect(EXAMPLE_POSITIVE_EVENT.id).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.name).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.type).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.category).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.title).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.description).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.conditions).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.effects).toBeDefined();
    expect(EXAMPLE_POSITIVE_EVENT.weight).toBeGreaterThan(0);
  });

  it('should be positive type', () => {
    expect(EXAMPLE_POSITIVE_EVENT.type).toBe('positive');
  });

  it('should have at least one effect', () => {
    expect(EXAMPLE_POSITIVE_EVENT.effects.length).toBeGreaterThan(0);
  });

  it('should have grant_location_material effect', () => {
    const hasMaterialEffect = EXAMPLE_POSITIVE_EVENT.effects.some(
      e => e.type === 'grant_location_material'
    );
    expect(hasMaterialEffect).toBe(true);
  });
});

describe('EXAMPLE_NEGATIVE_EVENT', () => {
  it('should be a valid event template', () => {
    expect(EXAMPLE_NEGATIVE_EVENT.id).toBeDefined();
    expect(EXAMPLE_NEGATIVE_EVENT.type).toBe('negative');
    expect(EXAMPLE_NEGATIVE_EVENT.effects.length).toBeGreaterThan(0);
  });

  it('should have negative effects', () => {
    const hasNegativeEffect = EXAMPLE_NEGATIVE_EVENT.effects.some(
      e => e.type === 'damage_weapon' || e.type === 'damage_adventurer'
    );
    expect(hasNegativeEffect).toBe(true);
  });
});

describe('EXAMPLE_CHOICE_EVENT', () => {
  it('should be a valid event template', () => {
    expect(EXAMPLE_CHOICE_EVENT.id).toBeDefined();
    expect(EXAMPLE_CHOICE_EVENT.type).toBe('choice');
  });

  it('should have choices', () => {
    expect(EXAMPLE_CHOICE_EVENT.choices).toBeDefined();
    expect(EXAMPLE_CHOICE_EVENT.choices!.length).toBeGreaterThan(1);
  });

  it('should have effects for each choice', () => {
    for (const choice of EXAMPLE_CHOICE_EVENT.choices!) {
      expect(choice.effects).toBeDefined();
      expect(choice.effects.length).toBeGreaterThan(0);
      expect(choice.text).toBeDefined();
    }
  });

  it('should have different outcomes for different choices', () => {
    const choice1EffectTypes = EXAMPLE_CHOICE_EVENT.choices![0].effects.map(e => e.type);
    const choice2EffectTypes = EXAMPLE_CHOICE_EVENT.choices![1].effects.map(e => e.type);

    // At least some difference between choices
    expect(choice1EffectTypes).not.toEqual(choice2EffectTypes);
  });

  it('should have optional requirements on some choices', () => {
    const choicesWithRequirements = EXAMPLE_CHOICE_EVENT.choices!.filter(
      c => c.requires !== undefined
    );
    expect(choicesWithRequirements.length).toBeGreaterThan(0);
  });
});
