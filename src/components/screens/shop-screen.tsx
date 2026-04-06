'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Coins, 
  Package, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  useGameStore, 
  useFormattedResources,
  type Resources
} from '@/store'
import { getAvailableAmountForResourceKey, getGrantTargetMaterialId } from '@/lib/craft/inventory-check'
import { useProductionRates } from '@/hooks/use-game-loop'
import { 
  TooltipProvider,
  InfoTooltip 
} from '@/components/ui/game-tooltip'
import { cn } from '@/lib/utils'
import { rarityColors, getResourceIconInfo } from '@/components/ui/resource-icon'
import { MaterialDisplayIcon } from '@/components/ui/material-display-icon'
import { getMaterialShopInfo } from '@/data/material-shop'
import { materialById } from '@/data/materials/library'
import type { ResourceKey } from '@/store/slices/resources-slice'

/** Имя витрины: приоритет `MaterialNode` по `getGrantTargetMaterialId`, иначе витрина `material-shop`. */
function displayNameForShopResource(key: ResourceKey, fallback: string): string {
  const mid = getGrantTargetMaterialId(key)
  if (mid && materialById[mid]?.identity.name) return materialById[mid].identity.name
  return getMaterialShopInfo(key)?.name ?? fallback
}

/** Продажа: имена согласованы с каталогом там, где есть grant-target id. */
const sellableResourcesConfig: { id: ResourceKey; rarity: keyof typeof rarityColors }[] = [
  { id: 'wood', rarity: 'common' },
  { id: 'stone', rarity: 'common' },
  { id: 'iron', rarity: 'uncommon' },
  { id: 'coal', rarity: 'common' },
  { id: 'ironIngot', rarity: 'rare' },
  { id: 'copperIngot', rarity: 'rare' },
  { id: 'tinIngot', rarity: 'rare' },
  { id: 'bronzeIngot', rarity: 'rare' },
  { id: 'planks', rarity: 'uncommon' },
  { id: 'stoneBlocks', rarity: 'uncommon' },
]

const sellableResources = sellableResourcesConfig.map(({ id, rarity }) => ({
  id,
  name: displayNameForShopResource(id, id),
  rarity,
}))

// Пакеты для покупки
const buyPackages = [
  { id: 'wood_small', name: 'Мешок дерева', resource: 'wood' as const, amount: 50, cost: 30 },
  { id: 'wood_large', name: 'Телега дерева', resource: 'wood' as const, amount: 200, cost: 100 },
  { id: 'stone_small', name: 'Мешок камня', resource: 'stone' as const, amount: 40, cost: 40 },
  { id: 'stone_large', name: 'Телега камня', resource: 'stone' as const, amount: 160, cost: 120 },
  { id: 'iron_small', name: 'Небольшой слиток', resource: 'iron' as const, amount: 25, cost: 80 },
  { id: 'iron_large', name: 'Ящик руды', resource: 'iron' as const, amount: 100, cost: 280 },
  { id: 'coal_small', name: 'Мешок угля', resource: 'coal' as const, amount: 30, cost: 60 },
  { id: 'coal_large', name: 'Большой мешок', resource: 'coal' as const, amount: 120, cost: 200 },
]

// Форматирование больших чисел
function formatAmount(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return Math.floor(num).toString()
}

