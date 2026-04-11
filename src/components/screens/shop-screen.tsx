'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Package, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameStore, useFormattedResources, type Resources } from '@/store'
import { getAvailableAmountForResourceKey, getGrantTargetMaterialId } from '@/lib/craft/inventory-check'
import { useProductionRates } from '@/hooks/use-game-loop'
import { TooltipProvider, InfoTooltip } from '@/components/ui/game-tooltip'
import { cn } from '@/lib/utils'
import { rarityColors, getResourceIconInfo } from '@/components/ui/resource-icon'
import { MaterialDisplayIcon } from '@/components/ui/material-display-icon'
import {
  getAvailableShopMaterials,
  getMaterialShopInfo,
  getShopCatalogMaterialId,
  type MaterialShopItem,
} from '@/data/material-shop'
import { materialById } from '@/data/materials/library'
import type { ResourceKey } from '@/store/slices/resources-slice'

function displayNameForShopResource(key: ResourceKey, fallback: string): string {
  const mid = getGrantTargetMaterialId(key)
  if (mid && materialById[mid]?.identity.name) return materialById[mid].identity.name
  return getMaterialShopInfo(key)?.name ?? fallback
}

function formatAmount(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return Math.floor(num).toString()
}

function catalogIdForShopItem(item: MaterialShopItem): string | null {
  return getShopCatalogMaterialId(item)
}

