import React from 'react';
import { X, Zap, ShieldAlert, Target, Compass, Sparkles, Wind, Flame, Lock } from 'lucide-react';
import { SKINS_CATALOG } from '../utils/skins';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              HOW TO PLAY
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Reflex Protocol, Combat Evade & Skin Unlock Guide
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-neutral-300">
          {/* Core Sequence */}
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
              Standard 5-Round Sequence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                <div className="text-cyan-400 font-bold text-xs mb-1">01. GET READY</div>
                <p className="text-xs text-neutral-400">
                  Target initializes. Keep your hands poised over the Spacebar or screen.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                <div className="text-amber-400 font-bold text-xs mb-1">02. WAIT FOR IT</div>
                <p className="text-xs text-neutral-400">
                  Screen stays calm. Timing is unpredictable. Do not guess or strike prematurely.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/60 border border-cyan-500/40 rounded-xl bg-cyan-950/20">
                <div className="text-cyan-300 font-bold text-xs mb-1">03. REACT / DODGE</div>
                <p className="text-xs text-neutral-200">
                  Signal flashes! Strike or Dodge instantly. High-resolution timer measures millisecond reflexes.
                </p>
              </div>
            </div>
          </div>

          {/* Hardcore Mode Spotlight */}
          <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold font-display text-base mb-1">
              <Flame className="w-4 h-4 fill-red-400" />
              <span>NEW: HARDCORE MODE</span>
            </div>
            <p className="text-xs text-neutral-300 mb-2">
              Engineered exclusively for elite reaction speeds:
            </p>
            <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
              <li>
                <strong className="text-white">Hyper-Short Waiting Time:</strong> Signals trigger between 550ms and 1600ms without warning!
              </li>
              <li>
                <strong className="text-white">Shrinking Reaction Window:</strong> Allowed reaction window closes progressively each round:
                <div className="font-mono text-neutral-300 mt-0.5">
                  R1: 360ms · R2: 310ms · R3: 265ms · R4: 230ms · R5: 200ms
                </div>
              </li>
              <li>
                <strong className="text-white">Timeout Elimination:</strong> If you fail to strike or dodge before the window shuts, the strike is missed and penalized!
              </li>
            </ul>
          </div>

          {/* Player Dodge System */}
          <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-2xl">
            <div className="flex items-center gap-2 text-purple-300 font-bold font-display text-base mb-1">
              <Wind className="w-4 h-4" />
              <span>PLAYER DODGE SYSTEM</span>
            </div>
            <p className="text-xs text-neutral-300 mb-2">
              In combat rounds, lethal blade cleaves slice diagonally across the target!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
                <strong className="text-white block mb-0.5">Evade Controls:</strong>
                Press <span className="text-purple-400 font-mono font-bold">Shift</span>, Down Arrow, or tap the on-screen <span className="text-purple-400 font-bold">DODGE</span> button.
              </div>
              <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
                <strong className="text-white block mb-0.5">Penalty Warning:</strong>
                Striking on a hazard cleave results in being slashed! You must evade.
              </div>
            </div>
          </div>

          {/* Custom Skins Catalog */}
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              Custom Blade Skins & Unlock Criteria
            </h3>
            <div className="space-y-1.5">
              {SKINS_CATALOG.map((skin) => (
                <div
                  key={skin.id}
                  className="p-2.5 bg-neutral-950/50 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border"
                      style={{ backgroundColor: skin.primaryColor, borderColor: skin.secondaryColor }}
                    />
                    <div>
                      <span className="font-bold text-white">{skin.name}</span>
                      <span className="text-[11px] text-neutral-400 ml-2 hidden sm:inline">
                        {skin.tagline}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 text-right">
                    {skin.unlockRequirement}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Matrix */}
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              Reaction Rating Matrix
            </h3>
            <div className="border border-neutral-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-2 px-3">Reaction Time</th>
                    <th className="py-2 px-3">Rank</th>
                    <th className="py-2 px-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/40 tabular-nums">
                  <tr>
                    <td className="py-2 px-3 text-cyan-400">&lt; 180 ms</td>
                    <td className="py-2 px-3 font-bold text-cyan-300">S-RANK</td>
                    <td className="py-2 px-3 text-white">INSANE</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-indigo-400">180 – 219 ms</td>
                    <td className="py-2 px-3 font-bold text-indigo-300">A-RANK</td>
                    <td className="py-2 px-3 text-white">EXCELLENT</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-emerald-400">220 – 269 ms</td>
                    <td className="py-2 px-3 font-bold text-emerald-300">B-RANK</td>
                    <td className="py-2 px-3 text-white">FAST</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-amber-400">270 – 329 ms</td>
                    <td className="py-2 px-3 font-bold text-amber-300">C-RANK</td>
                    <td className="py-2 px-3 text-white">GOOD</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-orange-400">330 – 399 ms</td>
                    <td className="py-2 px-3 font-bold text-orange-300">D-RANK</td>
                    <td className="py-2 px-3 text-white">AVERAGE</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-red-400">400+ ms</td>
                    <td className="py-2 px-3 font-bold text-red-300">E-RANK</td>
                    <td className="py-2 px-3 text-white">KEEP TRAINING</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-display rounded-xl transition-colors cursor-pointer"
          >
            I'M READY
          </button>
        </div>
      </div>
    </div>
  );
};
