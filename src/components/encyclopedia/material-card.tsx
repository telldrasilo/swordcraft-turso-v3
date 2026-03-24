/**
 * Карточка материала для энциклопедии
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  type MaterialNode,
  getMaterialRarity,
  RARITY_COLORS,
  RARITY_BG_COLORS,
  RARITY_LABELS,
  getDisplayCategory,
  MATERIAL_CATEGORIES,
  type MaterialKnowledge,
  getKnowledgeThreshold,
  KNOWLEDGE_LABELS,
  calculateExpertiseImpact,
} from '@/types/materials'
import {
  Mountain,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Package,
  Target,
} from 'lucide-react'

interface MaterialCardProps {
  material: MaterialNode
  knowledge?: MaterialKnowledge
  onClick?: () => void
}

export function MaterialCard({ material, knowledge, onClick }: MaterialCardProps) {
  const rarity = getMaterialRarity(material.economy)
  const displayCategory = getDisplayCategory(material)
  const categoryInfo = MATERIAL_CATEGORIES.find(c => c.id === displayCategory)

  const expertise = knowledge?.expertise || 0
  const threshold = getKnowledgeThreshold(expertise)
  const thresholdLabel = KNOWLEDGE_LABELS[threshold]
  const impact = calculateExpertiseImpact(expertise)

  // Что показывать
  const showBasic = expertise >= 10
  const showApplied = expertise >= 30
  const showStrengths = expertise >= 50
  const showDetails = expertise >= 75

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
        RARITY_BG_COLORS[rarity],
        'border'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn('text-lg', RARITY_COLORS[rarity])}>
              {material.identity.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {categoryInfo?.label || 'Другое'}
              </Badge>
              <Badge
                variant="outline"
                className={cn('text-xs', RARITY_COLORS[rarity])}
              >
                {RARITY_LABELS[rarity]}
              </Badge>
              {material.identity.origin !== 'natural' && (
                <Badge variant="outline" className="text-xs text-purple-400">
                  {material.identity.origin === 'refined' && 'Очищен'}
                  {material.identity.origin === 'alloy' && 'Сплав'}
                  {material.identity.origin === 'composite' && 'Композит'}
                </Badge>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-stone-800/50 flex items-center justify-center">
            <Mountain className={cn('w-6 h-6', RARITY_COLORS[rarity])} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Прогресс экспертизы */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-400">Экспертиза</span>
            <span className="text-stone-300">{Math.round(expertise)}%</span>
          </div>
          <Progress value={expertise} className="h-2" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-stone-500">{thresholdLabel}</span>
          </div>
        </div>

        {/* Влияние на крафт (если есть экспертиза) */}
        {expertise > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-stone-400">Время:</span>
              <span className="text-green-400">
                -{Math.round((1 - impact.timeMultiplier) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-stone-400">Риск:</span>
              <span className="text-green-400">
                -{Math.round((1 - impact.defectRiskMultiplier) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-purple-400" />
              <span className="text-stone-400">Отходы:</span>
              <span className="text-green-400">
                -{Math.round((1 - impact.materialWasteMultiplier) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              <span className="text-stone-400">Прогноз:</span>
              <span className="text-cyan-400">
                {Math.round(impact.predictionAccuracy)}%
              </span>
            </div>
          </div>
        )}

        {/* Базовое описание */}
        {showBasic && (
          <p className="text-sm text-stone-400 line-clamp-2">
            {material.summary.basic}
          </p>
        )}

        {/* Применение */}
        {showApplied && (
          <div className="text-xs">
            <span className="text-stone-500">Применение: </span>
            <span className="text-stone-300">{material.summary.applied}</span>
          </div>
        )}

        {/* Плюсы/минусы */}
        {showStrengths && (
          <div className="space-y-1">
            {material.summary.strengths.slice(0, 2).map((strength, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-400 shrink-0" />
                <span className="text-green-300">{strength}</span>
              </div>
            ))}
            {material.summary.weaknesses.slice(0, 1).map((weakness, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                <span className="text-red-300">{weakness}</span>
              </div>
            ))}
          </div>
        )}

        {/* Детальные свойства */}
        {showDetails && (
          <details className="text-xs">
            <summary className="cursor-pointer text-stone-500 hover:text-stone-400">
              Детальные свойства
            </summary>
            <div className="mt-2 space-y-1 border-l-2 border-stone-700 pl-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Твёрдость:</span>
                <span className="text-stone-300">{material.physical.hardness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Прочность:</span>
                <span className="text-stone-300">{material.physical.toughness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Обрабатываемость:</span>
                <span className="text-stone-300">{material.processing.workability}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Магия:</span>
                <span className="text-stone-300">{material.arcane.conductivity}</span>
              </div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

export default MaterialCard
