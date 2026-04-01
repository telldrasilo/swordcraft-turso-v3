/**
 * Тесты для утилит локаций
 */

import { describe, it, expect } from 'vitest';
import {
  addLocationToRegistry,
  addLocationsToRegistry,
  updateLocationInRegistry,
  updateLocationResources,
  addResourceToLocationInRegistry,
  removeLocationFromRegistry,
  removeResourceFromLocationInRegistry,
  getLocationsByTierFromRegistry,
  getLocationsByTypeFromRegistry,
  getLocationsByTagFromRegistry,
  getAvailableLocationsForGuildLevel,
  getLocationsWithMaterialFromRegistry,
  validateLocation,
  createLocation,
  createForestLocation,
  createMineLocation,
  createSwampLocation,
  getLocationStats,
  getRegistryStats,
} from './location-utils';
import type { Location, LocationResource, Material } from '../types';

// Моковые материалы для тестов
const mockMaterials: Material[] = [
  { id: 'test_wood', name: 'Test Wood', description: 'Test', category: 'wood', rarity: 'common' },
  { id: 'test_ore', name: 'Test Ore', description: 'Test', category: 'ore', rarity: 'uncommon' },
];

// Моковая локация
const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  id: 'test-location',
  name: 'Test Location',
  description: 'A test location for testing',
  tier: 1,
  type: 'forest',
  tags: ['test'],
  unlockRequirements: {
    guildLevel: 1,
  },
  resources: [
    { materialId: 'test_wood', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
  ],
  rarityDistribution: { common: 100, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  weather: [
    { id: 'clear', name: 'Clear', chance: 100, effects: [] },
  ],
  npcs: {
    hostile: [
      { id: 'wolf', name: 'Wolf', levelRange: [1, 3], disposition: 'hostile', description: 'A wild wolf' },
    ],
    neutral: [],
    friendly: [],
  },
  plotHook: 'Test plot hook',
  ...overrides,
});

describe('addLocationToRegistry', () => {
  it('should add location to empty registry', () => {
    const location = createMockLocation();
    const result = addLocationToRegistry([], location);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-location');
  });

  it('should add location to existing registry', () => {
    const location1 = createMockLocation({ id: 'loc-1' });
    const location2 = createMockLocation({ id: 'loc-2' });
    const result = addLocationToRegistry([location1], location2);

    expect(result).toHaveLength(2);
  });

  it('should not add duplicate location', () => {
    const location = createMockLocation();
    const result = addLocationToRegistry([location], location);

    expect(result).toHaveLength(1);
  });
});

describe('addLocationsToRegistry', () => {
  it('should add multiple locations', () => {
    const locations = [
      createMockLocation({ id: 'loc-1' }),
      createMockLocation({ id: 'loc-2' }),
      createMockLocation({ id: 'loc-3' }),
    ];

    const result = addLocationsToRegistry([], locations);
    expect(result).toHaveLength(3);
  });
});

describe('updateLocationInRegistry', () => {
  it('should update location name', () => {
    const location = createMockLocation();
    const result = updateLocationInRegistry([location], 'test-location', { name: 'Updated Name' });

    expect(result[0].name).toBe('Updated Name');
  });

  it('should not modify other locations', () => {
    const location1 = createMockLocation({ id: 'loc-1', name: 'Location 1' });
    const location2 = createMockLocation({ id: 'loc-2', name: 'Location 2' });

    const result = updateLocationInRegistry([location1, location2], 'loc-1', { name: 'Updated' });

    expect(result[0].name).toBe('Updated');
    expect(result[1].name).toBe('Location 2');
  });

  it('should return unchanged registry if location not found', () => {
    const location = createMockLocation();
    const result = updateLocationInRegistry([location], 'non-existent', { name: 'Updated' });

    expect(result[0].name).toBe('Test Location');
  });
});

