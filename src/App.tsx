import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Code2,
  Download,
  Terminal,
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  Layers,
  Zap,
  Info,
  Smartphone,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { DailyStats, OperatingLevel, DetectionLogEvent } from './types/monster';
import { PhoneSimulator } from './components/PhoneSimulator';
import { TestSuiteModal } from './components/TestSuiteModal';
import { CodeExplorer } from './components/CodeExplorer';
import { MOOD_TIERS, getMoodForCount } from './utils/monsterDialogue';
import { MonsterCanvas } from './components/MonsterCanvas';
import { generateProjectZip } from './utils/projectZip';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'reel_monster_state_v1';

const INITIAL_SEVEN_DAYS: DailyStats[] = [
  { dateString: '2026-11-02', totalReels: 28, instagramCount: 16, youtubeShortsCount: 12, manualIncrements: 20, autoDetections: 8, estimatedUsageMinutes: 38 },
  { dateString: '2026-11-03', totalReels: 42, instagramCount: 26, youtubeShortsCount: 16, manualIncrements: 28, autoDetections: 14, estimatedUsageMinutes: 55 },
  { dateString: '2026-11-04', totalReels: 18, instagramCount: 10, youtubeShortsCount: 8, manualIncrements: 12, autoDetections: 6, estimatedUsageMinutes: 24 },
  { dateString: '2026-11-05', totalReels: 64, instagramCount: 38, youtubeShortsCount: 26, manualIncrements: 40, autoDetections: 24, estimatedUsageMinutes: 84 },
  { dateString: '2026-11-06', totalReels: 35, instagramCount: 20, youtubeShortsCount: 15, manualIncrements: 25, autoDetections: 10, estimatedUsageMinutes: 46 },
  { dateString: '2026-11-07', totalReels: 51, instagramCount: 31, youtubeShortsCount: 20, manualIncrements: 30, autoDetections: 21, estimatedUsageMinutes: 68 },
  { dateString: '2026-11-08', totalReels: 12, instagramCount: 7, youtubeShortsCount: 5, manualIncrements: 8, autoDetections: 4, estimatedUsageMinutes: 16 }
];

