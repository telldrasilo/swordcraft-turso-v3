/**
 * Краткий текст для подсказок «где добыть» в UI фаз алтаря.
 * Локации — из реестра экспедиций; для квестовых артефактов и части слитков — шаблоны.
 */

import { FORGOTTEN_FORGE_ALTAR_QUEST_ARTIFACT_IDS } from '@/data/altar/quest-artifact-material-ids'
import { materialById } from '@/data/materials/library'
import { getMaterialById as getExpeditionMaterialById } from '@/modules/expeditions/data/materials'
import { getLocationById } from '@/modules/expeditions/data/locations'

function isQuestArtifactId(id: string): boolean {
  return (FORGOTTEN_FORGE_ALTAR_QUEST_ARTIFACT_IDS as readonly string[]).includes(id)
}

export function getAltarMaterialSourceTooltipText(materialId: string): string {
  if (isQuestArtifactId(materialId)) {
    return 'Выдаётся в особом задании «Эхо забытой кузни».'
  }

  const exp = getExpeditionMaterialById(materialId)
  const locIds = exp?.sourceLocations
  if (locIds?.length) {
    const names = locIds
      .map((id) => getLocationById(id)?.name)
      .filter((n): n is string => Boolean(n && n.length))
    if (names.length) {
      return `Добывается в: ${names.join(', ')}.`
    }
  }

  const node = materialById[materialId]
  const tags = node?.identity.tags ?? []
  if (node?.identity.class === 'metal' && tags.includes('ingot')) {
    return 'Слиток: плавка в кузнице или покупка в магазине гильдии; руду ищите в экспедициях.'
  }
  if (tags.includes('ore')) {
    return 'Руда: экспедиции (см. карту гильдии); дальше — переплавка в кузнице.'
  }
  if (node?.identity.class === 'wood') {
    return 'Древесина и переработанные заготовки: экспедиции и кузница.'
  }
  if (node?.identity.class === 'leather') {
    return 'Кожа: экспедиции и обработка в цепочках кузницы.'
  }
  if (node?.identity.class === 'mineral' && !tags.includes('ore')) {
    return 'Камень и блоки: экспедиции или распил в кузнице.'
  }

  return 'Ищите в экспедициях, магазине гильдии или получайте переработкой в кузнице.'
}
