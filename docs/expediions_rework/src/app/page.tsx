'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface Mission {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  rarity: string;
  description: string;
  objective: string;
  duration: { base: number };
  cost: { supplies: { base: number }; deposit: { base: number } };
  reward: {
    gold: { base: number };
    glory: { base: number };
    experience: { base: number };
    warSoul: { base: number };
  };
  client: { name: string; type: string };
  location: { id: string; name: string; tier: number; type: string } | null;
  enemies?: { types: string[]; count: { base: number } };
}

interface Weapon {
  id: string;
  name: string;
  type: string;
  attack: number;
  durability: number;
  maxDurability: number;
  quality: string;
  icon: string;
}

interface Adventurer {
  id: string;
  name: string;
  rarity: string;
  level: number;
  power: number;
  precision: number;
  endurance: number;
  luck: number;
  combatStyle: string;
  traits: string[];
  icon: string;
}

interface Event {
  id: string;
  name: string;
  type: 'positive' | 'negative' | 'neutral' | 'choice';
  category: string;
  title: string;
  description: string;
  icon: string;
  triggerTime: number;
  triggered: boolean;
  effects?: {
    resources?: { material: string; quantity: number }[];
    durabilityLoss?: number;
    warSoul?: number;
  };
}

interface ActiveMission {
  mission: {
    id: string;
    name: string;
    type: string;
    difficulty: string;
    duration: number;
    location: string;
  };
  weapon: Weapon;
  adventurer: Adventurer;
  rewardSplit: string;
  events: Event[];
  durabilityLoss: {
    base: number;
    fromEvents: number;
    total: number;
  };
  rewards: {
    base: { gold: number; glory: number; experience: number; warSoul: number };
    guildShare: { gold: number; glory: number };
    adventurerShare: { gold: number; glory: number };
    totalWarSoul: number;
  };
  startTime: number;
}

// ============================================================================
// Constants
// ============================================================================

const REPAIR_THRESHOLD = 20;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-300 border-green-500/50',
  normal: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  hard: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  extreme: 'bg-red-500/20 text-red-300 border-red-500/50',
};

const rarityColors: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  uncommon: 'bg-green-500/20 text-green-300 border-green-500/50',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  legendary: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
};

const tierColors: Record<number, string> = {
  1: 'bg-green-500/20 text-green-300 border-green-500/50',
  2: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  3: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  4: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
};

const eventTypeColors: Record<string, string> = {
  positive: 'border-green-500/50 bg-green-500/10',
  negative: 'border-red-500/50 bg-red-500/10',
  neutral: 'border-gray-500/50 bg-gray-500/10',
  choice: 'border-yellow-500/50 bg-yellow-500/10',
};

const eventTypeTextColors: Record<string, string> = {
  positive: 'text-green-300',
  negative: 'text-red-300',
  neutral: 'text-gray-300',
  choice: 'text-yellow-300',
};

const missionTypeIcons: Record<string, string> = {
  hunt: '⚔️',
  scout: '👁️',
  gather: '💎',
  clear: '🛡️',
  rescue: '🆘',
  escort: '🚶',
  investigate: '🔍',
};

// ============================================================================
// Helper Functions
// ============================================================================

function getWeaponStatus(durability: number, maxDurability: number): {
  status: 'ok' | 'needs_repair' | 'critical';
  color: string;
  text: string;
} {
  const percent = (durability / maxDurability) * 100;
  
  if (durability <= REPAIR_THRESHOLD) {
    return { status: 'critical', color: 'text-red-400', text: 'Требует ремонта!' };
  } else if (percent <= 30) {
    return { status: 'needs_repair', color: 'text-orange-400', text: 'Скоро ремонт' };
  }
  return { status: 'ok', color: 'text-green-400', text: 'Исправно' };
}

// ============================================================================
// Main Component
// ============================================================================

