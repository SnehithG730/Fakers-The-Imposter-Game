import React, { useState, useEffect } from 'react';
import { TeamId } from '../types';
import { ShieldAlert, Check, X } from 'lucide-react';

interface GuessModalProps {
  currentTeamId: TeamId;
  myCurrentGuess: TeamId | null;
  onSubmitGuess: (suspectedTeamId: TeamId) => void;
  onClose?: () => void;
}

const TEAMS_LIST: Array<{ id: TeamId; name: string; element: string; symbol: string }> = [
  { id: 'prudhvi', name: 'PRUDHVI', element: 'Earth', symbol: '🌍' },
  { id: 'vayu', name: 'VAYU', element: 'Air', symbol: '💨' },
  { id: 'jal', name: 'JAL', element: 'Water', symbol: '🌊' },
  { id: 'aakash', name: 'AAKASH', element: 'Space / Cosmos', symbol: '🌌' },
  { id: 'agni', name: 'AGNI', element: 'Fire', symbol: '🔥' }
];

export const GuessModal: React.FC<GuessModalProps> = ({
  currentTeamId,
  myCurrentGuess,
  onSubmitGuess,
  onClose
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<TeamId | null>(myCurrentGuess);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    if (selectedSuspect) {
      onSubmitGuess(selectedSuspect);
      if (onClose) onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guess-modal-title"
      className="p-6 bg-gray-900/95 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 id="guess-modal-title" className="text-lg font-black text-white font-display">
              Cast Imposter Accusation
            </h3>
            <p className="text-xs text-gray-400">
              Select the elemental realm you believe does NOT have the secret keyword
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close accusation modal"
            className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 my-6">
        {TEAMS_LIST.map(team => {
          const isSelected = selectedSuspect === team.id;
          const isSelf = team.id === currentTeamId;

          return (
            <button
              key={team.id}
              type="button"
              onClick={() => setSelectedSuspect(team.id)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-b from-rose-950/80 to-red-900/60 border-rose-500 shadow-lg shadow-rose-900/40 scale-105'
                  : 'bg-gray-800/50 hover:bg-gray-800 border-white/10'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <span className="text-3xl mb-1">{team.symbol}</span>
              <span className="text-sm font-black font-display text-white">{team.name}</span>
              <span className="text-[10px] text-gray-400">{team.element}</span>
              {isSelf && (
                <span className="text-[9px] px-1.5 py-0.5 mt-1 rounded bg-white/10 text-gray-300">
                  (You)
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedSuspect}
          className="px-6 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-900/40 disabled:opacity-50 transition-all font-display"
        >
          Confirm Accusation
        </button>
      </div>
    </div>
  );
};
