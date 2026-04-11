/**
 * Инвентаризация домена дерева / пилорамы (roadmap **2.3**, первая волна после плавки).
 *
 * **ResourceKey:** `wood` (вход пилорамы), `planks` (выход рецепта `wood_planks` в [`refining-recipes`](../../data/refining-recipes.ts)).
 * **Стадия руды в REFINING_INPUT_STAGE:** `wood` → `oak` (базовая древесина каталога); прочие сорта (`birch`, …) к пулу `wood`
 * через `MATERIAL_TO_RESOURCE` и `getAvailableAmountForResourceKey`.
 *
 * **Выход пилорамы в stash:** `getGrantTargetMaterialId('planks')` → `processed_wood` (`RESOURCE_GRANT_STASH_FALLBACK` в inventory-check).
 *
 * **Поведение store:** тот же контур, что плавка — `startRefiningWithResources` / `completeRefiningWithResources` в
 * [`game-store-composed`](../store/game-store-composed.ts) (`spendCraftingCostWithStash`, затем `addMaterialToStash` на выходе).
 * Отдельных правок slice для **2.3** не потребовалось (инфраструктура **2.2 подволна 1** уже покрывает горн и пилораму).
 *
 * **Ключевые точки:** [`inventory-check`](./inventory-check.ts), [`resources-slice`](../store/slices/resources-slice.ts),
 * [`material-shop`](../../data/material-shop.ts) (`birch` через `stashMaterialId`).
 */

import type { ResourceKey } from '@/store/slices/resources-slice'

/** Ключи пилорамы / деревянной цепочки в терминах `ResourceKey` и потребителей. */
export const WOOD_DOMAIN_RESOURCE_KEYS = ['wood', 'planks'] as const satisfies readonly ResourceKey[]
