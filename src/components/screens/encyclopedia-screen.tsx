/**
 * Экран энциклопедии материалов
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import { BookOpen, Search, Info, TestTube, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  MaterialCard,
  SearchBar,
  CategoryTabs,
} from '@/components/encyclopedia'
import { allMaterials, materialById } from '@/data/materials'
import { getMaterialStudyTechniqueById } from '@/data/material-study-techniques'
import { getDisplayCategory } from '@/types/materials'
import type { MaterialDisplayCategory, MaterialNode } from '@/types/materials'
import type { MaterialStudySession } from '@/types/material-study'
import { useGameStore } from '@/store/game-store-composed'

function formatStudyRemain(totalSec: number): string {
  const sec = Math.max(0, totalSec)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h} ч ${m} мин`
  if (m > 0) return `${m} мин ${s} с`
  return `${s} с`
}

function MaterialStudyProgress({ session }: { session: MaterialStudySession }) {
  const [nowMs, setNowMs] = useState<number | null>(null)
  useEffect(() => {
    const tick = (): void => {
      setNowMs(Date.now())
    }
    tick()
    const id = window.setInterval(tick, 500)
    return () => window.clearInterval(id)
  }, [session.id, session.endTime])

  const clock = nowMs ?? session.startTime
  const total = Math.max(1, session.endTime - session.startTime)
  const elapsed = clock - session.startTime
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100))
  const remainSec = Math.max(0, Math.ceil((session.endTime - clock) / 1000))

  const matNode = materialById[session.materialId]
  const materialName = matNode?.identity.name ?? session.materialId
  const tech = getMaterialStudyTechniqueById(session.techniqueId)
  const techName = tech?.name ?? session.techniqueId

  return (
    <Card className="bg-stone-900/70 border-amber-800/40">
      <CardContent className="p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-amber-200/95 font-medium min-w-0">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">Изучение: {materialName}</span>
          </span>
          <span className="text-stone-400 text-xs shrink-0 tabular-nums">
            осталось ~{formatStudyRemain(remainSec)}
          </span>
        </div>
        <p className="text-xs text-stone-500">{techName}</p>
        <Progress value={pct} className="h-2 bg-stone-800" />
      </CardContent>
    </Card>
  )
}

const IS_DEV = process.env.NODE_ENV === 'development'

export function EncyclopediaScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<MaterialDisplayCategory>('all')
  const [testMode, setTestMode] = useState<'normal' | 'max' | 'min'>('normal')

  // Get knowledge from store
  const materialKnowledge = useGameStore(state => state.materialKnowledge)
  const setMaterialExpertise = useGameStore(state => state.setMaterialExpertise)
  const showOnlyDiscovered = useGameStore(state => state.showOnlyDiscovered)
  const toggleShowOnlyDiscovered = useGameStore(state => state.toggleShowOnlyDiscovered)
  const materialStudySessions = useGameStore(s => s.materialStudySessions)
  const encyclopediaFocusMaterialId = useGameStore(s => s.encyclopediaFocusMaterialId)
  const setEncyclopediaFocusMaterialId = useGameStore(s => s.setEncyclopediaFocusMaterialId)

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return allMaterials
      .filter((material: MaterialNode) => {
        if (!showOnlyDiscovered) return true
        const knowledge = materialKnowledge[material.identity.id]
        return knowledge !== undefined && knowledge.expertise > 0
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
  }, [selectedCategory, searchQuery, materialKnowledge, showOnlyDiscovered])

  useEffect(() => {
    if (!encyclopediaFocusMaterialId) return
    const id = encyclopediaFocusMaterialId
    const t = window.setTimeout(() => {
      const el = document.querySelector(`[data-encyclopedia-material="${CSS.escape(id)}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setEncyclopediaFocusMaterialId(null)
    }, 120)
    return () => window.clearTimeout(t)
  }, [encyclopediaFocusMaterialId, setEncyclopediaFocusMaterialId])

  /**
   * Только dev: массово меняет экспертизу и пишет в persist — в production давало «у всех 10%».
   * По роадмапу §6.1 10% только у стартового набора (см. CRAFT_STARTER_KNOWLEDGE_MATERIAL_IDS).
   */
  const testToggleExpertise = () => {
    if (!IS_DEV) return
    const targetExpertise = testMode === 'normal' ? 100 : (testMode === 'max' ? 10 : null)

    if (targetExpertise === null) {
      // Reset to normal mode
      setTestMode('normal')
      return
    }

    allMaterials.forEach((material: MaterialNode) => {
      setMaterialExpertise(material.identity.id, targetExpertise)
    })

    setTestMode(targetExpertise === 100 ? 'max' : 'min')
  }

  const getTestButtonText = () => {
    if (testMode === 'normal') return 'Test: All 100%'
    if (testMode === 'max') return 'Test: All 10%'
    return 'Test: Reset'
  }

  const runningStudySessions = materialStudySessions.filter(s => s.status === 'running')

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
          {IS_DEV ? (
            <button
              type="button"
              onClick={testToggleExpertise}
              className="flex items-center gap-2 px-3 py-1 text-xs bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700 text-purple-300 rounded"
              title={`[dev] Тест persist: все материалы 100% → 10% → сброс режима (значения в store не откатываются автоматически)`}
            >
              <TestTube className="w-4 h-4" />
              <span>{getTestButtonText()}</span>
            </button>
          ) : null}
          <div className="text-stone-400 text-sm">
            {filteredMaterials.length} / {allMaterials.length}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CategoryTabs 
            activeCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
          <label className="flex items-center gap-2 text-sm text-stone-400 cursor-pointer shrink-0">
            <Switch
              checked={showOnlyDiscovered}
              onCheckedChange={() => toggleShowOnlyDiscovered()}
              aria-label="Только открытые материалы"
            />
            <span>Только открытые</span>
          </label>
        </div>
      </div>

      {runningStudySessions.length > 0 && (
        <div className="space-y-3">
          {runningStudySessions.map(s => (
            <MaterialStudyProgress key={s.id} session={s} />
          ))}
        </div>
      )}

      {/* Material grid */}
      {filteredMaterials.length === 0 ? (
        <Card className="bg-stone-900/50 border-stone-700">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-500">Материалы не найдены</p>
            <p className="text-stone-600 text-sm">
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : showOnlyDiscovered
                  ? 'Снимите фильтр «Только открытые», чтобы видеть весь каталог, или накапливайте экспертизу'
                  : 'Ничего не подошло под категорию или поиск'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material: MaterialNode) => (
            <div
              key={material.identity.id}
              data-encyclopedia-material={material.identity.id}
              className="min-w-0"
            >
              <MaterialCard
                material={material}
                knowledge={materialKnowledge[material.identity.id]}
              />
            </div>
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
            <li>
              <strong className="text-amber-400">Изучение в энциклопедии</strong> —
              прогресс и активная сессия сохраняются в сохранении игры (в том числе после обновления
              страницы и при переходе на другие вкладки)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default EncyclopediaScreen
