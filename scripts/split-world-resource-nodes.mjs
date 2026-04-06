/**
 * Разбивает staging nodes.ts на файлы в library/{ores,fuels,...}/ по // @file <name>.ts
 * Запуск из корня: node scripts/split-world-resource-nodes.mjs
 * Затем обновляет gatherable.ts и world-resource-nodes.ts (refresh-gather-library.mjs).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { gatherFolderForId } from './gather-material-config.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const nodesPath = path.join(root, 'src/data/materials/library/_gather_staging/nodes.ts')
const lib = path.join(root, 'src/data/materials/library')

const text = fs.readFileSync(nodesPath, 'utf8')
const chunks = text.split(/\n\/\/ @file /)

const itemHeader = "import { buildWorldNode, loreSummary } from '../build-world-node'\n"

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

  const folder = gatherFolderForId(base)
  const destDir = path.join(lib, folder)
  fs.mkdirSync(destDir, { recursive: true })
  fs.writeFileSync(path.join(destDir, fname), itemHeader + body + '\n', 'utf8')
  exports.push({ base, exportConst })
}

execSync('node scripts/refresh-gather-library.mjs', { cwd: root, stdio: 'inherit' })
console.log('split-world-resource-nodes: wrote', exports.length, 'files under library/*')
