/**
 * Генерация docs/MATERIALS_PHASE0_INVENTORY.md и .json
 * Запуск: npm run materials:phase0
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPhase0Report, phase0ReportToMarkdown } from '../src/lib/materials/phase0-inventory'

const dir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dir, '..')

const report = buildPhase0Report()
const jsonPath = path.join(root, 'docs', 'MATERIALS_PHASE0_INVENTORY.json')
const mdPath = path.join(root, 'docs', 'MATERIALS_PHASE0_INVENTORY.md')

writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
writeFileSync(mdPath, phase0ReportToMarkdown(report), 'utf8')

// eslint-disable-next-line no-console
console.log(`Wrote ${jsonPath}`)
// eslint-disable-next-line no-console
console.log(`Wrote ${mdPath}`)
