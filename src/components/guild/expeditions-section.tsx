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
  Zap,
  Send,
  Map,
  Gauge,
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
import { CONTRACT_CONFIG } from '@/modules/expeditions/data/missions/_mission-template'
import { cn } from '@/lib/utils'
import { EXPEDITION_DEV_UI_ENABLED } from '@/lib/expedition-dev-tools'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

// Импорт вынесенных компонентов
import { ActiveExpeditionCard } from './active-expedition-card'
import { RecoveryQuestCard } from './recovery-quest-card'
import { RecruitmentInterface } from './recruitment-interface'
import { ExpeditionHistoryEntryComponent } from './expedition-history-entry'
import { WeaponSelectionCard } from './expeditions'
import { ExpeditionLocationMissionBoard } from './expeditions/ExpeditionLocationMissionBoard'
import { ExpeditionClientPaymentBreakdown } from './expeditions/ExpeditionClientPaymentBreakdown'

// Новые компоненты UX улучшений
import { ScenarioComparison } from './expeditions/ScenarioComparison'

// Автосохранение
import { debouncedSaveDraft, clearDraft, loadDraft, DraftStatus, getDraftStatus } from '@/lib/expedition-draft'

// Импорт конвертеров и типов
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { convertToLegacy, convertToExtended, mapExpeditionForRecruitment, mapWeaponForRecruitment } from '@/lib/adventurer-converter'
import type { ContractTier, ContractedAdventurer } from '@/types/contract'
// Импорт системы модификаторов
import { calculateExpeditionResult, type ExpeditionCalculation } from '@/lib/expedition-calculator-v2'
import { FullModifierBreakdown } from '@/components/ui/modifier-breakdown'

// ExpeditionCard теперь импортируется как ExpeditionSelectionCard

// WeaponCard теперь импортируется как WeaponSelectionCard

