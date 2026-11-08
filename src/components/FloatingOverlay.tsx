import React, { useState, useRef, useEffect } from 'react';
import { MoodTier } from '../types/monster';
import { MonsterCanvas } from './MonsterCanvas';
import { MOOD_TIERS } from '../utils/monsterDialogue';
import { soundFx } from '../utils/sound';

interface FloatingOverlayProps {
  count: number;
  mood: MoodTier;
  speechText: string | null;
  operatingLevel: 'LEVEL_1_MANUAL' | 'LEVEL_2_AUTOMATIC';
  onTapCount: () => void;
  onDismissSpeech: () => void;
  containerBoundsRef: React.RefObject<HTMLDivElement | null>;
  isMuted?: boolean;
}

export const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
  count,
  mood,
  speechText,
  operatingLevel,
  onTapCount,
  onDismissSpeech,
  containerBoundsRef,
  isMuted = false
}) => {
  const [position, setPosition] = useState({ x: 230, y: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number; hasMoved: boolean }>({
    startX: 0,
    startY: 0,
    posX: 230,
    posY: 180,
    hasMoved: false
  });

  const moodInfo = MOOD_TIERS[mood];
  const scale = moodInfo.scaleFactor;

  // Handle pointer down
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
      hasMoved: false
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.hasMoved = true;
    }

    const container = containerBoundsRef.current;
    const maxX = container ? container.clientWidth - 85 : 300;
    const maxY = container ? container.clientHeight - 110 : 600;

    const nextX = Math.max(10, Math.min(maxX, dragStartRef.current.posX + dx));
    const nextY = Math.max(40, Math.min(maxY, dragStartRef.current.posY + dy));

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (ignored) {}

    // If it was just a click / tap and not a drag
    if (!dragStartRef.current.hasMoved) {
      triggerTapAction();
    } else {
      // Snap to nearest edge (left or right)
      const container = containerBoundsRef.current;
      if (container) {
        const midPoint = container.clientWidth / 2;
        const targetX = position.x < midPoint ? 14 : container.clientWidth - 88;
        setPosition(prev => ({ ...prev, x: targetX }));
      }
    }
  };

  const triggerTapAction = () => {
    if (!isMuted) {
      soundFx.playBubblePop(1 + (count % 10) * 0.05);
    }
    setShowPlusOne(true);
    setTimeout(() => setShowPlusOne(false), 700);
    onTapCount();
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
        zIndex: 50,
        transition: isDragging ? 'none' : 'left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      className="flex flex-col items-center select-none"
    >
      {/* Speech Bubble */}
      {speechText && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDismissSpeech();
          }}
          className="mb-1 max-w-[210px] bg-white text-slate-800 text-[11px] font-semibold px-3 py-1.5 rounded-2xl shadow-xl border border-pink-100 animate-in fade-in zoom-in-90 duration-200 cursor-pointer relative"
        >
          <p className="line-clamp-3 leading-tight">{speechText}</p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-pink-100 rotate-45" />
        </div>
      )}

      {/* Floating +1 Particle */}
      {showPlusOne && (
        <div className="absolute -top-7 animate-out fade-out slide-out-to-top duration-700 font-black text-amber-400 text-lg bg-slate-900/90 px-2 py-0.5 rounded-full shadow-lg pointer-events-none">
          +1
        </div>
      )}

      {/* Floating Monster Bubble */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.3s ease'
        }}
        className={`group relative p-1 rounded-full cursor-grab active:cursor-grabbing hover:brightness-105 active:scale-95 transition-all ${
          isDragging ? 'opacity-90 ring-4 ring-pink-400/40' : ''
        }`}
        title={`Reel Monster (${operatingLevel === 'LEVEL_1_MANUAL' ? 'Tap to count' : 'Auto-detect active'})`}
      >
        <MonsterCanvas mood={mood} count={count} size={68} interactive={false} />
      </div>

      {/* Level Tag under bubble */}
      <span className="mt-1 text-[9px] font-bold tracking-tight bg-slate-900/80 text-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm">
        {operatingLevel === 'LEVEL_1_MANUAL' ? 'TAP +1' : 'AUTO ⚡'}
      </span>
    </div>
  );
};
