import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameSocket } from '../context/SocketContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { BuzzerButton } from '../components/BuzzerButton';
import { GuessModal } from '../components/GuessModal';
import { Scoreboard } from '../components/Scoreboard';
import { ElementalBackground } from '../components/canvas/ElementalBackground';
import {
  Eye,
  EyeOff,
  ShieldAlert,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Mountain,
  Wind,
  Waves,
  Orbit,
  Radio,
  Clock,
  Crown,
  Lock
} from 'lucide-react';
import { TeamId } from '../types';

interface ElementVisuals {
  name: string;
  element: string;
  symbol: string;
  icon: React.ReactNode;
  bgGradient: string;
  cardBg: string;
  borderAccent: string;
  glowColor: string;
  textAccent: string;
  themeClass: string;
  desc: string;
}

const ELEMENT_THEMES: Record<TeamId, ElementVisuals> = {
  prudhvi: {
    name: 'PRUDHVI',
    element: 'Earth & Stone',
    symbol: '🌍',
    icon: <Mountain className="w-8 h-8 text-emerald-400" />,
    bgGradient: 'from-emerald-950/40 via-gray-950 to-gray-950',
    cardBg: 'bg-emerald-950/30 border-emerald-500/30',
    borderAccent: 'border-emerald-500/40',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    textAccent: 'text-emerald-400',
    themeClass: 'theme-prudhvi',
    desc: 'Steadfast, resilient, and unyielding as ancient stone.'
  },
  vayu: {
    name: 'VAYU',
    element: 'Air & Wind',
    symbol: '💨',
    icon: <Wind className="w-8 h-8 text-cyan-400" />,
    bgGradient: 'from-cyan-950/40 via-gray-950 to-gray-950',
    cardBg: 'bg-cyan-950/30 border-cyan-500/30',
    borderAccent: 'border-cyan-500/40',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    textAccent: 'text-cyan-400',
    themeClass: 'theme-vayu',
    desc: 'Swift, invisible, and carrying whispers across the realm.'
  },
  jal: {
    name: 'JAL',
    element: 'Water & Ocean',
    symbol: '🌊',
    icon: <Waves className="w-8 h-8 text-blue-400" />,
    bgGradient: 'from-blue-950/40 via-gray-950 to-gray-950',
    cardBg: 'bg-blue-950/30 border-blue-500/30',
    borderAccent: 'border-blue-500/40',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    textAccent: 'text-blue-400',
    themeClass: 'theme-jal',
    desc: 'Fluid, deep, reflecting all light and masking secrets.'
  },
  aakash: {
    name: 'AAKASH',
    element: 'Space & Cosmos',
    symbol: '🌌',
    icon: <Orbit className="w-8 h-8 text-purple-400" />,
    bgGradient: 'from-purple-950/40 via-gray-950 to-gray-950',
    cardBg: 'bg-purple-950/30 border-purple-500/30',
    borderAccent: 'border-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    textAccent: 'text-purple-400',
    themeClass: 'theme-aakash',
    desc: 'Boundless, eternal, holding the stars in orbital dance.'
  },
  agni: {
    name: 'AGNI',
    element: 'Fire & Energy',
    symbol: '🔥',
    icon: <Flame className="w-8 h-8 text-rose-400" />,
    bgGradient: 'from-rose-950/40 via-gray-950 to-gray-950',
    cardBg: 'bg-rose-950/30 border-rose-500/30',
    borderAccent: 'border-rose-500/40',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    textAccent: 'text-rose-400',
    themeClass: 'theme-agni',
    desc: 'Radiant, fierce, consuming shadows with incandescent light.'
  }
};

