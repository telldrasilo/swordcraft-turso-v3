/**
 * Фаза 0: инвентаризация материалов (снимок для docs/MATERIALS_PHASE0_INVENTORY.*)
 * Только сбор данных, без изменения игрового поведения.
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { allMaterials, materialById } from '@/data/materials/library'
import { LOCATION_REGISTRY } from '@/modules/expeditions/data/locations'
import { MISSION_REGISTRY } from '@/modules/expeditions/data/missions'
import { allRecipes } from '@/data/recipes'
import { weaponRecipes } from '@/data/weapon-recipes'
import { refiningRecipes } from '@/data/refining-recipes'
import { materialShopItems } from '@/data/material-shop'
import { initialResources, type ResourceKey } from '@/store/slices/resources-slice'
import { initialBuildings } from '@/store/slices/workers-slice'
import { initialEncyclopediaState } from '@/store/slices/encyclopedia-slice'
import {
  CRAFT_ALLOY_MATERIAL_IDS,
  CRAFT_MAPPED_MATERIAL_IDS,
  getResourceKeyForMaterial,
} from '@/lib/craft/inventory-check'
import { adventures } from '@/data/adventures'
import { npcOrders } from '@/data/market-data'

function collectLocationMaterialIds(): Set<string> {
  const s = new Set<string>()
  for (const loc of LOCATION_REGISTRY) {
    for (const r of loc.resources) {
      s.add(r.materialId)
    }
  }
  return s
}

function collectMissionMaterialIds(): Set<string> {
  const s = new Set<string>()
  for (const mission of MISSION_REGISTRY) {
    const resources = mission.resources
    if (!resources) continue
    for (const r of resources) {
      s.add(r.materialId)
    }
  }
  return s
}

function collectAdventureBonusResourceIds(): Set<string> {
  const s = new Set<string>()
  for (const adv of adventures) {
    const items = adv.baseReward.bonusItems
    if (!items) continue
    for (const b of items) {
      s.add(b.resource)
    }
  }
  return s
}

function collectNpcOrderBonusResourceIds(): Set<string> {
  const s = new Set<string>()
  for (const order of npcOrders) {
    const bonuses = order.bonusItems
    if (!bonuses) continue
    for (const b of bonuses) {
      s.add(b.resource)
    }
  }
  return s
}

function collectRecipeCostResourceKeys(): Set<ResourceKey> {
  const s = new Set<ResourceKey>()
  for (const recipe of allRecipes) {
    const cost = recipe.cost
    if (!cost) continue
    for (const k of Object.keys(cost) as ResourceKey[]) {
      if (cost[k]) s.add(k)
    }
  }
  for (const recipe of weaponRecipes) {
    const cost = recipe.cost
    if (!cost) continue
    for (const k of Object.keys(cost) as ResourceKey[]) {
      const v = (cost as Record<string, number | undefined>)[k]
      if (v) s.add(k as ResourceKey)
    }
  }
  return s
}

function collectRefiningResourceIds(): Set<string> {
  const s = new Set<string>()
  for (const r of refiningRecipes) {
    for (const inp of r.inputs) {
      s.add(inp.resource)
    }
    s.add(r.output.resource)
  }
  return s
}

function stubLevelForNode(node: MaterialNode): 'ok' | 'thin' {
  const basic = node.summary?.basic ?? ''
  const desc = node.description ?? ''
  const applied = node.summary?.applied ?? ''
  const total = basic.length + desc.length + applied.length
  if (total < 180 || basic.length < 40) return 'thin'
  return 'ok'
}

/** Ключи из buyPackages в shop-screen (дублируем id здесь — см. компонент). */
export const SHOP_SCREEN_BUY_PACKAGE_KEYS = [
  'wood',
  'stone',
  'iron',
  'coal',
] as const satisfies readonly ResourceKey[]

