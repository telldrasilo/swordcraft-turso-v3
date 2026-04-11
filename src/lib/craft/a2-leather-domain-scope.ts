/**
 * Инвентаризация домена кожи (roadmap **2.3**).
 *
 * **ResourceKey:** `leather` (единый пул рукоятей / ремонта / крафта в терминах legacy store).
 * **`materialId` → пул:** `raw_leather`, `tanned_leather`, `bull_leather`, `dragon_leather`, `hardened_leather` и мосты из
 * [`world-resource-inventory-bridge`](../materials/world-resource-inventory-bridge.ts) (`shadow_leather`, `dragon_scale`, кости и т.д.)
 * — см. [`WORLD_RESOURCE_TO_RESOURCE_KEY`](../materials/world-resource-inventory-bridge.ts) и `MATERIAL_TO_RESOURCE` в [`inventory-check`](./inventory-check.ts).
 *
 * **Начисление по ключу:** `getGrantTargetMaterialId('leather')` через `RESOURCE_GRANT_STASH_FALLBACK` → **`raw_leather`**
 * (`grantResourceKeyFromWorld` / миграция persist — в stash, не дублируем отдельно `resources.leather` при новых путях).
 *
 * **Списание:** `applyCraftingCostSpend`, `getAvailableAmountForResourceKey`, ремонт — [`repair-utils`](../store-utils/repair-utils.ts);
 * крафт v2 — `spendCraftingCostWithStash` + `inventory-check`.
 *
 * **Экспедиции / квесты:** награды с каталожным `materialId` идут в `addMaterialToStash` напрямую ([`guild-expedition-cross-slice`](../../store/cross-slice/guild-expedition-cross-slice.ts)) —
 * рассинхрона «только `resources.leather`» для новых контентных путей нет; легаси-сейвы: миграция **v4** + суммарный пул stash+resources.
 *
 * **Ремонт / перековка:** стоимости по-прежнему в `ResourceKey`; явных `materialId` в [`repair-system`](../../data/repair-system.ts) нет (**0.2** пропуск).
 */

import type { ResourceKey } from '@/store/slices/resources-slice'

export const LEATHER_DOMAIN_RESOURCE_KEYS = ['leather'] as const satisfies readonly ResourceKey[]
