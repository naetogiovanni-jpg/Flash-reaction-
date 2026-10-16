import React from 'react';
import { RotateCcw, Home, Trophy, Award, Zap, AlertCircle, Share2, Check, Sparkles, Wind, Flame } from 'lucide-react';
import { SessionResult, PlayerRecords } from '../types/game';
import { getRatingDetails } from '../utils/scoring';
import { getSkin } from '../utils/skins';

interface FinalResultsProps {
  session: SessionResult;
  records: PlayerRecords;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onOpenArmory: () => void;
}

export const FinalResults: React.FC<FinalResultsProps> = ({
  session,
  records,
  onPlayAgain,
  onMainMenu,
  onOpenArmory,
}) => {
  const [copied, setCopied] = React.useState(false);
  const ratingDetails = getRatingDetails(session.averageMs);

  const dodgesCount = session.rounds.filter((r) => r.wasDodgeSuccess).length;
  const maxTime = Math.max(...session.rounds.map((r) => r.reactionTimeMs), 400);

  const handleShare = () => {
    const text = `⚡ FLASH REACTION Reflex Report:\nMode: ${session.mode.toUpperCase()}\nAverage: ${session.averageMs}ms (${ratingDetails.rank}-RANK)\nFastest: ${session.fastestMs}ms\nCan you beat my score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Newly Unlocked Skins Celebration Banner */}
      {session.unlockedSkinIds && session.unlockedSkinIds.length > 0 && (
        <div className="w-full max-w-xl mb-6 p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-pulse-glow flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-400">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                NEW BLADE SKIN UNLOCKED!
              </div>
              <div className="text-base font-black text-white font-display">
                {session.unlockedSkinIds.map((id) => getSkin(id).name).join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenArmory}
            className="py-2 px-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-display whitespace-nowrap transition-colors cursor-pointer"
          >
            VIEW ARMORY
          </button>
        </div>
      )}

      {/* Header Badge & Title */}
      <div className="flex items-center gap-2 text-xs font-mono tracking-widest mb-1 uppercase">
        {session.mode === 'hardcore' ? (
          <span className="text-red-400 flex items-center gap-1 font-bold">
            <Flame className="w-3.5 h-3.5 fill-red-400" />
            <span>HARDCORE REFLEX EVALUATION COMPLETED</span>
          </span>
        ) : (
          <span className="text-cyan-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>PERFORMANCE EVALUATION COMPLETE</span>
          </span>
        )}
      </div>

      <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight mb-2">
        REFLEX REPORT
      </h1>

      <div className="text-xs text-neutral-400 mb-6 flex flex-wrap items-center justify-center gap-2">
        <span>Mode: <strong className="text-white">{session.mode.toUpperCase()}</strong></span>
        <span aria-hidden="true">·</span>
        <span>{session.rounds.length} Rounds Evaluated</span>
        {dodgesCount > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-purple-400 font-semibold">{dodgesCount} Shadow Dodge(s)</span>
          </>
        )}
        {session.falseStarts > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">{session.falseStarts} False Start(s)</span>
          </>
        )}
      </div>

      {/* Hero Rank Card */}
      <div
        className={`w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-neutral-900/80 border ${ratingDetails.badgeBorder} ${ratingDetails.glowClass} flex flex-col sm:flex-row items-center justify-between gap-6 mb-6`}
      >
        <div className="flex items-center gap-5 text-center sm:text-left">
          {/* Big Rank Crest */}
          <div
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black font-display text-4xl shadow-lg border-2 ${ratingDetails.badgeBorder}`}
            style={{ backgroundColor: `${ratingDetails.colorHex}15`, color: ratingDetails.colorHex }}
          >
            <span>{ratingDetails.rank}</span>
            <span className="text-[10px] font-mono tracking-widest -mt-1">RANK</span>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-mono mb-0.5">
              OVERALL RATING
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {ratingDetails.title}
            </div>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs">{ratingDetails.description}</p>
          </div>
        </div>

        {/* Big Average Reaction Time Number */}
        <div className="flex flex-col items-center sm:items-end border-t sm:border-t-0 sm:border-l border-neutral-800 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <div className="text-xs text-neutral-400 font-mono mb-1">AVERAGE SPEED</div>
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
            {session.averageMs}{' '}
            <span className="text-lg text-neutral-500 font-normal">ms</span>
          </div>
          {session.isNewBestAverage && (
            <div className="text-xs font-bold text-cyan-400 mt-1 flex items-center gap-1 animate-pulse">
              <Trophy className="w-3.5 h-3.5" />
              <span>NEW BEST AVERAGE!</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI 3-Column Strip */}
      <div className="w-full max-w-xl grid grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center sm:text-left">
          <div className="text-xs text-neutral-400 mb-1">Fastest Round</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {session.fastestMs} <span className="text-xs font-normal text-neutral-400">ms</span>
          </div>
          {session.isNewFastestSingle && (
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">NEW RECORD</div>
          )}
        </div>

        <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center sm:text-left">
          <div className="text-xs text-neutral-400 mb-1">Slowest Round</div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-200 font-mono tabular-nums">
            {session.slowestMs} <span className="text-xs font-normal text-neutral-400">ms</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            Spread: {session.slowestMs - session.fastestMs}ms
          </div>
        </div>

        <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center sm:text-left">
          <div className="text-xs text-neutral-400 mb-1">False Starts</div>
          <div
            className={`text-xl sm:text-2xl font-extrabold font-mono tabular-nums ${
              session.falseStarts === 0 ? 'text-neutral-300' : 'text-amber-400'
            }`}
          >
            {session.falseStarts}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            {session.falseStarts === 0 ? 'Flawless discipline' : 'Penalized restarts'}
          </div>
        </div>
      </div>

      {/* Round-by-Round Bar Chart Timeline */}
      <div className="w-full max-w-xl p-5 bg-neutral-900/70 border border-neutral-800 rounded-xl mb-6">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-4 pb-2 border-b border-neutral-800">
          <span className="font-semibold uppercase tracking-wider">Round Breakdown</span>
          <span className="font-mono">Reaction Time</span>
        </div>

        <div className="space-y-3">
          {session.rounds.map((round) => {
            const rd = getRatingDetails(round.reactionTimeMs);
            const percentage = Math.min(100, (round.reactionTimeMs / maxTime) * 100);
            const isFastestInSession = round.reactionTimeMs === session.fastestMs;

            return (
              <div key={round.roundNumber} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">R{round.roundNumber}</span>
                    <span className="text-[11px] font-semibold" style={{ color: rd.colorHex }}>
                      {rd.rating}
                    </span>
                    {round.actionRequired === 'dodge' && (
                      <span className="text-[10px] text-purple-400 font-bold tracking-wider flex items-center gap-0.5">
                        <Wind className="w-2.5 h-2.5" /> DODGED
                      </span>
                    )}
                    {isFastestInSession && (
                      <span className="text-[10px] text-cyan-400 font-bold tracking-wider">
                        ★ BEST
                      </span>
                    )}
                  </div>
                  <span className="text-white font-bold tabular-nums">
                    {round.reactionTimeMs} ms
                  </span>
                </div>

                <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: round.actionRequired === 'dodge' ? '#A855F7' : rd.colorHex,
                      boxShadow: `0 0 10px ${round.actionRequired === 'dodge' ? '#A855F7' : rd.colorHex}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">
        <button
          onClick={onPlayAgain}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-display font-extrabold text-base tracking-wider transition-all duration-150 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>PLAY AGAIN</span>
        </button>

        <button
          onClick={onMainMenu}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-white font-display font-bold text-base tracking-wider transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>MAIN MENU</span>
        </button>

        <button
          onClick={handleShare}
          className="p-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Copy score"
          aria-label="Share score"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
