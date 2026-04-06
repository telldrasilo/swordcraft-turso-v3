/**
 * Строит library/_gather_staging/nodes.ts (с маркерами // @file) из expedition/nodes.ts.
 * Далее: node scripts/split-world-resource-nodes.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const srcPath = path.join(root, 'src/data/materials/library/expedition/nodes.ts')
const stagingDir = path.join(root, 'src/data/materials/library/_gather_staging')
const outPath = path.join(stagingDir, 'nodes.ts')

const src = fs.readFileSync(srcPath, 'utf8')
const prefix = 'expeditionNode({'

const blocks = []
let search = 0
while (true) {
  const start = src.indexOf(prefix, search)
  if (start < 0) break
  let i = start + prefix.length
  let depth = 1
  while (depth > 0 && i < src.length) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') depth--
    i++
  }
  if (src[i] !== ')') throw new Error(`expected ) at ${i}`)
  const inner = src.slice(start + prefix.length, i - 1).trim()
  blocks.push(inner)
  search = i + 1
}

function neutralCopy(text) {
  return text
    .replace('Уголь из экспедиций и шахт.', 'Уголь из шахт и залежей.')
    .replace('Стандартный источник серебра в экспедициях средних тиров.', 'Стандартный источник серебра в средних тирах.')
    .replace('Ключевой ресурс эндгейм-экспедиций', 'Ключевой ресурс высоких тиров')
    .replace('Кульминационный материал экспедиций', 'Кульминационный материал дальних земель')
}

let out = `// @ts-nocheck — только вход для scripts/split-world-resource-nodes.mjs; не импортируется.
/**
 * Агрегатор узлов миро-сырья для scripts/split-world-resource-nodes.mjs.
 * После разбиения источник правды — items/*.ts и index.ts.
 */

`

for (const inner of blocks) {
  const idm = inner.match(/id:\s*'([^']+)'/)
  if (!idm) throw new Error('no id in block')
  const id = idm[1]
  const exportName = id
  const innerNeutral = neutralCopy(inner)
  const body = innerNeutral.replace(/\bsb\(/g, 'loreSummary(')
  out += `// @file ${id}.ts\nexport const ${exportName} = buildWorldNode({\n${body}\n})\n\n`
}

fs.mkdirSync(stagingDir, { recursive: true })
fs.writeFileSync(outPath, out, 'utf8')
console.log('Wrote', blocks.length, 'blocks to', path.relative(root, outPath), '(then run split-world-resource-nodes.mjs)')
