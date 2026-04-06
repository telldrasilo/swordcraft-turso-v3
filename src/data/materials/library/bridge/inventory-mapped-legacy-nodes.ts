/**
 * Узлы каталога для materialId из CORE_MATERIAL_TO_RESOURCE (inventory-check),
 * которые раньше существовали только как legacy-строки без library identity.
 * Нужны для согласованности списания/энциклопедии и теста catalog-sync (фаза A tail).
 */

import type { MaterialNode } from '@/types/materials/material-core'
import { iron } from '../metals/iron'
import { oak } from '../woods/oak'
import { granite } from '../stones/granite'
import { tannedLeather } from '../leathers/tanned_leather'

function pick<T extends MaterialNode>(
  base: T,
  patch: Pick<MaterialNode['identity'], 'id' | 'name' | 'tags'> & {
    description: string
    icon?: string
  }
): MaterialNode {
  const n = structuredClone(base) as MaterialNode
  n.identity = { ...n.identity, id: patch.id, name: patch.name, tags: patch.tags }
  n.description = patch.description
  if (patch.icon) n.icon = patch.icon
  return n
}

/** Добавляются в `allMaterials` / `materialById` из `library/index.ts`. */
export const inventoryMappedLegacyMaterialNodes: MaterialNode[] = [
  pick(iron, {
    id: 'copper',
    name: 'Медь',
    tags: ['natural', 'metal', 'copper-bearing', 'basic'],
    description:
      'Медь — мягкий ковкий металл, хороший проводник тепла; в каталоге нужен для согласованного маппинга склада и переработки.',
    icon: '/icons/resources/copper.png',
  }),
  pick(iron, {
    id: 'tin',
    name: 'Олово',
    tags: ['natural', 'metal', 'tin-bearing', 'basic'],
    description:
      'Олово — лёгкоплавкий металл, классический компонент бронзы; узел каталога связывает слитки и рецепты с ресурсным ключом кузницы.',
  }),
  pick(iron, {
    id: 'silver',
    name: 'Серебро',
    tags: ['natural', 'metal', 'silver-bearing', 'precious'],
    description:
      'Серебро — драгоценный металл для инкрустаций и сплавов; запись в библиотеке закрепляет id для расхода и отображения в кузне.',
  }),
  pick(iron, {
    id: 'gold',
    name: 'Золото',
    tags: ['natural', 'metal', 'gold-bearing', 'precious'],
    description:
      'Золото — ковкий драгоценный металл для украшений и дорогих деталей; канонический id синхронизирован с таблицей материалов крафта.',
  }),
  pick(oak, {
    id: 'maple',
    name: 'Клён',
    tags: ['natural', 'wood', 'light', 'versatile'],
    description:
      'Клён даёт относительно лёгкую и однородную древесину, удобную для рукоятей; материал включён в каталог для полного покрытия маппинга.',
  }),
  pick(oak, {
    id: 'walnut',
    name: 'Орех',
    tags: ['natural', 'wood', 'dense', 'premium'],
    description:
      'Орех — плотная древесина с характерным рисунком волокон; применяется там, где нужна стабильность формы и аккуратный внешний вид.',
  }),
  pick(oak, {
    id: 'mahogany',
    name: 'Красное дерево',
    tags: ['natural', 'wood', 'luxury', 'stable'],
    description:
      'Красное дерево ценится за прочность, устойчивость к деформации и эстетику; узел каталога обеспечивает складской ключ древесины.',
  }),
  pick(oak, {
    id: 'processed_wood',
    name: 'Обработанная древесина',
    tags: ['refined', 'wood', 'planks', 'construction'],
    description:
      'Обработанная древесина — доски и заготовки после пиления и сушки; соответствует ресурсу досок на складе и рецептам постройки.',
    icon: '/icons/resources/planks.png',
  }),
  pick(tannedLeather, {
    id: 'hardened_leather',
    name: 'Укреплённая кожа',
    tags: ['refined', 'leather', 'tough', 'armor'],
    description:
      'Укреплённая кожа прошла пропитку или прессование, становясь плотнее; id привязан к складскому пулу кожи для крафта и заказов.',
  }),
  pick(granite, {
    id: 'basic_stone',
    name: 'Базовый камень',
    tags: ['natural', 'stone', 'basic', 'rough'],
    description:
      'Базовый камень — необработанные куски породы для строительства и грубой обработки; канонический узел для ключа камня в кузне.',
  }),
  pick(granite, {
    id: 'marble',
    name: 'Мрамор',
    tags: ['natural', 'stone', 'polished', 'decorative'],
    description:
      'Мрамор — плотная известняковая порода с хорошей полируемостью; в каталоге поддерживает расход декоративных и массивных деталей.',
  }),
  pick(granite, {
    id: 'processed_stone',
    name: 'Обработанный камень',
    tags: ['refined', 'stone', 'blocks', 'construction'],
    description:
      'Обработанный камень — распиленные блоки стабильного размера; соответствует складскому ресурсу каменных блоков в игровой экономике.',
    icon: '/icons/resources/stone.png',
  }),
]
