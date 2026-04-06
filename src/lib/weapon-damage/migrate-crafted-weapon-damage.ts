import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { GuildState } from '@/types/guild'
import type { ActiveDamageTagEntry, WeaponLegacy, WeaponRepairCondition } from '@/types/weapon-damage'

/** Первая волна id → канонические `physical_*` / `elemental_*` (SPEC §5). */
const LEGACY_DAMAGE_TAG_ID_TO_CANONICAL: Record<string, string> = {
  edge_chipping: 'physical_slash_chip',
  haft_loose: 'physical_loose_fitting',
  notch_deep: 'physical_gouge_chunk',
  guard_bent: 'physical_bend_warp',
  point_blunted: 'physical_blunt_dull',
  binding_stress: 'physical_crack_fissure',
  corrosion_spot: 'elemental_corrosion_rot',
  crack_frost: 'elemental_frost_bite',
  warp_slight: 'physical_bend_warp',
  soul_leak_minor: 'elemental_skverna_taint',
}

function remapDamageTagId(id: string): string {
  return LEGACY_DAMAGE_TAG_ID_TO_CANONICAL[id] ?? id
}

function mergeNumericRecordByRemappedKeys(raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw)) {
    const nk = remapDamageTagId(k)
    out[nk] = (out[nk] ?? 0) + v
  }
  return out
}

function normalizeLegacy(raw: unknown): WeaponLegacy {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { hiddenMarks: [] }
  }
  const o = raw as {
    hiddenMarks?: unknown
    bladeBondRepairCount?: unknown
    deepInspectReadyAt?: unknown
    lastDeepInspectAt?: unknown
    deepInspectNotes?: unknown
    deepInspectTagIds?: unknown
    autoRepairCompletedCount?: unknown
    repairResolveCountByTagId?: unknown
    archivedDamageTagIds?: unknown
    repairDiagnosisPreciseCountByTagId?: unknown
    repairDiagnosisRiskyCountByTagId?: unknown
    repairDiagnosisSkippedCountByTagId?: unknown
    physicalScarWeights?: unknown
    elementalScarWeights?: unknown
  }
  const hm = o.hiddenMarks
  if (!Array.isArray(hm)) return { hiddenMarks: [] }
  const out: WeaponLegacy = {
    hiddenMarks: hm.filter((x): x is string => typeof x === 'string'),
  }
  if (typeof o.bladeBondRepairCount === 'number' && o.bladeBondRepairCount >= 0) {
    out.bladeBondRepairCount = Math.floor(o.bladeBondRepairCount)
  }
  if (typeof o.deepInspectReadyAt === 'number' && Number.isFinite(o.deepInspectReadyAt)) {
    out.deepInspectReadyAt = o.deepInspectReadyAt
  }
  if (typeof o.lastDeepInspectAt === 'number') {
    out.lastDeepInspectAt = o.lastDeepInspectAt
  }
  if (Array.isArray(o.deepInspectNotes)) {
    const notes = o.deepInspectNotes.filter((x): x is string => typeof x === 'string')
    if (notes.length > 0) out.deepInspectNotes = notes
  }
  if (Array.isArray(o.deepInspectTagIds)) {
    const ids = [...new Set(o.deepInspectTagIds.filter((x): x is string => typeof x === 'string').map(remapDamageTagId))]
    if (ids.length > 0) out.deepInspectTagIds = ids
  }
  if (typeof o.autoRepairCompletedCount === 'number' && o.autoRepairCompletedCount >= 0) {
    out.autoRepairCompletedCount = Math.floor(o.autoRepairCompletedCount)
  }
  if (o.repairResolveCountByTagId && typeof o.repairResolveCountByTagId === 'object') {
    const rec: Record<string, number> = {}
    for (const [k, v] of Object.entries(o.repairResolveCountByTagId)) {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) rec[k] = Math.floor(v)
    }
    if (Object.keys(rec).length > 0) out.repairResolveCountByTagId = mergeNumericRecordByRemappedKeys(rec)
  }
  if (Array.isArray(o.archivedDamageTagIds)) {
    const arch = [...new Set(o.archivedDamageTagIds.filter((x): x is string => typeof x === 'string').map(remapDamageTagId))]
    if (arch.length > 0) out.archivedDamageTagIds = arch
  }
  const normDiag = (rawMap: unknown): Record<string, number> | undefined => {
    if (!rawMap || typeof rawMap !== 'object') return undefined
    const rec: Record<string, number> = {}
    for (const [k, v] of Object.entries(rawMap)) {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) rec[k] = Math.floor(v)
    }
    return Object.keys(rec).length > 0 ? rec : undefined
  }
  const prec = normDiag(o.repairDiagnosisPreciseCountByTagId)
  const risk = normDiag(o.repairDiagnosisRiskyCountByTagId)
  const skip = normDiag(o.repairDiagnosisSkippedCountByTagId)
  if (prec) out.repairDiagnosisPreciseCountByTagId = mergeNumericRecordByRemappedKeys(prec)
  if (risk) out.repairDiagnosisRiskyCountByTagId = mergeNumericRecordByRemappedKeys(risk)
  if (skip) out.repairDiagnosisSkippedCountByTagId = mergeNumericRecordByRemappedKeys(skip)
  const physScar = normDiag(o.physicalScarWeights)
  const elemScar = normDiag(o.elementalScarWeights)
  if (physScar) out.physicalScarWeights = physScar
  if (elemScar) out.elementalScarWeights = elemScar
  return out
}

