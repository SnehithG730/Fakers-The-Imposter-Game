import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../server/src/gameEngine.js';
import { authenticateUser, verifyToken } from '../server/src/auth.js';
import { TeamId } from '../server/src/types.js';

describe('Core Game Engine: The Five Elements - Imposter', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.resetGame();
  });

  describe('1. Authoritative State Machine & Round Lifecycle', () => {
    it('initializes authoritative state as READY', () => {
      expect(engine.getRoundState()).toBe('READY');
      const admin = engine.getAdminPayload();
      expect(admin.roundState).toBe('READY');
      expect(admin.currentRoundNumber).toBe(1);
    });

    it('transitions strictly through sequence: READY -> ACTIVE -> BUZZER_READY -> BUZZER_ACTIVE -> LOCKED -> REVEALED', () => {
      // READY -> ACTIVE
      expect(engine.startRound({ theme: 'Nature', keyword: 'Monsoon' }).success).toBe(true);
      expect(engine.getRoundState()).toBe('ACTIVE');

      // ACTIVE -> BUZZER_READY
      expect(engine.armBuzzer().success).toBe(true);
      expect(engine.getRoundState()).toBe('BUZZER_READY');

      // BUZZER_READY -> BUZZER_ACTIVE
      expect(engine.openBuzzer().success).toBe(true);
      expect(engine.getRoundState()).toBe('BUZZER_ACTIVE');

      // BUZZER_ACTIVE -> LOCKED
      expect(engine.lockBuzzer().success).toBe(true);
      expect(engine.getRoundState()).toBe('LOCKED');

      // LOCKED -> REVEALED
      const reveal = engine.revealAnswer();
      expect(reveal.success).toBe(true);
      expect(engine.getRoundState()).toBe('REVEALED');
      expect(reveal.revealData.keyword).toBe('Monsoon');
    });

    it('rejects buzzer arming or opening once state is REVEALED', () => {
      engine.startRound({ theme: 'Tech', keyword: 'AI' });
      engine.revealAnswer();
      expect(engine.getRoundState()).toBe('REVEALED');

      expect(engine.armBuzzer().success).toBe(false);
      expect(engine.openBuzzer().success).toBe(false);
    });

    it('resets game state and scores cleanly on resetGame()', () => {
      engine.startRound({ theme: 'Sports', keyword: 'Tennis' });
      engine.revealAnswer();
      engine.resetGame();

      expect(engine.getRoundState()).toBe('READY');
      expect(engine.getAdminPayload().currentRoundNumber).toBe(1);
      const scores = engine.getAdminPayload().scores;
      Object.values(scores).forEach(s => expect(s).toBe(0));
    });
  });

  describe('2. Server-Authoritative Timer & Refresh Resistance', () => {
    it('generates authoritative timestamps that remain synchronized on simulated client refresh', () => {
      engine.startRound({ theme: 'Science', keyword: 'Gravity', durationSec: 90 });
      const timerBefore = engine.getTimerState();

      expect(timerBefore.isRunning).toBe(true);
      expect(timerBefore.durationSec).toBe(90);
      expect(timerBefore.remainingSec).toBe(90);

      // Client reloads / requests new projection 100ms later
      const reloadedPayload = engine.getClientTeamPayload('vayu');
      expect(reloadedPayload.timer.endsAt).toBe(timerBefore.endsAt);
      expect(reloadedPayload.timer.durationSec).toBe(90);
      expect(reloadedPayload.timer.isRunning).toBe(true);
    });

    it('supports pause, resume, and duration adjustment authoritatively', () => {
      engine.startRound({ theme: 'Food', keyword: 'Biryani', durationSec: 60 });
      
      expect(engine.pauseTimer().success).toBe(true);
      expect(engine.getTimerState().isRunning).toBe(false);

      expect(engine.adjustTimer(15).success).toBe(true);
      expect(engine.getTimerState().remainingSec).toBe(75);

      expect(engine.resumeTimer().success).toBe(true);
      expect(engine.getTimerState().isRunning).toBe(true);
    });
  });

  describe('3. Imposter Assignment & Fair Anti-Repeat Selection', () => {
    it('creates round with exactly one imposter and four normal teams', () => {
      engine.startRound({ theme: 'Places', keyword: 'Everest' });
      const imposterId = engine.getImposterTeamId();
      expect(['prudhvi', 'vayu', 'jal', 'aakash', 'agni']).toContain(imposterId);

      const allTeams: TeamId[] = ['prudhvi', 'vayu', 'jal', 'aakash', 'agni'];
      let imposterCount = 0;
      let normalCount = 0;

      allTeams.forEach(t => {
        const payload = engine.getClientTeamPayload(t);
        if (payload.role === 'IMPOSTER') {
          imposterCount++;
          expect(payload.keyword).toBeNull();
          expect(payload.ownKeyword).toBeNull();
        } else {
          normalCount++;
          expect(payload.keyword).toBe('Everest');
          expect(payload.ownKeyword).toBe('Everest');
        }
      });

      expect(imposterCount).toBe(1);
      expect(normalCount).toBe(4);
    });

    it('avoids immediately repeating the same imposter in consecutive rounds', () => {
      engine.startRound({ imposterTeamId: 'prudhvi' });
      engine.revealAnswer();

      // Next round imposter selection should NOT pick prudhvi if other teams available
      const nextImposter = engine.selectNextImposter();
      expect(nextImposter).not.toBe('prudhvi');
    });
  });

  describe('4. Buzzer Concurrency, Ordering & Race Condition Resilience', () => {
    it('records high-precision timestamps and sequential order for concurrent buzzes', () => {
      engine.startRound();
      engine.openBuzzer('all-teams-can-buzz');

      const buzz1 = engine.handleBuzz('vayu');
      const buzz2 = engine.handleBuzz('jal');
      const buzz3 = engine.handleBuzz('agni');

      expect(buzz1.success).toBe(true);
      expect(buzz1.order).toBe(1);
      expect(buzz2.success).toBe(true);
      expect(buzz2.order).toBe(2);
      expect(buzz3.success).toBe(true);
      expect(buzz3.order).toBe(3);

      const queue = engine.getAdminPayload().buzzerState.queue;
      expect(queue.length).toBe(3);
      expect(queue[0].teamId).toBe('vayu');
      expect(queue[1].teamId).toBe('jal');
      expect(queue[2].teamId).toBe('agni');
    });

    it('rejects duplicate buzz submissions from the same team', () => {
      engine.startRound();
      engine.openBuzzer();

      expect(engine.handleBuzz('prudhvi').success).toBe(true);
      const duplicate = engine.handleBuzz('prudhvi');
      expect(duplicate.success).toBe(false);
      expect(duplicate.error).toMatch(/already buzzed/i);
    });

    it('rejects buzzes submitted when buzzer is locked or closed', () => {
      engine.startRound();
      // Buzzer not opened yet (ACTIVE state)
      expect(engine.handleBuzz('aakash').success).toBe(false);

      engine.openBuzzer();
      engine.lockBuzzer();
      // Buzzer now locked
      expect(engine.handleBuzz('aakash').success).toBe(false);
    });

    it('locks immediately after first buzz in first-buzzer-only mode', () => {
      engine.startRound({ buzzerMode: 'first-buzzer-only' });
      engine.openBuzzer('first-buzzer-only');

      const first = engine.handleBuzz('vayu');
      expect(first.success).toBe(true);

      const second = engine.handleBuzz('jal');
      expect(second.success).toBe(false);
    });
  });

  describe('5. Guessing & Accusation Validation', () => {
    it('records guesses and validates candidate team IDs', () => {
      engine.startRound({ imposterTeamId: 'jal' });
      engine.openBuzzer();

      expect(engine.handleGuess('vayu', 'jal').success).toBe(true);
      expect(engine.handleGuess('prudhvi', 'agni').success).toBe(true);

      const adminGuesses = engine.getAdminPayload().guesses;
      expect(adminGuesses['vayu'].suspectedTeamId).toBe('jal');
      expect(adminGuesses['vayu'].isCorrect).toBe(true);
      expect(adminGuesses['prudhvi'].suspectedTeamId).toBe('agni');
      expect(adminGuesses['prudhvi'].isCorrect).toBe(false);
    });

    it('rejects guesses during READY or REVEALED state', () => {
      expect(engine.handleGuess('vayu', 'jal').success).toBe(false);

      engine.startRound();
      engine.revealAnswer();
      expect(engine.handleGuess('vayu', 'jal').success).toBe(false);
    });
  });

  describe('6. Simultaneous Reveal & Zero Secret Leakage', () => {
    it('reveals keyword and imposter to all clients simultaneously only upon revealAnswer()', () => {
      engine.startRound({ theme: 'Cinema', keyword: 'Matrix', imposterTeamId: 'aakash' });

      // Before reveal: Imposter has null keyword
      expect(engine.getClientTeamPayload('aakash').keyword).toBeNull();
      expect(engine.getClientTeamPayload('aakash').ownKeyword).toBeNull();
      expect(engine.getClientTeamPayload('vayu').keyword).toBe('Matrix');

      // Admin triggers atomic reveal
      const revealResult = engine.revealAnswer();
      expect(revealResult.success).toBe(true);
      expect(engine.getRoundState()).toBe('REVEALED');

      // After reveal: All clients receive reveal payload
      const imposterAfter = engine.getClientTeamPayload('aakash');
      expect(imposterAfter.revealData?.keyword).toBe('Matrix');
      expect(imposterAfter.revealData?.imposterTeamId).toBe('aakash');

      const crewAfter = engine.getClientTeamPayload('vayu');
      expect(crewAfter.revealData?.keyword).toBe('Matrix');
      expect(crewAfter.revealData?.imposterTeamId).toBe('aakash');
    });
  });

  describe('7. Authentication & Token Security', () => {
    it('authenticates admin and all 5 teams with secure credentials', () => {
      expect(authenticateUser('admin', 'admin123')?.session.role).toBe('ADMIN');
      
      const teams: TeamId[] = ['prudhvi', 'vayu', 'jal', 'aakash', 'agni'];
      teams.forEach(t => {
        const auth = authenticateUser(t, t + '123');
        expect(auth?.session.role).toBe('TEAM');
        expect(auth?.session.teamId).toBe(t);
        expect(verifyToken(auth!.token)?.teamId).toBe(t);
      });
    });

    it('rejects unauthenticated and forged access', () => {
      expect(authenticateUser('unknown', '123')).toBeNull();
      expect(authenticateUser('admin', 'bad')).toBeNull();
      expect(verifyToken('bad.token')).toBeNull();
    });
  });
});
