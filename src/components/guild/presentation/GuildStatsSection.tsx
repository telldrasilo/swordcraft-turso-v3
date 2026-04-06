/**
 * Guild Stats Section Presentation Component
 * Статистика гильдии с системой репутации
 */

'use client'

import { Trophy, Users, Scroll, Star, Crown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGameStore } from '@/store/game-store-composed'
import { getMaxActiveExpeditions } from '@/types/guild'
import {
  getRankUpCost,
  getReputationPointsToAffordRankUp,
  MAX_GUILD_LEVEL,
} from '@/lib/guild-reputation-tier'

export function GuildStatsSection() {
  const guild = useGameStore((state) => state.guild)
  const stats = useGameStore((state) => state.statistics)

  const currentLevel = guild.level
  const currentReputation = guild.reputation
  const rankUpCost = getRankUpCost(currentLevel)
  const pointsToRankUp = getReputationPointsToAffordRankUp(currentLevel, currentReputation)
  const progressPercent =
    currentLevel >= MAX_GUILD_LEVEL || rankUpCost <= 0
      ? 100
      : Math.min(100, (currentReputation / rankUpCost) * 100)

  const maxExpeditions = getMaxActiveExpeditions(currentLevel)

  return (
    <div className="space-y-6">
      {/* Карточка уровня и репутации */}
      <Card className="card-medieval border-amber-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Crown className="w-5 h-5" />
            Уровень гильдии
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Уровень и репутация */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-amber-300">
                {currentLevel}
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-400">
                  Очки в ранге: <span className="text-amber-200 font-semibold">{currentReputation}</span>
                  {currentLevel < MAX_GUILD_LEVEL && rankUpCost > 0 && (
                    <span className="text-gray-600"> / {rankUpCost}</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Всего заработано: <span className="text-gray-300">{guild.totalReputation}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {currentLevel >= MAX_GUILD_LEVEL ? 'Ранг' : `До повышения ранга`}
              </div>
              <div className="text-lg font-semibold text-amber-200">
                {currentLevel >= MAX_GUILD_LEVEL
                  ? 'Максимум'
                  : pointsToRankUp > 0
                    ? `ещё ${pointsToRankUp}`
                    : 'можно повысить'}
              </div>
            </div>
          </div>

          {/* Прогресс-бар */}
          {currentLevel < MAX_GUILD_LEVEL && rankUpCost > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Прогресс</span>
                <span>{Math.floor(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {/* Бонусы уровня */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-gray-400 text-xs">Экспедиций завершено</div>
                <div className="text-gray-200 font-semibold">
                  {guild.stats.totalExpeditions}
                  <span className="text-gray-500 font-normal text-xs ml-1">
                    (слотов: {maxExpeditions})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-gray-400 text-xs">Искатели</div>
                <div className="text-gray-200 font-semibold">
                  {guild.knownAdventurers.length}/{guild.maxKnownAdventurers}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Общая статистика */}
      <Card className="card-medieval">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" />
            Статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Scroll className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs text-gray-500">Заказов</div>
                  <div className="font-semibold">{stats.ordersCompleted}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs text-gray-500">Экспедиций</div>
                  <div className="font-semibold">{stats.totalExpeditions}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Star className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs text-gray-500">Слава</div>
                  <div className="font-semibold">{guild.glory}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-500">Известных</div>
                  <div className="font-semibold">{guild.knownAdventurers.length}/{guild.maxKnownAdventurers}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
