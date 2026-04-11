import { describe, expect, it } from 'vitest'
import { buildEncyclopediaTechniqueSections } from '@/lib/encyclopedia/encyclopedia-technique-sections'
import {
  filterSectionItemsByQuery,
  techniqueMatchesQuery,
} from '@/lib/encyclopedia/filter-encyclopedia-technique-section'

describe('filter encyclopedia technique section (ENC P2d)', () => {
  it('empty query keeps all items in section', () => {
    const sections = buildEncyclopediaTechniqueSections()
    const craft = sections.find(s => s.sectionId === 'craft')
    expect(craft).toBeDefined()
    if (!craft) return
    const filtered = filterSectionItemsByQuery(craft, '')
    expect(filtered.items).toHaveLength(craft.items.length)
  })

  it('filters active section only: craft by partial id', () => {
    const sections = buildEncyclopediaTechniqueSections()
    const craft = sections.find(s => s.sectionId === 'craft')
    expect(craft).toBeDefined()
    if (!craft) return
    const filtered = filterSectionItemsByQuery(craft, 'basic_forging')
    expect(filtered.items).toHaveLength(1)
    expect(filtered.items[0]?.ref.id).toBe('basic_forging')
  })

  it('techniqueMatchesQuery is used consistently', () => {
    const sections = buildEncyclopediaTechniqueSections()
    const one = sections.flatMap(s => s.items)[0]
    expect(one).toBeDefined()
    if (!one) return
    expect(techniqueMatchesQuery(one, one.name.slice(0, 3))).toBe(true)
    expect(techniqueMatchesQuery(one, '__no_such_token_xyz__')).toBe(false)
  })
})
