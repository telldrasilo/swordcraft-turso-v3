/**
 * Guild Stats Section Presentation Component
 * Статистика гильдии с системой репутации
 */

'use client'

import { Trophy, Users, Scroll, Star, Crown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGameStore } from '@/store/game-store-composed'
import {
  getReputationToNextLevel,
  getTotalReputationForLevel,
  getMaxActiveExpeditions,
} from '@/types/guild'

export function GuildStatsSection() {
  const guild = useGameStore((state) => state.guild)
  const stats = useGameStore((state) => state.statistics)

  // Рассчитываем прогресс до следующего уровня
  const currentLevel = guild.level
  const currentReputation = guild.reputation
  const nextLevelReputation = getTotalReputationForLevel(currentLevel + 1)
  const previousLevelReputation = getTotalReputationForLevel(currentLevel)
  const totalReputationForCurrentLevel = nextLevelReputation - previousLevelReputation
  const currentProgressInLevel = currentReputation - previousLevelReputation
  const progressPercent = totalReputationForCurrentLevel > 0
    ? Math.min(100, (currentProgressInLevel / totalReputationForCurrentLevel) * 100)
    : 100

  const reputationToNext = getReputationToNextLevel(currentReputation, currentLevel)
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
                  Репутация: <span className="text-amber-200 font-semibold">{currentReputation}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Всего: <span className="text-gray-300">{guild.totalReputation}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                До уровня {currentLevel + 1}
              </div>
              <div className="text-lg font-semibold text-amber-200">
                {reputationToNext > 0 ? `+${reputationToNext}` : 'Максимальный уровень'}
              </div>
            </div>
          </div>

          {/* Прогресс-бар */}
          {reputationToNext > 0 && (
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
                <div className="text-gray-400 text-xs">Экспедиций</div>
                <div className="text-gray-200 font-semibold">{maxExpeditions}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-gray-400 text-xs">Искателей</div>
                <div className="text-gray-200 font-semibold">{guild.maxKnownAdventurers}</div>
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
