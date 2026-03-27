/**
 * Компонент карточки искателя — улучшенная версия
 * Версия 5.0 — Индивидуальность + компактный UX/UI + исправленные layout проблемы
 */

'use client'

import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { Clock, Zap, Shield, TrendingUp, CheckCircle, Swords, Sparkles } from 'lucide-react'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { getRarityConfig, getRarityStars } from '@/data/adventurer-rarity'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import { getStrengthById, doesStrengthApply } from '@/data/adventurer-tags/strengths'
import { getWeaknessById, doesWeaknessApply } from '@/data/adventurer-tags/weaknesses'
import { getCombatStyleById } from '@/data/adventurer-tags/combat-styles'
import { 
  calculateExpeditionResult as calculateExpeditionResultV2,
  formatModifierValue,
  type ExpeditionCalculation
} from '@/lib/expedition-calculator-v2'
import { generateAdvice, type Advice } from '@/lib/adventurer-advice'
import { MetBadge } from '@/components/ui/met-badge'

// Импорт новых компонентов
import { SuccessFactorsBlock, SuccessFactor } from './SuccessFactorsBlock'
import { getAdventurerQuote } from './adventurer-quotes'

// ================================
// ПРОПСЫ
// ================================

interface AdventurerCardV2Props {
  adventurer: AdventurerExtended
  expedition: {
    id: string
    name: string
    difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'
    type: 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
    baseGold: number
    baseWarSoul: number
    duration: number
    failureChance: number
    weaponLossChance: number
    minWeaponAttack: number
    minGuildLevel: number
  }
  guildLevel: number
  weaponAttack: number
  weaponQuality?: number
  onSelect?: () => void
  onDetails?: () => void
  selected?: boolean
}

// ================================
// ГЕНЕРАТОР ФАКТОРОВ УСПЕХА
// ================================

