/**
 * Интеграционные тесты для валидации всех миссий всех локаций
 *
 * Этот тест проверяет:
 * - Соответствие структуры миссий шаблону MissionTemplate
 * - Наличие врагов в локациях
 * - Наличие материалов в MATERIAL_REGISTRY и локациях
 * - Уникальность ID миссий
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { LOCATION_REGISTRY } from '../locations';
import { MATERIAL_REGISTRY } from '../materials';
import {
  validateMission,
  validateLocationMissions,
  validateAllMissions,
  type MissionValidationError,
} from '../../lib/validateMissionData';
import type { MissionTemplate } from '../missions/_mission-template';
import type { Location, Material } from '../../types';

// ============================================================================
// ИМПОРТ ВСЕХ МИССИЙ
// ============================================================================

// Tier 1
import { OAK_GROVE_MISSIONS } from './oak-grove-outskirts';
import { redStoneMinesMissions } from './red-stone-mines';
import { mistyLowlandsMissions } from './misty-lowlands';

// Tier 2
import { silverGroveMissions } from './silver-grove';
import { forgottenMinesMissions } from './forgotten-mines';
import { rottenSwampMissions } from './rotten-swamp';

// Tier 3
import { frostIronRidgeMissions } from './frost-iron-ridge';
import { ashWastesMissions } from './ash-wastes';
import { whisperingForestMissions } from './whispering-forest';

// Tier 4
import { dragonScarsMissions } from './dragon-scars';
import { depthsMissions } from './depths-of-the-world';

// ============================================================================
// РЕЕСТР МИССИЙ
// ============================================================================

const MISSIONS_BY_LOCATION = new Map<string, MissionTemplate[]>([
  ['oak_grove_outskirts', OAK_GROVE_MISSIONS],
  ['red_stone_mines', redStoneMinesMissions],
  ['misty_lowlands', mistyLowlandsMissions],
  ['silver_grove', silverGroveMissions],
  ['forgotten_mines', forgottenMinesMissions],
  ['rotten_swamp', rottenSwampMissions],
  ['frost_iron_ridge', frostIronRidgeMissions],
  ['ash_wastes', ashWastesMissions],
  ['whispering_forest', whisperingForestMissions],
  ['dragon_scars', dragonScarsMissions],
  ['depths_of_the_world', depthsMissions],
]);

// ============================================================================
// ТЕСТЫ
// ============================================================================

describe('Mission Validation', () => {
  let locations: Location[];
  let materials: Material[];

  beforeAll(() => {
    locations = LOCATION_REGISTRY;
    materials = MATERIAL_REGISTRY;
  });

  describe('All Missions', () => {
    it('should validate all missions without critical errors', () => {
      const result = validateAllMissions(MISSIONS_BY_LOCATION, locations, materials);

      // Выводим ошибки для отладки
      if (result.errors.length > 0) {
        console.log('\n=== VALIDATION ERRORS ===');
        for (const error of result.errors) {
          console.log(`[${error.severity}] ${error.missionId}: ${error.field} - ${error.message}`);
        }
      }

      if (result.warnings.length > 0) {
        console.log('\n=== VALIDATION WARNINGS ===');
        for (const warning of result.warnings) {
          console.log(`[${warning.severity}] ${warning.missionId}: ${warning.field} - ${warning.message}`);
        }
      }

      console.log('\n=== VALIDATION STATS ===');
      console.log(`Total missions: ${result.stats.totalMissions}`);
      console.log(`Valid missions: ${result.stats.validMissions}`);
      console.log(`Invalid missions: ${result.stats.invalidMissions}`);
      console.log(`Warnings: ${result.stats.warningsCount}`);

      expect(result.errors.length).toBe(0);
    });

    it('should have missions for each location', () => {
      for (const location of locations) {
        const missions = MISSIONS_BY_LOCATION.get(location.id);
        expect(missions, `Location ${location.id} should have missions`).toBeDefined();
        expect(missions!.length, `Location ${location.id} should have at least 1 mission`).toBeGreaterThan(0);
      }
    });

    it('should have unique mission IDs globally', () => {
      const allIds: string[] = [];
      for (const missions of MISSIONS_BY_LOCATION.values()) {
        allIds.push(...missions.map(m => m.id));
      }

      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size, 'All mission IDs should be unique').toBe(allIds.length);
    });
  });

  // ============================================================================
  // ПОЛокационные тесты
  // ============================================================================

  describe('Per-Location Validation', () => {
    for (const [locationId, missions] of MISSIONS_BY_LOCATION) {
      describe(`Location: ${locationId}`, () => {
        const location = LOCATION_REGISTRY.find(l => l.id === locationId);

        it(`should have valid missions for ${locationId}`, () => {
          if (!location) {
            expect.fail(`Location ${locationId} not found in LOCATION_REGISTRY`);
          }

          const result = validateLocationMissions(missions, location!, materials);

          if (result.errors.length > 0) {
            console.log(`\n=== ERRORS in ${locationId} ===`);
            for (const error of result.errors) {
              console.log(`  [${error.severity}] ${error.field}: ${error.message}`);
            }
          }

          expect(result.valid, `Location ${locationId} has ${result.errors.length} validation errors`).toBe(true);
        });

        it(`should have correct enemy references in ${locationId}`, () => {
          if (!location) return;

          const enemyIds = location.npcs.hostile.map(n => n.id);
          const missionEnemyErrors: MissionValidationError[] = [];

          for (const mission of missions) {
            if (mission.enemies) {
              for (const enemyType of mission.enemies.types) {
                if (!enemyIds.includes(enemyType)) {
                  missionEnemyErrors.push({
                    missionId: mission.id,
                    locationId: location.id,
                    field: 'enemies.types',
                    message: `Enemy "${enemyType}" not found in location`,
                    severity: 'critical',
                  });
                }
              }
            }
          }

          if (missionEnemyErrors.length > 0) {
            console.log(`\n=== ENEMY ERRORS in ${locationId} ===`);
            console.log(`Available enemies: ${enemyIds.join(', ')}`);
            for (const error of missionEnemyErrors) {
              console.log(`  ${error.missionId}: ${error.message}`);
            }
          }

          expect(missionEnemyErrors.length).toBe(0);
        });

        it(`should have correct resource references in gather missions for ${locationId}`, () => {
          if (!location) return;

          const gatherMissions = missions.filter(m => m.type === 'gather');
          const resourceIds = location.resources.map(r => r.materialId);
          const resourceErrors: MissionValidationError[] = [];

          for (const mission of gatherMissions) {
            if (!mission.resources || mission.resources.length === 0) {
              resourceErrors.push({
                missionId: mission.id,
                locationId: location.id,
                field: 'resources',
                message: 'Gather mission must have resources field',
                severity: 'critical',
              });
              continue;
            }

            for (const resource of mission.resources) {
              if (!resourceIds.includes(resource.materialId)) {
                resourceErrors.push({
                  missionId: mission.id,
                  locationId: location.id,
                  field: 'resources.materialId',
                  message: `Material "${resource.materialId}" not found in location resources`,
                  severity: 'warning',
                });
              }
            }
          }

          if (resourceErrors.length > 0) {
            console.log(`\n=== RESOURCE ERRORS in ${locationId} ===`);
            console.log(`Available resources: ${resourceIds.join(', ')}`);
            for (const error of resourceErrors) {
              console.log(`  ${error.missionId}: ${error.message}`);
            }
          }

          // Критические ошибки должны отсутствовать
          const criticalErrors = resourceErrors.filter(e => e.severity === 'critical');
          expect(criticalErrors.length).toBe(0);
        });
      });
    }
  });

  // ============================================================================
  // СТАТИСТИКА
  // ============================================================================

  describe('Mission Statistics', () => {
    it('should have proper mission type distribution', () => {
      const typeCounts: Record<string, number> = {};

      for (const missions of MISSIONS_BY_LOCATION.values()) {
        for (const mission of missions) {
          typeCounts[mission.type] = (typeCounts[mission.type] || 0) + 1;
        }
      }

      console.log('\n=== MISSION TYPE DISTRIBUTION ===');
      for (const [type, count] of Object.entries(typeCounts)) {
        console.log(`  ${type}: ${count}`);
      }

      // Ожидаем хотя бы по одному типу каждого типа
      const expectedTypes = ['hunt', 'scout', 'gather'];
      for (const type of expectedTypes) {
        expect(typeCounts[type], `Should have at least one ${type} mission`).toBeGreaterThan(0);
      }
    });

    it('should have proper rarity distribution per tier', () => {
      const tierRarities: Record<number, Record<string, number>> = {};

      for (const location of locations) {
        const missions = MISSIONS_BY_LOCATION.get(location.id) || [];
        tierRarities[location.tier] = tierRarities[location.tier] || {};

        for (const mission of missions) {
          tierRarities[location.tier][mission.rarity] =
            (tierRarities[location.tier][mission.rarity] || 0) + 1;
        }
      }

      console.log('\n=== RARITY DISTRIBUTION BY TIER ===');
      for (const [tier, rarities] of Object.entries(tierRarities)) {
        console.log(`  Tier ${tier}: ${JSON.stringify(rarities)}`);
      }

      // Tier 4 должен иметь epic миссии
      expect(tierRarities[4]?.epic || 0, 'Tier 4 should have epic missions').toBeGreaterThan(0);
    });

    it('should have proper difficulty scaling per tier', () => {
      const tierDifficulties: Record<number, Record<string, number>> = {};

      for (const location of locations) {
        const missions = MISSIONS_BY_LOCATION.get(location.id) || [];
        tierDifficulties[location.tier] = tierDifficulties[location.tier] || {};

        for (const mission of missions) {
          tierDifficulties[location.tier][mission.difficulty] =
            (tierDifficulties[location.tier][mission.difficulty] || 0) + 1;
        }
      }

      console.log('\n=== DIFFICULTY DISTRIBUTION BY TIER ===');
      for (const [tier, difficulties] of Object.entries(tierDifficulties)) {
        console.log(`  Tier ${tier}: ${JSON.stringify(difficulties)}`);
      }

      // Tier 4 должен иметь extreme миссии
      expect(tierDifficulties[4]?.extreme || 0, 'Tier 4 should have extreme missions').toBeGreaterThan(0);
    });
  });
});
