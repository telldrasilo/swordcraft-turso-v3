/**
 * Компонент карточки ремонта оружия
 * Отображает состояние оружия и доступные опции ремонта.
 */

'use client'

import {
  Wrench,
  Heart,
  Sparkles,
  Map,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Loader2,
  ChevronDown,
  Lock,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useGameStore } from '@/store'
import { qualityGrades } from '@/lib/craft/weapon-display-meta'
import type { QualityGrade } from '@/store/slices/craft-slice'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { QUALITY_GRADE_V2_TO_LEGACY } from '@/lib/store-utils/constants'
import { weaponRecipes } from '@/data/weapon-recipes'
import type { RepairResult } from '@/data/repair-system'
import { DURABILITY_MAINTENANCE_TECHNIQUE_ID } from '@/data/weapon-damage/repair-techniques-registry'
import { cn } from '@/lib/utils'
import { getAvailableAmountForResourceKey } from '@/lib/craft/inventory-check'
import type { ResourceKey } from '@/store/slices/resources-slice'
import { getDamageTagById } from '@/data/weapon-damage/damage-tag-registry'
import {
  buildWeaponRepairPlan,
  getApplicableRepairTechniquesForTags,
  getApplicableRepairTechniquesForTagsUnlocked,
  getUncoveredActiveTags,
  isRepairTechniqueUnlocked,
} from '@/lib/weapon-damage/build-repair-plan'
import {
  getRepairAutoPickMaterialMarkup,
  getWeaponAutoRepairGoldCost,
} from '@/lib/store-utils/repair-balance'
import {
  resolveWeaponRepairPlanEconomy,
  scaleMaterialCostRecord,
} from '@/lib/store-utils/repair-utils'
import { useWeaponRepairStageRun } from '@/hooks/use-weapon-repair-stage-run'
import {
  WEAPON_DEEP_INSPECT_MATERIAL_COST,
  WEAPON_DEEP_INSPECT_DURATION_MS,
} from '@/lib/store-utils/constants'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'
import { canBuyMaterial, getMaterialShopInfo, getMaterialPrice } from '@/data/material-shop'
import { formatRepairRefiningHint } from '@/lib/craft/repair-refining-hint'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { getDamageTagInspectionEntryOrFallback } from '@/data/weapon-damage/damage-tag-inspection-options'

// Иконки типов оружия
function WeaponIcon({ type, className }: { type: string; className?: string }) {
  const iconMap: Record<string, string> = {
    sword: '⚔️',
    dagger: '🗡️',
    axe: '🪓',
    mace: '🔨',
    spear: '🔱',
    hammer: '⚒️'
  }
  return <span className={className}>{iconMap[type] || '⚔️'}</span>
}

