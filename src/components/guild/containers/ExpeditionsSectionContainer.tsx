/**
 * Expeditions Section Container
 * Контейнер для секции экспедиций - подключает ExpeditionsSection к store
 */

'use client'

import { ExpeditionsSection } from '../expeditions-section'

export function ExpeditionsSectionContainer() {
  // ExpeditionsSection уже содержит логику подключения к store
  // Этот контейнер служит точкой интеграции для GuildScreen
  return <ExpeditionsSection />
}

export default ExpeditionsSectionContainer
