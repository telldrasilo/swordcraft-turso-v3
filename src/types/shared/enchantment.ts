/**
 * Общие типы для зачарований
 * Используются в обеих системах крафта (craft.ts и craft-v2.ts)
 */

/** Зачарование на оружии */
export interface WeaponEnchantment {
  id: string
  enchantmentId: string
  appliedAt: number
}
