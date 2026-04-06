/**
 * Карта: id шаблона события экспедиции → видимые теги повреждений.
 * Используется при записи на оружие после миссии (`expedition-post-mission-damage`).
 *
 * Новая строка: только данные; если нужны новые поля на `CraftedWeaponV2` / persist — см. `STORE_VERSION` и `cloud-save-feature.ts`.
 * События с `damage_weapon` — grep по `src/modules/expeditions/data/events`.
 */

/** Опционально: скрытый маркер при крите ремонта (фаза 3+) */
export interface EventDamageTagMapping {
  tagIds: string[]
  /** Заготовка: id для `weaponLegacy.hiddenMarks` при крите починки */
  hiddenMarkOnCrit?: string
}

export const EVENT_TEMPLATE_TO_DAMAGE_TAGS: Record<string, EventDamageTagMapping> = {
  event_common_obstacle: { tagIds: ['physical_slash_chip'] },
  event_common_trap: { tagIds: ['physical_slash_chip', 'physical_loose_fitting'] },
  event_common_unstable_ground: { tagIds: ['physical_loose_fitting'] },
  event_common_hunting_predator: { tagIds: ['physical_gouge_chunk'] },
  event_common_territory_guardian: { tagIds: ['physical_bend_warp'] },
  event_oak_boar_charge: { tagIds: ['physical_blunt_dull'] },
  event_mine_cave_in: { tagIds: ['physical_crack_fissure'] },
  event_forgotten_cave_in: { tagIds: ['physical_impact_dent'] },
  event_rotten_glass_reeds: { tagIds: ['physical_puncture_gouge'] },
  event_misty_swollen_haft: { tagIds: ['physical_handle_split'] },

  event_oak_spore_nature: { tagIds: ['elemental_nature_bloom'] },
  event_oak_gust_air: { tagIds: ['elemental_air_shear'] },
  event_red_forge_spark: { tagIds: ['elemental_fire_scorch'] },
  event_red_tunnel_grit: { tagIds: ['elemental_earth_grit'] },
  event_red_shaft_draft: { tagIds: ['elemental_air_shear'] },
  event_misty_bog_water: { tagIds: ['elemental_water_soak'] },
  event_misty_shadow_stain: { tagIds: ['elemental_darkness_stain'] },
  event_silver_moon_sear: { tagIds: ['elemental_light_sear'] },
  event_silver_storm_tine: { tagIds: ['elemental_lightning_arc'] },
  event_forgotten_earth_grit: { tagIds: ['elemental_earth_grit'] },
  event_forgotten_echo_dark: { tagIds: ['elemental_darkness_stain'] },
  event_rotten_bile_poison: { tagIds: ['elemental_poison_etch'] },
  event_rotten_acid_corrosion: { tagIds: ['elemental_corrosion_rot'] },
  event_frost_rime_edge: { tagIds: ['elemental_frost_bite'] },
  event_whisper_arcane_surge: { tagIds: ['elemental_arcane_noise'] },
  event_dragon_blood_arena: { tagIds: ['elemental_blood_mark'] },
  event_depths_fold_blade: { tagIds: ['elemental_space_shift'] },
  event_depths_skverna_film: { tagIds: ['elemental_skverna_taint'] },

  event_ash_cinder_scorch: { tagIds: ['elemental_fire_scorch'] },
  event_ash_storm_shear: { tagIds: ['elemental_air_shear'] },
  event_ash_fissure_grit: { tagIds: ['elemental_earth_grit'] },
  event_whisper_root_nature: { tagIds: ['elemental_nature_bloom'] },
  event_dragon_lightning_fork: { tagIds: ['elemental_lightning_arc'] },
}

export function getDamageTagsForEventTemplate(templateId: string): EventDamageTagMapping | undefined {
  return EVENT_TEMPLATE_TO_DAMAGE_TAGS[templateId]
}
