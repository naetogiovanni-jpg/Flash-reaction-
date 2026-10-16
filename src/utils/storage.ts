import { PlayerRecords, GameSettings, SessionResult, GameMode, SkinId } from '../types/game';

const RECORDS_KEY = 'flash_reaction_records_v1';
const SETTINGS_KEY = 'flash_reaction_settings_v1';

const defaultModeStats = {
  fastestSingle: null,
  bestAverage: null,
  testsCompleted: 0,
};

export const defaultRecords: PlayerRecords = {
  overallFastest: null,
  overallBestAverage: null,
  totalTestsCompleted: 0,
  classic: { ...defaultModeStats },
  color: { ...defaultModeStats },
  direction: { ...defaultModeStats },
  hardcore: { ...defaultModeStats },
  equippedSkin: 'volt_katana',
  unlockedSkins: ['volt_katana'],
  recentSessions: [],
};

export const defaultSettings: GameSettings = {
  soundEnabled: true,
  volume: 0.6,
  animationIntensity: 'full',
  reducedMotion: false,
  hapticsEnabled: true,
};

export function loadRecords(): PlayerRecords {
  if (typeof window === 'undefined') return defaultRecords;
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return defaultRecords;
    const parsed = JSON.parse(raw);
    const unlocked = Array.isArray(parsed.unlockedSkins) && parsed.unlockedSkins.length > 0
      ? parsed.unlockedSkins
      : ['volt_katana'];

    return {
      ...defaultRecords,
      ...parsed,
      classic: { ...defaultModeStats, ...(parsed.classic || {}) },
      color: { ...defaultModeStats, ...(parsed.color || {}) },
      direction: { ...defaultModeStats, ...(parsed.direction || {}) },
      hardcore: { ...defaultModeStats, ...(parsed.hardcore || {}) },
      equippedSkin: parsed.equippedSkin || 'volt_katana',
      unlockedSkins: unlocked,
      recentSessions: Array.isArray(parsed.recentSessions) ? parsed.recentSessions : [],
    };
  } catch {
    return defaultRecords;
  }
}

export function saveSessionRecords(
  session: SessionResult,
  newlyUnlockedSkins: SkinId[] = []
): PlayerRecords {
  const current = loadRecords();
  const modeKey = session.mode as GameMode;
  const modeStat = current[modeKey] || { ...defaultModeStats };

  // Update mode stats
  const newModeFastest =
    modeStat.fastestSingle === null
      ? session.fastestMs
      : Math.min(modeStat.fastestSingle, session.fastestMs);

  const newModeBestAvg =
    modeStat.bestAverage === null
      ? session.averageMs
      : Math.min(modeStat.bestAverage, session.averageMs);

  const updatedModeStat = {
    fastestSingle: newModeFastest,
    bestAverage: newModeBestAvg,
    testsCompleted: modeStat.testsCompleted + 1,
  };

  // Update overall
  const newOverallFastest =
    current.overallFastest === null
      ? session.fastestMs
      : Math.min(current.overallFastest, session.fastestMs);

  const newOverallBestAvg =
    current.overallBestAverage === null
      ? session.averageMs
      : Math.min(current.overallBestAverage, session.averageMs);

  // Merge unlocked skins
  const unlockedSet = new Set<SkinId>(current.unlockedSkins || ['volt_katana']);
  newlyUnlockedSkins.forEach((id) => unlockedSet.add(id));
  const finalUnlocked = Array.from(unlockedSet);

  const newRecentSessions = [
    {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: session.timestamp,
      mode: session.mode,
      averageMs: session.averageMs,
      fastestMs: session.fastestMs,
      rating: session.overallRating,
    },
    ...current.recentSessions,
  ].slice(0, 10);

  const updated: PlayerRecords = {
    ...current,
    overallFastest: newOverallFastest,
    overallBestAverage: newOverallBestAvg,
    totalTestsCompleted: current.totalTestsCompleted + 1,
    [modeKey]: updatedModeStat,
    unlockedSkins: finalUnlocked,
    recentSessions: newRecentSessions,
  };

  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  return updated;
}

export function equipSkinInRecords(skinId: SkinId): PlayerRecords {
  const current = loadRecords();
  const updated: PlayerRecords = {
    ...current,
    equippedSkin: skinId,
  };
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function resetAllRecords(): PlayerRecords {
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch {
    // Ignore
  }
  return defaultRecords;
}

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}
