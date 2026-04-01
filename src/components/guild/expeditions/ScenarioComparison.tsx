/**
 * ScenarioComparison - Сравнение сценариев экспедиции
 * Показывает три варианта исхода: успех, критический успех, провал
 */

'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  AlertTriangle,
  Shield,
  Swords,
} from 'lucide-react'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import { calculateExpeditionResult } from '@/lib/expedition-calculator-v2'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { CraftedWeaponV2 } from '@/types/craft-v2'

interface ScenarioComparisonProps {
  expedition: ExpeditionTemplate
  adventurer: AdventurerExtended
  weapon: CraftedWeaponV2
  guildLevel: number
  contractType?: 'exploration' | 'speed'
}

interface ScenarioData {
  type: 'success' | 'critical' | 'failure'
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  reward: {
    gold: number
    warSoul: number
    glory: number
  }
  weaponLossChance: number
}

export function ScenarioComparison({
  expedition,
  adventurer,
  weapon,
  guildLevel,
  contractType = 'exploration',
}: ScenarioComparisonProps) {
  // Рассчитываем результат экспедиции
  const calculation = calculateExpeditionResult(
    adventurer,
    expedition,
    guildLevel,
    weapon.stats.attack,
    weapon.currentDurability,
    weapon.type as any,
    weapon.id,
    weapon.qualityRank,
    weapon.epicMultiplier,
    weapon.combatMaterialId,
    weapon.quality,
    contractType
  )

  // Для критического и провала используем множители
  const successChance = calculation.successChance
  const criticalChance = Math.max(5, (100 - successChance) * 0.15) // ~15% от оставшегося шанса
  const failureChance = 100 - successChance - criticalChance

  const scenarios: ScenarioData[] = [
    {
      type: 'critical',
      label: 'Критический успех',
      description: 'Искатель превзошёл ожидания! Дополнительные награды и слава.',
      icon: <Star className="w-6 h-6" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-600/50',
      reward: {
        gold: Math.round(calculation.commission * 1.5),
        warSoul: Math.round(expedition.reward.baseWarSoul * 1.5),
        glory: 5,
      },
      weaponLossChance: 0,
    },
    {
      type: 'success',
      label: 'Успех',
      description: 'Миссия выполнена. Стандартная награда.',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600/50',
      reward: {
        gold: calculation.commission,
        warSoul: expedition.reward.baseWarSoul,
        glory: 2,
      },
      weaponLossChance: 0,
    },
    {
      type: 'failure',
      label: 'Провал',
      description: 'Миссия не удалась. Угроза потери оружия.',
      icon: <XCircle className="w-6 h-6" />,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-600/50',
      reward: {
        gold: Math.round(calculation.commission * 0.1),
        warSoul: 0,
        glory: 0,
      },
      weaponLossChance: expedition.weaponLossChance,
    },
  ]

  const successRate = Math.round(successChance)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
    >
      {/* Заголовок с шансом успеха */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Вероятности исхода
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Шанс успеха:</span>
          <span
            className={`font-bold ${
              successRate >= 70
                ? 'text-green-400'
                : successRate >= 40
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            {successRate}%
          </span>
        </div>
      </div>

      {/* График вероятностей */}
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
          {/* Критический успех */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(criticalChance)}%` }}
            className="bg-yellow-500/70"
            title={`Критический успех ~${Math.round(criticalChance)}%`}
          />
          {/* Обычный успех */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, successRate - Math.round(criticalChance))}%` }}
            className="bg-green-500/70"
            title={`Успех ~${Math.max(0, successRate - Math.round(criticalChance))}%`}
          />
          {/* Провал */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(failureChance)}%` }}
            className="bg-red-500/70"
            title={`Провал ~${Math.round(failureChance)}%`}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Крит (~{Math.round(criticalChance)}%)</span>
          <span>Успех (~{Math.max(0, successRate - Math.round(criticalChance))}%)</span>
          <span>Провал (~{Math.round(failureChance)}%)</span>
        </div>
      </div>

      {/* Карточки сценариев */}
      <div className="grid grid-cols-3 gap-3">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.type}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border ${scenario.borderColor} ${scenario.bgColor} p-3`}
          >
            {/* Иконка и название */}
            <div className={`flex items-center gap-2 mb-2 ${scenario.color}`}>
              {scenario.icon}
              <span className="font-semibold text-sm">{scenario.label}</span>
            </div>

            {/* Описание */}
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {scenario.description}
            </p>

            {/* Награды */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Золото:</span>
                <span className="text-amber-400 font-medium">
                  {scenario.reward.gold}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">War Soul:</span>
                <span className="text-blue-400 font-medium">
                  {scenario.reward.warSoul}
                </span>
              </div>
              {scenario.reward.glory > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Слава:</span>
                  <span className="text-purple-400 font-medium">
                    +{scenario.reward.glory}
                  </span>
                </div>
              )}
            </div>

            {/* Предупреждение о потере оружия */}
            {scenario.weaponLossChance > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Шанс потери оружия: {scenario.weaponLossChance}%</span>
              </div>
            )}

            {/* Безопасность */}
            {scenario.weaponLossChance === 0 && scenario.type !== 'failure' && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Оружие в безопасности</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Подсказка */}
      <div className="mt-4 p-3 rounded bg-slate-800/50 text-xs text-slate-400">
        <p className="flex items-start gap-2">
          <Swords className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Итоговый результат зависит от множителей снаряжения, навыков искателя
            и немного от удачи. Используйте подходящее оружие и качественное снаряжение
            для повышения шансов.
          </span>
        </p>
      </div>
    </motion.div>
  )
}

export default ScenarioComparison
