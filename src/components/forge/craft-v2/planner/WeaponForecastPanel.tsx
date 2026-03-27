'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords, Shield, Scale, Flame, Sparkles, Zap, AlertTriangle } from 'lucide-react'
import { QualityBadge } from './forecast/QualityBadge'
import { StatRow } from './forecast/StatRow'
import { type WeaponForecast } from '@/types/forecast'
import { cn } from '@/lib/utils'

interface WeaponForecastPanelProps {
  forecast: WeaponForecast
  className?: string
}

export function WeaponForecastPanel({
  forecast,
  className
}: WeaponForecastPanelProps) {
  // Слабейшая характеристика (наибольшая дисперсия)
  const weakStat = useMemo(() => {
    const stats = [
      { key: 'attack', label: 'Атака', variance: forecast.attack.variance },
      { key: 'durability', label: 'Прочность', variance: forecast.durability.variance },
      { key: 'weight', label: 'Вес', variance: forecast.weight.variance },
      { key: 'soulCapacity', label: 'Душа Войны', variance: forecast.soulCapacity.variance },
    ]
    return stats.reduce((a, b) => (a.variance > b.variance ? a : b))
  }, [forecast])

  return (
    <Card className={cn(
      'bg-gradient-to-br from-stone-900/90 to-stone-800/90',
      'border-amber-900/30',
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Прогноз результата</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Основной контент: характеристики слева, качество справа */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Левая колонка - характеристики */}
          <div className="flex-1 min-w-0">
            {/* Список характеристик */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                <StatRow
                  key="attack"
                  stat="attack"
                  range={forecast.attack}
                  icon={<Swords className="w-5 h-5" />}
                  label="Атака"
                />
                <StatRow
                  key="durability"
                  stat="durability"
                  range={forecast.durability}
                  icon={<Shield className="w-5 h-5" />}
                  label="Прочность"
                />
                <StatRow
                  key="weight"
                  stat="weight"
                  range={forecast.weight}
                  icon={<Scale className="w-5 h-5" />}
                  label="Вес"
                />
                <StatRow
                  key="soulCapacity"
                  stat="soulCapacity"
                  range={forecast.soulCapacity}
                  icon={<Flame className="w-5 h-5" />}
                  label="Душа Войны"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Правая колонка - качество */}
          <div className="lg:w-64 lg:flex-shrink-0 flex lg:block justify-center lg:justify-start">
            <div className="w-full">
              <QualityBadge quality={forecast.quality} />

              {/* Слабое место */}
              <div className="mt-3 p-3 rounded-lg bg-red-900/15 border border-red-900/30">
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  Слабое место
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-300">{weakStat.label}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">Наибольший разброс значений</p>
              </div>
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent lg:hidden" />

        {/* Информация о точности прогноза */}
        <AnimatePresence>
          {forecast.predictionAccuracy < 100 && (
            <motion.div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                forecast.predictionAccuracy < 70
                  ? 'bg-red-900/20 border border-red-800/50'
                  : 'bg-amber-900/20 border border-amber-800/50'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Zap className={cn(
                'w-4 h-4',
                forecast.predictionAccuracy < 70 ? 'text-red-400' : 'text-amber-400'
              )} />
              <div className="flex-1">
                <p className="text-sm text-stone-300">
                  <span className={cn(
                    'font-semibold',
                    forecast.predictionAccuracy < 70 ? 'text-red-400' : 'text-amber-400'
                  )}>Точность: {forecast.predictionAccuracy}%</span>
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Повысьте экспертизу материалов
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
