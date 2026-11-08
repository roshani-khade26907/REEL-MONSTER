import React from 'react';
import {
  Sparkles,
  Layers,
  Clock,
  Plus,
  Undo2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Settings as SettingsIcon,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { DailyStats, OperatingLevel } from '../types/monster';
import { MonsterCanvas } from './MonsterCanvas';
import { getMoodForCount, getRandomDialogue } from '../utils/monsterDialogue';

interface DashboardViewProps {
  todayStats: DailyStats;
  sevenDaysHistory: DailyStats[];
  operatingLevel: OperatingLevel;
  isOverlayActive: boolean;
  onToggleOverlay: (enabled: boolean) => void;
  onSwitchLevel: (level: OperatingLevel) => void;
  onManualIncrement: () => void;
  onUndoIncrement: () => void;
  onOpenSettings: () => void;
  onOpenAppSimulator: (app: 'instagram' | 'youtube') => void;
  currentSpeech: string;
  onRefreshSpeech: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  todayStats,
  sevenDaysHistory,
  operatingLevel,
  isOverlayActive,
  onToggleOverlay,
  onSwitchLevel,
  onManualIncrement,
  onUndoIncrement,
  onOpenSettings,
  onOpenAppSimulator,
  currentSpeech,
  onRefreshSpeech
}) => {
  const moodInfo = getMoodForCount(todayStats.totalReels);

  // Maximum count for 7-day bar chart scaling
  const maxBarCount = Math.max(12, ...sevenDaysHistory.map(d => d.totalReels));

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FFF0F5] text-slate-800 p-4 space-y-4 font-sans select-none pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 font-black text-lg">
            👾
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
              Reel Monster
            </h1>
            <p className="text-[11px] font-semibold text-pink-600">
              {operatingLevel === 'LEVEL_1_MANUAL' ? 'Level 1 • Manual Counting' : 'Level 2 • Auto-Detection'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-white shadow-sm border border-pink-100 hover:bg-pink-50 text-slate-700 transition-colors"
          title="Open Settings"
        >
          <SettingsIcon className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Monster Hero Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-pink-100/80 flex flex-col items-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-300/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-yellow-300/25 rounded-full blur-2xl pointer-events-none" />

        {/* Speech Bubble */}
        <div
          onClick={onRefreshSpeech}
          className="mb-3 max-w-[260px] text-center bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-lg relative cursor-pointer hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <p className="line-clamp-2">"{currentSpeech}"</p>
          <span className="text-[9px] text-pink-300 opacity-70 group-hover:opacity-100 block mt-0.5">
            (Tap monster or speech to shuffle dialogue)
          </span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45" />
        </div>

        {/* Live Interactive Monster */}
        <div
          onClick={onManualIncrement}
          className="my-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="Tap Monster to add reel count"
        >
          <MonsterCanvas mood={moodInfo.tier} count={todayStats.totalReels} size={88} />
        </div>

        {/* Mood Status */}
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-extrabold text-base text-slate-900">{moodInfo.tierName}</span>
            <span className="text-xs bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
              Growth {moodInfo.scaleFactor.toFixed(2)}x
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 max-w-[260px]">
            {moodInfo.description}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-4 flex items-center gap-2.5 w-full">
          <button
            onClick={onManualIncrement}
            className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs py-2.5 px-3 rounded-2xl shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Count Reel (+1)</span>
          </button>

          {todayStats.totalReels > 0 && (
            <button
              onClick={onUndoIncrement}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-1 transition-colors"
              title="Undo last reel increment"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Overlay Switch Card */}
      <div className={`p-4 rounded-3xl border transition-all flex items-center justify-between ${
        isOverlayActive ? 'bg-pink-50/90 border-pink-300 shadow-sm' : 'bg-white border-pink-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
            isOverlayActive ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30' : 'bg-slate-100 text-slate-500'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900">
              Floating Monster Overlay
            </h2>
            <p className="text-[11px] text-slate-500">
              {isOverlayActive ? 'Floats over Instagram & YouTube' : 'Overlay is currently hidden'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleOverlay(!isOverlayActive)}
          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
            isOverlayActive ? 'bg-pink-600' : 'bg-slate-300'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
            isOverlayActive ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {/* Operating Mode Selector */}
      <div className="bg-white rounded-3xl p-4 border border-pink-100/80 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Counting Mode
          </span>
          <span className="text-[10px] text-slate-400">Switch anytime</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Level 1 */}
          <button
            onClick={() => onSwitchLevel('LEVEL_1_MANUAL')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              operatingLevel === 'LEVEL_1_MANUAL'
                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-xs">Level 1 • Manual</span>
              <span className="text-[10px] opacity-75">100% Offline</span>
            </div>
            <p className="text-[10px] opacity-80 mt-1 leading-tight">
              Tap floating bubble after watching each video. Simple & rock-solid.
            </p>
          </button>

          {/* Level 2 */}
          <button
            onClick={() => onSwitchLevel('LEVEL_2_AUTOMATIC')}
            className={`p-3 rounded-2xl text-left border transition-all ${
              operatingLevel === 'LEVEL_2_AUTOMATIC'
                ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-xs">Level 2 • Auto</span>
              <span className="text-[10px] bg-white/20 px-1 rounded">Smart</span>
            </div>
            <p className="text-[10px] opacity-80 mt-1 leading-tight">
              Detects Reels & Shorts transitions using on-device accessibility.
            </p>
          </button>
        </div>
      </div>

      {/* Simulator Launchers: Open Instagram or YouTube to test overlay */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-4 text-white shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Test Overlay in Simulated Apps
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Open Instagram Reels or YouTube Shorts inside this phone to see the monster float and count!
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onOpenAppSimulator('instagram')}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
          >
            <span>Instagram Reels</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={() => onOpenAppSimulator('youtube')}
            className="bg-red-600 hover:bg-red-500 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow"
          >
            <span>YouTube Shorts</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Today's Activity Metrics Grid */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5">
          Today's Statistics
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Reels */}
          <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-500 text-[11px] font-semibold">
              <span>Total Reels</span>
              <span className="bg-pink-100 text-pink-700 text-[9px] px-1.5 py-0.5 rounded-md font-bold">Today</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {todayStats.totalReels}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Manual: {todayStats.manualIncrements} • Auto: {todayStats.autoDetections}
            </div>
          </div>

          {/* Time Lost */}
          <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-500 text-[11px] font-semibold">
              <span>Time Lost</span>
              <span className="bg-yellow-100 text-yellow-800 text-[9px] px-1.5 py-0.5 rounded-md font-bold">Estimated</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {todayStats.estimatedUsageMinutes} <span className="text-xs font-semibold text-slate-500">min</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Foreground app tracking
            </div>
          </div>

          {/* Instagram Breakdown */}
          <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-[11px] font-semibold">
              <span>Instagram</span>
              <span className="w-2 h-2 rounded-full bg-pink-500" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {todayStats.instagramCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Reels viewed
            </div>
          </div>

          {/* YouTube Breakdown */}
          <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-[11px] font-semibold">
              <span>YouTube</span>
              <span className="w-2 h-2 rounded-full bg-red-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {todayStats.youtubeShortsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Shorts viewed
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Activity Bar Chart */}
      <div className="bg-white rounded-3xl p-4 border border-pink-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Last 7 Days Activity
            </h2>
            <p className="text-[11px] text-slate-500">Short-form video volume</p>
          </div>
          <TrendingUp className="w-4 h-4 text-pink-600" />
        </div>

        <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1">
          {sevenDaysHistory.slice(-7).map((day, idx) => {
            const heightPercent = Math.max(8, (day.totalReels / maxBarCount) * 100);
            const isToday = idx === sevenDaysHistory.slice(-7).length - 1;
            const label = day.dateString.slice(5); // MM-DD

            return (
              <div key={day.dateString} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                {/* Count tooltip on hover */}
                <span className="text-[10px] font-black text-slate-700 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                  {day.totalReels}
                </span>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[22px] rounded-t-lg transition-all duration-300 ${
                    isToday
                      ? 'bg-gradient-to-t from-pink-600 to-rose-400 shadow-sm shadow-pink-500/30'
                      : 'bg-slate-200 group-hover:bg-pink-300'
                  }`}
                />

                <span className={`text-[9px] font-semibold ${isToday ? 'text-pink-600 font-bold' : 'text-slate-400'}`}>
                  {isToday ? 'Today' : label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zero Cloud Privacy Guarantee Badge */}
      <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Privacy Guarantee:</strong> Reel Monster processes activity locally on your device. It does not require an account and does not upload your viewing activity to a server.
        </p>
      </div>
    </div>
  );
};
