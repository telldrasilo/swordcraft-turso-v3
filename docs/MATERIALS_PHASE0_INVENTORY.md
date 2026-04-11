# Инвентаризация материалов — фаза 0

Сгенерировано (UTC): `2026-04-09T15:14:46.986Z`

Автоматический снимок для [MATERIALS_UNIFICATION_AUDIT.md](./MATERIALS_UNIFICATION_AUDIT.md). Перегенерация: `npm run materials:phase0`.

## Сводка

| Метрика | Значение |
|---------|----------|
| Узлов в library (allMaterials) | 101 |
| materialId в маппинге craft → ResourceKey | 96 |
| Сплавы ALLOY_RECIPES | 3 |
| Уникальных materialId в таблицах локаций | 68 |
| Уникальных materialId в миссиях (resources) | 45 |
| Ссылок без узла в library | 14 |

## Ссылки без MaterialNode

```
bronzeIngot
copperIngot
goldIngot
goldOre
ironIngot
mithrilIngot
planks
silverIngot
soulEssence
steelIngot
stone
stoneBlocks
tinIngot
wood
```

## ResourceKey: начисление и риски стадий (§2.7)

| key | category | grantSources | spendHints | stageViolationNotes |
|-----|----------|----------------|------------|---------------------|
| gold | currency | npc_orders_bonusItems | — | — |
| soulEssence | currency | npc_orders_bonusItems | — | — |
| wood | material_aggregate | material_shop, shop_screen_buyPackages, workers_initialBuildings_produces, adventures_bonusItems, refining_io | — | Агрегат: все породы дерева в крафте сводятся в wood; брёвна vs доски не разведены по id |
| stone | material_aggregate | material_shop, shop_screen_buyPackages, workers_initialBuildings_produces, adventures_bonusItems, refining_io | — | — |
| iron | material_aggregate | material_shop, shop_screen_buyPackages, workers_initialBuildings_produces, adventures_bonusItems, refining_io | — | Перегружен: рудник/магазин/маппинг крафта как «железо» при наличии iron_ore в каталоге (§2.7 MATERIALS_UNIFICATION_AUDIT) |
| coal | material_aggregate | material_shop, shop_screen_buyPackages, workers_initialBuildings_produces, adventures_bonusItems | weapon_recipe_or_v2_recipe_cost | — |
| copper | material_aggregate | material_shop, workers_initialBuildings_produces, adventures_bonusItems, npc_orders_bonusItems, refining_io | — | Рудники выдают сырьевой ключ; в library могут быть только *_ore узлы |
| tin | material_aggregate | material_shop, workers_initialBuildings_produces, refining_io | — | Рудники выдают сырьевой ключ; в library могут быть только *_ore узлы |
| silver | material_aggregate | material_shop, workers_initialBuildings_produces, adventures_bonusItems, npc_orders_bonusItems, refining_io | — | Рудники выдают сырьевой ключ; в library могут быть только *_ore узлы |
| goldOre | material_aggregate | material_shop, workers_initialBuildings_produces, adventures_bonusItems, refining_io | — | — |
| mithril | material_aggregate | material_shop, adventures_bonusItems, npc_orders_bonusItems, refining_io | — | — |
| ironIngot | material_aggregate | material_shop, workers_initialBuildings_produces, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| copperIngot | material_aggregate | material_shop, refining_io | — | — |
| tinIngot | material_aggregate | material_shop, refining_io | — | — |
| bronzeIngot | material_aggregate | material_shop, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| steelIngot | material_aggregate | material_shop, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| silverIngot | material_aggregate | material_shop, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| goldIngot | material_aggregate | material_shop, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| mithrilIngot | material_aggregate | material_shop, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| planks | material_aggregate | material_shop, workers_initialBuildings_produces, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| stoneBlocks | material_aggregate | material_shop, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| leather | material_aggregate | — | — | Агрегат: виды кожи в MaterialNode сводятся в один ResourceKey leather |

## Топ строк с gapFlags (до 40)

| materialId | gapFlags |
|------------|----------|
| bloodstone | expedition_loot_no_craft_resource_map |
| bronze | thin_content_heuristic |
| bronzeIngot | missing_MaterialNode_in_library |
| cold_iron_ore | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| copper_alloy | thin_content_heuristic |
| copper_ore | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| copperIngot | missing_MaterialNode_in_library |
| flint | expedition_loot_no_craft_resource_map |
| goldIngot | missing_MaterialNode_in_library |
| goldOre | missing_MaterialNode_in_library |
| iron_ore | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| ironIngot | missing_MaterialNode_in_library |
| living_ore | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| mithril_ore | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| mithrilIngot | missing_MaterialNode_in_library |
| planks | missing_MaterialNode_in_library |
| silver_ore | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| silverIngot | missing_MaterialNode_in_library |
| soulEssence | missing_MaterialNode_in_library |
| steelIngot | missing_MaterialNode_in_library |
| stone | missing_MaterialNode_in_library |
| stoneBlocks | missing_MaterialNode_in_library |
| tin_alloy | thin_content_heuristic |
| tin_ore | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| tinIngot | missing_MaterialNode_in_library |
| wood | missing_MaterialNode_in_library |

