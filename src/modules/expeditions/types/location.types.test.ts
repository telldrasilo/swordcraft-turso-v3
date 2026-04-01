/**
 * Тесты для типов локаций
 */

import { describe, it, expect } from 'vitest';
import {
  RARITY_WEIGHTS,
  RARITY_COLORS,
  TIER_RARITY_DISTRIBUTION,
  getTierByGuildLevel,
  isLocationUnlocked,
  type Location,
  type LocationTier,
  type Rarity,
} from './location.types';

describe('RARITY_WEIGHTS', () => {
  it('should have all rarity levels', () => {
    const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    for (const rarity of rarities) {
      expect(RARITY_WEIGHTS[rarity]).toBeDefined();
      expect(RARITY_WEIGHTS[rarity]).toBeGreaterThan(0);
    }
  });

  it('should have decreasing weights from common to legendary', () => {
    expect(RARITY_WEIGHTS.common).toBeGreaterThan(RARITY_WEIGHTS.uncommon);
    expect(RARITY_WEIGHTS.uncommon).toBeGreaterThan(RARITY_WEIGHTS.rare);
    expect(RARITY_WEIGHTS.rare).toBeGreaterThan(RARITY_WEIGHTS.epic);
    expect(RARITY_WEIGHTS.epic).toBeGreaterThan(RARITY_WEIGHTS.legendary);
  });

  it('should have legendary as the lowest weight', () => {
    expect(RARITY_WEIGHTS.legendary).toBe(1);
  });
});

describe('RARITY_COLORS', () => {
  it('should have colors for all rarity levels', () => {
    const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    for (const rarity of rarities) {
      expect(RARITY_COLORS[rarity]).toBeDefined();
      expect(RARITY_COLORS[rarity]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('TIER_RARITY_DISTRIBUTION', () => {
  it('should have all tiers (1-4)', () => {
    const tiers: LocationTier[] = [1, 2, 3, 4];

    for (const tier of tiers) {
      expect(TIER_RARITY_DISTRIBUTION[tier]).toBeDefined();
    }
  });

  it('should have increasing rare and epic percentages with tier', () => {
    // Tier 1 should have no rare or epic
    expect(TIER_RARITY_DISTRIBUTION[1].rare).toBe(0);
    expect(TIER_RARITY_DISTRIBUTION[1].epic).toBe(0);
    expect(TIER_RARITY_DISTRIBUTION[1].legendary).toBe(0);

    // Tier 4 should have the highest rare and epic
    expect(TIER_RARITY_DISTRIBUTION[4].rare).toBeGreaterThan(TIER_RARITY_DISTRIBUTION[3].rare);
    expect(TIER_RARITY_DISTRIBUTION[4].epic).toBeGreaterThan(TIER_RARITY_DISTRIBUTION[3].epic);
    expect(TIER_RARITY_DISTRIBUTION[4].legendary).toBeGreaterThan(0);
  });

  it('should have common percentage decreasing with tier', () => {
    expect(TIER_RARITY_DISTRIBUTION[1].common).toBeGreaterThan(TIER_RARITY_DISTRIBUTION[2].common);
    expect(TIER_RARITY_DISTRIBUTION[2].common).toBeGreaterThan(TIER_RARITY_DISTRIBUTION[3].common);
    expect(TIER_RARITY_DISTRIBUTION[3].common).toBeGreaterThan(TIER_RARITY_DISTRIBUTION[4].common);
  });
});

describe('getTierByGuildLevel', () => {
  it('should return only tier 1 for guild level 1-2', () => {
    expect(getTierByGuildLevel(1)).toEqual([1]);
    expect(getTierByGuildLevel(2)).toEqual([1]);
  });

  it('should return tiers 1-2 for guild level 3-5', () => {
    expect(getTierByGuildLevel(3)).toEqual([1, 2]);
    expect(getTierByGuildLevel(4)).toEqual([1, 2]);
    expect(getTierByGuildLevel(5)).toEqual([1, 2]);
  });

  it('should return tiers 1-3 for guild level 6-8', () => {
    expect(getTierByGuildLevel(6)).toEqual([1, 2, 3]);
    expect(getTierByGuildLevel(7)).toEqual([1, 2, 3]);
    expect(getTierByGuildLevel(8)).toEqual([1, 2, 3]);
  });

  it('should return all tiers for guild level 9+', () => {
    expect(getTierByGuildLevel(9)).toEqual([1, 2, 3, 4]);
    expect(getTierByGuildLevel(10)).toEqual([1, 2, 3, 4]);
    expect(getTierByGuildLevel(15)).toEqual([1, 2, 3, 4]);
  });
});

describe('isLocationUnlocked', () => {
  const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
    id: 'test-location',
    name: 'Test Location',
    description: 'A test location',
    tier: 1,
    type: 'forest',
    tags: [],
    unlockRequirements: {
      guildLevel: 1,
    },
    resources: [],
    rarityDistribution: { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    weather: [],
    npcs: { hostile: [], neutral: [], friendly: [] },
    plotHook: '',
    ...overrides,
  });

  it('should return true when all requirements are met', () => {
    const location = createMockLocation();
    expect(isLocationUnlocked(location, 1)).toBe(true);
  });

  it('should return false when guild level is too low', () => {
    const location = createMockLocation({
      unlockRequirements: { guildLevel: 3 },
    });
    expect(isLocationUnlocked(location, 1)).toBe(false);
    expect(isLocationUnlocked(location, 3)).toBe(true);
  });

  it('should return false when required location is not completed', () => {
    const location = createMockLocation({
      unlockRequirements: {
        guildLevel: 1,
        completedLocations: ['previous-location'],
      },
    });
    expect(isLocationUnlocked(location, 1, [])).toBe(false);
    expect(isLocationUnlocked(location, 1, ['previous-location'])).toBe(true);
  });

  it('should return false when required quest is not completed', () => {
    const location = createMockLocation({
      unlockRequirements: {
        guildLevel: 1,
        questCompleted: 'required-quest',
      },
    });
    expect(isLocationUnlocked(location, 1, [], [])).toBe(false);
    expect(isLocationUnlocked(location, 1, [], ['required-quest'])).toBe(true);
  });

  it('should return false when required item is not owned', () => {
    const location = createMockLocation({
      unlockRequirements: {
        guildLevel: 1,
        requiredItems: ['special-key'],
      },
    });
    expect(isLocationUnlocked(location, 1, [], [], [])).toBe(false);
    expect(isLocationUnlocked(location, 1, [], [], ['special-key'])).toBe(true);
  });

  it('should check all requirements together', () => {
    const location = createMockLocation({
      unlockRequirements: {
        guildLevel: 3,
        completedLocations: ['loc-1'],
        questCompleted: 'quest-1',
        requiredItems: ['item-1'],
      },
    });

    // Missing all
    expect(isLocationUnlocked(location, 1, [], [], [])).toBe(false);

    // Has guild level but missing others
    expect(isLocationUnlocked(location, 3, [], [], [])).toBe(false);

    // Has guild level and location but missing others
    expect(isLocationUnlocked(location, 3, ['loc-1'], [], [])).toBe(false);

    // Has everything
    expect(isLocationUnlocked(location, 3, ['loc-1'], ['quest-1'], ['item-1'])).toBe(true);
  });
});
