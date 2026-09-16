import React, { useEffect, useState } from 'react';
import { TimerState } from '../types';
import { audioEngine } from '../utils/AudioEngine';

interface TimerDisplayProps {
  timer: TimerState;
  size?: 'sm' | 'md' | 'lg';
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timer, size = 'md' }) => {
  const [displaySeconds, setDisplaySeconds] = useState<number>(timer.remainingSec);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const updateTimer = () => {
      if (!timer.isRunning || !timer.endsAt) {
        setDisplaySeconds(timer.remainingSec);
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
      setDisplaySeconds(remaining);

      // Play tick sound when 5 seconds or less remaining
      if (remaining <= 5 && remaining > 0) {
        audioEngine.playAlarm();
      }
    };

    updateTimer();
    interval = setInterval(updateTimer, 200);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.endsAt, timer.remainingSec]);

  const total = Math.max(1, timer.durationSec);
  const percentage = Math.min(100, Math.max(0, (displaySeconds / total) * 100));

  let colorClass = 'text-emerald-400 stroke-emerald-400';
  let bgGlow = 'rgba(16, 185, 129, 0.2)';
  if (displaySeconds <= 10) {
    colorClass = 'text-rose-500 stroke-rose-500';
    bgGlow = 'rgba(239, 68, 68, 0.35)';
  } else if (displaySeconds <= 20) {
    colorClass = 'text-amber-400 stroke-amber-400';
    bgGlow = 'rgba(245, 158, 11, 0.25)';
  }

  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 24;
  const stroke = size === 'lg' ? 6 : size === 'md' ? 5 : 4;
  const viewBoxSize = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative flex items-center justify-center transition-all duration-300"
        style={{ filter: timer.isRunning ? `drop-shadow(0 0 12px ${bgGlow})` : 'none' }}
      >
        <svg
          width={viewBoxSize}
          height={viewBoxSize}
          className="transform -rotate-90"
        >
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            className="stroke-gray-800"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            className={`transition-all duration-200 ${colorClass}`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-black tracking-tighter font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-base'} ${colorClass}`}>
            {displaySeconds}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              {timer.isRunning ? 'SEC' : 'PAUSED'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