// Компонент строки продажи ресурса
function SellRow({ resourceId, name, rarity }: { resourceId: keyof Resources; name: string; rarity: keyof typeof rarityColors }) {
  const resources = useGameStore((state) => state.resources)
  const materialStash = useGameStore((state) => state.materialStash)
  const sellResource = useGameStore((state) => state.sellResource)
  const getResourceSellPrice = useGameStore((state) => state.getResourceSellPrice)
  const [amount, setAmount] = useState(0)
  
  const available = Math.floor(
    resourceId === 'gold' || resourceId === 'soulEssence'
      ? resources[resourceId] || 0
      : getAvailableAmountForResourceKey(resources, materialStash, resourceId)
  )
  const price = Math.floor(getResourceSellPrice(resourceId))
  const totalGold = price * amount
  const canSell = amount > 0 && amount <= available
  const colors = rarityColors[rarity]
  
  const handleSell = () => {
    if (canSell) {
      sellResource(resourceId, amount)
      setAmount(0)
    }
  }
  
  const quickAmounts = [10, 50, 100]
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
        colors.bg,
        colors.border,
        available > 0 ? 'shadow-lg' : 'opacity-50'
      )}
    >
      {/* Иконка и название */}
      <div className="flex items-center gap-3 min-w-[180px]">
        <MaterialDisplayIcon
          catalogMaterialId={getGrantTargetMaterialId(resourceId)}
          resourceKeyFallback={resourceId}
          size="lg"
          title={name}
        />
        <div>
          <p className="font-bold text-stone-100 text-lg">{name}</p>
          <p className="text-sm text-stone-400">
            <span className={cn(available > 0 ? colors.text : 'text-stone-500')}>
              {formatAmount(available)}
            </span>
            <span className="mx-1">•</span>
            <span className="text-amber-400 font-medium">{price} 💰/шт</span>
          </p>
        </div>
      </div>
      
      {/* Быстрые кнопки */}
      <div className="flex gap-1">
        {quickAmounts.map(qa => (
          <Button
            key={qa}
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-sm font-bold text-stone-300 hover:text-white hover:bg-stone-700/50"
            disabled={available < qa}
            onClick={() => setAmount(Math.min(available, qa))}
          >
            {qa}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-3 text-sm font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
          disabled={available === 0}
          onClick={() => setAmount(available)}
        >
          Все
        </Button>
      </div>
      
      {/* Ввод количества */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={available}
          value={amount}
          onChange={(e) => setAmount(Math.min(available, Math.max(0, parseInt(e.target.value) || 0)))}
          className="w-20 px-3 py-1.5 text-lg font-bold text-center bg-stone-900 border-2 border-stone-600 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
          placeholder="0"
        />
        <span className="text-sm font-bold text-amber-400 w-20">
          {canSell && `= ${totalGold} 💰`}
        </span>
      </div>
      
      {/* Кнопка продажи */}
      <Button
        className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-bold px-6"
        disabled={!canSell}
        onClick={handleSell}
      >
        <TrendingDown className="w-4 h-4 mr-2" />
        Продать
      </Button>
    </motion.div>
  )
}

// Компонент карточки покупки
function BuyCard({ pkg }: { pkg: typeof buyPackages[0] }) {
  const resources = useGameStore((state) => state.resources)
  const spendResource = useGameStore((state) => state.spendResource)
  const grantResourceKeyFromWorld = useGameStore((state) => state.grantResourceKeyFromWorld)
  
  const canAfford = resources.gold >= pkg.cost
  const resInfo = getResourceIconInfo(pkg.resource)
  const colors = resInfo ? rarityColors[resInfo.rarity] : rarityColors.common
  const resourceLabel = displayNameForShopResource(pkg.resource, resInfo?.name ?? pkg.resource)
  
  const handleBuy = () => {
    if (spendResource('gold', pkg.cost)) {
      grantResourceKeyFromWorld(pkg.resource, pkg.amount)
    }
  }
  
  return (
    <motion.div
      whileHover={{ scale: canAfford ? 1.03 : 1 }}
      whileTap={{ scale: canAfford ? 0.97 : 1 }}
    >
      <Card 
        className={cn(
          'cursor-pointer border-2 transition-all overflow-hidden',
          colors.bg,
          colors.border,
          canAfford && 'hover:border-amber-500/60',
          !canAfford && 'opacity-50'
        )}
        onClick={handleBuy}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <MaterialDisplayIcon
              catalogMaterialId={getGrantTargetMaterialId(pkg.resource)}
              resourceKeyFallback={pkg.resource}
              size="xl"
              title={pkg.name}
            />
            <div className="flex-1">
              <p className="font-bold text-stone-100 text-lg">{pkg.name}</p>
              <p className="text-lg font-bold text-green-400">+{pkg.amount} {resourceLabel}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Coins className="w-5 h-5" />
                <span className="font-bold text-lg">{pkg.cost}</span>
              </div>
              <p className="text-xs text-stone-500">
                {(pkg.cost / pkg.amount).toFixed(1)} 💰/шт
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Компонент компактного инвентаря
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
  
  const totalProduction = Object.values(productionRates).reduce((sum, rate) => sum + rate, 0)
  
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-amber-500" />
              Торговая лавка
            </h2>
            <InfoTooltip
              title="Магазин"
              content="Покупайте ресурсы за золото или продавайте излишки. Цены продажи ниже рыночных."
              icon="help"
            />
          </div>
          <Badge className="bg-gradient-to-r from-amber-900 to-amber-800 border-amber-600 text-amber-100 px-4 py-2 text-lg font-bold">
            <Coins className="w-5 h-5 mr-2" />
            {formattedResources.formatted.gold} 💰
          </Badge>
        </div>
        
        {/* Компактный инвентарь */}
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
        
        {/* Основной контент с табами */}
        <Tabs defaultValue="sell" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-stone-800/50 h-12">
            <TabsTrigger value="sell" className="data-[state=active]:bg-green-900/50 data-[state=active]:text-green-200 text-base font-bold">
              <TrendingDown className="w-5 h-5 mr-2" />
              Продажа
            </TabsTrigger>
            <TabsTrigger value="buy" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-200 text-base font-bold">
              <TrendingUp className="w-5 h-5 mr-2" />
              Покупка
            </TabsTrigger>
          </TabsList>
          
          {/* Вкладка продажи */}
          <TabsContent value="sell" className="mt-4">
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2 text-base font-bold">
                  <TrendingDown className="w-4 h-4" />
                  Продажа ресурсов
                </CardTitle>
                <CardDescription>
                  Продавайте излишки за золото • Цена продажи ~70% от покупной
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sellableResources.map((res) => (
                    <SellRow
                      key={res.id}
                      resourceId={res.id}
                      name={res.name}
                      rarity={res.rarity}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Вкладка покупки */}
          <TabsContent value="buy" className="mt-4">
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2 text-base font-bold">
                  <TrendingUp className="w-4 h-4" />
                  Покупка ресурсов
                </CardTitle>
                <CardDescription>
                  Мгновенная покупка ресурсов за золото
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {buyPackages.map((pkg) => (
                    <BuyCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Подсказка */}
        <div className="text-center text-sm text-stone-400 p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
          Совет: Добывайте ресурсы через рабочих — это выгоднее покупки
        </div>
      </div>
    </TooltipProvider>
  )
}