export interface Phase0MaterialRow {
  id: string
  inLibrary: boolean
  identityClass: string | null
  tags: string[]
  stubLevel: 'ok' | 'thin' | 'no_node'
  inExpeditionLocationLoot: boolean
  inExpeditionMissionLoot: boolean
  craftMapsToResource: ResourceKey | null
  inCraftExplicitMap: boolean
  inCraftAlloyRecipe: boolean
  inInitialEncyclopedia: boolean
  grantSources: string[]
  spendHints: string[]
  gapFlags: string[]
}

export interface Phase0ResourceKeyMeta {
  key: ResourceKey
  category: 'currency' | 'material_aggregate'
  grantSources: string[]
  spendHints: string[]
  stageViolationNotes: string[]
}

export interface Phase0StageChain {
  fromId: string
  toId: string | null
  relationship: 'ore_to_metal_hint' | 'refining_raw_to_refined'
  note: string
}

export interface Phase0Report {
  generatedAtIso: string
  libraryCount: number
  craftMapMaterialIdCount: number
  alloyMaterialIdCount: number
  expeditionLocationMaterialCount: number
  expeditionMissionMaterialCount: number
  referencedNotInLibrary: string[]
  materialRows: Phase0MaterialRow[]
  resourceKeyMeta: Phase0ResourceKeyMeta[]
  stageChains: Phase0StageChain[]
  technicalDebt: string[]
  topGaps: { id: string; gapFlags: string[] }[]
}

function uniqSort(arr: string[]): string[] {
  return [...new Set(arr)].sort()
}

