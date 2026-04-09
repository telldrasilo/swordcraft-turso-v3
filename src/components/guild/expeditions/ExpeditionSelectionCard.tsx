/**
 * Expedition Selection Card
 * Карточка выбора экспедиции
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Timer, Coins, Sword, Skull, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ExpeditionTemplate, difficultyInfo, typeInfo } from '@/data/expedition-templates'
import { ELEMENTAL_AXIS_LABELS } from '@/data/weapon-damage/elemental-axes'
import { getLocationById, getMaterialName } from '@/modules/expeditions'
import { materialById } from '@/data/materials/library'

// ================================
// ТИПЫ
// ================================

interface ExpeditionSelectionCardProps {
  expedition: ExpeditionTemplate
  isSelected: boolean
  canSelect: boolean
  onSelect: () => void
  reason?: string
  /** Полный текст миссии и цель; для сетки одинаковой высоты используйте с `items-stretch` + `h-full` у обёртки */
  variant?: 'default' | 'missionBoard'
  /** Миссия текущего шага квеста «Эхо забытой кузни» */
  questHighlight?: boolean
}

// ================================
// КОМПОНЕНТ
// ================================

export const ExpeditionSelectionCard: React.FC<ExpeditionSelectionCardProps> = ({
  expedition,
  isSelected,
  canSelect,
  onSelect,
  reason,
  variant = 'default',
  questHighlight = false,
}) => {
  const difficulty = difficultyInfo[expedition.difficulty]
  const type = typeInfo[expedition.type]
  const clientBudget = expedition.reward?.baseGold ?? 0
  const guildOps = expedition.cost.supplies + expedition.cost.deposit
  /** База провала для v2 — из баланса сложности, не из полей строки шаблона */
  const displayFailurePct = difficulty.failureChance

  const moduleLocation =
    expedition.moduleLocationId != null ? getLocationById(expedition.moduleLocationId) : undefined

  const harvestableResources =
    expedition.moduleLocationId != null
      ? (() => {
          const loc = moduleLocation
          if (!loc?.resources?.length) return []
          return loc.resources
            .filter((r) => Boolean(materialById[r.materialId]))
            .map((r) => ({
              id: r.materialId,
              label: getMaterialName(r.materialId),
              rarity: r.rarity,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'ru'))
        })()
      : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full w-full min-w-0"
    >
      <Card
        className={cn(
          'card-medieval cursor-pointer transition-all h-full w-full min-w-0 flex flex-col',
          isSelected &&
            'ring-2 ring-amber-500 border-amber-500 bg-gradient-to-b from-amber-900/30 to-stone-900/50 shadow-lg shadow-amber-900/30',
          questHighlight &&
            !isSelected &&
            'ring-2 ring-amber-600/70 border-amber-600/60 bg-gradient-to-b from-amber-950/25 to-stone-900/40',
          !canSelect && 'opacity-50'
        )}
        onClick={canSelect ? onSelect : undefined}
      >
        <CardContent className="p-4 flex flex-col flex-1">
          {/* Заголовок */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl flex-shrink-0">{expedition.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-200 truncate">{expedition.name}</h4>
              <p className="text-xs text-stone-500">{type.name}</p>
            </div>
            {questHighlight && variant === 'missionBoard' && (
              <Badge
                variant="outline"
                className="text-[10px] shrink-0 border-amber-600/60 text-amber-200/90 bg-amber-950/40"
              >
                Квест
              </Badge>
            )}
            <Badge
              className={cn(
                "text-xs flex-shrink-0 px-2 py-0.5",
                "bg-stone-800/80 border border-stone-600",
                difficulty.color
              )}
            >
              {difficulty.name}
            </Badge>
          </div>

          {variant === 'missionBoard' && expedition.moduleLocationName && (
            <p className="text-[11px] text-stone-500 mb-1 flex-shrink-0">
              <span className="text-stone-500/80">Локация: </span>
              {expedition.moduleLocationName}
            </p>
          )}

          {variant === 'missionBoard' && expedition.moduleClientName && (
            <p className="text-[11px] text-stone-500 mb-1.5 flex-shrink-0">
              <span className="text-stone-500/80">Заказчик: </span>
              <span className="text-stone-300">{expedition.moduleClientName}</span>
            </p>
          )}

          {variant === 'missionBoard' && expedition.moduleObjective && (
            <p className="text-xs text-stone-300 mb-2 flex-shrink-0 leading-snug">
              <span className="font-medium text-amber-200/90">Цель: </span>
              {expedition.moduleObjective}
            </p>
          )}

          {/* Описание */}
          <p
            className={cn(
              'text-xs text-stone-400 mb-3',
              variant === 'missionBoard'
                ? 'flex-1 min-h-0 leading-relaxed whitespace-pre-wrap'
                : 'line-clamp-2 flex-shrink-0'
            )}
          >
            {expedition.description}
          </p>

          {/* Параметры */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-stone-400">
              <Timer className="w-3 h-3 flex-shrink-0" />
              <span>{Math.floor(expedition.duration / 60)} мин</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400/90">
              <Coins className="w-3 h-3 flex-shrink-0" />
              <span>Заказчик: {clientBudget}+ 💰</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <Sword className="w-3 h-3 flex-shrink-0" />
              <span>⚔️ {expedition.minWeaponAttack}+</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-orange-400"
              title="Ориентир базового риска провала по сложности миссии (как в калькуляторе v2); итог зависит от модификаторов в брифинге."
            >
              <Skull className="w-3 h-3 flex-shrink-0" />
              <span>{displayFailurePct}% риск</span>
            </div>
            <p
              className="col-span-2 text-[10px] text-stone-500 leading-snug"
              title="Сумма снабжения и залога по контракту заказчика; с вашего золота при отправке миссии не списывается."
            >
              Снабжение и залог по контракту ({guildOps} 💰) платит заказчик — не списывается с вашего счёта.
            </p>
          </div>

          {/* Награды */}
          <div className="bg-stone-800/50 rounded-lg p-2 mb-3 mt-auto flex-shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 flex items-center gap-1">
                💰 {expedition.reward.baseGold}+
              </span>
              <span className="text-purple-400 flex items-center gap-1">
                ✨ {expedition.reward.baseWarSoul} душ
              </span>
            </div>
          </div>

          {variant === 'missionBoard' &&
            moduleLocation?.presentElements &&
            moduleLocation.presentElements.length > 0 && (
              <p className="text-[10px] text-stone-500 mb-2 leading-snug flex-shrink-0">
                <span className="text-stone-500/80">Встречающиеся стихии: </span>
                {moduleLocation.presentElements
                  .map((id) => ELEMENTAL_AXIS_LABELS[id] ?? id)
                  .join(', ')}
              </p>
            )}

          {variant === 'missionBoard' && harvestableResources.length > 0 && (
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/15 p-2 mb-2 flex-shrink-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600/90 mb-1.5">
                Добываемые ресурсы
              </p>
              <p className="text-[10px] text-stone-500 mb-1.5 leading-snug">
                Могут выпасть в находках по ходу миссии (редкость и количество зависят от событий и договора).
              </p>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
                {harvestableResources.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center rounded border border-stone-600/50 bg-stone-900/60 px-1.5 py-0.5 text-[10px] text-stone-300"
                    title={r.rarity}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Причина недоступности */}
          {!canSelect && reason && (
            <p className="text-xs text-red-400 flex-shrink-0">⚠️ {reason}</p>
          )}

          {/* Индикатор выбора */}
          {isSelected && (
            <div className="flex items-center gap-1 text-xs text-amber-400 flex-shrink-0 mt-1">
              <CheckCircle className="w-3 h-3" />
              <span>Выбрано</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ExpeditionSelectionCard
