import { Server, Socket } from 'socket.io';
import { GameEngine } from './gameEngine.js';
import { verifyToken } from './auth.js';
import { AuthSession, BuzzerMode, RoundConfig, TeamId } from './types.js';

const ALL_TEAMS: TeamId[] = ['prudhvi', 'vayu', 'jal', 'aakash', 'agni'];

export function setupSocketHandler(io: Server, gameEngine: GameEngine) {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication token required'));
    }

    const session = verifyToken(token);
    if (!session) {
      return next(new Error('Invalid or expired authentication token'));
    }

    socket.data.session = session;
    next();
  });

  const broadcastFullState = () => {
    io.to('admin_room').emit('admin:state', gameEngine.getAdminPayload());

    ALL_TEAMS.forEach(teamId => {
      io.to(`team_${teamId}`).emit('team:state', gameEngine.getClientTeamPayload(teamId));
    });
  };

  io.on('connection', (socket: Socket) => {
    const session: AuthSession = socket.data.session;
    if (!session) {
      socket.disconnect(true);
      return;
    }

    if (session.role === 'ADMIN') {
      socket.join('admin_room');
      gameEngine.setAdminOnline(true);
      socket.emit('admin:state', gameEngine.getAdminPayload());
    } else if (session.role === 'TEAM' && session.teamId) {
      socket.join(`team_${session.teamId}`);
      gameEngine.setTeamOnline(session.teamId, true);
      socket.emit('team:state', gameEngine.getClientTeamPayload(session.teamId));
    }

    broadcastFullState();

    // --- ADMIN AUTHORITATIVE LIFECYCLE CONTROLS ---

    socket.on('admin:startRound', (config?: Partial<RoundConfig>) => {
      if (session.role !== 'ADMIN') return;
      const res = gameEngine.startRound(config);
      if (res.success) {
        io.emit('round:started', {
          round: gameEngine.getAdminPayload().currentRoundNumber,
          theme: gameEngine.getTheme(),
          durationSec: gameEngine.getTimerState().durationSec
        });
        broadcastFullState();
      }
    });

    socket.on('admin:pauseTimer', () => {
      if (session.role !== 'ADMIN') return;
      const res = gameEngine.pauseTimer();
      if (res.success) {
        io.emit('round:paused', { remainingSec: gameEngine.getTimerState().remainingSec });
        broadcastFullState();
      }
    });

    socket.on('admin:resumeTimer', () => {
      if (session.role !== 'ADMIN') return;
      const res = gameEngine.resumeTimer();
      if (res.success) {
        io.emit('round:resumed', { remainingSec: gameEngine.getTimerState().remainingSec });
        broadcastFullState();
      }
    });

    socket.on('admin:adjustTimer', (payload: { deltaSec: number }) => {
      if (session.role !== 'ADMIN') return;
      if (typeof payload?.deltaSec === 'number') {
        gameEngine.adjustTimer(payload.deltaSec);
        broadcastFullState();
      }
    });

    socket.on('admin:armBuzzer', () => {
      if (session.role !== 'ADMIN') return;
      const res = gameEngine.armBuzzer();
      if (res.success) {
        io.emit('buzzer:armed');
        broadcastFullState();
      }
    });

    socket.on('admin:openBuzzer', (payload?: { mode?: BuzzerMode }) => {
      if (session.role !== 'ADMIN') return;
      const res = gameEngine.openBuzzer(payload?.mode);
      if (res.success) {
        io.emit('buzzer:enabled', { mode: payload?.mode || 'all-teams-can-buzz' });
        broadcastFullState();
      }
    });

    socket.on('admin:lockBuzzer', () => {
      if (session.role !== 'ADMIN') return;
      gameEngine.lockBuzzer();
      io.emit('buzzer:disabled');
      broadcastFullState();
    });

    socket.on('admin:clearBuzzer', () => {
      if (session.role !== 'ADMIN') return;
      gameEngine.clearBuzzerQueue();
      broadcastFullState();
    });

    socket.on('admin:endRound', () => {
      if (session.role !== 'ADMIN') return;
      gameEngine.endRound();
      io.emit('round:ended');
      broadcastFullState();
    });

    socket.on('admin:revealAnswer', () => {
      if (session.role !== 'ADMIN') return;
      const res = gameEngine.revealAnswer();
      if (res.success) {
        io.emit('round:revealed', res.revealData);
        io.emit('game:revealed', res.revealData);
        broadcastFullState();
      }
    });

    socket.on('admin:nextRound', (payload?: { preset?: { theme: string; keyword: string } }) => {
      if (session.role !== 'ADMIN') return;
      const res = gameEngine.prepareNextRound(payload?.preset);
      if (res.success) {
        io.emit('round:next', {
          round: res.roundNumber,
          theme: gameEngine.getTheme()
        });
        broadcastFullState();
      }
    });

    socket.on('admin:resetGame', () => {
      if (session.role !== 'ADMIN') return;
      gameEngine.resetGame();
      io.emit('game:reset');
      broadcastFullState();
    });

    // --- TEAM AUTHORITATIVE ACTIONS ---

    socket.on('team:buzz', () => {
      if (session.role !== 'TEAM' || !session.teamId) return;
      const result = gameEngine.handleBuzz(session.teamId);
      if (result.success) {
        io.emit('team:buzzed', {
          teamId: session.teamId,
          order: result.order,
          buzzedAt: result.buzzedAt
        });
        io.emit('game:buzzOccurred', {
          teamId: session.teamId,
          order: result.order
        });
        broadcastFullState();
      }
    });

    socket.on('team:guess', (payload: { suspectedTeamId: TeamId }) => {
      if (session.role !== 'TEAM' || !session.teamId) return;
      if (!payload?.suspectedTeamId) return;
      const result = gameEngine.handleGuess(session.teamId, payload.suspectedTeamId);
      if (result.success) {
        io.emit('guess:submitted', {
          guessingTeamId: session.teamId,
          suspectedTeamId: payload.suspectedTeamId
        });
        broadcastFullState();
      }
    });

    socket.on('game:sync', () => {
      if (session.role === 'ADMIN') {
        socket.emit('admin:state', gameEngine.getAdminPayload());
      } else if (session.role === 'TEAM' && session.teamId) {
        socket.emit('team:state', gameEngine.getClientTeamPayload(session.teamId));
      }
    });

    socket.on('disconnect', () => {
      if (session.role === 'ADMIN') {
        const adminRoom = io.sockets.adapter.rooms.get('admin_room');
        if (!adminRoom || adminRoom.size === 0) {
          gameEngine.setAdminOnline(false);
        }
      } else if (session.role === 'TEAM' && session.teamId) {
        const teamRoom = io.sockets.adapter.rooms.get(`team_${session.teamId}`);
        if (!teamRoom || teamRoom.size === 0) {
          gameEngine.setTeamOnline(session.teamId, false);
        }
      }
      broadcastFullState();
    });
  });

  setInterval(() => {
    broadcastFullState();
  }, 1000);
}
