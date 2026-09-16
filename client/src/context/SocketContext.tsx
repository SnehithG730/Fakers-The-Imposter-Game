import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { AdminGameStatePayload, ClientTeamPayload, RevealPayload, RoundConfig, TeamId } from '../types';
import { audioEngine } from '../utils/AudioEngine';
import confetti from 'canvas-confetti';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  teamState: ClientTeamPayload | null;
  adminState: AdminGameStatePayload | null;
  // Admin triggers
  startRound: (config?: Partial<RoundConfig>) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  adjustTimer: (deltaSec: number) => void;
  openBuzzer: (mode?: 'first-buzzer-only' | 'all-teams-can-buzz') => void;
  lockBuzzer: () => void;
  clearBuzzer: () => void;
  endRound: () => void;
  revealAnswer: () => void;
  nextRound: (preset?: { theme: string; keyword: string }) => void;
  resetGame: () => void;
  // Team triggers
  buzzIn: () => void;
  submitGuess: (suspectedTeamId: TeamId) => void;
  manualSync: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [teamState, setTeamState] = useState<ClientTeamPayload | null>(null);
  const [adminState, setAdminState] = useState<AdminGameStatePayload | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !session) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
    const newSocket = io(backendUrl || undefined, {
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('team:state', (payload: ClientTeamPayload) => {
      setTeamState(payload);
    });

    newSocket.on('admin:state', (payload: AdminGameStatePayload) => {
      setAdminState(payload);
    });

    newSocket.on('game:buzzOccurred', () => {
      audioEngine.playBuzzer();
    });

    newSocket.on('game:revealed', (payload: RevealPayload) => {
      audioEngine.playReveal();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, session]);

  const startRound = (config?: Partial<RoundConfig>) => {
    socketRef.current?.emit('admin:startRound', config);
  };

  const pauseTimer = () => {
    socketRef.current?.emit('admin:pauseTimer');
  };

  const resumeTimer = () => {
    socketRef.current?.emit('admin:resumeTimer');
  };

  const adjustTimer = (deltaSec: number) => {
    socketRef.current?.emit('admin:adjustTimer', { deltaSec });
  };

  const openBuzzer = (mode?: 'first-buzzer-only' | 'all-teams-can-buzz') => {
    socketRef.current?.emit('admin:openBuzzer', { mode });
  };

  const lockBuzzer = () => {
    socketRef.current?.emit('admin:lockBuzzer');
  };

  const clearBuzzer = () => {
    socketRef.current?.emit('admin:clearBuzzer');
  };

  const endRound = () => {
    socketRef.current?.emit('admin:endRound');
  };

  const revealAnswer = () => {
    socketRef.current?.emit('admin:revealAnswer');
  };

  const nextRound = (preset?: { theme: string; keyword: string }) => {
    socketRef.current?.emit('admin:nextRound', { preset });
  };

  const resetGame = () => {
    socketRef.current?.emit('admin:resetGame');
  };

  const buzzIn = () => {
    socketRef.current?.emit('team:buzz');
  };

  const submitGuess = (suspectedTeamId: TeamId) => {
    socketRef.current?.emit('team:guess', { suspectedTeamId });
  };

  const manualSync = () => {
    socketRef.current?.emit('game:sync');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        teamState,
        adminState,
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
        buzzIn,
        submitGuess,
        manualSync
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useGameSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useGameSocket must be used within a SocketProvider');
  }
  return context;
};
