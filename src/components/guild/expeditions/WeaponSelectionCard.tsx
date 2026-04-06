/**
 * Weapon Selection Card
 * Карточка выбора оружия для экспедиции (v2 - CraftedWeaponV2)
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

// ================================
// ТИПЫ
// ================================

interface WeaponSelectionCardProps {
  weapon: CraftedWeaponV2
  isSelected: boolean
  canSelect: boolean
  onSelect: () => void
  reason?: string
  /** Оружие на верстаке ремонта — серое, с бейджем */
  isRepairBench?: boolean
}

// Цвета для рангов качества
const rankColors: Record<string, string> = {
  F: 'text-gray-400',
  D: 'text-stone-400',
  C: 'text-green-400',
  B: 'text-blue-400',
  A: 'text-purple-400',
  S: 'text-amber-400',
}

// ================================
// КОМПОНЕНТ
// ================================

export const WeaponSelectionCard: React.FC<WeaponSelectionCardProps> = ({
  weapon,
  isSelected,
  canSelect,
  onSelect,
  reason,
  isRepairBench = false,
}) => {
  // Вычисляем процент прочности
  const durabilityPercent = Math.round((weapon.currentDurability / weapon.stats.maxDurability) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        className={cn(
          'card-medieval transition-all',
          canSelect && 'cursor-pointer',
          !canSelect && 'cursor-not-allowed',
          isSelected && canSelect && 'border-amber-500 bg-amber-900/20',
          !canSelect && 'opacity-60',
          isRepairBench && !canSelect && 'border-stone-600/60 bg-stone-950/40'
        )}
        role={canSelect ? 'button' : undefined}
        aria-disabled={!canSelect}
        title={!canSelect && reason ? reason : undefined}
        onClick={canSelect ? onSelect : undefined}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-xl relative">
              ⚔️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <h4 className="font-semibold text-stone-200 text-sm truncate">{weapon.fullName}</h4>
                {isRepairBench && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-stone-500 text-stone-400 shrink-0">
                    На ремонте
                  </Badge>
                )}
                {/* Ранг качества */}
                <span className={cn("text-xs font-bold", rankColors[weapon.qualityRank] || 'text-gray-400')}>
                  [{weapon.qualityRank}]
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400">⚔️ {weapon.stats.attack}</span>
                <span className="text-stone-500">|</span>
                <span className={cn(
                  "flex items-center gap-1",
                  durabilityPercent > 50 ? 'text-green-400' : durabilityPercent > 25 ? 'text-amber-400' : 'text-red-400'
                )}>
                  🛡️ {durabilityPercent}%
                </span>
                {weapon.warSoul > 0 && (
                  <>
                    <span className="text-stone-500">|</span>
                    <span className="text-purple-400">✨ {weapon.warSoul}</span>
                  </>
                )}
              </div>
            </div>
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          {!canSelect && reason && (
            <p
              className={cn(
                'text-xs mt-2',
                isRepairBench ? 'text-amber-200/80' : 'text-red-400'
              )}
            >
              {reason}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default WeaponSelectionCard
