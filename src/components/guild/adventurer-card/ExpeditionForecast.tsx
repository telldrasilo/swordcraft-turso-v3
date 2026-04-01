/**
 * Expedition Forecast Section
 * Секция прогноза миссии для карточки искателя
 * Версия 2.0 - Улучшенный UX/UI с чёткой иерархией информации
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TrendingUp } from 'lucide-react'
import type { Advice } from '@/lib/adventurer-advice'
import { ModifierBadge } from './ModifierBadge'
import type { ExpeditionDifficulty, ExpeditionType } from '@/data/expedition-templates'

// ================================
// ТИПЫ
// ================================

interface ExpeditionData {
  difficulty: ExpeditionDifficulty
  type: ExpeditionType
  baseGold: number
  baseWarSoul: number
  successChance: number
  goldReward: number
  warSoulReward: number
  weaponWear: number
  weaponLossChance: number
  successModifiers: Array<{
    source: string
    sourceIcon: string
    value: number
    description: string
    type: string
  }>
  goldModifiers: Array<{
    source: string
    sourceIcon: string
    value: number
    description: string
    type: string
  }>
}

interface ExpeditionForecastProps {
  expedition: ExpeditionData
  advice: Advice | null
}

// ================================
// ПОДКОМПОНЕНТЫ
// ================================

interface CriticalStatsSectionProps {
  successChance: number
  goldReward: number
}

const CriticalStatsSection: React.FC<CriticalStatsSectionProps> = ({
  successChance,
  goldReward
}) => {
  const successColor = successChance >= 75 ? 'text-green-400' :
                     successChance >= 50 ? 'text-amber-400' : 'text-red-400'
  const progressColor = successChance >= 75 ? 'bg-green-500' :
                        successChance >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Шанс успеха - КРИТИЧЕСКИ ВАЖНО */}
      <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <span className="text-xs text-green-300 block mb-1">Шанс успеха</span>
                <div className={`text-2xl font-bold ${successColor} mb-2`}>
                  {successChance}%
                </div>
                <div className="w-full bg-stone-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${progressColor}`}
                    style={{ width: `${successChance}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold">Шанс успешного выполнения</p>
              <p className="text-xs text-stone-300">
                Вероятность того, что миссия завершится успешно.
                При успехе вы получите награду, при провале — потеряете депозит и рискуете потерять оружие.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Доход - КРИТИЧЕСКИ ВАЖНО */}
      <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <span className="text-xs text-amber-300 block mb-1">Доход</span>
                <div className="text-xl font-bold text-amber-400">
                  {goldReward} 💰
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold">Заработок гильдии</p>
              <p className="text-xs text-stone-300">
                Золото, которое гильдия получит при успешном выполнении миссии.
                Сумма зависит от редкости искателя и его бонусов.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

interface SecondaryStatsSectionProps {
  warSoulReward: number
  weaponLossChance: number
  weaponWear: number
}

const SecondaryStatsSection: React.FC<SecondaryStatsSectionProps> = ({
  warSoulReward,
  weaponLossChance,
  weaponWear
}) => {
  const riskColor = weaponLossChance > 15 ? 'text-red-400' :
                    weaponLossChance >= 5 ? 'text-amber-400' : 'text-stone-400'

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Души войны - ВАЖНО */}
      <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-800/30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <span className="text-xs text-purple-300 block mb-1">Души войны</span>
                <div className="text-lg font-semibold text-purple-400">
                  ~{warSoulReward}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold">Души войны</p>
              <p className="text-xs text-stone-300">
                Валюта для улучшения и зачарования оружия.
                Количество зависит от редкости искателя и бонусов к душам.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Риски - ВТОРОСТЕПЕННОЕ */}
      <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <span className="text-xs text-red-300 block mb-1">Риски</span>
                  <div className="text-xs space-y-1">
                    <div className={`font-medium ${riskColor}`}>
                      Потеря: {weaponLossChance}%
                    </div>
                    <div className="text-stone-400">
                      Износ: -{weaponWear}%
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Риски экспедиции</p>
                <p className="text-xs text-stone-300">
                  <strong>Потеря оружия:</strong> риск потерять оружие при провале миссии.<br/>
                  <strong>Износ:</strong> оружие потеряет прочность независимо от исхода.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

interface ModifiersSectionProps {
  successModifiers: Array<{
    source: string
    sourceIcon: string
    value: number
    description: string
    type: string
  }>
  goldModifiers: Array<{
    source: string
    sourceIcon: string
    value: number
    description: string
    type: string
  }>
}

const ModifiersSection: React.FC<ModifiersSectionProps> = ({
  successModifiers,
  goldModifiers,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  if (successModifiers.length === 0 && goldModifiers.length === 0) {
    return null
  }

  return (
    <details className="group" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="cursor-pointer text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 list-none select-none">
        <span className="group-open:rotate-90 transition-transform inline-block text-xs">▶</span>
        {isOpen ? 'Скрыть детали' : 'Показать детали'}
      </summary>
      <div className="mt-3 space-y-3 pt-3 border-t border-stone-700">
        {/* Модификаторы успеха */}
        {successModifiers.length > 0 && (
          <div>
            <h5 className="text-xs text-stone-400 mb-2 font-medium">Модификаторы успеха:</h5>
            <div className="flex flex-wrap gap-1.5">
              {successModifiers.map((mod, i) => (
                <ModifierBadge
                  key={i}
                  source={mod.source}
                  sourceIcon={mod.sourceIcon}
                  value={mod.value}
                  description={mod.description}
                  type={mod.type as 'positive' | 'negative' | 'neutral'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Модификаторы золота */}
        {goldModifiers.length > 0 && (
          <div>
            <h5 className="text-xs text-stone-400 mb-2 font-medium">Модификаторы золота:</h5>
            <div className="flex flex-wrap gap-1.5">
              {goldModifiers.map((mod, i) => (
                <ModifierBadge
                  key={i}
                  source={mod.source}
                  sourceIcon={mod.sourceIcon}
                  value={mod.value}
                  description={mod.description}
                  type={mod.type as 'positive' | 'negative' | 'neutral'}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  )
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

export const ExpeditionForecast: React.FC<ExpeditionForecastProps> = ({
  expedition,
  advice,
}) => {
  return (
    <div className="space-y-2 p-3 rounded-lg bg-stone-950/80 border border-stone-700">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h4 className="text-sm font-medium text-stone-200 uppercase tracking-wider cursor-help flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Прогноз миссии
              </h4>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Расчёт результатов миссии</p>
              <p className="text-xs text-stone-300">
                Предварительный расчёт на основе всех параметров искателя, оружия и условий миссии.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {advice && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`
                  ${advice.type === 'excellent' ? 'bg-green-900/60 text-green-300' : ''}
                  ${advice.type === 'good' ? 'bg-blue-900/60 text-blue-300' : ''}
                  ${advice.type === 'risky' ? 'bg-amber-900/60 text-amber-300' : ''}
                  ${advice.type === 'dangerous' ? 'bg-red-900/60 text-red-300' : ''}
                  ${advice.type === 'warning' ? 'bg-orange-900/60 text-orange-300' : ''}
                  ${advice.type === 'special' ? 'bg-purple-900/60 text-purple-300' : ''}
                  text-xs cursor-help
                `}>
                  {advice.icon} {advice.text}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{advice.text}</p>
                {advice.detail && <p className="text-xs text-stone-300">{advice.detail}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Критические метрики (шанс успеха + доход) */}
      <CriticalStatsSection
        successChance={expedition.successChance}
        goldReward={expedition.goldReward}
      />

      {/* Второстепенные метрики (души войны + риски) */}
      <SecondaryStatsSection
        warSoulReward={expedition.warSoulReward}
        weaponLossChance={expedition.weaponLossChance}
        weaponWear={expedition.weaponWear}
      />

      {/* Раскрываемая секция модификаторов */}
      {(expedition.successModifiers.length > 0 || expedition.goldModifiers.length > 0) && (
        <ModifiersSection
          successModifiers={expedition.successModifiers}
          goldModifiers={expedition.goldModifiers}
        />
      )}

      {/* Детали совета */}
      {advice?.detail && (
        <div className="text-xs text-stone-400 italic pt-2 border-t border-stone-700">
          💡 {advice.detail}
        </div>
      )}
    </div>
  )
}

export default ExpeditionForecast
