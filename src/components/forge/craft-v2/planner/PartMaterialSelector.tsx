/**
 * Part Material Selector Component
 * Селектор материала для части оружия
 * Обновлён: умная сортировка, инвентарь, цены, тултип с дельтой
 */

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Coins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { allMaterials } from '@/data/materials'
import { getMaterialsForPart } from '@/data/materials'
import type { MaterialNode } from '@/types/materials'
import type { WeaponRecipe } from '@/types/craft-v2'
import type { Resources } from '@/store/slices/resources-slice'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import { 
  filterDiscoveredMaterials, 
  smartSortMaterials,
  isMaterialAvailable,
  getMaterialQuantity,
} from '@/lib/craft/material-sorting'
import { 
  calculateMaterialComparison, 
  type MaterialComparison 
} from '@/lib/craft/material-preview'
import { MaterialPreviewTooltip } from './MaterialPreviewTooltip'
import { 
  getMaterialRarity, 
  RARITY_COLORS,
  RARITY_LABELS,
} from '@/types/materials/material-core'
import { 
  getResourceKeyForMaterial, 
} from '@/lib/craft/inventory-check'
import { getMaterialPrice } from '@/data/material-shop'
import type { ResourceKey } from '@/store/slices/resources-slice'

// ================================
// TIPES
// ================================

interface PartMaterialSelectorProps {
  partId: string
  partName: string
  allowedCategories: string[]
  selectedMaterial: string | null
  onSelect: (materialId: string) => void
  
  // Новые props:
  inventory: Resources
  playerLevel: number
  recipe: WeaponRecipe
  knowledge: Record<string, MaterialKnowledge>
  materialPrices?: Record<string, number>  // цены покупки
  currentMaterials?: Record<string, string>  // выбранные материалы для других частей
}

const categoryIcons: Record<string, string> = {
  metal: '⚒️',
  mineral: '🪨',
  wood: '🪵',
  leather: '🟤',
}

// Получить название свойства по ключу
const getPropertyLabel = (prop: string | undefined): string => {
  if (!prop) return 'Твёрдость'
  const labels: Record<string, string> = {
    hardness: 'Твёрдость',
    elasticity: 'Гибкость',
    toughness: 'Прочность',
    weight: 'Вес',
    conductivity: 'Магия'
  }
  return labels[prop] || prop
}

// Получить значение свойства материала
const getPropertyValue = (material: MaterialNode, prop: string | undefined): number => {
  if (!prop) return material.physical.hardness
  const paths: Record<string, number> = {
    hardness: material.physical.hardness,
    elasticity: material.physical.elasticity,
    toughness: material.physical.toughness,
    weight: material.physical.density,  // Используем density вместо weight
    conductivity: material.arcane.conductivity
  }
  return paths[prop] ?? 0
}

// ================================
// MAIN COMPONENT
// ================================

