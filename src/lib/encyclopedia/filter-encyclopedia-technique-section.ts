import type {
  EncyclopediaTechniqueCardModel,
  EncyclopediaTechniqueSectionModel,
} from '@/types/encyclopedia-techniques'

export function techniqueMatchesQuery(model: EncyclopediaTechniqueCardModel, q: string): boolean {
  if (!q) return true
  const n = q.toLowerCase()
  if (model.name.toLowerCase().includes(n)) return true
  if (model.ref.id.toLowerCase().includes(n)) return true
  for (const row of model.summaryRows) {
    if (row.label.toLowerCase().includes(n) || row.value.toLowerCase().includes(n)) return true
  }
  if (model.description.toLowerCase().includes(n)) return true
  return false
}

/** Оставляет только элементы секции, совпадающие с запросом (пустой запрос — все элементы). */
export function filterSectionItemsByQuery(
  section: EncyclopediaTechniqueSectionModel,
  q: string,
): EncyclopediaTechniqueSectionModel {
  const trimmed = q.trim()
  if (!trimmed) return section
  return {
    ...section,
    items: section.items.filter(m => techniqueMatchesQuery(m, trimmed)),
  }
}
