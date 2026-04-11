/**
 * Аудит dual-path **2.4** ([`MATERIALS_SINGLE_SOURCE_ROADMAP`](../../../docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md)):
 * `resources[ResourceKey]` vs `materialStash[materialId]` через [`inventory-check`](./inventory-check.ts).
 *
 * **Миграция persist:** `STORE_VERSION` **30** в `game-store-composed.ts` повторно вызывает
 * `migrateLegacyMaterialResourcesToStash` (идемпотентно добивает хвосты `resources.*` после волн **2.2–2.3**).
 *
 * ### Черновик: ключи с каталожным начислением (не валюта)
 *
 * Пулы **A2 доменов** (см. `a2-*-domain-scope.ts`): `iron`, `copper`, `tin`, `silver`, `goldOre`, `mithril`,
 * `coal`, `wood`, `stone`, слитки, `planks`, `stoneBlocks`, `leather` — для каждого выставлен
 * `getGrantTargetMaterialId` → stash при `grantResourceKeyFromWorld`; лавка — `addMaterialToStash`;
 * экспедиции — `materialId` в stash.
 *
 * **Всё ещё dual-path намеренно:** read/write идут через `getAvailableAmountForResourceKey` и `applyCraftingCostSpend`
 * (stash затем resources) до полного снятия полей `resources.*` в целевом A2 (**§11.1**).
 *
 * ### Сужение **2.4d** (породы древесины)
 *
 * Id `birch` … `mahogany` (брёвна) перенесены из **`CORE_MATERIAL_TO_RESOURCE`** в
 * [`WORLD_RESOURCE_TO_RESOURCE_KEY`](../materials/world-resource-inventory-bridge.ts); `processed_wood` остаётся в ядре (`planks`).
 *
 * ### Сужение **2.4e** (каталожный строительный камень)
 *
 * Id `basic_stone`, `fieldstone`, `granite`, `marble`, `obsidian` перенесены в мост (`stone`);
 * **`processed_stone`** остаётся в ядре (`stoneBlocks`).
 *
 * ### Сужение **2.4f** (уголь каталога + кожевенные стадии каталога)
 *
 * Id `coal`, `ancient_coal` и `raw_leather`, `tanned_leather`, `bull_leather`, `dragon_leather`, `hardened_leather` перенесены в
 * [`WORLD_RESOURCE_TO_RESOURCE_KEY`](../materials/world-resource-inventory-bridge.ts) (`coal` / `leather`); ядро не дублирует эти строки.
 *
 * ### Сужение **2.4g** (канонические руды + базовые металлы каталога)
 *
 * Id `iron_ore`, `copper_ore`, `tin_ore`, `silver_ore`, `gold_ore`, `mithril_ore` и базовые `iron`, `cold_iron`, `copper`, `tin`, `silver`, `gold`, `mithril`
 * перенесены в [`WORLD_RESOURCE_TO_RESOURCE_KEY`](../materials/world-resource-inventory-bridge.ts).
 *
 * ### Сужение **2.4h** (сплавы + промежуточные `processed_*`)
 *
 * `steel`, `high_carbon_steel`, слитковые `*_alloy`, `bronze`, **`processed_wood`**, **`processed_stone`** перенесены из [`CORE_MATERIAL_TO_RESOURCE`](./inventory-check.ts) в **WORLD** с теми же `ResourceKey`. Ядро **`CORE_MATERIAL_TO_RESOURCE`** пустое; **`ALLOY_RECIPES`** остаётся в `inventory-check` для раскрытия стоимости сплавов.
 *
 * ### Итог **2.4** по маппингу (состояние репозитория)
 *
 * Все materialId с маппингом на пулы крафта лежат в [`WORLD_RESOURCE_TO_RESOURCE_KEY`](../materials/world-resource-inventory-bridge.ts) либо в редком **CORE** (сейчас **пусто**). Пересечение **CORE∩WORLD** по `materialId` должно быть пустым ([`getInventoryCheckCoreWorldKeyOverlap`](./inventory-check.ts)).
 *
 * ### Мост **5.+** (устаревший pick-сегмент удалён)
 *
 * Узлы **`hardened_leather`**, **`basic_stone`**, **`marble`**, **`processed_stone`**, **`maple`**, **`walnut`**, **`mahogany`**, **`processed_wood`** — полноценные файлы в [`library/leathers`](../../../data/materials/library/leathers), [`library/stones`](../../../data/materials/library/stones), [`library/woods`](../../../data/materials/library/woods), **`material-registry-core`**. Каталог **`library/bridge/`** и **`registry-segment-bridge.ts`** удалены; плейсхолдер **`registryBridgeMaterialNodes`** снят с манифеста ([`material-registry-satellites.ts`](../../../data/materials/library/material-registry-satellites.ts)).
 *
 * ### Stash-only пулы (**2.4** хвост)
 *
 * Ключ **`coal`**: учёт доступности и списания только через `materialStash` (каталожные id пула угля), не через `resources.coal` — [`A2_STASH_ONLY_RESOURCE_KEYS`](./a2-stash-only-pools.ts), миграция persist **31**.
 *
 * ### Кандидаты на последующее сужение маппинга (отдельный PR)
 *
 * - Таблицы в `inventory-check` без удаления строк до зелёных тестов + отчёта **§8.2**.
 * - Явные **`catalogMaterialSpendIds`**: реестр перековки ([`reforge-techniques-registry`](../../../data/reforge/reforge-techniques-registry.ts)) для контракта **0.2**; ремонт по-прежнему в основном из **`CraftingCost`** / ключей пула.
 *
 * ### Кто ещё пишет в `resources` по ключам материалов (аудит **2.4c**, не исчерпывающе)
 *
 * - **`addResource`** ([`resources-slice`](../../../store/slices/resources-slice.ts)) — прямой инкремент `resources[key]`; для A2-ключей вызывать только если **`getGrantTargetMaterialId` === null** (валюта) или пока не переведён вызывающий код.
 * - **`grantResourceKeyFromWorld`** — канал A2: при наличии `getGrantTargetMaterialId` пишет в **`materialStash`**, иначе fallback на **`addResource`**.
 * - **Экспедиции** ([`guild-expedition-cross-slice`](../../../store/cross-slice/guild-expedition-cross-slice.ts)): награды — **`addMaterialToStash(materialId)`**; золото — `addResource('gold', …)`.
 * - **Заказы** ([`order-cross-slice`](../../../store/cross-slice/order-cross-slice.ts)): бонус-предметы с ключом в `resources` — **`grantResourceKeyFromWorld`**; золото/слава — отдельно.
 * - **Производство зданий / крафт UI** ([`use-game-loop`](../../../hooks/use-game-loop.ts), [`craft-container`](../../../components/forge/craft-v2/craft-container.tsx)): начисления — **`grantResourceKeyFromWorld`**.
 * - **Вылазки** ([`dungeons-screen`](../../../components/screens/dungeons-screen.tsx)): бонусы ресурсов — **`grantResourceKeyFromWorld`** (единый путь с заказами).
 * - **Возврат при отмене изучения материала** ([`material-study-refund`](../materials/material-study-refund.ts)): **`grantResourceKeyFromWorld`** по `ResourceKey` маппинга (не сырой `addResource`).
 * - **Тесты** и dev-хуки могут вызывать `addResource('coal', …)` для старых цепочек — не игровой путь.
 *
 * @packageDocumentation
 */

/** Плейсхолдер-маркер для импорта модуля в документах/графах зависимостей (нет рантайм-логики). */
export const A2_PHASE24_AUDIT_MODULE = true
