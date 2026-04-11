/**
 * Проверка инвентаря для крафта
 * Расчёт требований и проверка наличия материалов
 * 
 * Поддерживает:
 * - Расчёт сырья для сплавов
 * - Покупку недостающих материалов
 * - Детализацию по частям оружия
 */

import type {
  MaterialAssignment,
  PartMaterialSupplyEntry,
  WeaponRecipe as V2WeaponRecipe,
} from '@/types/craft-v2'
import type { WeaponRecipe as LegacyWeaponRecipe } from '@/data/weapon-recipes'
import {
  REFINING_INPUT_STAGE_MATERIAL_ID,
  refiningRecipes,
  type RefiningRecipe,
} from '@/data/refining-recipes'
import { resolveProcessingTechniqueForPart } from '@/data/material-processing-techniques'
import { getEffectiveRefiningRecipeId } from '@/lib/craft/processing-technique-refining-bridge'
import type { CraftingCost, Resources, ResourceKey } from '@/store/slices/resources-slice'
import { WORLD_RESOURCE_TO_RESOURCE_KEY } from '@/lib/materials/world-resource-inventory-bridge'
import { getMaterialAsLegacy, materialById } from '@/data/materials'
import { canBuyMaterial, getMaterialShopInfo } from '@/data/material-shop'
import { isGatherableEncOnlyMaterialId } from '@/lib/materials/gatherable-enc-only'
import { getRefiningOreChargeEfficiency } from '@/lib/materials/material-process-contribution'
import { isA2StashOnlyResourceKey } from '@/lib/craft/a2-stash-only-pools'

/** Рецепт для расчёта стоимости (V2 из craft-v2 или legacy из weapon-recipes). */
export type RecipeForCraftingCost = V2WeaponRecipe | LegacyWeaponRecipe

function isV2WeaponRecipe(recipe: RecipeForCraftingCost): recipe is V2WeaponRecipe {
  return 'parts' in recipe && Array.isArray((recipe as V2WeaponRecipe).parts)
}

// ================================
// МАППИНГ МАТЕРИАЛОВ НА РЕСУРСЫ
// ================================

/**
 * **A2, фаза 2 ([`MATERIALS_SINGLE_SOURCE_ROADMAP`](../../../docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md)):** начисления из мира/лавки/заказов
 * в основном пишут в `materialStash` через `getGrantTargetMaterialId`
 * (см. `a2-smelting-domain-scope.ts`, `a2-wood-domain-scope.ts`, `a2-stone-domain-scope.ts`, `a2-leather-domain-scope.ts`;
 * аудит моста **2.4** — `a2-phase24-bridge-audit.ts`).
 * Эта таблица и поле `resources` — мост для списаний и старых сейвов; удалять ключи только после волны **2.4** и аудита persist
 * (`STORE_VERSION` / `migrateLegacyMaterialResourcesToStash` в `game-store-composed`).
 */

/**
 * Ядро маппинга materialId → `ResourceKey` (кузница).
 * После волны **2.4h** все прежние записи ядра (сплавы, `processed_*`) перенесены в
 * [`WORLD_RESOURCE_TO_RESOURCE_KEY`](../materials/world-resource-inventory-bridge.ts); сюда добавляют только
 * осознанные исключения, если мост и ядро должны расходиться по одному `materialId` (сейчас пусто).
 */
const CORE_MATERIAL_TO_RESOURCE: Record<string, ResourceKey> = {}

/**
 * Пересечение ключей **CORE** и **WORLD** ([`WORLD_RESOURCE_TO_RESOURCE_KEY`](../materials/world-resource-inventory-bridge.ts)).
 * Должно оставаться пустым: иначе при `merge` неочевидно, кто задаёт пул, и растёт dual-path (**2.4**).
 */
export function getInventoryCheckCoreWorldKeyOverlap(): string[] {
  const world = new Set(Object.keys(WORLD_RESOURCE_TO_RESOURCE_KEY))
  return Object.keys(CORE_MATERIAL_TO_RESOURCE).filter((id) => world.has(id))
}

/** После волны 2.4h ядро CORE_MATERIAL_TO_RESOURCE должно быть пустым (A2-мост только WORLD). */
export function getInventoryCheckCoreMaterialMappingEntryCount(): number {
  return Object.keys(CORE_MATERIAL_TO_RESOURCE).length
}

/** Полный маппинг: WORLD затем CORE (ядро перекрывает мост при совпадении имён — избегать совпадений). */
const MATERIAL_TO_RESOURCE: Record<string, ResourceKey> = {
  ...WORLD_RESOURCE_TO_RESOURCE_KEY,
  ...CORE_MATERIAL_TO_RESOURCE,
}

