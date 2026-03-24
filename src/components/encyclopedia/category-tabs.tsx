/**
 * Компонент табов категорий материалов
 */

'use client'

import { MATERIAL_CATEGORIES, type MaterialDisplayCategory } from '@/types/materials'
import { Button } from '@/components/ui/button'

interface CategoryTabsProps {
  activeCategory: MaterialDisplayCategory
  onCategoryChange: (category: MaterialDisplayCategory) => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MATERIAL_CATEGORIES.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}
