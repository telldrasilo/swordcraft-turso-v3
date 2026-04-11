'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { EncyclopediaTechniqueCard } from '@/components/encyclopedia/encyclopedia-technique-card'
import {
  buildEncyclopediaTechniqueSections,
  DEFAULT_TECHNIQUE_KIND_TAB,
  ENCYCLOPEDIA_TECHNIQUE_KIND_TAB_ORDER,
  ENCYCLOPEDIA_TECHNIQUE_SECTION_META,
} from '@/lib/encyclopedia/encyclopedia-technique-sections'
import { filterSectionItemsByQuery } from '@/lib/encyclopedia/filter-encyclopedia-technique-section'
import { useGameStore } from '@/store/game-store-composed'
import type {
  EncyclopediaTechniqueKind,
  EncyclopediaTechniqueSectionModel,
} from '@/types/encyclopedia-techniques'

/**
 * Пять семейств §3 ENC: обработка, приёмы ковки, изучение, перековка, ремонт (под-вкладки P2d).
 */
export function TechniquesSection() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchAllFamilies, setSearchAllFamilies] = useState(false)
  const activeKind = useGameStore(s => s.lastEncyclopediaTechniqueKindTab)
  const setActiveKind = useGameStore(s => s.setLastEncyclopediaTechniqueKindTab)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(searchInput.trim()), 260)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const allSections = useMemo(() => buildEncyclopediaTechniqueSections(), [])
  const sectionByKind = useMemo(() => {
    const m = new Map<EncyclopediaTechniqueKind, (typeof allSections)[number]>()
    for (const s of allSections) {
      m.set(s.sectionId, s)
    }
    return m
  }, [allSections])

  const activeSection = useMemo(() => {
    const fromStore = sectionByKind.get(activeKind)
    if (fromStore) return fromStore
    const def = sectionByKind.get(DEFAULT_TECHNIQUE_KIND_TAB)
    if (def) return def
    return allSections[0]
  }, [sectionByKind, activeKind, allSections])

  const filteredSection = useMemo(() => {
    if (!activeSection) return null
    return filterSectionItemsByQuery(activeSection, debouncedQuery)
  }, [activeSection, debouncedQuery])

  const multiFilteredSections = useMemo((): EncyclopediaTechniqueSectionModel[] => {
    if (!debouncedQuery) return []
    const out: EncyclopediaTechniqueSectionModel[] = []
    for (const kind of ENCYCLOPEDIA_TECHNIQUE_KIND_TAB_ORDER) {
      const sec = sectionByKind.get(kind)
      if (!sec) continue
      const f = filterSectionItemsByQuery(sec, debouncedQuery)
      if (f.items.length) out.push(f)
    }
    return out
  }, [sectionByKind, debouncedQuery])

  const useMultiFamilySearch = searchAllFamilies && debouncedQuery.length > 0

  if (!activeSection || !filteredSection) {
    return null
  }

  const totalVisible = useMultiFamilySearch
    ? multiFilteredSections.reduce((n, s) => n + s.items.length, 0)
    : filteredSection.items.length

  return (
    <div className="space-y-8">
      <p className="text-sm text-stone-500 max-w-3xl">
        <strong className="text-stone-400">Обработка материала</strong> (плавка, заготовки)
        отличается от <strong className="text-stone-400">приёмов ковки</strong> — модификаторов
        процесса сборки клинка. Обе могут входить в одну Крафтовую линию, но относятся к разным
        реестрам данных.
      </p>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Семейства техник в энциклопедии"
      >
        {ENCYCLOPEDIA_TECHNIQUE_KIND_TAB_ORDER.map(kind => {
          const label = ENCYCLOPEDIA_TECHNIQUE_SECTION_META[kind].title
          const selected = activeKind === kind
          return (
            <Button
              key={kind}
              type="button"
              role="tab"
              aria-selected={selected}
              variant={selected ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveKind(kind)}
            >
              {label}
            </Button>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 max-w-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden />
          <Input
            type="search"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Поиск по имени, id, описанию…"
            className="pl-9 bg-stone-950/50 border-stone-700 text-stone-200 placeholder:text-stone-600"
            aria-label={
              useMultiFamilySearch
                ? 'Поиск техник по всем семействам'
                : `Поиск техник: ${ENCYCLOPEDIA_TECHNIQUE_SECTION_META[activeSection.sectionId].title}`
            }
          />
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <Switch
            id="enc-techniques-search-all"
            checked={searchAllFamilies}
            onCheckedChange={setSearchAllFamilies}
            aria-label="Искать во всех семействах техник"
          />
          <Label htmlFor="enc-techniques-search-all" className="text-xs text-stone-400 cursor-pointer">
            Во всех разделах
          </Label>
        </div>
      </div>

      {debouncedQuery && totalVisible === 0 ? (
        <Card className="bg-stone-900/50 border-stone-700">
          <CardContent className="p-8 text-center text-sm text-stone-500">
            Ничего не найдено по запросу «{debouncedQuery}»
          </CardContent>
        </Card>
      ) : null}

      {useMultiFamilySearch ? (
        <div className="space-y-10" role="region" aria-label="Результаты поиска по всем семействам">
          {multiFilteredSections.map(sec => (
            <section key={sec.sectionId} className="space-y-4">
              <div>
                <h3
                  id={`enc-techniques-${sec.sectionId}`}
                  className="text-lg font-semibold text-amber-200/95"
                >
                  {sec.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-3xl">{sec.blurb}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sec.items.map(model => (
                  <EncyclopediaTechniqueCard key={`${model.ref.kind}:${model.ref.id}`} model={model} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section
          className="space-y-4"
          role="tabpanel"
          aria-labelledby={`enc-techniques-${filteredSection.sectionId}`}
        >
          <div>
            <h3
              id={`enc-techniques-${filteredSection.sectionId}`}
              className="text-lg font-semibold text-amber-200/95"
            >
              {filteredSection.title}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-3xl">{filteredSection.blurb}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSection.items.map(model => (
              <EncyclopediaTechniqueCard key={`${model.ref.kind}:${model.ref.id}`} model={model} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
