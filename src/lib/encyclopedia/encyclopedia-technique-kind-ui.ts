/**
 * Единый маппинг Lucide по семейству техники (ENC roadmap P2c).
 */

import type { ComponentType } from 'react'
import { BookOpen, Flame, Hammer, Sparkles, Wrench } from 'lucide-react'
import type { EncyclopediaTechniqueKind } from '@/types/encyclopedia-techniques'

/** Таблица компонентов иконок (модульный уровень — не вызывать фабрики в рендере). */
export const ENCYCLOPEDIA_TECHNIQUE_KIND_ICONS: Record<
  EncyclopediaTechniqueKind,
  ComponentType<{ className?: string }>
> = {
  craft: Hammer,
  material_processing: Flame,
  material_study: BookOpen,
  reforge: Sparkles,
  repair: Wrench,
}

const KIND_SHORT_LABEL: Record<EncyclopediaTechniqueKind, string> = {
  craft: 'Приём ковки',
  material_processing: 'Обработка материала',
  material_study: 'Изучение',
  reforge: 'Перековка',
  repair: 'Ремонт',
}

export function getEncyclopediaTechniqueKindIcon(
  kind: EncyclopediaTechniqueKind
): ComponentType<{ className?: string }> {
  return ENCYCLOPEDIA_TECHNIQUE_KIND_ICONS[kind]
}

/** Короткая подпись для aria-label / тултипов. */
export function getEncyclopediaTechniqueKindShortLabel(kind: EncyclopediaTechniqueKind): string {
  return KIND_SHORT_LABEL[kind]
}
