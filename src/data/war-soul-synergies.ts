/**
 * Синергии Soul Potential: комбинации материалов по частям оружия.
 * @see docs/systems/WAR_SOUL_CONCEPT_AND_FORECAST.md §5.3
 */

export interface WarSoulSynergyRule {
  id: string
  name: string
  bonus: number
  note: string
  /** Проверка по id материала на части (undefined = не проверяется). */
  test: (
    parts: Partial<Record<'blade' | 'guard' | 'grip' | 'pommel', string>>,
    cats: Partial<Record<'blade' | 'guard' | 'grip' | 'pommel', string>>
  ) => boolean
}

function has(
  parts: Partial<Record<'blade' | 'guard' | 'grip' | 'pommel', string>>,
  part: 'blade' | 'guard' | 'grip' | 'pommel',
  ids: string[]
): boolean {
  const m = parts[part]
  return m !== undefined && ids.includes(m)
}

function isMetalOrAlloy(cat: string | undefined): boolean {
  return cat === 'metal' || cat === 'alloy'
}

export const WAR_SOUL_SYNERGY_RULES: WarSoulSynergyRule[] = [
  {
    id: 'soul_pair_iron_oak',
    name: 'Железо и дубовая рукоять',
    bonus: 0.08,
    note: 'Клинок из железа, рукоять из дуба — базовая стабильная связка.',
    test: (parts) =>
      has(parts, 'blade', ['iron', 'iron_alloy']) && has(parts, 'grip', ['oak']),
  },
  {
    id: 'soul_pair_steel_ash',
    name: 'Сталь и ясень',
    bonus: 0.11,
    note: 'Стальной клинок и ясеневая рукоять — упругий отклик души.',
    test: (parts) => has(parts, 'blade', ['steel']) && has(parts, 'grip', ['ash']),
  },
  {
    id: 'soul_pair_silver_ebony',
    name: 'Серебряный сплав и эбен',
    bonus: 0.14,
    note: 'Серебро на режущей части/гарде и тёмное дерево на хвате.',
    test: (parts) =>
      (has(parts, 'blade', ['silver_alloy']) || has(parts, 'guard', ['silver_alloy'])) &&
      has(parts, 'grip', ['ebony']),
  },
  {
    id: 'soul_pair_mithril_dragon_leather',
    name: 'Мифрил и драконья кожа',
    bonus: 0.22,
    note: 'Легендарный металл и кожа — максимальный канал без третьего компонента.',
    test: (parts) =>
      has(parts, 'blade', ['mithril', 'mithril_alloy']) &&
      has(parts, 'grip', ['dragon_leather']),
  },
  {
    id: 'soul_pair_coldiron_bull',
    name: 'Холодное железо и бычья кожа',
    bonus: 0.09,
    note: 'Упорный металл и плотная кожа — «держит» душу без излишней магии.',
    test: (parts) =>
      has(parts, 'blade', ['cold_iron']) && has(parts, 'grip', ['bull_leather']),
  },
  {
    id: 'soul_pair_obsidian_tanned',
    name: 'Обсидиан и выделанная кожа',
    bonus: 0.1,
    note: 'Рискованный клинок с мягким, предсказуемым хватом.',
    test: (parts) =>
      has(parts, 'blade', ['obsidian']) && has(parts, 'grip', ['tanned_leather']),
  },
  {
    id: 'soul_core_bloodstone',
    name: 'Кровавик в навершии',
    bonus: 0.12,
    note: 'Фокус на навершии и металлическом клинке.',
    test: (parts, cats) =>
      has(parts, 'pommel', ['bloodstone']) && isMetalOrAlloy(cats.blade),
  },
  {
    id: 'soul_core_granite_ironwood',
    name: 'Гранит и железное дерево',
    bonus: 0.1,
    note: 'Тяжёлый контроль баланса: камень снизу, «железная» древесина в рукояти.',
    test: (parts) =>
      has(parts, 'pommel', ['granite']) && has(parts, 'grip', ['ironwood']),
  },
  {
    id: 'soul_triad_arcane',
    name: 'Триада: серебро, кровавик, эбен',
    bonus: 0.2,
    note: 'Серебро на клинке и гарде, кровавик в навершии, эбен в рукояти.',
    test: (parts) =>
      has(parts, 'blade', ['silver_alloy']) &&
      has(parts, 'guard', ['silver_alloy']) &&
      has(parts, 'pommel', ['bloodstone']) &&
      has(parts, 'grip', ['ebony']),
  },
  {
    id: 'soul_triad_legendary',
    name: 'Триада легендарных материалов',
    bonus: 0.28,
    note: 'Мифрил, драконья кожа и кровавик — полный резонанс.',
    test: (parts) =>
      has(parts, 'blade', ['mithril', 'mithril_alloy']) &&
      has(parts, 'grip', ['dragon_leather']) &&
      has(parts, 'pommel', ['bloodstone']),
  },
]