export default function App() {
  const [todayStats, setTodayStats] = useState<DailyStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.todayStats) return parsed.todayStats;
      }
    } catch (e) {}
    return INITIAL_SEVEN_DAYS[INITIAL_SEVEN_DAYS.length - 1];
  });

  const [sevenDaysHistory, setSevenDaysHistory] = useState<DailyStats[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sevenDaysHistory) return parsed.sevenDaysHistory;
      }
    } catch (e) {}
    return INITIAL_SEVEN_DAYS;
  });

  const [operatingLevel, setOperatingLevel] = useState<OperatingLevel>('LEVEL_1_MANUAL');
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [showTestSuite, setShowTestSuite] = useState(false);
  const [showCodeExplorer, setShowCodeExplorer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [detectionLogs, setDetectionLogs] = useState<DetectionLogEvent[]>([
    {
      id: 'init-1',
      timestamp: '09:40:12',
      platform: 'manual',
      action: 'MANUAL_COUNT',
      reason: 'Reel Monster service initialized in Level 1 Manual Mode.',
      countAfter: 12
    }
  ]);

  // Persist state in localStorage to simulate Room DB persistence across refreshes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          todayStats,
          sevenDaysHistory,
          operatingLevel,
          isOverlayActive
        })
      );
    } catch (e) {}
  }, [todayStats, sevenDaysHistory, operatingLevel, isOverlayActive]);

  // Increment counter
  const handleIncrement = (
    source: 'MANUAL_TAP' | 'AUTO_DETECTED',
    platform: 'instagram' | 'youtube' | 'manual'
  ) => {
    const isIg = platform === 'instagram';
    const isYt = platform === 'youtube';
    const isAuto = source === 'AUTO_DETECTED';

    const newTotal = todayStats.totalReels + 1;

    // Trigger celebratory confetti at dramatic milestone (e.g. 61+)
    if (newTotal === 61) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const updatedToday: DailyStats = {
      ...todayStats,
      totalReels: newTotal,
      instagramCount: isIg ? todayStats.instagramCount + 1 : todayStats.instagramCount,
      youtubeShortsCount: isYt ? todayStats.youtubeShortsCount + 1 : todayStats.youtubeShortsCount,
      manualIncrements: !isAuto ? todayStats.manualIncrements + 1 : todayStats.manualIncrements,
      autoDetections: isAuto ? todayStats.autoDetections + 1 : todayStats.autoDetections,
      estimatedUsageMinutes: todayStats.estimatedUsageMinutes + (isIg || isYt ? 1 : 0)
    };

    setTodayStats(updatedToday);
    setSevenDaysHistory(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = updatedToday;
      return copy;
    });
  };

  // Undo last counter increment
  const handleUndo = () => {
    if (todayStats.totalReels <= 0) return;

    const updatedToday: DailyStats = {
      ...todayStats,
      totalReels: todayStats.totalReels - 1,
      manualIncrements: Math.max(0, todayStats.manualIncrements - 1)
    };

    setTodayStats(updatedToday);
    setSevenDaysHistory(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = updatedToday;
      return copy;
    });

    setDetectionLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        platform: 'manual',
        action: 'MANUAL_COUNT',
        reason: 'Counter undone (-1) from dashboard action.',
        countAfter: updatedToday.totalReels
      },
      ...prev.slice(0, 30)
    ]);
  };

  // Reset all statistics
  const handleClearAll = () => {
    const cleared: DailyStats = {
      dateString: '2026-11-08',
      totalReels: 0,
      instagramCount: 0,
      youtubeShortsCount: 0,
      manualIncrements: 0,
      autoDetections: 0,
      estimatedUsageMinutes: 0
    };
    setTodayStats(cleared);
    setSevenDaysHistory(prev => prev.map(d => ({ ...d, totalReels: 0, instagramCount: 0, youtubeShortsCount: 0 })));
    setDetectionLogs([
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        platform: 'manual',
        action: 'MANUAL_COUNT',
        reason: 'All local statistics cleared via Settings.',
        countAfter: 0
      }
    ]);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ReelMonster_Native_Android_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const moodInfo = getMoodForCount(todayStats.totalReels);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 text-xl font-black">
              👾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Reel Monster
                </span>
                <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Native Android 14
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A Floating Screen-Time Monster for Instagram Reels &amp; YouTube Shorts
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTestSuite(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              title="Run 14-Point Acceptance Test Suite"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>QA Test Suite (14)</span>
            </button>

            <button
              onClick={() => setShowCodeExplorer(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              title="Inspect Native Android Project Code"
            >
              <Code2 className="w-4 h-4 text-pink-400" />
              <span>Source Explorer</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-pink-600/30 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Packing...' : 'Export Android Project (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Phone Simulator (5 Cols on large) */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center">
          <PhoneSimulator
            todayStats={todayStats}
            sevenDaysHistory={sevenDaysHistory}
            operatingLevel={operatingLevel}
            isOverlayActive={isOverlayActive}
            onToggleOverlay={setIsOverlayActive}
            onSwitchLevel={setOperatingLevel}
            onIncrementCount={handleIncrement}
            onUndoCount={handleUndo}
            onClearAllData={handleClearAll}
            detectionLogs={detectionLogs}
            onAddDetectionLog={(log) => setDetectionLogs(prev => [log, ...prev.slice(0, 30)])}
          />

          <p className="text-[11px] text-slate-500 text-center mt-3 max-w-xs">
            💡 <strong>Tip:</strong> Drag the monster anywhere on screen. Tap it in Level 1 to manual count, or switch to Instagram/YouTube tabs to test Level 2 Auto-Detection!
          </p>
        </div>

        {/* Right Column: Analytics, Mood Showcase, Event Inspector & Architecture (7 Cols) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-5">
          {/* Real-time Accessibility & Detection Inspector */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Level 2 Accessibility &amp; Transition Inspector
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                operatingLevel === 'LEVEL_2_AUTOMATIC'
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {operatingLevel === 'LEVEL_2_AUTOMATIC' ? 'Engine Active ⚡' : 'Level 1 Manual Active'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
              {detectionLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 border-b border-slate-900 pb-1.5 last:border-0">
                  <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                    log.action === 'NEW_VIDEO_DETECTED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : log.action === 'COOLDOWN_ACTIVE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-slate-300 leading-snug">{log.reason}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px]">Debounce Cooldown: <strong>850ms</strong> • Duplicate Window: <strong>12s</strong></span>
              <button
                onClick={() => setDetectionLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear Log
              </button>
            </div>
          </div>

          {/* Progressive Monster Growth & Mood Matrix */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Monster Growth &amp; Mood Progression
                </h2>
                <p className="text-xs text-slate-400">
                  Scales up and evolves funny expressions as scrolling ascends
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-pink-500/10 text-pink-400 text-xs font-bold px-2.5 py-1 rounded-xl border border-pink-500/20">
                <Flame className="w-3.5 h-3.5" />
                <span>Current: {moodInfo.tierName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(MOOD_TIERS) as (keyof typeof MOOD_TIERS)[]).map((key) => {
                const tier = MOOD_TIERS[key];
                const isActive = moodInfo.tier === tier.tier;
                return (
                  <div
                    key={tier.tier}
                    onClick={() => {
                      // Set sample count for that tier
                      setTodayStats(prev => ({ ...prev, totalReels: tier.minCount + 1 }));
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-pink-950/40 border-pink-500 ring-1 ring-pink-500 text-white shadow-lg shadow-pink-950/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-white">{tier.tierName}</span>
                      <span className="text-[10px] font-mono font-bold text-pink-400">
                        {tier.scaleFactor}x
                      </span>
                    </div>

                    <div className="my-2 flex items-center justify-center">
                      <MonsterCanvas mood={tier.tier} count={tier.minCount + 1} size={46} interactive={false} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-t border-slate-800/80 pt-1.5 mt-1">
                      <span className="font-mono text-slate-400">{tier.minCount}–{tier.maxCount > 1000 ? '61+' : tier.maxCount} Reels</span>
                      {isActive && <span className="text-emerald-400 font-bold">Active</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architecture & Android Technical Specifications */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Android Technical Stack &amp; Constraints
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  WindowManager Floating Overlay
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Uses <code className="text-pink-300">TYPE_APPLICATION_OVERLAY</code> and <code className="text-pink-300">FLAG_NOT_FOCUSABLE</code> with smooth edge docking physics.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Accessibility Detection Engine
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Filters <code className="text-yellow-300">clips_video_container</code> &amp; <code className="text-yellow-300">shorts_player</code> with 850ms debounce and zero text capture.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Room Database &amp; DataStore
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Zero cloud, zero remote servers. Stores daily history, lifetime counters, and settings in local SQLite Room DB.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  UsageStatsManager Tracking
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Pairs foreground <code className="text-cyan-300">ACTIVITY_RESUMED</code> and <code className="text-cyan-300">PAUSED</code> to estimate screen time accurately.
                </p>
              </div>
            </div>

            {/* Command-Line Build Box */}
            <div className="p-3 bg-black/60 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">CLI Build:</span>
                <code className="text-emerald-400 font-mono text-xs">
                  cd ReelMonster &amp;&amp; ./gradlew assembleDebug
                </code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('cd ReelMonster && ./gradlew assembleDebug');
                }}
                className="text-[10px] font-bold text-pink-400 hover:text-pink-300"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Acceptance Test Suite Modal */}
      {showTestSuite && (
        <TestSuiteModal
          onClose={() => setShowTestSuite(false)}
          onSetReelCount={(count) => {
            setTodayStats(prev => ({ ...prev, totalReels: count }));
          }}
        />
      )}

      {/* Native Code Explorer Modal */}
      {showCodeExplorer && (
        <CodeExplorer onClose={() => setShowCodeExplorer(false)} />
      )}
    </div>
  );
}
