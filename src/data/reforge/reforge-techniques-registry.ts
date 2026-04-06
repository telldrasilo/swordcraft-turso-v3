/**
 * Реестр техник перековки (пре-алтарь, фаза 1).
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE1.md
 */

export type ReforgeTechniqueType = 'buffStat' | 'awakenScar'

/** Базовые — с начала; specialized — интендант и/или техника обработки в кузне (двойной путь). */
export type ReforgeTechniqueTier = 'basic' | 'specialized'

export interface ReforgeTechniqueEntry {
  id: string
  name: string
  description: string
  reforgeType: ReforgeTechniqueType
  /** Базовые доступны без покупки у интенданта; specialized — см. `isReforgeTechniqueUnlocked`. */
  reforgeTier: ReforgeTechniqueTier
  /**
   * Для `buffStat`: фиксированная стоимость души за применение.
   * Для `awakenScar` при `awakenSpendsAllWarSoul`: не используется — списывается вся текущая душа (§3.2 канона).
   */
  warSoulCost: number
  minGuildLevel: number
  /** Опционально: разблокировка при изученной технике обработки материалов. */
  sourceCraftTechniqueId?: string
  /** Для buffStat */
  buffStat?: 'attack' | 'maxDurability'
  /** Диапазон случайной прибавки % к атаке/max прочности от базового снимка (§3.4). */
  buffPercentMin?: number
  buffPercentMax?: number
  /** Устар.: фиксированный % на стак, если min/max не заданы. */
  buffPercentPerStack?: number
  maxStacks?: number
  /** Для awakenScar: списать всю текущую душу на попытку. */
  awakenSpendsAllWarSoul?: boolean
  /** Для awakenScar: базовый шанс до модификаторов от тира/пула. */
  awakenBaseChance?: number
}

const T_BASIC: ReforgeTechniqueTier = 'basic'
const T_SPEC: ReforgeTechniqueTier = 'specialized'

export const REFORGE_TECHNIQUES: ReforgeTechniqueEntry[] = [
  {
    id: 'reforge_buff_attack_01',
    name: 'Подточка духа клинка',
    description: 'Случайная прибавка к атаке в диапазоне (от базового снимка клинка). Доступна с начала.',
    reforgeType: 'buffStat',
    reforgeTier: T_BASIC,
    warSoulCost: 5_000,
    minGuildLevel: 1,
    buffStat: 'attack',
    buffPercentMin: 1,
    buffPercentMax: 4,
    maxStacks: 5,
  },
  {
    id: 'reforge_buff_max_durability_01',
    name: 'Укрепление полотна',
    description: 'Случайная прибавка к максимальной прочности в диапазоне. Доступна с начала.',
    reforgeType: 'buffStat',
    reforgeTier: T_BASIC,
    warSoulCost: 4_500,
    minGuildLevel: 1,
    buffStat: 'maxDurability',
    buffPercentMin: 1,
    buffPercentMax: 4,
    maxStacks: 5,
  },
  {
    id: 'reforge_buff_attack_02',
    name: 'Правка кромки',
    description:
      'Более глубокая работа с кромкой после освоения тщательной плавки. Выше стоимость и диапазон бонуса.',
    reforgeType: 'buffStat',
    reforgeTier: T_SPEC,
    warSoulCost: 8_000,
    minGuildLevel: 1,
    sourceCraftTechniqueId: 'forge_fine_iron_smelt',
    buffStat: 'attack',
    buffPercentMin: 2,
    buffPercentMax: 5,
    maxStacks: 5,
  },
  {
    id: 'reforge_buff_max_durability_02',
    name: 'Стальная стабильность',
    description:
      'Укрепление полотна по мотивам стальной закалки; требует доступа к плавке стали в кузне.',
    reforgeType: 'buffStat',
    reforgeTier: T_SPEC,
    warSoulCost: 7_500,
    minGuildLevel: 1,
    sourceCraftTechniqueId: 'forge_basic_steel_smelt',
    buffStat: 'maxDurability',
    buffPercentMin: 2,
    buffPercentMax: 5,
    maxStacks: 5,
  },
  {
    id: 'reforge_awaken_scar_01',
    name: 'Пробуждение шрама',
    description:
      'Тратит всю душу войны на клинке; шанс пробудить один случайный шрам. Нужны гильдия с доступом к tier-2 локациям и опыт тщательной плавки. Фаза 1: не более одного успеха на экземпляр.',
    reforgeType: 'awakenScar',
    reforgeTier: T_SPEC,
    warSoulCost: 0,
    minGuildLevel: 3,
    sourceCraftTechniqueId: 'forge_fine_iron_smelt',
    awakenSpendsAllWarSoul: true,
    awakenBaseChance: 0.12,
  },
]

const byId = new Map<string, ReforgeTechniqueEntry>(
  REFORGE_TECHNIQUES.map((t) => [t.id, t])
)

export function getReforgeTechniqueById(id: string): ReforgeTechniqueEntry | undefined {
  return byId.get(id)
}
