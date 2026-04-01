/**
 * Общие события для всех локаций
 *
 * Эта категория содержит события, которые могут произойти
 * в любой локации независимо от её типа.
 *
 * Структура:
 * - discovery.ts — находки и открытия (5 событий)
 * - danger.ts — опасности и ловушки (5 событий)
 * - travel.ts — путевые события (5 событий)
 * - social.ts — встречи с NPC (5 событий)
 * - environment.ts — природные явления (3 события)
 * - treasure.ts — сокровища (3 события)
 * - mystery.ts — загадки и тайны (4 события)
 * - combat.ts — боевые столкновения (3 события)
 * - rest.ts — отдых и восстановление (3 события)
 * - supernatural.ts — сверхъестественные явления (4 события)
 *
 * Итого: 40 общих событий
 */

import { commonDiscoveryEvents } from './discovery';
import { commonDangerEvents } from './danger';
import { commonTravelEvents } from './travel';
import { commonSocialEvents } from './social';
import { commonEnvironmentEvents } from './environment';
import { commonTreasureEvents } from './treasure';
import { commonMysteryEvents } from './mystery';
import { commonCombatEvents } from './combat';
import { commonRestEvents } from './rest';
import { commonSupernaturalEvents } from './supernatural';

// ============================================================================
// ЭКСПОРТ ВСЕХ СОБЫТИЙ
// ============================================================================

export {
  commonDiscoveryEvents,
  commonDangerEvents,
  commonTravelEvents,
  commonSocialEvents,
  commonEnvironmentEvents,
  commonTreasureEvents,
  commonMysteryEvents,
  commonCombatEvents,
  commonRestEvents,
  commonSupernaturalEvents,
};

// Экспорт отдельных событий для удобства
export {
  // Discovery
  eventCommonResourceCache,
  eventCommonForgottenCache,
  eventCommonAbandonedCamp,
  eventCommonOldGrave,
  eventCommonHiddenPassage,
} from './discovery';

export {
  // Danger
  eventCommonTrap,
  eventCommonAmbush,
  eventCommonUnstableGround,
  eventCommonSuddenStorm,
  eventCommonPoisonousPlant,
} from './danger';

export {
  // Travel
  eventCommonCrossroads,
  eventCommonFord,
  eventCommonShortcut,
  eventCommonObstacle,
  eventCommonGuideOffer,
} from './travel';

export {
  // Social
  eventCommonWanderer,
  eventCommonRefugee,
  eventCommonMerchant,
  eventCommonBeggar,
  eventCommonLostChild,
} from './social';

export {
  // Environment
  eventCommonEerieSilence,
  eventCommonFallingStars,
  eventCommonDenseFog,
} from './environment';

export {
  // Treasure
  eventCommonHiddenStash,
  eventCommonOldChest,
  eventCommonLootedCaravan,
} from './treasure';

export {
  // Mystery
  eventCommonStrangeTotem,
  eventCommonWhisperingWind,
  eventCommonRuneMarking,
  eventCommonFreshTracks,
} from './mystery';

export {
  // Combat
  eventCommonHuntingPredator,
  eventCommonTerritoryGuardian,
  eventCommonNecromancerServants,
} from './combat';

export {
  // Rest
  eventCommonPeacefulGlade,
  eventCommonOldWell,
  eventCommonAbandonedShelter,
} from './rest';

export {
  // Supernatural
  eventCommonGhostlyFire,
  eventCommonTimeLoop,
  eventCommonVoiceFromDeep,
  eventCommonForgottenDeity,
} from './supernatural';

// Объединённый массив всех общих событий
export const commonEvents = [
  ...commonDiscoveryEvents,
  ...commonDangerEvents,
  ...commonTravelEvents,
  ...commonSocialEvents,
  ...commonEnvironmentEvents,
  ...commonTreasureEvents,
  ...commonMysteryEvents,
  ...commonCombatEvents,
  ...commonRestEvents,
  ...commonSupernaturalEvents,
];

// Статистика общих событий
export const commonEventsStats = {
  total: 40,
  byType: {
    positive: 11,
    negative: 9,
    neutral: 8,
    choice: 12,
  },
  byCategory: {
    discovery: 10,
    treasure: 4,
    danger: 3,
    combat: 4,
    environment: 7,
    travel: 5,
    social: 5,
    rest: 3,
  },
};

export default commonEvents;
