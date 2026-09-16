import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameSocket } from '../context/SocketContext';
import { audioEngine } from '../utils/AudioEngine';
import { LogOut, Volume2, VolumeX, Shield, Radio, Sparkles } from 'lucide-react';
import { TeamId } from '../types';

const TEAM_BADGES: Record<TeamId, { name: string; icon: string; color: string }> = {
  prudhvi: { name: 'PRUDHVI', icon: '🌍', color: 'from-emerald-600 to-emerald-950 text-emerald-300 border-emerald-500/40' },
  vayu: { name: 'VAYU', icon: '💨', color: 'from-cyan-600 to-cyan-950 text-cyan-300 border-cyan-500/40' },
  jal: { name: 'JAL', icon: '🌊', color: 'from-blue-600 to-blue-950 text-blue-300 border-blue-500/40' },
  aakash: { name: 'AAKASH', icon: '🌌', color: 'from-purple-600 to-purple-950 text-purple-300 border-purple-500/40' },
  agni: { name: 'AGNI', icon: '🔥', color: 'from-rose-600 to-rose-950 text-rose-300 border-rose-500/40' }
};

export const Navbar: React.FC = () => {
  const { session, logout } = useAuth();
  const { isConnected, teamState, adminState } = useGameSocket();
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.getIsMuted());

  const toggleSound = () => {
    const nextState = audioEngine.toggleMute();
    setIsMuted(nextState);
  };

  const currentRound = adminState?.currentRoundNumber || teamState?.currentRoundNumber || 1;
  const roundState = adminState?.roundState || teamState?.roundState || 'READY';

  const getStateBadge = () => {
    switch (roundState) {
      case 'READY':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-950/80 text-yellow-400 border border-yellow-500/30 tracking-wider">ROUND READY</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 animate-pulse tracking-wider">ACTIVE</span>;
      case 'BUZZER_ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 animate-pulse tracking-wider">BUZZER OPEN</span>;
      case 'LOCKED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-950/80 text-red-400 border border-red-500/30 tracking-wider">LOCKED</span>;
      case 'REVEALED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-950/80 text-purple-400 border border-purple-500/30 tracking-wider">REVEALED</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase font-display">The Five Elements</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">Round #{currentRound}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-display">
              IMPOSTER
            </h1>
          </div>
        </div>

        {/* Center Round State Pill */}
        <div className="hidden md:flex items-center space-x-3">
          {getStateBadge()}
        </div>

        {/* Right Section: Connection, Team Badge, Sound & Logout */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
            <span className={`hidden sm:inline text-[11px] font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* User / Team Badge */}
          {session && (
            <div className="flex items-center space-x-2">
              {session.role === 'ADMIN' ? (
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-inner">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-display">ARBITER</span>
                </div>
              ) : session.teamId && TEAM_BADGES[session.teamId] ? (
                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r ${TEAM_BADGES[session.teamId].color} border text-xs font-bold shadow-inner`}>
                  <span>{TEAM_BADGES[session.teamId].icon}</span>
                  <span className="font-display tracking-wider">{TEAM_BADGES[session.teamId].name}</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            title={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            aria-label="Logout from session"
            title="Logout from session"
            className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
