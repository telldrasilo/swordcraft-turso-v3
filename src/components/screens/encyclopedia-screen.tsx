/**
 * Экран энциклопедии материалов
 */

'use client'

import { useState, useMemo } from 'react'
import { BookOpen, Search, Info, TestTube } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  MaterialCard,
  SearchBar,
  CategoryTabs,
} from '@/components/encyclopedia'
import { allMaterials } from '@/data/materials'
import { getDisplayCategory } from '@/types/materials'
import type { MaterialDisplayCategory, MaterialNode } from '@/types/materials'
import { useGameStore } from '@/store/game-store-composed'

export function EncyclopediaScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<MaterialDisplayCategory>('all')
  const [testMode, setTestMode] = useState<'normal' | 'max' | 'min'>('normal')

  // Get knowledge from store
  const materialKnowledge = useGameStore(state => state.materialKnowledge)
  const setMaterialExpertise = useGameStore(state => state.setMaterialExpertise)

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return allMaterials
      .filter((material: MaterialNode) => {
        // Only show discovered materials
        const knowledge = materialKnowledge[material.identity.id]
        return knowledge && knowledge.expertise > 0
      })
      .filter((material: MaterialNode) => {
        // Filter by category
        if (selectedCategory === 'all') return true
        return getDisplayCategory(material) === selectedCategory
      })
      .filter((material: MaterialNode) => {
        // Search
        if (!searchQuery.trim()) return true
        
        const normalizedQuery = searchQuery.toLowerCase()
        const name = material.identity.name.toLowerCase()
        const tags = material.identity.tags.join(' ').toLowerCase()
        const basic = material.summary.basic.toLowerCase()
        
        return (
          name.includes(normalizedQuery) ||
          tags.includes(normalizedQuery) ||
          basic.includes(normalizedQuery)
        )
      })
      // Sort by rarity and name
      .sort((a, b) => {
        const rarityDiff = a.economy.rarity - b.economy.rarity
        if (rarityDiff !== 0) return rarityDiff
        return a.identity.name.localeCompare(b.identity.name, 'ru')
      })
  }, [selectedCategory, searchQuery, materialKnowledge])

  // Test: toggle expertise between 100%, 10% and original values
  const testToggleExpertise = () => {
    const targetExpertise = testMode === 'normal' ? 100 : (testMode === 'max' ? 10 : null)

    if (targetExpertise === null) {
      // Reset to normal mode
      setTestMode('normal')
      return
    }

    // Set expertise for all displayed materials
    filteredMaterials.forEach((material: MaterialNode) => {
      const currentExpertise = materialKnowledge[material.identity.id]?.expertise || 0
      if (currentExpertise > 0) {
        setMaterialExpertise(material.identity.id, targetExpertise)
      }
    })

    setTestMode(targetExpertise === 100 ? 'max' : 'min')
  }

  const getTestButtonText = () => {
    if (testMode === 'normal') return 'Test: All 100%'
    if (testMode === 'max') return 'Test: All 10%'
    return 'Test: Reset'
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Энциклопедия материалов
          </h2>
          <p className="text-stone-500 text-sm">Изучайте свойства материалов</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testToggleExpertise}
            className="flex items-center gap-2 px-3 py-1 text-xs bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700 text-purple-300 rounded"
            title={`Тест: переключить экспертизу всех материалов (${testMode})`}
          >
            <TestTube className="w-4 h-4" />
            <span>{getTestButtonText()}</span>
          </button>
          <div className="text-stone-400 text-sm">
            {filteredMaterials.length} / {allMaterials.length}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryTabs 
          activeCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />
      </div>

      {/* Material grid */}
      {filteredMaterials.length === 0 ? (
        <Card className="bg-stone-900/50 border-stone-700">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-500">Материалы не найдены</p>
            <p className="text-stone-600 text-sm">
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : 'Откройте новые материалы в кузнице'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material: MaterialNode) => (
            <MaterialCard
              key={material.identity.id}
              material={material}
              knowledge={materialKnowledge[material.identity.id]}
            />
          ))}
        </div>
      )}

      {/* Help */}
      <Card className="bg-stone-800/30 border-stone-700">
        <CardContent className="p-4">
          <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            Об энциклопедии
          </h4>
          <ul className="text-xs text-stone-500 space-y-1">
            <li>
              <strong className="text-amber-400">Экспертиза</strong> —
              накапливается при использовании материалов в крафте
            </li>
            <li>
              <strong className="text-green-400">Изученные материалы</strong> —
              дают бонусы к скорости, качеству и точности прогноза
            </li>
            <li>
              <strong className="text-purple-400">Новые свойства</strong> —
              открываются по мере накопления экспертизы
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default EncyclopediaScreen
