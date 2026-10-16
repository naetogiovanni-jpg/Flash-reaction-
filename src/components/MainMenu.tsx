import React from 'react';
import { Play, HelpCircle, Settings as SettingsIcon, Zap, Compass, Palette, Flame, Shield, Sparkles } from 'lucide-react';
import { GameMode, PlayerRecords } from '../types/game';
import { getRatingDetails } from '../utils/scoring';
import { getSkin } from '../utils/skins';

interface MainMenuProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenArmory: () => void;
  onOpenWorld: () => void;
  records: PlayerRecords;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenArmory,
  onOpenWorld,
  records,
}) => {
  const currentModeStats = records[selectedMode] || {
    fastestSingle: null,
    bestAverage: null,
    testsCompleted: 0,
  };
  const bestAvgDetails =
    currentModeStats.bestAverage !== null ? getRatingDetails(currentModeStats.bestAverage) : null;
  const fastestDetails =
    currentModeStats.fastestSingle !== null ? getRatingDetails(currentModeStats.fastestSingle) : null;

  const equippedSkin = getSkin(records.equippedSkin);

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center text-center">
      {/* Anime Accent Line */}
      <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 mb-6 rounded-full" />

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-display mb-3 text-balance">
        FLASH <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">REACTION</span>
      </h1>

      <p className="text-base sm:text-lg text-neutral-300 font-medium tracking-wide mb-1">
        Your instincts. Your timing. Your score.
      </p>

      <p className="text-xs sm:text-sm text-cyan-400/90 font-mono tracking-wider mb-6 uppercase">
        How fast can you react?
      </p>

      {/* Equipped Skin Pill Button */}
      <button
        onClick={onOpenArmory}
        className="mb-8 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border hover:bg-neutral-850 flex items-center gap-2 text-xs transition-all duration-200 cursor-pointer shadow-lg group"
        style={{ borderColor: `${equippedSkin.primaryColor}60` }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: equippedSkin.primaryColor, boxShadow: `0 0 8px ${equippedSkin.primaryColor}` }}
        />
        <span className="text-neutral-400">Blade Aura:</span>
        <span className="font-bold font-display" style={{ color: equippedSkin.primaryColor }}>
          {equippedSkin.name}
        </span>
        <span className="text-[10px] text-neutral-500 group-hover:text-cyan-400 ml-1">Change Skin →</span>
      </button>

      {/* Mode Selector Tabs (4 Modes) */}
      <div className="w-full max-w-2xl mb-6 p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-1">
        <button
          onClick={() => onSelectMode('classic')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedMode === 'classic'
              ? 'bg-neutral-800 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] border border-cyan-500/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Classic</span>
        </button>

        <button
          onClick={() => onSelectMode('color')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedMode === 'color'
              ? 'bg-neutral-800 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] border border-cyan-500/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Colour</span>
        </button>

        <button
          onClick={() => onSelectMode('direction')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedMode === 'direction'
              ? 'bg-neutral-800 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] border border-cyan-500/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Direction</span>
        </button>

        <button
          onClick={() => onSelectMode('hardcore')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedMode === 'hardcore'
              ? 'bg-red-950/70 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.35)] border border-red-500/60 font-bold'
              : 'text-red-400/80 hover:text-red-300 hover:bg-red-950/20'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          <span className="whitespace-nowrap">Hardcore</span>
        </button>
      </div>

      {/* Mode Briefing Line */}
      <div className="text-xs text-neutral-400 max-w-lg mb-8 px-4 py-2.5 border border-neutral-800/80 bg-neutral-900/40 rounded-xl">
        {selectedMode === 'classic' && (
          <span>Classic 5-round speed test. Wait for the signal and strike instantly.</span>
        )}
        {selectedMode === 'color' && (
          <span>Discrimination reflex. Strike only on Electric Cyan. Do NOT react to Crimson Red traps!</span>
        )}
        {selectedMode === 'direction' && (
          <span>Directional reflex. Strike the corresponding arrow (← ↑ → ↓) as soon as it flashes.</span>
        )}
        {selectedMode === 'hardcore' && (
          <span className="text-red-300">
            <strong className="text-red-400">HARDCORE MODE:</strong> Rapid 550ms–1600ms delays, shrinking reaction windows (360ms $\rightarrow$ 200ms), and lethal hazard slashes requiring instant DODGES!
          </span>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full max-w-lg justify-center">
        {/* START TEST button */}
        <div className="relative group w-full sm:w-auto sm:flex-1">
          <div
            className={`absolute -inset-1 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse-glow ${
              selectedMode === 'hardcore'
                ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500'
            }`}
          />
          <button
            onClick={onStartGame}
            className={`relative w-full py-4 px-6 bg-neutral-950 text-white font-display font-extrabold text-base sm:text-lg tracking-wider rounded-xl border transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer ${
              selectedMode === 'hardcore'
                ? 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:bg-red-950/40'
                : 'border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-neutral-900'
            }`}
          >
            <Play
              className={`w-5 h-5 ${
                selectedMode === 'hardcore' ? 'fill-red-400 text-red-400' : 'fill-cyan-400 text-cyan-400'
              }`}
            />
            <span>START TEST</span>
          </button>
        </div>

        {/* ENTER 3D OPEN WORLD button */}
        <div className="relative group w-full sm:w-auto sm:flex-1">
          <button
            onClick={onOpenWorld}
            className="w-full py-4 px-6 bg-neutral-900/90 hover:bg-neutral-850 text-white font-display font-bold text-base sm:text-lg tracking-wider rounded-xl border border-cyan-500/50 hover:border-cyan-400 transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>3D OPEN WORLD</span>
          </button>
        </div>
      </div>

      {/* Personal Best Telemetry Cards */}
      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <div className="text-xs text-neutral-400 mb-1">Fastest Single</div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {currentModeStats.fastestSingle !== null ? (
              <>
                {currentModeStats.fastestSingle}{' '}
                <span className="text-xs font-normal text-neutral-400">ms</span>
              </>
            ) : (
              <span className="text-neutral-600 text-lg font-normal">-- ms</span>
            )}
          </div>
          {fastestDetails && (
            <div className="text-xs font-medium mt-1" style={{ color: fastestDetails.colorHex }}>
              Rank {fastestDetails.rank} · {fastestDetails.rating}
            </div>
          )}
        </div>

        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <div className="text-xs text-neutral-400 mb-1">Best Average (5 Rds)</div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {currentModeStats.bestAverage !== null ? (
              <>
                {currentModeStats.bestAverage}{' '}
                <span className="text-xs font-normal text-neutral-400">ms</span>
              </>
            ) : (
              <span className="text-neutral-600 text-lg font-normal">-- ms</span>
            )}
          </div>
          {bestAvgDetails && (
            <div className="text-xs font-medium mt-1" style={{ color: bestAvgDetails.colorHex }}>
              Rank {bestAvgDetails.rank} · {bestAvgDetails.rating}
            </div>
          )}
        </div>

        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <div className="text-xs text-neutral-400 mb-1">Tests Completed</div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {currentModeStats.testsCompleted}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Total all modes: {records.totalTestsCompleted}
          </div>
        </div>
      </div>

      {/* Secondary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onOpenArmory}
          className="py-2 px-4 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Skin Armory</span>
        </button>

        <button
          onClick={onOpenHowToPlay}
          className="py-2 px-4 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-neutral-400" />
          <span>How to Play</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="py-2 px-4 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4 text-neutral-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* Footer subtle attribution & keyboard tip */}
      <div className="mt-10 text-xs text-neutral-500 flex items-center gap-2">
        <span>Desktop: Space = Strike · Shift = Dodge</span>
        <span aria-hidden="true">·</span>
        <span>Mobile: Tap on-screen action pads</span>
      </div>
    </div>
  );
};
