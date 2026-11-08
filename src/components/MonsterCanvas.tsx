import React, { useState, useEffect } from 'react';
import { MoodTier } from '../types/monster';

interface MonsterCanvasProps {
  mood: MoodTier;
  count: number;
  size?: number;
  interactive?: boolean;
  isBlinking?: boolean;
  className?: string;
}

export const MonsterCanvas: React.FC<MonsterCanvasProps> = ({
  mood,
  count,
  size = 76,
  interactive = true,
  className = ''
}) => {
  const [blink, setBlink] = useState(false);
  const [bounce, setBounce] = useState(false);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3400);

    return () => clearInterval(blinkInterval);
  }, []);

  // When count changes, give a little bounce
  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 300);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div
      className={`relative select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        transform: `scale(${bounce ? 1.12 : 1})`,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-lg filter transition-all duration-300"
      >
        <defs>
          {/* Soft radiant radial gradient */}
          <radialGradient id="monsterBodyGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#FF66A6" />
            <stop offset="60%" stopColor="#FF1493" />
            <stop offset="100%" stopColor="#C71585" />
          </radialGradient>

          {/* Dramatic rage gradient for 61+ tier */}
          <radialGradient id="monsterDramaticGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF4D8D" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FF1493" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Monster Horns / Ears */}
        <path
          d="M 28 32 C 18 16 34 10 40 22 Z"
          fill="#FACC15"
          className="transition-transform duration-300 origin-center"
        />
        <path
          d="M 72 32 C 82 16 66 10 60 22 Z"
          fill="#FACC15"
          className="transition-transform duration-300 origin-center"
        />

        {/* Dramatic Flame Aura (Only in DRAMATIC tier) */}
        {mood === 'DRAMATIC' && (
          <g className="animate-pulse opacity-80">
            <path
              d="M 20 20 Q 25 5 35 15 Q 50 -2 65 15 Q 75 5 80 20 Q 95 35 88 50 Q 98 70 82 85 Q 70 100 50 92 Q 30 100 18 85 Q 2 70 12 50 Q 5 35 20 20 Z"
              fill="none"
              stroke="#FACC15"
              strokeWidth="3.5"
              strokeDasharray="4 3"
            />
          </g>
        )}

        {/* Circular Monster Body */}
        <circle
          cx="50"
          cy="52"
          r="42"
          fill={mood === 'DRAMATIC' ? 'url(#monsterDramaticGrad)' : 'url(#monsterBodyGrad)'}
          filter="url(#softGlow)"
        />

        {/* Top-light 3D highlight */}
        <ellipse
          cx="44"
          cy="24"
          rx="22"
          ry="9"
          fill="#FFFFFF"
          opacity="0.25"
        />

        {/* Cheerful Rosy Cheeks */}
        <circle cx="24" cy="56" r="6" fill="#FF80BF" opacity="0.65" />
        <circle cx="76" cy="56" r="6" fill="#FF80BF" opacity="0.65" />

        {/* Eyes & Mouth by Mood Tier */}
        {mood === 'HAPPY' && (
          <g>
            {blink ? (
              // Closed blinking happy lines
              <>
                <path d="M 28 46 Q 36 50 44 46" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 56 46 Q 64 50 72 46" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            ) : (
              // Big round sparkling eyes
              <>
                <ellipse cx="36" cy="45" rx="8" ry="10" fill="#FFFFFF" />
                <ellipse cx="64" cy="45" rx="8" ry="10" fill="#FFFFFF" />
                <ellipse cx="37" cy="46" rx="5.5" ry="7.5" fill="#0F172A" />
                <ellipse cx="65" cy="46" rx="5.5" ry="7.5" fill="#0F172A" />
                {/* Catchlights */}
                <circle cx="34" cy="42" r="2.5" fill="#FFFFFF" />
                <circle cx="38" cy="47" r="1.2" fill="#FFFFFF" />
                <circle cx="62" cy="42" r="2.5" fill="#FFFFFF" />
                <circle cx="66" cy="47" r="1.2" fill="#FFFFFF" />
              </>
            )}
            {/* Sweet wide smile */}
            <path
              d="M 38 61 Q 50 72 62 61"
              stroke="#0F172A"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {mood === 'CURIOUS' && (
          <g>
            {/* Asymmetrical curious eyes: left big, right raised */}
            <circle cx="35" cy="44" r="8.5" fill="#FFFFFF" />
            <circle cx="65" cy="41" r="7" fill="#FFFFFF" />
            <circle cx="36" cy="44" r="5" fill="#0F172A" />
            <circle cx="66" cy="41" r="4" fill="#0F172A" />
            <circle cx="34" cy="42" r="2" fill="#FFFFFF" />
            <circle cx="64" cy="39" r="1.6" fill="#FFFFFF" />
            {/* Raised eyebrow on right */}
            <path d="M 58 31 Q 66 27 72 32" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Inquisitive smirk */}
            <path d="M 40 63 Q 50 67 62 59" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {mood === 'SLEEPY' && (
          <g>
            {/* Half-closed heavy eyelids */}
            <path d="M 28 46 Q 36 41 44 46" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 56 46 Q 64 41 72 46" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Tiny sleepy open mouth / yawn */}
            <ellipse cx="50" cy="62" rx="4" ry="5.5" fill="#0F172A" />
            {/* Sleep Zzz letters floating */}
            <text x="74" y="32" fontSize="9" fontWeight="bold" fill="#38BDF8">z</text>
            <text x="81" y="24" fontSize="11" fontWeight="bold" fill="#38BDF8">Z</text>
          </g>
        )}

        {mood === 'TIRED' && (
          <g>
            {/* Slanted tired lines */}
            <line x1="28" y1="42" x2="44" y2="48" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
            <line x1="72" y1="42" x2="56" y2="48" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
            {/* Sweat drop on forehead */}
            <path d="M 22 36 Q 20 42 24 44 Q 27 42 25 36 Z" fill="#38BDF8" />
            {/* Wavy tired mouth */}
            <path d="M 38 64 Q 44 59 50 64 Q 56 69 62 64" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        )}

        {mood === 'EXHAUSTED' && (
          <g>
            {/* X eyes */}
            <line x1="30" y1="39" x2="42" y2="51" stroke="#0F172A" strokeWidth="3.8" strokeLinecap="round" />
            <line x1="42" y1="39" x2="30" y2="51" stroke="#0F172A" strokeWidth="3.8" strokeLinecap="round" />
            <line x1="58" y1="39" x2="70" y2="51" stroke="#0F172A" strokeWidth="3.8" strokeLinecap="round" />
            <line x1="70" y1="39" x2="58" y2="51" stroke="#0F172A" strokeWidth="3.8" strokeLinecap="round" />
            {/* Open mouth with pink tongue lolling */}
            <path d="M 42 61 Q 50 56 58 61 Q 50 72 42 61 Z" fill="#0F172A" />
            <ellipse cx="50" cy="67" rx="4.5" ry="5.5" fill="#FF69B4" />
          </g>
        )}

        {mood === 'DRAMATIC' && (
          <g>
            {/* Yellow glowing eyes with fiery red centers */}
            <circle cx="36" cy="44" r="9" fill="#FACC15" />
            <circle cx="64" cy="44" r="9" fill="#FACC15" />
            <circle cx="36" cy="44" r="4.5" fill="#DC2626" />
            <circle cx="64" cy="44" r="4.5" fill="#DC2626" />
            {/* Angry / dramatic brow lines */}
            <line x1="28" y1="33" x2="44" y2="39" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="72" y1="33" x2="56" y2="39" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            {/* Wide screaming mouth with vampire fangs */}
            <path
              d="M 36 60 Q 50 78 64 60 Z"
              fill="#0F172A"
            />
            {/* Left tooth */}
            <polygon points="41,60 44,66 47,60" fill="#FFFFFF" />
            {/* Right tooth */}
            <polygon points="53,60 56,66 59,60" fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* Floating Counter Badge */}
      <div
        className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-yellow-400 font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center justify-center min-w-[24px]"
      >
        {count}
      </div>
    </div>
  );
};
