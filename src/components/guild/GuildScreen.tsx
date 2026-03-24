/**
 * Guild Screen
 * Главный экран гильдии (контейнер - только Tabs и layout)
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, Trophy, Map, Scroll } from 'lucide-react'
import { OrdersSectionContainer } from './containers/OrdersSectionContainer'
import { ExpeditionsSection } from './presentation/ExpeditionsSection'
import { GuildStatsSection } from './presentation/GuildStatsSection'

export function GuildScreen() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <Shield className="w-8 h-8 text-amber-400" />
          Гильдия
        </h1>
        <p className="text-gray-400 mt-2">
          Управляй искателями, выполняй заказы и отправляй экспедиции
        </p>
      </div>

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
          <ExpeditionsSection />
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
