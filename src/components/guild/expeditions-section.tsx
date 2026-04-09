/**
 * Expeditions Section
 * Секция экспедиций для гильдии
 * Версия 2.0 — с расширенной системой найма
 */

'use client'

import { AnimatePresence } from 'framer-motion'
import {
  Sword,
  Scroll,
  Compass,
  Skull,
  Timer,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { TooltipProvider } from '@/components/ui/game-tooltip'
import { useGameStore } from '@/store'
import { useState, useEffect, useMemo } from 'react'
import { Adventurer, getMaxActiveExpeditions } from '@/types/guild'
import type { ExpeditionDevBalanceTweaks } from '@/types/guild'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import { missionModuleToCalculatorTemplate } from '@/lib/expedition-mission-bridge'
import {
  getAvailableLocations,
  getMissionsForLocation,
} from '@/modules/expeditions'
import { EXPEDITION_DEV_UI_ENABLED } from '@/lib/expedition-dev-tools'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

// Импорт вынесенных компонентов
import { ActiveExpeditionCard } from './active-expedition-card'
import { RecoveryQuestCard } from './recovery-quest-card'
import { RecruitmentInterface } from './recruitment-interface'
import { ExpeditionHistoryEntryComponent } from './expedition-history-entry'
import { WeaponSelectionCard } from './expeditions'
import { ExpeditionLocationMissionBoard } from './expeditions/ExpeditionLocationMissionBoard'
import { ExpeditionMissionBrief } from './expeditions/ExpeditionMissionBrief'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ForgottenForgeQuestCard } from './forgotten-forge-quest-card'
import { FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP } from '@/data/quests/forgotten-forge'
import { getForgottenForgeLinkedQuestIdForExpedition } from '@/lib/quests/forgotten-forge-expedition-link'

// Автосохранение
import { debouncedSaveDraft, clearDraft, loadDraft, DraftStatus, getDraftStatus } from '@/lib/expedition-draft'

// Импорт конвертеров и типов
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { convertToLegacy, convertToExtended, mapExpeditionForRecruitment, mapWeaponForRecruitment } from '@/lib/adventurer-converter'
import type { ContractTier, ContractedAdventurer } from '@/types/contract'
// Импорт системы модификаторов
import { calculateExpeditionResult, type ExpeditionCalculation } from '@/lib/expedition-calculator-v2'
import { validateExpeditionStart } from '@/lib/expedition-start-validation'
import { getWeaponGuildServiceBlockReason } from '@/lib/guild-weapon-service-eligibility'
import {
  shouldPromptExpeditionWorkbenchQueueDialog,
  countPlannedWorkbenchItemsForWeapon,
} from '@/lib/workbench/workbench-expedition-guard'
import { WorkbenchPlannedQueueAlert } from '@/components/shared/workbench-planned-queue-alert'

// ExpeditionCard теперь импортируется как ExpeditionSelectionCard

// WeaponCard теперь импортируется как WeaponSelectionCard

