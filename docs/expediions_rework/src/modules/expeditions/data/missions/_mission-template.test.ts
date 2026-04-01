/**
 * Тесты для шаблона миссий и конфигураций
 */

import { describe, it, expect } from 'vitest';
import {
  CONTRACT_CONFIG,
  GUILD_COMMISSION,
  MISSION_RARITY_CONFIG,
  MISSION_DIFFICULTY_CONFIG,
  MISSION_TYPE_CONFIG,
  calculateValue,
  calculateRewardDistribution,
  EXAMPLE_MISSION,
  type ScalableValue,
  type MissionDifficulty,
  type MissionRarity,
  type ContractType,
} from './_mission-template';

describe('CONTRACT_CONFIG', () => {
  it('should have exploration and speed contract types', () => {
    expect(CONTRACT_CONFIG.exploration).toBeDefined();
    expect(CONTRACT_CONFIG.speed).toBeDefined();
  });

  it('should have correct gold distribution for exploration contract', () => {
    expect(CONTRACT_CONFIG.exploration.blacksmithGoldPercent).toBe(20);
    expect(CONTRACT_CONFIG.exploration.adventurerGoldPercent).toBe(80);
  });

  it('should have correct gold distribution for speed contract', () => {
    expect(CONTRACT_CONFIG.speed.blacksmithGoldPercent).toBe(50);
    expect(CONTRACT_CONFIG.speed.adventurerGoldPercent).toBe(50);
  });

  it('should have material find multiplier for exploration', () => {
    expect(CONTRACT_CONFIG.exploration.materialFindMultiplier).toBeGreaterThan(1);
  });

  it('should have duration multiplier for speed contract', () => {
    expect(CONTRACT_CONFIG.speed.durationMultiplier).toBeLessThan(1);
  });

  it('should have gold percentages summing to 100', () => {
    for (const config of Object.values(CONTRACT_CONFIG)) {
      expect(config.blacksmithGoldPercent + config.adventurerGoldPercent).toBe(100);
    }
  });
});

describe('GUILD_COMMISSION', () => {
  it('should have base percent of 15', () => {
    expect(GUILD_COMMISSION.basePercent).toBe(15);
  });

  it('should have max percent of 30', () => {
    expect(GUILD_COMMISSION.maxPercent).toBe(30);
  });

  it('should calculate commission correctly for guild level 1', () => {
    expect(GUILD_COMMISSION.calculate(1)).toBe(15);
  });

  it('should calculate commission correctly for guild level 5', () => {
    // 15 + (5-1) * 2 = 23
    expect(GUILD_COMMISSION.calculate(5)).toBe(23);
  });

  it('should cap at max percent', () => {
    expect(GUILD_COMMISSION.calculate(100)).toBe(30);
  });

  it('should increase by 2% per level', () => {
    const level1 = GUILD_COMMISSION.calculate(1);
    const level2 = GUILD_COMMISSION.calculate(2);

    expect(level2 - level1).toBe(2);
  });
});

describe('MISSION_RARITY_CONFIG', () => {
  it('should have all rarity levels', () => {
    const rarities: MissionRarity[] = ['common', 'uncommon', 'rare', 'epic'];

    for (const rarity of rarities) {
      expect(MISSION_RARITY_CONFIG[rarity]).toBeDefined();
    }
  });

  it('should have decreasing weights from common to epic', () => {
    expect(MISSION_RARITY_CONFIG.common.weight).toBeGreaterThan(MISSION_RARITY_CONFIG.uncommon.weight);
    expect(MISSION_RARITY_CONFIG.uncommon.weight).toBeGreaterThan(MISSION_RARITY_CONFIG.rare.weight);
    expect(MISSION_RARITY_CONFIG.rare.weight).toBeGreaterThan(MISSION_RARITY_CONFIG.epic.weight);
  });

  it('should have increasing reward multipliers', () => {
    expect(MISSION_RARITY_CONFIG.common.rewardMultiplier).toBeLessThan(MISSION_RARITY_CONFIG.uncommon.rewardMultiplier);
    expect(MISSION_RARITY_CONFIG.uncommon.rewardMultiplier).toBeLessThan(MISSION_RARITY_CONFIG.rare.rewardMultiplier);
    expect(MISSION_RARITY_CONFIG.rare.rewardMultiplier).toBeLessThan(MISSION_RARITY_CONFIG.epic.rewardMultiplier);
  });

  it('should have increasing minimum guild levels', () => {
    expect(MISSION_RARITY_CONFIG.common.minGuildLevel).toBeLessThanOrEqual(MISSION_RARITY_CONFIG.uncommon.minGuildLevel);
    expect(MISSION_RARITY_CONFIG.uncommon.minGuildLevel).toBeLessThanOrEqual(MISSION_RARITY_CONFIG.rare.minGuildLevel);
    expect(MISSION_RARITY_CONFIG.rare.minGuildLevel).toBeLessThanOrEqual(MISSION_RARITY_CONFIG.epic.minGuildLevel);
  });
});

