/**
 * Интеграционные тесты для данных материалов
 */

import { describe, it, expect } from 'vitest';
import {
  MATERIAL_REGISTRY,
  getMaterialById,
  getMaterialsByRarity,
  getMaterialsByCategory,
  getMaterialsForLocation,
  getMaterialName,
} from './index';
import { LOCATION_REGISTRY } from '../locations';
import type { MaterialCatalogRarity, Rarity, MaterialCategory } from '../../types';

describe('MATERIAL_REGISTRY', () => {
  it('should have materials defined', () => {
    expect(MATERIAL_REGISTRY.length).toBeGreaterThan(0);
  });

  it('should have unique IDs', () => {
    const ids = MATERIAL_REGISTRY.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all required fields', () => {
    for (const material of MATERIAL_REGISTRY) {
      expect(material.id).toBeDefined();
      expect(material.name).toBeDefined();
      expect(material.description).toBeDefined();
      expect(material.category).toBeDefined();
      expect(material.rarity).toBeDefined();
    }
  });

  it('should have valid rarity values', () => {
    const validRarities: MaterialCatalogRarity[] = [
      'common',
      'uncommon',
      'rare',
      'epic',
      'legendary',
      'unique',
    ];

    for (const material of MATERIAL_REGISTRY) {
      expect(validRarities).toContain(material.rarity);
    }
  });

  it('should have valid category values', () => {
    const validCategories: MaterialCategory[] = [
      'ore', 'ingot', 'wood', 'stone', 'leather', 'gem', 'herb', 'component', 'special'
    ];

    for (const material of MATERIAL_REGISTRY) {
      expect(validCategories).toContain(material.category);
    }
  });
});

describe('Material distribution', () => {
  it('should have materials for each rarity', () => {
    const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    for (const rarity of rarities) {
      const materials = getMaterialsByRarity(rarity);
      expect(materials.length, `Should have ${rarity} materials`).toBeGreaterThan(0);
    }
  });

  it('should have more common than legendary materials', () => {
    const common = getMaterialsByRarity('common').length;
    const legendary = getMaterialsByRarity('legendary').length;

    expect(common).toBeGreaterThan(legendary);
  });

  it('should include unique-tier catalog materials (quest artifacts)', () => {
    const unique = getMaterialsByRarity('unique');
    expect(unique.length).toBeGreaterThanOrEqual(3);
    expect(unique.some((m) => m.id === 'resonator_matrix')).toBe(true);
  });

  it('should have materials for each category', () => {
    const categories: MaterialCategory[] = ['ore', 'ingot', 'wood', 'stone', 'leather'];

    for (const category of categories) {
      const materials = getMaterialsByCategory(category);
      expect(materials.length, `Should have ${category} materials`).toBeGreaterThan(0);
    }
  });
});

describe('getMaterialById', () => {
  it('should return material for valid ID', () => {
    const material = getMaterialById('iron_ore');

    expect(material).toBeDefined();
    expect(material?.name).toBe('Железная руда');
  });

  it('should return undefined for invalid ID', () => {
    const material = getMaterialById('nonexistent_material');

    expect(material).toBeUndefined();
  });
});

describe('getMaterialsByRarity', () => {
  it('should return only common materials', () => {
    const materials = getMaterialsByRarity('common');

    expect(materials.every(m => m.rarity === 'common')).toBe(true);
  });

  it('should return only rare materials', () => {
    const materials = getMaterialsByRarity('rare');

    expect(materials.every(m => m.rarity === 'rare')).toBe(true);
  });
});

describe('getMaterialsByCategory', () => {
  it('should return only ore materials', () => {
    const materials = getMaterialsByCategory('ore');

    expect(materials.every(m => m.category === 'ore')).toBe(true);
  });

  it('should return only wood materials', () => {
    const materials = getMaterialsByCategory('wood');

    expect(materials.every(m => m.category === 'wood')).toBe(true);
  });
});

