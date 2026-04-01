/**
 * Хост: генерация событий экспедиции через модуль expeditions + маппинг в ExpeditionEvent UI.
 */

import type { ExpeditionEvent, ExpeditionEventType } from '@/types/expedition-events'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { EventCategory } from '@/modules/expeditions/data/events/_event-template'
import {
  generateEventsForMission,
  getEventById,
  getLocationById,
  getMissionById,
} from '@/modules/expeditions'
import type { Location } from '@/modules/expeditions/types'
import type { GeneratedEvent } from '@/modules/expeditions/data/events/_event-template'
import { getRouteDurationSeconds } from '@/lib/expedition-contract-economy'
import { resolveTemplateLoot } from '@/lib/expedition-event-loot'

/** Сериализуемый снимок события модуля в persist / завершение экспедиции */
export interface ModuleExpeditionEventSnapshot {
  instanceId: string
  templateId: string
  /** Секунды от старта миссии (как в GeneratedEvent) */
  triggerOffsetSec: number
  order: number
  status: GeneratedEvent['status']
}

export interface ExpeditionStartEventsResult {
  events: ExpeditionEvent[]
  moduleEventSnapshots: ModuleExpeditionEventSnapshot[]
  locationId?: string
  missionTemplateId?: string
  contractType: 'exploration' | 'speed'
}

function emptyExpeditionStart(contractType: ExpeditionStartEventsResult['contractType']): ExpeditionStartEventsResult {
  return {
    events: [],
    moduleEventSnapshots: [],
    contractType,
  }
}

function categoryToHostEventType(category: EventCategory): ExpeditionEventType {
  const map: Record<EventCategory, ExpeditionEventType> = {
    combat: 'combat',
    discovery: 'discovery',
    travel: 'travel',
    social: 'social',
    environment: 'weather',
    treasure: 'treasure',
    danger: 'danger',
    rest: 'rest',
  }
  return map[category]
}

function generatedToHostEvent(
  ge: GeneratedEvent,
  startedAtMs: number
): ExpeditionEvent | null {
  const tpl = getEventById(ge.templateId)
  if (!tpl) return null

  return {
    id: tpl.id,
    text: tpl.title ? `${tpl.title}\n${tpl.description}` : tpl.description,
    type: categoryToHostEventType(tpl.category),
    icon: tpl.icon,
    conditions: {},
    weight: tpl.weight,
    instanceId: ge.instanceId,
    triggeredAt: startedAtMs + ge.triggeredAt * 1000,
    order: ge.order,
  }
}

/**
 * События при старте: при наличии миссии и локации в модуле — `generateEventsForMission`, иначе пустой график.
 */
export function buildExpeditionStartEvents(
  expedition: ExpeditionTemplate,
  startedAtMs: number
): ExpeditionStartEventsResult {
  const missionId = expedition.moduleMissionId ?? expedition.id
  const mission = getMissionById(missionId)
  const contractType = expedition.moduleContractType ?? 'exploration'

  if (!mission) {
    return emptyExpeditionStart(contractType)
  }

  const location = getLocationById(mission.locationId)
  if (!location) {
    return emptyExpeditionStart(contractType)
  }

  const seed = Math.floor(startedAtMs % 2147483647)
  const routeDurationSeconds = getRouteDurationSeconds(expedition.duration, contractType)
  const generated = generateEventsForMission({
    mission,
    location,
    contractType,
    seed,
    routeDurationSeconds,
  })

  const events: ExpeditionEvent[] = []
  const moduleEventSnapshots: ModuleExpeditionEventSnapshot[] = []

  for (const ge of generated) {
    const host = generatedToHostEvent(ge, startedAtMs)
    if (host) events.push(host)
    moduleEventSnapshots.push({
      instanceId: ge.instanceId,
      templateId: ge.templateId,
      triggerOffsetSec: ge.triggeredAt,
      order: ge.order,
      status: ge.status,
    })
  }

  return {
    events,
    moduleEventSnapshots,
    locationId: mission.locationId,
    missionTemplateId: mission.id,
    contractType,
  }
}

export interface ResolvedModuleExpeditionBonuses {
  successChanceDelta: number
  bonusGold: number
  /** Материалы для открытия в энциклопедии (grant_material / локационный лут) */
  discoveredMaterialIds: string[]
  /** Найденные материалы с количеством (до множителей договора и отладки) */
  materialGrants: Array<{ materialId: string; quantity: number }>
}

/**
 * Агрегирует эффекты событий (включая детерминированный выбор для choice-событий).
 */
export function aggregateModuleEventEffectsForCompletion(
  snapshots: ModuleExpeditionEventSnapshot[],
  location: Location,
  seedBase: number
): ResolvedModuleExpeditionBonuses {
  let successChanceDelta = 0
  let bonusGold = 0
  const materialGrants: Array<{ materialId: string; quantity: number }> = []

  for (const snap of snapshots) {
    const tpl = getEventById(snap.templateId)
    const loot = resolveTemplateLoot(tpl, location, seedBase + snap.order)
    successChanceDelta += loot.successChanceDelta
    bonusGold += loot.bonusGold
    materialGrants.push(...loot.materialGrants)
  }

  const discoveredMaterialIds = [...new Set(materialGrants.map((g) => g.materialId))]

  return { successChanceDelta, bonusGold, discoveredMaterialIds, materialGrants }
}
