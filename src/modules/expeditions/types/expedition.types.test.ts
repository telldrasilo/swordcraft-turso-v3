/**
 * Тесты для типов экспедиций
 */

import { describe, it, expect } from 'vitest';
import {
  DIFFICULTY_INFO,
  getDifficultyByTier,
  calculateExpeditionDuration,
  isExpeditionComplete,
  type ExpeditionDifficulty,
  type ActiveExpedition,
} from './expedition.types';

describe('DIFFICULTY_INFO', () => {
  it('should have all difficulty levels', () => {
    const difficulties: ExpeditionDifficulty[] = ['easy', 'normal', 'hard', 'extreme', 'legendary'];

    for (const diff of difficulties) {
      expect(DIFFICULTY_INFO[diff]).toBeDefined();
    }
  });

  it('should have increasing failure chance with difficulty', () => {
    expect(DIFFICULTY_INFO.easy.failureChance).toBeLessThan(DIFFICULTY_INFO.normal.failureChance);
    expect(DIFFICULTY_INFO.normal.failureChance).toBeLessThan(DIFFICULTY_INFO.hard.failureChance);
    expect(DIFFICULTY_INFO.hard.failureChance).toBeLessThan(DIFFICULTY_INFO.extreme.failureChance);
    expect(DIFFICULTY_INFO.extreme.failureChance).toBeLessThan(DIFFICULTY_INFO.legendary.failureChance);
  });

  it('should have increasing reward multiplier with difficulty', () => {
    expect(DIFFICULTY_INFO.easy.rewardMultiplier).toBeLessThan(DIFFICULTY_INFO.normal.rewardMultiplier);
    expect(DIFFICULTY_INFO.normal.rewardMultiplier).toBeLessThan(DIFFICULTY_INFO.hard.rewardMultiplier);
    expect(DIFFICULTY_INFO.hard.rewardMultiplier).toBeLessThan(DIFFICULTY_INFO.extreme.rewardMultiplier);
    expect(DIFFICULTY_INFO.extreme.rewardMultiplier).toBeLessThan(DIFFICULTY_INFO.legendary.rewardMultiplier);
  });

  it('should have correct level ranges', () => {
    expect(DIFFICULTY_INFO.easy.levelRange[0]).toBe(1);
    expect(DIFFICULTY_INFO.easy.levelRange[1]).toBe(10);
    expect(DIFFICULTY_INFO.legendary.levelRange[0]).toBe(38);
    expect(DIFFICULTY_INFO.legendary.levelRange[1]).toBe(50);
  });

  it('should have valid weapon loss chance (0-100)', () => {
    for (const diff of Object.values(DIFFICULTY_INFO)) {
      expect(diff.weaponLossChance).toBeGreaterThanOrEqual(0);
      expect(diff.weaponLossChance).toBeLessThanOrEqual(100);
    }
  });
});

describe('getDifficultyByTier', () => {
  it('should return easy and normal for tier 1', () => {
    const result = getDifficultyByTier(1);
    expect(result).toContain('easy');
    expect(result).toContain('normal');
    expect(result.length).toBe(2);
  });

  it('should return normal and hard for tier 2', () => {
    const result = getDifficultyByTier(2);
    expect(result).toContain('normal');
    expect(result).toContain('hard');
    expect(result.length).toBe(2);
  });

  it('should return hard and extreme for tier 3', () => {
    const result = getDifficultyByTier(3);
    expect(result).toContain('hard');
    expect(result).toContain('extreme');
    expect(result.length).toBe(2);
  });

  it('should return extreme and legendary for tier 4', () => {
    const result = getDifficultyByTier(4);
    expect(result).toContain('extreme');
    expect(result).toContain('legendary');
    expect(result.length).toBe(2);
  });

  it('should return easy for invalid tier', () => {
    const result = getDifficultyByTier(5 as any);
    expect(result).toEqual(['easy']);
  });
});

describe('calculateExpeditionDuration', () => {
  it('should return base duration without modifiers', () => {
    const baseDuration = 3600;
    const result = calculateExpeditionDuration(baseDuration);
    expect(result).toBe(baseDuration);
  });

  it('should return base duration with undefined modifiers', () => {
    const baseDuration = 3600;
    const result = calculateExpeditionDuration(baseDuration, undefined);
    expect(result).toBe(baseDuration);
  });
});

describe('isExpeditionComplete', () => {
  it('should return true when current time >= endsAt', () => {
    const expedition: ActiveExpedition = {
      id: 'test-1',
      expeditionId: 'exp-1',
      expeditionName: 'Test Expedition',
      expeditionIcon: '⚔️',
      locationId: 'loc-1',
      adventurerId: 'adv-1',
      adventurerName: 'Test Adventurer',
      weaponId: 'weapon-1',
      weaponName: 'Test Weapon',
      weaponData: {},
      startedAt: Date.now() - 3600000,
      endsAt: Date.now() - 1000, // Already ended
      deposit: 100,
      suppliesCost: 50,
      events: [],
    };

    expect(isExpeditionComplete(expedition)).toBe(true);
  });

  it('should return false when current time < endsAt', () => {
    const expedition: ActiveExpedition = {
      id: 'test-2',
      expeditionId: 'exp-2',
      expeditionName: 'Test Expedition',
      expeditionIcon: '⚔️',
      locationId: 'loc-1',
      adventurerId: 'adv-1',
      adventurerName: 'Test Adventurer',
      weaponId: 'weapon-1',
      weaponName: 'Test Weapon',
      weaponData: {},
      startedAt: Date.now(),
      endsAt: Date.now() + 3600000, // 1 hour in future
      deposit: 100,
      suppliesCost: 50,
      events: [],
    };

    expect(isExpeditionComplete(expedition)).toBe(false);
  });
});