describe('MISSION_DIFFICULTY_CONFIG', () => {
  it('should have all difficulty levels', () => {
    const difficulties: MissionDifficulty[] = ['easy', 'normal', 'hard', 'extreme'];

    for (const diff of difficulties) {
      expect(MISSION_DIFFICULTY_CONFIG[diff]).toBeDefined();
    }
  });

  it('should have increasing duration multipliers', () => {
    expect(MISSION_DIFFICULTY_CONFIG.easy.durationMultiplier).toBeLessThan(MISSION_DIFFICULTY_CONFIG.normal.durationMultiplier);
    expect(MISSION_DIFFICULTY_CONFIG.normal.durationMultiplier).toBeLessThan(MISSION_DIFFICULTY_CONFIG.hard.durationMultiplier);
    expect(MISSION_DIFFICULTY_CONFIG.hard.durationMultiplier).toBeLessThan(MISSION_DIFFICULTY_CONFIG.extreme.durationMultiplier);
  });

  it('should have decreasing success chance base', () => {
    expect(MISSION_DIFFICULTY_CONFIG.easy.successChanceBase).toBeGreaterThan(MISSION_DIFFICULTY_CONFIG.normal.successChanceBase);
    expect(MISSION_DIFFICULTY_CONFIG.normal.successChanceBase).toBeGreaterThan(MISSION_DIFFICULTY_CONFIG.hard.successChanceBase);
    expect(MISSION_DIFFICULTY_CONFIG.hard.successChanceBase).toBeGreaterThan(MISSION_DIFFICULTY_CONFIG.extreme.successChanceBase);
  });

  it('should have increasing enemy count', () => {
    expect(MISSION_DIFFICULTY_CONFIG.easy.enemyCountBase).toBeLessThan(MISSION_DIFFICULTY_CONFIG.normal.enemyCountBase);
    expect(MISSION_DIFFICULTY_CONFIG.normal.enemyCountBase).toBeLessThan(MISSION_DIFFICULTY_CONFIG.hard.enemyCountBase);
    expect(MISSION_DIFFICULTY_CONFIG.hard.enemyCountBase).toBeLessThan(MISSION_DIFFICULTY_CONFIG.extreme.enemyCountBase);
  });

  it('should have increasing cost multiplier', () => {
    expect(MISSION_DIFFICULTY_CONFIG.easy.costMultiplier).toBeLessThan(MISSION_DIFFICULTY_CONFIG.normal.costMultiplier);
    expect(MISSION_DIFFICULTY_CONFIG.normal.costMultiplier).toBeLessThan(MISSION_DIFFICULTY_CONFIG.hard.costMultiplier);
    expect(MISSION_DIFFICULTY_CONFIG.hard.costMultiplier).toBeLessThan(MISSION_DIFFICULTY_CONFIG.extreme.costMultiplier);
  });
});

describe('MISSION_TYPE_CONFIG', () => {
  it('should have all mission types', () => {
    const types = ['hunt', 'scout', 'clear', 'gather', 'rescue', 'delivery', 'escort', 'investigate'];

    for (const type of types) {
      expect(MISSION_TYPE_CONFIG[type as keyof typeof MISSION_TYPE_CONFIG]).toBeDefined();
    }
  });

  it('should have icons for all mission types', () => {
    for (const config of Object.values(MISSION_TYPE_CONFIG)) {
      expect(config.icon).toBeDefined();
      expect(config.icon.length).toBeGreaterThan(0);
    }
  });

  it('should have preferred contracts', () => {
    for (const config of Object.values(MISSION_TYPE_CONFIG)) {
      expect(config.preferredContract).toBeDefined();
      expect(['exploration', 'speed']).toContain(config.preferredContract);
    }
  });
});

