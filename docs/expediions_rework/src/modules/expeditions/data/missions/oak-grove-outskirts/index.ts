/**
 * Миссии локации "Окраины Дубовой Рощи"
 *
 * Экспортирует все типы миссий для использования в реестре.
 */

import type { MissionTemplate } from '../../missions/_mission-template';

// Боевые миссии
export {
  oakGroveHuntMissions,
  huntBoarsCommon,
  huntWolvesCommon,
  clearBanditsUncommon,
  huntAlphaWolfRare,
  clearGoblinsUncommon,
  escortMerchantCommon as huntEscortMerchant,
} from './hunt';

// Миссии разведки
export {
  oakGroveScoutMissions,
  scoutPathsCommon,
  scoutHerbGroveCommon,
  scoutOldMineUncommon,
} from './scout';

// Миссии сбора ресурсов
export {
  oakGroveGatherMissions,
  gatherWoodCommon,
  gatherBarkCommon,
  gatherHerbsCommon,
  gatherIronUncommon,
} from './gather';

// Миссии спасения
export {
  oakGroveRescueMissions,
  rescueChildCommon,
  rescueHunterUncommon,
} from './rescue';

// Миссии сопровождения
export {
  oakGroveEscortMissions,
  escortMerchantCommon,
  escortHerbalistCommon,
} from './escort';

// Импорт для реестра
import { oakGroveHuntMissions } from './hunt';
import { oakGroveScoutMissions } from './scout';
import { oakGroveGatherMissions } from './gather';
import { oakGroveRescueMissions } from './rescue';
import { oakGroveEscortMissions } from './escort';

// ============================================================================
// ПОЛНЫЙ РЕЕСТР МИССИЙ ЛОКАЦИИ
// ============================================================================

export const OAK_GROVE_MISSIONS: MissionTemplate[] = [
  ...oakGroveHuntMissions,
  ...oakGroveScoutMissions,
  ...oakGroveGatherMissions,
  ...oakGroveRescueMissions,
  ...oakGroveEscortMissions,
];
