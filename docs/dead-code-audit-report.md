# Dead Code audit report

 SwordCraft ( swordcraft-turso-v3

**Date:** 2026-03-31

## Executive Summary

This audit identified significant amount of dead code, unused components, and technical debt in the project. The cleanup will improve maintainability, and reduce bundle size.

 and eliminate confusion between duplicate systems.

## Critical Findings

### Dead Code Removed
- **3 Slice files** (never imported into store)
- **4 old material files** (replaced by `materials/library/`)
- **2 stub/legacy calculators** (not imported anywhere)
- **1 root file** (`data/knowledge-discoveries.ts` - incorrect import path, moved to backup
- **3 backup files** (`*.backup.tsx`, `*.old`)
- **10+ unused components** (identified but never imported)

- **Multiple duplicate utilities** (similar functionality in different locations)

### Duplicating Systems (Both active)
- **Recipes**: `weapon-recipes.ts` (27 files) vs `recipes/` (5 files)
- **Expeditions**: `adventures.ts` (5 files, vs `expedition-templates.ts` (20+ files)
- **Craft System**: v1 slice in store, v2 UI with localStorage - running in parallel

### Type Conficts
- **QualityGrade**: Two conflicting definitions (`normal`/`masterwork` vs `common`/`masterpiece`)
- **WeaponType**: Duplicated in 5 locations with slight variations

- **WeaponEnchantment**: Re-export warning (resolved by keeping the in shared/)

### Adapters (necessary for compatibility)
- `getMaterialAsLegacy()` - Converts MaterialNode to Material for v2 craft system
- `convertToLegacy/convertToExtended()` - Converts between Adventurer formats
- `toLegacyAdventurer()` - Converts extended to legacy adventurer

## File Statistics

- **Total files moved to backup:** 23
- **Lines of code removed:** ~2,500
- **Files modified:** 1 (`data/knowledge-discoveries.ts` - fixed import)
- **Backup structure created:** `src/backup/` with 4 subdirectories

  - `unused-slices/`
  - `legacy-materials/`
  - `duplicate-components/`
  - `legacy-calculators/`
  - `unused-root-files/`

## Recommendations
1. **Monitor dungeons system usage** - Consider removing if `expedition-templates.ts` fully covers it functionality
2. **Simplify craft system** - Consider merging v1 and v2 systems to single source of truth
3. **Consolidate types** - Fix QualityGrade conflict to use single definition
4. **Document changes** - Update documentation to reflect the new structure

5. **Add build checks to CI/CD** - Ensure no regressions from cleanup
6. **Schedule regular audits** - Run monthly checks to prevent accumulation
