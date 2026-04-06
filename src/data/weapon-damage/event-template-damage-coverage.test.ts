import { describe, expect, it } from 'vitest'
import { EVENT_REGISTRY } from '@/modules/expeditions/data/events'
import { getDamageTagsForEventTemplate } from './event-template-to-damage-tags'

/**
 * Батч 6 плана локаций: у каждого шаблона, где в данных есть `damage_weapon`
 * (в основных эффектах или в любой ветке `choices`), есть маппинг на теги.
 */
describe('EVENT_TEMPLATE_TO_DAMAGE_TAGS покрывает шаблоны с damage_weapon', () => {
  it('все такие шаблоны из EVENT_REGISTRY имеют запись маппинга', () => {
    const missing: string[] = []
    for (const ev of EVENT_REGISTRY) {
      const inMain = ev.effects?.some((e) => e.type === 'damage_weapon')
      const inChoice = ev.choices?.some((ch) =>
        ch.effects?.some((e) => e.type === 'damage_weapon')
      )
      if (!inMain && !inChoice) continue
      const m = getDamageTagsForEventTemplate(ev.id)
      if (!m?.tagIds?.length) missing.push(ev.id)
    }
    expect(missing, `Нет маппинга для: ${missing.join(', ')}`).toEqual([])
  })
})
