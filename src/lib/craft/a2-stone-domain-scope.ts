/**
 * Инвентаризация домена камня / карьера (roadmap **2.3**).
 *
 * **ResourceKey:** `stone` (вход карьера), `stoneBlocks` (выход рецепта `stone_blocks` в [`refining-recipes`](../../data/refining-recipes.ts)).
 * **Стадия в REFINING_INPUT_STAGE:** `stone` → `basic_stone`; прочие камни (`fieldstone`, `granite`, …) к пулу `stone` через `MATERIAL_TO_RESOURCE`.
 *
 * **Выход карьера в stash:** `getGrantTargetMaterialId('stoneBlocks')` → `processed_stone` (`RESOURCE_GRANT_STASH_FALLBACK` в inventory-check).
 *
 * **Поведение store:** `startRefiningWithResources` / `completeRefiningWithResources` в
 * [`game-store-composed`](../store/game-store-composed.ts) — как пилорама (`spendCraftingCostWithStash`, `addMaterialToStash` на выход).
 *
 * ### Начисления — те же каналы, что у плавки/дерева ([`a2-smelting-domain-scope`](./a2-smelting-domain-scope.ts))
 *
 * | Путь | Механизм | Пул |
 * |------|----------|-----|
 * | Лавка | `getShopCatalogMaterialId` → `addMaterialToStash` | `materialStash` |
 * | Экспедиции | `addMaterialToStash(materialId)` | `materialStash` |
 * | Заказы / здания / автозакупка | `grantResourceKeyFromWorld` | `getGrantTargetMaterialId` → stash |
 * | Persist `oldVersion < 4` | `migrateLegacyMaterialResourcesToStash` | перенос |
 */

import type { ResourceKey } from '@/store/slices/resources-slice'

/** Ключи карьера / каменной цепочки в терминах `ResourceKey`. */
export const STONE_DOMAIN_RESOURCE_KEYS = ['stone', 'stoneBlocks'] as const satisfies readonly ResourceKey[]
