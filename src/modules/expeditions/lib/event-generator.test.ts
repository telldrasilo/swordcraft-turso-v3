/**
 * Тесты для генератора событий
 */

import { describe, it, expect, vi } from 'vitest';
import {
  generateEventsForMission,
  resolveEventEffects,
  selectMaterialFromLocation,
} from './event-generator';
import type { MissionTemplate } from '../data/missions/_mission-template';
import type { EventEffect } from '../data/events/_event-template';
import type { Location } from '../types';

// Мокаем импорт из events/index.ts
vi.mock('../data/events', () => ({
  getEventsForLocation: () => [
    {
      id: 'event_1',
      name: 'Test Event 1',
      type: 'positive',
      category: 'discovery',
      title: 'Test',
      description: 'Test description',
      conditions: {},
      effects: [{ type: 'grant_resource', resourceId: 'gold', quantity: { base: 10, variance: 0, perDifficulty: 0, perRarity: 0 }, description: '+10 gold' }],
      weight: 50,
      icon: '📦',
    },
    {
      id: 'event_2',
      name: 'Test Event 2',
      type: 'negative',
      category: 'danger',
      title: 'Danger',
      description: 'Test danger',
      conditions: {},
      effects: [{ type: 'damage_weapon', modifier: 10, description: '-10% weapon' }],
      weight: 30,
      icon: '⚠️',
    },
    {
      id: 'event_3',
      name: 'Test Event 3',
      type: 'neutral',
      category: 'travel',
      title: 'Travel',
      description: 'Test travel',
      conditions: {},
      effects: [{ type: 'narrative_only', description: 'Nothing happens' }],
      weight: 20,
      icon: '💬',
    },
  ],
  filterEventsByConditions: (events: any[]) => events,
}));

// Моковая миссия
const createMockMission = (overrides: Partial<MissionTemplate> = {}): MissionTemplate => ({
  id: 'test_mission',
  locationId: 'test_location',
  type: 'hunt',
  rarity: 'common',
  difficulty: 'normal',
  name: 'Test Mission',
  description: 'Test',
  objective: 'Test',
  client: { name: 'Test', type: 'commoner' },
  duration: { base: 3600, variance: 0, perDifficulty: 0, perRarity: 0 },
  cost: {
    supplies: { base: 10, variance: 0, perDifficulty: 0, perRarity: 0 },
    deposit: { base: 20, variance: 0, perDifficulty: 0, perRarity: 0 },
  },
  reward: {
    gold: { base: 50, variance: 0, perDifficulty: 0, perRarity: 0 },
    glory: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
    experience: { base: 20, variance: 0, perDifficulty: 0, perRarity: 0 },
    warSoul: { base: 5, variance: 0, perDifficulty: 0, perRarity: 0 },
  },
  isRepeatable: true,
  cooldownHours: 6,
  ...overrides,
});

// Моковая локация
const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  id: 'test_location',
  name: 'Test Location',
  description: 'Test',
  tier: 1,
  type: 'forest',
  tags: [],
  unlockRequirements: { guildLevel: 1 },
  resources: [
    { materialId: 'iron', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
    { materialId: 'silver', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
  ],
  rarityDistribution: { common: 62, uncommon: 38, rare: 0, epic: 0, legendary: 0 },
  weather: [],
  npcs: { hostile: [], neutral: [], friendly: [] },
  plotHook: '',
  ...overrides,
});

