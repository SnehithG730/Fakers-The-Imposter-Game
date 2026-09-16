import React, { useState } from 'react';
import { useGameSocket } from '../context/SocketContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { Scoreboard } from '../components/Scoreboard';
import {
  Play,
  Pause,
  Zap,
  Lock,
  Eye,
  SkipForward,
  RotateCcw,
  Sparkles,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
  Radio,
  Clock,
  Shuffle,
  Volume2,
  Trash2,
  RefreshCw,
  Award,
  Crown
} from 'lucide-react';
import { BuzzerMode, RoundState, TeamId } from '../types';

const TEAMS_METADATA: Array<{
  id: TeamId;
  name: string;
  element: string;
  symbol: string;
  color: string;
  borderColor: string;
  bgColor: string;
}> = [
  {
    id: 'prudhvi',
    name: 'PRUDHVI',
    element: 'Earth',
    symbol: '🌍',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/40'
  },
  {
    id: 'vayu',
    name: 'VAYU',
    element: 'Air',
    symbol: '💨',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-950/40'
  },
  {
    id: 'jal',
    name: 'JAL',
    element: 'Water',
    symbol: '🌊',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-950/40'
  },
  {
    id: 'aakash',
    name: 'AAKASH',
    element: 'Cosmos',
    symbol: '🌌',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-950/40'
  },
  {
    id: 'agni',
    name: 'AGNI',
    element: 'Fire',
    symbol: '🔥',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-950/40'
  }
];

const STATE_BADGES: Record<RoundState, { label: string; color: string; border: string }> = {
  READY: { label: 'ROUND READY (SETUP)', color: 'text-amber-300 bg-amber-950/60', border: 'border-amber-500/40' },
  ACTIVE: { label: 'DISCUSSION ACTIVE', color: 'text-emerald-300 bg-emerald-950/60', border: 'border-emerald-500/40' },
  BUZZER_READY: { label: 'BUZZER ARMED', color: 'text-yellow-300 bg-yellow-950/60', border: 'border-yellow-500/40' },
  BUZZER_ACTIVE: { label: 'BUZZER OPEN (ACTIVE)', color: 'text-cyan-300 bg-cyan-950/60 animate-pulse', border: 'border-cyan-500/40' },
  LOCKED: { label: 'DISCUSSION LOCKED', color: 'text-red-300 bg-red-950/60', border: 'border-red-500/40' },
  REVEALED: { label: 'TRUTH REVEALED', color: 'text-purple-300 bg-purple-950/60', border: 'border-purple-500/40' }
};

