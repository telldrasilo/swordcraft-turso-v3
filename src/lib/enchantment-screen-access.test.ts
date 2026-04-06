import { describe, expect, it } from 'vitest'
import {
  canAccessEnchantmentAltarScreen,
  canUseEnchantmentAltarContent,
} from '@/lib/enchantment-screen-access'

describe('canUseEnchantmentAltarContent', () => {
  it('requires tier-2, blueprint quest, and built node', () => {
    const gl = 3
    expect(canAccessEnchantmentAltarScreen(gl)).toBe(true)
    expect(canUseEnchantmentAltarContent(gl, true, true)).toBe(true)
    expect(canUseEnchantmentAltarContent(gl, true, false)).toBe(false)
    expect(canUseEnchantmentAltarContent(gl, false, true)).toBe(false)
    expect(canUseEnchantmentAltarContent(gl, false, false)).toBe(false)
  })
})

describe('canAccessEnchantmentAltarScreen', () => {
  it('is false for low guild level', () => {
    expect(canAccessEnchantmentAltarScreen(1)).toBe(false)
  })
})
