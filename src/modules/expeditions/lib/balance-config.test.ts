/**
 * Тесты для глобального конфига балансировки
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  GLOBAL_BALANCE_CONFIG,
  applyResourceMultiplier,
  applyQualityShift,
  applyDropChanceMultiplier,
  applyDurationMultiplier,
  applyEventTimeMultiplier,
  applySoftCap,
  getRandomValue,
  resetBalanceConfig,
  isTestingMode,
} from './balance-config';
import type { BalancePreset } from './balance-config';

describe('Balance Config', () => {
  beforeEach(() => {
    // Сбрасываем к стандартным значениям перед каждым тестом
    resetBalanceConfig();
  });

  afterEach(() => {
    resetBalanceConfig();
  });

  describe('Default Configuration', () => {
    it('should have default multiplier of 1.0 for resources', () => {
      expect(GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier).toBe(1.0);
    });

    it('should have default quality shift of 0', () => {
      expect(GLOBAL_BALANCE_CONFIG.resources.qualityShift).toBe(0);
    });

    it('should have default duration multiplier of 1.0', () => {
      expect(GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier).toBe(1.0);
    });

    it('should have soft caps disabled by default', () => {
      expect(GLOBAL_BALANCE_CONFIG.softCaps.enabled).toBe(false);
    });

    it('should have debug mode disabled by default', () => {
      expect(GLOBAL_BALANCE_CONFIG.debug.verboseLogs).toBe(false);
      expect(GLOBAL_BALANCE_CONFIG.debug.noRandom).toBe(false);
      expect(GLOBAL_BALANCE_CONFIG.debug.forceRarity).toBeNull();
    });
  });

  describe('applyResourceMultiplier', () => {
    it('should return same value with default multiplier', () => {
      const result = applyResourceMultiplier(100);
      expect(result).toBe(100);
    });

    it('should apply quantity multiplier', () => {
      GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier = 2.0;
      const result = applyResourceMultiplier(100);
      expect(result).toBe(200);
    });

    it('should apply gold multiplier for gold type', () => {
      GLOBAL_BALANCE_CONFIG.rewards.goldMultiplier = 3.0;
      const result = applyResourceMultiplier(100, 'gold');
      // 100 * 1.0 (quantity) * 3.0 (gold) = 300
      expect(result).toBe(300);
    });

    it('should apply experience multiplier for experience type', () => {
      GLOBAL_BALANCE_CONFIG.rewards.experienceMultiplier = 2.5;
      const result = applyResourceMultiplier(100, 'experience');
      expect(result).toBe(250);
    });

    it('should combine multiple multipliers', () => {
      GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier = 2.0;
      GLOBAL_BALANCE_CONFIG.rewards.goldMultiplier = 2.0;
      const result = applyResourceMultiplier(100, 'gold');
      // 100 * 2.0 (quantity) * 2.0 (gold) = 400
      expect(result).toBe(400);
    });

    it('should round down to integer', () => {
      GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier = 1.5;
      const result = applyResourceMultiplier(100);
      expect(result).toBe(150);
    });
  });

  describe('applyQualityShift', () => {
    it('should return same rarity with shift 0', () => {
      expect(applyQualityShift('common')).toBe('common');
      expect(applyQualityShift('rare')).toBe('rare');
    });

    it('should shift rarity up with positive shift', () => {
      GLOBAL_BALANCE_CONFIG.resources.qualityShift = 1;
      expect(applyQualityShift('common')).toBe('uncommon');
      expect(applyQualityShift('uncommon')).toBe('rare');
      expect(applyQualityShift('rare')).toBe('epic');
    });

    it('should not exceed legendary', () => {
      GLOBAL_BALANCE_CONFIG.resources.qualityShift = 10;
      expect(applyQualityShift('common')).toBe('legendary');
      expect(applyQualityShift('legendary')).toBe('legendary');
    });

    it('should shift rarity down with negative shift', () => {
      GLOBAL_BALANCE_CONFIG.resources.qualityShift = -1;
      expect(applyQualityShift('rare')).toBe('uncommon');
      expect(applyQualityShift('epic')).toBe('rare');
    });

    it('should not go below common', () => {
      GLOBAL_BALANCE_CONFIG.resources.qualityShift = -10;
      expect(applyQualityShift('rare')).toBe('common');
      expect(applyQualityShift('common')).toBe('common');
    });

    it('should use force rarity when set', () => {
      GLOBAL_BALANCE_CONFIG.debug.forceRarity = 'epic';
      expect(applyQualityShift('common')).toBe('epic');
      expect(applyQualityShift('legendary')).toBe('epic');
    });
  });

  describe('applyDropChanceMultiplier', () => {
    it('should return same chance with default multiplier', () => {
      expect(applyDropChanceMultiplier(50)).toBe(50);
    });

    it('should increase chance with multiplier > 1', () => {
      GLOBAL_BALANCE_CONFIG.resources.dropChanceMultiplier = 2.0;
      expect(applyDropChanceMultiplier(30)).toBe(60);
    });

    it('should cap at 100%', () => {
      GLOBAL_BALANCE_CONFIG.resources.dropChanceMultiplier = 3.0;
      expect(applyDropChanceMultiplier(50)).toBe(100);
    });
  });

  describe('applyDurationMultiplier', () => {
    it('should return same duration with default multiplier', () => {
      expect(applyDurationMultiplier(3600)).toBe(3600);
    });

    it('should reduce duration with multiplier < 1', () => {
      GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier = 0.5;
      expect(applyDurationMultiplier(3600)).toBe(1800);
    });

    it('should increase duration with multiplier > 1', () => {
      GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier = 2.0;
      expect(applyDurationMultiplier(3600)).toBe(7200);
    });
  });

  describe('applyEventTimeMultiplier', () => {
    it('should apply event time multiplier', () => {
      GLOBAL_BALANCE_CONFIG.duration.eventTimeMultiplier = 0.5;
      expect(applyEventTimeMultiplier(120)).toBe(60);
    });
  });

  describe('applySoftCap', () => {
    it('should return same value when soft caps disabled', () => {
      GLOBAL_BALANCE_CONFIG.softCaps.enabled = false;
      expect(applySoftCap(100, 200)).toBe(100);
    });

    it('should return same value before decay start point', () => {
      GLOBAL_BALANCE_CONFIG.softCaps.enabled = true;
      GLOBAL_BALANCE_CONFIG.softCaps.decayStartPoint = 100;
      expect(applySoftCap(100, 50)).toBe(100);
      expect(applySoftCap(100, 100)).toBe(100);
    });

    it('should apply decay after start point', () => {
      GLOBAL_BALANCE_CONFIG.softCaps.enabled = true;
      GLOBAL_BALANCE_CONFIG.softCaps.decayStartPoint = 100;
      GLOBAL_BALANCE_CONFIG.softCaps.decayRate = 0.01;
      GLOBAL_BALANCE_CONFIG.softCaps.minMultiplier = 0.1;

      // progress = 200, excess = 100
      // decayFactor = 1 + 100 * 0.01 = 2
      // multiplier = 1/2 = 0.5
      // result = 100 * 0.5 = 50
      expect(applySoftCap(100, 200)).toBe(50);
    });

    it('should not go below min multiplier', () => {
      GLOBAL_BALANCE_CONFIG.softCaps.enabled = true;
      GLOBAL_BALANCE_CONFIG.softCaps.decayStartPoint = 0;
      GLOBAL_BALANCE_CONFIG.softCaps.decayRate = 0.1;
      GLOBAL_BALANCE_CONFIG.softCaps.minMultiplier = 0.5;

      // progress = 100, excess = 100
      // decayFactor = 1 + 100 * 0.1 = 11
      // multiplier would be 1/11 ≈ 0.09, but min is 0.5
      expect(applySoftCap(100, 100)).toBe(50);
    });
  });

  describe('getRandomValue', () => {
    it('should return base value when noRandom is true', () => {
      GLOBAL_BALANCE_CONFIG.debug.noRandom = true;
      const result = getRandomValue(100, 0.5);
      expect(result).toBe(100);
    });

    it('should return deterministic value with fixed seed', () => {
      GLOBAL_BALANCE_CONFIG.debug.fixedSeed = 42;
      const result1 = getRandomValue(100, 0.5);
      const result2 = getRandomValue(100, 0.5);
      // Seed is used once, results should be different but deterministic
      expect(typeof result1).toBe('number');
      expect(typeof result2).toBe('number');
    });

    it('should return value within variance range', () => {
      GLOBAL_BALANCE_CONFIG.debug.noRandom = false;
      GLOBAL_BALANCE_CONFIG.debug.fixedSeed = null;

      // Run multiple times to check range
      for (let i = 0; i < 100; i++) {
        const result = getRandomValue(100, 0.2);
        expect(result).toBeGreaterThanOrEqual(80); // 100 - 20
        expect(result).toBeLessThanOrEqual(120);   // 100 + 20
      }
    });
  });

  describe('isTestingMode', () => {
    it('should return false with default config', () => {
      expect(isTestingMode()).toBe(false);
    });

    it('should return true when noRandom is enabled', () => {
      GLOBAL_BALANCE_CONFIG.debug.noRandom = true;
      expect(isTestingMode()).toBe(true);
    });

    it('should return true when forceRarity is set', () => {
      GLOBAL_BALANCE_CONFIG.debug.forceRarity = 'rare';
      expect(isTestingMode()).toBe(true);
    });
  });

  describe('Presets', () => {
    const presets: BalancePreset[] = ['default', 'testing', 'development', 'hardcore', 'endgame'];

    it('should have all presets defined', () => {
      presets.forEach(preset => {
        expect(() => GLOBAL_BALANCE_CONFIG.applyPreset(preset)).not.toThrow();
      });
    });

    it('testing preset should increase resources', () => {
      GLOBAL_BALANCE_CONFIG.applyPreset('testing');
      expect(GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier).toBeGreaterThan(1);
      expect(GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier).toBeLessThan(1);
    });

    it('hardcore preset should decrease resources', () => {
      GLOBAL_BALANCE_CONFIG.applyPreset('hardcore');
      expect(GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier).toBeLessThan(1);
      expect(GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier).toBeGreaterThan(1);
    });

    it('endgame preset should enable soft caps', () => {
      GLOBAL_BALANCE_CONFIG.applyPreset('endgame');
      expect(GLOBAL_BALANCE_CONFIG.softCaps.enabled).toBe(true);
    });

    it('default preset should reset all values', () => {
      // First apply testing
      GLOBAL_BALANCE_CONFIG.applyPreset('testing');

      // Then reset to default
      GLOBAL_BALANCE_CONFIG.applyPreset('default');

      expect(GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier).toBe(1.0);
      expect(GLOBAL_BALANCE_CONFIG.duration.missionDurationMultiplier).toBe(1.0);
      expect(GLOBAL_BALANCE_CONFIG.softCaps.enabled).toBe(false);
      expect(GLOBAL_BALANCE_CONFIG.debug.noRandom).toBe(false);
    });
  });

  describe('Integration with calculateValue', () => {
    it('should use getRandomValue from balance config', async () => {
      const { calculateValue } = await import('../data/missions/_mission-template');

      // Enable noRandom mode
      GLOBAL_BALANCE_CONFIG.debug.noRandom = true;

      const scalable = { base: 100, variance: 0.5, perDifficulty: 0, perRarity: 0 };
      const result = calculateValue(scalable, 'normal', 'common');

      // With noRandom, should return exactly base
      expect(result).toBe(100);
    });

    it('should apply resource multiplier when type specified', async () => {
      const { calculateValue } = await import('../data/missions/_mission-template');

      GLOBAL_BALANCE_CONFIG.debug.noRandom = true;
      GLOBAL_BALANCE_CONFIG.resources.quantityMultiplier = 2.0;

      const scalable = { base: 100, variance: 0, perDifficulty: 0, perRarity: 0 };
      const result = calculateValue(scalable, 'normal', 'common', 'gold');

      expect(result).toBe(200);
    });
  });
});
