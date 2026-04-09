/**
 * Вкладка «Алтарь» в кузнице: постройка узла зачарований и (будущее) улучшения алтаря.
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE2_ALTAR_CONSTRUCTION.md
 */

'use client'

import { Construction, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { AltarCraftContainer } from '@/components/forge/altar-craft-container'

export function AltarForgeSection() {
  const altarBuiltInForge = useGameStore((s) => s.altarBuiltInForge)
  const setCurrentScreen = useGameStore((s) => s.setCurrentScreen)
  const playerLevel = useGameStore((s) => s.player.level)

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
    <div className="space-y-4 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold text-amber-200 flex items-center gap-2">
          <Construction className="w-5 h-5 text-amber-500" />
          Сборка узла зачарований
        </h3>
        <p className="text-sm text-stone-400 mt-1">
          По чертежу из квеста «Эхо забытой кузни»: три фазы — основание и каркас, крепёж, проводка
          души (лунное серебро, торф, туманные травы). Заполните слоты материалами со склада и
          запустите сборку.
        </p>
      </div>
      <AltarCraftContainer playerLevel={playerLevel} forgeLevel={1} />
    </div>
  )
}
