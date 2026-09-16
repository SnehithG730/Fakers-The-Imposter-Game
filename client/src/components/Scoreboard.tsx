import React from 'react';
import { TeamId } from '../types';
import { Trophy, Award } from 'lucide-react';

interface ScoreboardProps {
  scores: Record<TeamId, number>;
  onlineTeams?: Record<TeamId, boolean>;
  imposterHistory?: Array<{ round: number; imposterTeamId: TeamId; theme: string }>;
}

const TEAMS_LIST: Array<{ id: TeamId; name: string; element: string; symbol: string }> = [
  { id: 'prudhvi', name: 'PRUDHVI', element: 'Earth', symbol: '🌍' },
  { id: 'vayu', name: 'VAYU', element: 'Air', symbol: '💨' },
  { id: 'jal', name: 'JAL', element: 'Water', symbol: '🌊' },
  { id: 'aakash', name: 'AAKASH', element: 'Space / Cosmos', symbol: '🌌' },
  { id: 'agni', name: 'AGNI', element: 'Fire', symbol: '🔥' }
];

export const Scoreboard: React.FC<ScoreboardProps> = ({ scores, onlineTeams, imposterHistory }) => {
  const sortedTeams = [...TEAMS_LIST].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <div className="p-6 bg-gray-900/80 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-display">Elemental Standings</h3>
            <p className="text-xs text-gray-400">Leaderboard & cumulative points</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sortedTeams.map((team, index) => {
          const pts = scores[team.id] || 0;
          const isOnline = onlineTeams ? onlineTeams[team.id] : false;

          let rankBadge = 'bg-gray-800 text-gray-400';
          if (index === 0) rankBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          if (index === 1) rankBadge = 'bg-slate-300/20 text-slate-200 border border-slate-400/40';
          if (index === 2) rankBadge = 'bg-amber-800/20 text-amber-600 border border-amber-700/40';

          return (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-950/60 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rankBadge}`}>
                  {index + 1}
                </div>
                <span className="text-xl">{team.symbol}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white font-display">{team.name}</span>
                    {onlineTeams && (
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-600'}`} />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{team.element}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-lg font-black font-mono text-amber-300">{pts}</span>
                <span className="text-xs text-gray-400">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {imposterHistory && imposterHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2 mb-2 text-xs font-bold text-gray-400">
            <Award className="w-3.5 h-3.5" />
            <span>Past Imposters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {imposterHistory.map(h => {
              const impTeam = TEAMS_LIST.find(t => t.id === h.imposterTeamId);
              return (
                <span key={h.round} className="px-2 py-1 rounded-lg bg-gray-800 text-[11px] text-gray-300 border border-white/5">
                  R{h.round}: <strong className="text-rose-400">{impTeam?.name || h.imposterTeamId}</strong> ({h.theme})
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