## Цепочки (эвристика + refining)

| from | to | type | note |
|------|----|----- |------|
| iron_ore | iron | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| copper_ore | copper | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| tin_ore | tin | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| silver_ore | silver | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| gold_ore | gold | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| mithril_ore | mithril | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| cold_iron_ore | cold_iron | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| living_ore | — | ore_to_metal_hint | Нет узла без суффикса _ore в library (переработка/слиток могут быть только в ResourceKey) |
| iron:3 | ironIngot:1 | refining_raw_to_refined | Железный слиток |
| copper:3 | copperIngot:1 | refining_raw_to_refined | Медный слиток |
| tin:3 | tinIngot:1 | refining_raw_to_refined | Оловянный слиток |
| copper:2+tin:1 | bronzeIngot:2 | refining_raw_to_refined | Бронзовый слиток |
| iron:4 | steelIngot:1 | refining_raw_to_refined | Стальной слиток |
| silver:3 | silverIngot:1 | refining_raw_to_refined | Серебряный слиток |
| goldOre:3 | goldIngot:1 | refining_raw_to_refined | Золотой слиток |
| mithril:2 | mithrilIngot:1 | refining_raw_to_refined | Мифриловый слиток |
| wood:2 | planks:1 | refining_raw_to_refined | Доски |
| stone:3 | stoneBlocks:1 | refining_raw_to_refined | Каменные блоки |

## Технический долг (фиксированный список)

- src/types/resources.ts: интерфейс Resources может расходиться с resources-slice (проверить leather и др.).
- Крафт materialId без узла в library: см. referencedNotInLibrary с inCraftExplicitMap.
- materialStash vs resources: начисление экспедиции не соединено со spendResources в craft-container.

## Полная таблица узлов library