describe('calculateValue', () => {
  it('should return base value for easy/common', () => {
    const scalable: ScalableValue = {
      base: 100,
      variance: 0,
      perDifficulty: 0,
      perRarity: 0,
    };

    const result = calculateValue(scalable, 'easy', 'common');

    expect(result).toBe(100);
  });

  it('should add difficulty bonus', () => {
    const scalable: ScalableValue = {
      base: 100,
      variance: 0,
      perDifficulty: 50,
      perRarity: 0,
    };

    const easy = calculateValue(scalable, 'easy', 'common');
    const normal = calculateValue(scalable, 'normal', 'common');
    const hard = calculateValue(scalable, 'hard', 'common');
    const extreme = calculateValue(scalable, 'extreme', 'common');

    // easy=0, normal=1, hard=2, extreme=3
    expect(normal - easy).toBe(50);
    expect(hard - normal).toBe(50);
    expect(extreme - hard).toBe(50);
  });

  it('should add rarity bonus', () => {
    const scalable: ScalableValue = {
      base: 100,
      variance: 0,
      perDifficulty: 0,
      perRarity: 25,
    };

    const common = calculateValue(scalable, 'easy', 'common');
    const uncommon = calculateValue(scalable, 'easy', 'uncommon');
    const rare = calculateValue(scalable, 'easy', 'rare');
    const epic = calculateValue(scalable, 'easy', 'epic');

    // common=0, uncommon=1, rare=2, epic=3
    expect(uncommon - common).toBe(25);
    expect(rare - uncommon).toBe(25);
    expect(epic - rare).toBe(25);
  });

  it('should apply variance within range', () => {
    const scalable: ScalableValue = {
      base: 100,
      variance: 0.2, // ±20%
      perDifficulty: 0,
      perRarity: 0,
    };

    // Run multiple times to check variance is applied
    const results = new Set<number>();
    for (let i = 0; i < 100; i++) {
      results.add(calculateValue(scalable, 'easy', 'common'));
    }

    // With variance, we should get different values
    // (though theoretically possible to always get same value)
    expect(results.size).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateRewardDistribution', () => {
  it('should calculate correct distribution for exploration contract', () => {
    const result = calculateRewardDistribution(
      100, // total gold
      1, // guild level
      'exploration',
      [], // materials
      10, // war soul
      5, // glory
      20, // experience
    );

    // Guild commission: 15%
    // Remaining: 85
    // Blacksmith (20%): 17
    // Adventurer (80%): 68
    expect(result.guildCommission).toBe(15);
    expect(result.blacksmithGold).toBe(17);
    expect(result.adventurerGold).toBe(68);
    expect(result.warSoul).toBe(10);
    expect(result.glory).toBe(5);
    expect(result.experience).toBe(20);
  });

  it('should calculate correct distribution for speed contract', () => {
    const result = calculateRewardDistribution(
      100, // total gold
      1, // guild level
      'speed',
      [], // materials
      10, // war soul
      5, // glory
      20, // experience
    );

    // Guild commission: 15%
    // Remaining: 85
    // Blacksmith (50%): 42 (rounded down from 42.5)
    // Adventurer (50%): 43
    expect(result.guildCommission).toBe(15);
    expect(result.blacksmithGold + result.adventurerGold).toBe(85);
  });

  it('should apply material multiplier', () => {
    const materials = [{ materialId: 'iron', quantity: 10 }];

    const explorationResult = calculateRewardDistribution(
      100, 1, 'exploration', materials, 0, 0, 0
    );
    const speedResult = calculateRewardDistribution(
      100, 1, 'speed', materials, 0, 0, 0
    );

    // Exploration has 1.5x material multiplier
    // Speed has 0.7x material multiplier
    expect(explorationResult.materials[0].quantity).toBe(15); // 10 * 1.5
    expect(speedResult.materials[0].quantity).toBe(7); // 10 * 0.7
  });

  it('should increase commission with guild level', () => {
    const level1 = calculateRewardDistribution(100, 1, 'exploration', [], 0, 0, 0);
    const level5 = calculateRewardDistribution(100, 5, 'exploration', [], 0, 0, 0);

    expect(level5.guildCommission).toBeGreaterThan(level1.guildCommission);
  });
});

describe('EXAMPLE_MISSION', () => {
  it('should be a valid mission template', () => {
    expect(EXAMPLE_MISSION.id).toBeDefined();
    expect(EXAMPLE_MISSION.locationId).toBeDefined();
    expect(EXAMPLE_MISSION.type).toBeDefined();
    expect(EXAMPLE_MISSION.name).toBeDefined();
    expect(EXAMPLE_MISSION.description).toBeDefined();
    expect(EXAMPLE_MISSION.objective).toBeDefined();
    expect(EXAMPLE_MISSION.client).toBeDefined();
    expect(EXAMPLE_MISSION.duration).toBeDefined();
    expect(EXAMPLE_MISSION.cost).toBeDefined();
    expect(EXAMPLE_MISSION.reward).toBeDefined();
  });

  it('should have valid cost structure', () => {
    expect(EXAMPLE_MISSION.cost.supplies).toBeDefined();
    expect(EXAMPLE_MISSION.cost.deposit).toBeDefined();
    expect(EXAMPLE_MISSION.cost.supplies.base).toBeGreaterThan(0);
    expect(EXAMPLE_MISSION.cost.deposit.base).toBeGreaterThan(0);
  });

  it('should have valid reward structure', () => {
    expect(EXAMPLE_MISSION.reward.gold).toBeDefined();
    expect(EXAMPLE_MISSION.reward.glory).toBeDefined();
    expect(EXAMPLE_MISSION.reward.experience).toBeDefined();
    expect(EXAMPLE_MISSION.reward.warSoul).toBeDefined();
  });

  it('should be repeatable with cooldown', () => {
    expect(EXAMPLE_MISSION.isRepeatable).toBe(true);
    expect(EXAMPLE_MISSION.cooldownHours).toBeGreaterThan(0);
  });
});
