import { describe, expect, it } from 'vitest'
import { buildAfterAltarPhase1ArchivistMessage } from '@/lib/quests/ff-after-altar-phase1-archivist-message'

describe('buildAfterAltarPhase1ArchivistMessage', () => {
  it('when all phase II techniques present, says can start phase II', () => {
    const text = buildAfterAltarPhase1ArchivistMessage(['folded_steel', 'double_hardening'])
    expect(text).toContain('Фундамент готов')
    expect(text).toMatch(/фазу II|фазы II/i)
    expect(text).toContain('на месте')
    expect(text).not.toContain('интендант')
  })

  it('when techniques missing, mentions intendant and green checkmarks', () => {
    const text = buildAfterAltarPhase1ArchivistMessage([])
    expect(text).toContain('Фундамент готов')
    expect(text).toContain('интендант')
    expect(text).toContain('зел')
    expect(text).toMatch(/Складывание|складывани/i)
  })

  it('when only double hardening missing, names it', () => {
    const text = buildAfterAltarPhase1ArchivistMessage(['folded_steel'])
    expect(text).toContain('Двойная закалка')
    expect(text).toContain('Пока не хватает')
  })
})
