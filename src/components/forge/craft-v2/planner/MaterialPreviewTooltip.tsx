'use client'

import React, { useState } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, Package, Flame, Scale, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MaterialNode } from '@/types/materials/material-core'
import type { MaterialComparison } from '@/lib/craft/material-preview'
import { getMaterialRarity, RARITY_COLORS, RARITY_BG_COLORS, RARITY_LABELS } from '@/types/materials/material-core'
import { isDetailLevelAvailable, type MaterialKnowledge } from '@/types/materials/knowledge'

interface MaterialPreviewTooltipProps {
  material: MaterialNode
  comparison: MaterialComparison
  requiredQuantity?: number
  inventoryQuantity?: number
  price?: number
  expertise?: number
  knowledge?: MaterialKnowledge
  children: React.ReactNode
}

function useIsTouchDevice() {
  return useState(() =>
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  )[0]
}

export function MaterialPreviewTooltip({ material, comparison, requiredQuantity, inventoryQuantity, price, expertise = 0, knowledge, children }: MaterialPreviewTooltipProps) {
  const isTouch = useIsTouchDevice()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const rarity = getMaterialRarity(material.economy)
  const { preview, delta } = comparison
  
  // Проверка уровня детализации (как в энциклопедии)
  const showDetails = isDetailLevelAvailable(knowledge, 'experienced') // 50%+ экспертизы

  const content = (
    <>
      <div className={cn("p-3 border-b border-stone-700 rounded-t-lg", RARITY_BG_COLORS[rarity])}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={cn("text-base font-bold", RARITY_COLORS[rarity])}>{material.identity.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-stone-800/50">{RARITY_LABELS[rarity]}</Badge>
              <span className="text-xs text-stone-400">{material.identity.class}</span>
            </div>
          </div>
          <Flame className={cn("w-5 h-5", RARITY_COLORS[rarity])} />
        </div>
      </div>
      
      <div className="p-3 space-y-3">
        {/* Prediction Accuracy with tooltip */}
        <NestedTooltip content="Точность прогноза показывает, насколько достоверны указанные диапазоны. Зависит от экспертизы материала: чем выше экспертиза, тем уже диапазон и точнее прогноз.">
          <div className="space-y-1 cursor-help">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-stone-400">Точность прогноза</span>
                <Info className="w-3 h-3 text-stone-500" />
              </div>
              <span className={cn("font-mono", preview.predictionAccuracy >= 80 ? "text-green-400" : preview.predictionAccuracy >= 60 ? "text-yellow-400" : "text-red-400")}>
                {Math.round(preview.predictionAccuracy)}%
              </span>
            </div>
            <Progress value={preview.predictionAccuracy} className="h-1.5" />
          </div>
        </NestedTooltip>
        
        <div className="border-t border-stone-700 pt-3 space-y-2">
          {/* Attack with tooltip */}
          <NestedTooltip content={`Диапазон атаки (${preview.attack.min}-${preview.attack.max}) показывает возможные значения характеристики готового оружия. При низкой экспертизе разброс больше. Базовое значение: ${preview.attack.base}`}>
            <div className="cursor-help">
              <StatRange label="Атака" min={preview.attack.min} max={preview.attack.max} delta={delta.attack} icon={<Target className="w-3 h-3 text-red-400" />} />
            </div>
          </NestedTooltip>
          
          {/* Durability with tooltip */}
          <NestedTooltip content={`Диапазон прочности (${preview.durability.min}-${preview.durability.max}) показывает возможные значения характеристики готового оружия. Влияет на долговечность оружия. Базовое значение: ${preview.durability.base}`}>
            <div className="cursor-help">
              <StatRange label="Прочность" min={preview.durability.min} max={preview.durability.max} delta={delta.durability} icon={<Package className="w-3 h-3 text-blue-400" />} />
            </div>
          </NestedTooltip>
          
          {/* Weight */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2"><Scale className="w-3 h-3 text-purple-400" /><span className="text-stone-400">Вес</span></div>
            <span className="font-mono text-stone-300">{preview.weight}</span>
          </div>
          
          {/* Soul with tooltip */}
          <NestedTooltip content={`Вместимость Души Войны (${preview.soulCapacity.min}-${preview.soulCapacity.max}) определяет, сколько магической энергии может накопить оружие. Нужно для зачарований и особых способностей.`}>
            <div className="cursor-help">
              <StatRange label="Душа" min={preview.soulCapacity.min} max={preview.soulCapacity.max} delta={null} icon={<Flame className="w-3 h-3 text-amber-400" />} />
            </div>
          </NestedTooltip>
        </div>
        
        <div className="border-t border-stone-700 pt-2">
          {requiredQuantity !== undefined && requiredQuantity > 0 ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Для крафта</span>
              <TooltipWrapper content={`В инвентаре: ${inventoryQuantity || 0} ед.`}>
                <Badge variant="outline" className="bg-amber-900/20 border-amber-700 text-amber-400 cursor-help">{requiredQuantity}</Badge>
              </TooltipWrapper>
            </div>
          ) : price !== undefined ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Цена покупки</span>
              <span className="font-mono text-amber-400">{price} gold</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">В инвентаре</span>
              <Badge variant="outline" className="text-red-400 bg-red-900/20 border-red-700">Нет</Badge>
            </div>
          )}
        </div>
        
        {/* Детальные свойства - только при достаточной экспертизе */}
        {showDetails && (
          <details className="text-xs">
            <summary className="cursor-pointer text-stone-500 hover:text-stone-400">Детальные свойства</summary>
            <div className="mt-2 grid grid-cols-2 gap-2 text-stone-400">
              <div className="flex justify-between"><span>Твёрдость:</span><span className="text-stone-300">{material.physical.hardness}</span></div>
              <div className="flex justify-between"><span>Гибкость:</span><span className="text-stone-300">{material.physical.elasticity}</span></div>
              <div className="flex justify-between"><span>Магия:</span><span className="text-stone-300">{material.arcane.conductivity}</span></div>
              <div className="flex justify-between"><span>Обраб-ть:</span><span className="text-stone-300">{material.processing.workability}</span></div>
            </div>
          </details>
        )}
        
        {/* Подсказка о низкой экспертизе */}
        {!showDetails && expertise < 50 && (
          <div className="text-xs text-stone-500 italic border-t border-stone-700 pt-2">
            Изучите материал в Энциклопедии, чтобы увидеть детальные свойства
          </div>
        )}
      </div>
    </>
  )

  if (isTouch) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild><div>{children}</div></PopoverTrigger>
        <PopoverContent className="w-72 p-0 bg-stone-900 border-stone-700" side="top" align="center">{content}</PopoverContent>
      </Popover>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <TooltipPrimitive.Root 
        defaultOpen={false}
        delayDuration={300}
      >
        <TooltipTrigger asChild><div>{children}</div></TooltipTrigger>
        <TooltipContent className="w-72 p-0 bg-stone-900 border-stone-700 max-h-[80vh] overflow-y-auto" side="top" align="center" sideOffset={5}>{content}</TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  )
}

