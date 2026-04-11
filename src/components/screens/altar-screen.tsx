/**
 * Экран зачарований: стройка алтаря v2 и (после финала) контент модуля.
 */

'use client'

import { useState } from 'react'
import { Lock, Sparkles, Hammer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameStore } from '@/store'
import { coerceAltarPhase } from '@/lib/altar/coerce-altar-phase'
import { canAccessForgottenForgeEnchantmentFlow } from '@/lib/enchantment-screen-access'
import type { AltarPhase } from '@/types/altar-construction'
import { AltarQuestGoal } from '@/components/enchantment/altar-quest-goal'
import { useAltarConstructionTick } from '@/hooks/use-altar-construction-tick'
import { useToast } from '@/hooks/use-toast'
import { AltarRoadmap } from '@/components/enchantment/altar-construction/altar-roadmap'
import { AltarPhaseDetailsPanel } from '@/components/enchantment/altar-construction/altar-phase-details-panel'

export function AltarScreen() {
  const altarUnlockedByForgottenForgeQuest = useGameStore(
    (state) => state.altarUnlockedByForgottenForgeQuest
  )
  const altarBuiltInForge = useGameStore((state) => state.altarBuiltInForge)
  const forgottenForgeQuest = useGameStore((state) => state.forgottenForgeQuest)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  const navigateToForgeTab = useGameStore((state) => state.navigateToForgeTab)

  const materialStash = useGameStore((state) => state.materialStash)
  const unlockedCraftTechniqueIds = useGameStore((state) => state.unlockedCraftTechniqueIds)
  const unlockedMaterialProcessingTechniqueIds = useGameStore(
    (state) => state.unlockedMaterialProcessingTechniqueIds
  )
  const altarConstruction = useGameStore((state) => state.altarConstruction)
  const startPhase = useGameStore((state) => state.startAltarConstructionPhase)
  const cancelPhase = useGameStore((state) => state.cancelAltarConstructionPhase)
  const devSkipToNextConstructionStage = useGameStore(
    (state) => state.devAltarConstructionSkipToNextStage
  )
  const devCompleteConstructionPhase = useGameStore(
    (state) => state.devAltarConstructionCompleteActivePhase
  )

  const [enchantTab, setEnchantTab] = useState<'enchant' | 'upgrade'>('enchant')
  /** Выбор на дорожной карте; при активной стройке совпадает с `activePhaseNorm`. */
  const [selectedPhase, setSelectedPhase] = useState<AltarPhase>(1)
  const activePhaseNorm = coerceAltarPhase(altarConstruction.activePhase)
  const detailPhase = activePhaseNorm ?? selectedPhase

  const { toast } = useToast()

  const blueprintOk = canAccessForgottenForgeEnchantmentFlow(
    altarUnlockedByForgottenForgeQuest
  )
  useAltarConstructionTick(activePhaseNorm != null)

  if (!altarUnlockedByForgottenForgeQuest) {
    return (
      <div className="w-full space-y-6 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-amber-200">
            <Sparkles className="size-6 text-amber-500" />
            Зачарования
          </h2>
          <p className="mt-1 text-sm text-stone-500">Алтарь ещё не разблокирован</p>
        </div>
        <Card className="card-medieval max-w-2xl border-amber-900/40 bg-stone-900/50">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3 text-amber-200/90">
              <Lock className="size-10 shrink-0" />
              <div>
                <p className="font-medium">Завершите особое задание «Эхо забытой кузни»</p>
                <p className="mt-1 text-sm text-stone-400">
                  Откройте гильдию → вкладка экспедиций → «Особые задания», следуйте указаниям
                  архивариуса.
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

  if (!altarBuiltInForge && blueprintOk) {
    return (
      <div className="w-full space-y-6 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-amber-200">
            <Sparkles className="size-6 text-amber-500" />
            Зачарования
          </h2>
        </div>

        <AltarQuestGoal quest={forgottenForgeQuest} />

        <AltarRoadmap
          quest={forgottenForgeQuest}
          completedPhases={altarConstruction.completedPhases}
          activePhase={activePhaseNorm}
          selectedPhase={detailPhase}
          onSelectPhase={setSelectedPhase}
          onLockedClick={() => {
            toast({
              title: 'Фаза ещё не открыта',
              description: 'Продвиньте особое задание архивариуса, чтобы разблокировать эту фазу.',
            })
          }}
        />

        <AltarPhaseDetailsPanel
          phase={detailPhase}
          quest={forgottenForgeQuest}
          altarConstruction={altarConstruction}
          materialStash={materialStash}
          unlockedCraftTechniqueIds={unlockedCraftTechniqueIds}
          unlockedMaterialProcessingTechniqueIds={unlockedMaterialProcessingTechniqueIds}
          startPhase={startPhase}
          cancelPhase={cancelPhase}
          devSkipToNextConstructionStage={devSkipToNextConstructionStage}
          devCompleteConstructionPhase={devCompleteConstructionPhase}
        />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 p-6 md:max-w-3xl">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-amber-200">
          <Sparkles className="size-6 text-amber-500" />
          Зачарования
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Алтарь готов. Модуль зачарований — в разработке.
        </p>
      </div>

      <Tabs value={enchantTab} onValueChange={(v) => setEnchantTab(v as 'enchant' | 'upgrade')}>
        <TabsList className="border border-stone-800 bg-stone-900/80">
          <TabsTrigger value="enchant">Зачарование</TabsTrigger>
          <TabsTrigger value="upgrade">Улучшение алтаря</TabsTrigger>
        </TabsList>
        <TabsContent value="enchant" className="mt-4">
          <Card className="card-medieval border-amber-900/30 bg-stone-900/50">
            <CardContent className="space-y-2 p-5 text-sm text-stone-400">
              <p>Древо перков и эссенция — в следующих итерациях.</p>
              <p className="text-xs text-stone-500">
                Канон: docs/systems/ENCHANTMENT_MODULE_PHASE1.md
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upgrade" className="mt-4">
          <Card className="card-medieval border-stone-800 bg-stone-900/50">
            <CardContent className="p-5 text-sm text-stone-400">
              Улучшения алтаря по чертежам архива — заглушка. Скоро.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button
        type="button"
        variant="secondary"
        className="gap-2"
        onClick={() => navigateToForgeTab('reforge')}
      >
        <Hammer className="size-4" />
        В кузницу — перековка
      </Button>
    </div>
  )
}
