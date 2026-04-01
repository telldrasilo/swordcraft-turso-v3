/**
 * Миссии для локации "Рудники Красного Камня"
 * Tier 1 - Стартовая локация
 *
 * Структура:
 * - hunt.ts    — 5 боевых миссий
 * - scout.ts   — 3 миссии разведки
 * - gather.ts  — 3 миссии сбора
 * - rescue.ts  — 2 миссии спасения
 *
 * Итого: 13 миссий
 */

import { redStoneHuntMissions } from './hunt';
import { redStoneScoutMissions } from './scout';
import { redStoneGatherMissions } from './gather';
import { redStoneRescueMissions } from './rescue';

// ============================================================================
// ЭКСПОРТ ПО КАТЕГОРИЯМ
// ============================================================================

export {
  redStoneHuntMissions,
  redStoneScoutMissions,
  redStoneGatherMissions,
  redStoneRescueMissions,
};

// ============================================================================
// ЭКСПОРТ ИНДИВИДУАЛЬНЫХ МИССИЙ (для удобства)
// ============================================================================

// Боевые миссии
export {
  huntOreRatsCommon,
  clearSpidersCommon,
  huntLostMinersUncommon,
  huntMushroomMenUncommon,
  huntSpiderQueenRare,
} from './hunt';

// Разведка
export {
  scoutAbandonedTunnelsCommon,
  scoutNewVeinUncommon,
  scoutDeepShaftRare,
} from './scout';

// Сбор ресурсов
export {
  gatherIronOreCommon,
  gatherCoalCopperCommon,
  gatherCopperNuggetsUncommon,
} from './gather';

// Спасение
export {
  rescueTrappedMinersCommon,
  rescueLostApprenticeUncommon,
} from './rescue';

// ============================================================================
// ОБЩИЙ РЕЕСТР МИССИЙ ЛОКАЦИИ
// ============================================================================

export const redStoneMinesMissions = [
  ...redStoneHuntMissions,
  ...redStoneScoutMissions,
  ...redStoneGatherMissions,
  ...redStoneRescueMissions,
];

// ============================================================================
// СТАТИСТИКА
// ============================================================================

export const redStoneMinesStats = {
  total: 13,
  byType: {
    hunt: 5,
    scout: 3,
    gather: 3,
    rescue: 2,
  },
  byRarity: {
    common: 5,
    uncommon: 5,
    rare: 2,
    epic: 0,
    legendary: 0,
  },
  byDifficulty: {
    easy: 2,
    normal: 7,
    hard: 4,
    extreme: 0,
  },
};

export default redStoneMinesMissions;
