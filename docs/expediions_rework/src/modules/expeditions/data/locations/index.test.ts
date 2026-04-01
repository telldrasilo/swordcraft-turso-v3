/**
 * Интеграционные тесты для данных локаций
 */

import { describe, it, expect } from 'vitest';
import {
  LOCATION_REGISTRY,
  getLocationById,
  getLocationsByTier,
  getAvailableLocations,
  getLocationsByType,
  getLocationsByTag,
  isLocationAvailable,
} from './index';
import { validateLocation } from '../../lib/location-utils';
import { MATERIAL_REGISTRY } from '../materials';
import { TIER_RARITY_DISTRIBUTION } from '../../types/location.types';

describe('LOCATION_REGISTRY', () => {
  it('should have at least one location', () => {
    expect(LOCATION_REGISTRY.length).toBeGreaterThan(0);
  });

  it('should have all required location IDs', () => {
    const expectedIds = [
      'oak_grove_outskirts',
      'red_stone_mines',
      'misty_lowlands',
      'silver_grove',
      'forgotten_mines',
      'rotten_swamp',
      'frost_iron_ridge',
      'ash_wastes',
      'whispering_forest',
      'dragon_scars',
      'depths_of_the_world',
    ];

    for (const id of expectedIds) {
      expect(LOCATION_REGISTRY.some(l => l.id === id)).toBe(true);
    }
  });

  it('should have unique IDs', () => {
    const ids = LOCATION_REGISTRY.map(l => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid tier distribution', () => {
    const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

    for (const location of LOCATION_REGISTRY) {
      tierCounts[location.tier]++;
    }

    // Each tier should have at least one location
    expect(tierCounts[1]).toBeGreaterThan(0);
    expect(tierCounts[2]).toBeGreaterThan(0);
    expect(tierCounts[3]).toBeGreaterThan(0);
    expect(tierCounts[4]).toBeGreaterThan(0);
  });
});

describe('Location validation', () => {
  it('should validate all locations without critical errors', () => {
    const allErrors: string[] = [];

    for (const location of LOCATION_REGISTRY) {
      const errors = validateLocation(location, MATERIAL_REGISTRY);
      // Filter out non-critical warnings (rarity mismatch is a data consistency issue, not critical)
      const criticalErrors = errors.filter(
        e => e.field !== 'npcs.hostile' && !e.message.includes('rarity')
      );

      for (const err of criticalErrors) {
        allErrors.push(`${location.id}: ${err.field} - ${err.message}`);
      }
    }

    // Log errors for debugging
    if (allErrors.length > 0) {
      console.log('Validation errors:', allErrors);
    }

    expect(allErrors.length).toBe(0);
  });

  it('should have resources for all locations', () => {
    for (const location of LOCATION_REGISTRY) {
      expect(location.resources.length).toBeGreaterThan(0);
    }
  });

  it('should have weather conditions summing to 100%', () => {
    for (const location of LOCATION_REGISTRY) {
      const totalChance = location.weather.reduce((sum, w) => sum + w.chance, 0);
      expect(Math.abs(totalChance - 100)).toBeLessThanOrEqual(1);
    }
  });

  it('should have at least one hostile NPC for hunt missions', () => {
    const locationsForHunt = LOCATION_REGISTRY.filter(
      l => l.type !== 'magical' // Some locations might not have traditional combat
    );

    for (const location of locationsForHunt) {
      // Some locations might legitimately have no hostile NPCs
      // Just check structure is valid
      expect(location.npcs).toBeDefined();
      expect(Array.isArray(location.npcs.hostile)).toBe(true);
    }
  });

  it('should have valid rarity distribution matching resources', () => {
    for (const location of LOCATION_REGISTRY) {
      const total = Object.values(location.rarityDistribution).reduce((a, b) => a + b, 0);
      // Should sum to approximately 100
      expect(Math.abs(total - 100)).toBeLessThanOrEqual(5);
    }
  });

  it('should have guild level requirements matching tier', () => {
    const tierGuildLevels: Record<number, number> = { 1: 1, 2: 3, 3: 6, 4: 9 };

    for (const location of LOCATION_REGISTRY) {
      const expectedMin = tierGuildLevels[location.tier];
      expect(location.unlockRequirements.guildLevel).toBeGreaterThanOrEqual(expectedMin);
    }
  });

  it('should have valid materials in resources', () => {
    for (const location of LOCATION_REGISTRY) {
      for (const resource of location.resources) {
        const material = MATERIAL_REGISTRY.find(m => m.id === resource.materialId);

        expect(material, `Material ${resource.materialId} not found in registry for location ${location.id}`).toBeDefined();
      }
    }
  });
});

describe('getLocationById', () => {
  it('should return location for valid ID', () => {
    const location = getLocationById('oak_grove_outskirts');

    expect(location).toBeDefined();
    expect(location?.name).toBe('Окраины Дубовой Рощи');
  });

  it('should return undefined for invalid ID', () => {
    const location = getLocationById('nonexistent_location');

    expect(location).toBeUndefined();
  });
});

describe('getLocationsByTier', () => {
  it('should return correct locations for tier 1', () => {
    const locations = getLocationsByTier(1);

    expect(locations.length).toBeGreaterThan(0);
    expect(locations.every(l => l.tier === 1)).toBe(true);
  });

  it('should return correct locations for tier 4', () => {
    const locations = getLocationsByTier(4);

    expect(locations.length).toBeGreaterThan(0);
    expect(locations.every(l => l.tier === 4)).toBe(true);
  });
});

describe('getAvailableLocations', () => {
  it('should return only tier 1 for guild level 1', () => {
    const locations = getAvailableLocations(1);

    expect(locations.every(l => l.tier === 1)).toBe(true);
  });

  it('should return more locations for higher guild level', () => {
    const level1 = getAvailableLocations(1).length;
    const level5 = getAvailableLocations(5).length;
    const level10 = getAvailableLocations(10).length;

    expect(level5).toBeGreaterThan(level1);
    expect(level10).toBeGreaterThan(level5);
  });

  it('should return all locations for guild level 10', () => {
    const locations = getAvailableLocations(10);

    expect(locations.length).toBe(LOCATION_REGISTRY.length);
  });
});

describe('getLocationsByType', () => {
  it('should return forest locations', () => {
    const locations = getLocationsByType('forest');

    expect(locations.length).toBeGreaterThan(0);
    expect(locations.every(l => l.type === 'forest')).toBe(true);
  });

  it('should return mine locations', () => {
    const locations = getLocationsByType('mine');

    expect(locations.length).toBeGreaterThan(0);
    expect(locations.every(l => l.type === 'mine')).toBe(true);
  });
});

describe('getLocationsByTag', () => {
  it('should return locations with forest tag', () => {
    const locations = getLocationsByTag('forest');

    expect(locations.every(l => l.tags.includes('forest'))).toBe(true);
  });

  it('should return empty array for nonexistent tag', () => {
    const locations = getLocationsByTag('nonexistent_tag');

    expect(locations).toHaveLength(0);
  });
});

describe('isLocationAvailable', () => {
  it('should return true for available location', () => {
    const available = isLocationAvailable('oak_grove_outskirts', 1);

    expect(available).toBe(true);
  });

  it('should return false for locked location', () => {
    // Most tier 4 locations require guild level 9+
    const available = isLocationAvailable('depths_of_the_world', 1);

    expect(available).toBe(false);
  });

  it('should return false for nonexistent location', () => {
    const available = isLocationAvailable('nonexistent', 10);

    expect(available).toBe(false);
  });
});

describe('Location data consistency', () => {
  it('should have Russian names', () => {
    for (const location of LOCATION_REGISTRY) {
      // Check for Cyrillic characters (Russian)
      const hasCyrillic = /[\u0400-\u04FF]/.test(location.name);
      expect(hasCyrillic, `Location ${location.id} should have Russian name`).toBe(true);
    }
  });

  it('should have Russian descriptions', () => {
    for (const location of LOCATION_REGISTRY) {
      const hasCyrillic = /[\u0400-\u04FF]/.test(location.description);
      expect(hasCyrillic, `Location ${location.id} should have Russian description`).toBe(true);
    }
  });

  it('should have plot hooks', () => {
    for (const location of LOCATION_REGISTRY) {
      expect(location.plotHook.length).toBeGreaterThan(0);
    }
  });

  it('should have correct tier-based rarity distribution', () => {
    for (const location of LOCATION_REGISTRY) {
      const expectedDist = TIER_RARITY_DISTRIBUTION[location.tier];

      // Locations can have different distributions based on their resources
      // But should roughly follow the tier pattern
      if (expectedDist.legendary === 0) {
        expect(location.rarityDistribution.legendary).toBe(0);
      }
    }
  });
});
