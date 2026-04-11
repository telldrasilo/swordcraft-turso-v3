import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { join, relative } from 'path'

const NEEDLE_LEGACY_NODES = 'inventory-mapped-legacy-nodes'
/** Импорт из удалённого каталога `library/bridge`. */
const IMPORT_FROM_LIBRARY_BRIDGE = /from\s+['"][^'"]*\/library\/bridge\/[^'"]*['"]/

function* walkSrcTsFiles(dir: string): Generator<string> {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.next') continue
      yield* walkSrcTsFiles(p)
    } else if (ent.isFile() && /\.(ts|tsx)$/.test(ent.name) && !ent.name.includes('.test.')) {
      yield p
    }
  }
}

describe('forbidden legacy bridge imports (phase 5.4 guard)', () => {
  it('no src files reference removed inventory-mapped-legacy-nodes path', () => {
    const cwd = process.cwd()
    const srcRoot = join(cwd, 'src')
    const offenders: string[] = []
    for (const file of walkSrcTsFiles(srcRoot)) {
      if (!readFileSync(file, 'utf-8').includes(NEEDLE_LEGACY_NODES)) continue
      const relPosix = relative(cwd, file).replace(/\\/g, '/')
      offenders.push(relPosix)
    }
    expect(offenders).toEqual([])
  })

  it('no src files import from removed materials/library/bridge', () => {
    const cwd = process.cwd()
    const srcRoot = join(cwd, 'src')
    const offenders: string[] = []
    for (const file of walkSrcTsFiles(srcRoot)) {
      const text = readFileSync(file, 'utf-8')
      let hit = false
      for (const line of text.split('\n')) {
        const t = line.trim()
        if (!t.startsWith('import') && !t.includes('import(')) continue
        if (IMPORT_FROM_LIBRARY_BRIDGE.test(line)) {
          hit = true
          break
        }
      }
      if (!hit) continue
      offenders.push(relative(cwd, file).replace(/\\/g, '/'))
    }
    expect(offenders).toEqual([])
  })
})
