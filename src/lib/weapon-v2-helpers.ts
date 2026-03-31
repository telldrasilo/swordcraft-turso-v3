import type { CraftedWeaponV2 } from '@/types/craft-v2'

/** Отображаемое имя оружия v2 */
export function weaponDisplayName(w: CraftedWeaponV2): string {
  return w.fullName
}

/** Атака оружия v2 (для карточек и порогов заказов/экспедиций) */
export function weaponAttack(w: CraftedWeaponV2): number {
  return w.stats.attack
}
