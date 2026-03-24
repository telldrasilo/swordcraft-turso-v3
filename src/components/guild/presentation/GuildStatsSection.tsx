/**
 * Guild Stats Section Presentation Component
 * Заглушка для будущей реализации
 */

'use client'

import { Trophy, Users, Scroll, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GuildStatsSection() {
  return (
    <div className="space-y-6">
      <Card className="card-medieval">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" />
            Статистика гильдии
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span>Уровень гильдии:</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Scroll className="w-4 h-4" />
                <span>Выполнено заказов:</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Star className="w-4 h-4" />
                <span>Слава:</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Подробная статистика находится в разработке...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