export function buildPhase0Report(): Phase0Report {
  const generatedAtIso = new Date().toISOString()
  const locLoot = collectLocationMaterialIds()
  const missionLoot = collectMissionMaterialIds()
  const adventureBonus = collectAdventureBonusResourceIds()
  const npcOrderBonus = collectNpcOrderBonusResourceIds()
  const recipeCostKeys = collectRecipeCostResourceKeys()
  const refiningIds = collectRefiningResourceIds()

  const craftMapSet = new Set(CRAFT_MAPPED_MATERIAL_IDS)
  const alloySet = new Set(CRAFT_ALLOY_MATERIAL_IDS)

  const encyclopediaKeys = new Set(Object.keys(initialEncyclopediaState.materialKnowledge))

  const shopKeys = new Set(materialShopItems.map((i) => i.resourceKey))
  for (const k of SHOP_SCREEN_BUY_PACKAGE_KEYS) {
    shopKeys.add(k)
  }

  const workerProduces = new Set(initialBuildings.map((b) => b.produces))

  const resourceKeys = Object.keys(initialResources) as ResourceKey[]

  const allReferencedStrings = uniqSort([
    ...locLoot,
    ...missionLoot,
    ...encyclopediaKeys,
    ...CRAFT_MAPPED_MATERIAL_IDS,
    ...CRAFT_ALLOY_MATERIAL_IDS,
    ...Array.from(adventureBonus),
    ...Array.from(npcOrderBonus),
    ...Array.from(refiningIds),
  ])

  const referencedNotInLibrary = allReferencedStrings.filter((id) => !materialById[id])

  const materialRows: Phase0MaterialRow[] = []
  const libraryIds = allMaterials.map((m) => m.identity.id)

  for (const id of libraryIds) {
    const node = materialById[id]
    if (!node) continue
    const rk = getResourceKeyForMaterial(id)
    const grantSources: string[] = []
    if (locLoot.has(id)) grantSources.push('expedition_location_table')
    if (missionLoot.has(id)) grantSources.push('expedition_mission_resources')
    if (encyclopediaKeys.has(id)) grantSources.push('encyclopedia_initial')
    const spendHints: string[] = []
    if (craftMapSet.has(id)) spendHints.push('craft_v2_MATERIAL_TO_RESOURCE')
    if (alloySet.has(id)) spendHints.push('craft_v2_ALLOY_RECIPES')
    if (refiningIds.has(id)) spendHints.push('refining_io')
    const gapFlags: string[] = []
    if (stubLevelForNode(node) === 'thin') gapFlags.push('thin_content_heuristic')
    if ((locLoot.has(id) || missionLoot.has(id)) && rk === null && !alloySet.has(id)) {
      gapFlags.push('expedition_loot_no_craft_resource_map')
    }
    if (craftMapSet.has(id) && rk !== null) {
      if (
        node.identity.tags.includes('ore') &&
        rk !== 'goldOre' &&
        id.endsWith('_ore')
      ) {
        gapFlags.push('ore_id_maps_to_aggregate_ResourceKey_stage_mismatch_risk')
      }
    }

    materialRows.push({
      id,
      inLibrary: true,
      identityClass: node.identity.class,
      tags: [...node.identity.tags],
      stubLevel: stubLevelForNode(node),
      inExpeditionLocationLoot: locLoot.has(id),
      inExpeditionMissionLoot: missionLoot.has(id),
      craftMapsToResource: rk,
      inCraftExplicitMap: craftMapSet.has(id),
      inCraftAlloyRecipe: alloySet.has(id),
      inInitialEncyclopedia: encyclopediaKeys.has(id),
      grantSources,
      spendHints,
      gapFlags,
    })
  }

  for (const id of referencedNotInLibrary) {
    materialRows.push({
      id,
      inLibrary: false,
      identityClass: null,
      tags: [],
      stubLevel: 'no_node',
      inExpeditionLocationLoot: locLoot.has(id),
      inExpeditionMissionLoot: missionLoot.has(id),
      craftMapsToResource: getResourceKeyForMaterial(id),
      inCraftExplicitMap: craftMapSet.has(id),
      inCraftAlloyRecipe: alloySet.has(id),
      inInitialEncyclopedia: encyclopediaKeys.has(id),
      grantSources: [
        ...(locLoot.has(id) ? (['expedition_location_table'] as const) : []),
        ...(missionLoot.has(id) ? (['expedition_mission_resources'] as const) : []),
        ...(adventureBonus.has(id) ? (['adventures_bonusItems'] as const) : []),
        ...(npcOrderBonus.has(id) ? (['npc_orders_bonusItems'] as const) : []),
        ...(refiningIds.has(id) ? (['refining_recipe'] as const) : []),
        ...(encyclopediaKeys.has(id) ? (['encyclopedia_initial'] as const) : []),
      ],
      spendHints: [
        ...(craftMapSet.has(id) ? (['craft_v2_MATERIAL_TO_RESOURCE'] as const) : []),
        ...(alloySet.has(id) ? (['craft_v2_ALLOY_RECIPES'] as const) : []),
        ...(recipeCostKeys.has(id as ResourceKey) ? (['recipe_cost'] as const) : []),
        ...(refiningIds.has(id) ? (['refining_io'] as const) : []),
        ...(shopKeys.has(id as ResourceKey) ? (['material_shop_or_shop_screen'] as const) : []),
        ...(workerProduces.has(id as ResourceKey) ? (['workers_produce'] as const) : []),
      ].filter(Boolean) as string[],
      gapFlags: ['missing_MaterialNode_in_library'],
    })
  }

  materialRows.sort((a, b) => a.id.localeCompare(b.id))

  const resourceKeyMeta: Phase0ResourceKeyMeta[] = resourceKeys.map((key) => {
    const grantSources: string[] = []
    const spendHints: string[] = []
    if (materialShopItems.some((i) => i.resourceKey === key)) grantSources.push('material_shop')
    if (SHOP_SCREEN_BUY_PACKAGE_KEYS.includes(key as (typeof SHOP_SCREEN_BUY_PACKAGE_KEYS)[number])) {
      grantSources.push('shop_screen_buyPackages')
    }
    if (workerProduces.has(key)) grantSources.push('workers_initialBuildings_produces')
    if (adventureBonus.has(key)) grantSources.push('adventures_bonusItems')
    if (npcOrderBonus.has(key)) grantSources.push('npc_orders_bonusItems')
    if (refiningIds.has(key)) grantSources.push('refining_io')
    if (recipeCostKeys.has(key)) spendHints.push('weapon_recipe_or_v2_recipe_cost')

    const stageViolationNotes: string[] = []
    if (key === 'iron') {
      stageViolationNotes.push(
        'Перегружен: рудник/магазин/маппинг крафта как «железо» при наличии iron_ore в каталоге (§2.7 MATERIALS_UNIFICATION_AUDIT)'
      )
    }
    if (key === 'wood') {
      stageViolationNotes.push(
        'Агрегат: все породы дерева в крафте сводятся в wood; брёвна vs доски не разведены по id'
      )
    }
    if (key === 'leather') {
      stageViolationNotes.push(
        'Агрегат: виды кожи в MaterialNode сводятся в один ResourceKey leather'
      )
    }
    if (['copper', 'tin', 'silver'].includes(key) && key !== 'gold') {
      stageViolationNotes.push('Рудники выдают сырьевой ключ; в library могут быть только *_ore узлы')
    }

    const category: Phase0ResourceKeyMeta['category'] =
      key === 'gold' || key === 'soulEssence' ? 'currency' : 'material_aggregate'

    return {
      key,
      category,
      grantSources,
      spendHints,
      stageViolationNotes,
    }
  })

  const stageChains: Phase0StageChain[] = []
  for (const id of libraryIds) {
    if (!id.endsWith('_ore')) continue
    const base = id.replace(/_ore$/, '')
    if (materialById[base]) {
      stageChains.push({
        fromId: id,
        toId: base,
        relationship: 'ore_to_metal_hint',
        note: 'По именованию id: руда → металл в каталоге',
      })
    } else {
      stageChains.push({
        fromId: id,
        toId: null,
        relationship: 'ore_to_metal_hint',
        note: 'Нет узла без суффикса _ore в library (переработка/слиток могут быть только в ResourceKey)',
      })
    }
  }
  for (const r of refiningRecipes) {
    stageChains.push({
      fromId: r.inputs.map((i) => `${i.resource}:${i.amount}`).join('+'),
      toId: `${r.output.resource}:${r.output.amount}`,
      relationship: 'refining_raw_to_refined',
      note: r.name,
    })
  }

  const technicalDebt = [
    'src/types/resources.ts: интерфейс Resources может расходиться с resources-slice (проверить leather и др.).',
    'Крафт materialId без узла в library: см. referencedNotInLibrary с inCraftExplicitMap.',
    'materialStash vs resources: начисление экспедиции не соединено со spendResources в craft-container.',
  ]

  const topGaps = materialRows
    .filter((r) => r.gapFlags.length > 0)
    .map((r) => ({ id: r.id, gapFlags: r.gapFlags }))
    .sort((a, b) => b.gapFlags.length - a.gapFlags.length || a.id.localeCompare(b.id))
    .slice(0, 40)

  return {
    generatedAtIso,
    libraryCount: libraryIds.length,
    craftMapMaterialIdCount: CRAFT_MAPPED_MATERIAL_IDS.length,
    alloyMaterialIdCount: CRAFT_ALLOY_MATERIAL_IDS.length,
    expeditionLocationMaterialCount: locLoot.size,
    expeditionMissionMaterialCount: missionLoot.size,
    referencedNotInLibrary,
    materialRows,
    resourceKeyMeta,
    stageChains,
    technicalDebt,
    topGaps,
  }
}

