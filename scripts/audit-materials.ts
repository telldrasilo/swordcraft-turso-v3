/**
 * Локальная проверка каталога без полного Vitest (пакет 0.5).
 * Запуск: npm run audit:materials
 */
import {
  findDuplicateRegistryMaterialIds,
  runMaterialCatalogContractChecks,
} from '../src/lib/materials/material-catalog-contract'

const dups = findDuplicateRegistryMaterialIds()
const violations = runMaterialCatalogContractChecks()

let failed = false
if (dups.length > 0) {
  failed = true
  // eslint-disable-next-line no-console
  console.error('Duplicate registry material ids:', dups)
}
if (violations.length > 0) {
  failed = true
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(violations, null, 2))
}

if (failed) {
  process.exit(1)
}

// eslint-disable-next-line no-console
console.log('material-catalog-contract: OK (no duplicate ids, B ⊆ A)')
