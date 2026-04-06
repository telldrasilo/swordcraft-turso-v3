/**
 * Явные смысловые вклады materialId × процесс (приоритет над эвристиками).
 * Формат: только `facets`; остальные поля вклада добавятся по мере фаз C–D.
 *
 * Пилот после переноса каталога: см. docs/MATERIAL_SEMANTIC_PROCESS_ROLES.md §6.2
 */

import type { MaterialProcessFacet, MaterialProcessKind } from '@/types/materials/material-process'

export type MaterialProcessOverrideBlock = {
  facets: MaterialProcessFacet[]
  /** Только для `refining_smelting` с рудой; см. `MaterialRefiningSmeltingParams` */
  oreChargeEfficiency?: number
}

export type MaterialProcessOverrideMap = Partial<
  Record<string, Partial<Record<MaterialProcessKind, MaterialProcessOverrideBlock>>>
>

export const MATERIAL_PROCESS_OVERRIDES: MaterialProcessOverrideMap = {
  /**
   * Фаза A крафта: абстрактные каталожные id мапятся на слиток в кузне, но целевая стадия части —
   * `iron_alloy` / `mithril_alloy` (stash). В селекторе части эти id скрыты (пустой вклад в weapon_craft_v2).
   */
  iron: {
    weapon_craft_v2: { facets: [] },
  },
  mithril: {
    weapon_craft_v2: { facets: [] },
  },

  /** Канонические руды ядра — тот же смысл, что у альтернативных id в библиотеке добычи */
  iron_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 1 },
  },
  copper_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 1 },
  },
  tin_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 1 },
  },
  silver_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 1 },
  },
  gold_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 1 },
  },
  mithril_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 1 },
  },

  coal: {
    refining_smelting: { facets: ['smelt_fuel'] },
  },
  ancient_coal: {
    refining_smelting: { facets: ['smelt_fuel'] },
  },
  peat: {
    refining_smelting: { facets: ['smelt_fuel'] },
  },
  bog_iron: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 0.88 },
  },
  depth_iron: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 0.92 },
  },
  cold_iron_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 0.9 },
  },
  living_ore: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 0.86 },
  },
  star_metal: {
    refining_smelting: { facets: ['smelt_ore_charge'], oreChargeEfficiency: 0.94 },
  },

  /** Волна D: явная фиксация ролей моста (доски всё так же weapon_body_wood по классу). */
  pine: {
    weapon_craft_v2: { facets: ['weapon_body_wood'] },
  },
  rotten_wood: {
    weapon_craft_v2: { facets: ['weapon_body_wood'] },
  },
  spirit_wood: {
    weapon_craft_v2: { facets: ['weapon_body_wood'] },
  },
  silvered_pine: {
    weapon_craft_v2: { facets: ['weapon_body_wood'] },
  },
  ancient_metal: {
    weapon_craft_v2: { facets: ['weapon_body_metal'] },
  },
  shadow_leather: {
    weapon_craft_v2: { facets: ['weapon_grip_leather'] },
  },

  /** TD-INV-2 + TD-SEM-4: мост → wood pool, роль тела как у вариантов древесины (волна D). */
  acorns: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  ancient_sap: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  cryo_fungi: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  dream_resin: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  echo_bark: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  forest_moss: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  memory_leaf: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  mist_herbs: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  oak_bark: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  pine_resin: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  silver_bark: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  swamp_moss: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  toxic_moss: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  whisper_moss: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },
  wild_herbs: { weapon_craft_v2: { facets: ['weapon_body_wood'] } },

  /** TD-INV-2: пул leather / кости и аналоги — хват. */
  bones: { weapon_craft_v2: { facets: ['weapon_grip_leather'] } },
  decayed_bones: { weapon_craft_v2: { facets: ['weapon_grip_leather'] } },
  dragon_bone: { weapon_craft_v2: { facets: ['weapon_grip_leather'] } },
  poison_gland: { weapon_craft_v2: { facets: ['weapon_grip_leather'] } },

  /** TD-INV-2: маппинг на coal без тега `fuel` в пресете — явное топливо горна. */
  ash_dust: { refining_smelting: { facets: ['smelt_fuel'] } },
  black_dust: { refining_smelting: { facets: ['smelt_fuel'] } },
  heart_of_flame: { refining_smelting: { facets: ['smelt_fuel'] } },
  soulforge_ember: { refining_smelting: { facets: ['smelt_fuel'] } },

  /** TD-INV-2: special → stone pool, класс `other` без эвристики — тело минеральной части. */
  eternal_ice: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  heart_of_the_mountain: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  primordial_ice: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },

  /** Хвост A: явные роли каталожных камней для частей `stone` / рецептов с минеральной головкой. */
  granite: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  obsidian: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  bloodstone: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  fieldstone: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  flint: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },

  /**
   * Фаза D (аудит §4.1 / MATERIAL_SEMANTIC §6.2): явные `weapon_craft_v2` для камней/гемов/чешуи моста
   * (`ancient_sap` и пр. wood-пул — уже в блоке TD-INV-2 выше).
   */
  clay: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  deep_clay: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  depth_stone: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  red_stone: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  sulfur: { weapon_craft_v2: { facets: ['weapon_body_mineral'] } },
  dragon_glass: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
  dragon_scale: { weapon_craft_v2: { facets: ['weapon_grip_leather'] } },
  echo_stone: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
  fire_stone: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
  frozen_crystals: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
  moonstone_shards: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
  primordial_amber: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
  void_crystal: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
  volcanic_glass: { weapon_craft_v2: { facets: ['weapon_inlay_gem'] } },
}