// Цвета качества
const qualityColors: Record<string, { text: string; bg: string; border: string }> = {
  common: { text: 'text-stone-400', bg: 'bg-stone-900/80', border: 'border-stone-600' },
  uncommon: { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-600' },
  rare: { text: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-600' },
  epic: { text: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-600' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-600' },
  mythic: { text: 'text-rose-400', bg: 'bg-rose-900/30', border: 'border-rose-600' },
}

// Имена тиров оружия
const tierNames: Record<string, string> = {
  common: 'Обычное',
  uncommon: 'Необычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное',
  mythic: 'Мифическое'
}

const REPAIR_STAGE_CATEGORY_LABEL: Record<string, string> = {
  preparation: 'Подготовка',
  work: 'Работа',
  finishing: 'Отделка',
}

function formatCountdownMs(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// Карточка ремонта
interface RepairCardProps {
  weapon: CraftedWeaponV2
  /** Успешный ремонт по техникам — тост в секции ремонта */
  onRepairDone?: (weaponName: string, result: RepairResult) => void
  /**
   * Во вкладке «Ремонт» — без дублей с инвентарём: без блока «Накопленные свойства»,
   * краткий список тегов, без второго блока мастерства в ветке только-прочность.
   */
  variant?: 'default' | 'repairWorkbench'
  /** Рядом с WeaponInventoryCard — скрыть дублирующий заголовок и полосу прочности */
  compactWeaponChrome?: boolean
}

export function RepairCard({
  weapon,
  onRepairDone,
  variant = 'default',
  compactWeaponChrome = false,
}: RepairCardProps) {
  const workbench = variant === 'repairWorkbench'
  const slimHeader = compactWeaponChrome
  const legacyGrade = (QUALITY_GRADE_V2_TO_LEGACY[weapon.qualityGrade] ?? 'normal') as QualityGrade
  const qualityInfo = qualityGrades[legacyGrade] ?? qualityGrades.normal
  const durability = weapon.currentDurability ?? weapon.stats.durability
  const maxDurability = weapon.stats.maxDurability
  
  // Получаем ресурсы из стора
  const resources = useGameStore((state) => state.resources)
  const materialStash = useGameStore((state) => state.materialStash)
  
  /** Редкость рецепта (для оформления карточки); расчёт ремонта по-прежнему использует weapon.tier */
  const legacyRecipe = weaponRecipes.find((r) => r.id === weapon.recipeId)
  const tier = (legacyRecipe?.tier as string | undefined) ?? 'common'
  
  // Прочность для индикатора
  const durabilityPercent = (durability / maxDurability) * 100
  const durabilityColor = durabilityPercent > 75 
    ? 'text-green-400' 
    : durabilityPercent > 50 
      ? 'text-yellow-400' 
      : 'text-red-400'
  
  // Получаем функции из стора (стабильные ссылки)
  const executeWeaponRepairByTechniques = useGameStore(
    (state) => state.executeWeaponRepairByTechniques
  )
  const scheduleWeaponAutoRepair = useGameStore((state) => state.scheduleWeaponAutoRepair)
  const claimWeaponAutoRepair = useGameStore((state) => state.claimWeaponAutoRepair)
  const startWeaponDeepInspect = useGameStore((state) => state.startWeaponDeepInspect)
  const completeWeaponDeepInspect = useGameStore((state) => state.completeWeaponDeepInspect)
  const player = useGameStore((state) => state.player)
  const spendResource = useGameStore((state) => state.spendResource)
  const grantResourceKeyFromWorld = useGameStore((state) => state.grantResourceKeyFromWorld)
  const canAfford = useGameStore((state) => state.canAfford)
  const repairTechniqueStageRun = useGameStore((state) => state.repairTechniqueStageRun)
  const setRepairBenchTechniqueDraft = useGameStore((state) => state.setRepairBenchTechniqueDraft)
  const beginRepairTechniqueStageRun = useGameStore((state) => state.beginRepairTechniqueStageRun)
  const clearRepairTechniqueStageRun = useGameStore((state) => state.clearRepairTechniqueStageRun)
  const unlockedRepairTechniqueIds = useGameStore((state) => state.unlockedRepairTechniqueIds)

  const damageEntries = useMemo(
    () => (weapon.activeDamageTags?.length ? weapon.activeDamageTags : []),
    [weapon.activeDamageTags]
  )
  const useTechniqueRepair = damageEntries.length > 0 || durability < maxDurability

  const [selectedTechniqueIds, setSelectedTechniqueIds] = useState<string[]>(() => {
    const s = useGameStore.getState()
    const run = s.repairTechniqueStageRun
    const draft = s.repairBenchTechniqueDraft
    if (run?.weaponId === weapon.id) return [...run.techniqueIds]
    if (draft?.weaponId === weapon.id && draft.techniqueIds.length > 0) return [...draft.techniqueIds]
    return []
  })
  const [purchaseMissing, setPurchaseMissing] = useState(false)
  const [inspectionTagId, setInspectionTagId] = useState<string | null>(null)
  const [inspectionHint, setInspectionHint] = useState<string | null>(null)
  const [extraRepairOpen, setExtraRepairOpen] = useState(false)
  /** Гипотеза кузнеца по тегу: true/false — для §9.1.1 и штрафа к броску */
  const [inspectionHypothesisByTagId, setInspectionHypothesisByTagId] = useState<
    Record<string, boolean>
  >({})
  /** Пропуск осмотра: техники по тегам + наценка на материалы */
  const [useAutoPick, setUseAutoPick] = useState(false)

  const [nowTick, setNowTick] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const applicableTechniques = useMemo(
    () => getApplicableRepairTechniquesForTags(damageEntries.map((e) => e.tagId)),
    [damageEntries]
  )

  const techniquePlan = useMemo(
    () =>
      selectedTechniqueIds.length > 0 ? buildWeaponRepairPlan(selectedTechniqueIds) : null,
    [selectedTechniqueIds]
  )

  const uncoveredTags = useMemo(
    () =>
      getUncoveredActiveTags(
        damageEntries.map((e) => e.tagId),
        selectedTechniqueIds
      ),
    [damageEntries, selectedTechniqueIds]
  )

  const prepNeeded = useMemo(
    () => damageEntries.some((e) => getDamageTagById(e.tagId)?.requiresPrepStep === true),
    [damageEntries]
  )
  const deepHints = useMemo(() => {
    const lines: string[] = []
    for (const e of damageEntries) {
      const d = getDamageTagById(e.tagId)
      if (d?.analysisHint) lines.push(d.analysisHint)
    }
    return lines
  }, [damageEntries])
  const lastInspect = weapon.weaponLegacy?.lastDeepInspectAt
  const storedInspectNotes = weapon.weaponLegacy?.deepInspectNotes ?? []
  const bladeBond = weapon.weaponLegacy?.bladeBondRepairCount ?? 0
  const autoRepairDone = weapon.weaponLegacy?.autoRepairCompletedCount ?? 0
  const autoRepairGoldCost = useMemo(() => getWeaponAutoRepairGoldCost(weapon), [weapon])
  const autoPickMaterialMarkup = useMemo(() => getRepairAutoPickMaterialMarkup(weapon), [weapon])
  const canPayAutoRepair = canAfford({ gold: autoRepairGoldCost })
  const displayInspectNotes =
    storedInspectNotes.length > 0
      ? storedInspectNotes
      : lastInspect !== undefined && deepHints.length > 0
        ? deepHints
        : []
  const canQueueAuto =
    damageEntries.length > 0 || durability < maxDurability
  const awaitingForgeVisit = weapon.autoRepairAwaitingForgeVisit === true
  const showDamagePanel =
    damageEntries.length > 0 ||
    weapon.autoRepairReadyAt !== undefined ||
    awaitingForgeVisit ||
    durability < maxDurability ||
    storedInspectNotes.length > 0 ||
    lastInspect !== undefined

  const allTagsInspected = useMemo(() => {
    if (damageEntries.length === 0) return true
    return damageEntries.every((e) => e.tagId in inspectionHypothesisByTagId)
  }, [damageEntries, inspectionHypothesisByTagId])

  const effectiveMaterialMultiplier = useAutoPick ? autoPickMaterialMarkup : 1

  const techniqueCost = useMemo(() => {
    if (!techniquePlan) return null
    return resolveWeaponRepairPlanEconomy(weapon, techniquePlan, player.level)
  }, [techniquePlan, weapon, player.level])

  const materialsForUi = useMemo(() => {
    if (!techniqueCost) return null
    if (effectiveMaterialMultiplier === 1) return techniqueCost.materials
    return scaleMaterialCostRecord(techniqueCost.materials, effectiveMaterialMultiplier)
  }, [techniqueCost, effectiveMaterialMultiplier])

  const canAffordTechniquePlan = useMemo(() => {
    if (!techniqueCost || !materialsForUi) return false
    for (const [mat, amount] of Object.entries(materialsForUi)) {
      if (!amount || amount <= 0) continue
      const resourceKey = mat as ResourceKey
      if (getAvailableAmountForResourceKey(resources, materialStash, resourceKey) < amount) {
        return false
      }
    }
    return true
  }, [techniqueCost, materialsForUi, resources, materialStash])

  const repairMaterialAnalysis = useMemo(() => {
    if (!techniqueCost || !materialsForUi) return null
    type Row = {
      key: ResourceKey
      label: string
      needed: number
      available: number
      short: number
      buyable: boolean
    }
    const rows: Row[] = []
    let shopPurchaseGold = 0
    let hasUnbuyableShortfall = false
    for (const [mat, amount] of Object.entries(materialsForUi)) {
      if (!amount || amount <= 0) continue
      const resourceKey = mat as ResourceKey
      const available = getAvailableAmountForResourceKey(resources, materialStash, resourceKey)
      const short = Math.max(0, amount - available)
      const buyable = canBuyMaterial(resourceKey)
      const label = getMaterialShopInfo(resourceKey)?.name ?? resourceKey
      rows.push({ key: resourceKey, label, needed: amount, available, short, buyable })
      if (short > 0) {
        if (buyable) shopPurchaseGold += getMaterialPrice(resourceKey, short, 1.1)
        else hasUnbuyableShortfall = true
      }
    }
    return { rows, shopPurchaseGold, hasUnbuyableShortfall }
  }, [techniqueCost, materialsForUi, resources, materialStash])

  const canAffordWithShopPurchase = useMemo(() => {
    if (!repairMaterialAnalysis || repairMaterialAnalysis.hasUnbuyableShortfall) return false
    const gold = resources.gold ?? 0
    return gold >= repairMaterialAnalysis.shopPurchaseGold
  }, [repairMaterialAnalysis, resources.gold])

  /** Пока не осмотрены все теги (и не выбран автоподбор), выбор техник закрыт — без дубля «квиз → техника». */
  const techniquesLocked =
    damageEntries.length > 0 && !useAutoPick && !allTagsInspected

  const canStartTechniqueRepair = useMemo(() => {
    if (!techniquePlan || uncoveredTags.length > 0 || selectedTechniqueIds.length === 0) return false
    if (damageEntries.length > 0 && !useAutoPick && !allTagsInspected) return false
    if (canAffordTechniquePlan) return true
    if (purchaseMissing && canAffordWithShopPurchase && repairMaterialAnalysis && !repairMaterialAnalysis.hasUnbuyableShortfall) {
      return repairMaterialAnalysis.shopPurchaseGold > 0 || canAffordTechniquePlan
    }
    return false
  }, [
    techniquePlan,
    uncoveredTags.length,
    selectedTechniqueIds.length,
    canAffordTechniquePlan,
    purchaseMissing,
    canAffordWithShopPurchase,
    repairMaterialAnalysis,
    damageEntries.length,
    useAutoPick,
    allTagsInspected,
  ])

  const canAffordDeepInspect = useMemo(() => {
    for (const [mat, amount] of Object.entries(WEAPON_DEEP_INSPECT_MATERIAL_COST)) {
      const n = Number(amount)
      if (!n || n <= 0) continue
      const resourceKey = mat as ResourceKey
      if (getAvailableAmountForResourceKey(resources, materialStash, resourceKey) < n) {
        return false
      }
    }
    return true
  }, [resources, materialStash])

  const deepInspectReadyAt = weapon.weaponLegacy?.deepInspectReadyAt
  const deepInspectRemaining =
    deepInspectReadyAt !== undefined && deepInspectReadyAt > nowTick
      ? deepInspectReadyAt - nowTick
      : 0

  const inspectCompleteRef = useRef(false)
  useEffect(() => {
    if (deepInspectReadyAt == null) {
      inspectCompleteRef.current = false
      return
    }
    if (nowTick < deepInspectReadyAt) return
    if (inspectCompleteRef.current) return
    inspectCompleteRef.current = true
    completeWeaponDeepInspect(weapon.id)
  }, [deepInspectReadyAt, nowTick, weapon.id, completeWeaponDeepInspect])

  const lockedTechniqueIdsRef = useRef<string[]>([])
  const lastRepairExecutionOptsRef = useRef<RepairTechniqueExecutionOptions | undefined>(undefined)

  const resumeStageRun = useMemo(
    () =>
      repairTechniqueStageRun?.weaponId === weapon.id
        ? { startedAt: repairTechniqueStageRun.startedAt }
        : null,
    [repairTechniqueStageRun, weapon.id]
  )

  const {
    phase: repairPhase,
    start: startRepairStages,
    cancel: cancelRepairStages,
    progressView,
    displayPlan,
  } = useWeaponRepairStageRun({
    plan: techniquePlan,
    resume: resumeStageRun,
    onStagesComplete: () => {
      const r = executeWeaponRepairByTechniques(
        weapon.id,
        lockedTechniqueIdsRef.current,
        lastRepairExecutionOptsRef.current
      )
      clearRepairTechniqueStageRun()
      if (r.success && r.result) {
        onRepairDone?.(weapon.fullName, r.result)
        setSelectedTechniqueIds([])
        setRepairBenchTechniqueDraft(null)
      }
    },
  })

  const repairPhaseRef = useRef(repairPhase)
  useLayoutEffect(() => {
    repairPhaseRef.current = repairPhase
  }, [repairPhase])

  useLayoutEffect(() => {
    const run = useGameStore.getState().repairTechniqueStageRun
    if (run?.weaponId === weapon.id) {
      lockedTechniqueIdsRef.current = [...run.techniqueIds]
      lastRepairExecutionOptsRef.current = run.executionOpts
    }
  }, [weapon.id, repairTechniqueStageRun])

  useLayoutEffect(() => {
    queueMicrotask(() => {
      if (repairPhaseRef.current === 'running') return
      const s = useGameStore.getState()
      const run = s.repairTechniqueStageRun
      if (run?.weaponId === weapon.id) {
        setSelectedTechniqueIds([...run.techniqueIds])
        return
      }
      const draft = s.repairBenchTechniqueDraft
      if (draft?.weaponId === weapon.id && draft.techniqueIds.length > 0) {
        setSelectedTechniqueIds([...draft.techniqueIds])
        return
      }
      if (damageEntries.length === 0 && durability < maxDurability) {
        setSelectedTechniqueIds([DURABILITY_MAINTENANCE_TECHNIQUE_ID])
        return
      }
      if (damageEntries.length > 0) {
        setSelectedTechniqueIds((prev) =>
          prev.includes(DURABILITY_MAINTENANCE_TECHNIQUE_ID) ? [] : prev
        )
      }
    })
  }, [weapon.id, damageEntries.length, durability, maxDurability, repairPhase])

  useEffect(() => {
    if (repairPhase === 'running') return
    setRepairBenchTechniqueDraft({ weaponId: weapon.id, techniqueIds: selectedTechniqueIds })
  }, [weapon.id, selectedTechniqueIds, repairPhase, setRepairBenchTechniqueDraft])

  useEffect(() => {
    queueMicrotask(() => {
      setPurchaseMissing(false)
      setInspectionTagId(null)
      setInspectionHint(null)
      setExtraRepairOpen(false)
      setInspectionHypothesisByTagId({})
      setUseAutoPick(false)
    })
  }, [weapon.id])

  const inspectionEntry = useMemo(
    () => (inspectionTagId ? getDamageTagInspectionEntryOrFallback(inspectionTagId) : null),
    [inspectionTagId]
  )

  const disableRepairAutoPick = () => {
    setUseAutoPick(false)
    setInspectionHypothesisByTagId({})
    setSelectedTechniqueIds([])
    setRepairBenchTechniqueDraft(null)
    setInspectionTagId(null)
    setInspectionHint(null)
  }

  return (
    <Card className="card-medieval">
      <CardContent className="p-4">
        {!slimHeader && (
          <>
            {/* Заголовок */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                  qualityColors[tier]?.bg || 'bg-stone-900/80'
                )}>
                  <WeaponIcon type={weapon.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-stone-200">{weapon.fullName}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className={cn(
                      'text-xs', 
                      qualityColors[tier]?.text || 'text-stone-400', 
                      qualityColors[tier]?.border || 'border-stone-600'
                    )}>
                      {tierNames[tier] || 'Обычное'}
                    </Badge>
                    <Badge className={cn('text-xs', qualityInfo?.color || 'text-stone-400')}>
                      {qualityInfo?.name || 'Обычное'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <Heart className={cn('w-4 h-4', durabilityColor)} />
                <span className={cn('text-sm font-medium', durabilityColor)}>
                  {durability}%
                </span>
              </div>
              <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all', 
                    durabilityPercent > 75 
                      ? 'bg-green-500' 
                      : durabilityPercent > 50 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  )}
                  style={{ width: `${durabilityPercent}%` }}
                />
              </div>
            </div>
            {maxDurability < 100 && (
              <div className="flex items-center gap-1 text-xs text-stone-500 mb-3">
                <Shield className="w-3 h-3 text-stone-400" />
                <span>max: {maxDurability}%</span>
              </div>
            )}
          </>
        )}

        {showDamagePanel && (
          <div className="mb-3 space-y-2 rounded-lg border border-amber-900/40 bg-stone-900/40 p-2.5">
            {damageEntries.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-amber-200/90">Видимые повреждения</p>
                  <p className="text-[11px] text-stone-500">
                    По каждому тегу выберите вывод кузнеца: от верности гипотезы зависят шанс успеха и учёт
                    для зачарования. Затем подставляются техники из реестра.
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    {!useAutoPick ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={repairPhase === 'running'}
                        className="h-auto min-h-8 w-full max-w-full justify-start whitespace-normal border-stone-600 px-2.5 py-2 text-left text-[11px] leading-snug sm:max-w-xl"
                        onClick={() => {
                          setUseAutoPick(true)
                          setInspectionHypothesisByTagId({})
                          const techs = getApplicableRepairTechniquesForTagsUnlocked(
                            damageEntries.map((e) => e.tagId),
                            useGameStore.getState().unlockedRepairTechniqueIds
                          )
                          setSelectedTechniqueIds(techs.map((t) => t.id))
                        }}
                      >
                        Кузнец подберёт техники (+
                        {Math.round((autoPickMaterialMarkup - 1) * 100)}% к материалам при текущей силе
                        клинка)
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={repairPhase === 'running'}
                          className="h-8 shrink-0 border border-stone-600 bg-stone-800 text-[11px] text-stone-200 hover:bg-stone-700"
                          onClick={disableRepairAutoPick}
                        >
                          Отключить автоподбор
                        </Button>
                        <span className="text-[10px] text-amber-200/80">
                          Автоподбор активен — осмотр по тегам не копит бонус диагностики к зачарованию.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                  <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {damageEntries.map((e) => {
                      const def = getDamageTagById(e.tagId)
                      const active = inspectionTagId === e.tagId
                      return (
                        <button
                          key={`${e.tagId}-${e.severity}`}
                          type="button"
                          onClick={() => {
                            setUseAutoPick(false)
                            setInspectionTagId(e.tagId)
                            setInspectionHint(null)
                          }}
                          className={cn(
                            'rounded-md border px-2 py-1.5 text-left text-xs transition-colors max-w-full',
                            active
                              ? 'border-amber-500 bg-amber-950/40 text-amber-100'
                              : 'border-stone-600 bg-stone-900/50 text-stone-300 hover:border-amber-600/40'
                          )}
                        >
                          <span className="text-stone-200">{def?.label ?? e.tagId}</span>
                          {!workbench && def?.shortDescription ? (
                            <span className="block text-stone-500 mt-0.5 line-clamp-2">
                              {def.shortDescription}
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                  {damageEntries.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {useAutoPick ? (
                        <p className="text-[10px] text-stone-500">
                          Диагноз по тегам: пропущен (автоподбор) — учёт для зачарования без «честного» осмотра.
                        </p>
                      ) : (
                        damageEntries.map((e) => {
                          const h = inspectionHypothesisByTagId[e.tagId]
                          if (h === undefined) return null
                          const def = getDamageTagById(e.tagId)
                          return (
                            <p key={`diag-${e.tagId}`} className="text-[10px] text-stone-400">
                              <span className="text-stone-500">{def?.label ?? e.tagId}:</span>{' '}
                              Диагноз — {h ? 'уверенный' : 'ошибочный'}
                            </p>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
                {inspectionTagId && inspectionEntry && (
                  <div className="min-w-0 rounded-lg border border-stone-600/70 bg-stone-950/50 p-2.5 space-y-2 min-h-[4rem] lg:z-10">
                    <p className="text-xs font-medium text-stone-200">{inspectionEntry.prompt}</p>
                    <div className="space-y-1.5">
                      {inspectionEntry.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={repairPhase === 'running'}
                          onClick={() => {
                            if (!inspectionTagId) return
                            setUseAutoPick(false)
                            setInspectionHypothesisByTagId((prev) => {
                              const next = { ...prev, [inspectionTagId]: opt.isCorrect }
                              const all = damageEntries.every((e) => e.tagId in next)
                              if (all) {
                                queueMicrotask(() => {
                                  const techs = getApplicableRepairTechniquesForTagsUnlocked(
                                    damageEntries.map((e) => e.tagId),
                                    useGameStore.getState().unlockedRepairTechniqueIds
                                  )
                                  setSelectedTechniqueIds(techs.map((t) => t.id))
                                })
                              }
                              return next
                            })
                            if (opt.isCorrect) {
                              setInspectionHint('Верно. Ниже подставлены техники; при необходимости снимите лишнее.')
                            } else {
                              setInspectionHint(
                                'Спорная гипотеза — ремонт возможен, но шанс успеха ниже.'
                              )
                            }
                          }}
                          className="w-full text-left rounded border border-stone-700 bg-stone-900/60 px-2 py-1.5 text-[11px] text-stone-300 hover:border-amber-700/50 disabled:opacity-50"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                    {inspectionHint && (
                      <p className="text-[11px] text-amber-200/85 border-t border-stone-800 pt-2">
                        {inspectionHint}
                      </p>
                    )}
                  </div>
                )}
              </div>
              </div>
            )}
            {prepNeeded && (
              <div className="flex gap-2 rounded border border-violet-700/50 bg-violet-950/30 p-2 text-xs text-violet-200/95">
                <AlertTriangle className="w-4 h-4 shrink-0 text-violet-400" />
                <span>
                  G2/G3: для части меток нужна подготовка к основному ремонту. Ниже — выбор техник и
                  предпросмотр плана; итоговый бросок успеха — как после последнего этапа плана.
                </span>
              </div>
            )}
            <Collapsible open={extraRepairOpen} onOpenChange={setExtraRepairOpen}>
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-md border border-stone-700/80 bg-stone-900/40 px-2.5 py-2 text-left text-xs text-stone-400 hover:text-stone-200"
              >
                <span>Дополнительно: осмотр углём и авто-ремонт</span>
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 transition-transform', extraRepairOpen && 'rotate-180')}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                <p className="text-[10px] text-stone-500 leading-snug">
                  Быстрый авто-ремонт за золото не копит бонус к будущему зачарованию за счёт диагностики — только
                  честный осмотр по тегам выше.
                </p>
                <p className="text-[10px] text-stone-500 leading-snug">
                  Скрытый множитель наград: ×{(weapon.epicMultiplier ?? 1).toFixed(2)} (учитывается при вылазках и
                  распылении; в основной карточке не показывается).
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {damageEntries.length > 0 && (
                    <button
                      type="button"
                      disabled={
                        deepInspectRemaining > 0 || (!canAffordDeepInspect && deepInspectReadyAt == null)
                      }
                      onClick={() => startWeaponDeepInspect(weapon.id)}
                      className={cn(
                        'inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                        deepInspectRemaining > 0 || (canAffordDeepInspect && deepInspectReadyAt == null)
                          ? 'border-stone-600 bg-stone-800/80 text-stone-200 hover:border-amber-600/50'
                          : 'border-stone-800 opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Search className="w-3.5 h-3.5" />
                      {deepInspectRemaining > 0
                        ? `Осмотр… ${formatCountdownMs(deepInspectRemaining)}`
                        : `Осмотреть глубже (уголь ×${WEAPON_DEEP_INSPECT_MATERIAL_COST.coal}, ${Math.round(WEAPON_DEEP_INSPECT_DURATION_MS / 1000)} с)`}
                    </button>
                  )}
                  {canQueueAuto && (
                    <>
                      {!awaitingForgeVisit && (
                        <>
                          <button
                            type="button"
                            disabled={!canPayAutoRepair}
                            onClick={() => claimWeaponAutoRepair(weapon.id)}
                            className={cn(
                              'inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                              canPayAutoRepair
                                ? 'border-amber-600/60 bg-amber-950/40 text-amber-100 hover:bg-amber-950/60'
                                : 'border-stone-800 opacity-50 cursor-not-allowed'
                            )}
                          >
                            Авто-ремонт за {autoRepairGoldCost} золота
                          </button>
                          <button
                            type="button"
                            onClick={() => scheduleWeaponAutoRepair(weapon.id)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-stone-600 bg-stone-800/80 px-2.5 py-1.5 text-xs text-stone-200 hover:border-amber-600/50"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            В очередь при следующем заходе в кузницу
                          </button>
                        </>
                      )}
                      {awaitingForgeVisit && (
                        <p className="text-[11px] text-amber-400/90">
                          Авто-ремонт в очереди на кузницу — готовность обновится при открытии этой вкладки.
                          Затем оплатите авто-ремонт золотом, как обычно.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            {(lastInspect !== undefined || displayInspectNotes.length > 0) && (
              <div className="rounded border border-stone-700/60 bg-stone-950/50 p-2 text-xs text-stone-400">
                <p className="mb-1 font-medium text-stone-300">Запись осмотра</p>
                {displayInspectNotes.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {displayInspectNotes.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-stone-500">
                    Осмотр оплачен ранее; тексты подсказок не сохранены (старый сейв).
                  </p>
                )}
                {lastInspect !== undefined && (
                  <p className="mt-1.5 text-stone-600">
                    {new Date(lastInspect).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            {(bladeBond > 0 || autoRepairDone > 0) && (
              <div className="text-xs text-stone-500 space-y-0.5">
                {bladeBond > 0 && (
                  <p>Связь с клинком (тяжёлые ремонты): {bladeBond}</p>
                )}
                {autoRepairDone > 0 && (
                  <p>Завершённых авто-ремонтов: {autoRepairDone}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Накопленные свойства (Душа Войны и т.д.) — на верстаке ремонта не дублируем инвентарь; множитель наград — в «Дополнительно» */}
        {!workbench && (
        <div className="pt-3 border-t border-stone-700/50 mb-3">
          <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Накопленные свойства</span>
          </p>
          
          <div className="flex flex-wrap gap-2">
            {/* Душа Войны */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-help transition-colors',
                  weapon.warSoul > 0 
                    ? 'bg-purple-900/30 border-purple-600/50 text-purple-400'
                    : 'bg-stone-800/80 border-stone-700/50 text-stone-500'
                )}>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-stone-400">Душа:</span>
                  <span className={cn(
                    'text-sm font-semibold', 
                    weapon.warSoul > 0 ? 'text-purple-400' : 'text-stone-500'
                  )}>
                    {weapon.warSoul}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-semibold text-purple-400">Душа Войны: {weapon.warSoul}</p>
                <p className="text-xs text-stone-400 mt-1">
                  {weapon.warSoul > 0 
                    ? 'Накоплена в экспедициях. Используется для зачарований в Алтаре.'
                    : 'При распылении даёт эссенцию душ.'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Количество экспедиций */}
            {(weapon.adventureCount ?? 0) > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-stone-800/80 border-stone-700/50 text-stone-400 cursor-help">
                    <Map className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs text-stone-400">Вылазок:</span>
                    <span className="text-sm font-semibold text-stone-300">
                      {weapon.adventureCount ?? 0}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold text-stone-300">Экспедиций: {weapon.adventureCount ?? 0}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Количество завершённых приключений с этим оружием.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        )}
        
        {/* Разделитель */}
        <div className="h-px bg-stone-700/50 my-3" />

        {useTechniqueRepair ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Wrench className="w-4 h-4 text-stone-400" />
              <span>Починка по техникам</span>
            </div>
            <p className="text-xs text-stone-500">
              {damageEntries.length > 0 ? (
                <>
                  Отметьте техники, закрывающие все видимые повреждения. Запустите этапы по таймеру, затем
                  финальный бросок и списание ресурсов при успехе.
                </>
              ) : (
                <>
                  Видимых сколов нет — восстановите прочность сервисной техникой. Стоимость как у обычного
                  ремонта по рецепту оружия. Этапы по таймеру, затем бросок и списание при успехе.
                </>
              )}
            </p>
            {applicableTechniques.length === 0 ? (
              <p className="text-xs text-amber-600/90">Нет техник в реестре для текущих меток.</p>
            ) : (
              <div className="space-y-2">
                {techniquesLocked && (
                  <p className="text-[10px] text-stone-500">
                    Сначала отметьте вывод по каждому тегу выше или нажмите «Кузнец подберёт техники».
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                {applicableTechniques.map((tech) => {
                  const on = selectedTechniqueIds.includes(tech.id)
                  const lockDurabilityOnly =
                    damageEntries.length === 0 && applicableTechniques.length === 1
                  const techUnlocked = isRepairTechniqueUnlocked(tech.id, unlockedRepairTechniqueIds)
                  const specLocked = tech.repairTier === 'specialized' && !techUnlocked
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      disabled={
                        repairPhase === 'running' ||
                        techniquesLocked ||
                        specLocked ||
                        (lockDurabilityOnly && on)
                      }
                      onClick={() => {
                        if (lockDurabilityOnly || techniquesLocked || specLocked) return
                        setSelectedTechniqueIds((prev) =>
                          prev.includes(tech.id) ? prev.filter((x) => x !== tech.id) : [...prev, tech.id]
                        )
                      }}
                      className={cn(
                        'rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors max-w-full',
                        repairPhase === 'running' || techniquesLocked || specLocked
                          ? 'opacity-60 cursor-not-allowed'
                          : '',
                        on
                          ? 'border-amber-500 bg-amber-900/25 text-amber-100'
                          : 'border-stone-600 bg-stone-900/40 text-stone-300 hover:border-stone-500'
                      )}
                    >
                      <span className="flex flex-wrap items-center gap-1.5 font-medium text-stone-200">
                        {tech.name}
                        {tech.repairTier === 'basic' ? (
                          <span className="text-[10px] font-normal text-stone-500">Базовая</span>
                        ) : techUnlocked ? (
                          <span className="text-[10px] font-normal text-emerald-500/90">Спец.</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-amber-500/90">
                            <Lock className="w-3 h-3" />
                            интендант
                          </span>
                        )}
                      </span>
                      <span className="block text-stone-500 mt-0.5 line-clamp-2">{tech.description}</span>
                      {specLocked ? (
                        <span className="block text-[10px] text-amber-600/90 mt-1">
                          Купите технику у интенданта гильдии.
                        </span>
                      ) : null}
                    </button>
                  )
                })}
                </div>
              </div>
            )}
            {uncoveredTags.length > 0 && selectedTechniqueIds.length > 0 && (
              <div className="rounded border border-amber-800/60 bg-amber-950/30 p-2 text-xs text-amber-200/90">
                Остались незакрытые повреждения:{' '}
                {uncoveredTags
                  .map((id) => getDamageTagById(id)?.label ?? id)
                  .join(', ')}
              </div>
            )}
            {techniquePlan && techniqueCost && repairMaterialAnalysis && (
              <div className="rounded-lg border border-stone-700/60 bg-stone-900/40 p-2.5 text-xs text-stone-400 space-y-2">
                <p>
                  Этапов: <span className="text-stone-200">{techniquePlan.stages.length}</span>
                  {Object.keys(techniqueCost.materials).length === 0
                    ? ' · только время работы'
                    : null}
                </p>
                {repairMaterialAnalysis.rows.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-stone-300">Материалы</p>
                    <ul className="space-y-1 border border-stone-700/50 rounded-md divide-y divide-stone-800/80">
                      {repairMaterialAnalysis.rows.map((row) => {
                        const refiningHint =
                          row.short > 0
                            ? formatRepairRefiningHint(row.key, row.short, player.level)
                            : null
                        return (
                          <li key={row.key}>
                            <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 text-[11px]">
                              <span className="text-stone-200">{row.label}</span>
                              <span
                                className={cn(
                                  row.short > 0 ? 'text-amber-300/90' : 'text-stone-400'
                                )}
                              >
                                есть {Math.floor(row.available)} / нужно {row.needed}
                              </span>
                            </div>
                            {refiningHint ? (
                              <p className="px-2 pb-1.5 text-[10px] text-stone-500 leading-snug">
                                {refiningHint}
                              </p>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                    {repairMaterialAnalysis.hasUnbuyableShortfall && !canAffordTechniquePlan && (
                      <p className="text-[11px] text-amber-200/85">
                        Недостаёт ресурсов, недоступных в магазине — добывайте в экспедициях или перерабатывайте в
                        кузнице.
                      </p>
                    )}
                    {repairMaterialAnalysis.rows.some((r) => r.short > 0 && r.buyable) && (
                      <div className="flex items-start gap-2 pt-1">
                        <Checkbox
                          id="repair-buy-missing"
                          checked={purchaseMissing}
                          onCheckedChange={(v) => setPurchaseMissing(v === true)}
                        />
                        <Label
                          htmlFor="repair-buy-missing"
                          className="text-[11px] text-stone-300 font-normal leading-snug cursor-pointer"
                        >
                          Закупить недостающее в магазине
                          {purchaseMissing && repairMaterialAnalysis.shopPurchaseGold > 0 ? (
                            <span className="block text-amber-200/90 mt-0.5">
                              К оплате: {repairMaterialAnalysis.shopPurchaseGold} золота
                            </span>
                          ) : null}
                        </Label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {repairPhase === 'running' && displayPlan && progressView ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-amber-800/50 bg-stone-950/60 p-3 space-y-2">
                  <p className="text-xs text-amber-200/90 font-medium">
                    Этап {progressView.stageIndex + 1} / {displayPlan.stages.length}
                  </p>
                  <p className="text-sm text-stone-200">
                    {displayPlan.stages[progressView.stageIndex]?.name}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {REPAIR_STAGE_CATEGORY_LABEL[displayPlan.stages[progressView.stageIndex]?.category ?? ''] ??
                      ''}
                    {' · '}
                    {displayPlan.stages[progressView.stageIndex]?.sourceTechniqueName}
                  </p>
                  <Progress value={progressView.progressInStage} className="h-2 bg-stone-800" />
                  <ul className="space-y-1 max-h-28 overflow-y-auto text-[11px]">
                    {displayPlan.stages.map((s, i) => (
                      <li key={s.order} className="flex items-start gap-2">
                        {i < progressView.stageIndex ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        ) : i === progressView.stageIndex ? (
                          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-3.5 h-3.5 mt-0.5 rounded-full border border-stone-600 shrink-0 inline-block" />
                        )}
                        <span
                          className={cn(
                            i <= progressView.stageIndex ? 'text-stone-300' : 'text-stone-600'
                          )}
                        >
                          {s.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-800">
                    После последнего этапа — бросок на успех и списание стоимости плана.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    cancelRepairStages()
                    clearRepairTechniqueStageRun()
                    setRepairBenchTechniqueDraft({
                      weaponId: weapon.id,
                      techniqueIds: selectedTechniqueIds,
                    })
                  }}
                  className="w-full rounded-lg border border-stone-600 bg-stone-900/80 px-3 py-2 text-xs text-stone-300 hover:border-red-800/60 hover:text-red-300"
                >
                  Отменить работу
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={
                  !techniquePlan ||
                  uncoveredTags.length > 0 ||
                  !canStartTechniqueRepair ||
                  selectedTechniqueIds.length === 0 ||
                  repairPhase === 'running'
                }
                onClick={() => {
                  if (
                    purchaseMissing &&
                    repairMaterialAnalysis &&
                    repairMaterialAnalysis.shopPurchaseGold > 0
                  ) {
                    if (!spendResource('gold', repairMaterialAnalysis.shopPurchaseGold)) return
                    for (const row of repairMaterialAnalysis.rows) {
                      if (row.short > 0 && row.buyable) {
                        grantResourceKeyFromWorld(row.key, row.short)
                      }
                    }
                  }
                  if (damageEntries.length > 0) {
                    if (useAutoPick) {
                      lastRepairExecutionOptsRef.current = {
                        diagnosis: { mode: 'auto_pick' },
                        materialCostMultiplier: autoPickMaterialMarkup,
                      }
                    } else {
                      lastRepairExecutionOptsRef.current = {
                        diagnosis: {
                          mode: 'manual_inspection',
                          hypothesisByTagId: inspectionHypothesisByTagId,
                        },
                      }
                    }
                  } else {
                    lastRepairExecutionOptsRef.current = undefined
                  }
                  lockedTechniqueIdsRef.current = [...selectedTechniqueIds]
                  const t = Date.now()
                  beginRepairTechniqueStageRun({
                    weaponId: weapon.id,
                    techniqueIds: lockedTechniqueIdsRef.current,
                    executionOpts: lastRepairExecutionOptsRef.current,
                    startedAt: t,
                  })
                  startRepairStages(t)
                }}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                  techniquePlan &&
                    uncoveredTags.length === 0 &&
                    canStartTechniqueRepair &&
                    selectedTechniqueIds.length > 0
                    ? 'border-amber-600 bg-amber-950/50 text-amber-100 hover:bg-amber-950/70'
                    : 'border-stone-700 bg-stone-900/50 text-stone-500 cursor-not-allowed opacity-60'
                )}
              >
                Начать ремонт (этапы)
              </button>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