describe('getMaterialsForLocation', () => {
  it('should return materials for oak_grove_outskirts', () => {
    const materials = getMaterialsForLocation('oak_grove_outskirts');

    expect(materials.length).toBeGreaterThan(0);
  });

  it('should return empty array for nonexistent location', () => {
    const materials = getMaterialsForLocation('nonexistent_location');

    expect(materials).toHaveLength(0);
  });

  it('should have matching sourceLocations', () => {
    for (const location of LOCATION_REGISTRY) {
      const materials = getMaterialsForLocation(location.id);

      for (const material of materials) {
        expect(material.sourceLocations).toContain(location.id);
      }
    }
  });
});

describe('getMaterialName', () => {
  it('should return material name for valid ID', () => {
    const name = getMaterialName('iron_ore');

    expect(name).toBe('Железная руда');
  });

  it('should return ID for invalid material', () => {
    const name = getMaterialName('nonexistent');

    expect(name).toBe('nonexistent');
  });
});

describe('Material-Location consistency', () => {
  it('should have materials for all locations', () => {
    for (const location of LOCATION_REGISTRY) {
      const materials = getMaterialsForLocation(location.id);
      expect(materials.length, `Location ${location.id} should have materials`).toBeGreaterThan(0);
    }
  });

  it('should have sourceLocations for location-specific materials', () => {
    const locationSpecificMaterials = MATERIAL_REGISTRY.filter(
      m => m.sourceLocations && m.sourceLocations.length > 0
    );

    expect(locationSpecificMaterials.length).toBeGreaterThan(0);

    for (const material of locationSpecificMaterials) {
      for (const locId of material.sourceLocations!) {
        const locationExists = LOCATION_REGISTRY.some(l => l.id === locId);
        expect(locationExists, `Material ${material.id} references nonexistent location ${locId}`).toBe(true);
      }
    }
  });

  it('should have all location resources in material registry', () => {
    for (const location of LOCATION_REGISTRY) {
      for (const resource of location.resources) {
        const material = getMaterialById(resource.materialId);
        expect(material, `Resource ${resource.materialId} in ${location.id} not found in material registry`).toBeDefined();
      }
    }
  });
});

describe('Material data quality', () => {
  it('should have Russian names', () => {
    for (const material of MATERIAL_REGISTRY) {
      const hasCyrillic = /[\u0400-\u04FF]/.test(material.name);
      expect(hasCyrillic, `Material ${material.id} should have Russian name`).toBe(true);
    }
  });

  it('should have Russian descriptions', () => {
    for (const material of MATERIAL_REGISTRY) {
      const hasCyrillic = /[\u0400-\u04FF]/.test(material.description);
      expect(hasCyrillic, `Material ${material.id} should have Russian description`).toBe(true);
    }
  });

  it('should have non-empty descriptions', () => {
    for (const material of MATERIAL_REGISTRY) {
      expect(material.description.length).toBeGreaterThan(0);
    }
  });
});

describe('Tier-specific materials', () => {
  it('should have common materials for tier 1 locations', () => {
    const tier1Locations = LOCATION_REGISTRY.filter(l => l.tier === 1);

    for (const location of tier1Locations) {
      const hasCommonResource = location.resources.some(r => r.rarity === 'common');
      expect(hasCommonResource, `Tier 1 location ${location.id} should have common resources`).toBe(true);
    }
  });

  it('should have rare+ materials for tier 3+ locations', () => {
    const highTierLocations = LOCATION_REGISTRY.filter(l => l.tier >= 3);

    for (const location of highTierLocations) {
      const hasRareResource = location.resources.some(r => r.rarity === 'rare' || r.rarity === 'epic');
      expect(hasRareResource, `Tier ${location.tier} location ${location.id} should have rare+ resources`).toBe(true);
    }
  });

  it('should have legendary materials for tier 4 locations', () => {
    const tier4Locations = LOCATION_REGISTRY.filter(l => l.tier === 4);

    for (const location of tier4Locations) {
      const hasEpicOrLegendary = location.resources.some(r => r.rarity === 'epic' || r.rarity === 'legendary');
      expect(hasEpicOrLegendary, `Tier 4 location ${location.id} should have epic or legendary resources`).toBe(true);
    }
  });
});