/**
 * Рецепты сплавов — что нужно для создания 1 ед. материала
 * Используется для расчёта сырья, если игрок выбрал сплав
 */
const ALLOY_RECIPES: Record<string, { 
  inputs: { resource: ResourceKey, amount: number, name: string }[]
  fuel?: { resource: ResourceKey, amount: number }
}> = {
  'steel': {
    inputs: [
      { resource: 'ironIngot', amount: 2, name: 'Железный слиток' },
      { resource: 'coal', amount: 1, name: 'Уголь' },
    ],
    fuel: { resource: 'coal', amount: 1 },
  },
  'high_carbon_steel': {
    inputs: [
      { resource: 'ironIngot', amount: 2, name: 'Железный слиток' },
      { resource: 'coal', amount: 2, name: 'Уголь' },
    ],
    fuel: { resource: 'coal', amount: 2 },
  },
  'silver_alloy': {
    inputs: [
      { resource: 'ironIngot', amount: 1, name: 'Железный слиток' },
      { resource: 'silverIngot', amount: 1, name: 'Серебряный слиток' },
    ],
    fuel: { resource: 'coal', amount: 1 },
  },
}

/** Аудит фазы 0: какие craft materialId маппятся на ResourceKey. */
export const CRAFT_MAPPED_MATERIAL_IDS: string[] = Object.keys(MATERIAL_TO_RESOURCE)

/** Аудит фазы 0: материалы с раскрытием через ALLOY_RECIPES. */
export const CRAFT_ALLOY_MATERIAL_IDS: string[] = Object.keys(ALLOY_RECIPES)

// ================================
// ТИПЫ
// ================================

/** Требование одного ресурса */
export interface ResourceRequirement {
  resourceKey: ResourceKey
  resourceId: string          // ID для отображения (iron, coal, wood...)
  resourceName: string        // Имя для отображения
  quantity: number
  available: number
  sufficient: boolean
}

/** Материал для покупки */
export interface MaterialToBuy {
  resourceKey: ResourceKey
  resourceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  canBuy: boolean  // Доступен ли в магазине
}

/** Результат проверки */
export interface InventoryCheckResult {
  canCraft: boolean
  requirements: ResourceRequirement[]
  missing: ResourceRequirement[]
  
  // Детализация по частям оружия
  breakdownByPart: {
    partId: string
    partName: string
    materialId: string
    materialName: string
    requirements: ResourceRequirement[]
  }[]
  
  // Общее топливо (уголь для горна)
  fuelRequired?: ResourceRequirement
  
  // НОВОЕ: Материалы для покупки
  materialsToBuy: MaterialToBuy[]
  totalPurchaseCost: number
  canPurchaseMissing: boolean  // Все ли недостающие можно купить

  /** Сем. фаза 3: выбран материал без маппинга на склад кузницы — крафт невозможен до смены выбора. */
  forgeSpendBlockReason?: string
}

// ================================
// ФУНКЦИИ
// ================================

/**
 * Получить ключ ресурса для материала
 */
export function getResourceKeyForMaterial(materialId: string): ResourceKey | null {
  return MATERIAL_TO_RESOURCE[materialId] || null
}

/**
 * Материал может участвовать в расчёте стоимости/списании крафта v2 через `ResourceKey` или `ALLOY_RECIPES`.
 * Каталожные ENC-only и прочие id без маппинга не должны попадать в выбор планировщика.
 */
export function canCatalogMaterialSpendInForgeCraft(materialId: string): boolean {
  if (ALLOY_RECIPES[materialId]) return true
  return getResourceKeyForMaterial(materialId) != null
}

/** materialId → тот же ResourceKey, что и в MATERIAL_TO_RESOURCE, стабильный порядок для списания stash. */
function getMaterialIdsMappedToResource(resourceKey: ResourceKey): string[] {
  return Object.entries(MATERIAL_TO_RESOURCE)
    .filter(([, rk]) => rk === resourceKey)
    .map(([mid]) => mid)
    .sort()
}

/** Каталожные id, мапящиеся на пул `ResourceKey` (стабильный порядок — как при списании stash). */
export function getCatalogMaterialIdsForResourceKey(resourceKey: ResourceKey): string[] {
  return getMaterialIdsMappedToResource(resourceKey)
}

/**
 * Разница «до/после» для списания с пулов (stash + resources).
 */
