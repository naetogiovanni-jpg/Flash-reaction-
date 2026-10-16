export type GameMode = 'classic' | 'color' | 'direction' | 'hardcore';

export type GameState =
  | 'MENU'
  | 'OPEN_WORLD'
  | 'READY'
  | 'WAITING'
  | 'SIGNAL_ACTIVE'
  | 'ROUND_RESULT'
  | 'FALSE_START'
  | 'TIMEOUT_FAIL'
  | 'FINAL_RESULTS';

export type DirectionType = 'up' | 'down' | 'left' | 'right';

export type ColorCueType = 'cyan_strike' | 'red_hold';

export type ActionPrompt = 'strike' | 'dodge';

export type ReactionRating =
  | 'INSANE'
  | 'EXCELLENT'
  | 'FAST'
  | 'GOOD'
  | 'AVERAGE'
  | 'KEEP_TRAINING';

export type RankTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface RoundRecord {
  roundNumber: number;
  reactionTimeMs: number;
  rating: ReactionRating;
  mode: GameMode;
  targetDirection?: DirectionType;
  colorCue?: ColorCueType;
  actionRequired?: ActionPrompt;
  timeLimitMs?: number;
  wasDodgeSuccess?: boolean;
}

export interface SessionResult {
  mode: GameMode;
  rounds: RoundRecord[];
  averageMs: number;
  fastestMs: number;
  slowestMs: number;
  falseStarts: number;
  overallRating: ReactionRating;
  rankTier: RankTier;
  timestamp: number;
  isNewBestAverage: boolean;
  isNewFastestSingle: boolean;
  unlockedSkinIds?: SkinId[];
}

export interface ModeStats {
  fastestSingle: number | null;
  bestAverage: number | null;
  testsCompleted: number;
}

export type SkinId =
  | 'volt_katana'
  | 'crimson_oni'
  | 'amaterasu_gold'
  | 'abyssal_shadow'
  | 'absolute_zero'
  | 'hyper_tokyo';

export interface CustomSkin {
  id: SkinId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentGlow: string;
  borderClass: string;
  bgGlowClass: string;
  unlockRequirement: string;
  unlockedByDefault?: boolean;
}

export interface PlayerRecords {
  overallFastest: number | null;
  overallBestAverage: number | null;
  totalTestsCompleted: number;
  classic: ModeStats;
  color: ModeStats;
  direction: ModeStats;
  hardcore: ModeStats;
  equippedSkin: SkinId;
  unlockedSkins: SkinId[];
  recentSessions: Array<{
    id: string;
    timestamp: number;
    mode: GameMode;
    averageMs: number;
    fastestMs: number;
    rating: string;
  }>;
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number;
  animationIntensity: 'full' | 'reduced';
  reducedMotion: boolean;
  hapticsEnabled: boolean;
}
