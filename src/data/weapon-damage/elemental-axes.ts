/**
 * Оси стихий и маппинг `elemental_*` тэгов повреждений → ось.
 * Канон строк UI: docs/systems/ELEMENTAL_PLATFORM_SPEC.md §3.6
 */

/** Id оси стихии (колонка «Шрам» для элементальных повреждений в SPEC §3) */
export type ElementAxisId =
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'lightning'
  | 'frost'
  | 'poison'
  | 'corrosion'
  | 'space'
  | 'darkness'
  | 'light'
  | 'nature'
  | 'arcane'
  | 'blood'
  | 'skverna'

/** Все оси (для проверок полноты) */
export const ALL_ELEMENT_AXIS_IDS: readonly ElementAxisId[] = [
  'fire',
  'water',
  'earth',
  'air',
  'lightning',
  'frost',
  'poison',
  'corrosion',
  'space',
  'darkness',
  'light',
  'nature',
  'arcane',
  'blood',
  'skverna',
] as const

/** Тэг повреждения §3 → ось стихии */
export const ELEMENTAL_DAMAGE_TAG_TO_AXIS: Record<string, ElementAxisId> = {
  elemental_fire_scorch: 'fire',
  elemental_water_soak: 'water',
  elemental_earth_grit: 'earth',
  elemental_air_shear: 'air',
  elemental_lightning_arc: 'lightning',
  elemental_frost_bite: 'frost',
  elemental_poison_etch: 'poison',
  elemental_corrosion_rot: 'corrosion',
  elemental_space_shift: 'space',
  elemental_darkness_stain: 'darkness',
  elemental_light_sear: 'light',
  elemental_nature_bloom: 'nature',
  elemental_arcane_noise: 'arcane',
  elemental_blood_mark: 'blood',
  elemental_skverna_taint: 'skverna',
}

/** Человекочитаемые подписи осей для UI (SPEC §3.6) */
export const ELEMENTAL_AXIS_LABELS: Record<ElementAxisId, string> = {
  fire: 'Огонь',
  water: 'Вода',
  earth: 'Земля',
  air: 'Воздух',
  lightning: 'Молния',
  frost: 'Мороз',
  poison: 'Яд',
  corrosion: 'Коррозия',
  space: 'Пространство',
  darkness: 'Тьма',
  light: 'Свет',
  nature: 'Природа',
  arcane: 'Аркан',
  blood: 'Кровь',
  skverna: 'Скверна',
}

export const ALL_ELEMENTAL_DAMAGE_TAG_IDS = Object.keys(
  ELEMENTAL_DAMAGE_TAG_TO_AXIS
) as (keyof typeof ELEMENTAL_DAMAGE_TAG_TO_AXIS)[]

/**
 * Фильтр стихийных тэгов по осям локации (ELEMENTAL_PLATFORM_SPEC §3.2.1).
 * - Не-elemental тэги всегда разрешены.
 * - `presentElements === undefined` — фильтр отключён (тесты / явный opt-out).
 * - Пустой массив — все elemental_* отклоняются.
 */
export function isElementalDamageTagAllowedOnLocation(
  tagId: string,
  presentElements: ElementAxisId[] | undefined
): boolean {
  if (!tagId.startsWith('elemental_')) return true
  if (presentElements === undefined) return true
  const axis = ELEMENTAL_DAMAGE_TAG_TO_AXIS[tagId]
  if (axis === undefined) return false
  return presentElements.includes(axis)
}