export const TeamDashboard: React.FC = () => {
  const { session } = useAuth();
  const { teamState, isConnected, buzzIn, submitGuess } = useGameSocket();

  // Privacy visor: allows in-person players to shield secret card
  const [isPrivacyHidden, setIsPrivacyHidden] = useState<boolean>(false);
  const [showGuessModal, setShowGuessModal] = useState<boolean>(false);

  const teamId = (session?.teamId || 'prudhvi') as TeamId;
  const theme = ELEMENT_THEMES[teamId] || ELEMENT_THEMES.prudhvi;

  if (!teamState) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-display tracking-wider">
          Connecting to Elemental Gateway...
        </p>
      </div>
    );
  }

  const isImposter = teamState.role === 'IMPOSTER';
  const isRevealed = teamState.roundState === 'REVEALED';
  const isRoundActive = teamState.roundState === 'ACTIVE' || teamState.roundState === 'BUZZER_ACTIVE';

  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-gradient-to-b ${theme.bgGradient} py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-500 relative`}>
      {/* 3D Elemental Environment Scene */}
      <ElementalBackground teamId={teamId} />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">

        {/* Top Header & Elemental Identity Banner */}
        <div className={`glass-panel p-6 rounded-3xl border ${theme.borderAccent} shadow-2xl relative overflow-hidden`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Team Emblem & Name */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center p-3 shadow-inner">
                {theme.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Elemental Realm
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                    Round #{teamState.currentRoundNumber}
                  </span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-black font-display tracking-wider ${theme.textAccent}`}>
                  {theme.name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{theme.desc}</p>
              </div>
            </div>

            {/* Authoritative Synchronized Timer */}
            <div className="flex items-center space-x-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Discussion Clock
                </span>
                <span className="text-xs font-medium text-purple-300">
                  {teamState.timer.isRunning ? 'Countdown Active' : 'Clock Standby'}
                </span>
              </div>
              <TimerDisplay timer={teamState.timer} size="lg" />
            </div>
          </div>
        </div>

        {/* Main Grid: Secret / Imposter Area + Buzzer & Guesses */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Secret Shield / Role Card / Buzzer */}
          <div className="lg:col-span-8 space-y-6">

            {/* Privacy Shielded Secret Word Card */}
            <div className={`glass-panel p-6 sm:p-8 rounded-3xl border ${theme.borderAccent} shadow-2xl relative overflow-hidden transition-all`}>
              
              {/* Top Banner: Public Theme & Privacy Visor Toggle */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block">
                    Public Round Theme
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                    {teamState.theme || 'Awaiting Next Round Theme'}
                  </h3>
                </div>

                {/* Privacy Visor Button */}
                <button
                  onClick={() => setIsPrivacyHidden(!isPrivacyHidden)}
                  aria-label={isPrivacyHidden ? 'Show secret card' : 'Hide secret card'}
                  title={isPrivacyHidden ? 'Show secret card' : 'Hide secret card'}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors text-xs font-medium"
                >
                  {isPrivacyHidden ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  <span className="hidden sm:inline">{isPrivacyHidden ? 'Reveal Card' : 'Shield Card'}</span>
                </button>
              </div>

              {/* Secret Area Content */}
              {isPrivacyHidden ? (
                /* Privacy Shield Active */
                <div className="py-12 flex flex-col items-center justify-center text-center bg-black/40 rounded-2xl border border-white/5">
                  <EyeOff className="w-10 h-10 text-gray-500 mb-2" />
                  <span className="text-sm font-bold text-gray-400 font-display uppercase tracking-wider">
                    Privacy Shield Active
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Click 'Reveal Card' when safe from neighboring eyes
                  </p>
                </div>
              ) : isImposter ? (
                /* IMPOSTER VIEW */
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center rounded-2xl bg-gradient-to-b from-rose-950/60 via-black to-slate-950 border-2 border-rose-500/50 shadow-inner">
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black tracking-widest uppercase mb-3">
                    <ShieldAlert className="w-4 h-4" />
                    <span>YOU ARE THE IMPOSTER</span>
                  </div>

                  <h4 className="text-2xl sm:text-4xl font-black text-rose-400 font-display tracking-widest mb-2">
                    SECRET UNKNOWN
                  </h4>

                  <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
                    You do not know the secret keyword. Blend into the discussion, observe the other four elemental realms, and avoid suspicion!
                  </p>
                </div>
              ) : (
                /* NORMAL TEAM VIEW */
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center rounded-2xl bg-gradient-to-b from-black/60 via-black/40 to-slate-950 border border-white/10 shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
                    Your Realm's Secret Keyword
                  </span>

                  <h4 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 font-display tracking-widest my-2 filter drop-shadow">
                    {teamState.ownKeyword || teamState.keyword || '---'}
                  </h4>

                  <p className="text-xs text-gray-400 mt-2">
                    Share clues subtly. One of the other four realms does NOT have this word.
                  </p>
                </div>
              )}
            </div>

            {/* Buzzer and Accusation Controls */}
            <div className={`glass-panel p-6 sm:p-8 rounded-3xl border ${theme.borderAccent} shadow-2xl`}>
              {isRevealed ? (
                /* Truth Revealed View */
                <div className="text-center py-6 space-y-4">
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold uppercase tracking-widest">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span>TRUTH REVEALED</span>
                  </div>

                  <h3 className="text-2xl font-black text-white font-display">
                    Round #{teamState.currentRoundNumber} Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mt-4">
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Secret Keyword
                      </span>
                      <strong className="text-amber-300 text-lg font-display block mt-0.5">
                        {teamState.revealData?.keyword}
                      </strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        True Imposter
                      </span>
                      <strong className="text-rose-400 text-lg font-display block mt-0.5">
                        {teamState.revealData?.imposterTeamName}
                      </strong>
                    </div>
                  </div>

                  {teamState.revealData?.guesses && teamState.revealData.guesses.length > 0 && (
                    <div className="mt-4 max-w-lg mx-auto p-3 rounded-2xl bg-black/30 border border-white/5 text-left text-xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Elemental Accusations
                      </span>
                      <div className="space-y-1">
                        {teamState.revealData.guesses.map((g, idx) => (
                          <div key={idx} className="flex items-center justify-between text-gray-300">
                            <span className="font-semibold uppercase font-display">{g.guessingTeamId}</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-gray-500">accused</span>
                              <span className="font-bold text-rose-400 uppercase font-display">{g.suspectedTeamId}</span>
                              {g.isCorrect ? (
                                <span className="text-emerald-400 text-[10px] font-bold ml-1 flex items-center">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Correct (+20)
                                </span>
                              ) : (
                                <span className="text-rose-500 text-[10px] font-bold ml-1">
                                  Wrong
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Active Buzzer & Accusation View */
                <div className="w-full flex flex-col items-center space-y-6">
                  
                  {/* Authoritative Tactile Buzzer Orb */}
                  <BuzzerButton
                    isOpen={teamState.buzzerState.isOpen}
                    hasBuzzed={teamState.buzzerState.hasBuzzed}
                    myBuzzOrder={teamState.buzzerState.myBuzzOrder}
                    onBuzz={buzzIn}
                    teamId={teamId}
                  />

                  {/* Accusation / Vote Strip */}
                  {isRoundActive && (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-black/50 border border-white/10 gap-3 shadow-inner">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white uppercase font-display block">
                            Your Imposter Accusation
                          </span>
                          <span className="text-xs text-gray-400">
                            {teamState.myGuess ? (
                              <span className="text-emerald-400 font-semibold">
                                Accusing: <strong>{teamState.myGuess.toUpperCase()}</strong>
                              </span>
                            ) : (
                              'No accusation cast yet'
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowGuessModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-red-950/80 hover:from-rose-900 hover:to-red-900 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-rose-400 font-display"
                      >
                        {teamState.myGuess ? 'Change Accusation' : 'Accuse Imposter'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Suspect Accusation Modal */}
            {showGuessModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-xl">
                  <GuessModal
                    currentTeamId={teamId}
                    myCurrentGuess={teamState.myGuess}
                    onSubmitGuess={submitGuess}
                    onClose={() => setShowGuessModal(false)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Buzzer Feed & Realm Standings */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Buzzer Feed */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-sm font-bold text-white font-display">Live Buzzer Feed</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                  {teamState.buzzerState.queue.length} Buzzed
                </span>
              </div>

              {teamState.buzzerState.queue.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 rounded-2xl bg-black/30 border border-white/5">
                  No elements have buzzed in this round yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {teamState.buzzerState.queue.map((buzz) => (
                    <div
                      key={buzz.teamId}
                      className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold font-mono">
                          #{buzz.order}
                        </span>
                        <span className="text-sm font-bold text-white font-display">
                          {buzz.teamName}
                        </span>
                      </div>
                      {buzz.teamId === teamId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scoreboard */}
            <Scoreboard
              scores={teamState.scores}
              onlineTeams={teamState.onlineTeams}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
