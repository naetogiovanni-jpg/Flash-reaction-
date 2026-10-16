import React, { useState, useEffect, useCallback } from 'react';
import {
  GameMode,
  GameState,
  RoundRecord,
  SessionResult,
  PlayerRecords,
  GameSettings,
  SkinId,
  CustomSkin,
} from './types/game';
import {
  loadRecords,
  saveSessionRecords,
  resetAllRecords,
  loadSettings,
  saveSettings,
  equipSkinInRecords,
} from './utils/storage';
import { calculateSessionResult } from './utils/scoring';
import { sound } from './utils/audio';
import { getSkin, checkNewUnlockedSkins } from './utils/skins';
import { BackgroundEffect } from './components/BackgroundEffect';
import { HeaderNav } from './components/HeaderNav';
import { MainMenu } from './components/MainMenu';
import { ReactionTarget } from './components/ReactionTarget';
import { FinalResults } from './components/FinalResults';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SkinArmoryModal } from './components/SkinArmoryModal';
import { OpenWorldScene } from './components/OpenWorld/OpenWorldScene';
import { SkinInspectorModal } from './components/OpenWorld/SkinInspectorModal';

const TOTAL_ROUNDS = 5;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundRecords, setRoundRecords] = useState<RoundRecord[]>([]);
  const [falseStartsCount, setFalseStartsCount] = useState<number>(0);
  const [latestSession, setLatestSession] = useState<SessionResult | null>(null);

  // Storage states
  const [records, setRecords] = useState<PlayerRecords>(loadRecords);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);

  // Modals & 3D inspector
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState<boolean>(false);
  const [inspectedSkin, setInspectedSkin] = useState<CustomSkin | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Active equipped skin
  const currentSkin = getSkin(records.equippedSkin);

  // Visual burst trigger for background
  const [burstTrigger, setBurstTrigger] = useState<number>(0);
  const [burstColor, setBurstColor] = useState<string>(currentSkin.primaryColor);

  // Sync sound engine with settings
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.volume);
  }, [settings.soundEnabled, settings.volume]);

  // Session fastest so far
  const sessionFastest =
    roundRecords.length > 0
      ? Math.min(...roundRecords.map((r) => r.reactionTimeMs))
      : null;

  const triggerBurst = useCallback((color = currentSkin.primaryColor) => {
    setBurstColor(color);
    setBurstTrigger(Date.now());
  }, [currentSkin.primaryColor]);

  const handleStartGame = (modeOverride?: GameMode) => {
    if (modeOverride) {
      setSelectedMode(modeOverride);
    }
    setRoundRecords([]);
    setFalseStartsCount(0);
    setCurrentRound(1);
    setGameState('READY');
    triggerBurst((modeOverride || selectedMode) === 'hardcore' ? '#EF4444' : currentSkin.primaryColor);
  };

  const handleAdvanceToNextRound = (record: RoundRecord) => {
    setRoundRecords((prev) => [...prev, record]);
    setCurrentRound((c) => c + 1);
  };

  const handleFinishSession = (finalRecord: RoundRecord) => {
    const allRounds = [...roundRecords, finalRecord];
    setRoundRecords(allRounds);

    const currentModeStats = records[selectedMode] || {
      fastestSingle: null,
      bestAverage: null,
      testsCompleted: 0,
    };

    const session = calculateSessionResult(
      selectedMode,
      allRounds,
      falseStartsCount,
      currentModeStats.bestAverage,
      currentModeStats.fastestSingle
    );

    // Evaluate skin unlocks
    const newlyUnlocked = checkNewUnlockedSkins(session, records);
    session.unlockedSkinIds = newlyUnlocked;

    const updatedRecords = saveSessionRecords(session, newlyUnlocked);
    setRecords(updatedRecords);
    setLatestSession(session);
    setGameState('FINAL_RESULTS');

    sound.playResultFanfare(session.isNewBestAverage || session.isNewFastestSingle);
    triggerBurst(session.isNewBestAverage ? '#38BDF8' : currentSkin.primaryColor);
  };

  const handleFalseStart = () => {
    setFalseStartsCount((c) => c + 1);
  };

  const handleReturnToMenu = () => {
    setGameState('MENU');
    setRoundRecords([]);
    setCurrentRound(1);
    setFalseStartsCount(0);
  };

  const handlePlayAgain = () => {
    handleStartGame();
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetRecords = () => {
    const fresh = resetAllRecords();
    setRecords(fresh);
  };

  const handleEquipSkin = (skinId: SkinId) => {
    const updated = equipSkinInRecords(skinId);
    setRecords(updated);
    const skin = getSkin(skinId);
    triggerBurst(skin.primaryColor);
  };

  const handleInspectSkin = (skin: CustomSkin) => {
    setInspectedSkin(skin);
    setIsInspectorOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 2D Background Canvas only active when not in 3D Open World */}
      {gameState !== 'OPEN_WORLD' && (
        <BackgroundEffect
          burstTrigger={burstTrigger}
          flashColor={burstColor}
          reducedMotion={settings.reducedMotion || settings.animationIntensity === 'reduced'}
        />
      )}

      {/* Top Header Navigation */}
      <HeaderNav
        gameState={gameState}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() =>
          handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenArmory={() => setIsArmoryOpen(true)}
        onOpenWorld={() => setGameState('OPEN_WORLD')}
        onReturnToMenu={handleReturnToMenu}
      />

      {/* Main View Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Open World 3D Mode */}
        {gameState === 'OPEN_WORLD' && (
          <OpenWorldScene
            equippedSkin={currentSkin}
            unlockedSkinIds={records.unlockedSkins}
            onEquipSkin={handleEquipSkin}
            onStartTrial={(mode) => handleStartGame(mode)}
            onInspectSkin={handleInspectSkin}
          />
        )}

        {/* 2D Main Menu Mode */}
        {gameState === 'MENU' && (
          <div className="w-full flex items-center justify-center p-4">
            <MainMenu
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              onStartGame={() => handleStartGame()}
              onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenArmory={() => setIsArmoryOpen(true)}
              onOpenWorld={() => setGameState('OPEN_WORLD')}
              records={records}
            />
          </div>
        )}

        {/* Reflex Testing Active Game Stages */}
        {(gameState === 'READY' ||
          gameState === 'WAITING' ||
          gameState === 'SIGNAL_ACTIVE' ||
          gameState === 'ROUND_RESULT' ||
          gameState === 'FALSE_START') && (
          <div className="w-full flex items-center justify-center p-4">
            <ReactionTarget
              mode={selectedMode}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              sessionFastest={sessionFastest}
              skin={currentSkin}
              onAdvanceToNextRound={handleAdvanceToNextRound}
              onFinishSession={handleFinishSession}
              onFalseStart={handleFalseStart}
              reducedMotion={settings.reducedMotion}
              onTriggerBurst={triggerBurst}
            />
          </div>
        )}

        {/* Reflex Report / Results Screen */}
        {gameState === 'FINAL_RESULTS' && latestSession && (
          <div className="w-full flex items-center justify-center p-4">
            <FinalResults
              session={latestSession}
              records={records}
              onPlayAgain={handlePlayAgain}
              onMainMenu={handleReturnToMenu}
              onOpenArmory={() => setIsArmoryOpen(true)}
            />
          </div>
        )}
      </main>

      {/* 3D Skin Inspector Modal */}
      {inspectedSkin && (
        <SkinInspectorModal
          skin={inspectedSkin}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          isUnlocked={records.unlockedSkins.includes(inspectedSkin.id)}
          isEquipped={records.equippedSkin === inspectedSkin.id}
          onEquipSkin={handleEquipSkin}
        />
      )}

      {/* Skin Armory Modal */}
      <SkinArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        equippedSkinId={records.equippedSkin}
        unlockedSkinIds={records.unlockedSkins}
        onEquipSkin={handleEquipSkin}
        onInspectSkin={handleInspectSkin}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetRecords={handleResetRecords}
      />

      {/* How To Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
    </div>
  );
}
