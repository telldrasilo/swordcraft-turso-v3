/**
 * Тесты для утилит материалов
 */

import { describe, it, expect } from 'vitest';
import {
  addMaterialToRegistry,
  addMaterialsToRegistry,
  addResourceToLocation,
  addResourcesToLocation,
  updateResourceInLocation,
  removeResourceFromLocation,
  recalculateRarityDistribution,
  validateLocationMaterials,
  validateAllLocations,
  getLocationsWithMaterial,
  cloneMaterialToLocation,
} from './material-utils';
import type { Material, Location, LocationResource } from '../types';

// Моковые материалы
const createMockMaterial = (overrides: Partial<Material> = {}): Material => ({
  id: 'test_material',
  name: 'Test Material',
  description: 'A test material',
  category: 'component',
  rarity: 'common',
  ...overrides,
});

// Моковая локация
const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  id: 'test-location',
  name: 'Test Location',
  description: 'A test location',
  tier: 1,
  type: 'forest',
  tags: [],
  unlockRequirements: { guildLevel: 1 },
  resources: [],
  rarityDistribution: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  weather: [],
  npcs: { hostile: [], neutral: [], friendly: [] },
  plotHook: '',
  ...overrides,
});

describe('addMaterialToRegistry', () => {
  it('should add material to empty registry', () => {
    const material = createMockMaterial();
    const result = addMaterialToRegistry([], material);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test_material');
  });

  it('should add material to existing registry', () => {
    const material1 = createMockMaterial({ id: 'mat-1' });
    const material2 = createMockMaterial({ id: 'mat-2' });

    const result = addMaterialToRegistry([material1], material2);

    expect(result).toHaveLength(2);
  });

  it('should not add duplicate material', () => {
    const material = createMockMaterial();
    const result = addMaterialToRegistry([material], material);

    expect(result).toHaveLength(1);
  });
});

describe('addMaterialsToRegistry', () => {
  it('should add multiple materials', () => {
    const materials = [
      createMockMaterial({ id: 'mat-1' }),
      createMockMaterial({ id: 'mat-2' }),
      createMockMaterial({ id: 'mat-3' }),
    ];

    const result = addMaterialsToRegistry([], materials);

    expect(result).toHaveLength(3);
  });
});

describe('addResourceToLocation', () => {
  it('should add resource to location', () => {
    const location = createMockLocation();
    const resource: LocationResource = {
      materialId: 'iron',
      baseWeight: 50,
      rarity: 'common',
      minQuantity: 1,
      maxQuantity: 3,
    };

    const result = addResourceToLocation(location, resource);

    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].materialId).toBe('iron');
  });

  it('should update rarity distribution', () => {
    const location = createMockLocation();
    const resource: LocationResource = {
      materialId: 'iron',
      baseWeight: 50,
      rarity: 'common',
      minQuantity: 1,
      maxQuantity: 3,
    };

    const result = addResourceToLocation(location, resource);

    expect(result.rarityDistribution.common).toBe(100);
  });

  it('should not add duplicate resource', () => {
    const resource: LocationResource = {
      materialId: 'iron',
      baseWeight: 50,
      rarity: 'common',
      minQuantity: 1,
      maxQuantity: 3,
    };
    const location = createMockLocation({ resources: [resource] });

    const result = addResourceToLocation(location, resource);

    expect(result.resources).toHaveLength(1);
  });
});

