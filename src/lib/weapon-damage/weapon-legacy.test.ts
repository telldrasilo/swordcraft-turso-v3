import { describe, expect, it } from 'vitest'
import {
  appendHiddenMark,
  collectDeepInspectSnapshotFromTags,
  emptyWeaponLegacy,
  ensureWeaponLegacy,
  REPAIR_LEGACY_RESONANCE_ID,
} from './weapon-legacy'

describe('weapon-legacy', () => {
  it('ensureWeaponLegacy нормализует hiddenMarks', () => {
    expect(ensureWeaponLegacy(undefined).hiddenMarks).toEqual([])
    expect(ensureWeaponLegacy({ hiddenMarks: ['a', 1 as unknown as string] }).hiddenMarks).toEqual(['a'])
  })

  it('appendHiddenMark не дублирует id', () => {
    const a = emptyWeaponLegacy()
    const b = appendHiddenMark(a, REPAIR_LEGACY_RESONANCE_ID)
    const c = appendHiddenMark(b, REPAIR_LEGACY_RESONANCE_ID)
    expect(c.hiddenMarks).toEqual([REPAIR_LEGACY_RESONANCE_ID])
    expect(b.hiddenMarks).toEqual([REPAIR_LEGACY_RESONANCE_ID])
  })

  it('collectDeepInspectSnapshotFromTags собирает подсказки и id', () => {
    const { notes, tagIds } = collectDeepInspectSnapshotFromTags([
      { tagId: 'physical_slash_chip', severity: 'light' },
    ])
    expect(tagIds).toEqual(['physical_slash_chip'])
    expect(notes.length).toBeGreaterThan(0)
  })
})
