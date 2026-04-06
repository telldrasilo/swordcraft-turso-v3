/**
 * Пересобирает `gatherable.ts` в каждой папке и `world-resource-nodes.ts`.
 * После `split-world-resource-nodes.mjs` или ручного добавления файлов в подпапки `library`.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  GATHER_FOLDERS,
  GATHER_ID_TO_FOLDER,
  GATHER_MATERIAL_ORDER,
} from './gather-material-config.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const lib = path.join(root, 'src/data/materials/library')

function arrName(folder) {
  switch (folder) {
    case 'ores':
      return 'gatherableOreNodes'
    case 'metals':
      return 'gatherableMetalNodes'
    case 'woods':
      return 'gatherableWoodNodes'
    case 'stones':
      return 'gatherableStoneNodes'
    case 'fuels':
      return 'gatherableFuelNodes'
    case 'leathers':
      return 'gatherableLeatherNodes'
    case 'gems':
      return 'gatherableGemNodes'
    case 'organics':
      return 'gatherableOrganicNodes'
    case 'special':
      return 'gatherableSpecialResourceNodes'
    default:
      throw new Error(folder)
  }
}

function writeGatherableTs(folder, idsInFolder) {
  const imports = idsInFolder.map((id) => `import { ${id} } from './${id}'`).join('\n')
  const reexport = `export { ${idsInFolder.join(', ')} }`
  const nodes = idsInFolder.map((id) => `  ${id},`).join('\n')
  const body = `${imports}\n\nimport type { MaterialNode } from '@/types/materials/material-core'\n\n${reexport}\n\nexport const ${arrName(folder)}: MaterialNode[] = [\n${nodes}\n]\n`
  fs.writeFileSync(path.join(lib, folder, 'gatherable.ts'), body)
}

function writeWorldResourceNodes() {
  const imports = GATHER_MATERIAL_ORDER.map((id) => {
    const folder = GATHER_ID_TO_FOLDER[id]
    return `import { ${id} } from './${folder}/${id}'`
  }).join('\n')
  const body = `${imports}\n\nimport type { MaterialNode } from '@/types/materials/material-core'\n\n/**\n * Каталог добываемых узлов (экспедиции, мир). Порядок — GATHER_MATERIAL_ORDER в scripts/gather-material-config.mjs.\n */\nexport const worldResourceNodes: MaterialNode[] = [\n${GATHER_MATERIAL_ORDER.map((id) => `  ${id},`).join('\n')}\n]\n`
  fs.writeFileSync(path.join(lib, 'world-resource-nodes.ts'), body)
}

for (const id of GATHER_MATERIAL_ORDER) {
  if (!GATHER_ID_TO_FOLDER[id]) throw new Error(`refresh-gather-library: ${id} missing in GATHER_ID_TO_FOLDER`)
}
const set = new Set(Object.keys(GATHER_ID_TO_FOLDER))
if (set.size !== GATHER_MATERIAL_ORDER.length) {
  throw new Error(
    `refresh-gather-library: GATHER_ID_TO_FOLDER has ${set.size} ids, ORDER has ${GATHER_MATERIAL_ORDER.length}`
  )
}

for (const folder of GATHER_FOLDERS) {
  const ids = Object.entries(GATHER_ID_TO_FOLDER)
    .filter(([, f]) => f === folder)
    .map(([id]) => id)
  ids.sort((a, b) => GATHER_MATERIAL_ORDER.indexOf(a) - GATHER_MATERIAL_ORDER.indexOf(b))
  writeGatherableTs(folder, ids)
}
writeWorldResourceNodes()
console.log('refresh-gather-library: updated gatherable.ts + world-resource-nodes.ts')