function ShopBuyCard({ item }: { item: MaterialShopItem }) {
  const resources = useGameStore((state) => state.resources)
  const spendResource = useGameStore((state) => state.spendResource)
  const grantResourceKeyFromWorld = useGameStore((state) => state.grantResourceKeyFromWorld)
  const addMaterialToStash = useGameStore((state) => state.addMaterialToStash)
  const [qty, setQty] = useState(1)

  const unitPrice = Math.ceil(item.basePrice * 1)
  const totalCost = unitPrice * qty
  const canAfford = resources.gold >= totalCost
  const resInfo = getResourceIconInfo(item.resourceKey)
  const colors = resInfo ? rarityColors[resInfo.rarity] : rarityColors.common
  const catalogId = catalogIdForShopItem(item)

  const handleBuy = () => {
    if (!canAfford || qty < 1) return
    if (!spendResource('gold', totalCost)) return
    const catalogId = getShopCatalogMaterialId(item)
    if (catalogId) {
      addMaterialToStash(catalogId, qty)
    } else {
      grantResourceKeyFromWorld(item.resourceKey, qty)
    }
  }

  return (
    <motion.div whileHover={{ scale: canAfford ? 1.02 : 1 }} whileTap={{ scale: canAfford ? 0.98 : 1 }}>
      <Card
        className={cn(
          'border-2 transition-all overflow-hidden h-full',
          colors.bg,
          colors.border,
          canAfford && 'hover:border-amber-500/50'
        )}
      >
        <CardContent className="p-4 flex flex-col gap-3 h-full">
          <div className="flex items-center gap-3">
            <MaterialDisplayIcon
              catalogMaterialId={catalogId}
              resourceKeyFallback={item.resourceKey}
              size="xl"
              title={item.name}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-stone-100 text-lg leading-tight">{item.name}</p>
              <p className="text-sm text-stone-400 mt-1 line-clamp-2">{item.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Кол-во</span>
            <input
              type="number"
              min={1}
              max={999}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(999, parseInt(e.target.value, 10) || 1)))}
              className="w-16 px-2 py-1 text-center bg-stone-900 border border-stone-600 rounded text-stone-200 text-sm"
            />
            <span className="text-xs text-stone-500">
              × {unitPrice} 💰 = <span className="text-amber-400 font-bold">{totalCost}</span>
            </span>
          </div>
          <Button
            className="w-full mt-auto bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800"
            disabled={!canAfford}
            onClick={handleBuy}
          >
            <Coins className="w-4 h-4 mr-2" />
            Купить
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CompactInventory() {
  const rawResources = useGameStore((s) => s.resources)
  const materialStash = useGameStore((s) => s.materialStash)
  const formattedResources = useFormattedResources()
  const productionRates = useProductionRates()

  const displayResources: { id: ResourceKey; fallbackName: string; rarity: keyof typeof rarityColors }[] = [
    { id: 'gold', fallbackName: 'Золото', rarity: 'uncommon' },
    { id: 'soulEssence', fallbackName: 'Эссенция', rarity: 'epic' },
    { id: 'wood', fallbackName: 'Дерево', rarity: 'common' },
    { id: 'stone', fallbackName: 'Камень', rarity: 'common' },
    { id: 'iron', fallbackName: 'Железо', rarity: 'uncommon' },
    { id: 'coal', fallbackName: 'Уголь', rarity: 'common' },
    { id: 'ironIngot', fallbackName: 'Слиток', rarity: 'rare' },
    { id: 'bronzeIngot', fallbackName: 'Бронза', rarity: 'rare' },
    { id: 'planks', fallbackName: 'Доски', rarity: 'uncommon' },
    { id: 'stoneBlocks', fallbackName: 'Блоки', rarity: 'uncommon' },
  ]

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {displayResources.map((res) => {
        const amount =
          res.id === 'gold' || res.id === 'soulEssence'
            ? rawResources[res.id as keyof Resources] ?? 0
            : getAvailableAmountForResourceKey(rawResources, materialStash, res.id as keyof Resources)
        const rate = productionRates[res.id as keyof typeof productionRates] || 0
        const colors = rarityColors[res.rarity]
        const formatted = formattedResources.formatted[res.id as keyof typeof formattedResources.formatted]
        const label = displayNameForShopResource(res.id, res.fallbackName)

        return (
          <motion.div
            key={res.id}
            title={`${label}: ${formatAmount(amount)}`}
            whileHover={{ scale: 1.05 }}
            className={cn(
              'p-2 rounded-lg border-2 text-center transition-all',
              colors.bg,
              colors.border,
              amount > 0 && 'shadow-md'
            )}
          >
            <div className="flex justify-center">
              <MaterialDisplayIcon
                catalogMaterialId={getGrantTargetMaterialId(res.id)}
                resourceKeyFallback={res.id}
                size="md"
                title={label}
              />
            </div>
            <p className={cn('font-bold text-sm mt-0.5', colors.text)}>
              {formatted || formatAmount(amount)}
            </p>
            {rate > 0 && (
              <p className="text-xs text-green-400 font-medium">+{rate.toFixed(1)}</p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export function ShopScreen() {
  const formattedResources = useFormattedResources()
  const productionRates = useProductionRates()
  const offers = getAvailableShopMaterials()
  const totalProduction = Object.values(productionRates).reduce((sum, rate) => sum + rate, 0)

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-amber-500" />
              Торговая лавка
            </h2>
            <InfoTooltip
              title="Магазин"
              content="Покупка базового сырья за золото. Полный каталог материалов — в энциклопедии и на складе по id."
              icon="help"
            />
          </div>
          <Badge className="bg-gradient-to-r from-amber-900 to-amber-800 border-amber-600 text-amber-100 px-4 py-2 text-lg font-bold">
            <Coins className="w-5 h-5 mr-2" />
            {formattedResources.formatted.gold} 💰
          </Badge>
        </div>

        <Card className="card-medieval">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-200 flex items-center gap-2 text-base font-bold">
              <Package className="w-4 h-4" />
              Ваш инвентарь
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>Обзор ресурсов</span>
              <span className="text-green-400 font-bold">+{totalProduction.toFixed(1)}/сек</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompactInventory />
          </CardContent>
        </Card>

        <Card className="card-medieval">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center gap-2 text-base font-bold">
              <ShoppingCart className="w-4 h-4" />
              Покупка
            </CardTitle>
            <CardDescription>Базовый ассортимент: железная руда, уголь, берёза</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {offers.map((item) => (
                <ShopBuyCard key={item.offerId} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-stone-400 p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
          Добыча на экспедициях и у рабочих обычно выгоднее закупок
        </div>
      </div>
    </TooltipProvider>
  )
}