export function computePoolSpendDeltas(
  beforeResources: Resources,
  beforeStash: Record<string, number>,
  afterResources: Resources,
  afterStash: Record<string, number>
): {
  stashDecrements: Record<string, number>
  resourceDecrements: Partial<Record<ResourceKey, number>>
} {
  const stashDecrements: Record<string, number> = {}
  const stashKeys = new Set([...Object.keys(beforeStash), ...Object.keys(afterStash)])
  for (const mid of stashKeys) {
    const b = beforeStash[mid] ?? 0
    const a = afterStash[mid] ?? 0
    if (b > a) stashDecrements[mid] = b - a
  }
  const resourceDecrements: Partial<Record<ResourceKey, number>> = {}
  for (const k of Object.keys(beforeResources) as ResourceKey[]) {
    const b = beforeResources[k] ?? 0
    const a = afterResources[k] ?? 0
    if (b > a) resourceDecrements[k] = b - a
  }
  return { stashDecrements, resourceDecrements }
}

/**
 * Канонический `materialId` для начисления в `materialStash` при приходе по `ResourceKey`
 * (рабочие, закупка в крафте, плавка, бонусы заказов — фаза 2 аудита).
 * `null` → начислять только через `addResource` (валюта и прочее без каталожного id).
 */
/** Явные stash-id для начислений по `ResourceKey`, где нет `REFINING_INPUT_STAGE` и id ≠ ключу. См. тест `RESOURCE_GRANT_STASH_FALLBACK aligns with getGrantTargetMaterialId`. */
export const RESOURCE_GRANT_STASH_FALLBACK: Readonly<
  Partial<Record<ResourceKey, string>>
> = {
  leather: 'raw_leather',
  planks: 'processed_wood',
  stoneBlocks: 'processed_stone',
  ironIngot: 'iron_alloy',
  copperIngot: 'copper_alloy',
  tinIngot: 'tin_alloy',
  bronzeIngot: 'bronze',
  steelIngot: 'steel',
  silverIngot: 'silver_alloy',
  goldIngot: 'gold_alloy',
  mithrilIngot: 'mithril_alloy',
}

/** Каталожные id из fallback начисления stash — для material-catalog-contract (B ⊆ A). */
export const RESOURCE_GRANT_STASH_FALLBACK_MATERIAL_IDS: readonly string[] = Array.from(
  new Set(Object.values(RESOURCE_GRANT_STASH_FALLBACK))
)

export function getGrantTargetMaterialId(resourceKey: ResourceKey): string | null {
  if (resourceKey === 'gold' || resourceKey === 'soulEssence') return null

  const stageFromRefining =
    REFINING_INPUT_STAGE_MATERIAL_ID[resourceKey as keyof typeof REFINING_INPUT_STAGE_MATERIAL_ID]
  if (stageFromRefining !== undefined) {
    return stageFromRefining
  }

  if (MATERIAL_TO_RESOURCE[resourceKey] === resourceKey) {
    return resourceKey
  }

  const fallbackId = RESOURCE_GRANT_STASH_FALLBACK[resourceKey]
  if (fallbackId !== undefined && MATERIAL_TO_RESOURCE[fallbackId] === resourceKey) {
    return fallbackId
  }

  return null
}

/**
 * Миграция фазы 2: перенос количеств из `resources` в `materialStash` по правилу
 * `getGrantTargetMaterialId` (как при начислении через store `grantResourceKeyFromWorld`). Идемпотентна.
 * Охватывает все домены A2 **2.2–2.3** (металлы, дерево, камень, кожа и пр.), где ключ имеет каталожный target.
 */
export function migrateLegacyMaterialResourcesToStash(
  resources: Resources,
  materialStash: Record<string, number>
): { resources: Resources; materialStash: Record<string, number> } {
  const newRes = { ...resources }
  const newStash = { ...materialStash }

  for (const key of Object.keys(newRes) as ResourceKey[]) {
    if (key === 'gold' || key === 'soulEssence') continue
    const n = newRes[key] ?? 0
    if (n <= 0) continue
    const mid = getGrantTargetMaterialId(key)
    if (!mid) continue
    newStash[mid] = Math.max(0, (newStash[mid] ?? 0) + n)
    newRes[key] = 0
  }

  const normalizedStash = normalizeLegacyOreStashAliases(newStash)
  return { resources: newRes, materialStash: normalizedStash }
}

/** Легаси-ключи stash до фазы 3 (металлический id = тот же ярлык, что ResourceKey) → каноническая руда. */
const LEGACY_ORE_STASH_KEY_TO_CANONICAL: Record<string, string> = {
  iron: 'iron_ore',
  copper: 'copper_ore',
  tin: 'tin_ore',
  silver: 'silver_ore',
  mithril: 'mithril_ore',
  gold: 'gold_ore',
}