export function ExpeditionsSection() {
  const guild = useGameStore((state) => state.guild)
  const resources = useGameStore((state) => state.resources)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const initializeAdventurers = useGameStore((state) => state.initializeAdventurers)
  const startExpeditionFull = useGameStore((state) => state.startExpeditionFull)

  const [selectedExpedition, setSelectedExpedition] = useState<ExpeditionTemplate | null>(null)
  const [selectedWeapon, setSelectedWeapon] = useState<CraftedWeaponV2 | null>(null)
  const [selectedAdventurer, setSelectedAdventurer] = useState<Adventurer | null>(null)

  // Расширенный искатель (из RecruitmentInterface)
  const [selectedExtendedAdventurer, setSelectedExtendedAdventurer] = useState<AdventurerExtended | null>(null)

  // Статус черновика для UI
  const [draftStatus, setDraftStatus] = useState<DraftStatus | null>(null)

  const [missionContract, setMissionContract] = useState<'exploration' | 'speed'>('exploration')
  const [showBalancePanel, setShowBalancePanel] = useState(false)
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
  const contractedAdventurers =
    ('contractedAdventurers' in guild
      ? (guild as { contractedAdventurers?: ContractedAdventurer[] }).contractedAdventurers
      : undefined) ?? []
  
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
  const handleOfferContract = (adventurer: Adventurer, tier: ContractTier) => {
    // Эта функция должна вызывать action из store
    // Пока что просто выводим в консоль
    console.warn('Offer contract:', { adventurer: adventurer.name, tier })
    // В реальной реализации здесь будет вызов store action
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

  // Проверка возможности выбрать экспедицию
  const canSelectExpedition = (_expedition: ExpeditionTemplate): { can: boolean; reason: string } => {
    return { can: true, reason: '' }
  }

  // Проверка возможности выбрать оружие (v2 - CraftedWeaponV2)
  const canSelectWeapon = (weapon: CraftedWeaponV2): { can: boolean; reason: string } => {
    if (!selectedExpedition) {
      return { can: false, reason: 'Сначала выберите экспедицию' }
    }
    if (weapon.currentDurability <= 10) {
      return { can: false, reason: 'Оружие слишком повреждено' }
    }
    if (weapon.stats.attack < selectedExpedition.minWeaponAttack) {
      return { can: false, reason: `Требуется атака ${selectedExpedition.minWeaponAttack}+` }
    }
    return { can: true, reason: '' }
  }

  // Доступное оружие (фильтруем по прочности, использованию в экспедиции и требованиям атаки)
  const availableWeapons = weaponInventory.weapons.filter(w => {
    // Базовые проверки (v2)
    if (w.currentDurability <= 10) return false
    if (guild.activeExpeditions.some(e => e.weaponId === w.id)) return false

    // Если выбрана экспедиция, проверяем требования к атаке
    if (selectedExpedition && w.stats.attack < selectedExpedition.minWeaponAttack) {
      return false
    }

    return true
  })

  // Запуск экспедиции (v2 - используем startExpeditionFull)
  const handleStartExpedition = () => {
    if (!selectedExpedition || !selectedWeapon || !selectedAdventurer) return

    const success = startExpeditionFull(
      selectedExpedition,
      selectedAdventurer,
      selectedWeapon,
      selectedExtendedAdventurer || undefined,
      {
        contractOverride: missionContract,
        ...(EXPEDITION_DEV_UI_ENABLED ? { devBalance } : {}),
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

    // Получаем расширенные данные искателя
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
              {availableWeapons.length === 0 ? (
                <p className="text-stone-500 text-center py-4">
                  Нет подходящего оружия. Создайте оружие в кузнице.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {availableWeapons.map(weapon => {
                      const { can, reason } = canSelectWeapon(weapon)
                      return (
                        <WeaponSelectionCard
                          key={weapon.id}
                          weapon={weapon}
                          isSelected={selectedWeapon?.id === weapon.id}
                          canSelect={can}
                          reason={reason}
                          onSelect={() => {
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

        {selectedExpedition && selectedWeapon && selectedExtendedAdventurer && expeditionCalculation && (
          <ExpeditionClientPaymentBreakdown economy={expeditionCalculation.economy} />
        )}

        {/* Сравнение сценариев */}
        {selectedExpedition && selectedWeapon && selectedExtendedAdventurer && (
          <ScenarioComparison
            expedition={selectedExpedition}
            adventurer={selectedExtendedAdventurer}
            weapon={selectedWeapon}
            guildLevel={guild.level}
            contractType={missionContract}
          />
        )}

        {/* Кнопка начала экспедиции и модификаторы */}
        {selectedExpedition && selectedWeapon && selectedAdventurer && (
          <Card className="card-medieval border-amber-600/50">
            <CardContent className="p-4">
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-stone-200">Договор с авантюристом</Label>
                  <p className="text-xs text-stone-500">
                    Выплата заказчика → комиссия гильдии → делёж между кузницей и авантюристом. От договора зависят
                    длительность маршрута, число событий и «удача» по материалам.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setMissionContract('exploration')}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-all',
                        missionContract === 'exploration'
                          ? 'border-amber-500/80 bg-amber-950/40 ring-1 ring-amber-500/50'
                          : 'border-stone-600/50 bg-stone-900/30 hover:border-stone-500/60'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Map className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-stone-100">
                          {CONTRACT_CONFIG.exploration.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-snug mb-2">
                        {CONTRACT_CONFIG.exploration.blacksmithGoldPercent}% кузнецу,{' '}
                        {CONTRACT_CONFIG.exploration.adventurerGoldPercent}% авантюристу. Больше событий и времени на
                        локацию — выше шанс материалов в находках.
                      </p>
                      <div className="text-[10px] text-stone-500">
                        Материалы ×{CONTRACT_CONFIG.exploration.materialFindMultiplier.toFixed(1)} · длительность ×
                        {CONTRACT_CONFIG.exploration.durationMultiplier.toFixed(1)}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMissionContract('speed')}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-all',
                        missionContract === 'speed'
                          ? 'border-amber-500/80 bg-amber-950/40 ring-1 ring-amber-500/50'
                          : 'border-stone-600/50 bg-stone-900/30 hover:border-stone-500/60'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="w-4 h-4 text-sky-400" />
                        <span className="text-sm font-medium text-stone-100">
                          {CONTRACT_CONFIG.speed.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-snug mb-2">
                        Делёж {CONTRACT_CONFIG.speed.blacksmithGoldPercent}/
                        {CONTRACT_CONFIG.speed.adventurerGoldPercent}. Авантюрист торопится — маршрут короче, событий
                        меньше, материалов в среднем ниже.
                      </p>
                      <div className="text-[10px] text-stone-500">
                        Материалы ×{CONTRACT_CONFIG.speed.materialFindMultiplier.toFixed(1)} · длительность ×
                        {CONTRACT_CONFIG.speed.durationMultiplier.toFixed(1)}
                      </div>
                    </button>
                  </div>
                </div>

                {EXPEDITION_DEV_UI_ENABLED && (
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
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-stone-200">Готово к отправке</h4>
                  <p className="text-sm text-stone-400">
                    {selectedExpedition.name} • {selectedAdventurer.name} • {selectedWeapon.fullName}
                  </p>
                </div>
                <Button
                  onClick={handleStartExpedition}
                  className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Отправить в экспедицию
                </Button>
              </div>

              {/* Детализация модификаторов */}
              {expeditionCalculation && (
                <div className="mt-4 pt-4 border-t border-stone-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h5 className="text-sm font-medium text-stone-300">Модификаторы экспедиции</h5>
                  </div>

                  {/* Сводка результатов */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-stone-400">Шанс успеха</div>
                      <div className={`text-lg font-bold ${
                        expeditionCalculation.successChance >= 70 ? 'text-green-400' :
                        expeditionCalculation.successChance >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {expeditionCalculation.successChance}%
                      </div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center md:col-span-1">
                      <div className="text-xs text-stone-400">Золото кузнецу</div>
                      <div className="text-lg font-bold text-amber-400">
                        💰 {expeditionCalculation.commission}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1 leading-tight text-left px-1">
                        Заказчик {expeditionCalculation.economy.clientGrossGold} · гильдия −
                        {expeditionCalculation.economy.guildFeeGold} · авантюристу{' '}
                        {expeditionCalculation.economy.adventurerGold}
                      </div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-stone-400">Души войны</div>
                      <div className="text-lg font-bold text-purple-400">
                        ⚔️ {expeditionCalculation.warSoul}
                      </div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-stone-400">Износ оружия</div>
                      <div className="text-lg font-bold text-yellow-400">
                        🔧 -{expeditionCalculation.weaponWear}%
                      </div>
                    </div>
                  </div>

                  {/* Рекомендация */}
                  <div className={`text-sm p-2 rounded-lg mb-3 ${
                    expeditionCalculation.recommendation.rating === 'excellent' ? 'bg-green-900/30 text-green-300' :
                    expeditionCalculation.recommendation.rating === 'good' ? 'bg-blue-900/30 text-blue-300' :
                    expeditionCalculation.recommendation.rating === 'risky' ? 'bg-amber-900/30 text-amber-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {expeditionCalculation.recommendation.description}
                  </div>

                  {/* Полная детализация модификаторов (сворачиваемая) */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                      Показать все модификаторы
                    </summary>
                    <div className="mt-3">
                      <FullModifierBreakdown calculation={expeditionCalculation} compact={true} />
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
    </TooltipProvider>
  )
}
