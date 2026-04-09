/**
 * Guild Screen
 * Главный экран гильдии (контейнер - только Tabs и layout)
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, Trophy, Map, Scroll, Crown, TrendingUp, ShoppingBag, Minus, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { OrdersSectionContainer } from './containers/OrdersSectionContainer'
import { ExpeditionsSectionContainer } from './containers/ExpeditionsSectionContainer'
import { GuildStatsSection } from './presentation/GuildStatsSection'
import { ContractsSection } from './contracts-section'
import { ReputationNotificationContainer } from './ReputationNotification'
import { IntendantSection } from './intendant-section'
import { useGameStore, type GuildScreenTab } from '@/store/game-store-composed'
import { getMaxActiveExpeditions } from '@/types/guild'
import {
  getRankUpCost,
  getReputationPointsToAffordRankUp,
  MAX_GUILD_LEVEL,
} from '@/lib/guild-reputation-tier'
import { useEffect, useState } from 'react'

export function GuildScreen() {
  const guild = useGameStore((state) => state.guild)
  const resources = useGameStore((state) => state.resources)
  const terminateGuildContract = useGameStore((state) => state.terminateGuildContract)
  const guildRankUp = useGameStore((state) => state.guildRankUp)
  const devAdjustGuildLevel = useGameStore((state) => state.devAdjustGuildLevel)
  const guildScreenTab = useGameStore((state) => state.guildScreenTab)
  const setGuildScreenTab = useGameStore((state) => state.setGuildScreenTab)
  const [previousLevel, setPreviousLevel] = useState(guild.level)
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false)

  const currentLevel = guild.level
  const currentReputation = guild.reputation
  const rankUpCost = getRankUpCost(currentLevel)
  const pointsToRankUp = getReputationPointsToAffordRankUp(currentLevel, currentReputation)
  const canRankUp =
    currentLevel < MAX_GUILD_LEVEL && rankUpCost > 0 && pointsToRankUp === 0
  const progressPercent =
    currentLevel >= MAX_GUILD_LEVEL || rankUpCost <= 0
      ? 100
      : Math.min(100, (currentReputation / rankUpCost) * 100)

  const maxExpeditions = getMaxActiveExpeditions(currentLevel)

  // Проверяем повышение уровня (отложенный setState вне синхронного тела effect)
  useEffect(() => {
    if (guild.level <= previousLevel) return
    queueMicrotask(() => {
      setShowLevelUpNotification(true)
      setPreviousLevel(guild.level)
    })
    const timer = setTimeout(() => {
      setShowLevelUpNotification(false)
    }, 5000)
    return () => clearTimeout(timer)
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
              <div className="text-2xl font-bold text-amber-300 flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 border-stone-600 text-stone-300 hover:bg-stone-800"
                  title="Понизить уровень (тест)"
                  aria-label="Понизить уровень гильдии"
                  disabled={currentLevel <= 1}
                  onClick={() => devAdjustGuildLevel(-1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="min-w-[1.5ch] tabular-nums">{currentLevel}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 border-stone-600 text-stone-300 hover:bg-stone-800"
                  title="Повысить уровень (тест)"
                  aria-label="Повысить уровень гильдии"
                  disabled={currentLevel >= MAX_GUILD_LEVEL}
                  onClick={() => devAdjustGuildLevel(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
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
                  <span className="text-gray-500">Очки в ранге: </span>
                  <span className="text-amber-200 font-semibold">{currentReputation}</span>
                  {currentLevel < MAX_GUILD_LEVEL && rankUpCost > 0 && (
                    <span className="text-gray-600"> / {rankUpCost}</span>
                  )}
                </div>
                {currentLevel < MAX_GUILD_LEVEL && rankUpCost > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500">До повышения ранга: </span>
                    <span className="text-amber-400">
                      {pointsToRankUp > 0 ? `ещё ${pointsToRankUp}` : 'можно повысить'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {currentLevel < MAX_GUILD_LEVEL && rankUpCost > 0 && (
                  <div className="text-right text-sm text-gray-400">
                    {Math.floor(progressPercent)}%
                  </div>
                )}
                {canRankUp ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-stone-950"
                    onClick={() => guildRankUp()}
                  >
                    Повысить ранг ({rankUpCost} реп.)
                  </Button>
                ) : null}
              </div>
            </div>
            {currentLevel < MAX_GUILD_LEVEL && rankUpCost > 0 && (
              <Progress value={progressPercent} className="h-2" />
            )}
            <div className="text-xs text-gray-500 mt-2">
              Всего заработано репутации (стат.):{' '}
              <span className="text-gray-400">{guild.totalReputation}</span>. Трать очки на повышение
              ранга или на интенданта.
            </div>
            
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

      <Tabs
        value={guildScreenTab}
        onValueChange={(v) => setGuildScreenTab(v as GuildScreenTab)}
        className="space-y-4"
      >
        <TabsList className="grid w-full min-h-11 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 h-auto">
          <TabsTrigger value="orders" className="gap-2">
            <Scroll className="w-4 h-4" />
            Заказы
          </TabsTrigger>
          <TabsTrigger value="expeditions" className="gap-2" data-tutorial="expeditions-tab">
            <Map className="w-4 h-4" />
            Экспедиции
          </TabsTrigger>
          <TabsTrigger value="adventurers" className="gap-2">
            <Users className="w-4 h-4" />
            Искатели
          </TabsTrigger>
          <TabsTrigger value="intendant" className="gap-2" data-tutorial="intendant-tab">
            <ShoppingBag className="w-4 h-4" />
            Интендант
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
          <ContractsSection
            contractedAdventurers={guild.contractedAdventurers}
            guildLevel={guild.level}
            guildGold={resources.gold}
            guildGlory={guild.glory}
            availableAdventurersCount={guild.adventurers.length}
            onTerminateContract={(adventurerId) => terminateGuildContract(adventurerId)}
          />
        </TabsContent>

        <TabsContent value="intendant" className="mt-6">
          <IntendantSection />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <GuildStatsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
