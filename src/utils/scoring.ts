import { ReactionRating, RankTier, RoundRecord, SessionResult, GameMode } from '../types/game';

export interface RatingDetails {
  rating: ReactionRating;
  rank: RankTier;
  title: string;
  description: string;
  colorHex: string;
  badgeBg: string;
  badgeBorder: string;
  glowClass: string;
}

export function getRatingDetails(ms: number): RatingDetails {
  if (ms < 180) {
    return {
      rating: 'INSANE',
      rank: 'S',
      title: 'GODSPEED REFLEX',
      description: 'Transcendent superhuman instinct. Lightning reaction timing.',
      colorHex: '#38BDF8', // Cyan 400
      badgeBg: 'bg-cyan-950/60',
      badgeBorder: 'border-cyan-400',
      glowClass: 'shadow-[0_0_25px_rgba(56,189,248,0.5)]',
    };
  }
  if (ms <= 219) {
    return {
      rating: 'EXCELLENT',
      rank: 'A',
      title: 'LIGHTNING CUT',
      description: 'Elite martial reflexes. Clean, razor-sharp trigger speed.',
      colorHex: '#818CF8', // Indigo 400
      badgeBg: 'bg-indigo-950/60',
      badgeBorder: 'border-indigo-400',
      glowClass: 'shadow-[0_0_20px_rgba(129,140,248,0.45)]',
    };
  }
  if (ms <= 269) {
    return {
      rating: 'FAST',
      rank: 'B',
      title: 'BLADE TEMPO',
      description: 'Swift and disciplined. Comfortably above average human response.',
      colorHex: '#34D399', // Emerald 400
      badgeBg: 'bg-emerald-950/60',
      badgeBorder: 'border-emerald-400',
      glowClass: 'shadow-[0_0_15px_rgba(52,211,153,0.35)]',
    };
  }
  if (ms <= 329) {
    return {
      rating: 'GOOD',
      rank: 'C',
      title: 'STEADY FOCUS',
      description: 'Solid situational awareness with dependable rhythm.',
      colorHex: '#FBBF24', // Amber 400
      badgeBg: 'bg-amber-950/60',
      badgeBorder: 'border-amber-400',
      glowClass: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    };
  }
  if (ms <= 399) {
    return {
      rating: 'AVERAGE',
      rank: 'D',
      title: 'NEUTRAL DRIFT',
      description: 'Typical human reflex range. Warm up and sharpen your focus.',
      colorHex: '#FB923C', // Orange 400
      badgeBg: 'bg-orange-950/60',
      badgeBorder: 'border-orange-400',
      glowClass: 'shadow-[0_0_12px_rgba(251,146,60,0.3)]',
    };
  }
  return {
    rating: 'KEEP_TRAINING',
    rank: 'E',
    title: 'AWAKENING',
    description: 'Delayed response. Rest your eyes, take a breath, and strike again.',
    colorHex: '#F87171', // Red 400
    badgeBg: 'bg-red-950/60',
    badgeBorder: 'border-red-400',
    glowClass: 'shadow-[0_0_12px_rgba(248,113,113,0.3)]',
  };
}

export function calculateSessionResult(
  mode: GameMode,
  rounds: RoundRecord[],
  falseStarts: number,
  existingBestAverage: number | null,
  existingFastestSingle: number | null
): SessionResult {
  const times = rounds.map((r) => r.reactionTimeMs);
  const sum = times.reduce((acc, t) => acc + t, 0);
  const averageMs = times.length > 0 ? Number((sum / times.length).toFixed(1)) : 0;
  const fastestMs = times.length > 0 ? Math.min(...times) : 0;
  const slowestMs = times.length > 0 ? Math.max(...times) : 0;

  const ratingDetails = getRatingDetails(averageMs);

  const isNewBestAverage =
    existingBestAverage === null || averageMs < existingBestAverage;
  const isNewFastestSingle =
    existingFastestSingle === null || fastestMs < existingFastestSingle;

  return {
    mode,
    rounds,
    averageMs,
    fastestMs,
    slowestMs,
    falseStarts,
    overallRating: ratingDetails.rating,
    rankTier: ratingDetails.rank,
    timestamp: Date.now(),
    isNewBestAverage,
    isNewFastestSingle,
  };
}
