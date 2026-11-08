import { MoodTier, MonsterMoodInfo } from '../types/monster';

export const MOOD_TIERS: Record<MoodTier, MonsterMoodInfo> = {
  HAPPY: {
    tier: 'HAPPY',
    tierName: 'Happy & Energetic',
    minCount: 0,
    maxCount: 5,
    scaleFactor: 1.0,
    description: 'Bouncing cheerfully, enjoying the quick break!',
    tagline: 'Fresh and energized ☀️'
  },
  CURIOUS: {
    tier: 'CURIOUS',
    tierName: 'Curious',
    minCount: 6,
    maxCount: 10,
    scaleFactor: 1.08,
    description: "Noticing you're scrolling a bit more...",
    tagline: 'Keeping both eyes wide open 👀'
  },
  SLEEPY: {
    tier: 'SLEEPY',
    tierName: 'Sleepy',
    minCount: 11,
    maxCount: 20,
    scaleFactor: 1.16,
    description: 'Droopy eyelids, tiny yawns, wondering when you sleep.',
    tagline: 'Bedtime was negotiable anyway... 🥱'
  },
  TIRED: {
    tier: 'TIRED',
    tierName: 'Tired & Dramatic',
    minCount: 21,
    maxCount: 40,
    scaleFactor: 1.25,
    description: 'Slumped shoulders and deep dramatic sighs.',
    tagline: 'Even monsters need a break 💦'
  },
  EXHAUSTED: {
    tier: 'EXHAUSTED',
    tierName: 'Completely Exhausted',
    minCount: 41,
    maxCount: 60,
    scaleFactor: 1.34,
    description: 'Spiraling eyes, tongue sticking out, losing sanity.',
    tagline: 'Homework has filed a formal complaint 😵'
  },
  DRAMATIC: {
    tier: 'DRAMATIC',
    tierName: 'Extremely Dramatic',
    minCount: 61,
    maxCount: 999999,
    scaleFactor: 1.45,
    description: 'Existential crisis mode: "WHY ARE WE STILL SCROLLING?!"',
    tagline: 'SHOULD I START CHARGING RENT?! 🔥'
  }
};

export const TIER_DIALOGUES: Record<MoodTier, string[]> = {
  HAPPY: [
    'Just one? I totally believe you.',
    'That was a quick little break!',
    'Just a taste of the algorithmic soup.',
    'Fresh and energized! Still productive.',
    'One reel never hurt anybody... right?'
  ],
  CURIOUS: [
    'Are we still taking a "quick" break?',
    'Double digits are peeking around the corner!',
    'Curious algorithm choice right there.',
    "Wait, didn't you open this app for 30 seconds?",
    "I'm keeping my eyes wide open on you."
  ],
  SLEEPY: [
    'Your evening has officially started disappearing.',
    '*Yaaaawn*... my tiny monster eyelids are heavy.',
    "Twenty videos... that's like a whole episode of a show!",
    'Is that someone laughing, or my sleep schedule fading?',
    'Did you remember to drink water today?'
  ],
  TIRED: [
    'Even I need a break now.',
    'My tiny monster legs cannot carry this much scrolling.',
    'Your to-do list just sent a missing person report.',
    'Thirty reels! Your thumb must have six-pack abs.',
    'The dopamine is flowing, but my battery is draining.'
  ],
  EXHAUSTED: [
    'Your homework is officially filing a complaint.',
    'I have forgotten what sunlight looks like.',
    'Fifty reels! You could have learned conversational French.',
    "I'm melting into your screen.",
    'Are we trapped in a digital wormhole?'
  ],
  DRAMATIC: [
    'Should I start charging rent on this screen?',
    'WE ARE TRANSCENDING TIME AND SPACE.',
    "At this rate, I'm taking over your phone contract.",
    "Your ancestors didn't invent agriculture for this.",
    'SEVENTY-FIVE REELS?! Call NASA, you are orbiting earth.'
  ]
};

export function getMoodForCount(count: number): MonsterMoodInfo {
  if (count <= 5) return MOOD_TIERS.HAPPY;
  if (count <= 10) return MOOD_TIERS.CURIOUS;
  if (count <= 20) return MOOD_TIERS.SLEEPY;
  if (count <= 40) return MOOD_TIERS.TIRED;
  if (count <= 60) return MOOD_TIERS.EXHAUSTED;
  return MOOD_TIERS.DRAMATIC;
}

export function getRandomDialogue(tier: MoodTier): string {
  const list = TIER_DIALOGUES[tier] || TIER_DIALOGUES.HAPPY;
  return list[Math.floor(Math.random() * list.length)];
}
