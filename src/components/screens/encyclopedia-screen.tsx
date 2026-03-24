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
  
  // Get knowledge from store
  const materialKnowledge = useGameStore(state => state.materialKnowledge)
  const setMaterialExpertise = useGameStore(state => state.setMaterialExpertise)

  // Test: set iron expertise to 100%
  const testMaxIronExpertise = () => {
    setMaterialExpertise('iron', 100)
  }
  
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Encyclopedia Materials
          </h2>
          <p className="text-stone-500 text-sm">Learn material properties</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testMaxIronExpertise}
            className="flex items-center gap-2 px-3 py-1 text-xs bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700 text-purple-300 rounded"
            title="Test: Set iron expertise to 100%"
          >
            <TestTube className="w-4 h-4" />
            <span>Test: Iron 100%</span>
          </button>
          <div className="text-stone-400 text-sm">
            {filteredMaterials.length} / {allMaterials.length} materials
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
            <p className="text-stone-500">No materials found</p>
            <p className="text-stone-600 text-sm">
              {searchQuery
                ? 'Try different search query'
                : 'Discover new materials in the forge'}
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
            About Encyclopedia
          </h4>
          <ul className="text-xs text-stone-500 space-y-1">
            <li>
              <strong className="text-amber-400">Expertise</strong> —
              Gained by using materials in crafting
            </li>
            <li>
              <strong className="text-green-400">Discovered materials</strong> —
              Give bonuses to speed, quality, and prediction accuracy
            </li>
            <li>
              <strong className="text-purple-400">New properties</strong> —
              Unlock as expertise accumulates
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default EncyclopediaScreen
