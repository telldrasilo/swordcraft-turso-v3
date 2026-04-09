/**
 * Интендант гильдии — покупка чертежей за репутацию текущего ранга.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Hammer, Lock, Package, Scroll, ShoppingBag, Sparkles, Wrench } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  INTENDANT_OFFERS,
  getIntendantRepairTechniqueOffer,
  getIntendantReforgeTechniqueOffer,
  type IntendantOfferKind,
} from '@/data/guild/intendant-catalog'
import { getReforgeTechniqueById } from '@/data/reforge/reforge-techniques-registry'
import { isReforgeTechniqueUnlocked } from '@/lib/reforge'
import {
  intendantRarityBgColors,
  intendantRarityBorderColors,
  intendantRarityColors,
} from '@/data/guild/intendant-pricing'

type FilterTab = 'all' | IntendantOfferKind

export function IntendantSection() {
  const guild = useGameStore((state) => state.guild)
  const player = useGameStore((state) => state.player)
  const unlockedRecipes = useGameStore((state) => state.unlockedRecipes)
  const unlockedRepairTechniqueIds = useGameStore((state) => state.unlockedRepairTechniqueIds)
  const unlockedMaterialProcessingTechniqueIds = useGameStore(
    (state) => state.unlockedMaterialProcessingTechniqueIds
  )
  const unlockedCraftTechniqueIds = useGameStore((state) => state.unlockedCraftTechniqueIds)
  const unlockedReforgeTechniqueIds = useGameStore((state) => state.unlockedReforgeTechniqueIds)
  const purchaseIntendantOffer = useGameStore((state) => state.purchaseIntendantOffer)
  const intendantRepairTechniqueFocusId = useGameStore(
    (state) => state.intendantRepairTechniqueFocusId
  )
  const clearIntendantRepairTechniqueFocus = useGameStore(
    (state) => state.clearIntendantRepairTechniqueFocus
  )
  const intendantReforgeTechniqueFocusId = useGameStore(
    (state) => state.intendantReforgeTechniqueFocusId
  )
  const clearIntendantReforgeTechniqueFocus = useGameStore(
    (state) => state.clearIntendantReforgeTechniqueFocus
  )
  const [filter, setFilter] = useState<FilterTab>('all')

  useEffect(() => {
    const techId = intendantRepairTechniqueFocusId
    if (!techId) return
    const offer = getIntendantRepairTechniqueOffer(techId)
    if (!offer) {
      clearIntendantRepairTechniqueFocus()
      return
    }
    queueMicrotask(() => setFilter('repair_technique'))
    const id = window.setTimeout(() => {
      document.getElementById(`intendant-offer-${offer.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      clearIntendantRepairTechniqueFocus()
    }, 160)
    return () => window.clearTimeout(id)
  }, [intendantRepairTechniqueFocusId, clearIntendantRepairTechniqueFocus])

  useEffect(() => {
    const techId = intendantReforgeTechniqueFocusId
    if (!techId) return
    const offer = getIntendantReforgeTechniqueOffer(techId)
    if (!offer) {
      clearIntendantReforgeTechniqueFocus()
      return
    }
    queueMicrotask(() => setFilter('reforge_technique'))
    const id = window.setTimeout(() => {
      document.getElementById(`intendant-offer-${offer.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      clearIntendantReforgeTechniqueFocus()
    }, 160)
    return () => window.clearTimeout(id)
  }, [intendantReforgeTechniqueFocusId, clearIntendantReforgeTechniqueFocus])

  const reforgeCtx = useMemo(
    () => ({
      guildLevel: guild.level,
      playerLevel: player.level,
      unlockedMaterialProcessingTechniqueIds,
      unlockedReforgeTechniqueIds,
    }),
    [guild.level, player.level, unlockedMaterialProcessingTechniqueIds, unlockedReforgeTechniqueIds]
  )

  const offers = useMemo(() => {
    if (filter === 'all') return INTENDANT_OFFERS
    return INTENDANT_OFFERS.filter((o) => o.kind === filter)
  }, [filter])

  const isUnlocked = (o: (typeof INTENDANT_OFFERS)[0]) => {
    if (o.kind === 'repair_technique') {
      return unlockedRepairTechniqueIds.includes(o.targetId)
    }
    if (o.kind === 'craft_technique') {
      return unlockedCraftTechniqueIds.includes(o.targetId)
    }
    if (o.kind === 'reforge_technique') {
      const t = getReforgeTechniqueById(o.targetId)
      if (!t) return false
      return isReforgeTechniqueUnlocked(t, reforgeCtx)
    }
    return o.kind === 'weapon_recipe'
      ? unlockedRecipes.weaponRecipes.includes(o.targetId)
      : unlockedRecipes.refiningRecipes.includes(o.targetId)
  }

  const canBuy = (o: (typeof INTENDANT_OFFERS)[0]) => {
    if (isUnlocked(o)) return false
    if (guild.level < o.minGuildLevel) return false
    if (guild.reputation < o.costReputation) return false
    return true
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setFilter('all')}
        >
          <ShoppingBag className="w-4 h-4" />
          Все
        </Button>
        <Button
          type="button"
          variant={filter === 'weapon_recipe' ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setFilter('weapon_recipe')}
        >
          <Scroll className="w-4 h-4" />
          Рецепты оружия
        </Button>
        <Button
          type="button"
          variant={filter === 'refining_recipe' ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setFilter('refining_recipe')}
        >
          <Package className="w-4 h-4" />
          Переработка
        </Button>
        <Button
          type="button"
          variant={filter === 'repair_technique' ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setFilter('repair_technique')}
        >
          <Wrench className="w-4 h-4" />
          Техники ремонта
        </Button>
        <Button
          type="button"
          variant={filter === 'craft_technique' ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setFilter('craft_technique')}
        >
          <Hammer className="w-4 h-4" />
          Техники крафта
        </Button>
        <Button
          type="button"
          variant={filter === 'reforge_technique' ? 'default' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={() => setFilter('reforge_technique')}
        >
          <Sparkles className="w-4 h-4" />
          Перековка
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => {
          const unlocked = isUnlocked(offer)
          const lockedByRank = guild.level < offer.minGuildLevel
          const purchasable = canBuy(offer)

          return (
            <motion.div
              key={offer.id}
              id={`intendant-offer-${offer.id}`}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={cn(
                  'border transition-all h-full',
                  intendantRarityBorderColors[offer.rarity],
                  unlocked ? 'opacity-90' : ''
                )}
              >
                <CardContent className="p-4 flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-stone-100 leading-tight">{offer.name}</h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-3">{offer.description}</p>
                    </div>
                    <Badge
                      className={cn(
                        'shrink-0',
                        intendantRarityBgColors[offer.rarity],
                        intendantRarityColors[offer.rarity]
                      )}
                    >
                      {offer.rarity}
                    </Badge>
                  </div>
                  <div className="text-xs text-stone-500 flex flex-wrap gap-x-3 gap-y-1">
                    <span>
                      Ранг гильдии: <span className="text-amber-200/90">{offer.minGuildLevel}+</span>
                    </span>
                    <span>
                      Цена:{' '}
                      <span className="text-amber-300 font-medium">{offer.costReputation}</span> реп.
                    </span>
                  </div>
                  <div className="mt-auto pt-1">
                    {unlocked ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Уже в архиве
                      </div>
                    ) : lockedByRank ? (
                      <div className="flex items-center gap-2 text-amber-600/90 text-sm">
                        <Lock className="w-4 h-4" />
                        Нужен ранг гильдии {offer.minGuildLevel}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        disabled={!purchasable}
                        onClick={() => purchaseIntendantOffer(offer.id)}
                      >
                        Купить за {offer.costReputation} реп.
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
