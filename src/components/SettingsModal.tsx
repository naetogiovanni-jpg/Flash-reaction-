import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sparkles, Smartphone, Trash2, Check, AlertTriangle } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetRecords: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetRecords,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, volume: parseFloat(e.target.value) });
  };

  const handleToggleAnimation = () => {
    onUpdateSettings({
      ...settings,
      animationIntensity: settings.animationIntensity === 'full' ? 'reduced' : 'full',
    });
  };

  const handleToggleReducedMotion = () => {
    onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
  };

  const handleToggleHaptics = () => {
    onUpdateSettings({ ...settings, hapticsEnabled: !settings.hapticsEnabled });
  };

  const handleConfirmReset = () => {
    onResetRecords();
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <h2 className="text-xl font-bold font-display text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="space-y-5 text-sm">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-neutral-500" />
              )}
              <div>
                <div className="font-semibold text-white">Sound Effects</div>
                <div className="text-xs text-neutral-400">Synthesized audio cues</div>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Volume Slider */}
          {settings.soundEnabled && (
            <div className="pl-8 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Volume</span>
                <span className="font-mono">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}

          {/* Animation Intensity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-semibold text-white">Animation Intensity</div>
                <div className="text-xs text-neutral-400">Background particles & trails</div>
              </div>
            </div>
            <button
              onClick={handleToggleAnimation}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 cursor-pointer"
            >
              {settings.animationIntensity === 'full' ? 'Full' : 'Reduced'}
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">Reduced Motion</div>
              <div className="text-xs text-neutral-400">Disable shockwaves and shakes</div>
            </div>
            <button
              onClick={handleToggleReducedMotion}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.reducedMotion ? 'bg-cyan-500 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Mobile Haptics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-semibold text-white">Haptic Vibration</div>
                <div className="text-xs text-neutral-400">Mobile tactile feedback</div>
              </div>
            </div>
            <button
              onClick={handleToggleHaptics}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.hapticsEnabled ? 'bg-cyan-500 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Danger Zone: Reset Records */}
          <div className="pt-4 border-t border-neutral-800">
            {confirmReset ? (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-red-400 font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Clear all personal bests and history?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-red-950/30 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Personal Best Records</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
