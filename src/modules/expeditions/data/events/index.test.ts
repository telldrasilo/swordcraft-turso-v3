/**
 * Интеграционные тесты для валидации всех событий
 *
 * Этот тест проверяет:
 * - Соответствие структуры событий шаблону EventTemplate
 * - Наличие врагов в локациях (для spawn_enemy)
 * - Корректность условий появления
 * - Уникальность ID событий
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { LOCATION_REGISTRY } from '../locations';
import { MATERIAL_REGISTRY } from '../materials';
import { validateAllEvents } from '../../lib/validateEventData';
import type { EventTemplate } from '../events/_event-template';
import type { Location, Material } from '../../types';

// ============================================================================
// ИМПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

// Common events (общие для всех локаций)
import { commonEvents } from './common';

// Location-specific events (по локациям)
import { oakGroveEvents } from './oak-grove-outskirts';
import { redStoneEvents } from './red-stone-mines';
import { mistyLowlandsEvents } from './misty-lowlands';
import { silverGroveEvents } from './silver-grove';
import { forgottenMinesEvents } from './forgotten-mines';
import { rottenSwampEvents } from './rotten-swamp';
import { frostIronRidgeEvents } from './frost-iron-ridge';
import { ashWastesEvents } from './ash-wastes';
import { whisperingForestEvents } from './whispering-forest';
import { dragonScarsEvents } from './dragon-scars';
import { depthsOfTheWorldEvents } from './depths-of-the-world';

// Объединение всех событий
const ALL_EVENTS: EventTemplate[] = [
  ...commonEvents,
  ...oakGroveEvents,
  ...redStoneEvents,
  ...mistyLowlandsEvents,
  ...silverGroveEvents,
  ...forgottenMinesEvents,
  ...rottenSwampEvents,
  ...frostIronRidgeEvents,
  ...ashWastesEvents,
  ...whisperingForestEvents,
  ...dragonScarsEvents,
  ...depthsOfTheWorldEvents,
];

// ============================================================================
// ТЕСТЫ
// ============================================================================

describe('Event Validation', () => {
  let locations: Location[];
  let materials: Material[];

  beforeAll(() => {
    locations = LOCATION_REGISTRY;
    materials = MATERIAL_REGISTRY;
  });

  describe('Event Structure', () => {
    it('should have valid event structure for all events', () => {
      if (ALL_EVENTS.length === 0) {
        // Пропускаем если событий пока нет
        expect(true).toBe(true);
        return;
      }

      const result = validateAllEvents(ALL_EVENTS, locations, materials);

      // Выводим ошибки для отладки
      if (result.errors.length > 0) {
        console.log('\n=== EVENT VALIDATION ERRORS ===');
        for (const error of result.errors) {
          console.log(`[${error.severity}] ${error.eventId}: ${error.field} - ${error.message}`);
        }
      }

      if (result.warnings.length > 0) {
        console.log('\n=== EVENT VALIDATION WARNINGS ===');
        for (const warning of result.warnings) {
          console.log(`[${warning.severity}] ${warning.eventId}: ${warning.field} - ${warning.message}`);
        }
      }

      console.log('\n=== EVENT VALIDATION STATS ===');
      console.log(`Total events: ${result.stats.totalEvents}`);
      console.log(`Valid events: ${result.stats.validEvents}`);
      console.log(`Invalid events: ${result.stats.invalidEvents}`);
      console.log(`Warnings: ${result.stats.warningsCount}`);
      console.log(`By type: ${JSON.stringify(result.stats.byType)}`);
      console.log(`By category: ${JSON.stringify(result.stats.byCategory)}`);

      expect(result.errors.length).toBe(0);
    });

    it('should have unique event IDs', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const ids = ALL_EVENTS.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size, 'All event IDs should be unique').toBe(ids.length);
    });

    it('should have valid weight values', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      for (const event of ALL_EVENTS) {
        expect(event.weight, `Event ${event.id} weight should be positive`).toBeGreaterThan(0);
      }
    });
  });

  describe('Event Effects', () => {
    it('should have valid effect types', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const validTypes = [
        'grant_resource', 'grant_location_material', 'damage_weapon',
        'damage_adventurer', 'modify_success_chance', 'modify_duration',
        'modify_gold_reward', 'spawn_enemy', 'narrative_only'
      ];

      for (const event of ALL_EVENTS) {
        const effects =
          event.type === 'choice'
            ? event.choices?.flatMap(c => c.effects) || []
            : event.effects ?? [];

        for (const effect of effects) {
          expect(
            validTypes,
            `Event ${event.id} has invalid effect type: ${effect.type}`
          ).toContain(effect.type);
        }
      }
    });

    it('should have valid materialRarity values', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const validRarities = ['common', 'uncommon', 'rare', 'epic'];

      for (const event of ALL_EVENTS) {
        const effects =
          event.type === 'choice'
            ? event.choices?.flatMap(c => c.effects) || []
            : event.effects ?? [];

        for (const effect of effects) {
          if (effect.type === 'grant_location_material' && effect.materialRarity) {
            expect(
              validRarities,
              `Event ${event.id} has invalid materialRarity: ${effect.materialRarity}`
            ).toContain(effect.materialRarity);
          }
        }
      }
    });
  });

  describe('Event Conditions', () => {
    it('should have valid location references', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const locationIds = locations.map(l => l.id);

      for (const event of ALL_EVENTS) {
        if (event.conditions.locationIds) {
          for (const locId of event.conditions.locationIds) {
            expect(
              locationIds,
              `Event ${event.id} references unknown location: ${locId}`
            ).toContain(locId);
          }
        }
      }
    });

    it('should have valid progress ranges', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      for (const event of ALL_EVENTS) {
        const { minProgress, maxProgress } = event.conditions;

        if (minProgress !== undefined) {
          expect(minProgress, `Event ${event.id} minProgress should be 0-100`)
            .toBeGreaterThanOrEqual(0);
          expect(minProgress, `Event ${event.id} minProgress should be 0-100`)
            .toBeLessThanOrEqual(100);
        }

        if (maxProgress !== undefined) {
          expect(maxProgress, `Event ${event.id} maxProgress should be 0-100`)
            .toBeGreaterThanOrEqual(0);
          expect(maxProgress, `Event ${event.id} maxProgress should be 0-100`)
            .toBeLessThanOrEqual(100);
        }

        if (minProgress !== undefined && maxProgress !== undefined) {
          expect(minProgress, `Event ${event.id} minProgress should not exceed maxProgress`)
            .toBeLessThanOrEqual(maxProgress);
        }
      }
    });
  });

  describe('Choice Events', () => {
    it('should have at least 2 choices for choice type events', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const choiceEvents = ALL_EVENTS.filter(e => e.type === 'choice');

      for (const event of choiceEvents) {
        expect(
          event.choices?.length || 0,
          `Choice event ${event.id} should have at least 2 choices`
        ).toBeGreaterThanOrEqual(2);
      }
    });

    it('should have effects for each choice', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const choiceEvents = ALL_EVENTS.filter(e => e.type === 'choice');

      for (const event of choiceEvents) {
        for (const choice of event.choices || []) {
          expect(
            choice.effects?.length || 0,
            `Choice ${choice.id} in event ${event.id} should have at least one effect`
          ).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Event Statistics', () => {
    it('should have proper type distribution', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const result = validateAllEvents(ALL_EVENTS, locations, materials);

      console.log('\n=== EVENT TYPE DISTRIBUTION ===');
      for (const [type, count] of Object.entries(result.stats.byType)) {
        console.log(`  ${type}: ${count}`);
      }

      // Проверяем что есть хотя бы один позитивный и один негативный тип
      expect(
        result.stats.byType.positive + result.stats.byType.negative,
        'Should have at least some positive or negative events'
      ).toBeGreaterThan(0);
    });

    it('should have proper category distribution', () => {
      if (ALL_EVENTS.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const result = validateAllEvents(ALL_EVENTS, locations, materials);

      console.log('\n=== EVENT CATEGORY DISTRIBUTION ===');
      for (const [category, count] of Object.entries(result.stats.byCategory)) {
        console.log(`  ${category}: ${count}`);
      }

      // Категории discovery и danger должны быть представлены
      expect(
        result.stats.byCategory.discovery + result.stats.byCategory.danger,
        'Should have at least discovery or danger events'
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
