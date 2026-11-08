export type OperatingLevel = 'LEVEL_1_MANUAL' | 'LEVEL_2_AUTOMATIC';

export type MoodTier = 'HAPPY' | 'CURIOUS' | 'SLEEPY' | 'TIRED' | 'EXHAUSTED' | 'DRAMATIC';

export interface MonsterMoodInfo {
  tier: MoodTier;
  tierName: string;
  minCount: number;
  maxCount: number;
  scaleFactor: number;
  description: string;
  tagline: string;
}

export interface DailyStats {
  dateString: string;
  totalReels: number;
  instagramCount: number;
  youtubeShortsCount: number;
  manualIncrements: number;
  autoDetections: number;
  estimatedUsageMinutes: number;
}

export interface ReelVideo {
  id: string;
  platform: 'instagram' | 'youtube';
  creator: string;
  handle: string;
  avatar: string;
  caption: string;
  audioTrack: string;
  likes: string;
  comments: string;
  shares: string;
  colorGradient: string;
  tag: string;
  topic: string;
}

export interface DetectionLogEvent {
  id: string;
  timestamp: string;
  platform: 'instagram' | 'youtube' | 'manual';
  action: 'NEW_VIDEO_DETECTED' | 'EVENT_SUPPRESSED' | 'COOLDOWN_ACTIVE' | 'MANUAL_COUNT';
  reason: string;
  countAfter: number;
}

export interface AcceptanceTest {
  id: number;
  name: string;
  objective: string;
  expected: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  details?: string;
}