export const AdminDashboard: React.FC = () => {
  const {
    adminState,
    isConnected,
    startRound,
    pauseTimer,
    resumeTimer,
    adjustTimer,
    openBuzzer,
    lockBuzzer,
    clearBuzzer,
    endRound,
    revealAnswer,
    nextRound,
    resetGame,
    manualSync
  } = useGameSocket();

  // Custom configuration form state
  const [themeInput, setThemeInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [durationSec, setDurationSec] = useState<number>(60);
  const [selectedBuzzerMode, setSelectedBuzzerMode] = useState<BuzzerMode>('all-teams-can-buzz');
  const [forcedImposter, setForcedImposter] = useState<TeamId | 'auto'>('auto');

  // Confirmation Modals
  const [showRevealModal, setShowRevealModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isActionPending, setIsActionPending] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Preset search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3000);
  };

  if (!adminState) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-display tracking-wider">
          Connecting to Supreme Arbiter Control Center...
        </p>
      </div>
    );
  }

  const presets = adminState.availablePresets || [];
  const categories = ['All', ...Array.from(new Set(presets.map(p => p.category)))];

  const filteredPresets = presets.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApplyPreset = (preset: { theme: string; keyword: string }) => {
    setThemeInput(preset.theme);
    setKeywordInput(preset.keyword);
    showToast(`Loaded Preset: "${preset.theme}"`);
  };

  const handlePickRandomPreset = () => {
    if (presets.length === 0) return;
    const rand = presets[Math.floor(Math.random() * presets.length)];
    setThemeInput(rand.theme);
    setKeywordInput(rand.keyword);
    showToast(`Shuffled to: "${rand.theme}"`);
  };

  const handleStartRound = () => {
    if (isActionPending) return;
    setIsActionPending(true);

    const config = {
      theme: themeInput.trim() || adminState.theme,
      keyword: keywordInput.trim() || adminState.keyword,
      durationSec,
      buzzerMode: selectedBuzzerMode,
      imposterTeamId: forcedImposter !== 'auto' ? forcedImposter : undefined
    };

    startRound(config);
    showToast(`Round #${adminState.currentRoundNumber} Started`);
    setTimeout(() => setIsActionPending(false), 500);
  };

  const handleConfirmReveal = () => {
    if (isActionPending) return;
    setIsActionPending(true);
    revealAnswer();
    setShowRevealModal(false);
    showToast('Authoritative Truth Revealed to all teams!');
    setTimeout(() => setIsActionPending(false), 500);
  };

  const handleConfirmReset = () => {
    if (isActionPending) return;
    setIsActionPending(true);
    resetGame();
    setShowResetModal(false);
    showToast('Game session has been completely reset.');
    setTimeout(() => setIsActionPending(false), 500);
  };

  const isRoundActive = adminState.roundState === 'ACTIVE' || adminState.roundState === 'BUZZER_ACTIVE';
  const isBuzzerOpen = adminState.buzzerState.isOpen;
  const isRevealed = adminState.roundState === 'REVEALED';
  const isReady = adminState.roundState === 'READY';
  const isLocked = adminState.roundState === 'LOCKED';

  const imposterTeamMeta =
    TEAMS_METADATA.find(t => t.id === adminState.imposterTeamId) || TEAMS_METADATA[0];

  const onlineTeamCount = Object.values(adminState.onlineTeams).filter(Boolean).length;
  const stateBadge = STATE_BADGES[adminState.roundState] || STATE_BADGES.READY;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-950 via-slate-950 to-gray-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Feedback Toast Notification */}
        {feedbackToast && (
          <div className="fixed top-20 right-6 z-50 bg-amber-500 text-gray-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-amber-300 animate-bounce flex items-center space-x-2 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* TOP STATUS BAR: Game Identity, Server Status, Presences & Authoritative Clock */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Title & Game State Badge */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-800 p-0.5 shadow-lg shadow-amber-900/30 shrink-0">
                <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                    Supreme Arbiter Console
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    Round #{adminState.currentRoundNumber}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${stateBadge.color} ${stateBadge.border}`}
                  >
                    {stateBadge.label}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-wide">
                  GAME MASTER COMMAND
                </h2>
              </div>
            </div>

            {/* Connection & Presence Status */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Live Connection Pill */}
              <div
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border text-xs font-bold ${
                  isConnected
                    ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-950/50 border-red-500/30 text-red-300'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-red-400'}`} />
                <span>{isConnected ? 'Server Synced' : 'Reconnecting...'}</span>
                <button
                  onClick={manualSync}
                  title="Force State Synchronization"
                  className="ml-1 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Online Teams Pill */}
              <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
                <Users className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-300 font-bold">
                  {onlineTeamCount}/5 Teams Online
                </span>
              </div>
            </div>

            {/* Authoritative Timer Controller */}
            <div className="flex items-center space-x-4 bg-black/50 px-5 py-3 rounded-2xl border border-white/10">
              <TimerDisplay timer={adminState.timer} size="md" />
              
              <div className="flex flex-col space-y-1">
                {adminState.timer.isRunning ? (
                  <button
                    onClick={pauseTimer}
                    disabled={isRevealed || isReady}
                    className="p-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 disabled:opacity-30 transition-all"
                    title="Pause Authoritative Timer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={resumeTimer}
                    disabled={isRevealed || isReady || adminState.timer.remainingSec <= 0}
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 disabled:opacity-30 transition-all"
                    title="Resume Authoritative Timer"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex space-x-1">
                  <button
                    onClick={() => adjustTimer(-15)}
                    disabled={isRevealed || isReady}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] disabled:opacity-30 transition-all font-mono"
                    title="Subtract 15 seconds"
                  >
                    -15s
                  </button>
                  <button
                    onClick={() => adjustTimer(15)}
                    disabled={isRevealed || isReady}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] disabled:opacity-30 transition-all font-mono"
                    title="Add 15 seconds"
                  >
                    +15s
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MASTER AUTHORITATIVE ACTIONS CONTROLLER BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. START ROUND */}
          <button
            onClick={handleStartRound}
            disabled={isRoundActive || isRevealed}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold font-display shadow-lg shadow-emerald-900/40 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <Play className="w-6 h-6 mb-1" />
            <span className="text-xs">START ROUND</span>
          </button>

          {/* 2. OPEN BUZZER */}
          <button
            onClick={() => openBuzzer(selectedBuzzerMode)}
            disabled={isBuzzerOpen || isRevealed || isReady}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold font-display shadow-lg shadow-cyan-900/40 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <Zap className="w-6 h-6 mb-1 text-yellow-300" />
            <span className="text-xs">OPEN BUZZER</span>
          </button>

          {/* 3. LOCK BUZZER / END ROUND */}
          <button
            onClick={() => {
              if (isBuzzerOpen) lockBuzzer();
              else endRound();
            }}
            disabled={(!isBuzzerOpen && isLocked) || isReady || isRevealed}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold font-display shadow-lg shadow-red-900/40 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <Lock className="w-6 h-6 mb-1" />
            <span className="text-xs">{isBuzzerOpen ? 'LOCK BUZZER' : 'LOCK ROUND'}</span>
          </button>

          {/* 4. REVEAL ANSWER */}
          <button
            onClick={() => setShowRevealModal(true)}
            disabled={isReady || isRevealed}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-bold font-display shadow-lg shadow-purple-900/40 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <Eye className="w-6 h-6 mb-1" />
            <span className="text-xs">REVEAL ANSWER</span>
          </button>

          {/* 5. NEXT ROUND */}
          <button
            onClick={() => {
              nextRound();
              showToast('Advanced to Next Round!');
            }}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-700 hover:from-amber-500 hover:to-yellow-600 text-white font-bold font-display shadow-lg shadow-amber-900/40 active:scale-95 transition-all"
          >
            <SkipForward className="w-6 h-6 mb-1" />
            <span className="text-xs">NEXT ROUND</span>
          </button>

          {/* 6. RESET GAME */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold font-display border border-white/10 active:scale-95 transition-all"
          >
            <RotateCcw className="w-6 h-6 mb-1 text-gray-400" />
            <span className="text-xs">RESET GAME</span>
          </button>
        </div>

        {/* POST-REVEAL TRUTH & SCORING BREAKDOWN (Prominently rendered when REVEALED) */}
        {isRevealed && adminState.revealData && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-950/50 via-black to-slate-950 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-500/30 pb-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-purple-400">
                    Round #{adminState.currentRoundNumber} Revelation
                  </span>
                  <h3 className="text-2xl font-black text-white font-display">
                    AUTHORITATIVE TRUTH UNVEILED
                  </h3>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold font-display">
                {adminState.revealData.roundSummary}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Secret Keyword Unmasked */}
              <div className="p-5 rounded-2xl bg-black/60 border border-purple-500/40 text-center">
                <span className="text-xs uppercase font-bold tracking-widest text-gray-400 block mb-1">
                  Secret Keyword (Given to 4 Teams)
                </span>
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 font-display tracking-widest">
                  {adminState.revealData.keyword}
                </span>
              </div>

              {/* Imposter Unmasked */}
              <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-center">
                <span className="text-xs uppercase font-bold tracking-widest text-rose-300 block mb-1">
                  The Actual Imposter
                </span>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{imposterTeamMeta.symbol}</span>
                  <span className="text-3xl sm:text-4xl font-black text-rose-300 font-display tracking-widest">
                    {adminState.revealData.imposterTeamName}
                  </span>
                </div>
              </div>
            </div>

            {/* Voting & Guess Outcomes Table */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-gray-300 flex items-center">
                <Award className="w-4 h-4 text-amber-400 mr-2" />
                Council Accusations & Score Changes
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {adminState.revealData.guesses.map((g, idx) => {
                  const guesser = TEAMS_METADATA.find(t => t.id === g.guessingTeamId);
                  const suspect = TEAMS_METADATA.find(t => t.id === g.suspectedTeamId);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        g.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{guesser?.name}</span>
                        <span className="text-gray-400">accused</span>
                        <span className="font-bold">{suspect?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-bold font-mono">
                        {g.isCorrect ? (
                          <span className="text-emerald-400 flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> +20 pts
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> 0 pts
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TEAM MONITORING CARDS: 5 REALMS LIVE PRESENCE & ACTIVITY */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-display">
                Elemental Realms Live Monitoring (5 Teams)
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Authoritative Arbiter View
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TEAMS_METADATA.map(team => {
              const isOnline = adminState.onlineTeams[team.id];
              const isImposter = team.id === adminState.imposterTeamId;
              const buzzEntry = adminState.buzzerState.queue.find(b => b.teamId === team.id);
              const guessEntry = adminState.guesses[team.id];
              const suspectMeta = guessEntry
                ? TEAMS_METADATA.find(t => t.id === guessEntry.suspectedTeamId)
                : null;
              const score = adminState.scores[team.id] || 0;

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-2xl border transition-all ${team.bgColor} ${team.borderColor} flex flex-col justify-between space-y-3 relative overflow-hidden`}
                >
                  {/* Top: Team Name & Status */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{team.symbol}</span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-gray-600'
                          }`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className={`text-base font-black font-display ${team.color}`}>
                        {team.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {score} pts
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      Element of {team.element}
                    </span>
                  </div>

                  {/* Role Assignment Badge */}
                  <div className="pt-1">
                    {isImposter ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider font-display">
                        Designated Imposter
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider font-display">
                        Normal Realm Team
                      </span>
                    )}
                  </div>

                  {/* Activity Details: Buzzer & Guess */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs">
                    {/* Buzzer Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 flex items-center">
                        <Zap className="w-3 h-3 mr-1 text-yellow-400" /> Buzzer:
                      </span>
                      {buzzEntry ? (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                          Rank #{buzzEntry.order}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500">Not buzzed</span>
                      )}
                    </div>

                    {/* Guess Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 flex items-center">
                        <Eye className="w-3 h-3 mr-1 text-purple-400" /> Guess:
                      </span>
                      {guessEntry ? (
                        <span className="font-bold text-rose-300 text-[10px]">
                          Accused {suspectMeta?.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECRETS & LIVE ACTIVITY MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">

            {/* Authoritative Secrets Display */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-display">
                    Authoritative Round Secrets (Arbiter Only)
                  </h3>
                </div>
                <span className="text-xs text-amber-400 font-semibold font-mono">
                  State: {adminState.roundState}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Theme */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                    Public Theme
                  </span>
                  <span className="text-lg font-black text-white font-display">
                    {adminState.theme}
                  </span>
                </div>

                {/* Secret Keyword */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                    Secret Keyword (4 Normal Teams)
                  </span>
                  <span className="text-lg font-black text-cyan-300 font-display">
                    {adminState.keyword}
                  </span>
                </div>

                {/* Assigned Imposter */}
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40">
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block mb-1">
                    Designated Imposter (1 Team)
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{imposterTeamMeta.symbol}</span>
                    <span className="text-lg font-black text-rose-300 font-display">
                      {imposterTeamMeta.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-Time Buzzer Queue & Guesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Live Buzzer Queue */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 mr-1.5" />
                      Live Buzzer Queue ({adminState.buzzerState.queue.length})
                    </span>
                    {adminState.buzzerState.queue.length > 0 && (
                      <button
                        onClick={clearBuzzer}
                        className="text-[10px] text-gray-400 hover:text-red-400 flex items-center transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Clear
                      </button>
                    )}
                  </div>

                  {adminState.buzzerState.queue.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">Buzzer queue is empty.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {adminState.buzzerState.queue.map(b => {
                        const firstBuzzTime = adminState.buzzerState.queue[0]?.buzzedAt || b.buzzedAt;
                        const deltaMs = b.buzzedAt - firstBuzzTime;
                        return (
                          <div
                            key={b.teamId}
                            className="flex items-center justify-between p-2 rounded-xl bg-gray-900/60 border border-white/5 text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold font-mono text-[10px]">
                                {b.order}
                              </span>
                              <span className="font-bold text-white font-display">{b.teamName}</span>
                            </div>
                            <div className="text-right font-mono text-[10px] text-gray-400">
                              <span>{new Date(b.buzzedAt).toLocaleTimeString()}</span>
                              {deltaMs > 0 && (
                                <span className="text-cyan-400 ml-1.5">+{deltaMs}ms</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Live Guesses Monitor */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block flex items-center">
                    <Eye className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
                    Submitted Accusations ({Object.keys(adminState.guesses).length}/5)
                  </span>

                  {Object.keys(adminState.guesses).length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No votes submitted yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {Object.values(adminState.guesses).map(g => {
                        const guessingMeta = TEAMS_METADATA.find(t => t.id === g.guessingTeamId);
                        const suspectMeta = TEAMS_METADATA.find(t => t.id === g.suspectedTeamId);
                        return (
                          <div
                            key={g.guessingTeamId}
                            className="flex items-center justify-between p-2 rounded-xl bg-gray-900/60 border border-white/5 text-xs"
                          >
                            <span className="font-bold text-white font-display">
                              {guessingMeta?.name}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-gray-400 text-[10px]">accuses</span>
                              <span className="font-bold text-rose-400 font-display">
                                {suspectMeta?.name}
                              </span>
                              {g.isCorrect ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ROUND SETUP & CUSTOM CONFIGURATION */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-display">
                  Round Setup & Custom Configuration
                </h3>
                <button
                  type="button"
                  onClick={handlePickRandomPreset}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle Preset</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Theme
                  </label>
                  <input
                    type="text"
                    value={themeInput}
                    onChange={e => setThemeInput(e.target.value)}
                    placeholder={`Current: ${adminState.theme}`}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Secret Keyword
                  </label>
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    placeholder={`Current: ${adminState.keyword}`}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Duration and Modes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Duration (Sec)
                  </label>
                  <div className="flex space-x-1.5">
                    {[30, 45, 60, 90].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setDurationSec(s)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          durationSec === s
                            ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold'
                            : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buzzer Mode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Buzzer Mode
                  </label>
                  <select
                    value={selectedBuzzerMode}
                    onChange={e => setSelectedBuzzerMode(e.target.value as BuzzerMode)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="all-teams-can-buzz">All Teams Can Buzz (Ranked Queue)</option>
                    <option value="first-buzzer-only">First Buzzer Only (Instant Lock)</option>
                  </select>
                </div>

                {/* Imposter Assignment */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Imposter Assignment
                  </label>
                  <select
                    value={forcedImposter}
                    onChange={e => setForcedImposter(e.target.value as TeamId | 'auto')}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="auto">Automatic (Fair Anti-Repeat)</option>
                    {TEAMS_METADATA.map(t => (
                      <option key={t.id} value={t.id}>
                        Force {t.name} ({t.element})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* PRESETS LIBRARY BROWSER */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white font-display">
                    Theme & Keyword Library ({presets.length} Curated Presets)
                  </h3>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search presets..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-gray-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 font-semibold">
                          {preset.category}
                        </span>
                        <span className="text-cyan-400/80">{preset.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                        {preset.theme}
                      </h4>
                      <p className="text-xs text-amber-300 font-semibold mt-0.5 font-mono">
                        {preset.keyword}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">
                        "{preset.hint}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="mt-3 w-full py-1.5 text-xs font-bold rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 transition-colors font-display"
                    >
                      Apply Preset
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Scoreboard & Realm Ledger */}
          <div className="lg:col-span-4 space-y-6">
            <Scoreboard
              scores={adminState.scores}
              onlineTeams={adminState.onlineTeams}
              imposterHistory={adminState.imposterHistory}
            />
          </div>
        </div>

        {/* MODAL: REVEAL CONFIRMATION STEP */}
        {showRevealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel max-w-md w-full p-6 rounded-3xl border-2 border-purple-500/50 shadow-2xl space-y-5 bg-gradient-to-b from-gray-950 to-purple-950/40">
              <div className="flex items-center space-x-3 text-purple-400">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display">
                    CONFIRM TRUTH REVEAL
                  </h3>
                  <span className="text-xs text-purple-300">
                    Authoritative Broadcast Warning
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to reveal the answer now? This will synchronously unmask the secret keyword{' '}
                <strong className="text-cyan-300 font-mono">"{adminState.keyword}"</strong> and reveal the imposter realm{' '}
                <strong className="text-rose-300 font-display">"{imposterTeamMeta.name}"</strong> to all five connected teams.
              </p>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Secret Keyword:</span>
                  <span className="text-cyan-300 font-bold">{adminState.keyword}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Actual Imposter:</span>
                  <span className="text-rose-400 font-bold">{imposterTeamMeta.name}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Votes Cast:</span>
                  <span className="text-amber-300 font-bold">{Object.keys(adminState.guesses).length} of 5</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReveal}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold font-display shadow-lg shadow-purple-900/40 active:scale-95 transition-all"
                >
                  Confirm & Reveal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RESET GAME CONFIRMATION STEP */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel max-w-md w-full p-6 rounded-3xl border-2 border-red-500/50 shadow-2xl space-y-5 bg-gradient-to-b from-gray-950 to-red-950/40">
              <div className="flex items-center space-x-3 text-red-400">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display">
                    RESET GAME SESSION
                  </h3>
                  <span className="text-xs text-red-300">
                    Irreversible Session Reset
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                This will wipe all accumulated team scores, clear the round history, reset the round number to #1, and reinitialize the match. Are you sure?
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold font-display shadow-lg shadow-red-900/40 active:scale-95 transition-all"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
