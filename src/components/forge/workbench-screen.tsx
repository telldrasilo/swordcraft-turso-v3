'use client'

import { useCallback, useMemo, useState } from 'react'
import { Hammer, Wrench, Package } from 'lucide-react'
import { useGameStore } from '@/store'
import { RepairSection } from '@/components/forge/repair-section'
import { ReforgeSection } from '@/components/forge/reforge-section'
import { WorkbenchShell } from '@/components/forge/workbench-shell'
import { WorkbenchQueuePanel } from '@/components/forge/workbench-queue-panel'
import { WorkbenchWeaponList } from '@/components/forge/workbench-weapon-list'
import { WorkbenchCompactWeaponRail } from '@/components/forge/workbench-compact-weapon-rail'
import { useWorkbenchQueueRuntime } from '@/hooks/use-workbench-queue-runtime'
import { useIsMobile } from '@/hooks/use-mobile'
import { useInventoryFilter } from '@/hooks/use-inventory-filter'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import {
  WorkbenchTaskEditor,
  type WorkbenchTaskEditorTaskKind,
} from '@/components/forge/workbench-task-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WeaponInventoryCard } from '@/components/forge/weapon-inventory-card'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Экран верстака: компактный список | карточка | вкладки ремонт/перековка; очередь снизу.
 */
type TaskEditorState = {
  mode: 'create' | 'edit'
  taskKind: WorkbenchTaskEditorTaskKind
  weaponId: string
  existingQueueItem: WorkbenchQueueItem | null
}

function CompactListEmpty() {
  return (
    <div className="rounded border border-stone-800/80 bg-stone-950/20 px-2 py-3 text-center text-[10px] text-stone-500">
      Нет клинков в выборке. Смените фильтр или создайте оружие во вкладке «Крафт».
    </div>
  )
}

