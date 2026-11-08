import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Vibrate,
  Trash2,
  Shield,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
  isOverlayPermitted: boolean;
  isAccessibilityPermitted: boolean;
  isUsageStatsPermitted: boolean;
  onToggleOverlayPerm: () => void;
  onToggleAccessibilityPerm: () => void;
  onToggleUsagePerm: () => void;
  speechBubblesEnabled: boolean;
  onToggleSpeechBubbles: (val: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: (val: boolean) => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  isOverlayPermitted,
  isAccessibilityPermitted,
  isUsageStatsPermitted,
  onToggleOverlayPerm,
  onToggleAccessibilityPerm,
  onToggleUsagePerm,
  speechBubblesEnabled,
  onToggleSpeechBubbles,
  soundEnabled,
  onToggleSound,
  onClearAllData
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="w-full h-full overflow-y-auto bg-[#FFF0F5] text-slate-800 p-4 space-y-4 font-sans select-none pb-20">
      {/* Top Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white shadow-sm border border-pink-100 hover:bg-pink-50 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-extrabold text-slate-900">
            Settings &amp; Permissions
          </h1>
          <p className="text-[11px] text-slate-500">Android System Configuration</p>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-2.5">
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          System Permissions
        </span>

        {/* 1. Display over other apps */}
        <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-sm space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Display Over Other Apps</span>
                {isOverlayPermitted ? (
                  <span className="flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Granted
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    <AlertCircle className="w-2.5 h-2.5" /> Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Allows the cute monster bubble to float above Instagram Reels &amp; YouTube Shorts.
              </p>
            </div>
            <button
              onClick={onToggleOverlayPerm}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                isOverlayPermitted
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-pink-600 text-white shadow-md shadow-pink-500/25 hover:bg-pink-500'
              }`}
            >
              {isOverlayPermitted ? 'Revoke' : 'Grant'}
            </button>
          </div>
        </div>

        {/* 2. Accessibility Service */}
        <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-sm space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Accessibility Service (Level 2)</span>
                {isAccessibilityPermitted ? (
                  <span className="flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                    Level 2 Only
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Enables automatic video transition detection. Processed 100% locally on-device.
              </p>
            </div>
            <button
              onClick={onToggleAccessibilityPerm}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                isAccessibilityPermitted
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-pink-600 text-white shadow-md shadow-pink-500/25 hover:bg-pink-500'
              }`}
            >
              {isAccessibilityPermitted ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {/* 3. Usage Access */}
        <div className="bg-white p-3.5 rounded-2xl border border-pink-100 shadow-sm space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Usage Access</span>
                {isUsageStatsPermitted ? (
                  <span className="flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Granted
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Permits accurate estimation of foreground time spent inside Instagram and YouTube.
              </p>
            </div>
            <button
              onClick={onToggleUsagePerm}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                isUsageStatsPermitted
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-pink-600 text-white shadow-md shadow-pink-500/25 hover:bg-pink-500'
              }`}
            >
              {isUsageStatsPermitted ? 'Revoke' : 'Grant'}
            </button>
          </div>
        </div>
      </div>

      {/* Monster Preferences */}
      <div className="space-y-2.5">
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Monster Preferences
        </span>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm divide-y divide-slate-100">
          {/* Speech Bubbles */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">Funny Speech Bubbles</span>
              <p className="text-[11px] text-slate-500">
                Show witty remarks based on scroll counts.
              </p>
            </div>
            <button
              onClick={() => onToggleSpeechBubbles(!speechBubblesEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                speechBubblesEnabled ? 'bg-pink-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                speechBubblesEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Sound / Haptic */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">Audio / Haptic Click</span>
              <p className="text-[11px] text-slate-500">
                Play pleasant pop tone when monster is tapped.
              </p>
            </div>
            <button
              onClick={() => onToggleSound(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                soundEnabled ? 'bg-pink-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Local Storage & Reset */}
      <div className="space-y-2.5">
        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Data Management
        </span>

        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm space-y-3">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All records, lifetime counts, and daily statistics are stored strictly in your device's local database. Clearing data removes all history permanently.
          </p>

          {showConfirmReset ? (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-2">
              <p className="text-xs font-bold text-rose-800">
                Are you sure you want to reset all counts and 7-day stats?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClearAllData();
                    setShowConfirmReset(false);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2.5 px-3 rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Reel Monster Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
          <Shield className="w-4 h-4" />
          <span>Local-Only Architecture</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          "Reel Monster processes activity locally on your device. It does not require an account and does not upload your viewing activity to a server."
        </p>
      </div>
    </div>
  );
};
