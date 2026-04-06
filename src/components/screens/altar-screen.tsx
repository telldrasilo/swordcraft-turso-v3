/**
 * Экран зачарований (ранее «Алтарь душ»).
 * Гейт по tier-2; чертёж по квесту; контент модуля — после сборки узла в кузнице.
 */

'use client'

import { Lock, Sparkles, Construction, Hammer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import {
  canAccessEnchantmentAltarScreen,
  canUseEnchantmentAltarContent,
} from '@/lib/enchantment-screen-access'

export function AltarScreen() {
  const guildLevel = useGameStore((state) => state.guild.level)
  const altarUnlockedByForgottenForgeQuest = useGameStore(
    (state) => state.altarUnlockedByForgottenForgeQuest
  )
  const altarBuiltInForge = useGameStore((state) => state.altarBuiltInForge)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  const navigateToForgeTab = useGameStore((state) => state.navigateToForgeTab)
  const tierOk = canAccessEnchantmentAltarScreen(guildLevel)
  const contentOk = canUseEnchantmentAltarContent(
    guildLevel,
    altarUnlockedByForgottenForgeQuest,
    altarBuiltInForge
  )

  if (!tierOk) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Зачарования
          </h2>
          <p className="text-stone-500 text-sm mt-1">Алтарь зачарований закрыт</p>
        </div>
        <Card className="card-medieval border-amber-900/40 bg-stone-900/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-200/90">
              <Lock className="w-10 h-10 shrink-0" />
              <div>
                <p className="font-medium">Нужен доступ к локациям 2-го тира</p>
                <p className="text-sm text-stone-400 mt-1">
                  Поднимите гильдию: сейчас уровень {guildLevel}. Откройте экспедиции повыше 1-го тира.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setCurrentScreen('guild')}
            >
              В гильдию
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!altarUnlockedByForgottenForgeQuest) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Зачарования
          </h2>
          <p className="text-stone-500 text-sm mt-1">Алтарь ещё не разблокирован</p>
        </div>
        <Card className="card-medieval border-amber-900/40 bg-stone-900/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-200/90">
              <Lock className="w-10 h-10 shrink-0" />
              <div>
                <p className="font-medium">Завершите особое задание «Эхо забытой кузни»</p>
                <p className="text-sm text-stone-400 mt-1">
                  Откройте гильдию → вкладка экспедиций → «Особые задания», следуйте указаниям архивариуса.
                </p>
              </div>
            </div>
            <Button type="button" className="w-full sm:w-auto" onClick={() => setCurrentScreen('guild')}>
              В гильдию
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!contentOk) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Зачарования
          </h2>
          <p className="text-stone-500 text-sm mt-1">Соберите узел в кузнице</p>
        </div>
        <Card className="card-medieval border-amber-900/40 bg-stone-900/50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-200/90">
              <Construction className="w-10 h-10 shrink-0" />
              <div>
                <p className="font-medium">Чертёж и артефакты у вас в кузнице</p>
                <p className="text-sm text-stone-400 mt-1">
                  Откройте кузницу → вкладка «Алтарь» и завершите сборку узла. Пока узел не готов,
                  эссенция и полный модуль не задействуются.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="w-full sm:w-auto gap-2"
              onClick={() => navigateToForgeTab('altar')}
            >
              <Hammer className="w-4 h-4" />
              В кузницу — алтарь
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          Зачарования
        </h2>
        <p className="text-stone-500 text-sm flex items-center gap-2 mt-1">
          <Construction className="w-4 h-4 shrink-0" />
          Древо перков и эссенция — в разработке (фаза 2). Перековка доступна в кузнице.
        </p>
      </div>
      <Card className="card-medieval bg-stone-800/40">
        <CardContent className="p-4 text-sm text-stone-400 space-y-3">
          <p>
            Канон:{' '}
            <code className="text-amber-200/90">docs/systems/ENCHANTMENT_AWAKENING_CONCEPT.md</code>
            {' · '}
            фаза 1:{' '}
            <code className="text-amber-200/90">docs/systems/ENCHANTMENT_MODULE_PHASE1.md</code>.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => {
              navigateToForgeTab('reforge')
            }}
          >
            <Hammer className="w-4 h-4" />
            В кузницу — перековка
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
