/**
 * WeaponInventoryCard - карточка оружия в инвентаре
 */

'use client'

import { motion } from 'framer-motion'
import {
  Sword, Heart, Star, Coins, Trash2, Map as MapIcon, Crown, Sparkles, Zap,
  Package, Wrench, Hammer
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useGameStore } from '@/store'
import { 
  weaponRecipes, 
  weaponTypeStats, 
} from '@/data/weapon-recipes'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { getQualityColor, getQualityNameRu } from '@/types/craft-v2'
import { cn } from '@/lib/utils'
import { WeaponIcon, qualityColors } from './forge-utils'
import {
  getWarSoulTier,
  getProgressToNextTier,
  getWarSoulTierIcon,
  getWarSoulTierColor,
  getWarSoulTierBgColor,
} from '@/lib/war-soul-utils'

interface WeaponInventoryCardProps {
  weapon: CraftedWeaponV2
}

export function WeaponInventoryCard({ weapon }: WeaponInventoryCardProps) {
  const sellWeapon = useGameStore((state) => state.sellWeapon)
  const isWeaponInExpedition = useGameStore((state) => state.isWeaponInExpedition)
  const [isSelling, setIsSelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  // Для будущей возможности разблокирования (когда будет реализована система разблокировок)
  const [showLocked, setShowLocked] = useState(false)
  
  const qualityGrade = weapon.qualityGrade
  const qualityColor = getQualityColor(weapon.quality)
  const qualityNameRu = getQualityNameRu(weapon.quality)
  
  const qualityInfo = {
    grade: qualityGrade,
    name: qualityNameRu,
    multiplier: weapon.quality / 100,
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
  const recipe = weaponRecipes.find(r => r.id === weapon.recipeId)
  
  // Проверяем, в экспедиции ли оружие
  const inExpedition = isWeaponInExpedition(weapon.id)
  
  // Прочность для индикаторов
  const durability = weapon.currentDurability ?? weapon.stats.durability
  const durabilityPercent = Math.round((durability / weapon.stats.maxDurability) * 100)
  const durabilityColor = durabilityPercent > 50 ? 'text-green-400' : durabilityPercent > 25 ? 'text-yellow-400' : 'text-red-400'
  const durabilityBgColor = durabilityPercent > 50 ? 'bg-green-500' : durabilityPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
  
  // Тир оружия (число в строку для отображения)
  const tierNum = weapon.tier
  const tierStr = tierNum <= 1 ? 'common' : tierNum <= 2 ? 'uncommon' : tierNum <= 3 ? 'rare' : tierNum <= 4 ? 'epic' : 'legendary'
  const tierColor =
    qualityColors[tierStr] ??
    qualityColors.common ?? {
      text: 'text-stone-400',
      bg: 'bg-stone-900/80',
      border: 'border-stone-600',
    }
  const tierNames: Record<string, string> = {
    common: 'Обычное', uncommon: 'Необычное', rare: 'Редкое',
    epic: 'Эпическое', legendary: 'Легендарное', mythic: 'Мифическое'
  }
  
  // Тир Души Войны
  const warSoulTier = weapon.warSoul > 0 || (weapon.maxWarSoul ?? 0) > 0 
    ? getWarSoulTier(weapon.warSoul, weapon.maxWarSoul ?? 100)
    : null
  
  const warSoulProgress = warSoulTier 
    ? getProgressToNextTier(weapon.warSoul, weapon.maxWarSoul ?? 100)
    : 0
  
  const handleSell = () => {
    setIsSelling(true)
    setTimeout(() => {
      sellWeapon(weapon.id)
      setIsSelling(false)
      setShowConfirm(false)
    }, 500)
  }
  
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
                tierColor.bg
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
                  <Badge className={cn('font-semibold cursor-help', qualityInfo.color)}>
                    {qualityInfo.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Качество: {qualityInfo.name} (×{qualityInfo.multiplier})</p>
                  <p className="text-xs text-stone-400">Влияет на атаку и цену</p>
                </TooltipContent>
              </Tooltip>
              <Badge variant="outline" className={cn('text-xs cursor-help', tierColor.text, tierColor.border)}>
                Тир {tierNum}
              </Badge>
              {/* Бейдж тира Души Войны */}
              {warSoulTier && (
                <Badge 
                  className={cn(
                    'text-xs font-semibold gap-1',
                    warSoulTier.bgColor,
                    warSoulTier.color
                  )}
                  title={`${warSoulTier.icon} ${warSoulTier.name}: +${warSoulTier.bonus.successBonus}% успеха, +${warSoulTier.bonus.goldBonus}% золота, +${warSoulTier.bonus.warSoulBonus}% душ`}
                >
                  <span>{warSoulTier.icon}</span>
                  <span>{warSoulTier.name}</span>
                </Badge>
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

            {/* КАЧЕСТВО */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Star className={cn('w-4 h-4', qualityInfo.color)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Качество</span>
                      <span className={cn('text-xs font-medium', qualityInfo.color)}>{weapon.quality}/100</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all', qualityBgColor)} 
                        style={{ width: `${weapon.quality}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className={cn('font-semibold', qualityInfo.color)}>Качество: {weapon.quality}/100</p>
                <p className="text-xs text-stone-400">Влияет на атаку и цену. Зависит от навыков кузнецов</p>
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

          {/* ===== ТЕХНИКИ ===== */}
          {weapon.techniquesUsed && weapon.techniquesUsed.length > 0 && (
            <div className="pt-2 border-t border-stone-700/50 mb-3">
              <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                <Hammer className="w-3 h-3" />
                Техники
              </p>
              <div className="flex flex-wrap gap-1.5">
                {weapon.techniquesUsed.map((tech, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline"
                    className="text-xs bg-purple-900/20 border-purple-600/30 text-purple-300"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* ===== ТЕХНИКИ ===== */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-700/50 mb-3">
            <span className="text-xs text-stone-500">Цена продажи:</span>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Coins className="w-4 h-4" />
              <span>{weapon.sellPrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