export default function ExpeditionTestPage() {
  // State - Mission Selection
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loadingMissions, setLoadingMissions] = useState(true);

  // State - Weapon & Adventurer
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [adventurer, setAdventurer] = useState<Adventurer | null>(null);
  const [rewardSplit, setRewardSplit] = useState<'30/70' | '50/50'>('30/70');

  // State - Active Mission
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // State - Balance Multipliers
  const [balanceConfig, setBalanceConfig] = useState({
    quantityMultiplier: 1,
    qualityShift: 0,
    durationMultiplier: 1,
  });
  const [showBalancePanel, setShowBalancePanel] = useState(false);

  // State - Final Report
  const [finalReport, setFinalReport] = useState<{
    totalResources: Record<string, number>;
    totalDurabilityLoss: number;
    totalWarSoul: number;
    positiveEvents: number;
    negativeEvents: number;
    choiceEvents: number;
  } | null>(null);

  // Refs
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Load missions on mount
  useEffect(() => {
    loadMissions();
  }, []);

  // Progress simulation
  useEffect(() => {
    if (activeMission && !completed) {
      progressInterval.current = setInterval(() => {
        const elapsed = (Date.now() - activeMission.startTime) / 1000;
        const duration = activeMission.mission.duration;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        
        setElapsedTime(elapsed);
        setProgress(newProgress);

        // Trigger events
        const updatedEvents = activeMission.events.map(e => {
          if (!e.triggered && elapsed >= e.triggerTime) {
            return { ...e, triggered: true };
          }
          return e;
        });

        if (JSON.stringify(updatedEvents) !== JSON.stringify(activeMission.events)) {
          setActiveMission(prev => prev ? { ...prev, events: updatedEvents } : null);
        }

        // Auto-complete
        if (newProgress >= 100) {
          completeMission(updatedEvents);
        }
      }, 100);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [activeMission, completed]);

  // Load available missions
  const loadMissions = async () => {
    setLoadingMissions(true);
    try {
      const res = await fetch('/api/expeditions?action=available-missions');
      const data = await res.json();
      setMissions(data.missions);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoadingMissions(false);
    }
  };

  // Generate weapon
  const generateWeapon = async () => {
    const res = await fetch('/api/expeditions?action=generate-weapon');
    const data = await res.json();
    setWeapon(data.weapon);
  };

  // Generate adventurer
  const generateAdventurer = async () => {
    const res = await fetch('/api/expeditions?action=generate-adventurer');
    const data = await res.json();
    setAdventurer(data.adventurer);
  };

  // Select mission and generate weapon/adventurer
  const selectMission = async (mission: Mission) => {
    setSelectedMission(mission);
    try {
      await Promise.all([generateWeapon(), generateAdventurer()]);
    } catch (error) {
      console.error('Failed to generate:', error);
    }
  };

  // Start mission
  const startMission = async () => {
    if (!selectedMission || !weapon || !adventurer) return;

    try {
      const res = await fetch('/api/expeditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-mission',
          missionId: selectedMission.id,
          weapon,
          adventurer,
          rewardSplit,
          balanceMultipliers: balanceConfig,
        }),
      });
      const data = await res.json();
      
      setActiveMission(data);
      setProgress(0);
      setElapsedTime(0);
      setCompleted(false);
      setShowReport(false);
      setFinalReport(null);
    } catch (error) {
      console.error('Failed to start mission:', error);
    }
  };

  // Complete mission
  const completeMission = useCallback((events?: Event[]) => {
    if (!activeMission) return;

    const finalEvents = events || activeMission.events;
    
    // Calculate totals
    const totalResources: Record<string, number> = {};
    let totalDurabilityLoss = activeMission.durabilityLoss.base; // Базовая потеря за миссию
    let totalWarSoul = 0;
    let positiveEvents = 0;
    let negativeEvents = 0;
    let choiceEvents = 0;

    finalEvents.forEach(e => {
      if (e.triggered || e.effects) {
        if (e.type === 'positive') positiveEvents++;
        if (e.type === 'negative') negativeEvents++;
        if (e.type === 'choice') choiceEvents++;

        if (e.effects) {
          if (e.effects.resources) {
            e.effects.resources.forEach(r => {
              totalResources[r.material] = (totalResources[r.material] || 0) + r.quantity;
            });
          }
          totalDurabilityLoss += e.effects.durabilityLoss || 0;
          totalWarSoul += e.effects.warSoul || 0;
        }
      }
    });

    setFinalReport({
      totalResources,
      totalDurabilityLoss,
      totalWarSoul,
      positiveEvents,
      negativeEvents,
      choiceEvents,
    });

    // Trigger all remaining events
    setActiveMission(prev => prev ? {
      ...prev,
      events: prev.events.map(e => ({ ...e, triggered: true })),
    } : null);

    setCompleted(true);
    setShowReport(true);
    setProgress(100);

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  }, [activeMission]);

  // Skip to next event
  const skipToNextEvent = () => {
    if (!activeMission || completed) return;

    const nextEvent = activeMission.events.find(e => !e.triggered);
    if (nextEvent) {
      const newElapsed = nextEvent.triggerTime;
      setActiveMission(prev => prev ? {
        ...prev,
        startTime: Date.now() - newElapsed * 1000,
        events: prev.events.map(e => 
          e.triggerTime <= newElapsed ? { ...e, triggered: true } : e
        ),
      } : null);
    }
  };

  // Complete immediately
  const completeImmediately = () => {
    if (!activeMission) return;
    completeMission(activeMission.events.map(e => ({ ...e, triggered: true })));
  };

  // Reset
  const reset = () => {
    setSelectedMission(null);
    setWeapon(null);
    setAdventurer(null);
    setActiveMission(null);
    setProgress(0);
    setElapsedTime(0);
    setCompleted(false);
    setShowReport(false);
    setFinalReport(null);
    loadMissions();
  };

  // Get triggered events for display
  const triggeredEvents = activeMission?.events.filter(e => e.triggered) || [];
  const nextEvent = activeMission?.events.find(e => !e.triggered);

  // Calculate current durability for display
  const currentDurability = activeMission 
    ? Math.max(0, activeMission.weapon.durability - 
        (activeMission.durabilityLoss.base + 
          triggeredEvents.reduce((sum, e) => sum + (e.effects?.durabilityLoss || 0), 0)))
    : weapon?.durability || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            🎒 Симулятор Экспедиций
          </h1>
          <p className="text-slate-400 mt-1">
            Тестируй механики и проверяй баланс
          </p>
        </div>

        {/* Balance Panel Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalancePanel(!showBalancePanel)}
            className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50"
          >
            ⚖️ Коэффициенты балансировки
          </Button>
        </div>

        {/* Balance Panel */}
        {showBalancePanel && (
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-100">⚖️ Коэффициенты балансировки</CardTitle>
              <CardDescription className="text-slate-400">
                Настрой множители для тестирования баланса
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Кол-во ресурсов: ×{balanceConfig.quantityMultiplier.toFixed(1)}</Label>
                  <Slider
                    value={[balanceConfig.quantityMultiplier]}
                    onValueChange={([v]) => setBalanceConfig(prev => ({ ...prev, quantityMultiplier: v }))}
                    min={0.1}
                    max={5}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Сдвиг качества: {balanceConfig.qualityShift > 0 ? '+' : ''}{balanceConfig.qualityShift}</Label>
                  <Slider
                    value={[balanceConfig.qualityShift + 2]}
                    onValueChange={([v]) => setBalanceConfig(prev => ({ ...prev, qualityShift: v - 2 }))}
                    min={0}
                    max={4}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Множитель времени: ×{balanceConfig.durationMultiplier.toFixed(1)}</Label>
                  <Slider
                    value={[balanceConfig.durationMultiplier]}
                    onValueChange={([v]) => setBalanceConfig(prev => ({ ...prev, durationMultiplier: v }))}
                    min={0.1}
                    max={3}
                    step={0.1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {!activeMission ? (
          /* Mission Selection Phase */
          <div className="space-y-6">
            {/* Available Missions */}
            <div>
              <h2 className="text-xl font-semibold text-slate-200 mb-4">📋 Доступные миссии</h2>
              {loadingMissions ? (
                <div className="text-center text-slate-400 py-8">Загрузка миссий...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {missions.map(mission => (
                    <Card
                      key={mission.id}
                      className={cn(
                        'cursor-pointer transition-all bg-slate-800/80 border-slate-700 hover:border-amber-500/50',
                        selectedMission?.id === mission.id && 'border-amber-500 ring-1 ring-amber-500/50'
                      )}
                      onClick={() => selectMission(mission)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{missionTypeIcons[mission.type] || '📜'}</span>
                            <div>
                              <CardTitle className="text-base text-slate-100">{mission.name}</CardTitle>
                              <CardDescription className="text-slate-400 text-xs">
                                {mission.location?.name || 'Unknown'}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={tierColors[mission.location?.tier || 1]}>
                            T{mission.location?.tier || 1}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-slate-300 line-clamp-2 mb-2">{mission.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="outline" className={difficultyColors[mission.difficulty]}>
                            {mission.difficulty}
                          </Badge>
                          <Badge variant="outline" className={rarityColors[mission.rarity]}>
                            {mission.rarity}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>💰 {mission.reward.gold.base}</span>
                          <span>⏱️ {formatTime(mission.duration.base)}</span>
                          <span>💎 {mission.cost.supplies.base}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Mission Details */}
            {selectedMission && weapon && adventurer && (
              <Card className="bg-slate-800/80 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">🎯 Выбранная миссия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Mission Info */}
                    <div className="p-3 rounded-lg bg-slate-700/50">
                      <h4 className="font-medium text-slate-200 mb-2">{selectedMission.name}</h4>
                      <p className="text-sm text-slate-400 mb-2">{selectedMission.objective}</p>
                      <div className="flex gap-2">
                        <Badge className={difficultyColors[selectedMission.difficulty]}>
                          {selectedMission.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-slate-300">
                          {selectedMission.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Weapon */}
                    <div className="p-3 rounded-lg bg-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{weapon.icon}</span>
                        <div>
                          <h4 className="font-medium text-slate-200">{weapon.name}</h4>
                          <Badge className={rarityColors[weapon.quality]}>
                            {weapon.quality}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        ⚔️ {weapon.attack} | 🛡️ {weapon.durability}/{weapon.maxDurability}
                      </div>
                    </div>

                    {/* Adventurer */}
                    <div className="p-3 rounded-lg bg-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{adventurer.icon}</span>
                        <div>
                          <h4 className="font-medium text-slate-200">{adventurer.name}</h4>
                          <Badge className={rarityColors[adventurer.rarity]}>
                            Lv.{adventurer.level} {adventurer.rarity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        💪 {adventurer.power} | 🎯 {adventurer.precision} | 🍀 {adventurer.luck}
                      </div>
                    </div>
                  </div>

                  {/* Reward Split */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">Деление награды</Label>
                    <RadioGroup
                      value={rewardSplit}
                      onValueChange={(v) => setRewardSplit(v as '30/70' | '50/50')}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="30/70" id="r30" />
                        <Label htmlFor="r30" className="text-slate-300">
                          30% искателю / 70% гильдии
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="50/50" id="r50" />
                        <Label htmlFor="r50" className="text-slate-300">
                          50% искателю / 50% гильдии
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* Start Button */}
                  <Button
                    onClick={startMission}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  >
                    🚀 Начать экспедицию
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Active Mission Phase */
          <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-100">
                      {activeMission.mission.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      📍 {activeMission.mission.location}
                    </CardDescription>
                  </div>
                  <Badge className={difficultyColors[activeMission.mission.difficulty]}>
                    {activeMission.mission.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Прогресс</span>
                    <span>{formatTime(elapsedTime)} / {formatTime(activeMission.mission.duration)}</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Test Controls */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={skipToNextEvent}
                    disabled={completed || !nextEvent}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  >
                    ⏩ До следующего события
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={completeImmediately}
                    disabled={completed}
                    className="bg-slate-700/50 border-slate-600 text-slate-200"
                  >
                    🏁 Завершить миссию
                  </Button>
                </div>

                {nextEvent && !completed && (
                  <p className="text-sm text-slate-400">
                    Следующее событие через: {formatTime(nextEvent.triggerTime - elapsedTime)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Team Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800/80 border-slate-700">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeMission.weapon.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-200">{activeMission.weapon.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all",
                              currentDurability <= REPAIR_THRESHOLD ? "bg-red-500" :
                              currentDurability <= activeMission.weapon.maxDurability * 0.3 ? "bg-orange-500" : "bg-green-500"
                            )}
                            style={{ width: `${(currentDurability / activeMission.weapon.maxDurability) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-400">{currentDurability}/{activeMission.weapon.maxDurability}</span>
                      </div>
                      <p className={cn("text-xs mt-1", getWeaponStatus(currentDurability, activeMission.weapon.maxDurability).color)}>
                        {getWeaponStatus(currentDurability, activeMission.weapon.maxDurability).text}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 border-slate-700">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeMission.adventurer.icon}</span>
                    <div>
                      <h4 className="font-medium text-slate-200">{activeMission.adventurer.name}</h4>
                      <p className="text-sm text-slate-400">
                        Lv.{activeMission.adventurer.level} | {rewardSplit} награда
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events Log */}
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-100">📜 Журнал событий</CardTitle>
                <CardDescription className="text-slate-400">
                  {triggeredEvents.length} / {activeMission.events.length} событий
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {triggeredEvents.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      Ожидание событий...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {triggeredEvents.map((event, i) => (
                        <div
                          key={`${event.id}-${i}`}
                          className={cn(
                            'p-3 rounded-lg border',
                            eventTypeColors[event.type]
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{event.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn('font-medium', eventTypeTextColors[event.type])}>
                                  {event.title}
                                </span>
                                <Badge variant="outline" className="text-xs text-slate-400">
                                  {event.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                              {event.effects && (
                                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                  {event.effects.resources?.map((r, j) => (
                                    <Badge key={j} className="bg-amber-500/20 text-amber-300">
                                      +{r.quantity} {r.material}
                                    </Badge>
                                  ))}
                                  {event.effects.durabilityLoss && (
                                    <Badge className="bg-red-500/20 text-red-300">
                                      -{event.effects.durabilityLoss} прочность
                                    </Badge>
                                  )}
                                  {event.effects.warSoul && (
                                    <Badge className="bg-purple-500/20 text-purple-300">
                                      +{event.effects.warSoul} душа войны
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {formatTime(event.triggerTime)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Final Report */}
            {showReport && finalReport && (
              <Card className="bg-slate-800/80 border-slate-700 border-amber-500/50">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-400">📊 Отчёт об экспедиции</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-slate-700/50 text-center">
                      <div className="text-2xl font-bold text-amber-300">
                        +{Object.keys(finalReport.totalResources).length}
                      </div>
                      <div className="text-xs text-slate-400">Типов ресурсов</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-700/50 text-center">
                      <div className="text-2xl font-bold text-yellow-300">
                        +{activeMission.rewards.guildShare.gold + activeMission.rewards.adventurerShare.gold}
                      </div>
                      <div className="text-xs text-slate-400">Золото (награда)</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-700/50 text-center">
                      <div className="text-2xl font-bold text-purple-300">
                        +{activeMission.rewards.totalWarSoul}
                      </div>
                      <div className="text-xs text-slate-400">Душа войны</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-700/50 text-center">
                      <div className="text-2xl font-bold text-red-300">
                        -{finalReport.totalDurabilityLoss}
                      </div>
                      <div className="text-xs text-slate-400">Прочность</div>
                    </div>
                  </div>

                  {/* Event Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm text-slate-300">{finalReport.positiveEvents} позитивных</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-red-500/10">
                      <span className="text-red-400">✗</span>
                      <span className="text-sm text-slate-300">{finalReport.negativeEvents} негативных</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10">
                      <span className="text-yellow-400">?</span>
                      <span className="text-sm text-slate-300">{finalReport.choiceEvents} выборов</span>
                    </div>
                  </div>

                  {/* Resources List */}
                  {Object.keys(finalReport.totalResources).length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">💎 Добытые ресурсы</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(finalReport.totalResources).map(([material, qty]) => (
                          <div
                            key={material}
                            className="p-2 rounded bg-slate-700/50 flex items-center justify-between"
                          >
                            <span className="text-sm text-slate-300 truncate">{material}</span>
                            <Badge className="bg-amber-500/20 text-amber-300">×{qty}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reward Split Summary */}
                  <div className="p-3 rounded-lg bg-slate-700/30">
                    <h4 className="font-medium text-slate-200 mb-2">💰 Распределение награды</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Гильдия:</span>
                        <span className="text-slate-200 ml-2">
                          {activeMission.rewards.guildShare.gold} 💰 / 
                          {activeMission.rewards.guildShare.glory} ⭐
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">{activeMission.adventurer.name}:</span>
                        <span className="text-slate-200 ml-2">
                          {activeMission.rewards.adventurerShare.gold} 💰 / 
                          {activeMission.rewards.adventurerShare.glory} ⭐
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weapon Status After Mission */}
                  <div className="p-3 rounded-lg bg-slate-700/30">
                    <h4 className="font-medium text-slate-200 mb-2">🛡️ Состояние оружия</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{activeMission.weapon.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">
                          {activeMission.weapon.name}: {currentDurability - finalReport.totalDurabilityLoss}/{activeMission.weapon.maxDurability} прочности
                        </p>
                        <p className={cn("text-xs", 
                          (currentDurability - finalReport.totalDurabilityLoss) <= REPAIR_THRESHOLD 
                            ? "text-red-400" : "text-green-400"
                        )}>
                          {(currentDurability - finalReport.totalDurabilityLoss) <= REPAIR_THRESHOLD 
                            ? `⚠️ Требует ремонта! (порог: ${REPAIR_THRESHOLD})`
                            : "✓ Оружие в порядке"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={reset}
                    className="w-full bg-slate-600 hover:bg-slate-500"
                  >
                    🔄 Новая экспедиция
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
          Симулятор экспедиций v3 • Баланс исправлен • Ресурсы из локаций • Прочность оружия
        </div>
      </div>
    </div>
  );
}
