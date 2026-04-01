/**
 * WeaponInventoryCard - карточка оружия в инвентаре
 */

'use client'

import { motion } from 'framer-motion'
import {
  Sword, Heart, Star, Map as MapIcon, Crown, Sparkles,
  Package,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useGameStore } from '@/store'
import { weaponTypeStats } from '@/lib/craft/weapon-display-meta'
import type { CraftedWeaponV2, QualityGrade } from '@/types/craft-v2'
import { getQualityColor, getQualityNameRu } from '@/types/craft-v2'
import { cn } from '@/lib/utils'
import { WeaponIcon } from './forge-utils'
import {
  getWarSoulTier,
  getProgressToNextTier,
} from '@/lib/war-soul-utils'
import { getQualityWithinGradeDisplay } from '@/lib/craft/quality-display'

interface WeaponInventoryCardProps {
  weapon: CraftedWeaponV2
}

export function WeaponInventoryCard({ weapon }: WeaponInventoryCardProps) {
  const isWeaponInExpedition = useGameStore((state) => state.isWeaponInExpedition)

  const qualityGrade = weapon.qualityGrade
  const qualityColor = getQualityColor(weapon.quality)
  const qualityNameRu = getQualityNameRu(weapon.quality)
  
  const qInGrade = getQualityWithinGradeDisplay(weapon.quality)
  const qualityInfo = {
    grade: qualityGrade,
    name: qualityNameRu,
    multiplier: qInGrade.multiplier,
    color: qualityColor,
  }

  const qualityBgColor = {
    'text-gray-400': 'bg-gray-600',
    'text-green-400': 'bg-green-600',
    'text-blue-400': 'bg-blue-600',
    'text-purple-400': 'bg-purple-600',
    'text-amber-400': 'bg-amber-700',
    'text-rose-400': 'bg-rose-600',
  }[qualityInfo.color] || 'bg-gray-600'
  const typeStats = (weaponTypeStats as Record<string, (typeof weaponTypeStats)['sword']>)[weapon.type]

  // Проверяем, в экспедиции ли оружие
  const inExpedition = isWeaponInExpedition(weapon.id)
  
  // Прочность для индикаторов
  const durability = weapon.currentDurability ?? weapon.stats.durability
  const durabilityPercent = Math.round((durability / weapon.stats.maxDurability) * 100)
  const durabilityColor = durabilityPercent > 50 ? 'text-green-400' : durabilityPercent > 25 ? 'text-yellow-400' : 'text-red-400'
  const durabilityBgColor = durabilityPercent > 50 ? 'bg-green-500' : durabilityPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
  
  /** Фон иконки по градации качества (не от attack-tier) */
  const iconBgByQuality: Record<QualityGrade, string> = {
    poor: 'bg-stone-900/50',
    common: 'bg-stone-900/50',
    good: 'bg-green-900/30',
    excellent: 'bg-blue-900/30',
    masterpiece: 'bg-purple-900/30',
    legendary: 'bg-amber-900/30',
  }
  const iconBoxBg = iconBgByQuality[weapon.qualityGrade] ?? 'bg-stone-900/50'
  // Тир Души Войны
  const warSoulTier = weapon.warSoul > 0 || (weapon.maxWarSoul ?? 0) > 0 
    ? getWarSoulTier(weapon.warSoul, weapon.maxWarSoul ?? 100)
    : null
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card className={cn(
        'card-medieval transition-all group relative overflow-hidden',
        'hover:border-amber-600/50',
        inExpedition && 'border-green-600/50 bg-green-900/10'
      )}>
        {/* Фоновое свечение качества */}
        <div className={cn(
          'absolute inset-0 opacity-10 pointer-events-none',
          qualityInfo.color
        )} />
        
        {/* Индикатор экспедиции */}
        {inExpedition && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
        )}
        
        <CardContent className="p-4 relative">
          {/* Заголовок с иконкой и названием */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                iconBoxBg
              )}>
                <WeaponIcon type={weapon.type} />
              </div>
              <div>
                <h4 className="font-semibold text-stone-200">{weapon.fullName}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-stone-500">{typeStats?.name}</span>
                </div>
              </div>
            </div>
            
            {/* Бейджи качества */}
            <div className="flex flex-col items-end gap-1">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-semibold cursor-help border-stone-600/90',
                      qualityBgColor,
                      'text-stone-100 shadow-inner'
                    )}
                  >
                    {qualityInfo.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p>Качество: {qualityInfo.name} (×{qualityInfo.multiplier})</p>
                  <p className="text-xs text-stone-400">Влияет на характеристики оружия</p>
                </TooltipContent>
              </Tooltip>
              {/* Бейдж тира Души Войны */}
              {warSoulTier && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Badge
                      className={cn(
                        'text-xs font-semibold gap-1 cursor-help',
                        warSoulTier.bgColor,
                        warSoulTier.color
                      )}
                    >
                      <span>{warSoulTier.icon}</span>
                      <span>{warSoulTier.name}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="font-medium text-stone-200">
                      Душа войны: {warSoulTier.name}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">{warSoulTier.description}</p>
                    <p className="text-xs text-stone-500 mt-2">
                      Накапливается при успешных экспедициях с этим оружием. Тир влияет на бонусы к шансу успеха, золоту и скорости роста души.
                    </p>
                    {(warSoulTier.bonus.successBonus > 0 ||
                      warSoulTier.bonus.goldBonus > 0 ||
                      warSoulTier.bonus.warSoulBonus > 0) && (
                      <p className="text-xs text-amber-200/90 mt-2">
                        Сейчас: +{warSoulTier.bonus.successBonus}% успех, +{warSoulTier.bonus.goldBonus}% золото, +{warSoulTier.bonus.warSoulBonus}% душа
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* ===== ОСНОВНЫЕ ХАРАКТЕРИСТИКИ ===== */}
          <div className="space-y-3 mb-3">
            
            {/* АТАКА */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help bg-red-500/10 rounded-lg px-3 py-2">
                  <Sword className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <div className="text-xs text-stone-500 mb-0.5">Атака</div>
                    <div className="text-xl font-bold text-red-400">{weapon.stats.attack}</div>
                  </div>
                  <div className="text-xs text-stone-500">{typeStats?.name}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold text-red-400">Атака: {weapon.stats.attack}</p>
                <p className="text-xs text-stone-400">Определяет урон в бою и эффективность экспедиций</p>
              </TooltipContent>
            </Tooltip>

            {/* ПРОЧНОСТЬ */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Heart className={cn('w-4 h-4', durabilityColor)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Прочность</span>
                      <span className={cn('text-xs font-medium', durabilityColor)}>{durability}/{weapon.stats.maxDurability}</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all', durabilityBgColor)} 
                        style={{ width: `${durabilityPercent}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold">Прочность: {durability}/{weapon.stats.maxDurability}</p>
                <p className="text-xs text-stone-400">Уменьшается в экспедициях. При 0% оружие непригодно</p>
              </TooltipContent>
            </Tooltip>

            {/* КАЧЕСТВО (ступени внутри градации v2) */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Star className={cn('w-4 h-4', qualityInfo.color)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Качество</span>
                      <span className={cn('text-xs font-medium tabular-nums', qualityInfo.color)}>
                        {qInGrade.step}/{qInGrade.steps}
                      </span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all', qualityBgColor)} 
                        style={{ width: `${Math.round(qInGrade.progressInGrade * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className={cn('font-semibold', qualityInfo.color)}>
                  {qualityInfo.name}: шаг {qInGrade.step} из {qInGrade.steps}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Градация при крафте. Выше шаг — сильнее бонус к характеристикам.
                  {qInGrade.nextGradeMin !== null && (
                    <> До следующей градации: {qInGrade.nextGradeMin - weapon.quality}.</>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* ===== СПЕЦИАЛЬНЫЕ СВОЙСТВА ===== */}
          <div className="pt-2 border-t border-stone-700/50 mb-3">
            <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Накопленные свойства
            </p>
            <div className="flex flex-wrap gap-2">
            {/* Душа Войны с тиром и прогресс-баром */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-help transition-colors',
                    weapon.warSoul > 0 
                      ? 'bg-purple-900/30 border-purple-600/50 text-purple-400' 
                      : 'bg-stone-800/80 border-stone-700/50 text-stone-500'
                  )}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs text-stone-400">Душа:</span>
                    <span className={cn('text-sm font-semibold', weapon.warSoul > 0 ? 'text-purple-400' : 'text-stone-500')}>
                      {weapon.warSoul}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {(() => {
                    const tier = getWarSoulTier(weapon.warSoul, weapon.maxWarSoul ?? 100)
                    const progress = getProgressToNextTier(weapon.warSoul, weapon.maxWarSoul ?? 100)
                    const tierBonuses = tier.bonus
                    return (
                      <>
                        <p className="font-semibold text-purple-400">
                          {tier.icon} {tier.name}: {weapon.warSoul}/{weapon.maxWarSoul ?? 100} Души Войны
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          Прогресс к следующему тиру: {progress}%
                        </p>
                        <div className="mt-2 pt-2 border-t border-stone-700/50">
                          <p className="text-xs font-medium text-stone-300 mb-1">Бонусы текущего тира:</p>
                          {tierBonuses.successBonus > 0 && <p className="text-xs text-stone-400">+{tierBonuses.successBonus}% шанс успеха</p>}
                          {tierBonuses.goldBonus > 0 && <p className="text-xs text-stone-400">+{tierBonuses.goldBonus}% золота</p>}
                          {tierBonuses.warSoulBonus > 0 && <p className="text-xs text-stone-400">+{tierBonuses.warSoulBonus}% душ</p>}
                          {tierBonuses.critChance > 0 && <p className="text-xs text-stone-400">+{tierBonuses.critChance}% крита</p>}
                        </div>
                      </>
                    )
                  })()}
                </TooltipContent>
              </Tooltip>

              {/* Эпический множитель */}
              {(weapon.epicMultiplier ?? 1) > 1 && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-amber-900/30 border border-amber-600/50 text-amber-400 cursor-help">
                      <Crown className="w-3.5 h-3.5" />
                      <span className="text-xs text-stone-400">Эпичность:</span>
                      <span className="text-sm font-semibold text-amber-400">×{(weapon.epicMultiplier ?? 1).toFixed(2)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-semibold text-amber-400">Эпичность: ×{(weapon.epicMultiplier ?? 1).toFixed(2)}</p>
                    <p className="text-xs text-stone-400">Увеличивает награды от экспедиций. Растёт с каждым приключением!</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Количество экспедиций */}
              {(weapon.adventureCount ?? 0) > 0 && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-stone-800/80 border border-stone-700/50 text-stone-400 cursor-help">
                      <MapIcon className="w-3.5 h-3.5" />
                      <span className="text-xs text-stone-400">Вылазок:</span>
                      <span className="text-sm font-semibold text-stone-300">{weapon.adventureCount ?? 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-semibold">Экспедиций: {weapon.adventureCount ?? 0}</p>
                    <p className="text-xs text-stone-400">Количество успешных вылазок с этим оружием</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* ===== МАТЕРИАЛЫ ===== */}
          {weapon.materials && weapon.materials.length > 0 && (
            <div className="pt-2 border-t border-stone-700/50 mb-3">
              <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                <Package className="w-3 h-3" />
                Состав оружия
              </p>
              {(() => {
                const uniqueMaterials = Array.from(
                  new Map(weapon.materials.map(m => [m.materialId, m])).values()
                );
                return (
                  <div className="flex flex-wrap gap-2">
                    {uniqueMaterials.map((mat, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-stone-800/60 border-stone-600/50">
                        <span className="text-stone-400">{mat.materialName}</span>
                      </Badge>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  )
}