const generateSuccessFactors = (
  calc: ExpeditionCalculation,
  adventurer: AdventurerExtended,
  expedition: { difficulty: string, type: string, minGuildLevel: number }
): { blockType: 'ideal' | 'balanced' | 'risky', factors: SuccessFactor[] } => {
  const factors: SuccessFactor[] = []
  let blockType: 'ideal' | 'balanced' | 'risky' = 'ideal'
  
  // Фактор 1: Уровень vs требования
  const levelDiff = adventurer.combat.level - expedition.minGuildLevel
  if (levelDiff >= 5) {
    factors.push({
      type: 'positive',
      icon: '⭐',
      text: `Уровень ${Math.round(adventurer.combat.level)} намного выше рекомендованного ${expedition.minGuildLevel}`,
      value: '+15% к успеху'
    })
    blockType = 'ideal'
  } else if (levelDiff < -5) {
    factors.push({
      type: 'negative',
      icon: '⚠️',
      text: `Уровень ${Math.round(adventurer.combat.level)} значительно ниже ${expedition.minGuildLevel}`,
      value: '-25% к успеху'
    })
    blockType = 'risky'
  }
  
  // Фактор 2: Сильные стороны
  const applicableStrengths = adventurer.strengths.filter(s => {
    const strengthData = getStrengthById(s.id)
    return strengthData && doesStrengthApply(strengthData, expedition.difficulty as any, expedition.type as any)
  })
  
  if (applicableStrengths.length > 0) {
    const strength = applicableStrengths[0]
    const data = getStrengthById(strength.id)
    factors.push({
      type: 'positive',
      icon: data.icon,
      text: data.name,
      value: data.effects.successBonus > 0 ? `+${data.effects.successBonus}% к успеху` : undefined
    })
  }
  
  // Фактор 3: Характер
  if (adventurer.personality.primaryTrait === 'brave' || 
      adventurer.personality.primaryTrait === 'daring') {
    factors.push({
      type: 'positive',
      icon: '💪',
      text: 'Храбрый характер',
      value: '+5% к успеху'
    })
  }
  
  // Определение итогового типа блока
  const positiveCount = factors.filter(f => f.type === 'positive').length
  const negativeCount = factors.filter(f => f.type === 'negative').length
  
  if (positiveCount >= 2 && negativeCount === 0) {
    blockType = 'ideal'
  } else if (positiveCount >= 1 && negativeCount <= 1) {
    blockType = 'balanced'
  } else if (negativeCount >= 2) {
    blockType = 'risky'
  }
  
  return { blockType, factors }
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

export const AdventurerCardV2: React.FC<AdventurerCardV2Props> = ({
  adventurer,
  expedition,
  guildLevel,
  weaponAttack,
  weaponQuality = 50,
  onSelect,
  onDetails,
  selected = false,
}) => {
  // Редкость искателя
  const rarityConfig = useMemo(() => 
    getRarityConfig(adventurer.combat.rarity), 
    [adventurer.combat.rarity]
  )
  
  // Полный расчёт экспедиции через V2 калькулятор
  const calc = useMemo(() => {
    const template = {
      id: expedition.id,
      name: expedition.name,
      description: '',
      icon: '⚔️',
      type: expedition.type,
      difficulty: expedition.difficulty,
      duration: expedition.duration,
      cost: { supplies: 0, deposit: 0 },
      reward: { 
        baseGold: expedition.baseGold, 
        baseWarSoul: expedition.baseWarSoul 
      },
      minGuildLevel: 1,
      failureChance: expedition.failureChance,
      weaponLossChance: expedition.weaponLossChance,
      recommendedWeaponTypes: [],
      minWeaponAttack: expedition.minWeaponAttack || 5,
    }
    return calculateExpeditionResultV2(
      adventurer, 
      template, 
      guildLevel, 
      weaponAttack, 
      weaponQuality,
      'sword', // тип оружия по умолчанию
      'weapon_0'
    )
  }, [adventurer, expedition, guildLevel, weaponAttack, weaponQuality])
  
  // Имя
  const displayName = useMemo(() => {
    const name = adventurer.identity.firstName
    const nickname = adventurer.identity.nickname
    return nickname ? `${name} "${nickname}"` : name
  }, [adventurer.identity])
  
  // Характер
  const primaryTrait = useMemo(() => 
    getPersonalityTraitById(adventurer.personality.primaryTrait),
    [adventurer.personality.primaryTrait]
  )
  
  // Стиль боя
  const combatStyle = useMemo(() =>
    getCombatStyleById(adventurer.combat.combatStyle),
    [adventurer.combat.combatStyle]
  )
  
  // Совет
  const advice = useMemo<Advice | null>(() => {
    return generateAdvice(
      adventurer,
      { 
        ...expedition,
        description: '', icon: '',
        cost: { supplies: 0, deposit: 0 },
        minGuildLevel: 1, recommendedWeaponTypes: []
      },
      calc.successChance,
      calc.commission,
      calc.warSoul
    )
  }, [adventurer, expedition, calc])
  
  // Цвет успеха
  const successColor = useMemo(() => {
    if (calc.successChance >= 75) return 'text-green-400'
    if (calc.successChance >= 50) return 'text-amber-400'
    return 'text-red-400'
  }, [calc.successChance])
  
  // Цвет риска
  const riskColor = useMemo(() => {
    if (calc.weaponLossChance > 15) return 'text-red-400'
    if (calc.weaponLossChance >= 5) return 'text-amber-400'
    return 'text-stone-400'
  }, [calc.weaponLossChance])
  
  // Расчёт времени
  const durationMinutes = useMemo(() => {
    return Math.floor(expedition.duration / 60)
  }, [expedition.duration])

  // Цвет прогресс-бара успеха
  const progressColor = useMemo(() => {
    if (calc.successChance >= 75) return 'bg-green-500'
    if (calc.successChance >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }, [calc.successChance])

  // Цитата искателя (мемоизируется на основе ID искателя и типа экспедиции)
  const quote = useMemo(() => {
    return getAdventurerQuote(adventurer, expedition)
  }, [adventurer.id, expedition.type])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card 
        className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 transition-all cursor-pointer h-full flex flex-col ${
          selected ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-900/30' : 'hover:border-stone-500'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-3 space-y-2 flex-1 flex-col overflow-hidden min-h-0">
          {/* ===== ЗАГОЛОВОК ===== */}
          <div className="flex items-start justify-between gap-2 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className={`font-bold text-base truncate cursor-help ${rarityConfig.textColor}`}>
                      {displayName}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{rarityConfig.nameRu} искатель</p>
                    <p className="text-xs text-stone-300">
                      Уровень {Math.round(adventurer.combat.level)} • Сила {Math.round(adventurer.combat.power)} • Меткость {Math.round(adventurer.combat.precision)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex items-center gap-1.5 mt-0.5">
                {/* Звёзды редкости */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-amber-400 text-xs cursor-help">
                        {'★'.repeat(getRarityStars(adventurer.combat.rarity))}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{rarityConfig.nameRu}</p>
                      <p className="text-xs text-stone-300">
                        {rarityConfig.nameRu === 'Легендарный' && '+50% золота, +100% душ войны'}
                        {rarityConfig.nameRu === 'Эпический' && '+35% золота, +50% душ войны'}
                        {rarityConfig.nameRu === 'Редкий' && '+20% золота, +30% душ войны'}
                        {rarityConfig.nameRu === 'Необычный' && '+10% золота, +15% душ войны'}
                        {rarityConfig.nameRu === 'Обычный' && 'Базовые награды'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Уровень */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 cursor-help">
                        Ур. {Math.round(adventurer.combat.level)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Уровень {Math.round(adventurer.combat.level)}</p>
                      <p className="text-xs text-stone-300">
                        {calc.levelMatch.match === 'optimal' && '✓ Идеальное соответствие миссии'}
                        {calc.levelMatch.match === 'underlevel' && '⚠ Немного ниже рекомендованного'}
                        {calc.levelMatch.match === 'overlevel' && '😴 Слишком опытный для этой миссии'}
                        {calc.levelMatch.match === 'dangerous' && '💀 Уровень слишком низкий!'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Бейдж "Уже встречали" */}
                <MetBadge adventurerId={adventurer.id} compact />
                
                {/* Стиль боя */}
                {combatStyle && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 cursor-help">
                          {combatStyle.icon} {combatStyle.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{combatStyle.name}</p>
                        <p className="text-xs text-stone-300">{combatStyle.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            {/* Шанс успеха */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`text-right flex-shrink-0 cursor-help ${successColor}`}>
                    <div className="text-3xl font-bold leading-none">{calc.successChance}%</div>
                    <div className="text-[10px] text-stone-400">успех</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold">Шанс успеха миссии</p>
                  <p className="text-xs text-stone-300">
                    Базовый шанс зависит от сложности миссии. На него влияют уровень искателя, оружие, сильные и слабые стороны.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* ===== БЛОК ОБЪЯСНЕНИЯ ФАКТОРОВ ===== */}
          {(() => {
            const { blockType, factors } = generateSuccessFactors(calc, adventurer, expedition)

            return (
              <div className="mt-3 space-y-2">
                <SuccessFactorsBlock
                  successChance={calc.successChance}
                  factors={factors}
                  blockType={blockType}
                  adventurerName={displayName}
                  quote={quote.text}
                />
              </div>
            )
          })()}

          {/* ===== ПРОГНОЗ МИССИИ ===== */}
          <div className="bg-stone-950/80 rounded-lg p-3 border border-stone-700 space-y-2">
            {/* Заголовок прогноза */}
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-medium text-stone-300 uppercase tracking-wider flex items-center gap-2 cursor-help">
                      <TrendingUp className="w-4 h-4" />
                      Прогноз миссии
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold">Расчёт результатов миссии</p>
                    <p className="text-xs text-stone-300">
                      Предварительный расчёт на основе всех параметров искателя, оружия и условий миссии.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {advice && (
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
              )}
            </div>

            {/* Критические метрики (шанс успеха + доход) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Шанс успеха */}
              <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/30">
                <span className="text-xs text-green-300 block mb-1">Шанс успеха</span>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${successColor}`}>{calc.successChance}%</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${progressColor}`}
                    style={{ width: `${calc.successChance}%` }}
                  />
                </div>
              </div>

              {/* Доход */}
              <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <span className="text-xs text-amber-300 block mb-1">Доход</span>
                <div className="text-2xl font-bold text-amber-400">
                  💰 {calc.commission}
                </div>
              </div>
            </div>

            {/* Второстепенные метрики (длительность + души войны) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Длительность */}
              <div className="p-3 rounded-lg bg-stone-800/50 border border-stone-700">
                <span className="text-xs text-stone-400 block mb-1">Длительность</span>
                <div className="flex items-center gap-1 text-lg font-semibold text-stone-200">
                  <Clock className="w-4 h-4" />
                  {durationMinutes} мин
                </div>
              </div>

              {/* Души войны */}
              <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <span className="text-xs text-purple-300 block mb-1">Души войны</span>
                <div className="text-lg font-semibold text-purple-400">
                  ~{calc.warSoul}
                </div>
              </div>
            </div>

            {/* Риски */}
            <div className="grid grid-cols-2 gap-2">
              {/* Износ оружия */}
              <div className="p-3 rounded-lg bg-stone-800/50 border border-stone-700">
                <span className="text-xs text-stone-400 block mb-1">Износ оружия</span>
                <div className="flex items-center gap-1 text-sm font-bold text-stone-200">
                  <Swords className="w-3 h-3" />
                  -{calc.weaponWear}%
                </div>
              </div>

              {/* Риск потери */}
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
                <span className="text-xs text-red-300 block mb-1">Риск потери</span>
                <div className="flex items-center gap-1 text-sm font-bold text-stone-200">
                  <Shield className="w-3 h-3" />
                  <span className={riskColor}>{calc.weaponLossChance}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== КНОПКА ВЫБОРА ===== */}
          {onSelect && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect()
                    }}
                    className={`w-full mt-auto flex-shrink-0 ${selected ? 'bg-amber-600 hover:bg-amber-500' : ''}`}
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                  >
                    {selected ? '✓ Выбран' : 'Выбрать'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">
                    {selected ? 'Искатель выбран' : 'Выбрать этого искателя'}
                  </p>
                  <p className="text-xs text-stone-300">
                    {selected 
                      ? 'Нажмите "Отправить в экспедицию" для подтверждения'
                      : 'Нажмите для выбора этого искателя на миссию'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AdventurerCardV2
