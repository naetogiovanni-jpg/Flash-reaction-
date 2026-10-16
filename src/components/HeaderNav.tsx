import React from 'react';
import { Volume2, VolumeX, Settings, HelpCircle, RotateCcw } from 'lucide-react';
import { GameState } from '../types/game';

interface HeaderNavProps {
  gameState: GameState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenArmory: () => void;
  onOpenWorld: () => void;
  onReturnToMenu: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  gameState,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenArmory,
  onOpenWorld,
  onReturnToMenu,
}) => {
  return (
    <header className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-8 border-b border-neutral-800/80">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={onReturnToMenu}
        className="text-lg sm:text-xl font-extrabold tracking-wider text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 group text-left cursor-pointer"
      >
        <span className="w-2.5 h-2.5 bg-cyan-400 rotate-45 group-hover:scale-125 transition-transform duration-200" />
        <span className="font-display">FLASH REACTION</span>
      </button>

      {/* Zone 2: 4 clean single-line nav links */}
      <nav className="hidden sm:flex items-center gap-6 text-xs sm:text-sm font-medium text-neutral-400">
        <button
          onClick={onReturnToMenu}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            gameState === 'MENU' ? 'text-cyan-400' : ''
          }`}
        >
          Menu
        </button>
        <button
          onClick={onOpenWorld}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            gameState === 'OPEN_WORLD' ? 'text-cyan-400 font-bold' : ''
          }`}
        >
          <span>Open World</span>
        </button>
        <button
          onClick={onOpenArmory}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Skins
        </button>
        <button
          onClick={onOpenHowToPlay}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          How to Play
        </button>
        <button
          onClick={onOpenSettings}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Settings
        </button>
        <button
          onClick={onToggleSound}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
              <span>Audio Off</span>
            </>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        {gameState === 'OPEN_WORLD' ? (
          <button
            onClick={onReturnToMenu}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Exit 3D World</span>
          </button>
        ) : gameState !== 'MENU' ? (
          <button
            onClick={onReturnToMenu}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Quit Round</span>
          </button>
        ) : (
          <button
            onClick={onOpenWorld}
            className="px-3 py-1.5 text-xs font-bold font-display text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <span>Enter 3D World</span>
          </button>
        )}
      </div>
    </header>
  );
};
