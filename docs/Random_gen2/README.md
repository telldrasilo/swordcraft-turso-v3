# Документация модуля «Гильдия — Экспедиция» (снимок для автономной разработки)

Пакет **самодостаточен**: нормативные типы, формулы, перечни ресурсов и контракт стора перенесены в приложения. Внешняя документация репозитория для работы по этому набору **не требуется**.

## Порядок чтения

1. [01_SCOPE_AND_CONTRACTS.md](./01_SCOPE_AND_CONTRACTS.md) — границы модуля и контракт с хостом  
2. [02_STATE_AND_PERSISTENCE.md](./02_STATE_AND_PERSISTENCE.md) — состояние, сохранения, пример JSON  
3. [03_DATA_LAYER.md](./03_DATA_LAYER.md) — статические данные экспедиций и событий  
4. [04_LOGIC_LAYER.md](./04_LOGIC_LAYER.md) — потоки старт / события / завершение  
5. [05_EVENTS_REWARDS_AND_MATERIALS_SPEC.md](./05_EVENTS_REWARDS_AND_MATERIALS_SPEC.md) — целевая модель событий и наград (vNext)  
6. [06_UI_SURFACE.md](./06_UI_SURFACE.md) — компоненты UI, привязка к store  
7. [07_INTEGRATION_CHECKLIST.md](./07_INTEGRATION_CHECKLIST.md) — приёмка  

**Приложения**

- [APPENDIX_TYPES_AND_INTERFACES.md](./APPENDIX_TYPES_AND_INTERFACES.md)  
- [APPENDIX_RESOURCES_AND_HOST_ACTIONS.md](./APPENDIX_RESOURCES_AND_HOST_ACTIONS.md)  
- [APPENDIX_MATERIALS_AND_EXPERTISE.md](./APPENDIX_MATERIALS_AND_EXPERTISE.md)  
- [APPENDIX_FORMULAS_EXPEDITION.md](./APPENDIX_FORMULAS_EXPEDITION.md)  
- [APPENDIX_MODIFIER_INPUTS.md](./APPENDIX_MODIFIER_INPUTS.md)  
- [APPENDIX_REPO_MAP.md](./APPENDIX_REPO_MAP.md)  

## Scope (кратко)

- В зоне переписывания: шаблоны экспедиций, тексты и данные событий, выдача наград (в т.ч. ресурсы гильдии и материалы/экспертиза из событий), UI блока экспедиции, логика завершения и стык с калькулятором v2.  
- Вне зоны (контент и подбор не меняются): генерация и карточки искателей, контракты и поиск как продуктовые фичи — но **входные типы** искателя/оружия для калькулятора зафиксированы в приложениях.

**Расположение:** итоговый автономный пакет лежит в каталоге `docs/Random_gen2/` (per плану миграции).

Provenance (при составлении): репозиторий SwordCraft swordcraft-turso-v3, снимок логики по состоянию исходников на момент генерации документа.
