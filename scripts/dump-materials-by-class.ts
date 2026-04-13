/**
 * Регенерация: npx tsx scripts/dump-materials-by-class.ts
 */
import fs from 'fs'
import path from 'path'
import { allMaterials } from '@/data/materials/library/material-registry-manifest'

const order = ['metal', 'mineral', 'wood', 'leather', 'organic', 'other'] as const
const byClass = new Map<string, { id: string; name: string }[]>()
for (const c of order) byClass.set(c, [])
for (const m of allMaterials) {
  const c = m.identity.class
  const arr = byClass.get(c) ?? []
  arr.push({ id: m.identity.id, name: m.identity.name })
  byClass.set(c, arr)
}

const lines: string[] = []
lines.push('# Материалы проекта: id и названия по классам')
lines.push('')
lines.push(
  'Источник: `allMaterials` в [`src/data/materials/library/material-registry-manifest.ts`](../src/data/materials/library/material-registry-manifest.ts). Класс — поле `identity.class` (`MaterialClass` в `src/types/materials/material-core.ts`).'
)
lines.push('')
lines.push('Обновление списка: `npx tsx scripts/dump-materials-by-class.ts`.')
lines.push('')

for (const c of order) {
  const arr = (byClass.get(c) ?? []).slice().sort((a, b) => a.id.localeCompare(b.id))
  lines.push(`## ${c} (${arr.length})`)
  lines.push('')
  lines.push('| id | name |')
  lines.push('| --- | --- |')
  for (const x of arr) {
    lines.push(`| \`${x.id}\` | ${x.name.replace(/\|/g, '\\|')} |`)
  }
  lines.push('')
}

const extra = [...byClass.keys()].filter((k) => !(order as readonly string[]).includes(k))
if (extra.length) {
  lines.push('## Прочие классы (вне enum)')
  lines.push('')
  for (const c of extra.sort()) {
    const arr = (byClass.get(c) ?? []).slice().sort((a, b) => a.id.localeCompare(b.id))
    lines.push(`### ${c} (${arr.length})`)
    lines.push('')
    lines.push('| id | name |')
    lines.push('| --- | --- |')
    for (const x of arr) {
      lines.push(`| \`${x.id}\` | ${x.name.replace(/\|/g, '\\|')} |`)
    }
    lines.push('')
  }
}

lines.push(`**Всего узлов:** ${allMaterials.length}`)
lines.push('')

const out = path.join(process.cwd(), 'docs', 'MATERIALS_BY_CLASS.md')
fs.writeFileSync(out, lines.join('\n'), 'utf8')
console.log(`Wrote ${out}`)