function normalizeAutoRepairReadyAt(raw: unknown): number | undefined {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return undefined
  return raw
}

function normalizeAutoRepairAwaitingForgeVisit(raw: unknown): boolean | undefined {
  return raw === true ? true : undefined
}

function normalizeTags(raw: unknown): ActiveDamageTagEntry[] {
  if (!Array.isArray(raw)) return []
  const out: ActiveDamageTagEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const t = item as Record<string, unknown>
    const tagId = t.tagId
    if (typeof tagId !== 'string' || !tagId) continue
    const sev = t.severity
    const severity =
      sev === 'light' || sev === 'moderate' || sev === 'heavy' ? sev : 'light'
    const entry: ActiveDamageTagEntry = { tagId: remapDamageTagId(tagId), severity }
    if (typeof t.sourceEventTemplateId === 'string') entry.sourceEventTemplateId = t.sourceEventTemplateId
    if (typeof t.appliedAt === 'number') entry.appliedAt = t.appliedAt
    out.push(entry)
  }
  return out
}

function normalizeRepairCondition(raw: unknown): WeaponRepairCondition {
  if (raw === 'needsProperRepair' || raw === 'temporaryPatch' || raw === 'ok') return raw
  return 'ok'
}

/**
 * Добавляет поля повреждений/наследия к оружию из старых сейвов и нормализует форму.
 */
export function migrateCraftedWeaponV2DamageFields(weapon: CraftedWeaponV2): CraftedWeaponV2 {
  const w = weapon as CraftedWeaponV2 & {
    activeDamageTags?: unknown
    weaponLegacy?: unknown
    repairCondition?: unknown
    autoRepairReadyAt?: unknown
    autoRepairAwaitingForgeVisit?: unknown
  }
  return {
    ...weapon,
    activeDamageTags: normalizeTags(w.activeDamageTags),
    weaponLegacy: normalizeLegacy(w.weaponLegacy),
    repairCondition: normalizeRepairCondition(w.repairCondition),
    autoRepairReadyAt: normalizeAutoRepairReadyAt(w.autoRepairReadyAt),
    autoRepairAwaitingForgeVisit: normalizeAutoRepairAwaitingForgeVisit(w.autoRepairAwaitingForgeVisit),
  }
}

/** Нормализация вложенных копий оружия после merge persist (идемпотентно). */
export function normalizeWeaponDamageInMergedState(merged: {
  weaponInventory?: { weapons?: CraftedWeaponV2[] }
  guild?: GuildState
  craftV2Persisted?: { completedWeapon?: CraftedWeaponV2 | null } | null
}): void {
  if (merged.weaponInventory?.weapons?.length) {
    merged.weaponInventory.weapons = merged.weaponInventory.weapons.map(migrateCraftedWeaponV2DamageFields)
  }
  if (merged.guild) {
    const g = merged.guild
    merged.guild = {
      ...g,
      activeExpeditions: Array.isArray(g.activeExpeditions)
        ? g.activeExpeditions.map((e) => ({
            ...e,
            weaponData: migrateCraftedWeaponV2DamageFields(e.weaponData),
          }))
        : [],
      recoveryQuests: Array.isArray(g.recoveryQuests)
        ? g.recoveryQuests.map((q) => ({
            ...q,
            lostWeaponData: migrateCraftedWeaponV2DamageFields(q.lostWeaponData),
          }))
        : [],
    }
  }
  const cv2 = merged.craftV2Persisted
  if (cv2 && typeof cv2 === 'object' && cv2.completedWeapon) {
    merged.craftV2Persisted = {
      ...cv2,
      completedWeapon: migrateCraftedWeaponV2DamageFields(cv2.completedWeapon),
    }
  }
}
