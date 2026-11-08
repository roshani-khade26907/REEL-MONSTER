import React, { useState } from 'react';
import { Heart, MessageCircle, Send, MoreVertical, Music2, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { ReelVideo } from '../types/monster';

export const SAMPLE_INSTAGRAM_REELS: ReelVideo[] = [
  {
    id: 'ig_reel_101',
    platform: 'instagram',
    creator: 'Chef Marco',
    handle: '@marcocooks',
    avatar: '👨‍🍳',
    caption: 'Crispy Garlic Butter Potatoes! The sound at the end is pure ASMR 🤤🥔 #cooking #potatoes #recipes',
    audioTrack: 'Original Audio - Chef Marco (Viral Hit)',
    likes: '142.8K',
    comments: '1,294',
    shares: '45.2K',
    colorGradient: 'from-amber-600 via-orange-700 to-rose-900',
    tag: 'Food & Recipes',
    topic: 'Crispy Garlic Butter Potatoes ASMR'
  },
  {
    id: 'ig_reel_102',
    platform: 'instagram',
    creator: 'Pixel Tokyo',
    handle: '@tokyowalks',
    avatar: '🗼',
    caption: 'Rainy midnight in Shinjuku neon alleys. Tokyo hits different at 2 AM 🌧️✨ #travel #tokyo #japan',
    audioTrack: 'Lofi Midnight Beats - ChillVibes',
    likes: '389.1K',
    comments: '4,102',
    shares: '98.4K',
    colorGradient: 'from-purple-900 via-indigo-900 to-slate-950',
    tag: 'Travel & Urban',
    topic: 'Rainy Night In Shinjuku 4K'
  },
  {
    id: 'ig_reel_103',
    platform: 'instagram',
    creator: 'Luna The Golden',
    handle: '@lunagolden',
    avatar: '🐕',
    caption: 'She discovered the robot vacuum today. Reactions went from terror to best friendship 😂🐾 #dogs #goldenretriever',
    audioTrack: 'Funny Dog Thoughts - LunaAudio',
    likes: '892.4K',
    comments: '12.8K',
    shares: '310K',
    colorGradient: 'from-yellow-600 via-amber-700 to-stone-900',
    tag: 'Pets & Comedy',
    topic: 'Golden Retriever vs Robot Vacuum'
  },
  {
    id: 'ig_reel_104',
    platform: 'instagram',
    creator: 'Tech Desk Daily',
    handle: '@techdesk',
    avatar: '⚡',
    caption: '3 hidden Android gestures that 99% of people never know exist! Try #2 right now 📱 #androidhacks #tips',
    audioTrack: 'Cyber Funk 2077 - SynthLab',
    likes: '74.5K',
    comments: '890',
    shares: '31.2K',
    colorGradient: 'from-cyan-900 via-blue-900 to-slate-900',
    tag: 'Tech & Gadgets',
    topic: 'Top 3 Android Hidden Gestures'
  },
  {
    id: 'ig_reel_105',
    platform: 'instagram',
    creator: 'Daily Gym Grind',
    handle: '@gymdiscipline',
    avatar: '🏋️',
    caption: 'Stop doing pushups like this! Fix your elbow flare to build massive chest strength 💪 #fitness #workout',
    audioTrack: 'Phonk Gym Motivation 2026',
    likes: '210.9K',
    comments: '2,410',
    shares: '56.7K',
    colorGradient: 'from-red-900 via-rose-950 to-neutral-900',
    tag: 'Fitness & Health',
    topic: 'Perfect Pushup Form Breakdown'
  }
];

interface InstagramSimulatorProps {
  currentIndex: number;
  onNextVideo: () => void;
  onPrevVideo: () => void;
  onInteractElement: (elementName: string) => void;
}

export const InstagramSimulator: React.FC<InstagramSimulatorProps> = ({
  currentIndex,
  onNextVideo,
  onPrevVideo,
  onInteractElement
}) => {
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const reel = SAMPLE_INSTAGRAM_REELS[currentIndex % SAMPLE_INSTAGRAM_REELS.length];

  const handleLike = () => {
    setLiked(!liked);
    onInteractElement('Like Button Toggle');
  };

  const handleComments = () => {
    setCommentsOpen(!commentsOpen);
    onInteractElement('Comments Drawer Toggle');
  };

  return (
    <div className="relative w-full h-full bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Simulated Video Canvas */}
      <div className={`absolute inset-0 bg-gradient-to-br ${reel.colorGradient} flex items-center justify-center`}>
        {/* Animated Visual waves / topic preview */}
        <div className="text-center p-6 space-y-3 z-0 opacity-85">
          <div className="text-6xl animate-bounce">{reel.avatar}</div>
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-pink-300 inline-block border border-pink-500/20">
            {reel.tag}
          </div>
          <h2 className="text-lg font-bold text-white drop-shadow-md max-w-[240px] mx-auto">
            {reel.topic}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Simulating Reel Stream</span>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight">Reels</span>
          <ChevronDown className="w-4 h-4 text-white/80" />
        </div>
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-white/90" />
          <MoreVertical className="w-5 h-5 text-white/90" />
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="relative z-10 self-end mr-3 flex flex-col items-center gap-5 pb-6">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group focus:outline-none"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-125 ${liked ? 'bg-rose-500/30 text-rose-500' : 'bg-black/30 text-white'}`}>
            <Heart className={`w-7 h-7 ${liked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
          </div>
          <span className="text-[11px] font-semibold drop-shadow">{liked ? 'Liked' : reel.likes}</span>
        </button>

        {/* Comments */}
        <button
          onClick={handleComments}
          className="flex flex-col items-center gap-1 group focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white active:scale-110 transition-transform">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-semibold drop-shadow">{reel.comments}</span>
        </button>

        {/* Share */}
        <button
          onClick={() => onInteractElement('Share Button')}
          className="flex flex-col items-center gap-1 group focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white active:scale-110 transition-transform">
            <Send className="w-6 h-6 -rotate-12" />
          </div>
          <span className="text-[11px] font-semibold drop-shadow">{reel.shares}</span>
        </button>

        {/* Audio Disc */}
        <div className="w-8 h-8 rounded-full border-2 border-white/60 bg-slate-900 flex items-center justify-center animate-spin">
          <Music2 className="w-4 h-4 text-pink-400" />
        </div>
      </div>

      {/* Bottom Metadata & Controls */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm border border-white/30">
            {reel.avatar}
          </div>
          <span className="font-bold text-sm drop-shadow">{reel.handle}</span>
          <button
            onClick={() => onInteractElement('Follow Creator')}
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/60 bg-white/10 hover:bg-white/20"
          >
            Follow
          </button>
        </div>

        <p className="text-xs text-white/90 line-clamp-2 drop-shadow leading-relaxed">
          {reel.caption}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-white/80">
          <Music2 className="w-3.5 h-3.5 text-pink-400" />
          <span className="truncate max-w-[200px]">{reel.audioTrack}</span>
        </div>

        {/* Swipe Reel Navigation Bar */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <button
            onClick={onPrevVideo}
            className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white bg-white/10 px-2 py-1 rounded-md"
          >
            <ChevronUp className="w-3.5 h-3.5" /> Prev Reel
          </button>
          <span className="text-[10px] text-pink-300 font-mono font-semibold">
            Reel #{currentIndex + 1}
          </span>
          <button
            onClick={onNextVideo}
            className="flex items-center gap-1 text-[11px] text-white font-bold bg-pink-600 hover:bg-pink-500 px-3 py-1 rounded-md shadow-md animate-pulse"
          >
            Next Reel <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Comments Drawer */}
      {commentsOpen && (
        <div className="absolute inset-x-0 bottom-0 top-1/3 bg-slate-900/95 backdrop-blur-md rounded-t-2xl p-4 z-20 flex flex-col justify-between border-t border-white/20">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="font-bold text-sm">Comments ({reel.comments})</span>
              <button onClick={() => setCommentsOpen(false)} className="text-xs text-white/60 hover:text-white">
                Close ✕
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs text-white/80">
              <p><span className="font-semibold text-pink-300">@sarah_b:</span> This is why I love Reels 😂</p>
              <p><span className="font-semibold text-yellow-300">@alex_99:</span> Watching this at 3am when I have work tomorrow...</p>
              <p><span className="font-semibold text-cyan-300">@dev_kai:</span> Reel Monster is already watching you!</p>
            </div>
          </div>
          <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2 rounded">
            ℹ️ Level 2 Auto-Detection test: Toggling comments does NOT count as a new reel.
          </div>
        </div>
      )}
    </div>
  );
};
