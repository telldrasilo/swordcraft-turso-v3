# Инвентаризация материалов — фаза 0

Сгенерировано (UTC): `2026-04-01T16:31:20.029Z`

Автоматический снимок для [MATERIALS_UNIFICATION_AUDIT.md](./MATERIALS_UNIFICATION_AUDIT.md). Перегенерация: `npm run materials:phase0`.

## Сводка

| Метрика | Значение |
|---------|----------|
| Узлов в library (allMaterials) | 80 |
| materialId в маппинге craft → ResourceKey | 36 |
| Сплавы ALLOY_RECIPES | 3 |
| Уникальных materialId в таблицах локаций | 68 |
| Уникальных materialId в миссиях (resources) | 45 |
| Ссылок без узла в library | 32 |

## Ссылки без MaterialNode

```
basic_stone
bronze
bronzeIngot
copper
copperIngot
copper_alloy
gold
goldIngot
goldOre
gold_alloy
hardened_leather
ironIngot
iron_alloy
mahogany
maple
marble
mithrilIngot
mithril_alloy
planks
processed_stone
processed_wood
silver
silverIngot
soulEssence
steelIngot
stone
stoneBlocks
tin
tinIngot
tin_alloy
walnut
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
| ironIngot | material_aggregate | workers_initialBuildings_produces, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| copperIngot | material_aggregate | refining_io | — | — |
| tinIngot | material_aggregate | refining_io | — | — |
| bronzeIngot | material_aggregate | refining_io | weapon_recipe_or_v2_recipe_cost | — |
| steelIngot | material_aggregate | refining_io | weapon_recipe_or_v2_recipe_cost | — |
| silverIngot | material_aggregate | refining_io | weapon_recipe_or_v2_recipe_cost | — |
| goldIngot | material_aggregate | refining_io | weapon_recipe_or_v2_recipe_cost | — |
| mithrilIngot | material_aggregate | refining_io | weapon_recipe_or_v2_recipe_cost | — |
| planks | material_aggregate | material_shop, workers_initialBuildings_produces, refining_io | weapon_recipe_or_v2_recipe_cost | — |
| stoneBlocks | material_aggregate | refining_io | weapon_recipe_or_v2_recipe_cost | — |
| leather | material_aggregate | — | — | Агрегат: виды кожи в MaterialNode сводятся в один ResourceKey leather |

## Топ строк с gapFlags (до 40)

| materialId | gapFlags |
|------------|----------|
| acorns | expedition_loot_no_craft_resource_map |
| ancient_coal | expedition_loot_no_craft_resource_map |
| ancient_metal | expedition_loot_no_craft_resource_map |
| ancient_sap | expedition_loot_no_craft_resource_map |
| ash_dust | expedition_loot_no_craft_resource_map |
| basic_stone | missing_MaterialNode_in_library |
| black_dust | expedition_loot_no_craft_resource_map |
| bloodstone | expedition_loot_no_craft_resource_map |
| bog_iron | expedition_loot_no_craft_resource_map |
| bones | expedition_loot_no_craft_resource_map |
| bronze | missing_MaterialNode_in_library |
| bronzeIngot | missing_MaterialNode_in_library |
| clay | expedition_loot_no_craft_resource_map |
| coal | expedition_loot_no_craft_resource_map |
| cold_iron_ore | expedition_loot_no_craft_resource_map |
| copper | missing_MaterialNode_in_library |
| copper_alloy | missing_MaterialNode_in_library |
| copper_ore | expedition_loot_no_craft_resource_map |
| copperIngot | missing_MaterialNode_in_library |
| cryo_fungi | expedition_loot_no_craft_resource_map |
| decayed_bones | expedition_loot_no_craft_resource_map |
| deep_clay | expedition_loot_no_craft_resource_map |
| depth_iron | expedition_loot_no_craft_resource_map |
| depth_stone | expedition_loot_no_craft_resource_map |
| dragon_bone | expedition_loot_no_craft_resource_map |
| dragon_glass | expedition_loot_no_craft_resource_map |
| dragon_scale | expedition_loot_no_craft_resource_map |
| dream_resin | expedition_loot_no_craft_resource_map |
| echo_bark | expedition_loot_no_craft_resource_map |
| echo_stone | expedition_loot_no_craft_resource_map |
| eternal_ice | expedition_loot_no_craft_resource_map |
| fieldstone | expedition_loot_no_craft_resource_map |
| fire_stone | expedition_loot_no_craft_resource_map |
| flint | expedition_loot_no_craft_resource_map |
| forest_moss | expedition_loot_no_craft_resource_map |
| frozen_crystals | expedition_loot_no_craft_resource_map |
| gold | missing_MaterialNode_in_library |
| gold_alloy | missing_MaterialNode_in_library |
| gold_ore | expedition_loot_no_craft_resource_map |
| goldIngot | missing_MaterialNode_in_library |

## Цепочки (эвристика + refining)

| from | to | type | note |
|------|----|----- |------|
| iron_ore | iron | ore_to_metal_hint | По именованию id: руда → металл в каталоге |
| copper_ore | — | ore_to_metal_hint | Нет узла без суффикса _ore в library (переработка/слиток могут быть только в ResourceKey) |
| tin_ore | — | ore_to_metal_hint | Нет узла без суффикса _ore в library (переработка/слиток могут быть только в ResourceKey) |
| silver_ore | — | ore_to_metal_hint | Нет узла без суффикса _ore в library (переработка/слиток могут быть только в ResourceKey) |
| gold_ore | — | ore_to_metal_hint | Нет узла без суффикса _ore в library (переработка/слиток могут быть только в ResourceKey) |
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
| acorns | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| ancient_coal | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| ancient_metal | metal | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| ancient_sap | other | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| ash | wood | ok |  |  | wood |  |  |  |
| ash_dust | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| birch | wood | ok | y | y | wood |  | y |  |
| black_dust | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| bloodstone | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| bog_iron | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| bones | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| bull_leather | leather | ok |  |  | leather |  |  |  |
| clay | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| coal | mineral | ok | y | y | — |  | y | expedition_loot_no_craft_resource_map |
| cold_iron | metal | ok | y | y | iron |  |  |  |
| cold_iron_ore | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| copper_ore | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| cryo_fungi | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| decayed_bones | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| deep_clay | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| depth_iron | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| depth_stone | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| dragon_bone | other | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| dragon_glass | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| dragon_leather | leather | ok |  |  | leather |  |  |  |
| dragon_scale | leather | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| dream_resin | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| ebony | wood | ok |  |  | wood |  |  |  |
| echo_bark | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| echo_stone | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| eternal_ice | other | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| fieldstone | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| fire_stone | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| flint | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| forest_moss | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| frozen_crystals | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| gold_ore | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| granite | mineral | ok |  |  | stone |  |  |  |
| heart_of_flame | other | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| heart_of_the_mountain | other | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| high_carbon_steel | metal | ok |  |  | steelIngot | y |  |  |
| iron | metal | ok |  |  | iron |  | y |  |
| iron_ore | mineral | ok | y | y | — |  | y | expedition_loot_no_craft_resource_map |
| ironwood | wood | ok |  |  | wood |  |  |  |
| living_ore | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| memory_leaf | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| mist_herbs | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| mithril | metal | ok |  |  | mithril |  |  |  |
| mithril_ore | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| moonstone_shards | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| oak | wood | ok | y | y | wood |  | y |  |
| oak_bark | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| obsidian | mineral | ok | y | y | stone |  |  |  |
| peat | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| pine | wood | ok | y | y | wood |  |  |  |
| pine_resin | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| poison_gland | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| primordial_amber | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| primordial_ice | other | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| raw_leather | leather | ok | y |  | leather |  | y |  |
| red_stone | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| rotten_wood | wood | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| shadow_leather | leather | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| silver_alloy | metal | ok |  |  | silverIngot | y |  |  |
| silver_bark | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| silver_ore | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| silvered_pine | wood | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| soulforge_ember | other | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| spirit_wood | wood | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| star_metal | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| steel | metal | ok |  |  | steelIngot | y |  |  |
| sulfur | mineral | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| swamp_moss | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| tanned_leather | leather | ok |  |  | leather |  | y |  |
| tin_ore | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| toxic_moss | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| void_crystal | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| volcanic_glass | mineral | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |
| whisper_moss | organic | ok | y |  | — |  |  | expedition_loot_no_craft_resource_map |
| wild_herbs | organic | ok | y | y | — |  |  | expedition_loot_no_craft_resource_map |

## Строки вне library (орфаны)

- **basic_stone** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **bronze** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **bronzeIngot** — grant: refining_recipe; spend: recipe_cost, refining_io; missing_MaterialNode_in_library
- **copper** — grant: adventures_bonusItems, npc_orders_bonusItems, refining_recipe; spend: craft_v2_MATERIAL_TO_RESOURCE, refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **copper_alloy** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **copperIngot** — grant: refining_recipe; spend: refining_io; missing_MaterialNode_in_library
- **gold** — grant: npc_orders_bonusItems; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **gold_alloy** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **goldIngot** — grant: refining_recipe; spend: recipe_cost, refining_io; missing_MaterialNode_in_library
- **goldOre** — grant: adventures_bonusItems, refining_recipe; spend: refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **hardened_leather** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **iron_alloy** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **ironIngot** — grant: refining_recipe; spend: recipe_cost, refining_io, workers_produce; missing_MaterialNode_in_library
- **mahogany** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **maple** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **marble** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **mithril_alloy** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **mithrilIngot** — grant: refining_recipe; spend: recipe_cost, refining_io; missing_MaterialNode_in_library
- **planks** — grant: refining_recipe; spend: recipe_cost, refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **processed_stone** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **processed_wood** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **silver** — grant: adventures_bonusItems, npc_orders_bonusItems, refining_recipe; spend: craft_v2_MATERIAL_TO_RESOURCE, refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **silverIngot** — grant: refining_recipe; spend: recipe_cost, refining_io; missing_MaterialNode_in_library
- **soulEssence** — grant: npc_orders_bonusItems; spend: —; missing_MaterialNode_in_library
- **steelIngot** — grant: refining_recipe; spend: recipe_cost, refining_io; missing_MaterialNode_in_library
- **stone** — grant: adventures_bonusItems, refining_recipe; spend: refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **stoneBlocks** — grant: refining_recipe; spend: recipe_cost, refining_io; missing_MaterialNode_in_library
- **tin** — grant: refining_recipe; spend: craft_v2_MATERIAL_TO_RESOURCE, refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
- **tin_alloy** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **tinIngot** — grant: refining_recipe; spend: refining_io; missing_MaterialNode_in_library
- **walnut** — grant: —; spend: craft_v2_MATERIAL_TO_RESOURCE; missing_MaterialNode_in_library
- **wood** — grant: adventures_bonusItems, refining_recipe; spend: refining_io, material_shop_or_shop_screen, workers_produce; missing_MaterialNode_in_library