function normalizeLegacyOreStashAliases(stash: Record<string, number>): Record<string, number> {
  const out = { ...stash }
  for (const [legacy, canonical] of Object.entries(LEGACY_ORE_STASH_KEY_TO_CANONICAL)) {
    const n = out[legacy]
    if (n != null && n > 0) {
      out[canonical] = Math.max(0, (out[canonical] ?? 0) + n)
      delete out[legacy]
    }
  }
  return out
}

/**
 * Доступное количество по ключу склада: `resources[key]` + сумма `materialStash` по всем materialId,
 * мапящимся на этот ключ (фаза 2 аудита — мост stash ↔ крафт).
 */
export function getAvailableAmountForResourceKey(
  inventory: Resources,
  materialStash: Record<string, number>,
  resourceKey: ResourceKey
): number {
  if (isA2StashOnlyResourceKey(resourceKey)) {
    let total = 0
    for (const mid of getMaterialIdsMappedToResource(resourceKey)) {
      total += materialStash[mid] ?? 0
    }
    return total
  }
  let total = inventory[resourceKey] ?? 0
  for (const mid of getMaterialIdsMappedToResource(resourceKey)) {
    total += materialStash[mid] ?? 0
  }
  return total
}

/**
 * Стоимость запуска переработки в тех же ключах, что и `CraftingCost` / `spendCraftingCostWithStash`.
 * Входы рецепта + `extraCost.coal` (плавка). Если задан `stashInputsPerBatch`, суммарные `inputs` не входят в `CraftingCost` (только уголь).
 */
export function getRefiningCraftingCost(recipe: RefiningRecipe, amount: number): CraftingCost {
  const cost: CraftingCost = {}
  const stashOnly =
    recipe.stashInputsPerBatch != null &&
    Object.keys(recipe.stashInputsPerBatch).length > 0
  if (!stashOnly) {
    for (const input of recipe.inputs) {
      const k = input.resource as ResourceKey
      cost[k] = (cost[k] ?? 0) + input.amount * amount
    }
  }
  const coalExtra = (recipe.extraCost?.coal ?? 0) * amount
  if (coalExtra > 0) {
    cost.coal = (cost.coal ?? 0) + coalExtra
  }
  return cost
}

/** Каталожные списания `materialStash` на весь запуск (`amount` партий выхода по `output.amount`). */
export function getRefiningStashInputsCost(
  recipe: RefiningRecipe,
  amount: number
): Record<string, number> {
  const per = recipe.stashInputsPerBatch
  if (!per) return {}
  const out: Record<string, number> = {}
  for (const [mid, n] of Object.entries(per)) {
    const u = (out[mid] ?? 0) + n * amount
    out[mid] = u
  }
  return out
}

export function canAffordRefiningStart(
  recipe: RefiningRecipe,
  amount: number,
  inventory: Resources,
  materialStash: Record<string, number>
): boolean {
  if (!canAffordCraftingCostWithStash(getRefiningCraftingCost(recipe, amount), inventory, materialStash)) {
    return false
  }
  for (const [mid, need] of Object.entries(getRefiningStashInputsCost(recipe, amount))) {
    if ((materialStash[mid] ?? 0) < need) return false
  }
  return true
}

export function applyRefiningFullSpend(
  recipe: RefiningRecipe,
  amount: number,
  resources: Resources,
  materialStash: Record<string, number>
): { ok: false } | { ok: true; resources: Resources; materialStash: Record<string, number> } {
  const cost = getRefiningCraftingCost(recipe, amount)
  const r1 = applyCraftingCostSpend(cost, resources, materialStash)
  if (!r1.ok) return { ok: false }
  let stash = r1.materialStash
  for (const [mid, need] of Object.entries(getRefiningStashInputsCost(recipe, amount))) {
    const have = stash[mid] ?? 0
    if (have < need) return { ok: false }
    const left = have - need
    if (left > 0) stash = { ...stash, [mid]: left }
    else {
      const { [mid]: _removed, ...rest } = stash
      stash = rest
    }
  }
  return { ok: true, resources: r1.resources, materialStash: stash }
}

/** Проверка достаточности `cost` с учётом `materialStash` по `MATERIAL_TO_RESOURCE`. */
export function canAffordCraftingCostWithStash(
  cost: CraftingCost,
  inventory: Resources,
  materialStash: Record<string, number>
): boolean {
  for (const k of Object.keys(cost) as ResourceKey[]) {
    const amt = cost[k]
    if (!amt || amt <= 0) continue
    if (getAvailableAmountForResourceKey(inventory, materialStash, k) < amt) {
      return false
    }
  }
  return true
}

