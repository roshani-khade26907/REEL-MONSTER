import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Disc3, ChevronDown, ChevronUp } from 'lucide-react';
import { ReelVideo } from '../types/monster';

export const SAMPLE_YOUTUBE_SHORTS: ReelVideo[] = [
  {
    id: 'yt_short_201',
    platform: 'youtube',
    creator: 'Veritasium Shorts',
    handle: '@veritasium_shorts',
    avatar: '🔬',
    caption: 'Why do golf balls have dimples? The physics will blow your mind ⛳🌀 #science #physics #learn',
    audioTrack: 'Original Sound - Veritasium Labs',
    likes: '620K',
    comments: '4,890',
    shares: '82K',
    colorGradient: 'from-blue-900 via-indigo-950 to-neutral-950',
    tag: 'Science & Education',
    topic: 'Aerodynamics of Dimpled Golf Balls'
  },
  {
    id: 'yt_short_202',
    platform: 'youtube',
    creator: 'Retro Gaming Vault',
    handle: '@retrovault',
    avatar: '🎮',
    caption: 'This GameBoy glitch took 25 years to uncover! Watch what happens when you press Select 🕹️👾 #gaming',
    audioTrack: '8-Bit Nostalgia Memories',
    likes: '410K',
    comments: '3,210',
    shares: '48K',
    colorGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    tag: 'Gaming & Easter Eggs',
    topic: 'Unsolved 1998 GameBoy Glitch Found'
  },
  {
    id: 'yt_short_203',
    platform: 'youtube',
    creator: 'MrBeast Shorts',
    handle: '@mrbeastshorts',
    avatar: '🏆',
    caption: 'I gave a random person 10,000 pennies if they could stack them in 60 seconds! 🪙⏱️ #challenge #mrbeast',
    audioTrack: 'High Voltage Beast Beat',
    likes: '1.9M',
    comments: '18.4K',
    shares: '142K',
    colorGradient: 'from-amber-800 via-yellow-950 to-stone-950',
    tag: 'Entertainment & Stunts',
    topic: '10,000 Pennies Speed Stack Challenge'
  },
  {
    id: 'yt_short_204',
    platform: 'youtube',
    creator: 'Woodworking Magic',
    handle: '@woodartisan',
    avatar: '🪵',
    caption: 'Satisfying Japanese joinery! No nails, no glue, pure master precision 🔨✨ #woodworking #craftsman',
    audioTrack: 'Natural Wood Chisel ASMR',
    likes: '850K',
    comments: '7,430',
    shares: '95K',
    colorGradient: 'from-stone-800 via-stone-900 to-neutral-950',
    tag: 'Crafts & DIY',
    topic: 'Traditional Japanese Joinery Art'
  }
];

interface YouTubeShortsSimulatorProps {
  currentIndex: number;
  onNextVideo: () => void;
  onPrevVideo: () => void;
  onInteractElement: (elementName: string) => void;
}

export const YouTubeShortsSimulator: React.FC<YouTubeShortsSimulatorProps> = ({
  currentIndex,
  onNextVideo,
  onPrevVideo,
  onInteractElement
}) => {
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const short = SAMPLE_YOUTUBE_SHORTS[currentIndex % SAMPLE_YOUTUBE_SHORTS.length];

  const handleLike = () => {
    setLiked(!liked);
    onInteractElement('YouTube Like Button');
  };

  const handleSubscribe = () => {
    setSubscribed(!subscribed);
    onInteractElement('Channel Subscribe Button');
  };

  return (
    <div className="relative w-full h-full bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background Simulated Video Canvas */}
      <div className={`absolute inset-0 bg-gradient-to-br ${short.colorGradient} flex items-center justify-center`}>
        <div className="text-center p-6 space-y-3 z-0 opacity-85">
          <div className="text-6xl animate-bounce">{short.avatar}</div>
          <div className="bg-red-600/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-red-300 inline-block border border-red-500/30">
            {short.tag}
          </div>
          <h2 className="text-lg font-bold text-white drop-shadow-md max-w-[240px] mx-auto">
            {short.topic}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Simulating Shorts Stream</span>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-1.5">
          <div className="bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded">
            SHORTS
          </div>
          <span className="font-bold text-sm tracking-tight">YouTube</span>
        </div>
        <div className="flex items-center gap-3">
          <MoreVertical className="w-5 h-5 text-white/90" />
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="relative z-10 self-end mr-3 flex flex-col items-center gap-4 pb-4">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group focus:outline-none"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-125 ${liked ? 'bg-red-600/40 text-red-400' : 'bg-black/40 text-white'}`}>
            <ThumbsUp className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold drop-shadow">{liked ? 'Liked' : short.likes}</span>
        </button>

        {/* Dislike */}
        <button
          onClick={() => onInteractElement('Dislike Button')}
          className="flex flex-col items-center gap-1 group focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white active:scale-110">
            <ThumbsDown className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold drop-shadow">Dislike</span>
        </button>

        {/* Comments */}
        <button
          onClick={() => onInteractElement('Comments Drawer')}
          className="flex flex-col items-center gap-1 group focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white active:scale-110">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold drop-shadow">{short.comments}</span>
        </button>

        {/* Share */}
        <button
          onClick={() => onInteractElement('Share Button')}
          className="flex flex-col items-center gap-1 group focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white active:scale-110">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-semibold drop-shadow">{short.shares}</span>
        </button>

        {/* Sound Disc */}
        <div className="w-8 h-8 rounded-full border-2 border-red-500/80 bg-slate-900 flex items-center justify-center animate-spin">
          <Disc3 className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* Bottom Metadata & Controls */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600/30 flex items-center justify-center text-sm border border-red-500/40">
            {short.avatar}
          </div>
          <span className="font-bold text-sm drop-shadow">{short.handle}</span>
          <button
            onClick={handleSubscribe}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              subscribed ? 'bg-white/20 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
            }`}
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        <p className="text-xs text-white/90 line-clamp-2 drop-shadow leading-relaxed">
          {short.caption}
        </p>

        {/* Swipe Shorts Navigation Bar */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <button
            onClick={onPrevVideo}
            className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white bg-white/10 px-2 py-1 rounded-md"
          >
            <ChevronUp className="w-3.5 h-3.5" /> Prev Short
          </button>
          <span className="text-[10px] text-red-400 font-mono font-semibold">
            Short #{currentIndex + 1}
          </span>
          <button
            onClick={onNextVideo}
            className="flex items-center gap-1 text-[11px] text-white font-bold bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md shadow-md animate-pulse"
          >
            Next Short <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
