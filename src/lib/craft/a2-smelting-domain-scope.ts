/**
 * Инвентаризация домена плавки / металлической цепочки (roadmap **2.2**, подволна 1).
 * Источник правды по id: `REFINING_INPUT_STAGE_MATERIAL_ID` в `src/data/refining-recipes.ts`,
 * `getGrantTargetMaterialId` в `inventory-check.ts`, `RESOURCE_GRANT_STASH_FALLBACK`.
 *
 * **ResourceKey** сырья/топлива в рецептах: `iron`, `copper`, `tin`, `silver`, `goldOre`, `mithril`, `wood`, `stone`, `coal`;
 * выходы: `ironIngot` … `mithrilIngot`, `planks`, `stoneBlocks`.
 *
 * **Ключевые точки в коде**
 * - [`game-store-composed`](../store/game-store-composed.ts): `startRefiningWithResources`, `completeRefiningWithResources`
 * - [`inventory-check`](./inventory-check.ts): `applyCraftingCostSpend`, `getAvailableAmountForResourceKey`, `getRefiningCraftingCost`
 * - [`resources-slice`](../store/slices/resources-slice.ts): `spendCraftingCostWithStash`, `canDebitManyFromStash` / `tryDebitManyFromStash` (только `materialStash`)
 * - UI / ремонт: читают оба пула через `getAvailableAmountForResourceKey` (`src/lib/store-utils/repair-utils.ts`)
 *
 * **Мост до снятия `ResourceKey`:** `resources.*` и `materialStash` остаются согласованными через `spendCraftingCostWithStash`;
 * зачисление продукта плавки — канонически `addMaterialToStash(catalogId)` при наличии маппинга.
 *
 * ### Начисления (подволна **2.2b**) — куда пишет игра
 *
 * | Путь | Механизм | Пул |
 * |------|----------|-----|
 * | Лавка (покупка) | `getShopCatalogMaterialId` → `addMaterialToStash` | `materialStash` |
 * | Экспедиции (награды) | `addMaterialToStash(materialId)` по `adjustedMaterialGrants` | `materialStash` |
 * | Заказы NPC (bonusItems) | `grantResourceKeyFromWorld` | `getGrantTargetMaterialId` → stash или `addResource` |
 * | Здания / тик | `grantResourceKeyFromWorld(building.produces)` | то же |
 * | Крафт v2 автозакупка / докупка | `grantResourceKeyFromWorld` | то же |
 * | Ремонт (возврат строки) | `grantResourceKeyFromWorld` | то же |
 * | Persist migrate `oldVersion < 4` | `migrateLegacyMaterialResourcesToStash` | перенос в stash, обнуление legacy ключей |
 *
 * Явные `stashMaterialId` в [`material-shop`](../../data/material-shop.ts) дублируют правило `getGrantTargetMaterialId` для читаемости лавки.
 */

import type { ResourceKey } from '@/store/slices/resources-slice'

/** Ключи, участвующие в `refining-recipes` / горне (сырьё, топливо, доски/блоки). */
export const SMELTING_CHAIN_RESOURCE_KEYS = [
  'iron',
  'copper',
  'tin',
  'silver',
  'goldOre',
  'mithril',
  'coal',
  'wood',
  'stone',
  'ironIngot',
  'copperIngot',
  'tinIngot',
  'bronzeIngot',
  'steelIngot',
  'silverIngot',
  'goldIngot',
  'mithrilIngot',
  'planks',
  'stoneBlocks',
] as const satisfies readonly ResourceKey[]
