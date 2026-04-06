/**
 * Секция контрактных искателей
 * Отображает список контрактников и позволяет управлять контрактами
 */

'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Scroll, 
  UserPlus, 
  Users, 
  AlertTriangle,
  Lock,
} from 'lucide-react'
import type { ContractedAdventurer } from '@/types/contract'
import { GUILD_CONTRACT_LIMITS } from '@/types/contract'
import { getMaxContracts } from '@/lib/contract-manager'
import { ContractCard } from './contract-card'

// ================================
// ПРОПСЫ
// ================================

interface ContractsSectionProps {
  contractedAdventurers: ContractedAdventurer[]
  guildLevel: number
  guildGold: number
  guildGlory: number
  onAssignMission?: (adventurerId: string) => void
  /** Возврат `{ success, reason }` — при неуспехе диалог остаётся открытым и показывается причина */
  onTerminateContract?: (adventurerId: string) => { success: boolean; reason?: string }
  onOfferContract?: () => void
  availableAdventurersCount?: number
}

// ================================
// КОМПОНЕНТ
// ================================

export const ContractsSection: React.FC<ContractsSectionProps> = ({
  contractedAdventurers,
  guildLevel,
  guildGold: _guildGold,
  guildGlory: _guildGlory,
  onAssignMission,
  onTerminateContract,
  onOfferContract,
  availableAdventurersCount = 0,
}) => {
  const [selectedForTerminate, setSelectedForTerminate] = useState<string | null>(null)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [terminateError, setTerminateError] = useState<string | null>(null)
  
  // Лимит контрактов
  const maxContracts = useMemo(() => getMaxContracts(guildLevel), [guildLevel])
  const canAddMore = contractedAdventurers.length < maxContracts
  
  // Статистика
  const stats = useMemo(() => {
    let totalMissions = 0
    let totalSuccess = 0
    let totalGold = 0
    
    contractedAdventurers.forEach(c => {
      totalMissions += c.missionsCompleted
      totalSuccess += c.missionsSucceeded
      totalGold += c.totalGoldEarned
    })
    
    return {
      totalMissions,
      successRate: totalMissions > 0 ? Math.round((totalSuccess / totalMissions) * 100) : 0,
      totalGold,
      avgLoyalty: contractedAdventurers.length > 0 
        ? Math.round(contractedAdventurers.reduce((sum, c) => sum + c.loyalty, 0) / contractedAdventurers.length)
        : 0,
    }
  }, [contractedAdventurers])
  
  // Проверка возможности предложить контракт
  const canOfferContractCheck = useMemo(() => {
    if (!canAddMore) return { can: false, reason: 'Достигнут лимит контрактов' }
    if (availableAdventurersCount === 0) return { can: false, reason: 'Нет доступных искателей' }
    return { can: true, reason: '' }
  }, [canAddMore, availableAdventurersCount])
  
  // Обработка расторжения
  const handleTerminateClick = (adventurerId: string) => {
    setSelectedForTerminate(adventurerId)
    setTerminateError(null)
    setShowTerminateDialog(true)
  }
  
  const confirmTerminate = () => {
    if (!selectedForTerminate || !onTerminateContract) {
      setShowTerminateDialog(false)
      setSelectedForTerminate(null)
      return
    }
    const r = onTerminateContract(selectedForTerminate)
    if (r.success) {
      setShowTerminateDialog(false)
      setSelectedForTerminate(null)
      setTerminateError(null)
    } else {
      setTerminateError(r.reason ?? 'Не удалось расторгнуть контракт')
    }
  }
  
  // Если нет контрактников
  if (contractedAdventurers.length === 0) {
    return (
      <Card className="bg-stone-900/50 border-stone-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scroll className="w-5 h-5" />
            Контракты
          </CardTitle>
          <CardDescription>
            Заключайте контракты с проверенными искателями
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Scroll className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-400 mb-4">
              У вас пока нет контрактных искателей
            </p>
            <p className="text-xs text-stone-500 mb-4">
              Выполняйте миссии с искателями, чтобы предложить им контракт
            </p>
            {onOfferContract && availableAdventurersCount > 0 && (
              <Button onClick={onOfferContract} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Предложить контракт
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-stone-900/50 border-stone-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scroll className="w-5 h-5" />
                Контрактные искатели
              </CardTitle>
              <CardDescription>
                {contractedAdventurers.length} / {maxContracts} слотов
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {onOfferContract && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onOfferContract}
                        disabled={!canOfferContractCheck.can}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        Нанять
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {!canOfferContractCheck.can 
                        ? canOfferContractCheck.reason
                        : 'Предложить контракт искателю'
                      }
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          {/* Мини-статистика */}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-stone-700">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 cursor-help">
                    <Users className="w-3.5 h-3.5" />
                    <span>{stats.totalMissions} миссий</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Всего миссий выполнено контрактниками</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-xs cursor-help">
                    {stats.successRate >= 75 ? (
                      <span className="text-green-400">{stats.successRate}% успех</span>
                    ) : stats.successRate >= 50 ? (
                      <span className="text-amber-400">{stats.successRate}% успех</span>
                    ) : (
                      <span className="text-red-400">{stats.successRate}% успех</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Общий процент успешных миссий</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 cursor-help">
                    <span>{stats.totalGold.toLocaleString()} 💰</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Всего золота заработано</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-xs cursor-help">
                    {stats.avgLoyalty >= 80 ? (
                      <span className="text-green-400">❤️ {stats.avgLoyalty}% лояльность</span>
                    ) : stats.avgLoyalty >= 50 ? (
                      <span className="text-blue-400">❤️ {stats.avgLoyalty}% лояльность</span>
                    ) : stats.avgLoyalty >= 20 ? (
                      <span className="text-stone-400">❤️ {stats.avgLoyalty}% лояльность</span>
                    ) : (
                      <span className="text-red-400">❤️ {stats.avgLoyalty}% лояльность</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Средняя лояльность контрактников</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {contractedAdventurers.map((contracted) => (
                <ContractCard
                  key={contracted.id}
                  contractedAdventurer={contracted}
                  onAssign={onAssignMission ? () => onAssignMission(contracted.adventurerId) : undefined}
                  onTerminate={() => handleTerminateClick(contracted.adventurerId)}
                  isAssignable={!!onAssignMission}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {/* Подсказка о слотах */}
          {!canAddMore && (
            <div className="mt-4 p-3 rounded-lg bg-amber-900/20 border border-amber-600/30">
              <div className="flex items-center gap-2 text-sm text-amber-300">
                <Lock className="w-4 h-4" />
                <span>
                  Лимит контрактов достигнут. Повысьте уровень гильдии до уровня {guildLevel + 1}, 
                  чтобы нанять {GUILD_CONTRACT_LIMITS[guildLevel + 1] || maxContracts + 1} контрактников.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Диалог подтверждения расторжения */}
      <Dialog
        open={showTerminateDialog}
        onOpenChange={(open) => {
          setShowTerminateDialog(open)
          if (!open) {
            setSelectedForTerminate(null)
            setTerminateError(null)
          }
        }}
      >
        <DialogContent className="bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Расторгнуть контракт?
            </DialogTitle>
            <DialogDescription className="text-stone-400">
              Это действие нельзя отменить. Искатель потеряет доверие к гильдии.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {terminateError && (
              <div className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm text-red-200">
                {terminateError}
              </div>
            )}
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-600/30">
              <p className="text-sm text-red-300">
                Штраф за расторжение: 50% от стоимости контракта будет вычтено из казны гильдии.
              </p>
              <p className="text-xs text-stone-400 mt-2">
                Искатель также может отказаться от будущих контрактов с вашей гильдией.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowTerminateDialog(false)}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmTerminate}
            >
              Расторгнуть контракт
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ContractsSection
