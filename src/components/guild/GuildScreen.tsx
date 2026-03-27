/**
 * Guild Screen
 * Главный экран гильдии (контейнер - только Tabs и layout)
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, Trophy, Map, Scroll, Crown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { OrdersSectionContainer } from './containers/OrdersSectionContainer'
import { ExpeditionsSectionContainer } from './containers/ExpeditionsSectionContainer'
import { GuildStatsSection } from './presentation/GuildStatsSection'
import { ReputationNotificationContainer } from './ReputationNotification'
import { useGameStore } from '@/store/game-store-composed'
import {
  getGuildReputationLevel,
  getReputationToNextLevel,
  getTotalReputationForLevel,
  getMaxActiveExpeditions,
} from '@/types/guild'
import { useEffect, useState } from 'react'

export function GuildScreen() {
  const guild = useGameStore((state) => state.guild)
  const [previousLevel, setPreviousLevel] = useState(guild.level)
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false)

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

  // Проверяем повышение уровня
  useEffect(() => {
    if (guild.level > previousLevel) {
      setShowLevelUpNotification(true)
      setPreviousLevel(guild.level)
      
      // Скрываем уведомление через 5 секунд
      const timer = setTimeout(() => {
        setShowLevelUpNotification(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [guild.level, previousLevel])

  return (
    <div className="container mx-auto p-4 relative">
      {/* Контейнер уведомлений о репутации */}
      <ReputationNotificationContainer />

      {/* Хедер с уровнем и репутацией */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            Гильдия
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Уровень гильдии</div>
              <div className="text-2xl font-bold text-amber-300 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                {currentLevel}
              </div>
            </div>
          </div>
        </div>
        <p className="text-gray-400 mb-4">
          Управляй искателями, выполняй заказы и отправляй экспедиции
        </p>

        {/* Прогресс-бар репутации */}
        <Card className="card-medieval border-amber-900/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="text-gray-500">Репутация: </span>
                  <span className="text-amber-200 font-semibold">{currentReputation}</span>
                </div>
                {reputationToNext > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">До уровня {currentLevel + 1}: </span>
                    <span className="text-amber-400">+{reputationToNext}</span>
                  </div>
                )}
              </div>
              {reputationToNext > 0 && (
                <div className="text-right text-sm text-gray-400">
                  {Math.floor(progressPercent)}%
                </div>
              )}
            </div>
            {reputationToNext > 0 && (
              <Progress value={progressPercent} className="h-2" />
            )}
            
            {/* Бонусы уровня */}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <div>
                  <div className="text-gray-500 text-xs">Экспедиций</div>
                  <div className="text-gray-200 font-semibold">{maxExpeditions}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-gray-500 text-xs">Искателей</div>
                  <div className="text-gray-200 font-semibold">{guild.maxKnownAdventurers}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Уведомление о повышении уровня */}
      {showLevelUpNotification && (
        <div className="mb-4 animate-in fade-in slide-in-from-top duration-300">
          <Card className="bg-gradient-to-r from-amber-900/50 to-yellow-900/50 border-amber-500/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Crown className="w-10 h-10 text-amber-400" />
                <div className="flex-1">
                  <div className="text-lg font-bold text-amber-200 mb-1">
                    Гильдия достигла уровня {currentLevel}!
                  </div>
                  <div className="text-sm text-gray-300">
                    {maxExpeditions > 1 && `Теперь можно отправлять ${maxExpeditions} экспедиции одновременно. `}
                    {guild.maxKnownAdventurers > 5 && `Максимум искателей: ${guild.maxKnownAdventurers}`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="orders" className="gap-2">
            <Scroll className="w-4 h-4" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="expeditions" className="gap-2">
            <Map className="w-4 h-4" />
            Экспедиции
          </TabsTrigger>
          <TabsTrigger value="adventurers" className="gap-2">
            <Users className="w-4 h-4" />
            Искатели
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <Trophy className="w-4 h-4" />
            Статистика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <OrdersSectionContainer />
        </TabsContent>

        <TabsContent value="expeditions" className="mt-6">
          <ExpeditionsSectionContainer />
        </TabsContent>

        <TabsContent value="adventurers" className="mt-6">
          <div className="text-center py-12 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Раздел искателей находится в разработке...</p>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <GuildStatsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
