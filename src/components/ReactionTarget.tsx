import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameMode,
  DirectionType,
  ColorCueType,
  ActionPrompt,
  RoundRecord,
  CustomSkin,
} from '../types/game';
import { getRatingDetails, RatingDetails } from '../utils/scoring';
import { sound } from '../utils/audio';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  AlertTriangle,
  Shield,
  Flame,
  Wind,
} from 'lucide-react';

interface ReactionTargetProps {
  mode: GameMode;
  currentRound: number;
  totalRounds: number;
  sessionFastest: number | null;
  skin: CustomSkin;
  onAdvanceToNextRound: (record: RoundRecord) => void;
  onFinishSession: (finalRecord: RoundRecord) => void;
  onFalseStart: () => void;
  reducedMotion: boolean;
  onTriggerBurst: (color?: string) => void;
}

// Hardcore shrinking window thresholds in milliseconds
const HARDCORE_WINDOWS: Record<number, number> = {
  1: 360,
  2: 310,
  3: 265,
  4: 230,
  5: 200,
};

export const ReactionTarget: React.FC<ReactionTargetProps> = ({
  mode,
  currentRound,
  totalRounds,
  sessionFastest,
  skin,
  onAdvanceToNextRound,
  onFinishSession,
  onFalseStart,
  reducedMotion,
  onTriggerBurst,
}) => {
  const [stage, setStage] = useState<'READY' | 'WAITING' | 'SIGNAL' | 'FEEDBACK' | 'EARLY'>('READY');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [lastRating, setLastRating] = useState<RatingDetails | null>(null);
  const [targetDirection, setTargetDirection] = useState<DirectionType>('up');
  const [colorCue, setColorCue] = useState<ColorCueType>('cyan_strike');
  const [actionPrompt, setActionPrompt] = useState<ActionPrompt>('strike');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isDodgeSuccess, setIsDodgeSuccess] = useState<boolean>(false);
  const [windowProgress, setWindowProgress] = useState<number>(100);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const nextRoundTimerRef = useRef<number | null>(null);
  const trapTimerRef = useRef<number | null>(null);
  const timeoutLimitTimerRef = useRef<number | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const inputHandledRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const mountTimeRef = useRef<number>(Date.now());

  const currentWindowLimit = mode === 'hardcore' ? (HARDCORE_WINDOWS[currentRound] || 250) : null;

  // Clear all pending timeouts
  const clearAllTimers = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (nextRoundTimerRef.current !== null) {
      window.clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }
    if (trapTimerRef.current !== null) {
      window.clearTimeout(trapTimerRef.current);
      trapTimerRef.current = null;
    }
    if (timeoutLimitTimerRef.current !== null) {
      window.clearTimeout(timeoutLimitTimerRef.current);
      timeoutLimitTimerRef.current = null;
    }
    if (progressAnimRef.current !== null) {
      window.cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
  }, []);

  // Initiate a round
  const startRound = useCallback(() => {
    clearAllTimers();
    inputHandledRef.current = false;
    setReactionMs(null);
    setLastRating(null);
    setFeedbackMessage('');
    setIsDodgeSuccess(false);
    setWindowProgress(100);

    // Stage 1: GET READY (400ms indicator)
    setStage('READY');
    sound.playReadyTone();

    timerRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;

      // Stage 2: WAITING
      setStage('WAITING');

      // Random wait delay:
      // Hardcore mode: significantly shortened to 550ms - 1600ms!
      // Other modes: 1500ms - 4000ms
      const randomWait =
        mode === 'hardcore'
          ? Math.floor(Math.random() * 1050) + 550
          : Math.floor(Math.random() * 2500) + 1500;

      // Determine Action Prompt:
      // In Hardcore mode: 40% chance of sudden INCOMING HAZARD -> DODGE!
      const requiresDodge = mode === 'hardcore' && Math.random() < 0.4;
      const prompt: ActionPrompt = requiresDodge ? 'dodge' : 'strike';
      setActionPrompt(prompt);

      // In Colour mode, 35% chance to display a red trap cue first
      const isRedTrap = mode === 'color' && Math.random() < 0.35;
      const cueType: ColorCueType = isRedTrap ? 'red_hold' : 'cyan_strike';
      setColorCue(cueType);

      // In Direction mode, pick random direction
      const dirs: DirectionType[] = ['up', 'down', 'left', 'right'];
      const chosenDir = dirs[Math.floor(Math.random() * dirs.length)];
      setTargetDirection(chosenDir);

      timerRef.current = window.setTimeout(() => {
        if (!isMountedRef.current) return;

        // Stage 3: SIGNAL ACTIVE
        setStage('SIGNAL');
        startTimeRef.current = performance.now();
        sound.playSignalFlash();
        sound.triggerHaptic('signal');

        if (prompt === 'dodge') {
          sound.playDodgeSwoosh();
          onTriggerBurst('#A855F7');
        } else if (cueType === 'red_hold') {
          onTriggerBurst('#EF4444');
          // If player waits out the red trap (1200ms), proceed to true signal
          trapTimerRef.current = window.setTimeout(() => {
            if (!isMountedRef.current || inputHandledRef.current) return;
            setColorCue('cyan_strike');
            startTimeRef.current = performance.now();
            sound.playSignalFlash();
            onTriggerBurst(skin.primaryColor);
          }, 1200);
        } else {
          onTriggerBurst(skin.primaryColor);
        }

        // Hardcore mode: Progress bar & Shrinking reaction window timeout
        if (mode === 'hardcore' && currentWindowLimit) {
          const limitMs = currentWindowLimit;
          const start = performance.now();

          const updateProgressBar = () => {
            const elapsed = performance.now() - start;
            const remainingPct = Math.max(0, 100 - (elapsed / limitMs) * 100);
            setWindowProgress(remainingPct);

            if (remainingPct > 0 && !inputHandledRef.current) {
              progressAnimRef.current = requestAnimationFrame(updateProgressBar);
            }
          };
          progressAnimRef.current = requestAnimationFrame(updateProgressBar);

          // Hardcore timeout fail if player doesn't react in time
          timeoutLimitTimerRef.current = window.setTimeout(() => {
            if (!isMountedRef.current || inputHandledRef.current) return;
            inputHandledRef.current = true;
            clearAllTimers();
            sound.playTimeoutMiss();
            sound.triggerHaptic('error');
            setStage('EARLY');
            setFeedbackMessage(
              `WINDOW CLOSED! Window was only ${limitMs} ms. Elite reflexes required!`
            );
            onFalseStart();

            nextRoundTimerRef.current = window.setTimeout(() => {
              if (!isMountedRef.current) return;
              startRound();
            }, 1500);
          }, limitMs);
        }
      }, randomWait);
    }, 400);
  }, [clearAllTimers, mode, currentWindowLimit, onTriggerBurst, skin.primaryColor]);

  useEffect(() => {
    isMountedRef.current = true;
    mountTimeRef.current = Date.now();
    startRound();

    return () => {
      isMountedRef.current = false;
      clearAllTimers();
    };
  }, [currentRound, startRound, clearAllTimers]);

  // Handle reaction action (Strike or Dodge input)
  const handleReactionInput = useCallback(
    (inputType: 'strike' | 'dodge', providedDirection?: DirectionType) => {
      // Discard accidental clicks within 150ms of mount
      if (Date.now() - mountTimeRef.current < 150) return;

      if (inputHandledRef.current) return;

      // Reacted too early during READY or WAITING
      if (stage === 'READY' || stage === 'WAITING') {
        inputHandledRef.current = true;
        clearAllTimers();
        sound.playFalseStart();
        sound.triggerHaptic('error');
        setStage('EARLY');
        setFeedbackMessage('You reacted before the signal. Stay focused.');
        onFalseStart();

        nextRoundTimerRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          startRound();
        }, 1400);
        return;
      }

      // Reacted during active SIGNAL
      if (stage === 'SIGNAL') {
        // Red trap check
        if (colorCue === 'red_hold') {
          inputHandledRef.current = true;
          clearAllTimers();
          sound.playFalseStart();
          sound.triggerHaptic('error');
          setStage('EARLY');
          setFeedbackMessage('TRAP TRIGGERED! Red means DO NOT react.');
          onFalseStart();

          nextRoundTimerRef.current = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            startRound();
          }, 1400);
          return;
        }

        // Dodge vs Strike mismatch check
        if (actionPrompt === 'dodge' && inputType === 'strike') {
          inputHandledRef.current = true;
          clearAllTimers();
          sound.playFalseStart();
          sound.triggerHaptic('error');
          setStage('EARLY');
          setFeedbackMessage('SLASHED! Laser hazard required a DODGE, not a strike!');
          onFalseStart();

          nextRoundTimerRef.current = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            startRound();
          }, 1500);
          return;
        }

        if (actionPrompt === 'strike' && inputType === 'dodge') {
          inputHandledRef.current = true;
          clearAllTimers();
          sound.playFalseStart();
          sound.triggerHaptic('error');
          setStage('EARLY');
          setFeedbackMessage('MISSED! Target required an instant STRIKE, not a dodge.');
          onFalseStart();

          nextRoundTimerRef.current = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            startRound();
          }, 1400);
          return;
        }

        // Direction matching check
        if (mode === 'direction' && providedDirection && providedDirection !== targetDirection) {
          inputHandledRef.current = true;
          clearAllTimers();
          sound.playFalseStart();
          sound.triggerHaptic('error');
          setStage('EARLY');
          setFeedbackMessage(
            `WRONG DIRECTION! Target was ${targetDirection.toUpperCase()}.`
          );
          onFalseStart();

          nextRoundTimerRef.current = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            startRound();
          }, 1400);
          return;
        }

        // Valid successful reflex response!
        const elapsedMs = Math.round(performance.now() - startTimeRef.current);
        inputHandledRef.current = true;
        clearAllTimers();

        const ratingInfo = getRatingDetails(elapsedMs);
        setReactionMs(elapsedMs);
        setLastRating(ratingInfo);
        setStage('FEEDBACK');

        if (actionPrompt === 'dodge') {
          setIsDodgeSuccess(true);
          sound.playDodgePerfect();
          onTriggerBurst('#A855F7');
        } else {
          sound.playSuccess(ratingInfo.rank);
          onTriggerBurst(skin.primaryColor);
        }

        sound.triggerHaptic('tap');

        const record: RoundRecord = {
          roundNumber: currentRound,
          reactionTimeMs: elapsedMs,
          rating: ratingInfo.rating,
          mode,
          targetDirection: mode === 'direction' ? targetDirection : undefined,
          colorCue,
          actionRequired: actionPrompt,
          timeLimitMs: currentWindowLimit || undefined,
          wasDodgeSuccess: actionPrompt === 'dodge',
        };

        // Feedback display for 1200ms before advancing
        nextRoundTimerRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          if (currentRound >= totalRounds) {
            onFinishSession(record);
          } else {
            onAdvanceToNextRound(record);
          }
        }, 1200);
      }
    },
    [
      stage,
      clearAllTimers,
      colorCue,
      actionPrompt,
      mode,
      targetDirection,
      currentRound,
      totalRounds,
      currentWindowLimit,
      onFalseStart,
      onAdvanceToNextRound,
      onFinishSession,
      onTriggerBurst,
      startRound,
      skin.primaryColor,
    ]
  );

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Dodge keys: Shift or 'e' or 'x'
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'e' || e.key === 'x') {
        handleReactionInput('dodge');
        return;
      }

      if (e.code === 'Space') {
        if (mode === 'direction') {
          handleReactionInput('strike', targetDirection);
        } else {
          handleReactionInput('strike');
        }
      } else if (mode === 'direction') {
        if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          handleReactionInput('strike', 'up');
        } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          handleReactionInput('strike', 'down');
        } else if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          handleReactionInput('strike', 'left');
        } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          handleReactionInput('strike', 'right');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReactionInput, mode, targetDirection]);

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Round Telemetry HUD Header */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 px-4 py-2.5 bg-neutral-900/70 border border-neutral-800 rounded-2xl text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-mono">ROUND</span>
          <span
            className="font-extrabold font-mono text-base tabular-nums"
            style={{ color: skin.primaryColor }}
          >
            {currentRound} <span className="text-neutral-600 font-normal">/ {totalRounds}</span>
          </span>
          {mode === 'hardcore' && currentWindowLimit && (
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 border border-red-500/50 text-red-400 font-bold uppercase tracking-wider">
              Limit: {currentWindowLimit}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-neutral-400">SESSION BEST</div>
          <div className="font-mono font-bold text-white tabular-nums">
            {sessionFastest !== null ? (
              <span className="text-emerald-400">{sessionFastest} ms</span>
            ) : (
              <span className="text-neutral-600">-- ms</span>
            )}
          </div>
        </div>
      </div>

      {/* Shrinking window progress indicator for Hardcore mode */}
      {mode === 'hardcore' && stage === 'SIGNAL' && (
        <div className="w-full max-w-md mb-3">
          <div className="flex justify-between text-[11px] font-mono text-neutral-400 mb-1">
            <span className="text-red-400 font-bold">REACTION WINDOW CLOSING</span>
            <span className="tabular-nums text-white">{Math.round(windowProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-75 ease-linear"
              style={{ width: `${windowProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Large Reaction Arena / Target */}
      <div
        onClick={() => {
          if (mode === 'direction' && stage === 'SIGNAL') {
            handleReactionInput('strike', targetDirection);
          } else {
            handleReactionInput('strike');
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Reaction Target. Press spacebar or click when signal activates. Use Shift to dodge."
        className={`relative w-full max-w-md aspect-square sm:aspect-[4/3] rounded-3xl p-6 flex flex-col items-center justify-center select-none cursor-pointer touch-manipulation transition-all duration-150 outline-none overflow-hidden ${
          stage === 'READY'
            ? 'bg-neutral-900/80 border-2 border-neutral-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
            : stage === 'WAITING'
            ? 'bg-neutral-900/90 border-2 border-neutral-700 shadow-[0_0_25px_rgba(15,23,42,0.8)]'
            : stage === 'SIGNAL'
            ? actionPrompt === 'dodge'
              ? 'bg-purple-950/90 border-4 border-purple-500 shadow-[0_0_70px_rgba(168,85,247,0.8)] scale-[1.03]'
              : colorCue === 'red_hold'
              ? 'bg-red-950/90 border-4 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.7)] scale-[1.02]'
              : 'bg-neutral-900/90 border-4 scale-[1.03]'
            : stage === 'EARLY'
            ? 'bg-red-950/80 border-2 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
            : 'bg-neutral-900 border-2 border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
        }`}
        style={{
          borderColor:
            stage === 'SIGNAL' && actionPrompt === 'strike' && colorCue !== 'red_hold'
              ? skin.primaryColor
              : undefined,
          boxShadow:
            stage === 'SIGNAL' && actionPrompt === 'strike' && colorCue !== 'red_hold'
              ? `0 0 70px ${skin.primaryColor}80`
              : undefined,
        }}
      >
        {/* Subtle Cyber Reticle Background inside Target */}
        <div className="absolute inset-4 rounded-2xl border border-neutral-800/60 pointer-events-none flex items-center justify-center overflow-hidden">
          <div
            className={`w-48 h-48 rounded-full border transition-all duration-300 pointer-events-none ${
              stage === 'WAITING'
                ? 'border-neutral-700/50 scale-100 animate-pulse'
                : stage === 'SIGNAL'
                ? actionPrompt === 'dodge'
                  ? 'border-purple-400 scale-125 animate-shockwave'
                  : colorCue === 'red_hold'
                  ? 'border-red-400 scale-125 animate-shockwave'
                  : 'scale-125 animate-shockwave'
                : 'border-neutral-800/30 scale-95'
            }`}
            style={{
              borderColor:
                stage === 'SIGNAL' && actionPrompt === 'strike' && colorCue !== 'red_hold'
                  ? skin.primaryColor
                  : undefined,
            }}
          />

          {/* Hazard Slash line when incoming cleave requires Dodge */}
          {stage === 'SIGNAL' && actionPrompt === 'dodge' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[140%] h-1.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent rotate-45 animate-pulse shadow-[0_0_20px_rgba(168,85,247,1)]" />
              <div className="w-[140%] h-1.5 bg-gradient-to-r from-transparent via-white to-transparent -rotate-45 animate-pulse shadow-[0_0_20px_rgba(255,255,255,1)]" />
            </div>
          )}
        </div>

        {/* Reticle Crosshairs */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-neutral-600 pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-neutral-600 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-neutral-600 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-neutral-600 pointer-events-none" />

        {/* Target Content per Stage */}
        {stage === 'READY' && (
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 mb-4 rounded-full border border-neutral-600 animate-spin"
              style={{ borderTopColor: skin.primaryColor }}
            />
            <span className="text-xl sm:text-2xl font-black font-display tracking-widest text-neutral-300">
              GET READY...
            </span>
            <span className="text-xs text-neutral-500 mt-2 font-mono">STAND BY</span>
          </div>
        )}

        {stage === 'WAITING' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-neutral-800/80 border border-neutral-600 flex items-center justify-center animate-pulse">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: `${skin.primaryColor}80` }}
              />
            </div>
            <span className="text-2xl sm:text-3xl font-black font-display tracking-widest text-neutral-200">
              WAIT FOR IT...
            </span>
            <span className="text-xs text-neutral-500 mt-2 font-mono text-center px-4">
              {mode === 'hardcore'
                ? 'RAPID TRIGGER ACTIVE — BE READY TO STRIKE OR DODGE!'
                : 'DO NOT REACT UNTIL SIGNAL FLASHES'}
            </span>
          </div>
        )}

        {stage === 'SIGNAL' && (
          <div className="flex flex-col items-center">
            {/* Dodge Hazard Prompt */}
            {actionPrompt === 'dodge' ? (
              <>
                <div className="p-3 bg-purple-600 rounded-full mb-3 shadow-[0_0_35px_rgba(168,85,247,1)] animate-bounce">
                  <Wind className="w-10 h-10 text-white" />
                </div>
                <span className="text-3xl sm:text-5xl font-black font-display tracking-wider text-purple-300 drop-shadow-[0_0_30px_rgba(168,85,247,1)]">
                  DODGE!
                </span>
                <span className="text-xs text-purple-200 font-bold mt-2 uppercase tracking-widest">
                  LETHAL CLEAVE! PRESS SHIFT OR DODGE BUTTON!
                </span>
              </>
            ) : colorCue === 'red_hold' ? (
              <>
                <div className="p-3 bg-red-600 rounded-full mb-3 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-bounce">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <span className="text-3xl sm:text-5xl font-black font-display tracking-wider text-red-400 drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]">
                  HOLD!
                </span>
                <span className="text-xs text-red-200 font-bold mt-2 uppercase tracking-widest">
                  RED TRAP — DO NOT REACT!
                </span>
              </>
            ) : mode === 'direction' ? (
              <>
                <div
                  className="mb-2 p-4 text-black rounded-2xl shadow-[0_0_40px_rgba(6,182,212,1)] animate-pulse"
                  style={{ backgroundColor: skin.primaryColor }}
                >
                  {targetDirection === 'up' && <ArrowUp className="w-14 h-14 stroke-[3]" />}
                  {targetDirection === 'down' && <ArrowDown className="w-14 h-14 stroke-[3]" />}
                  {targetDirection === 'left' && <ArrowLeft className="w-14 h-14 stroke-[3]" />}
                  {targetDirection === 'right' && <ArrowRight className="w-14 h-14 stroke-[3]" />}
                </div>
                <span
                  className="text-3xl sm:text-4xl font-black font-display tracking-widest drop-shadow-[0_0_30px_rgba(6,182,212,0.9)]"
                  style={{ color: skin.secondaryColor }}
                >
                  {targetDirection.toUpperCase()}!
                </span>
                <span className="text-xs text-white font-bold mt-1 uppercase tracking-wider">
                  STRIKE {targetDirection.toUpperCase()} NOW!
                </span>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 mb-2 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: skin.primaryColor,
                    boxShadow: `0 0 35px ${skin.primaryColor}`,
                  }}
                >
                  <Zap className="w-8 h-8 text-black fill-black" />
                </div>
                <span
                  className="text-4xl sm:text-6xl font-black font-display tracking-widest drop-shadow-[0_0_40px_rgba(6,182,212,1)]"
                  style={{ color: skin.secondaryColor }}
                >
                  REACT!
                </span>
                <span className="text-xs text-white font-bold mt-2 font-mono uppercase tracking-widest">
                  STRIKE NOW!
                </span>
              </>
            )}
          </div>
        )}

        {stage === 'EARLY' && (
          <div className="flex flex-col items-center text-center px-4">
            <div className="p-3 bg-red-600/30 border border-red-500 rounded-full mb-3 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="text-2xl sm:text-4xl font-black font-display tracking-wider text-red-400 mb-2">
              TOO EARLY!
            </span>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xs">{feedbackMessage}</p>
            <span className="text-xs text-neutral-500 mt-3 font-mono">
              Restarting shortly...
            </span>
          </div>
        )}

        {stage === 'FEEDBACK' && reactionMs !== null && lastRating && (
          <div className="flex flex-col items-center text-center">
            <div className="text-xs uppercase tracking-widest text-neutral-400 mb-1 font-mono">
              {isDodgeSuccess ? 'SHADOW DODGE EXECUTED' : 'STRIKE REGISTERED'}
            </div>
            <div className="text-5xl sm:text-6xl font-black text-white font-mono tabular-nums tracking-tight mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              {reactionMs}{' '}
              <span className="text-xl sm:text-2xl text-neutral-400 font-normal">ms</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider ${lastRating.badgeBg} ${lastRating.badgeBorder} border ${lastRating.glowClass}`}
              style={{ color: lastRating.colorHex }}
            >
              RANK {lastRating.rank} · {lastRating.rating}
            </div>
            <div className="text-xs text-neutral-400 mt-2 font-medium">
              {isDodgeSuccess ? 'PERFECT EVASION' : lastRating.title}
            </div>
          </div>
        )}
      </div>

      {/* Dodge Control Bar: Dedicated Dodge / Evade Action Button */}
      <div className="w-full max-w-md mt-4 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReactionInput('dodge');
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-purple-500/60 hover:border-purple-400 active:scale-95 text-white font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all cursor-pointer"
        >
          <Wind className="w-4 h-4 text-purple-400" />
          <span>DODGE / EVADE</span>
          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">[SHIFT]</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (mode === 'direction') {
              handleReactionInput('strike', targetDirection);
            } else {
              handleReactionInput('strike');
            }
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border hover:border-neutral-500 active:scale-95 text-white font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          style={{ borderColor: `${skin.primaryColor}80` }}
        >
          <Zap className="w-4 h-4" style={{ color: skin.primaryColor }} />
          <span>STRIKE</span>
          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">[SPACE]</span>
        </button>
      </div>

      {/* Direction Mode Mobile Touch Buttons */}
      {mode === 'direction' && (
        <div className="w-full max-w-xs mt-4 grid grid-cols-3 gap-2">
          <div />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReactionInput('strike', 'up');
            }}
            className="h-12 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
            aria-label="Up Arrow"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReactionInput('strike', 'left');
            }}
            className="h-12 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
            aria-label="Left Arrow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReactionInput('strike', 'down');
            }}
            className="h-12 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
            aria-label="Down Arrow"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReactionInput('strike', 'right');
            }}
            className="h-12 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl flex items-center justify-center font-bold text-white transition-colors cursor-pointer"
            aria-label="Right Arrow"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Controller hint */}
      <div className="mt-4 text-xs text-neutral-500 font-mono flex items-center gap-2">
        <span>Desktop: Space = Strike · Shift = Dodge</span>
        <span aria-hidden="true">·</span>
        <span>Equipped: {skin.name}</span>
      </div>
    </div>
  );
};
