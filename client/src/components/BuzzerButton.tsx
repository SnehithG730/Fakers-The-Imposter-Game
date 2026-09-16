import React, { useEffect } from 'react';
import { Zap, Lock, CheckCircle2 } from 'lucide-react';
import { TeamId } from '../types';

interface BuzzerButtonProps {
  isOpen: boolean;
  hasBuzzed: boolean;
  myBuzzOrder: number | null;
  onBuzz: () => void;
  teamId: TeamId;
  disabled?: boolean;
}

export const BuzzerButton: React.FC<BuzzerButtonProps> = ({
  isOpen,
  hasBuzzed,
  myBuzzOrder,
  onBuzz,
  disabled = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isOpen && !hasBuzzed && !disabled) {
        e.preventDefault();
        onBuzz();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasBuzzed, disabled, onBuzz]);

  if (hasBuzzed) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-3xl backdrop-blur-md shadow-2xl shadow-emerald-950/50 animate-glow">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 mb-3">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xl font-black text-emerald-300 font-display tracking-wider">
          BUZZED #{myBuzzOrder || 1}
        </span>
        <span className="text-xs text-emerald-400/80 mt-1">
          Your buzz has been registered on the authoritative server!
        </span>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-900/40 border border-gray-800 rounded-3xl opacity-70">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mb-3">
          <Lock className="w-8 h-8" />
        </div>
        <span className="text-base font-bold text-gray-400 font-display tracking-wider">
          BUZZER LOCKED
        </span>
        <span className="text-xs text-gray-500 mt-1">
          Awaiting Supreme Arbiter to open buzzer
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={onBuzz}
        disabled={disabled}
        aria-label="Buzz in now"
        className="group relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-cyan-400 via-cyan-500 to-blue-700 p-2 shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/80 active:scale-95 transition-all duration-150 transform cursor-pointer border-4 border-cyan-200/50 animate-pulse-fast"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-cyan-400 flex flex-col items-center justify-center text-white border-2 border-white/40 shadow-inner">
          <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-300 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
          <span className="text-2xl sm:text-3xl font-black font-display tracking-widest mt-1 text-white filter drop-shadow">
            BUZZ IN
          </span>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-cyan-200 mt-1 px-2 py-0.5 rounded-full bg-black/30">
            [SPACEBAR]
          </span>
        </div>
      </button>
      <p className="text-xs text-cyan-300/80 mt-4 font-medium animate-pulse">
        ? Click orb or press SPACEBAR to identify the Imposter!
      </p>
    </div>
  );
};