// Nested tooltip component for elements inside the main tooltip
interface NestedTooltipProps {
  content: string
  children: React.ReactNode
}

function NestedTooltip({ content, children }: NestedTooltipProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div 
          className="cursor-help"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] bg-stone-950 text-stone-200 border border-stone-600 rounded-lg px-3 py-2 text-xs max-w-[250px] shadow-xl w-auto"
        side="right"
        align="start"
        sideOffset={10}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}

// Simple tooltip wrapper for badge
interface TooltipWrapperProps {
  content: string
  children: React.ReactNode
}

function TooltipWrapper({ content, children }: TooltipWrapperProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div 
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] bg-stone-950 text-stone-200 border border-stone-600 rounded-lg px-3 py-2 text-xs max-w-[250px] shadow-xl w-auto"
        side="top"
        align="center"
        sideOffset={5}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}

interface StatRangeProps { label: string; min: number; max: number; delta: { min: number; max: number } | null; icon: React.ReactNode }

function StatRange({ label, min, max, delta, icon }: StatRangeProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">{icon}<span className="text-stone-400">{label}</span></div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-stone-300">{min}-{max}</span>
          {delta && <span className={cn("font-mono text-xs", delta.min >= 0 ? "text-green-400" : "text-red-400")}>({delta.min >= 0 ? '+' : ''}{delta.min}-{delta.max >= 0 ? '+' : ''}{delta.max})</span>}
        </div>
      </div>
      <div className="relative h-2 bg-stone-800 rounded overflow-hidden">
        <div className="absolute h-full bg-stone-600 opacity-50" style={{ left: '45%', width: '10%' }} />
        <div className="absolute h-full bg-blue-500/50" style={{ left: `${min}%`, width: `${max - min}%` }} />
      </div>
    </div>
  )
}

export default MaterialPreviewTooltip
