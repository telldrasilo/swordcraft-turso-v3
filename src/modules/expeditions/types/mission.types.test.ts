/**
 * Тесты для типов миссий
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_EVENT_CONFIG,
  calculateEventCount,
} from './mission.types';

describe('DEFAULT_EVENT_CONFIG', () => {
  it('should have valid configuration values', () => {
    expect(DEFAULT_EVENT_CONFIG.baseCount).toBeGreaterThan(0);
    expect(DEFAULT_EVENT_CONFIG.eventsPerSeconds).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_EVENT_CONFIG.minCount).toBeGreaterThan(0);
    expect(DEFAULT_EVENT_CONFIG.maxCount).toBeGreaterThan(DEFAULT_EVENT_CONFIG.minCount);
  });

  it('should have reasonable limits', () => {
    expect(DEFAULT_EVENT_CONFIG.minCount).toBeLessThanOrEqual(5);
    expect(DEFAULT_EVENT_CONFIG.maxCount).toBeLessThanOrEqual(20);
  });
});

describe('calculateEventCount', () => {
  it('should return minimum count for short duration', () => {
    const result = calculateEventCount(60); // 1 minute
    expect(result).toBeGreaterThanOrEqual(DEFAULT_EVENT_CONFIG.minCount);
  });

  it('should return more events for longer duration', () => {
    const shortDuration = calculateEventCount(300); // 5 minutes
    const longDuration = calculateEventCount(3600); // 1 hour

    expect(longDuration).toBeGreaterThanOrEqual(shortDuration);
  });

  it('should not exceed maximum count', () => {
    const result = calculateEventCount(86400); // 24 hours
    expect(result).toBeLessThanOrEqual(DEFAULT_EVENT_CONFIG.maxCount);
  });

  it('should not go below minimum count', () => {
    const result = calculateEventCount(0);
    expect(result).toBeGreaterThanOrEqual(DEFAULT_EVENT_CONFIG.minCount);
  });

  it('should use custom config when provided', () => {
    const customConfig = {
      baseCount: 5,
      eventsPerSeconds: 0.01,
      minCount: 3,
      maxCount: 10,
    };

    const result = calculateEventCount(100, customConfig);
    expect(result).toBeGreaterThanOrEqual(customConfig.minCount);
    expect(result).toBeLessThanOrEqual(customConfig.maxCount);
  });

  it('should return base count for zero duration', () => {
    const result = calculateEventCount(0);
    // Should return at least minCount (baseCount is 2, minCount is 1)
    expect(result).toBeGreaterThanOrEqual(DEFAULT_EVENT_CONFIG.minCount);
    expect(result).toBeLessThanOrEqual(DEFAULT_EVENT_CONFIG.baseCount);
  });
});
