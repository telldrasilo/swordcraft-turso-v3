/**
 * Контракт: у всех явных микрозадач в реестрах энциклопедии задан непустой стабильный `id`,
 * без дублей внутри одной техники (глобальные коллизии ловим глазами при ревью; стор — составной ключ).
 */

import { describe, expect, it } from 'vitest'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { allTechniques } from '@/data/techniques'

const ID_RE = /^[a-z][a-z0-9_]*$/

describe('technique microTasks catalog contract', () => {
  it('каждая microTask у combat Technique имеет id и уникальна внутри техники', () => {
    for (const t of allTechniques) {
      const tasks = t.microTasks
      if (!tasks?.length) continue
      const seen = new Set<string>()
      for (const m of tasks) {
        expect(m.id, `${t.id}: microTask id`).toMatch(ID_RE)
        expect(seen.has(m.id), `${t.id}: duplicate microTask id ${m.id}`).toBe(false)
        seen.add(m.id)
      }
    }
  })

  it('каждая microTask у material processing имеет id и уникальна внутри техники', () => {
    for (const t of allMaterialProcessingTechniques) {
      const tasks = t.microTasks
      if (!tasks?.length) continue
      const seen = new Set<string>()
      for (const m of tasks) {
        expect(m.id, `${t.id}: microTask id`).toMatch(ID_RE)
        expect(seen.has(m.id), `${t.id}: duplicate microTask id ${m.id}`).toBe(false)
        seen.add(m.id)
      }
    }
  })
})
