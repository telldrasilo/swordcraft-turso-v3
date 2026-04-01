/**
 * Миссии для локации "Гнилое Болото"
 * Tier 2 - Средняя локация
 *
 * Структура:
 * - hunt.ts   — 4 боевые миссии
 * - scout.ts  — 3 миссии разведки
 * - gather.ts — 3 миссии сбора
 * - rescue.ts — 2 миссии спасения
 *
 * Итого: 12 миссий
 */

import { rottenSwampHuntMissions } from './hunt';
import { rottenSwampScoutMissions } from './scout';
import { rottenSwampGatherMissions } from './gather';
import { rottenSwampRescueMissions } from './rescue';

// ============================================================================
// ЭКСПОРТ ПО КАТЕГОРИЯМ
// ============================================================================

export {
  rottenSwampHuntMissions,
  rottenSwampScoutMissions,
  rottenSwampGatherMissions,
  rottenSwampRescueMissions,
};

// ============================================================================
// ЭКСПОРТ ИНДИВИДУАЛЬНЫХ МИССИЙ (для удобства)
// ============================================================================

// Боевые миссии
export {
  huntCorpseWormsCommon,
  huntPoisonNewtsUncommon,
  huntDrownedUncommon,
  huntSwampLichRare,
} from './hunt';

// Разведка
export {
  scoutSafePathCommon,
  scoutToxinSourceUncommon,
  scoutWombOfRotRare,
} from './scout';

// Сбор ресурсов
export {
  gatherRottenWoodCommon,
  gatherPoisonGlandsUncommon,
  gatherRareMaterialsRare,
} from './gather';

// Спасение
export {
  rescuePoisonedUncommon,
  rescueFromTrapRare,
} from './rescue';

// ============================================================================
// ОБЩИЙ РЕЕСТР МИССИЙ ЛОКАЦИИ
// ============================================================================

export const rottenSwampMissions = [
  ...rottenSwampHuntMissions,
  ...rottenSwampScoutMissions,
  ...rottenSwampGatherMissions,
  ...rottenSwampRescueMissions,
];

// ============================================================================
// СТАТИСТИКА
// ============================================================================

export const rottenSwampStats = {
  total: 12,
  byType: {
    hunt: 4,
    scout: 3,
    gather: 3,
    rescue: 2,
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
    normal: 3,
    hard: 6,
    extreme: 3,
  },
};

export default rottenSwampMissions;
