import React from 'react';
import { X, Shield, Lock, Check, Sparkles, Flame, Eye } from 'lucide-react';
import { CustomSkin, SkinId } from '../types/game';
import { SKINS_CATALOG, getSkin } from '../utils/skins';

interface SkinArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equippedSkinId: SkinId;
  unlockedSkinIds: SkinId[];
  onEquipSkin: (skinId: SkinId) => void;
  onInspectSkin: (skin: CustomSkin) => void;
}

export const SkinArmoryModal: React.FC<SkinArmoryModalProps> = ({
  isOpen,
  onClose,
  equippedSkinId,
  unlockedSkinIds,
  onEquipSkin,
  onInspectSkin,
}) => {
  if (!isOpen) return null;

  const equippedSkin = getSkin(equippedSkinId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg"
              style={{
                borderColor: equippedSkin.primaryColor,
                backgroundColor: `${equippedSkin.primaryColor}20`,
                boxShadow: `0 0 20px ${equippedSkin.primaryColor}50`,
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: equippedSkin.primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                SKIN ARMORY
              </h2>
              <p className="text-xs text-neutral-400">
                Unlockable blade auras & custom reflex reticles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close armory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Equipped Showcase Bar */}
        <div
          className="w-full p-4 rounded-2xl bg-neutral-950/80 border flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 transition-all duration-300"
          style={{ borderColor: `${equippedSkin.primaryColor}60` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 animate-pulse"
              style={{
                borderColor: equippedSkin.primaryColor,
                backgroundColor: `${equippedSkin.primaryColor}40`,
                boxShadow: `0 0 15px ${equippedSkin.primaryColor}`,
              }}
            />
            <div>
              <div className="text-[11px] font-mono tracking-wider uppercase text-neutral-400">
                CURRENTLY EQUIPPED
              </div>
              <div
                className="text-lg font-bold font-display"
                style={{ color: equippedSkin.primaryColor }}
              >
                {equippedSkin.name}
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-400 max-w-sm text-center sm:text-right">
            {equippedSkin.tagline}
          </div>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
          {SKINS_CATALOG.map((skin) => {
            const isUnlocked = unlockedSkinIds.includes(skin.id);
            const isEquipped = equippedSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-neutral-900 border-2'
                    : isUnlocked
                    ? 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    : 'bg-neutral-950/30 border-neutral-900 opacity-60'
                }`}
                style={{
                  borderColor: isEquipped ? skin.primaryColor : undefined,
                  boxShadow: isEquipped ? `0 0 25px ${skin.primaryColor}35` : undefined,
                }}
              >
                {/* Skin Aura Swatch & Reticle Icon */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{
                          backgroundColor: skin.primaryColor,
                          borderColor: skin.secondaryColor,
                          boxShadow: `0 0 10px ${skin.primaryColor}`,
                        }}
                      />
                      <span className="font-bold text-sm text-white font-display">
                        {skin.name}
                      </span>
                    </div>

                    {!isUnlocked && (
                      <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-400 mb-3 line-clamp-2">
                    {skin.tagline}
                  </p>

                  <div className="text-[11px] text-neutral-500 pb-3 border-b border-neutral-850">
                    <span className="font-semibold text-neutral-400">Unlock: </span>
                    {skin.unlockRequirement}
                  </div>
                </div>

                {/* Inspect & Equip / Status buttons */}
                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    onClick={() => onInspectSkin(skin)}
                    className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspect 3D Model</span>
                  </button>

                  {isEquipped ? (
                    <div
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 border"
                      style={{
                        color: skin.primaryColor,
                        borderColor: `${skin.primaryColor}60`,
                        backgroundColor: `${skin.primaryColor}15`,
                      }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>EQUIPPED</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => onEquipSkin(skin.id)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
                    >
                      EQUIP BLADE
                    </button>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-xl text-xs text-neutral-600 bg-neutral-900 text-center font-mono">
                      LOCKED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
          <span>Unlocked: {unlockedSkinIds.length} / {SKINS_CATALOG.length}</span>
          <button
            onClick={onClose}
            className="py-2 px-6 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-display rounded-xl transition-colors cursor-pointer"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