export function PartMaterialSelector({
  partId,
  partName,
  allowedCategories,
  selectedMaterial,
  onSelect,
  inventory,
  playerLevel,
  recipe,
  knowledge,
  materialPrices,
  currentMaterials = {},
}: PartMaterialSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  
  // Получаем свойства для этой части из рецепта
  const recipePart = recipe.parts.find(p => p.id === partId)
  const dominantProperty = recipePart?.dominantProperty
  const secondaryProperty = recipePart?.secondaryProperty
  
  // Фильтруем и сортируем материалы (без useMemo — корректнее для React Compiler при мутабельном recipe)
  const allFiltered = getMaterialsForPart(partId, allowedCategories)
  const discovered = filterDiscoveredMaterials(allFiltered, knowledge)
  const materials = smartSortMaterials(discovered, {
    inventory,
    knowledge,
    recipe,
    partId,
    blacksmithLevel: playerLevel,
    dominantProperty,
  })
  
  // Текущий выбранный материал
  const selected = useMemo(() => {
    return selectedMaterial 
      ? allMaterials.find((m: MaterialNode) => m.identity.id === selectedMaterial) 
      : null
  }, [selectedMaterial])
  
  return (
    <div className="border border-stone-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between bg-stone-800/50 hover:bg-stone-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">
            {selected ? categoryIcons[selected.identity.class] : '❓'}
          </span>
          <div className="text-left">
            <p className="font-medium text-stone-200">{partName}</p>
            <p className="text-xs text-stone-500">
              {selected ? selected.identity.name : 'Выберите материал'}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 grid grid-cols-2 gap-2 bg-stone-900/50">
              {materials.map((material: MaterialNode) => {
                const isSelected = selectedMaterial === material.identity.id
                const isAvailable = isMaterialAvailable(material, inventory)
                const quantity = getMaterialQuantity(material, inventory)
                const resourceKey = getResourceKeyForMaterial(material.identity.id)
                // Используем переданные цены или вычисляем
                const price = materialPrices?.[material.identity.id] || 
                  (resourceKey ? getMaterialPrice(resourceKey, 1, 1.1) : 0)
                
                const rarity = getMaterialRarity(material.economy)
                
                // Получаем количество материала по рецепту для этой части
                const recipePart = recipe.parts.find(p => p.id === partId)
                const requiredQuantity = recipePart?.minQuantity || 1
                
                // Рассчитываем превью для тултипа
                const comparison = calculateMaterialComparison(
                  material,
                  selectedMaterial,
                  recipe,
                  partId,
                  playerLevel,
                  knowledge[material.identity.id]?.expertise || 0,
                  selectedMaterial != null ? knowledge[selectedMaterial]?.expertise : undefined
                )
                
                // Получаем экспертизу и знания для материала
                const materialExpertise = knowledge[material.identity.id]?.expertise || 0
                const materialKnowledge = knowledge[material.identity.id]
                
                return (
                  <MaterialPreviewTooltip
                    key={material.identity.id}
                    material={material}
                    comparison={comparison}
                    requiredQuantity={requiredQuantity}
                    inventoryQuantity={isAvailable ? quantity : undefined}
                    price={!isAvailable && price > 0 ? price : undefined}
                    expertise={materialExpertise}
                    knowledge={materialKnowledge}
                  >
                    <button
                      onClick={() => {
                        onSelect(material.identity.id)
                        // НЕ закрываем шторку - пусть пользователь сам закроет
                      }}
                      className={cn(
                        "p-2 rounded text-left transition-colors relative",
                        isSelected
                          ? "bg-amber-600/30 border border-amber-500"
                          : isAvailable
                            ? "bg-stone-800 border border-stone-700 hover:border-stone-600"
                            : "bg-stone-900/30 border border-stone-800 opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span>{categoryIcons[material.identity.class]}</span>
                          <div className="min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              isSelected ? "text-amber-200" : isAvailable ? "text-stone-200" : "text-stone-400"
                            )}>
                              {material.identity.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs px-1 py-0 h-auto",
                                  RARITY_COLORS[rarity]
                                )}
                              >
                                {RARITY_LABELS[rarity]}
                              </Badge>
                              {/* Первая характеристика */}
                              <p className="text-xs text-stone-500">
                                {getPropertyLabel(dominantProperty)}: {getPropertyValue(material, dominantProperty)}
                              </p>
                              {/* Вторая характеристика (если есть) */}
                              {secondaryProperty && (
                                <p className="text-xs text-stone-500">
                                  {getPropertyLabel(secondaryProperty)}: {getPropertyValue(material, secondaryProperty)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Badge количества для крафта */}
                        <div className="shrink-0">
                          <Badge variant="outline" className="bg-amber-900/20 border-amber-700 text-amber-400 text-xs px-1.5 py-0.5 cursor-help">
                            {requiredQuantity}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  </MaterialPreviewTooltip>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PartMaterialSelector