function spendSingleResourceKeyFromPools(
  resourceKey: ResourceKey,
  amount: number,
  resources: Resources,
  stash: Record<string, number>
): { resources: Resources; stash: Record<string, number> } | null {
  if (amount <= 0) return { resources, stash }
  if (resourceKey === 'gold' || resourceKey === 'soulEssence') {
    const pool = resources[resourceKey] ?? 0
    if (pool < amount) return null
    return {
      resources: { ...resources, [resourceKey]: pool - amount },
      stash: { ...stash },
    }
  }

  let remaining = amount
  const newStash = { ...stash }
  const newResources = { ...resources }

  for (const mid of getMaterialIdsMappedToResource(resourceKey)) {
    const have = newStash[mid] ?? 0
    if (have <= 0) continue
    const take = Math.min(have, remaining)
    const next = have - take
    if (next > 0) newStash[mid] = next
    else delete newStash[mid]
    remaining -= take
    if (remaining === 0) return { resources: newResources, stash: newStash }
  }

  if (isA2StashOnlyResourceKey(resourceKey)) {
    if (remaining > 0) return null
    return { resources: newResources, stash: newStash }
  }

  const pool = newResources[resourceKey] ?? 0
  if (pool < remaining) return null
  newResources[resourceKey] = pool - remaining
  return { resources: newResources, stash: newStash }
}

/**
 * Снять количество по одному `ResourceKey` с тех же пулов, что списание крафта
 * (сначала `materialStash` по маппингу, затем `resources`). Для продажи и прочего вывода.
 */
export function removeResourceKeyFromPools(
  resourceKey: ResourceKey,
  amount: number,
  resources: Resources,
  materialStash: Record<string, number>
): { ok: true; resources: Resources; materialStash: Record<string, number> } | { ok: false } {
  const out = spendSingleResourceKeyFromPools(
    resourceKey,
    amount,
    { ...resources },
    { ...materialStash }
  )
  if (!out) return { ok: false }
  return { ok: true, resources: out.resources, materialStash: out.stash }
}

/**
 * Списать стоимость крафта: сначала `materialStash` по маппингу MATERIAL_TO_RESOURCE, затем `resources`.
 * Не меняет store — возвращает новые снимки или `ok: false`.
 */
export function applyCraftingCostSpend(
  cost: CraftingCost,
  resources: Resources,
  materialStash: Record<string, number>
): { ok: true; resources: Resources; materialStash: Record<string, number> } | { ok: false } {
  let res = { ...resources }
  let stash = { ...materialStash }

  const keys = (Object.keys(cost) as ResourceKey[])
    .filter(k => (cost[k] ?? 0) > 0)
    .sort()

  for (const resourceKey of keys) {
    const amountNeed = cost[resourceKey]
    if (amountNeed == null || amountNeed <= 0) continue
    const out = spendSingleResourceKeyFromPools(resourceKey, amountNeed, res, stash)
    if (!out) return { ok: false }
    res = out.resources
    stash = out.stash
  }

  return { ok: true, resources: res, materialStash: stash }
}

const SMELTING_ORE_RESOURCE_KEYS: ResourceKey[] = [
  'iron',
  'copper',
  'tin',
  'silver',
  'goldOre',
  'mithril',
]

/**
 * Средневзвешенный множитель выхода слитка по фактически списанной шихте (фаза C семантики).
 * 1 — если нет рудных затрат или симуляция списания не удалась.
 */
export function computeRefiningSmeltingOutputMultiplier(
  recipe: RefiningRecipe,
  amount: number,
  resources: Resources,
  materialStash: Record<string, number>
): number {
  const cost = getRefiningCraftingCost(recipe, amount)
  const beforeStash = { ...materialStash }
  const beforeRes = { ...resources }
  const spent = applyCraftingCostSpend(cost, { ...resources }, { ...materialStash })
  if (!spent.ok) return 1

  let weighted = 0
  let oreUnits = 0
  const oreKeySet = new Set(SMELTING_ORE_RESOURCE_KEYS)

  for (const rk of SMELTING_ORE_RESOURCE_KEYS) {
    if ((cost[rk] ?? 0) <= 0) continue
    const resRemoved = Math.max(0, (beforeRes[rk] ?? 0) - (spent.resources[rk] ?? 0))
    if (resRemoved > 0) {
      const stage =
        REFINING_INPUT_STAGE_MATERIAL_ID[
          rk as keyof typeof REFINING_INPUT_STAGE_MATERIAL_ID
        ]
      weighted += getRefiningOreChargeEfficiency(stage) * resRemoved
      oreUnits += resRemoved
    }
  }

  for (const [mid, beforeQty] of Object.entries(beforeStash)) {
    const afterQty = spent.materialStash[mid] ?? 0
    const removed = beforeQty - afterQty
    if (removed <= 0) continue
    const rk = getResourceKeyForMaterial(mid)
    if (!rk || !oreKeySet.has(rk)) continue
    weighted += getRefiningOreChargeEfficiency(mid) * removed
    oreUnits += removed
  }

  if (oreUnits <= 0) return 1
  return weighted / oreUnits
}

