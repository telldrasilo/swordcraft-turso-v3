/**
 * Черновик публичного API склада A2 (roadmap пакет **2.1**).
 * Реализовано в store (подволна **2.2**): `canDebitManyFromStash` / `tryDebitManyFromStash` в `resources-slice`
 * (только `materialStash`; имя отличается от черновика, чтобы не путать с будущим единым слоем).
 * `addCatalogMaterial` → фактически `addMaterialToStash`.
 * Лавка (**2.2b**): покупка материалов — `getShopCatalogMaterialId` → `addMaterialToStash` ([`material-shop.ts`](../../data/material-shop.ts)).
 * @see docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md §11.1, §7 фаза **2.1–2.2**
 */

/** Списание нескольких позиций по каталожному id (после A2 — основной контур вместо `CraftingCost`). */
export type MaterialStashDebit = Readonly<Record<string, number>>

/**
 * Целевой контракт слоя склада (императивные имена — на усмотрение PR 2.2):
 * - начисление: расширить текущий `addMaterialToStash` / заменить разрозненные `grantResourceKeyFromWorld`;
 * - списание: единая операция по `MaterialStashDebit` с отказом при нехватке и синхронизацией ENC (`useMaterialAmount`).
 */
export interface MaterialStashOperationsDraft {
  addCatalogMaterial(materialId: string, amount: number, opts?: { markQuestItem?: boolean }): void
  /** true если хватает всех позиций на складе */
  canDebitMany(cost: MaterialStashDebit): boolean
  /** false при нехватке; при успехе применить deltas к `materialStash` и ENC */
  tryDebitMany(cost: MaterialStashDebit): boolean
}