export function ExpeditionsSection() {
  const guild = useGameStore((state) => state.guild)
  const resources = useGameStore((state) => state.resources)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const workbenchQueue = useGameStore((state) => state.workbenchQueue)
  const repairTechniqueStageRun = useGameStore((state) => state.repairTechniqueStageRun)
  const removeAllPlannedWorkbenchItemsForWeapon = useGameStore(
    (state) => state.removeAllPlannedWorkbenchItemsForWeapon
  )
  const initializeAdventurers = useGameStore((state) => state.initializeAdventurers)
  const startExpeditionFull = useGameStore((state) => state.startExpeditionFull)
  const offerGuildContract = useGameStore((state) => state.offerGuildContract)
  const tickForgottenForgeQuestAvailability = useGameStore(
    (state) => state.tickForgottenForgeQuestAvailability
  )
  const forgottenForgeQuest = useGameStore((state) => state.forgottenForgeQuest)
  const forgottenForgePhase = useGameStore((state) => state.forgottenForgePhase)

  const forgottenForgeQuestLocationId = useMemo(() => {
    if (forgottenForgeQuest.status !== 'active' || forgottenForgePhase !== 'awaiting_expedition') {
      return undefined
    }
    return FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP[forgottenForgeQuest.step]
  }, [forgottenForgeQuest.status, forgottenForgeQuest.step, forgottenForgePhase])

  const [selectedExpedition, setSelectedExpedition] = useState<ExpeditionTemplate | null>(null)
  const [selectedWeapon, setSelectedWeapon] = useState<CraftedWeaponV2 | null>(null)
  const [selectedAdventurer, setSelectedAdventurer] = useState<Adventurer | null>(null)

  // Расширенный искатель (из RecruitmentInterface)
  const [selectedExtendedAdventurer, setSelectedExtendedAdventurer] = useState<AdventurerExtended | null>(null)

  // Статус черновика для UI
  const [draftStatus, setDraftStatus] = useState<DraftStatus | null>(null)

  const [missionContract, setMissionContract] = useState<'exploration' | 'speed'>('exploration')
  const [expeditionSubTab, setExpeditionSubTab] = useState<'expeditions' | 'special'>('expeditions')
  const [showBalancePanel, setShowBalancePanel] = useState(false)
  const [expeditionWorkbenchQueueWeapon, setExpeditionWorkbenchQueueWeapon] =
    useState<CraftedWeaponV2 | null>(null)
  const [devBalance, setDevBalance] = useState<ExpeditionDevBalanceTweaks>({
    eventGoldMultiplier: 1,
    qualityShift: 0,
    durationMultiplier: 1,
    materialQuantityMultiplier: 1,
    materialRarityMultiplier: 1,
  })

  const allMissionTemplates = useMemo(() => {
    const locs = getAvailableLocations(guild.level)
    const out: ExpeditionTemplate[] = []
    for (const loc of locs) {
      for (const m of getMissionsForLocation(loc.id)) {
        out.push(missionModuleToCalculatorTemplate(m))
      }
    }
    return out
  }, [guild.level])

  // Контрактные искатели из расширенного состояния гильдии
  const contractedAdventurers: ContractedAdventurer[] = guild.contractedAdventurers
  
  // Подсчёт миссий для каждого искателя из истории
  const getAdventurerStats = (adventurerId: string) => {
    // Ищем в истории по имени (т.к. ID могут отличаться)
    const entries = guild.history.filter(e => 
      e.adventurerData?.id === adventurerId || 
      e.adventurerName === (guild.history.find(h => h.adventurerData?.id === adventurerId)?.adventurerName)
    )
    const missionCount = entries.length
    const successCount = entries.filter(e => e.success).length
    const successRate = missionCount > 0 ? Math.round((successCount / missionCount) * 100) : 0
    return { missionCount, successRate }
  }
  
  // Проверка, есть ли уже контракт с этим искателем
  const isAlreadyContracted = (adventurerId: string) => {
    return contractedAdventurers.some((c: ContractedAdventurer) => c.adventurerId === adventurerId)
  }
  
  // Обработка предложения контракта
  const handleOfferContract = (
    adventurer: Adventurer,
    tier: ContractTier,
    adventurerExtended?: AdventurerExtended | null
  ) => {
    offerGuildContract(adventurer, tier, adventurerExtended ?? undefined)
  }

  // Восстановление черновика при загрузке
  useEffect(() => {
    const draft = loadDraft()
    queueMicrotask(() => {
      if (draft && !draft.isExpired) {
        if (draft.expeditionId) {
          const expedition = allMissionTemplates.find((e) => e.id === draft.expeditionId)
          if (expedition) setSelectedExpedition(expedition)
        }
        if (draft.weaponId) {
          const weapon = weaponInventory.weapons.find(w => w.id === draft.weaponId)
          if (weapon) setSelectedWeapon(weapon)
        }
      }
      setDraftStatus(getDraftStatus())
    })
  }, [allMissionTemplates, weaponInventory.weapons])

  // Автосохранение при изменении выбора
  useEffect(() => {
    debouncedSaveDraft(selectedExpedition, selectedExtendedAdventurer, selectedWeapon)
    queueMicrotask(() => setDraftStatus(getDraftStatus()))
  }, [selectedExpedition, selectedWeapon, selectedExtendedAdventurer])

  // Инициализация искателей
  useEffect(() => {
    initializeAdventurers()
  }, [initializeAdventurers])

  useEffect(() => {
    tickForgottenForgeQuestAvailability()
  }, [tickForgottenForgeQuestAvailability, guild.level])

  const workbenchEligibility = useMemo(
    () => ({ workbenchQueue, repairTechniqueStageRun }),
    [workbenchQueue, repairTechniqueStageRun]
  )

  // Проверка возможности выбрать экспедицию
  const canSelectExpedition = (_expedition: ExpeditionTemplate): { can: boolean; reason: string } => {
    return { can: true, reason: '' }
  }

  // Проверка возможности выбрать оружие (v2 - CraftedWeaponV2)
  const canSelectWeapon = (weapon: CraftedWeaponV2): { can: boolean; reason: string } => {
    if (!selectedExpedition) {
      return { can: false, reason: 'Сначала выберите экспедицию' }
    }
    const guildBlock = getWeaponGuildServiceBlockReason(weapon, [], workbenchEligibility)
    if (guildBlock) {
      return { can: false, reason: guildBlock }
    }
    if (weapon.currentDurability <= 10) {
      return { can: false, reason: 'Оружие слишком повреждено' }
    }
    if (weapon.stats.attack < selectedExpedition.minWeaponAttack) {
      return { can: false, reason: `Требуется атака ${selectedExpedition.minWeaponAttack}+` }
    }
    return { can: true, reason: '' }
  }

  /** Базовый список кандидатов (без оружия на верстаке, если оно не проходит фильтр) */
  const baseFilteredWeapons = useMemo(() => {
    return weaponInventory.weapons.filter((w) => {
      if (w.currentDurability <= 10) return false
      if (guild.activeExpeditions.some((e) => e.weaponId === w.id)) return false
      if (selectedExpedition && w.stats.attack < selectedExpedition.minWeaponAttack) {
        return false
      }
      return true
    })
  }, [weaponInventory.weapons, guild.activeExpeditions, selectedExpedition])

  const displayWeapons = baseFilteredWeapons

  // Запуск экспедиции (v2 - используем startExpeditionFull)
  const handleStartExpedition = () => {
    if (!selectedExpedition || !selectedWeapon || !selectedAdventurer) return

    const linkedQuestId = getForgottenForgeLinkedQuestIdForExpedition(
      selectedExpedition,
      forgottenForgeQuest,
      forgottenForgePhase
    )

    const success = startExpeditionFull(
      selectedExpedition,
      selectedAdventurer,
      selectedWeapon,
      selectedExtendedAdventurer ?? convertToExtended(selectedAdventurer),
      {
        contractOverride: missionContract,
        ...(EXPEDITION_DEV_UI_ENABLED ? { devBalance } : {}),
        ...(linkedQuestId ? { linkedQuestId } : {}),
      }
    )
    if (success) {
      // Очищаем черновик при успешной отправке
      clearDraft()
      setDraftStatus(null)

      setSelectedExpedition(null)
      setSelectedWeapon(null)
      setSelectedAdventurer(null)
      setSelectedExtendedAdventurer(null)
    }
  }

  // Обработка выбора расширенного искателя
  const handleExtendedAdventurerSelect = (extended: AdventurerExtended) => {
    setSelectedExtendedAdventurer(extended)
    // Конвертируем в старый формат для совместимости
    const legacyAdventurer = convertToLegacy(extended)
    legacyAdventurer.id = `ext-${extended.id}` // Уникальный ID для расширенного
    setSelectedAdventurer(legacyAdventurer)
  }

  // Расчёт модификаторов экспедиции (v2 - CraftedWeaponV2 с новыми полями)
  const expeditionCalculation = useMemo<ExpeditionCalculation | null>(() => {
    if (!selectedExpedition || !selectedWeapon || !selectedAdventurer) return null

    // Единый путь v2: из пула берём extended через convertToExtended; из Recruitment — уже extended
    const extendedAdventurer = selectedExtendedAdventurer || convertToExtended(selectedAdventurer)

    return calculateExpeditionResult(
      extendedAdventurer,
      selectedExpedition,
      guild.level,
      selectedWeapon.stats.attack,
      selectedWeapon.currentDurability,
      selectedWeapon.type,
      selectedWeapon.id,
      // Новые параметры для системы модификаторов
      selectedWeapon.qualityRank,
      selectedWeapon.epicMultiplier,
      selectedWeapon.combatMaterialId,
      selectedWeapon.quality,
      missionContract
    )
  }, [selectedExpedition, selectedWeapon, selectedAdventurer, selectedExtendedAdventurer, guild.level, missionContract])

  const expeditionLaunchCheck = useMemo(() => {
    if (!selectedExpedition || !selectedWeapon || !selectedAdventurer) {
      return { can: false as const, reason: '' }
    }
    const base = validateExpeditionStart({
      expedition: selectedExpedition,
      adventurer: selectedAdventurer,
      weapon: selectedWeapon,
      guildLevel: guild.level,
      activeExpeditions: guild.activeExpeditions,
      workbenchEligibility,
    })
    if (!base.can) return base
    if (
      forgottenForgeQuest.status === 'active' &&
      forgottenForgePhase === 'awaiting_expedition' &&
      forgottenForgeQuest.step === 5
    ) {
      const need = FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP[5]
      const loc = selectedExpedition.moduleLocationId
      if (
        need &&
        loc === need &&
        forgottenForgeQuest.flags.step5Cleanse !== 'magic' &&
        forgottenForgeQuest.flags.step5Cleanse !== 'physical'
      ) {
        return {
          can: false as const,
          reason: 'В особом задании выберите способ очистки чаши (магия или физически)',
        }
      }
    }
    return base
  }, [
    selectedExpedition,
    selectedWeapon,
    selectedAdventurer,
    guild.level,
    guild.activeExpeditions,
    workbenchEligibility,
    forgottenForgeQuest.status,
    forgottenForgeQuest.step,
    forgottenForgeQuest.flags.step5Cleanse,
    forgottenForgePhase,
  ])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Активные экспедиции */}
        {guild.activeExpeditions.length > 0 && (
          <Card className="card-medieval">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Активные экспедиции
                <Badge variant="outline" className="ml-2 text-xs">
                  {guild.activeExpeditions.length} / {getMaxActiveExpeditions(guild.level)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {guild.activeExpeditions.map(expedition => (
                    <ActiveExpeditionCard key={expedition.id} expedition={expedition} />
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Квесты восстановления */}
        {guild.recoveryQuests.filter(q => q.status !== 'declined').length > 0 && (
          <Card className="card-medieval border-red-600/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Skull className="w-5 h-5" />
                Потерянное оружие
              </CardTitle>
              <CardDescription>Оружие, потерянное в неудачных экспедициях</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guild.recoveryQuests
                  .filter(q => q.status !== 'declined')
                  .map(quest => (
                    <RecoveryQuestCard key={quest.id} quest={quest} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          value={expeditionSubTab}
          onValueChange={(v) => setExpeditionSubTab(v as 'expeditions' | 'special')}
          className="w-full"
        >
          <TabsList className="bg-stone-900/80 border border-stone-700/60 w-full sm:w-auto justify-start flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="expeditions" className="data-[state=active]:bg-amber-900/40">
              Доступные экспедиции
            </TabsTrigger>
            <TabsTrigger value="special" className="data-[state=active]:bg-amber-900/40">
              Особые задания
            </TabsTrigger>
          </TabsList>

          <TabsContent value="special" className="mt-4 space-y-4">
            <ForgottenForgeQuestCard
              onGoToExpeditionsTab={() => setExpeditionSubTab('expeditions')}
            />
          </TabsContent>

          <TabsContent value="expeditions" className="mt-4 space-y-6">
        {/* Выбор экспедиции */}
        <Card className="card-medieval">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Доступные экспедиции
              </CardTitle>
              <CardDescription>
                Миссии по локациям модуля экспедиций — доступность зависит от уровня гильдии
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {draftStatus?.hasDraft && (
                <Badge variant="outline" className="text-amber-400 border-amber-600/50">
                  Черновик сохранён
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ExpeditionLocationMissionBoard
              guildLevel={guild.level}
              selectedId={selectedExpedition?.id ?? null}
              questLocationId={forgottenForgeQuestLocationId}
              canSelectExpedition={canSelectExpedition}
              onSelectedMissionInvalidated={() => {
                setSelectedExpedition(null)
                setSelectedWeapon(null)
                setSelectedAdventurer(null)
                setSelectedExtendedAdventurer(null)
              }}
              onSelectExpedition={(expedition) => {
                setSelectedExpedition(expedition)
                setSelectedWeapon(null)
                setSelectedAdventurer(null)
                setSelectedExtendedAdventurer(null)
              }}
            />
          </CardContent>
        </Card>

        {/* Выбор оружия */}
        {selectedExpedition && (
          <Card className="card-medieval">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Sword className="w-5 h-5" />
                Выберите оружие
              </CardTitle>
              <CardDescription>
                Требуется атака {selectedExpedition.minWeaponAttack}+
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayWeapons.length === 0 ? (
                <p className="text-stone-500 text-center py-4">
                  Нет подходящего оружия. Создайте оружие в кузнице.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {displayWeapons.map((weapon) => {
                      const { can, reason } = canSelectWeapon(weapon)
                      const isRepairBench = workbenchQueue.some(
                        (i) =>
                          i.weaponId === weapon.id &&
                          (i.status === 'planned' || i.status === 'running')
                      )
                      return (
                        <WeaponSelectionCard
                          key={weapon.id}
                          weapon={weapon}
                          isSelected={selectedWeapon?.id === weapon.id}
                          canSelect={can}
                          reason={reason}
                          isRepairBench={isRepairBench}
                          onSelect={() => {
                            if (!can) return
                            if (
                              shouldPromptExpeditionWorkbenchQueueDialog(
                                weapon.id,
                                workbenchQueue,
                                repairTechniqueStageRun
                              )
                            ) {
                              setExpeditionWorkbenchQueueWeapon(weapon)
                              return
                            }
                            setSelectedWeapon(weapon)
                            setSelectedAdventurer(null)
                          }}
                        />
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Поиск искателей */}
        {selectedWeapon && selectedExpedition && (
          <RecruitmentInterface
            expedition={mapExpeditionForRecruitment(selectedExpedition)}
            weapon={mapWeaponForRecruitment({
              id: selectedWeapon.id,
              name: selectedWeapon.fullName,
              attack: selectedWeapon.stats.attack,
              durability: selectedWeapon.currentDurability ?? selectedWeapon.stats.durability,
            })}
            guildLevel={guild.level}
            onSelect={handleExtendedAdventurerSelect}
            onCancel={() => {
              setSelectedExtendedAdventurer(null)
              setSelectedAdventurer(null)
            }}
          />
        )}

        {selectedExpedition && selectedWeapon && selectedAdventurer && expeditionCalculation && (
          <ExpeditionMissionBrief
            expedition={selectedExpedition}
            calculation={expeditionCalculation}
            missionContract={missionContract}
            onMissionContractChange={setMissionContract}
            adventurerName={selectedAdventurer.name}
            weaponName={selectedWeapon.fullName}
            onLaunch={handleStartExpedition}
            canLaunch={expeditionLaunchCheck.can}
            launchBlockedReason={expeditionLaunchCheck.reason}
            devControls={
              EXPEDITION_DEV_UI_ENABLED ? (
                <div className="rounded-lg border border-dashed border-amber-700/50 bg-stone-950/40 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-amber-200/90">Отладка баланса</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-amber-700/40"
                      onClick={() => setShowBalancePanel((v) => !v)}
                    >
                      {showBalancePanel ? 'Скрыть' : 'Коэффициенты'}
                    </Button>
                  </div>
                  {showBalancePanel && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                      <div className="space-y-2">
                        <Label className="text-xs text-stone-400">
                          Длительность миссии (таймер) ×{devBalance.durationMultiplier.toFixed(1)}
                        </Label>
                        <Slider
                          value={[devBalance.durationMultiplier]}
                          onValueChange={([v]) =>
                            setDevBalance((p) => ({ ...p, durationMultiplier: v }))
                          }
                          min={0.1}
                          max={3}
                          step={0.1}
                        />
                        <p className="text-[10px] text-stone-600">&gt;1 — стена короче при том же маршруте</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-stone-400">
                          Золото из событий ×
                          {(devBalance.eventGoldMultiplier ?? devBalance.quantityMultiplier ?? 1).toFixed(1)}
                        </Label>
                        <Slider
                          value={[devBalance.eventGoldMultiplier ?? devBalance.quantityMultiplier ?? 1]}
                          onValueChange={([v]) =>
                            setDevBalance((p) => ({ ...p, eventGoldMultiplier: v }))
                          }
                          min={0.1}
                          max={5}
                          step={0.1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-stone-400">
                          Материалы (количество) ×{(devBalance.materialQuantityMultiplier ?? 1).toFixed(2)}
                        </Label>
                        <Slider
                          value={[devBalance.materialQuantityMultiplier ?? 1]}
                          onValueChange={([v]) =>
                            setDevBalance((p) => ({ ...p, materialQuantityMultiplier: v }))
                          }
                          min={0.1}
                          max={4}
                          step={0.05}
                        />
                        <p className="text-[10px] text-stone-600">После множителя договора</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-stone-400">
                          Материалы (редкость / удача) ×{(devBalance.materialRarityMultiplier ?? 1).toFixed(2)}
                        </Label>
                        <Slider
                          value={[devBalance.materialRarityMultiplier ?? 1]}
                          onValueChange={([v]) =>
                            setDevBalance((p) => ({ ...p, materialRarityMultiplier: v }))
                          }
                          min={0.25}
                          max={3}
                          step={0.05}
                        />
                        <p className="text-[10px] text-stone-600">Надстройка над договором</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-stone-400">
                          Шанс успеха (события) {devBalance.qualityShift >= 0 ? '+' : ''}
                          {devBalance.qualityShift} п.п.
                        </Label>
                        <Slider
                          value={[devBalance.qualityShift + 20]}
                          onValueChange={([v]) =>
                            setDevBalance((p) => ({ ...p, qualityShift: v - 20 }))
                          }
                          min={0}
                          max={40}
                          step={1}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : undefined
            }
          />
        )}
          </TabsContent>
        </Tabs>

        {/* История экспедиций */}
        {guild.history.length > 0 && (
          <Card className="card-medieval">
            <CardHeader>
              <CardTitle className="text-stone-300 flex items-center gap-2">
                <Scroll className="w-5 h-5" />
                История экспедиций
              </CardTitle>
              <CardDescription>
                Нажмите на иконку искателя 👤 для просмотра карточки и предложения контракта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[...guild.history].reverse().slice(0, 20).map(entry => {
                  const adventurerId = entry.adventurerData?.id || ''
                  const stats = getAdventurerStats(adventurerId)
                  
                  return (
                    <ExpeditionHistoryEntryComponent
                      key={entry.id}
                      entry={entry}
                      guildLevel={guild.level}
                      guildGold={resources.gold}
                      guildGlory={guild.glory}
                      currentContractsCount={contractedAdventurers.length}
                      adventurerMissionCount={stats.missionCount}
                      adventurerSuccessRate={stats.successRate}
                      alreadyContracted={isAlreadyContracted(adventurerId)}
                      onOfferContract={handleOfferContract}
                    />
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <WorkbenchPlannedQueueAlert
        open={!!expeditionWorkbenchQueueWeapon}
        onOpenChange={(open) => {
          if (!open) setExpeditionWorkbenchQueueWeapon(null)
        }}
        weaponLabel={expeditionWorkbenchQueueWeapon?.fullName ?? ''}
        plannedCount={
          expeditionWorkbenchQueueWeapon
            ? countPlannedWorkbenchItemsForWeapon(
                expeditionWorkbenchQueueWeapon.id,
                workbenchQueue
              )
            : 0
        }
        contextLabel="отправки в экспедицию"
        onConfirmClearAndContinue={() => {
          const w = expeditionWorkbenchQueueWeapon
          if (!w) return
          removeAllPlannedWorkbenchItemsForWeapon(w.id)
          setExpeditionWorkbenchQueueWeapon(null)
          setSelectedWeapon(w)
          setSelectedAdventurer(null)
        }}
      />
    </TooltipProvider>
  )
}
