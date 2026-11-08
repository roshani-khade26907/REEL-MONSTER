import React, { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Home,
  ChevronLeft,
  Square,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { DailyStats, OperatingLevel, DetectionLogEvent } from '../types/monster';
import { DashboardView } from './DashboardView';
import { SettingsView } from './SettingsView';
import { InstagramSimulator } from './InstagramSimulator';
import { YouTubeShortsSimulator } from './YouTubeShortsSimulator';
import { FloatingOverlay } from './FloatingOverlay';
import { getMoodForCount, getRandomDialogue } from '../utils/monsterDialogue';
import { soundFx } from '../utils/sound';

interface PhoneSimulatorProps {
  todayStats: DailyStats;
  sevenDaysHistory: DailyStats[];
  operatingLevel: OperatingLevel;
  isOverlayActive: boolean;
  onToggleOverlay: (enabled: boolean) => void;
  onSwitchLevel: (level: OperatingLevel) => void;
  onIncrementCount: (source: 'MANUAL_TAP' | 'AUTO_DETECTED', platform: 'instagram' | 'youtube' | 'manual') => void;
  onUndoCount: () => void;
  onClearAllData: () => void;
  detectionLogs: DetectionLogEvent[];
  onAddDetectionLog: (log: DetectionLogEvent) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  todayStats,
  sevenDaysHistory,
  operatingLevel,
  isOverlayActive,
  onToggleOverlay,
  onSwitchLevel,
  onIncrementCount,
  onUndoCount,
  onClearAllData,
  detectionLogs,
  onAddDetectionLog
}) => {
  const [currentApp, setCurrentApp] = useState<'dashboard' | 'settings' | 'instagram' | 'youtube'>('dashboard');
  const [igIndex, setIgIndex] = useState(0);
  const [ytIndex, setYtIndex] = useState(0);
  const [lastTransitionTime, setLastTransitionTime] = useState<number>(0);
  const [lastVideoHash, setLastVideoHash] = useState<string>('');

  const [currentSpeech, setCurrentSpeech] = useState<string>(() =>
    getRandomDialogue(getMoodForCount(todayStats.totalReels).tier)
  );

  const [isOverlayPermitted, setIsOverlayPermitted] = useState(true);
  const [isAccessibilityPermitted, setIsAccessibilityPermitted] = useState(true);
  const [isUsageStatsPermitted, setIsUsageStatsPermitted] = useState(true);
  const [speechBubblesEnabled, setSpeechBubblesEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const phoneScreenRef = useRef<HTMLDivElement>(null);

  // Update speech when count threshold passes
  useEffect(() => {
    if (speechBubblesEnabled) {
      const mood = getMoodForCount(todayStats.totalReels);
      setCurrentSpeech(getRandomDialogue(mood.tier));
    }
  }, [todayStats.totalReels, speechBubblesEnabled]);

  // Handle Manual Tap from Floating Monster
  const handleMonsterTap = () => {
    onIncrementCount('MANUAL_TAP', 'manual');
    const mood = getMoodForCount(todayStats.totalReels + 1);
    setCurrentSpeech(getRandomDialogue(mood.tier));
  };

  // Level 2 Automatic Detection Logic for Instagram & YouTube Transitions
  const handleVideoTransition = (platform: 'instagram' | 'youtube', nextIndex: number) => {
    const now = Date.now();
    const cooldownMs = 850;
    const videoId = `${platform}_video_${nextIndex}`;

    // Level 1: Automatic detection is inactive
    if (operatingLevel === 'LEVEL_1_MANUAL') {
      onAddDetectionLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        platform,
        action: 'EVENT_SUPPRESSED',
        reason: 'Level 1 Manual mode active: Video swipe ignored. Tap monster to count.',
        countAfter: todayStats.totalReels
      });
      return;
    }

    // Level 2: Check if Accessibility permission is enabled
    if (!isAccessibilityPermitted) {
      onAddDetectionLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        platform,
        action: 'EVENT_SUPPRESSED',
        reason: 'Accessibility Service permission missing. Auto-detect suspended.',
        countAfter: todayStats.totalReels
      });
      return;
    }

    // Debounce check
    if (now - lastTransitionTime < cooldownMs) {
      onAddDetectionLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        platform,
        action: 'COOLDOWN_ACTIVE',
        reason: `Debounce active (<${cooldownMs}ms between gestures). Suppressed duplicate count.`,
        countAfter: todayStats.totalReels
      });
      return;
    }

    // Duplicate check
    if (videoId === lastVideoHash && now - lastTransitionTime < 10000) {
      onAddDetectionLog({
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        platform,
        action: 'EVENT_SUPPRESSED',
        reason: 'Duplicate video signature hash match. Re-render suppressed.',
        countAfter: todayStats.totalReels
      });
      return;
    }

    // Success! New reel transition detected
    setLastTransitionTime(now);
    setLastVideoHash(videoId);

    if (soundEnabled) {
      soundFx.playBubblePop(1.15);
    }

    onIncrementCount('AUTO_DETECTED', platform);

    onAddDetectionLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      platform,
      action: 'NEW_VIDEO_DETECTED',
      reason: `Accessibility event: [${platform === 'instagram' ? 'clips_video_container' : 'shorts_player'}] transitioned. Count +1.`,
      countAfter: todayStats.totalReels + 1
    });
  };

  // Interaction with elements that shouldn't count (likes, comments, etc.)
  const handleNonVideoInteraction = (elementName: string) => {
    onAddDetectionLog({
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      platform: currentApp === 'instagram' ? 'instagram' : 'youtube',
      action: 'EVENT_SUPPRESSED',
      reason: `UI event on [${elementName}]: Not a video transition. Suppressed.`,
      countAfter: todayStats.totalReels
    });
  };

  const moodInfo = getMoodForCount(todayStats.totalReels);

  return (
    <div className="flex flex-col items-center">
      {/* App Switcher Tabs above phone */}
      <div className="mb-3 flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-md">
        <button
          onClick={() => setCurrentApp('dashboard')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
            currentApp === 'dashboard'
              ? 'bg-pink-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <span>👾 Reel Monster</span>
        </button>

        <button
          onClick={() => setCurrentApp('instagram')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
            currentApp === 'instagram'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <span>📸 Instagram Reels</span>
        </button>

        <button
          onClick={() => setCurrentApp('youtube')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
            currentApp === 'youtube'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          <span>▶️ YouTube Shorts</span>
        </button>
      </div>

      {/* Realistic Android Phone Mockup */}
      <div
        className="relative w-[340px] sm:w-[370px] h-[720px] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-[6px] border-slate-800 ring-1 ring-slate-700 select-none flex flex-col"
      >
        {/* Top Speaker Grill & Camera Punchhole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-b-xl z-40 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-2 ring-slate-800/80" />
        </div>

        {/* Screen Bezel Area */}
        <div
          ref={phoneScreenRef}
          className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col justify-between"
        >
          {/* Android Status Bar */}
          <div className="h-7 px-5 flex items-center justify-between text-[11px] font-bold z-30 select-none pointer-events-none text-white/90">
            <span>9:41</span>
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">98%</span>
                <Battery className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Active Screen Content */}
          <div className="flex-1 w-full h-[calc(100%-48px)] overflow-hidden relative">
            {currentApp === 'dashboard' && (
              <DashboardView
                todayStats={todayStats}
                sevenDaysHistory={sevenDaysHistory}
                operatingLevel={operatingLevel}
                isOverlayActive={isOverlayActive}
                onToggleOverlay={onToggleOverlay}
                onSwitchLevel={onSwitchLevel}
                onManualIncrement={handleMonsterTap}
                onUndoIncrement={onUndoCount}
                onOpenSettings={() => setCurrentApp('settings')}
                onOpenAppSimulator={(app) => setCurrentApp(app)}
                currentSpeech={currentSpeech}
                onRefreshSpeech={() => {
                  setCurrentSpeech(getRandomDialogue(moodInfo.tier));
                }}
              />
            )}

            {currentApp === 'settings' && (
              <SettingsView
                onBack={() => setCurrentApp('dashboard')}
                isOverlayPermitted={isOverlayPermitted}
                isAccessibilityPermitted={isAccessibilityPermitted}
                isUsageStatsPermitted={isUsageStatsPermitted}
                onToggleOverlayPerm={() => setIsOverlayPermitted(!isOverlayPermitted)}
                onToggleAccessibilityPerm={() => setIsAccessibilityPermitted(!isAccessibilityPermitted)}
                onToggleUsagePerm={() => setIsUsageStatsPermitted(!isUsageStatsPermitted)}
                speechBubblesEnabled={speechBubblesEnabled}
                onToggleSpeechBubbles={setSpeechBubblesEnabled}
                soundEnabled={soundEnabled}
                onToggleSound={setSoundEnabled}
                onClearAllData={onClearAllData}
              />
            )}

            {currentApp === 'instagram' && (
              <InstagramSimulator
                currentIndex={igIndex}
                onNextVideo={() => {
                  const next = igIndex + 1;
                  setIgIndex(next);
                  handleVideoTransition('instagram', next);
                }}
                onPrevVideo={() => {
                  if (igIndex > 0) {
                    const prev = igIndex - 1;
                    setIgIndex(prev);
                    handleVideoTransition('instagram', prev);
                  }
                }}
                onInteractElement={handleNonVideoInteraction}
              />
            )}

            {currentApp === 'youtube' && (
              <YouTubeShortsSimulator
                currentIndex={ytIndex}
                onNextVideo={() => {
                  const next = ytIndex + 1;
                  setYtIndex(next);
                  handleVideoTransition('youtube', next);
                }}
                onPrevVideo={() => {
                  if (ytIndex > 0) {
                    const prev = ytIndex - 1;
                    setYtIndex(prev);
                    handleVideoTransition('youtube', prev);
                  }
                }}
                onInteractElement={handleNonVideoInteraction}
              />
            )}

            {/* Floating Monster Overlay (Renders when overlay is enabled) */}
            {isOverlayActive && isOverlayPermitted && (
              <FloatingOverlay
                count={todayStats.totalReels}
                mood={moodInfo.tier}
                speechText={speechBubblesEnabled ? currentSpeech : null}
                operatingLevel={operatingLevel}
                onTapCount={handleMonsterTap}
                onDismissSpeech={() => setCurrentSpeech('')}
                containerBoundsRef={phoneScreenRef}
                isMuted={!soundEnabled}
              />
            )}
          </div>

          {/* Android Navigation Bar */}
          <div className="h-6 w-full flex items-center justify-center bg-black/80 backdrop-blur-md z-30">
            {/* Gesture Navigation Pill */}
            <div
              onClick={() => setCurrentApp('dashboard')}
              className="w-28 h-1 bg-white/40 hover:bg-white/80 rounded-full cursor-pointer transition-colors"
              title="Home Gesture: Return to Reel Monster Dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