export function phase0ReportToMarkdown(report: Phase0Report): string {
  const lines: string[] = []
  lines.push('# Инвентаризация материалов — фаза 0')
  lines.push('')
  lines.push(`Сгенерировано (UTC): \`${report.generatedAtIso}\``)
  lines.push('')
  lines.push('Автоматический снимок для [MATERIALS_UNIFICATION_AUDIT.md](./MATERIALS_UNIFICATION_AUDIT.md). Перегенерация: `npm run materials:phase0`.')
  lines.push('')
  lines.push('## Сводка')
  lines.push('')
  lines.push(`| Метрика | Значение |`)
  lines.push(`|---------|----------|`)
  lines.push(`| Узлов в library (allMaterials) | ${report.libraryCount} |`)
  lines.push(`| materialId в маппинге craft → ResourceKey | ${report.craftMapMaterialIdCount} |`)
  lines.push(`| Сплавы ALLOY_RECIPES | ${report.alloyMaterialIdCount} |`)
  lines.push(`| Уникальных materialId в таблицах локаций | ${report.expeditionLocationMaterialCount} |`)
  lines.push(`| Уникальных materialId в миссиях (resources) | ${report.expeditionMissionMaterialCount} |`)
  lines.push(`| Ссылок без узла в library | ${report.referencedNotInLibrary.length} |`)
  lines.push('')
  lines.push('## Ссылки без MaterialNode')
  lines.push('')
  if (report.referencedNotInLibrary.length === 0) {
    lines.push('— нет —')
  } else {
    lines.push('```')
    lines.push(...report.referencedNotInLibrary)
    lines.push('```')
  }
  lines.push('')
  lines.push('## ResourceKey: начисление и риски стадий (§2.7)')
  lines.push('')
  lines.push('| key | category | grantSources | spendHints | stageViolationNotes |')
  lines.push('|-----|----------|----------------|------------|---------------------|')
  for (const m of report.resourceKeyMeta) {
    const g = m.grantSources.join(', ') || '—'
    const s = m.spendHints.join(', ') || '—'
    const v = m.stageViolationNotes.join('; ') || '—'
    lines.push(`| ${m.key} | ${m.category} | ${g} | ${s} | ${v} |`)
  }
  lines.push('')
  lines.push('## Топ строк с gapFlags (до 40)')
  lines.push('')
  lines.push('| materialId | gapFlags |')
  lines.push('|------------|----------|')
  for (const { id, gapFlags } of report.topGaps) {
    lines.push(`| ${id} | ${gapFlags.join('; ')} |`)
  }
  lines.push('')
  lines.push('## Цепочки (эвристика + refining)')
  lines.push('')
  lines.push('| from | to | type | note |')
  lines.push('|------|----|----- |------|')
  for (const c of report.stageChains) {
    lines.push(`| ${c.fromId} | ${c.toId ?? '—'} | ${c.relationship} | ${c.note} |`)
  }
  lines.push('')
  lines.push('## Технический долг (фиксированный список)')
  lines.push('')
  for (const t of report.technicalDebt) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push('## Полная таблица узлов library')
  lines.push('')
  lines.push('| id | class | stub | expLoc | expMission | craft→Resource | alloy | enc0 | gapFlags |')
  lines.push('|----|-------|------|--------|------------|----------------|-------|------|----------|')
  for (const r of report.materialRows.filter((x) => x.inLibrary)) {
    lines.push(
      `| ${r.id} | ${r.identityClass ?? ''} | ${r.stubLevel} | ${r.inExpeditionLocationLoot ? 'y' : ''} | ${r.inExpeditionMissionLoot ? 'y' : ''} | ${r.craftMapsToResource ?? '—'} | ${r.inCraftAlloyRecipe ? 'y' : ''} | ${r.inInitialEncyclopedia ? 'y' : ''} | ${r.gapFlags.join('; ')} |`
    )
  }
  lines.push('')
  lines.push('## Строки вне library (орфаны)')
  lines.push('')
  for (const r of report.materialRows.filter((x) => !x.inLibrary)) {
    lines.push(`- **${r.id}** — grant: ${r.grantSources.join(', ') || '—'}; spend: ${r.spendHints.join(', ') || '—'}; ${r.gapFlags.join('; ')}`)
  }
  lines.push('')
  return lines.join('\n')
}
