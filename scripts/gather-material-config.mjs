/**
 * Общий конфиг: порядок `worldResourceNodes` и папка для каждого gatherable id.
 * Используется `refresh-gather-library.mjs` и `split-world-resource-nodes.mjs`.
 */

/** Порядок экспорта в `world-resource-nodes.ts` (стабильность списка / сохранения). */
export const GATHER_MATERIAL_ORDER = [
  'coal',
  'red_stone',
  'clay',
  'oak_bark',
  'acorns',
  'forest_moss',
  'wild_herbs',
  'peat',
  'bones',
  'swamp_moss',
  'mist_herbs',
  'pine',
  'pine_resin',
  'silver_bark',
  'moonstone_shards',
  'silvered_pine',
  'silver_ore',
  'gold_ore',
  'mithril_ore',
  'deep_clay',
  'ancient_coal',
  'echo_stone',
  'black_dust',
  'depth_iron',
  'bog_iron',
  'rotten_wood',
  'poison_gland',
  'decayed_bones',
  'shadow_leather',
  'toxic_moss',
  'cold_iron_ore',
  'eternal_ice',
  'frozen_crystals',
  'cryo_fungi',
  'primordial_ice',
  'volcanic_glass',
  'ash_dust',
  'sulfur',
  'fire_stone',
  'primordial_amber',
  'spirit_wood',
  'whisper_moss',
  'echo_bark',
  'memory_leaf',
  'dream_resin',
  'ancient_sap',
  'dragon_bone',
  'dragon_scale',
  'star_metal',
  'dragon_glass',
  'heart_of_flame',
  'void_crystal',
  'soulforge_ember',
  'depth_stone',
  'ancient_metal',
  'living_ore',
  'heart_of_the_mountain',
]

/** id → подпапка `library/<folder>/`. */
export const GATHER_ID_TO_FOLDER = Object.fromEntries(
  [
    ['ores', ['bog_iron', 'depth_iron', 'cold_iron_ore', 'living_ore', 'star_metal', 'silver_ore', 'gold_ore', 'mithril_ore']],
    ['metals', ['ancient_metal']],
    ['woods', ['pine', 'silvered_pine', 'spirit_wood', 'rotten_wood']],
    ['stones', ['red_stone', 'clay', 'deep_clay', 'depth_stone', 'sulfur']],
    ['fuels', ['coal', 'ancient_coal', 'peat']],
    ['leathers', ['shadow_leather', 'dragon_scale']],
    [
      'gems',
      [
        'echo_stone',
        'moonstone_shards',
        'frozen_crystals',
        'fire_stone',
        'primordial_amber',
        'volcanic_glass',
        'dragon_glass',
        'void_crystal',
      ],
    ],
    [
      'organics',
      [
        'oak_bark',
        'acorns',
        'forest_moss',
        'wild_herbs',
        'bones',
        'swamp_moss',
        'mist_herbs',
        'pine_resin',
        'silver_bark',
        'poison_gland',
        'decayed_bones',
        'toxic_moss',
        'cryo_fungi',
        'whisper_moss',
        'echo_bark',
        'memory_leaf',
        'dream_resin',
        'black_dust',
        'ash_dust',
      ],
    ],
    [
      'special',
      ['eternal_ice', 'primordial_ice', 'ancient_sap', 'dragon_bone', 'heart_of_flame', 'soulforge_ember', 'heart_of_the_mountain'],
    ],
  ].flatMap(([folder, ids]) => ids.map((id) => [id, folder]))
)

export const GATHER_FOLDERS = ['ores', 'metals', 'woods', 'stones', 'fuels', 'leathers', 'gems', 'organics', 'special']

export function gatherFolderForId(id) {
  const folder = GATHER_ID_TO_FOLDER[id]
  if (!folder) throw new Error(`gather-material-config: unknown id "${id}" — добавьте в GATHER_ID_TO_FOLDER и GATHER_MATERIAL_ORDER`)
  return folder
}
