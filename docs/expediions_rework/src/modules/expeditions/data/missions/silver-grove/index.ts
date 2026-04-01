/**
 * Миссии для локации "Серебряный Бор"
 * Tier 2 - Средняя локация
 *
 * Структура:
 * - hunt.ts       — 4 боевые миссии
 * - scout.ts      — 3 миссии разведки
 * - gather.ts     — 3 миссии сбора
 * - investigate.ts — 2 миссии расследования
 *
 * Итого: 12 миссий
 */

import { silverGroveHuntMissions } from './hunt';
import { silverGroveScoutMissions } from './scout';
import { silverGroveGatherMissions } from './gather';
import { silverGroveInvestigateMissions } from './investigate';

// ============================================================================
// ЭКСПОРТ ПО КАТЕГОРИЯМ
// ============================================================================

export {
  silverGroveHuntMissions,
  silverGroveScoutMissions,
  silverGroveGatherMissions,
  silverGroveInvestigateMissions,
};

// ============================================================================
// ЭКСПОРТ ИНДИВИДУАЛЬНЫХ МИССИЙ (для удобства)
// ============================================================================

// Боевые миссии
export {
  huntSilverSpidersCommon,
  huntMoonWolvesUncommon,
  huntWerewolfRare,
  huntShadowHunterRare,
} from './hunt';

// Разведка
export {
  scoutNightPathsCommon,
  scoutSilverVeinUncommon,
  scoutMoonForgeRare,
} from './scout';

// Сбор ресурсов
export {
  gatherSilverOreCommon,
  gatherPineResinCommon,
  gatherRareMaterialsUncommon,
} from './gather';

// Расследование
export {
  investigateDisappearancesUncommon,
  investigateLunarMagicRare,
} from './investigate';

// ============================================================================
// ОБЩИЙ РЕЕСТР МИССИЙ ЛОКАЦИИ
// ============================================================================

export const silverGroveMissions = [
  ...silverGroveHuntMissions,
  ...silverGroveScoutMissions,
  ...silverGroveGatherMissions,
  ...silverGroveInvestigateMissions,
];

// ============================================================================
// СТАТИСТИКА
// ============================================================================

export const silverGroveStats = {
  total: 12,
  byType: {
    hunt: 4,
    scout: 3,
    gather: 3,
    investigate: 2,
  },
  byRarity: {
    common: 3,
    uncommon: 5,
    rare: 4,
    epic: 0,
    legendary: 0,
  },
  byDifficulty: {
    easy: 0,
    normal: 5,
    hard: 7,
    extreme: 0,
  },
};

export default silverGroveMissions;