describe('updateLocationResources', () => {
  it('should update resources and recalculate distribution', () => {
    const location = createMockLocation();
    const newResources: LocationResource[] = [
      { materialId: 'test_wood', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      { materialId: 'test_ore', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    ];

    const result = updateLocationResources([location], 'test-location', newResources);

    expect(result[0].resources).toHaveLength(2);
    expect(result[0].rarityDistribution.common).toBe(50);
    expect(result[0].rarityDistribution.uncommon).toBe(50);
  });
});

describe('addResourceToLocationInRegistry', () => {
  it('should add new resource to location', () => {
    const location = createMockLocation();
    const newResource: LocationResource = {
      materialId: 'test_ore',
      baseWeight: 30,
      rarity: 'uncommon',
      minQuantity: 1,
      maxQuantity: 2,
    };

    const result = addResourceToLocationInRegistry([location], 'test-location', newResource);

    expect(result[0].resources).toHaveLength(2);
  });

  it('should not add duplicate resource', () => {
    const location = createMockLocation();
    const duplicateResource: LocationResource = {
      materialId: 'test_wood',
      baseWeight: 30,
      rarity: 'common',
      minQuantity: 1,
      maxQuantity: 2,
    };

    const result = addResourceToLocationInRegistry([location], 'test-location', duplicateResource);

    expect(result[0].resources).toHaveLength(1);
  });
});

describe('removeLocationFromRegistry', () => {
  it('should remove location by id', () => {
    const location1 = createMockLocation({ id: 'loc-1' });
    const location2 = createMockLocation({ id: 'loc-2' });

    const result = removeLocationFromRegistry([location1, location2], 'loc-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('loc-2');
  });
});

describe('removeResourceFromLocationInRegistry', () => {
  it('should remove resource from location', () => {
    const location = createMockLocation({
      resources: [
        { materialId: 'res-1', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 2 },
        { materialId: 'res-2', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
      ],
    });

    const result = removeResourceFromLocationInRegistry([location], 'test-location', 'res-1');

    expect(result[0].resources).toHaveLength(1);
    expect(result[0].resources[0].materialId).toBe('res-2');
  });
});

describe('getLocationsByTierFromRegistry', () => {
  it('should filter locations by tier', () => {
    const locations = [
      createMockLocation({ id: 'loc-1', tier: 1 }),
      createMockLocation({ id: 'loc-2', tier: 2 }),
      createMockLocation({ id: 'loc-3', tier: 1 }),
    ];

    const result = getLocationsByTierFromRegistry(locations, 1);

    expect(result).toHaveLength(2);
    expect(result.every(l => l.tier === 1)).toBe(true);
  });
});

describe('getLocationsByTypeFromRegistry', () => {
  it('should filter locations by type', () => {
    const locations = [
      createMockLocation({ id: 'loc-1', type: 'forest' }),
      createMockLocation({ id: 'loc-2', type: 'mine' }),
      createMockLocation({ id: 'loc-3', type: 'forest' }),
    ];

    const result = getLocationsByTypeFromRegistry(locations, 'forest');

    expect(result).toHaveLength(2);
  });
});

describe('getLocationsByTagFromRegistry', () => {
  it('should filter locations by tag', () => {
    const locations = [
      createMockLocation({ id: 'loc-1', tags: ['forest', 'dangerous'] }),
      createMockLocation({ id: 'loc-2', tags: ['mine'] }),
      createMockLocation({ id: 'loc-3', tags: ['forest'] }),
    ];

    const result = getLocationsByTagFromRegistry(locations, 'forest');

    expect(result).toHaveLength(2);
  });
});

describe('getAvailableLocationsForGuildLevel', () => {
  it('should return locations where guild level is sufficient', () => {
    const locations = [
      createMockLocation({ id: 'loc-1', unlockRequirements: { guildLevel: 1 } }),
      createMockLocation({ id: 'loc-2', unlockRequirements: { guildLevel: 3 } }),
      createMockLocation({ id: 'loc-3', unlockRequirements: { guildLevel: 5 } }),
    ];

    const result = getAvailableLocationsForGuildLevel(locations, 3);

    expect(result).toHaveLength(2);
    expect(result.map(l => l.id)).toContain('loc-1');
    expect(result.map(l => l.id)).toContain('loc-2');
  });

  it('should check completed locations requirement', () => {
    const locations = [
      createMockLocation({
        id: 'loc-2',
        unlockRequirements: { guildLevel: 1, completedLocations: ['loc-1'] },
      }),
    ];

    const resultWithoutCompleted = getAvailableLocationsForGuildLevel(locations, 1, []);
    const resultWithCompleted = getAvailableLocationsForGuildLevel(locations, 1, ['loc-1']);

    expect(resultWithoutCompleted).toHaveLength(0);
    expect(resultWithCompleted).toHaveLength(1);
  });
});

describe('getLocationsWithMaterialFromRegistry', () => {
  it('should return locations containing material', () => {
    const locations = [
      createMockLocation({
        id: 'loc-1',
        resources: [{ materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 }],
      }),
      createMockLocation({
        id: 'loc-2',
        resources: [{ materialId: 'wood', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 }],
      }),
    ];

    const result = getLocationsWithMaterialFromRegistry(locations, 'iron');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('loc-1');
  });
});

describe('validateLocation', () => {
  it('should return no errors for valid location', () => {
    const location = createMockLocation();
    const errors = validateLocation(location, mockMaterials);

    // Only warning about hostile NPC count is expected
    const criticalErrors = errors.filter(e => e.field !== 'npcs.hostile');
    expect(criticalErrors).toHaveLength(0);
  });

  it('should return error for empty id', () => {
    const location = createMockLocation({ id: '' });
    const errors = validateLocation(location, mockMaterials);

    expect(errors.some(e => e.field === 'id')).toBe(true);
  });

  it('should return error for invalid tier', () => {
    const location = createMockLocation({ tier: 5 as any });
    const errors = validateLocation(location, mockMaterials);

    expect(errors.some(e => e.field === 'tier')).toBe(true);
  });

  it('should return error for empty resources', () => {
    const location = createMockLocation({ resources: [] });
    const errors = validateLocation(location, mockMaterials);

    expect(errors.some(e => e.field === 'resources')).toBe(true);
  });

  it('should return error for invalid weather chance sum', () => {
    const location = createMockLocation({
      weather: [
        { id: 'clear', name: 'Clear', chance: 50, effects: [] },
        { id: 'rain', name: 'Rain', chance: 30, effects: [] },
      ],
    });
    const errors = validateLocation(location, mockMaterials);

    expect(errors.some(e => e.field === 'weather')).toBe(true);
  });
});

describe('createLocation', () => {
  it('should create location with defaults', () => {
    const location = createLocation({
      id: 'new-loc',
      name: 'New Location',
      description: 'Description',
      tier: 2,
      type: 'mountain',
    });

    expect(location.id).toBe('new-loc');
    expect(location.tier).toBe(2);
    expect(location.type).toBe('mountain');
    expect(location.tags).toEqual([]);
    expect(location.unlockRequirements.guildLevel).toBe(3); // Tier 2 = guild level 3
  });
});

describe('createForestLocation', () => {
  it('should create location with forest type and tags', () => {
    const location = createForestLocation({
      id: 'forest-1',
      name: 'Dark Forest',
      description: 'A dark forest',
      tier: 2,
    });

    expect(location.type).toBe('forest');
    expect(location.tags).toContain('forest');
    expect(location.weather.length).toBeGreaterThan(1);
  });
});

describe('createMineLocation', () => {
  it('should create location with mine type', () => {
    const location = createMineLocation({
      id: 'mine-1',
      name: 'Deep Mine',
      description: 'A deep mine',
      tier: 3,
    });

    expect(location.type).toBe('mine');
    expect(location.tags).toContain('underground');
  });
});

describe('createSwampLocation', () => {
  it('should create location with swamp type', () => {
    const location = createSwampLocation({
      id: 'swamp-1',
      name: 'Murky Swamp',
      description: 'A murky swamp',
      tier: 2,
    });

    expect(location.type).toBe('swamp');
    expect(location.tags).toContain('wetlands');
  });
});

describe('getLocationStats', () => {
  it('should return correct statistics', () => {
    const location = createMockLocation({
      resources: [
        { materialId: 'r1', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 2 },
        { materialId: 'r2', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
      ],
      weather: [
        { id: 'clear', name: 'Clear', chance: 50, effects: [] },
        { id: 'rain', name: 'Rain', chance: 50, effects: [] },
      ],
      npcs: {
        hostile: [{ id: 'wolf', name: 'Wolf', levelRange: [1, 3], disposition: 'hostile', description: '' }],
        neutral: [{ id: 'deer', name: 'Deer', levelRange: [1, 2], disposition: 'neutral', description: '' }],
        friendly: [],
      },
    });

    const stats = getLocationStats(location);

    expect(stats.resourceCount).toBe(2);
    expect(stats.weatherCount).toBe(2);
    expect(stats.hostileNPCCount).toBe(1);
    expect(stats.neutralNPCCount).toBe(1);
    expect(stats.friendlyNPCCount).toBe(0);
    expect(stats.totalNPCCount).toBe(2);
  });
});

describe('getRegistryStats', () => {
  it('should return correct registry statistics', () => {
    const locations = [
      createMockLocation({ id: 'loc-1', tier: 1, type: 'forest' }),
      createMockLocation({ id: 'loc-2', tier: 2, type: 'mine' }),
      createMockLocation({ id: 'loc-3', tier: 2, type: 'forest' }),
    ];

    const stats = getRegistryStats(locations);

    expect(stats.totalLocations).toBe(3);
    expect(stats.tierDistribution[1]).toBe(1);
    expect(stats.tierDistribution[2]).toBe(2);
    expect(stats.typeDistribution['forest']).toBe(2);
    expect(stats.typeDistribution['mine']).toBe(1);
  });
});
