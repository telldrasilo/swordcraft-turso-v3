/**
 * Мост добываемых id (`library/{ores,fuels,...}/`) → ключи склада (`ResourceKey`).
 *
 * Ресурсы экспедиций с тем же `identity.id`, что в соответствующих файлах библиотеки, после дропа попадают
 * в `materialStash`. Без записи здесь (и слияния в `MATERIAL_TO_RESOURCE` в inventory-check) они
 * не участвуют в плавке, крафте v2 и лавке — «есть в ENC, нельзя потратить».
 *
 * Правила:
 * - Слияние: мост, затем ядро — **ядро перекрывает** коллизии `materialId` (пересечение CORE∩WORLD должно быть пустым, волна **2.4**).
 * - Роль из `buildWorldNode` (`WorldResourceRole`) — ориентир; финальное решение по геймплею в этой таблице.
 * - Остальные добываемые `organic` / `gem` / `special` — TD-INV-2 ([`ENC_TD_INV2_WAVE_TABLE.md`](../../../docs/data/ENC_TD_INV2_WAVE_TABLE.md) в репо).
 *
 * При добавлении нового world-resource с добычей в экспедиции: по возможности дополнить эту карту
 * и строку в `docs/RESOURCE_TRANSFORMATION_MAP.md`.
 */

import type { ResourceKey } from '@/store/slices/resources-slice'

export const WORLD_RESOURCE_TO_RESOURCE_KEY: Record<string, ResourceKey> = {
  // --- Канонические руды каталога (волна **2.4g**): раньше в `CORE_MATERIAL_TO_RESOURCE` ---
  iron_ore: 'iron',
  copper_ore: 'copper',
  tin_ore: 'tin',
  silver_ore: 'silver',
  gold_ore: 'goldOre',
  mithril_ore: 'mithril',

  // --- Базовые металлы / слитковые стадии каталога (волна **2.4g**)
  iron: 'ironIngot',
  cold_iron: 'ironIngot',
  copper: 'copperIngot',
  tin: 'tinIngot',
  silver: 'silverIngot',
  gold: 'goldIngot',
  mithril: 'mithrilIngot',

  // --- Сплавы и промежуточные стадии каталога (волна **2.4h**): раньше в `CORE_MATERIAL_TO_RESOURCE` ---
  steel: 'steelIngot',
  high_carbon_steel: 'steelIngot',
  iron_alloy: 'ironIngot',
  copper_alloy: 'copperIngot',
  tin_alloy: 'tinIngot',
  bronze: 'bronzeIngot',
  silver_alloy: 'silverIngot',
  gold_alloy: 'goldIngot',
  mithril_alloy: 'mithrilIngot',
  processed_wood: 'planks',
  processed_stone: 'stoneBlocks',

  // --- Руды (альтернативы `iron_ore` / редкая руда) ---
  bog_iron: 'iron',
  depth_iron: 'iron',
  cold_iron_ore: 'iron',
  living_ore: 'iron',
  /** Метеоритное сырьё → тот же пул, что `mithril_ore`, для выплавки мифрила */
  star_metal: 'mithril',

  // --- Металл как находка (не горн): слитокоподобный лом → пул слитка ---
  ancient_metal: 'ironIngot',

  // --- Древесина (варианты брёвен) ---
  /** Основные породы каталога (волна **2.4d**): раньше в `CORE_MATERIAL_TO_RESOURCE`, перенесены в мост без смены ключа */
  ash: 'wood',
  birch: 'wood',
  ebony: 'wood',
  ironwood: 'wood',
  mahogany: 'wood',
  maple: 'wood',
  oak: 'wood',
  pine: 'wood',
  walnut: 'wood',
  rotten_wood: 'wood',
  spirit_wood: 'wood',
  silvered_pine: 'wood',

  // --- Камень / минералы без отдельного «самоцветного» ключа ---
  /** Основные породы/камни каталожной библиотеки (волна **2.4e**): раньше в `CORE_MATERIAL_TO_RESOURCE`; `processed_stone` — волна **2.4h** (`stoneBlocks`). */
  basic_stone: 'stone',
  fieldstone: 'stone',
  granite: 'stone',
  marble: 'stone',
  obsidian: 'stone',
  red_stone: 'stone',
  clay: 'stone',
  deep_clay: 'stone',
  depth_stone: 'stone',
  sulfur: 'stone',

  // --- Кожа / чешуя ---
  shadow_leather: 'leather',
  dragon_scale: 'leather',

  /** Торф (`tags: fuel`) → тот же пул, что уголь, для плавки */
  peat: 'coal',

  // --- Уголь каталога (волна **2.4f**): раньше в `CORE_MATERIAL_TO_RESOURCE` ---
  coal: 'coal',
  ancient_coal: 'coal',

  // --- Кожа каталога (варианты пула `leather`, волна **2.4f**) ---
  raw_leather: 'leather',
  tanned_leather: 'leather',
  bull_leather: 'leather',
  dragon_leather: 'leather',
  hardened_leather: 'leather',

  // --- TD-INV-2: волна W1 (кора / смола / мох → пул wood) ---
  acorns: 'wood',
  dream_resin: 'wood',
  echo_bark: 'wood',
  forest_moss: 'wood',
  oak_bark: 'wood',
  pine_resin: 'wood',
  silver_bark: 'wood',
  swamp_moss: 'wood',
  toxic_moss: 'wood',
  whisper_moss: 'wood',

  // --- TD-INV-2: волна W2 (пыль → coal; кости/железы → leather; травы/гриб → wood) ---
  ash_dust: 'coal',
  black_dust: 'coal',
  bones: 'leather',
  cryo_fungi: 'wood',
  decayed_bones: 'leather',
  memory_leaf: 'wood',
  mist_herbs: 'wood',
  poison_gland: 'leather',
  wild_herbs: 'wood',

  // --- TD-INV-2: волна W3 (gems → stone pool) ---
  dragon_glass: 'stone',
  echo_stone: 'stone',
  fire_stone: 'stone',
  frozen_crystals: 'stone',
  moonstone_shards: 'stone',
  primordial_amber: 'stone',
  void_crystal: 'stone',
  volcanic_glass: 'stone',

  // --- TD-INV-2: волна W4 (special) ---
  ancient_sap: 'wood',
  dragon_bone: 'leather',
  eternal_ice: 'stone',
  heart_of_flame: 'coal',
  heart_of_the_mountain: 'stone',
  primordial_ice: 'stone',
  soulforge_ember: 'coal',
}
