/**
 * Снимок dual-path A2 для отчёта roadmap **§8.2** (пакет «инвентаризация»): какие пулы
 * `ResourceKey` связаны с каталожными `materialId` через мост и как читается запас.
 *
 * **Факт по коду:** `getAvailableAmountForResourceKey` / `applyCraftingCostSpend` суммируют
 * `materialStash` (по маппингу) и `resources[key]`, кроме ключей из
 * [`A2_STASH_ONLY_RESOURCE_KEYS`](./a2-stash-only-pools.ts) — там учёт только stash (волна **2.4** хвост).
 *
 * Начисления из игры для каталожных материалов — в основном `grantResourceKeyFromWorld` /
 * `addMaterialToStash`; прямой `addResource` по материальным ключам — вне канона (тесты / dev).
 *
 * @packageDocumentation
 */

import type { ResourceKey } from '@/store/slices/resources-slice'
import { WORLD_RESOURCE_TO_RESOURCE_KEY } from '@/lib/materials/world-resource-inventory-bridge'

/** Уникальные `ResourceKey`, на которые маппится хотя бы один каталожный `materialId` в WORLD-мосте. */
export function collectWorldBridgeMaterialPoolKeys(): ResourceKey[] {
  const set = new Set<ResourceKey>()
  for (const rk of Object.values(WORLD_RESOURCE_TO_RESOURCE_KEY)) {
    set.add(rk)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

/** Ключи персиста, не являющиеся пулами WORLD-моста (валюта / особые). */
export const RESOURCE_KEYS_EXCLUDED_FROM_WORLD_MATERIAL_BRIDGE: readonly ResourceKey[] = [
  'gold',
  'soulEssence',
]
