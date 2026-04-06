/**
 * Пост-миссия: видимые теги повреждений по снимкам событий модуля экспедиций.
 * Число прочности задаёт только калькулятор v2 (`weaponWear` → addWarSoulToWeapon);
 * события `damage_weapon` в данных события дают только семантику тегов, без второго списания прочности.
 */

import { getEventById } from '@/modules/expeditions'
import type { EventTemplate } from '@/modules/expeditions/data/events/_event-template'
import { getDamageTagsForEventTemplate } from '@/data/weapon-damage/event-template-to-damage-tags'
import {
  eventResolutionSeedForSnapshot,
  getEffectsForEventResolution,
} from '@/lib/expedition-event-loot'
import {
  isElementalDamageTagAllowedOnLocation,
  type ElementAxisId,
} from '@/data/weapon-damage/elemental-axes'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'
import type { WeaponDamageSeverity } from '@/types/weapon-damage'
import type { ModuleExpeditionEventSnapshot } from '@/lib/expedition-module-events-host'

/** Пороги тяжести по одному числу износа за миссию (1–50). */
export function weaponWearToSeverity(weaponWear: number): WeaponDamageSeverity {
  const w = Math.max(0, weaponWear)
  if (w <= 12) return 'light'
  if (w <= 25) return 'moderate'
  return 'heavy'
}

function effectsHaveDamageWeapon(effects: EventTemplate['effects'] | undefined): boolean {
  if (!effects?.length) return false
  return effects.some((e) => e.type === 'damage_weapon')
}

/**
 * Теги, если в эффектах, релевантных исходу, есть `damage_weapon`.
 * Без `eventResolutionSeed` — только основные `effects` (обратная совместимость с тестами).
 * С сидом — тот же выбор ветки `choices`, что у `getEffectsForEventResolution` / превью лута.
 */
export function eventTemplateQualifiesForWeaponDamageTags(
  template: EventTemplate,
  eventResolutionSeed?: number
): boolean {
  const effects =
    eventResolutionSeed !== undefined
      ? getEffectsForEventResolution(template, eventResolutionSeed)
      : template.effects
  return effectsHaveDamageWeapon(effects)
}

export interface BuildMissionDamageTagsInput {
  snapshots: ModuleExpeditionEventSnapshot[]
  /** Итоговый износ за миссию из `calculateExpeditionResultV2` (уже с модификаторами). */
  weaponWear: number
  completedAtMs: number
  /**
   * Оси стихий локации. Пустой массив — все `elemental_*` отфильтровываются.
   * `undefined` — не фильтровать по стихиям (тесты / явный opt-out).
   */
  presentElements?: ElementAxisId[]
  /**
   * Время старта активной экспедиции; с `snapshot.order` задаёт сид резолва `choices`
   * (как при генерации миссии). Без поля — квалификация только по основным `effects`.
   */
  expeditionStartedAtMs?: number
}

/**
 * Собирает новые записи для `activeDamageTags` (их потом дописывают к оружию).
 * Один снимок — один проход по карте тегов для `templateId`.
 */
export function buildActiveDamageTagsFromMissionSnapshots(
  input: BuildMissionDamageTagsInput
): ActiveDamageTagEntry[] {
  const { snapshots, weaponWear, completedAtMs, presentElements, expeditionStartedAtMs } = input
  if (!snapshots.length) return []

  const severity = weaponWearToSeverity(weaponWear)
  const sorted = [...snapshots].sort((a, b) => a.order - b.order || a.triggerOffsetSec - b.triggerOffsetSec)

  const out: ActiveDamageTagEntry[] = []
  const seenInstance = new Set<string>()

  for (const snap of sorted) {
    if (seenInstance.has(snap.instanceId)) continue
    seenInstance.add(snap.instanceId)

    const tpl = getEventById(snap.templateId)
    const resolutionSeed =
      expeditionStartedAtMs !== undefined
        ? eventResolutionSeedForSnapshot(expeditionStartedAtMs, snap.order)
        : undefined
    if (!tpl || !eventTemplateQualifiesForWeaponDamageTags(tpl, resolutionSeed)) continue

    const mapping = getDamageTagsForEventTemplate(snap.templateId)
    if (!mapping?.tagIds?.length) continue

    for (const tagId of mapping.tagIds) {
      if (!isElementalDamageTagAllowedOnLocation(tagId, presentElements)) continue
      out.push({
        tagId,
        severity,
        sourceEventTemplateId: snap.templateId,
        appliedAt: completedAtMs,
      })
    }
  }

  return out
}