/**
 * Получить отображаемое имя ресурса
 */
function getResourceDisplayName(resourceKey: ResourceKey): string {
  const names: Partial<Record<ResourceKey, string>> = {
    iron: 'Железо',
    coal: 'Уголь',
    wood: 'Дерево',
    stone: 'Камень',
    ironIngot: 'Железный слиток',
    copperIngot: 'Медный слиток',
    tinIngot: 'Оловянный слиток',
    goldIngot: 'Золотой слиток',
    steelIngot: 'Стальной слиток',
    silverIngot: 'Серебряный слиток',
    mithrilIngot: 'Мифриловый слиток',
    planks: 'Доски',
    stoneBlocks: 'Каменные блоки',
    leather: 'Кожа',
    silver: 'Серебро',
  }
  return names[resourceKey] || resourceKey
}

/**
 * Рассчитать сырьё для материала
 * Если это сплав — раскрывает рецепт
 */
/**
 * Сырьё для части с учётом пути снабжения (слиток или руда + плавка по рецепту переработки).
 */
export function calculatePartRawResources(
  partId: string,
  materialId: string,
  baseQuantity: number,
  partMaterialSupply?: Record<string, PartMaterialSupplyEntry>
): { resource: ResourceKey; amount: number; name: string }[] {
  const entry = partMaterialSupply?.[partId]
  if (entry?.mode === 'ore_smelt') {
    const tech = resolveProcessingTechniqueForPart(partId, materialId, entry)
    const ref = tech
      ? refiningRecipes.find(r => r.id === getEffectiveRefiningRecipeId(tech))
      : undefined
    if (ref && ref.output.amount > 0) {
      const direct = calculateRawResources(materialId, baseQuantity)
      const outKey = ref.output.resource as ResourceKey
      const ingotLine = direct.find(d => d.resource === outKey)
      const ingotsNeeded = ingotLine?.amount
      if (ingotsNeeded != null && ingotsNeeded > 0) {
        const batches = ingotsNeeded / ref.output.amount
        const lines: { resource: ResourceKey; amount: number; name: string }[] = []
        for (const input of ref.inputs) {
          const k = input.resource as ResourceKey
          lines.push({
            resource: k,
            amount: input.amount * batches,
            name: getResourceDisplayName(k),
          })
        }
        const coalExtra = (ref.extraCost?.coal ?? 0) * batches
        if (coalExtra > 0) {
          const coalLine = lines.find(l => l.resource === 'coal')
          if (coalLine) coalLine.amount += coalExtra
          else {
            lines.push({
              resource: 'coal',
              amount: coalExtra,
              name: getResourceDisplayName('coal'),
            })
          }
        }
        return lines
      }
    }
  }
  return calculateRawResources(materialId, baseQuantity)
}

function calculateRawResources(
  materialId: string,
  quantity: number
): { resource: ResourceKey; amount: number; name: string }[] {
  // Проверяем, есть ли рецепт для сплава
  const recipe = ALLOY_RECIPES[materialId]
  if (recipe) {
    // Это сплав — раскрываем рецепт
    return recipe.inputs.map(input => ({
      resource: input.resource,
      amount: input.amount * quantity,
      name: input.name,
    }))
  }
  
  // Это сырьё — прямая запись
  const resourceKey = getResourceKeyForMaterial(materialId)
  const material = getMaterialAsLegacy(materialId)
  if (resourceKey) {
    return [{ 
      resource: resourceKey, 
      amount: quantity,
      name: material?.name || resourceKey,
    }]
  }
  
  reportCraftMaterialMappingGap(materialId)
  return []
}

/** Явные сообщения вместо «немого» Unknown material (аудит фаза 3). */
function reportCraftMaterialMappingGap(materialId: string): void {
  if (materialById[materialId]) {
    if (isGatherableEncOnlyMaterialId(materialId)) {
      console.warn(
        `[inventory-check] Craft cost: catalog material "${materialId}" is ENC-only (no forge ResourceKey mapping).`
      )
      return
    }
    console.warn(
      `[inventory-check] Craft cost: catalog material "${materialId}" has no MATERIAL_TO_RESOURCE entry — add bridge or registry.`
    )
    return
  }
  console.warn(
    `[inventory-check] Craft cost: material id "${materialId}" is not in the material catalog (materialById).`
  )
}

/**
 * Рассчитать требования для крафта
 * Возвращает детальную информацию о требуемых ресурсах
 */