export function WorkbenchScreen() {
  const benchSubTab = useGameStore((state) => state.forgeBenchSubTab)
  const setForgeMainTab = useGameStore((state) => state.setForgeMainTab)
  const setWorkbenchSelectedWeaponId = useGameStore((state) => state.setWorkbenchSelectedWeaponId)
  const workbenchSelectedWeaponId = useGameStore((state) => state.workbenchSelectedWeaponId)

  const isMobile = useIsMobile()
  const [taskEditor, setTaskEditor] = useState<TaskEditorState | null>(null)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const { apply } = useInventoryFilter()
  const filteredWeapons = useMemo(
    () => apply(weaponInventory.weapons),
    [apply, weaponInventory.weapons]
  )

  const weaponById = useMemo(
    () => Object.fromEntries(weaponInventory.weapons.map((w) => [w.id, w])),
    [weaponInventory.weapons]
  )

  const taskEditorWeapon = useMemo(() => {
    if (!taskEditor) return null
    return weaponInventory.weapons.find((w) => w.id === taskEditor.weaponId) ?? null
  }, [taskEditor, weaponInventory.weapons])

  const selectedWeapon = useMemo(() => {
    if (!workbenchSelectedWeaponId) return null
    return weaponInventory.weapons.find((w) => w.id === workbenchSelectedWeaponId) ?? null
  }, [weaponInventory.weapons, workbenchSelectedWeaponId])

  const openEditPlannedWorkbenchItem = useCallback(
    (item: WorkbenchQueueItem) => {
      const taskKind: WorkbenchTaskEditorTaskKind = item.kind === 'repair' ? 'repair' : item.kind
      setWorkbenchSelectedWeaponId(item.weaponId)
      setTaskEditor({
        mode: 'edit',
        taskKind,
        weaponId: item.weaponId,
        existingQueueItem: item,
      })
    },
    [setWorkbenchSelectedWeaponId]
  )

  const q = useWorkbenchQueueRuntime()

  const queuePanel = (
    <WorkbenchQueuePanel
      workbenchQueue={q.workbenchQueue}
      queueRunReport={q.queueRunReport}
      showQueueStagePanel={q.showQueueStagePanel}
      displayPlan={q.displayPlan}
      progressView={q.progressView}
      canClickStartQueue={q.canClickStartQueue}
      startRepairQueue={q.startRepairQueue}
      instantRepairDev={q.instantRepairDev}
      repairInstantDevEnabled={q.repairInstantDevEnabled}
      cancelRunningWorkbenchStage={q.cancelRunningWorkbenchStage}
      requestWorkbenchQueueStop={q.requestWorkbenchQueueStop}
      onEditPlannedWorkbenchItem={openEditPlannedWorkbenchItem}
    />
  )

  const workbenchMiddle = (
    <>
      {!selectedWeapon ? (
        <Card className="card-medieval">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-500 mb-1">Клинок не выбран</p>
            <p className="text-stone-600 text-sm">
              Выберите клинок в списке слева{isMobile ? ' (карусель выше)' : ''}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <WeaponInventoryCard
          weapon={selectedWeapon}
          context="workbench"
          workbenchMode={benchSubTab}
        />
      )}
    </>
  )

  const workbenchTabs = (
    <Tabs
      value={benchSubTab}
      onValueChange={(v) => setForgeMainTab(v as 'repair' | 'reforge')}
      className="min-w-0 w-full"
    >
      <TabsList className="bg-stone-900/60 border border-stone-700 h-auto p-1 w-full max-w-full flex flex-wrap justify-start gap-0.5">
        <TabsTrigger
          value="repair"
          data-tutorial="workbench-repair-subtab"
          className="gap-1.5 data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-200"
        >
          <Wrench className="w-4 h-4" />
          Ремонт
        </TabsTrigger>
        <TabsTrigger
          value="reforge"
          data-tutorial="reforge-tab"
          className="gap-1.5 data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-200"
        >
          <Hammer className="w-4 h-4" />
          Перековка
        </TabsTrigger>
      </TabsList>
      <TabsContent value="repair" className="mt-3 min-w-0 focus-visible:outline-none">
        <RepairSection lastRepair={q.lastRepair} />
      </TabsContent>
      <TabsContent value="reforge" className="mt-3 min-w-0 focus-visible:outline-none">
        <ReforgeSection />
      </TabsContent>
    </Tabs>
  )

  const compactColumn = (
    <>
      {filteredWeapons.length === 0 ? (
        <CompactListEmpty />
      ) : (
        <WorkbenchCompactWeaponRail
          weapons={filteredWeapons}
          selectedId={workbenchSelectedWeaponId}
          onSelect={(id) => setWorkbenchSelectedWeaponId(id)}
          layout="vertical"
          workbenchQueue={q.workbenchQueue}
        />
      )}
    </>
  )

  const mainGridDesktop = (
    <div className="hidden lg:grid lg:grid-cols-[minmax(9rem,1fr)_minmax(17.5rem,4fr)_minmax(0,8fr)] lg:gap-4 lg:items-start lg:min-w-0">
      <div className="min-w-[9rem] w-full max-w-[10rem] shrink-0">{compactColumn}</div>
      <div className="min-w-0">{workbenchMiddle}</div>
      <div className="min-w-0">{workbenchTabs}</div>
    </div>
  )

  const mainStackMobile = (
    <div className="lg:hidden space-y-3 min-w-0">
      {filteredWeapons.length === 0 ? (
        <CompactListEmpty />
      ) : (
        <WorkbenchCompactWeaponRail
          weapons={filteredWeapons}
          selectedId={workbenchSelectedWeaponId}
          onSelect={(id) => setWorkbenchSelectedWeaponId(id)}
          layout="carousel"
          workbenchQueue={q.workbenchQueue}
        />
      )}
      {workbenchMiddle}
      {workbenchTabs}
    </div>
  )

  return (
    <div className="space-y-4" data-tutorial="workbench-group">
      <WorkbenchTaskEditor
        open={Boolean(taskEditor && taskEditorWeapon)}
        onOpenChange={(open) => {
          if (!open) setTaskEditor(null)
        }}
        mode={taskEditor?.mode ?? 'create'}
        taskKind={taskEditor?.taskKind ?? 'repair'}
        weapon={taskEditorWeapon}
        existingQueueItem={taskEditor?.existingQueueItem ?? null}
      />

      <WorkbenchShell
        queue={q.workbenchQueue}
        workbenchBarBaseline={q.workbenchBarBaseline}
        weaponNameById={q.weaponNameById}
        weaponById={weaponById}
        activeQueueItemId={q.activeQueueItemId}
        showBar={q.showWorkbenchBar}
        queuePanel={queuePanel}
      >
        <div className="space-y-3 min-w-0">
          <WorkbenchWeaponList />
          {mainGridDesktop}
          {mainStackMobile}
        </div>
      </WorkbenchShell>
    </div>
  )
}
