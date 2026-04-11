import { describe, expect, it } from 'vitest'
import { getMaterialProcessingTechniqueById } from '@/data/material-processing-techniques'
import { getEffectiveRefiningRecipeId } from '@/lib/craft/processing-technique-refining-bridge'

describe('getEffectiveRefiningRecipeId (phase 3.3 bridge)', () => {
  it('resolves from single processingOperation.refiningRecipeId', () => {
    const t = getMaterialProcessingTechniqueById('forge_basic_iron_smelt')
    expect(t).toBeDefined()
    if (!t) return
    expect(t.refiningRecipeId).toBeUndefined()
    expect(getEffectiveRefiningRecipeId(t)).toBe('iron_ingot')
  })

  it('resolves leather tan from processingOperations I/O ↔ stash refining recipe', () => {
    const t = getMaterialProcessingTechniqueById('forge_basic_leather_tan')
    expect(t).toBeDefined()
    if (!t) return
    expect(t.refiningRecipeId).toBeUndefined()
    expect(getEffectiveRefiningRecipeId(t)).toBe('tanned_leather_tan')
  })

  it('resolves steel smelt via operation refiningRecipeId', () => {
    const t = getMaterialProcessingTechniqueById('forge_basic_steel_smelt')
    expect(t).toBeDefined()
    if (!t) return
    expect(t.refiningRecipeId).toBeUndefined()
    expect(getEffectiveRefiningRecipeId(t)).toBe('steel_ingot')
  })

  it('resolves copper smelt via operation refiningRecipeId', () => {
    const t = getMaterialProcessingTechniqueById('forge_basic_copper_smelt')
    expect(t).toBeDefined()
    if (!t) return
    expect(t.refiningRecipeId).toBeUndefined()
    expect(getEffectiveRefiningRecipeId(t)).toBe('copper_ingot')
  })
})