export function calculateCraftRequirements(
  recipe: V2WeaponRecipe,
  materialSelections: MaterialAssignment,
  partMaterialSupply?: Record<string, PartMaterialSupplyEntry>
): Map<ResourceKey, { amount: number; sources: string[]; names: string[] }> {
  const requirements = new Map<ResourceKey, { amount: number; sources: string[]; names: string[] }>()
  
  for (const [partId, selection] of Object.entries(materialSelections)) {
    const material = getMaterialAsLegacy(selection.materialId)
    if (!material) {
      if (materialById[selection.materialId]) {
        console.warn(
          `[inventory-check] calculateCraftRequirements: catalog id "${selection.materialId}" has no legacy craft adapter (getMaterialAsLegacy).`
        )
      }
      continue
    }
    
    // Базовое количество материала для этой части
    const recipePart = recipe.parts.find(p => p.id === partId)
    const baseQuantity = recipePart?.minQuantity || 1
    
    // Получаем список сырья
    const rawResources = calculatePartRawResources(
      partId,
      selection.materialId,
      baseQuantity,
      partMaterialSupply
    )
    
    for (const { resource, amount, name } of rawResources) {
      const existing = requirements.get(resource)
      if (existing) {
        existing.amount += amount
        existing.sources.push(partId)
        existing.names.push(name)
      } else {
        requirements.set(resource, { amount, sources: [partId], names: [name] })
      }
    }
  }
  
  return requirements
}

/**
 * Проверить наличие ресурсов в инвентаре
 */
export function checkInventoryForCraft(
  recipe: V2WeaponRecipe,
  materialSelections: MaterialAssignment,
  inventory: Resources,
  materialStash: Record<string, number> = {},
  partMaterialSupply?: Record<string, PartMaterialSupplyEntry>
): InventoryCheckResult {
  const emptyBlocked = (reason: string): InventoryCheckResult => ({
    canCraft: false,
    requirements: [],
    missing: [],
    breakdownByPart: [],
    materialsToBuy: [],
    totalPurchaseCost: 0,
    canPurchaseMissing: false,
    forgeSpendBlockReason: reason,
  })

  for (const [, selection] of Object.entries(materialSelections)) {
    if (!canCatalogMaterialSpendInForgeCraft(selection.materialId)) {
      const enc = isGatherableEncOnlyMaterialId(selection.materialId)
      const reason = enc
        ? 'Этот материал сейчас только для энциклопедии (дроп без расхода в кузне). Выберите другой материал для части.'
        : `Материал «${selection.materialId}» не подключён к складу кузницы (нет записи в MATERIAL_TO_RESOURCE).`
      return emptyBlocked(reason)
    }
  }

  const requirements: ResourceRequirement[] = []
  const missing: ResourceRequirement[] = []
  const breakdownByPart: InventoryCheckResult['breakdownByPart'] = []
  const materialsToBuy: MaterialToBuy[] = []

  // Рассчитываем общие требования
  const totalRequirements = calculateCraftRequirements(
    recipe,
    materialSelections,
    partMaterialSupply
  )

  /** Синхронно с `getCraftingCost`: базовый уголь горня (+3) суммируется с углём из частей / плавки. */
  const FORGE_COAL_BASELINE = 3
  const coalMerge = totalRequirements.get('coal')
  if (coalMerge) {
    coalMerge.amount += FORGE_COAL_BASELINE
    coalMerge.sources.push('_forge_baseline')
    coalMerge.names.push('Горн (база)')
  } else {
    totalRequirements.set('coal', {
      amount: FORGE_COAL_BASELINE,
      sources: ['_forge_baseline'],
      names: ['Горн (база)'],
    })
  }

  // Формируем список требований
  for (const [resourceKey, { amount }] of totalRequirements) {
    const available = getAvailableAmountForResourceKey(inventory, materialStash, resourceKey)
    const sufficient = available >= amount
    
    const req: ResourceRequirement = {
      resourceKey,
      resourceId: resourceKey,
      resourceName: getResourceDisplayName(resourceKey),
      quantity: amount,
      available,
      sufficient,
    }
    
    requirements.push(req)
    
    if (!sufficient) {
      missing.push(req)
      
      // Проверяем, можно ли купить
      const buyable = canBuyMaterial(resourceKey)
      const neededQuantity = amount - available
      const shopInfo = getMaterialShopInfo(resourceKey)
      
      if (buyable && shopInfo) {
        materialsToBuy.push({
          resourceKey,
          resourceName: shopInfo.name,
          quantity: neededQuantity,
          unitPrice: shopInfo.basePrice,
          totalPrice: Math.ceil(shopInfo.basePrice * neededQuantity * 1.1), // +10% за покупку из крафта
          canBuy: true,
        })
      }
    }
  }
  
  // Детализация по частям (для UI)
  const partNames: Record<string, string> = {
    blade: 'Лезвие',
    guard: 'Гарда',
    grip: 'Рукоять',
    pommel: 'Навершие',
    wrapping: 'Обмотка',
  }
  
  for (const [partId, selection] of Object.entries(materialSelections)) {
    const material = getMaterialAsLegacy(selection.materialId)
    if (!material) {
      if (materialById[selection.materialId]) {
        console.warn(
          `[inventory-check] checkInventoryForCraft: catalog id "${selection.materialId}" has no legacy craft adapter (getMaterialAsLegacy).`
        )
      }
      continue
    }
    
    const recipePart = recipe.parts.find(p => p.id === partId)
    const baseQuantity = recipePart?.minQuantity || 1
    
    const partRequirements: ResourceRequirement[] = []
    const rawResources = calculatePartRawResources(
      partId,
      selection.materialId,
      baseQuantity,
      partMaterialSupply
    )
    
    for (const { resource, amount } of rawResources) {
      const available = getAvailableAmountForResourceKey(inventory, materialStash, resource)
      partRequirements.push({
        resourceKey: resource,
        resourceId: resource,
        resourceName: getResourceDisplayName(resource),
        quantity: amount,
        available,
        sufficient: available >= amount,
      })
    }
    
    breakdownByPart.push({
      partId,
      partName: partNames[partId] || partId,
      materialId: selection.materialId,
      materialName: material.name,
      requirements: partRequirements,
    })
  }

  const coalTotals = totalRequirements.get('coal')
  const fuelAvailable = getAvailableAmountForResourceKey(inventory, materialStash, 'coal')
  const fuelRequired: ResourceRequirement = {
    resourceKey: 'coal',
    resourceId: 'coal',
    resourceName: getResourceDisplayName('coal'),
    quantity: coalTotals?.amount ?? FORGE_COAL_BASELINE,
    available: fuelAvailable,
    sufficient: fuelAvailable >= (coalTotals?.amount ?? FORGE_COAL_BASELINE),
  }

  // Рассчитываем общую стоимость покупки
  const totalPurchaseCost = materialsToBuy.reduce((sum, m) => sum + m.totalPrice, 0)
  
  // Проверяем, можно ли купить все недостающие материалы
  const canPurchaseMissing = missing.length > 0 && materialsToBuy.length > 0 && materialsToBuy.every(m => m.canBuy)
  
  return {
    canCraft: missing.length === 0,
    requirements,
    missing,
    breakdownByPart,
    fuelRequired,
    materialsToBuy,
    totalPurchaseCost,
    canPurchaseMissing,
  }
}

