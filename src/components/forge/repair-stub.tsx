/**
 * RepairStub - заглушка для секции ремонта
 * Разработка в процессе
 */

'use client'

import { Wrench, Hammer, Clock, Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function RepairStub() {
  return (
    <div className="space-y-4">
      {/* Заглушка ремонта */}
      <Card className="card-medieval bg-stone-800/30 border-dashed border-2 border-stone-600">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {/* Иконки */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-700/50 flex items-center justify-center">
                <Construction className="w-8 h-8 text-amber-500" />
              </div>
              <div className="w-16 h-16 rounded-full bg-stone-700/50 flex items-center justify-center">
                <Wrench className="w-8 h-8 text-stone-500" />
              </div>
            </div>

            {/* Заголовок */}
            <div>
              <h3 className="text-xl font-bold text-stone-200 mb-2 flex items-center justify-center gap-2">
                <Hammer className="w-5 h-5 text-amber-500" />
                Ремонт оружия
              </h3>
              <Badge className="bg-purple-900/50 text-purple-200 border-purple-600">
                Разработка в процессе
              </Badge>
            </div>

            {/* Описание */}
            <div className="max-w-md space-y-3">
              <p className="text-stone-400">
                Система ремонта позволит восстанавливать повреждённое оружие
              </p>

              {/* Планируемые функции */}
              <div className="bg-stone-900/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-stone-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Планируемые возможности:
                </h4>
                <ul className="text-sm text-stone-400 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>Выбор типа ремонта для каждого оружия</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>Влияние мастерства кузнеца на результат</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>Риски при ремонте (потеря качества, maxDurability)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>Получение опыта кузнецом за ремонт</span>
                  </li>
                </ul>
              </div>

              {/* Подсказка */}
              <p className="text-xs text-stone-500 italic">
                Используйте оружие в вылазках — когда оно получит повреждения,
                здесь можно будет его починить
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
