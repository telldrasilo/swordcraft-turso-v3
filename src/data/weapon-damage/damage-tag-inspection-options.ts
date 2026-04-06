/**
 * Варианты «осмотра» по тегу повреждения (кузнец): одна версия неверная.
 * @see docs/systems/REPAIR_UI_UX_REDESIGN_SPEC.md §2
 */

export interface DamageTagInspectionOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface DamageTagInspectionEntry {
  tagId: string
  prompt: string
  options: DamageTagInspectionOption[]
}

const ENTRIES: DamageTagInspectionEntry[] = [
  {
    tagId: 'physical_slash_chip',
    prompt: 'Что с кромкой?',
    options: [
      {
        id: 'edge_a',
        text: 'Сколы от ударов — нужна правка кромки и снятие заусенцев.',
        isCorrect: true,
      },
      {
        id: 'edge_b',
        text: 'Это следы ковки — достаточно смазать и отложить в ножны.',
        isCorrect: false,
      },
      {
        id: 'edge_c',
        text: 'Кромка растянута — требуется только перетяжка крепления.',
        isCorrect: false,
      },
    ],
  },
  {
    tagId: 'physical_loose_fitting',
    prompt: 'Что с креплением?',
    options: [
      {
        id: 'haft_a',
        text: 'Перетяжка крепления и подтяжка накладок.',
        isCorrect: true,
      },
      {
        id: 'haft_b',
        text: 'Достаточно заточить лезвие — крепление не при чём.',
        isCorrect: false,
      },
      {
        id: 'haft_c',
        text: 'Нужна полная перековка клинка в горне.',
        isCorrect: false,
      },
    ],
  },
]

const byTag = new Map(ENTRIES.map((e) => [e.tagId, e]))

export function getDamageTagInspectionEntry(tagId: string): DamageTagInspectionEntry | undefined {
  return byTag.get(tagId)
}

/** Fallback: один общий набор, если для тега нет контента */
const FALLBACK: DamageTagInspectionEntry = {
  tagId: '_fallback',
  prompt: 'Как интерпретировать повреждение?',
  options: [
    {
      id: 'fb_ok',
      text: 'Нужна адресная техника из списка ниже — не откладывать.',
      isCorrect: true,
    },
    {
      id: 'fb_no',
      text: 'Можно игнорировать до следующей экспедиции.',
      isCorrect: false,
    },
    {
      id: 'fb_mid',
      text: 'Достаточно смазать без разборки.',
      isCorrect: false,
    },
  ],
}

export function getDamageTagInspectionEntryOrFallback(tagId: string): DamageTagInspectionEntry {
  return byTag.get(tagId) ?? { ...FALLBACK, tagId }
}
