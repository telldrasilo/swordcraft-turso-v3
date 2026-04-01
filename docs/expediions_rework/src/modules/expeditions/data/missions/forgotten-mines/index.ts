/**
 * Миссии для локации "Забытые Шахты"
 * Tier 2 - Средняя локация
 *
 * Структура:
 * - hunt.ts   — 4 боевые миссии
 * - scout.ts  — 3 миссии разведки
 * - gather.ts — 3 миссии сбора
 * - clear.ts  — 2 миссии зачистки
 *
 * Итого: 12 миссий
 */

import { forgottenMinesHuntMissions } from './hunt';
import { forgottenMinesScoutMissions } from './scout';
import { forgottenMinesGatherMissions } from './gather';
import { forgottenMinesClearMissions } from './clear';

// ============================================================================
// ЭКСПОРТ ПО КАТЕГОРИЯМ
// ============================================================================

export {
  forgottenMinesHuntMissions,
  forgottenMinesScoutMissions,
  forgottenMinesGatherMissions,
  forgottenMinesClearMissions,
};

// ============================================================================
// ЭКСПОРТ ИНДИВИДУАЛЬНЫХ МИССИЙ (для удобства)
// ============================================================================

// Боевые миссии
export {
  huntDeepCrawlersCommon,
  huntAncientMinersUncommon,
  huntShadowGuardsRare,
  huntEchoBeastRare,
} from './hunt';

// Разведка
export {
  scoutUpperLevelsCommon,
  scoutSealedDoorUncommon,
  scoutAncientForgeRare,
} from './scout';

// Сбор ресурсов
export {
  gatherTinCoalCommon,
  gatherRareMaterialsUncommon,
  gatherDepthIronRare,
} from './gather';

// Зачистка
export {
  clearUpperShaftUncommon,
  clearForbiddenZoneRare,
} from './clear';

// ============================================================================
// ОБЩИЙ РЕЕСТР МИССИЙ ЛОКАЦИИ
// ============================================================================

export const forgottenMinesMissions = [
  ...forgottenMinesHuntMissions,
  ...forgottenMinesScoutMissions,
  ...forgottenMinesGatherMissions,
  ...forgottenMinesClearMissions,
];

// ============================================================================
// СТАТИСТИКА
// ============================================================================

export const forgottenMinesStats = {
  total: 12,
  byType: {
    hunt: 4,
    scout: 3,
    gather: 3,
    clear: 2,
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

export default forgottenMinesMissions;