| id | class | stub | expLoc | expMission | craft→Resource | alloy | enc0 | gapFlags |
|----|-------|------|--------|------------|----------------|-------|------|----------|
| acorns | organic | ok | y |  | wood |  |  |  |
| ancient_coal | other | ok | y |  | coal |  |  |  |
| ancient_metal | metal | ok | y | y | ironIngot |  |  |  |
| ancient_sap | other | ok | y | y | wood |  |  |  |
| ash | wood | ok |  |  | wood |  |  |  |
| ash_dust | organic | ok | y |  | coal |  |  |  |
| basic_stone | mineral | ok |  |  | stone |  |  |  |
| birch | wood | ok | y | y | wood |  |  |  |
| black_dust | organic | ok | y | y | coal |  |  |  |
| bloodstone | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| bog_iron | mineral | ok | y | y | iron |  |  |  |
| bones | organic | ok | y |  | leather |  |  |  |
| bronze | metal | thin |  |  | bronzeIngot |  |  | thin_content_heuristic |
| bull_leather | leather | ok |  |  | leather |  |  |  |
| clay | mineral | ok | y | y | stone |  |  |  |
| coal | other | ok | y | y | coal |  |  |  |
| cold_iron | metal | ok | y | y | ironIngot |  |  |  |
| cold_iron_ore | mineral | ok | y | y | iron |  |  | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| copper | metal | ok |  |  | copperIngot |  |  |  |
| copper_alloy | metal | thin |  |  | copperIngot |  |  | thin_content_heuristic |
| copper_ore | mineral | ok | y | y | copper |  |  | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| cryo_fungi | organic | ok | y |  | wood |  |  |  |
| decayed_bones | organic | ok | y |  | leather |  |  |  |
| deep_clay | mineral | ok | y |  | stone |  |  |  |
| depth_iron | mineral | ok | y | y | iron |  |  |  |
| depth_stone | mineral | ok | y |  | stone |  |  |  |
| dragon_bone | other | ok | y | y | leather |  |  |  |
| dragon_glass | mineral | ok | y |  | stone |  |  |  |
| dragon_leather | leather | ok |  |  | leather |  |  |  |
| dragon_scale | leather | ok | y | y | leather |  |  |  |
| dream_resin | organic | ok | y | y | wood |  |  |  |
| ebony | wood | ok |  |  | wood |  |  |  |
| echo_bark | organic | ok | y |  | wood |  |  |  |
| echo_stone | mineral | ok | y | y | stone |  |  |  |
| eternal_ice | other | ok | y |  | stone |  |  |  |
| fieldstone | mineral | ok | y |  | stone |  |  |  |
| fire_stone | mineral | ok | y | y | stone |  |  |  |
| flint | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| focusing_chalice | other | ok |  |  | — |  |  |  |
| forest_moss | organic | ok | y |  | wood |  |  |  |
| frozen_crystals | mineral | ok | y | y | stone |  |  |  |
| gold | metal | ok |  |  | goldIngot |  |  |  |
| gold_alloy | metal | ok |  |  | goldIngot |  |  |  |
| gold_ore | mineral | ok | y |  | goldOre |  |  |  |
| granite | mineral | ok |  |  | stone |  |  |  |
| hardened_leather | leather | ok |  |  | leather |  |  |  |
| heart_of_flame | other | ok | y | y | coal |  |  |  |
| heart_of_the_mountain | other | ok | y | y | stone |  |  |  |
| high_carbon_steel | metal | ok |  |  | steelIngot | y |  |  |
| iron | metal | ok |  |  | ironIngot |  |  |  |
| iron_alloy | metal | ok |  |  | ironIngot |  |  |  |
| iron_ore | mineral | ok | y | y | iron |  |  | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| ironwood | wood | ok |  |  | wood |  |  |  |
| living_ore | mineral | ok | y | y | iron |  |  | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| lunar_tuning_fork | other | ok |  |  | — |  |  |  |
| mahogany | wood | ok |  |  | wood |  |  |  |
| maple | wood | ok |  |  | wood |  |  |  |
| marble | mineral | ok |  |  | stone |  |  |  |
| memory_leaf | organic | ok | y | y | wood |  |  |  |
| mist_herbs | organic | ok | y | y | wood |  |  |  |
| mithril | metal | ok |  |  | mithrilIngot |  |  |  |
| mithril_alloy | metal | ok |  |  | mithrilIngot |  |  |  |
| mithril_ore | mineral | ok | y |  | mithril |  |  | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| moonstone_shards | mineral | ok | y | y | stone |  |  |  |
| oak | wood | ok | y | y | wood |  |  |  |
| oak_bark | organic | ok | y | y | wood |  |  |  |
| obsidian | mineral | ok | y | y | stone |  |  |  |
| peat | organic | ok | y | y | coal |  |  |  |
| pine | wood | ok | y | y | wood |  |  |  |
| pine_resin | organic | ok | y | y | wood |  |  |  |
| poison_gland | organic | ok | y | y | leather |  |  |  |
| primordial_amber | mineral | ok | y | y | stone |  |  |  |
| primordial_ice | other | ok | y | y | stone |  |  |  |
| processed_stone | mineral | ok |  |  | stoneBlocks |  |  |  |
| processed_wood | wood | ok |  |  | planks |  |  |  |
| raw_leather | leather | ok | y |  | leather |  |  |  |
| red_stone | mineral | ok | y |  | stone |  |  |  |
| resonator_matrix | other | ok |  |  | — |  |  |  |
| rotten_wood | wood | ok | y | y | wood |  |  |  |
| shadow_leather | leather | ok | y | y | leather |  |  |  |
| silver | metal | ok |  |  | silverIngot |  |  |  |
| silver_alloy | metal | ok |  |  | silverIngot | y |  |  |
| silver_bark | organic | ok | y | y | wood |  |  |  |
| silver_ore | mineral | ok | y | y | silver |  |  | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| silvered_pine | wood | ok | y |  | wood |  |  |  |
| soulforge_ember | other | ok | y |  | coal |  |  |  |
| spirit_wood | wood | ok | y | y | wood |  |  |  |
| star_metal | mineral | ok | y | y | mithril |  |  |  |
| steel | metal | ok |  |  | steelIngot | y |  |  |
| sulfur | mineral | ok | y |  | stone |  |  |  |
| swamp_moss | organic | ok | y | y | wood |  |  |  |
| tanned_leather | leather | ok |  |  | leather |  |  |  |
| tin | metal | ok |  |  | tinIngot |  |  |  |
| tin_alloy | metal | thin |  |  | tinIngot |  |  | thin_content_heuristic |
| tin_ore | mineral | ok | y | y | tin |  |  | ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk |
| toxic_moss | organic | ok | y | y | wood |  |  |  |
| void_crystal | mineral | ok | y | y | stone |  |  |  |
| volcanic_glass | mineral | ok | y | y | stone |  |  |  |
| walnut | wood | ok |  |  | wood |  |  |  |
| whisper_moss | organic | ok | y |  | wood |  |  |  |
| wild_herbs | organic | ok | y | y | wood |  |  |  |

## Строки вне library (орфаны)

- **bronzeIngot** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **copperIngot** — grant: refining_recipe; spend: refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **goldIngot** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **goldOre** — grant: adventures_bonusItems, refining_recipe; spend: refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **ironIngot** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **mithrilIngot** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **planks** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **silverIngot** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **soulEssence** — grant: npc_orders_bonusItems; spend: —; missing_MaterialNode_in_library
- **steelIngot** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **stone** — grant: adventures_bonusItems, refining_recipe; spend: refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **stoneBlocks** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **tinIngot** — grant: refining_recipe; spend: refining_io, material_shop_or_shop_screen; missing_MaterialNode_in_library
- **wood** — grant: adventures_bonusItems, refining_recipe; spend: refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