describe('addResourcesToLocation', () => {
  it('should add multiple resources', () => {
    const location = createMockLocation();
    const resources: LocationResource[] = [
      { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      { materialId: 'silver', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
    ];

    const result = addResourcesToLocation(location, resources);

    expect(result.resources).toHaveLength(2);
  });
});

describe('updateResourceInLocation', () => {
  it('should update resource weight', () => {
    const location = createMockLocation({
      resources: [
        { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      ],
    });

    const result = updateResourceInLocation(location, 'iron', { baseWeight: 100 });

    expect(result.resources[0].baseWeight).toBe(100);
  });

  it('should recalculate distribution after update', () => {
    const location = createMockLocation({
      resources: [
        { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
        { materialId: 'silver', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
      ],
    });

    const result = updateResourceInLocation(location, 'iron', { baseWeight: 150 });

    // 150 common + 50 uncommon = 200 total
    // common = 75%, uncommon = 25%
    expect(result.rarityDistribution.common).toBe(75);
    expect(result.rarityDistribution.uncommon).toBe(25);
  });
});

describe('removeResourceFromLocation', () => {
  it('should remove resource from location', () => {
    const location = createMockLocation({
      resources: [
        { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
        { materialId: 'silver', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
      ],
    });

    const result = removeResourceFromLocation(location, 'iron');

    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].materialId).toBe('silver');
  });

  it('should recalculate distribution after removal', () => {
    const location = createMockLocation({
      resources: [
        { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
        { materialId: 'silver', baseWeight: 50, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
      ],
    });

    const result = removeResourceFromLocation(location, 'iron');

    expect(result.rarityDistribution.uncommon).toBe(100);
  });
});

describe('recalculateRarityDistribution', () => {
  it('should return zeros for empty resources', () => {
    const result = recalculateRarityDistribution([]);

    expect(result.common).toBe(0);
    expect(result.uncommon).toBe(0);
    expect(result.rare).toBe(0);
    expect(result.epic).toBe(0);
    expect(result.legendary).toBe(0);
  });

  it('should calculate correct percentages', () => {
    const resources: LocationResource[] = [
      { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      { materialId: 'silver', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
      { materialId: 'gold', baseWeight: 20, rarity: 'rare', minQuantity: 1, maxQuantity: 1 },
    ];

    const result = recalculateRarityDistribution(resources);

    // Total: 100, common: 50%, uncommon: 30%, rare: 20%
    expect(result.common).toBe(50);
    expect(result.uncommon).toBe(30);
    expect(result.rare).toBe(20);
  });

  it('should handle single resource', () => {
    const resources: LocationResource[] = [
      { materialId: 'iron', baseWeight: 100, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    ];

    const result = recalculateRarityDistribution(resources);

    expect(result.common).toBe(100);
  });
});

describe('validateLocationMaterials', () => {
  it('should return valid for matching materials', () => {
    const materials: Material[] = [
      { id: 'iron', name: 'Iron', description: '', category: 'ore', rarity: 'common' },
    ];
    const location = createMockLocation({
      resources: [
        { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      ],
    });

    const result = validateLocationMaterials(location, materials);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return error for missing material', () => {
    const location = createMockLocation({
      resources: [
        { materialId: 'nonexistent', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      ],
    });

    const result = validateLocationMaterials(location, []);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should return error for rarity mismatch', () => {
    const materials: Material[] = [
      { id: 'iron', name: 'Iron', description: '', category: 'ore', rarity: 'rare' },
    ];
    const location = createMockLocation({
      resources: [
        { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      ],
    });

    const result = validateLocationMaterials(location, materials);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('rarity');
  });
});

describe('validateAllLocations', () => {
  it('should validate multiple locations', () => {
    const materials: Material[] = [
      { id: 'iron', name: 'Iron', description: '', category: 'ore', rarity: 'common' },
    ];
    const locations = [
      createMockLocation({
        id: 'loc-1',
        resources: [
          { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
        ],
      }),
      createMockLocation({
        id: 'loc-2',
        resources: [
          { materialId: 'nonexistent', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
        ],
      }),
    ];

    const result = validateAllLocations(locations, materials);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
  });
});

describe('getLocationsWithMaterial', () => {
  it('should return locations containing material', () => {
    const locations = [
      createMockLocation({
        id: 'loc-1',
        resources: [
          { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
        ],
      }),
      createMockLocation({
        id: 'loc-2',
        resources: [
          { materialId: 'wood', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
        ],
      }),
    ];

    const result = getLocationsWithMaterial('iron', locations);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('loc-1');
  });
});

describe('cloneMaterialToLocation', () => {
  it('should clone material to location', () => {
    const materials: Material[] = [
      { id: 'mithril', name: 'Mithril', description: '', category: 'ore', rarity: 'rare' },
    ];
    const location = createMockLocation();

    const result = cloneMaterialToLocation(location, 'mithril', materials);

    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].materialId).toBe('mithril');
    expect(result.resources[0].rarity).toBe('rare');
  });

  it('should allow overrides', () => {
    const materials: Material[] = [
      { id: 'mithril', name: 'Mithril', description: '', category: 'ore', rarity: 'rare' },
    ];
    const location = createMockLocation();

    const result = cloneMaterialToLocation(location, 'mithril', materials, {
      baseWeight: 100,
      rarity: 'epic',
    });

    expect(result.resources[0].baseWeight).toBe(100);
    expect(result.resources[0].rarity).toBe('epic');
  });

  it('should return unchanged location if material not found', () => {
    const location = createMockLocation();

    const result = cloneMaterialToLocation(location, 'nonexistent', []);

    expect(result.resources).toHaveLength(0);
  });
});