/**
 * Получить стоимость для списания
 * 
 * Если materialSelections пустой (генерация заказа), используем recipe.cost
 */
export function getCraftingCost(
  recipe: RecipeForCraftingCost,
  materialSelections: MaterialAssignment,
  partMaterialSupply?: Record<string, PartMaterialSupplyEntry>
): Partial<Record<ResourceKey, number>> {
  const cost: Partial<Record<ResourceKey, number>> = {}

  if (isV2WeaponRecipe(recipe)) {
    if (Object.keys(materialSelections).length > 0) {
      const totalRequirements = calculateCraftRequirements(
        recipe,
        materialSelections,
        partMaterialSupply
      )
      for (const [resourceKey, { amount }] of totalRequirements) {
        cost[resourceKey] = (cost[resourceKey] || 0) + amount
      }
    } else if (recipe.cost) {
      for (const [resourceKey, amount] of Object.entries(recipe.cost)) {
        if (amount && amount > 0) {
          cost[resourceKey as ResourceKey] = amount
        }
      }
    }
  } else {
    for (const [resourceKey, amount] of Object.entries(recipe.cost)) {
      if (amount && amount > 0) {
        cost[resourceKey as ResourceKey] = amount
      }
    }
  }

  cost.coal = (cost.coal || 0) + 3

  return cost
}

/**
 * Проверить, есть ли материал в инвентаре
 */
export function hasMaterialInInventory(
  materialId: string,
  quantity: number,
  inventory: Resources,
  materialStash: Record<string, number> = {}
): boolean {
  return getMaterialAmountInInventory(materialId, inventory, materialStash) >= quantity
}

/**
 * Получить количество материала в инвентаре
 */
export function getMaterialAmountInInventory(
  materialId: string,
  inventory: Resources,
  materialStash: Record<string, number> = {}
): number {
  const resourceKey = getResourceKeyForMaterial(materialId)
  if (!resourceKey) return materialStash[materialId] ?? 0
  return getAvailableAmountForResourceKey(inventory, materialStash, resourceKey)
}
