/**
 * Разбивает world-resources/nodes.ts на items/*.ts по строкам // @file <name>.ts
 * Запуск из корня репозитория: node scripts/split-world-resource-nodes.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const nodesPath = path.join(root, 'src/data/materials/library/world-resources/nodes.ts')
const itemsDir = path.join(root, 'src/data/materials/library/world-resources/items')

const text = fs.readFileSync(nodesPath, 'utf8')
const chunks = text.split(/\n\/\/ @file /)

const itemHeader =
  "import { buildWorldNode, loreSummary } from '../build-world-node'\n"

const exports = []

for (let i = 1; i < chunks.length; i++) {
  const chunk = chunks[i]
  const nl = chunk.indexOf('\n')
  const fname = chunk.slice(0, nl).trim()
  if (!fname.endsWith('.ts')) continue
  const body = chunk.slice(nl + 1).trim()
  const base = fname.replace(/\.ts$/, '')

  const m = body.match(/export const (\w+)\s*=/)
  const exportConst = m ? m[1] : base.replace(/-/g, '_')

  fs.mkdirSync(itemsDir, { recursive: true })
  fs.writeFileSync(path.join(itemsDir, fname), itemHeader + body + '\n', 'utf8')
  exports.push({ base, exportConst })
}

const importLines = exports.map(e => `import { ${e.exportConst} } from './items/${e.base}'`).join('\n')
const arr = exports.map(e => e.exportConst).join(',\n  ')

const indexTs = `${importLines}

import type { MaterialNode } from '@/types/materials/material-core'

export const worldResourceNodes: MaterialNode[] = [
  ${arr},
]
`

fs.writeFileSync(path.join(root, 'src/data/materials/library/world-resources/index.ts'), indexTs, 'utf8')
console.log('Wrote', exports.length, 'item files and index.ts')
