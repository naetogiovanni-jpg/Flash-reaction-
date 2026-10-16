import { CustomSkin, SkinId, PlayerRecords, SessionResult } from '../types/game';

export const SKINS_CATALOG: CustomSkin[] = [
  {
    id: 'volt_katana',
    name: 'Volt Katana',
    tagline: 'High-voltage electric cyan katana. Precision cyber reflex blade.',
    primaryColor: '#06B6D4',
    secondaryColor: '#38BDF8',
    accentGlow: 'rgba(6, 182, 212, 0.7)',
    borderClass: 'border-cyan-400',
    bgGlowClass: 'shadow-[0_0_50px_rgba(6,182,212,0.6)]',
    unlockRequirement: 'Unlocked by default',
    unlockedByDefault: true,
  },
  {
    id: 'crimson_oni',
    name: 'Crimson Oni',
    tagline: 'Demonic blood-moon edge forged for savage reaction timing.',
    primaryColor: '#EF4444',
    secondaryColor: '#F87171',
    accentGlow: 'rgba(239, 68, 68, 0.7)',
    borderClass: 'border-red-500',
    bgGlowClass: 'shadow-[0_0_50px_rgba(239,68,68,0.6)]',
    unlockRequirement: 'Achieve Rank A or better in any test',
  },
  {
    id: 'amaterasu_gold',
    name: 'Amaterasu Gold',
    tagline: 'Sacred golden sun flame reserved for supreme reflex masters.',
    primaryColor: '#F59E0B',
    secondaryColor: '#FBBF24',
    accentGlow: 'rgba(245, 158, 11, 0.8)',
    borderClass: 'border-amber-400',
    bgGlowClass: 'shadow-[0_0_50px_rgba(245,158,11,0.6)]',
    unlockRequirement: 'Clear all 5 rounds of Hardcore Mode',
  },
  {
    id: 'abyssal_shadow',
    name: 'Abyssal Shadow',
    tagline: 'Phantom violet void that bends visual perception.',
    primaryColor: '#A855F7',
    secondaryColor: '#C084FC',
    accentGlow: 'rgba(168, 85, 247, 0.7)',
    borderClass: 'border-purple-400',
    bgGlowClass: 'shadow-[0_0_50px_rgba(168,85,247,0.6)]',
    unlockRequirement: 'Complete at least 5 full reflex tests',
  },
  {
    id: 'absolute_zero',
    name: 'Absolute Zero',
    tagline: 'Sub-zero glacial crystal cutting at speed-of-light velocity.',
    primaryColor: '#38BDF8',
    secondaryColor: '#BAE6FD',
    accentGlow: 'rgba(56, 189, 248, 0.8)',
    borderClass: 'border-sky-400',
    bgGlowClass: 'shadow-[0_0_50px_rgba(56,189,248,0.6)]',
    unlockRequirement: 'Hit a single reaction time under 200 ms',
  },
  {
    id: 'hyper_tokyo',
    name: 'Hyper Tokyo',
    tagline: 'Neon magenta cyber-pulse from the city underbelly.',
    primaryColor: '#EC4899',
    secondaryColor: '#F472B6',
    accentGlow: 'rgba(236, 72, 153, 0.7)',
    borderClass: 'border-pink-500',
    bgGlowClass: 'shadow-[0_0_50px_rgba(236,72,153,0.6)]',
    unlockRequirement: 'Score S-Rank or complete 8 total tests',
  },
];

export function getSkin(id: SkinId): CustomSkin {
  return SKINS_CATALOG.find((s) => s.id === id) || SKINS_CATALOG[0];
}

export function checkNewUnlockedSkins(
  session: SessionResult,
  records: PlayerRecords
): SkinId[] {
  const currentUnlocked = new Set<SkinId>(records.unlockedSkins || ['volt_katana']);
  const newlyUnlocked: SkinId[] = [];

  // 1. Crimson Oni: Rank A or S
  if (!currentUnlocked.has('crimson_oni')) {
    if (session.rankTier === 'A' || session.rankTier === 'S') {
      newlyUnlocked.push('crimson_oni');
    }
  }

  // 2. Amaterasu Gold: Clear all 5 rounds of Hardcore mode
  if (!currentUnlocked.has('amaterasu_gold')) {
    if (session.mode === 'hardcore' && session.rounds.length >= 5) {
      newlyUnlocked.push('amaterasu_gold');
    }
  }

  // 3. Abyssal Shadow: 5 total tests completed
  if (!currentUnlocked.has('abyssal_shadow')) {
    if (records.totalTestsCompleted + 1 >= 5) {
      newlyUnlocked.push('abyssal_shadow');
    }
  }

  // 4. Absolute Zero: Single reaction < 200 ms
  if (!currentUnlocked.has('absolute_zero')) {
    const hasSub200 = session.rounds.some((r) => r.reactionTimeMs < 200);
    if (hasSub200 || (records.overallFastest !== null && records.overallFastest < 200)) {
      newlyUnlocked.push('absolute_zero');
    }
  }

  // 5. Hyper Tokyo: S-Rank or >= 8 total tests
  if (!currentUnlocked.has('hyper_tokyo')) {
    if (session.rankTier === 'S' || records.totalTestsCompleted + 1 >= 8) {
      newlyUnlocked.push('hyper_tokyo');
    }
  }

  return newlyUnlocked;
}
