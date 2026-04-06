/**
 * Вкладка «Алтарь» в кузнице: постройка узла зачарований и (будущее) улучшения алтаря.
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE2_ALTAR_CONSTRUCTION.md
 */

'use client'

import { Construction, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'

export function AltarForgeSection() {
  const altarBuiltInForge = useGameStore((s) => s.altarBuiltInForge)
  const setCurrentScreen = useGameStore((s) => s.setCurrentScreen)

  if (altarBuiltInForge) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div>
          <h3 className="text-lg font-semibold text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Узел зачарований собран
          </h3>
          <p className="text-sm text-stone-400 mt-1">
            Экран «Зачарования» в меню открыт для дальнейшего контента. Улучшения алтаря (sink для
            ресурсов) можно будет добавить сюда же.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => setCurrentScreen('altar')}>
          Открыть зачарования
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold text-amber-200 flex items-center gap-2">
          <Construction className="w-5 h-5 text-amber-500" />
          Сборка алтаря
        </h3>
        <p className="text-sm text-stone-400 mt-1">
          Чертёж и артефакты после квеста «Эхо забытой кузни» — здесь будет многоступенчатая сборка
          узла (крафт v2 / рецепт проекта). Эта вкладка остаётся постоянной точкой входа: позже сюда
          же лягут улучшения алтаря и расход излишков ресурсов.
        </p>
      </div>
      <Card className="card-medieval border-amber-900/40 bg-stone-900/50">
        <CardContent className="p-4 text-sm text-stone-400 space-y-2">
          <p>
            Рецепт окончательной сборки и список этапов подключаются в балансе; пока узел не собран,
            в меню «Зачарования» доступна только подсказка о сборке.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
