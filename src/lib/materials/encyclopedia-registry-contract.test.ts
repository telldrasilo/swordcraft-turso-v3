/**
 * Roadmap **§10:** экран энциклопедии не должен тянуть «теневые» списки материалов (только реестр).
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const ENC_SCREEN = join(process.cwd(), 'src/components/screens/encyclopedia-screen.tsx')

describe('encyclopedia screen material source (MATERIALS_SINGLE_SOURCE_ROADMAP §10)', () => {
  it('импортирует узлы только из @/data/materials без legacy metalMaterials', () => {
    const src = readFileSync(ENC_SCREEN, 'utf-8')
    expect(src).toMatch(/from ['"]@\/data\/materials['"]/)
    expect(src).not.toMatch(/\bmetalMaterials\b/)
    expect(src).not.toMatch(/from ['"]@\/data\/materials\/metals['"]/)
  })
})