describe('generateEventsForMission', () => {
  it('should generate events for mission', async () => {
    const mission = createMockMission();
    const location = createMockLocation();

    const events = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    expect(events.length).toBeGreaterThan(0);
  });

  it('should generate correct number of events based on duration', async () => {
    const shortMission = createMockMission({ duration: { base: 600, variance: 0, perDifficulty: 0, perRarity: 0 } });
    const longMission = createMockMission({ duration: { base: 7200, variance: 0, perDifficulty: 0, perRarity: 0 } });
    const location = createMockLocation();

    const shortEvents = generateEventsForMission({
      mission: shortMission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    const longEvents = generateEventsForMission({
      mission: longMission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    expect(longEvents.length).toBeGreaterThanOrEqual(shortEvents.length);
  });

  it('should generate more or equal events for exploration contract', async () => {
    const mission = createMockMission();
    const location = createMockLocation();

    const explorationEvents = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    const speedEvents = generateEventsForMission({
      mission,
      location,
      contractType: 'speed',
      seed: 12345,
    });

    expect(explorationEvents.length).toBeGreaterThanOrEqual(speedEvents.length);
  });

  it('should set correct status for generated events', async () => {
    const mission = createMockMission();
    const location = createMockLocation();

    const events = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    for (const event of events) {
      expect(event.status).toBe('hidden');
    }
  });

  it('should have unique instance IDs', async () => {
    const mission = createMockMission();
    const location = createMockLocation();

    const events = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    const ids = events.map(e => e.instanceId);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid trigger times within mission duration', async () => {
    const mission = createMockMission();
    const location = createMockLocation();

    const events = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    for (const event of events) {
      expect(event.triggeredAt).toBeGreaterThanOrEqual(0);
      expect(event.triggeredAt).toBeLessThan(mission.duration.base);
    }
  });

  it('should be deterministic with same seed', async () => {
    const mission = createMockMission();
    const location = createMockLocation();

    const events1 = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    const events2 = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    expect(events1.length).toBe(events2.length);
    expect(events1.map(e => e.templateId)).toEqual(events2.map(e => e.templateId));
    expect(events1.map(e => e.triggeredAt)).toEqual(events2.map(e => e.triggeredAt));
  });

  it('should generate sequential order', async () => {
    const mission = createMockMission();
    const location = createMockLocation();

    const events = generateEventsForMission({
      mission,
      location,
      contractType: 'exploration',
      seed: 12345,
    });

    for (let i = 0; i < events.length; i++) {
      expect(events[i].order).toBe(i + 1);
    }
  });
});

describe('resolveEventEffects', () => {
  const location = createMockLocation({
    resources: [
      { materialId: 'iron_ore', baseWeight: 50, rarity: 'common', minQuantity: 1, maxQuantity: 3 },
      { materialId: 'silver_ore', baseWeight: 30, rarity: 'uncommon', minQuantity: 1, maxQuantity: 2 },
      { materialId: 'gold_ore', baseWeight: 10, rarity: 'rare', minQuantity: 1, maxQuantity: 1 },
    ],
  });

  it('should resolve grant_location_material effect', () => {
    const effects = [
      {
        type: 'grant_location_material' as const,
        materialRarity: 'common' as const,
        materialQuantity: { base: 2, variance: 0, perDifficulty: 0, perRarity: 0 },
        description: 'Found materials',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    const mats = resolved.filter((r) => r.type === 'grant_material')
    expect(mats.length).toBeGreaterThanOrEqual(3)
    expect(mats.every((r) => r.type === 'grant_material')).toBe(true)
    expect(mats[0].materialId).toBeDefined()
    expect(mats[0].quantity).toBeGreaterThan(0)
  });

  it('should resolve grant_resource effect', () => {
    const effects: EventEffect[] = [
      {
        type: 'grant_resource',
        resourceId: 'gold',
        quantity: { base: 50, variance: 0, perDifficulty: 0, perRarity: 0 },
        description: '+50 gold',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(1);
    expect(resolved[0].type).toBe('grant_resource');
    expect(resolved[0].resourceId).toBe('gold');
    expect(resolved[0].quantity).toBe(50);
  });

  it('should resolve damage_weapon effect', () => {
    const effects = [
      {
        type: 'damage_weapon' as const,
        modifier: 15,
        description: '-15% weapon durability',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(1);
    expect(resolved[0].type).toBe('damage_weapon');
    expect(resolved[0].quantity).toBe(15);
  });

  it('should resolve damage_adventurer effect', () => {
    const effects = [
      {
        type: 'damage_adventurer' as const,
        modifier: 20,
        description: '-20% HP',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(1);
    expect(resolved[0].type).toBe('damage_adventurer');
    expect(resolved[0].quantity).toBe(20);
  });

  it('should resolve modify_success_chance effect', () => {
    const effects = [
      {
        type: 'modify_success_chance' as const,
        modifier: 10,
        description: '+10% success',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(1);
    expect(resolved[0].type).toBe('modify_success_chance');
    expect(resolved[0].quantity).toBe(10);
  });

  it('should resolve modify_gold_reward effect', () => {
    const effects = [
      {
        type: 'modify_gold_reward' as const,
        modifier: 25,
        description: '+25% gold',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(1);
    expect(resolved[0].type).toBe('modify_gold_reward');
  });

  it('should resolve modify_duration effect', () => {
    const effects = [
      {
        type: 'modify_duration' as const,
        modifier: 120,
        description: '+2 minutes',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(1);
    expect(resolved[0].type).toBe('modify_duration');
    expect(resolved[0].quantity).toBe(120);
  });

  it('should resolve narrative_only effect', () => {
    const effects = [
      {
        type: 'narrative_only' as const,
        description: 'A mysterious wind blows...',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(1);
    expect(resolved[0].type).toBe('narrative_only');
    expect(resolved[0].quantity).toBe(0);
  });

  it('should resolve multiple effects', () => {
    const effects: EventEffect[] = [
      {
        type: 'grant_resource',
        resourceId: 'gold',
        quantity: { base: 30, variance: 0, perDifficulty: 0, perRarity: 0 },
        description: '+30 gold',
      },
      {
        type: 'damage_weapon',
        modifier: 5,
        description: '-5% weapon',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(2);
  });

  it('should return empty array for location without matching rarity', () => {
    const effects = [
      {
        type: 'grant_location_material' as const,
        materialRarity: 'legendary' as const,
        materialQuantity: { base: 1, variance: 0, perDifficulty: 0, perRarity: 0 },
        description: 'Found legendary material',
      },
    ];

    const resolved = resolveEventEffects(effects, location, 12345);

    expect(resolved.length).toBe(0);
  });
});

describe('selectMaterialFromLocation (re-export)', () => {
  it('should be exported from event-generator', () => {
    expect(selectMaterialFromLocation).toBeDefined();
    expect(typeof selectMaterialFromLocation).toBe('function');
  });
});
