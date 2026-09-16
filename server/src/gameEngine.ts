import {
  AdminGameStatePayload,
  BuzzerMode,
  BuzzEntry,
  ClientTeamPayload,
  GuessEntry,
  RevealPayload,
  RoundConfig,
  RoundState,
  TeamId,
  TimerState
} from './types.js';
import { THEME_PRESETS, TEAM_METADATA } from './presets.js';

const ALL_TEAMS: TeamId[] = ['prudhvi', 'vayu', 'jal', 'aakash', 'agni'];

export class GameEngine {
  private currentRoundNumber: number = 1;
  private roundState: RoundState = 'READY';
  private theme: string = 'Technology';
  private keyword: string = 'Quantum Computer';
  private imposterTeamId: TeamId = 'prudhvi';
  private buzzerMode: BuzzerMode = 'all-teams-can-buzz';
  
  // Timer state
  private timerDurationSec: number = 60;
  private timerStartedAt: number | null = null;
  private timerEndsAt: number | null = null;
  private timerPausedAt: number | null = null;
  private timerRemainingSec: number = 60;
  private isTimerRunning: boolean = false;

  // Buzzer & Guessing
  private buzzerQueue: BuzzEntry[] = [];
  private buzzedTeamsSet: Set<TeamId> = new Set();
  private isBuzzerOpen: boolean = false;
  private activeBuzzTeamId: TeamId | null = null;
  private guesses: Map<TeamId, GuessEntry> = new Map();

  // Scores & History
  private scores: Record<TeamId, number> = {
    prudhvi: 0,
    vayu: 0,
    jal: 0,
    aakash: 0,
    agni: 0
  };
  private imposterHistory: Array<{ round: number; imposterTeamId: TeamId; theme: string }> = [];
  private onlineTeams: Record<TeamId, boolean> = {
    prudhvi: false,
    vayu: false,
    jal: false,
    aakash: false,
    agni: false
  };
  private adminOnline: boolean = false;
  private revealData: RevealPayload | null = null;

  constructor() {
    this.prepareInitialRound();
  }

  private prepareInitialRound() {
    const defaultPreset = THEME_PRESETS[0];
    this.theme = defaultPreset.theme;
    this.keyword = defaultPreset.keyword;
    this.imposterTeamId = this.selectNextImposter();
  }

  /**
   * Server-authoritative imposter selection:
   * - Avoids selecting the immediately preceding imposter where possible.
   * - Tracks historical counts across rounds to balance frequency.
   */
  public selectNextImposter(forcedTeamId?: TeamId): TeamId {
    if (forcedTeamId && ALL_TEAMS.includes(forcedTeamId)) {
      return forcedTeamId;
    }

    const lastImposter = this.imposterHistory.length > 0 
      ? this.imposterHistory[this.imposterHistory.length - 1].imposterTeamId 
      : null;

    const recentHistory = this.imposterHistory.slice(-5);
    const counts: Record<TeamId, number> = { prudhvi: 0, vayu: 0, jal: 0, aakash: 0, agni: 0 };
    recentHistory.forEach(h => { counts[h.imposterTeamId] = (counts[h.imposterTeamId] || 0) + 1; });

    let candidates = ALL_TEAMS.filter(t => t !== lastImposter);
    if (candidates.length === 0) candidates = [...ALL_TEAMS];

    const minCount = Math.min(...candidates.map(t => counts[t]));
    const leastSelected = candidates.filter(t => counts[t] === minCount);

    const selected = leastSelected[Math.floor(Math.random() * leastSelected.length)];
    return selected;
  }

  public configureRound(config: Partial<RoundConfig>): boolean {
    if (config.theme) this.theme = config.theme.trim();
    if (config.keyword) this.keyword = config.keyword.trim();
    if (config.durationSec && config.durationSec > 0) {
      this.timerDurationSec = config.durationSec;
      this.timerRemainingSec = config.durationSec;
    }
    if (config.buzzerMode) {
      this.buzzerMode = config.buzzerMode;
    }
    if (config.imposterTeamId && ALL_TEAMS.includes(config.imposterTeamId)) {
      this.imposterTeamId = config.imposterTeamId;
    }
    return true;
  }

  public startRound(config?: Partial<RoundConfig>): { success: boolean; error?: string } {
    if (config) {
      this.configureRound(config);
    }
    if (!config?.imposterTeamId) {
      this.imposterTeamId = this.selectNextImposter();
    }

    this.roundState = 'ACTIVE';
    this.buzzerQueue = [];
    this.buzzedTeamsSet.clear();
    this.isBuzzerOpen = false;
    this.activeBuzzTeamId = null;
    this.guesses.clear();
    this.revealData = null;

    const now = Date.now();
    this.timerStartedAt = now;
    this.timerEndsAt = now + (this.timerDurationSec * 1000);
    this.timerPausedAt = null;
    this.timerRemainingSec = this.timerDurationSec;
    this.isTimerRunning = true;

    return { success: true };
  }

  public pauseTimer(): { success: boolean } {
    if (!this.isTimerRunning) return { success: false };
    const now = Date.now();
    this.isTimerRunning = false;
    this.timerPausedAt = now;
    if (this.timerEndsAt) {
      this.timerRemainingSec = Math.max(0, Math.ceil((this.timerEndsAt - now) / 1000));
    }
    return { success: true };
  }

  public resumeTimer(): { success: boolean } {
    if (this.isTimerRunning || this.timerRemainingSec <= 0) return { success: false };
    const now = Date.now();
    this.timerStartedAt = now;
    this.timerEndsAt = now + (this.timerRemainingSec * 1000);
    this.timerPausedAt = null;
    this.isTimerRunning = true;
    return { success: true };
  }

  public adjustTimer(deltaSec: number): { success: boolean } {
    const currentRemaining = this.getCalculatedRemainingSec();
    const newRemaining = Math.max(0, currentRemaining + deltaSec);
    this.timerRemainingSec = newRemaining;
    if (this.isTimerRunning) {
      this.timerEndsAt = Date.now() + (newRemaining * 1000);
    }
    return { success: true };
  }

  public armBuzzer(): { success: boolean; error?: string } {
    if (this.roundState === 'REVEALED') {
      return { success: false, error: 'Cannot arm buzzer after reveal' };
    }
    this.roundState = 'BUZZER_READY';
    this.isBuzzerOpen = false;
    return { success: true };
  }

  public openBuzzer(mode?: BuzzerMode): { success: boolean; error?: string } {
    if (this.roundState === 'REVEALED') {
      return { success: false, error: 'Cannot open buzzer after reveal' };
    }
    if (mode) {
      this.buzzerMode = mode;
    }
    this.roundState = 'BUZZER_ACTIVE';
    this.isBuzzerOpen = true;
    return { success: true };
  }

  public lockBuzzer(): { success: boolean } {
    this.isBuzzerOpen = false;
    if (this.roundState === 'BUZZER_ACTIVE' || this.roundState === 'BUZZER_READY') {
      this.roundState = 'LOCKED';
    }
    return { success: true };
  }

  public endRound(): { success: boolean } {
    this.roundState = 'LOCKED';
    this.isBuzzerOpen = false;
    this.isTimerRunning = false;
    if (this.timerEndsAt) {
      const now = Date.now();
      this.timerRemainingSec = Math.max(0, Math.ceil((this.timerEndsAt - now) / 1000));
    }
    return { success: true };
  }

  public clearBuzzerQueue(): { success: boolean } {
    this.buzzerQueue = [];
    this.buzzedTeamsSet.clear();
    this.activeBuzzTeamId = null;
    return { success: true };
  }

  public handleBuzz(teamId: TeamId): { success: boolean; order?: number; buzzedAt?: number; error?: string } {
    if (!this.isBuzzerOpen || this.roundState !== 'BUZZER_ACTIVE') {
      return { success: false, error: 'Buzzer is currently closed' };
    }
    if (!ALL_TEAMS.includes(teamId)) {
      return { success: false, error: 'Invalid team ID' };
    }
    if (this.buzzedTeamsSet.has(teamId)) {
      return { success: false, error: 'Team has already buzzed this round' };
    }

    const now = Date.now();
    const order = this.buzzerQueue.length + 1;
    const entry: BuzzEntry = {
      teamId,
      teamName: TEAM_METADATA[teamId].name,
      buzzedAt: now,
      order
    };

    this.buzzerQueue.push(entry);
    this.buzzedTeamsSet.add(teamId);

    if (!this.activeBuzzTeamId) {
      this.activeBuzzTeamId = teamId;
    }

    // First-buzzer-only mode: automatically close buzzer to subsequent teams
    if (this.buzzerMode === 'first-buzzer-only') {
      this.isBuzzerOpen = false;
    }

    return { success: true, order, buzzedAt: now };
  }

  public handleGuess(guessingTeamId: TeamId, suspectedTeamId: TeamId): { success: boolean; error?: string } {
    if (this.roundState === 'REVEALED' || this.roundState === 'READY') {
      return { success: false, error: 'Cannot submit guess during this game state' };
    }
    if (!ALL_TEAMS.includes(guessingTeamId) || !ALL_TEAMS.includes(suspectedTeamId)) {
      return { success: false, error: 'Invalid guessing or suspected team ID' };
    }

    this.guesses.set(guessingTeamId, {
      guessingTeamId,
      suspectedTeamId,
      guessedAt: Date.now()
    });

    return { success: true };
  }

  public revealAnswer(): { success: boolean; revealData: RevealPayload } {
    this.roundState = 'REVEALED';
    this.isBuzzerOpen = false;
    this.isTimerRunning = false;

    const guessResults: Array<{
      guessingTeamId: TeamId;
      suspectedTeamId: TeamId;
      isCorrect: boolean;
    }> = [];

    let correctGuessCount = 0;

    ALL_TEAMS.forEach(teamId => {
      const guess = this.guesses.get(teamId);
      if (guess) {
        const isCorrect = guess.suspectedTeamId === this.imposterTeamId;
        guessResults.push({
          guessingTeamId: teamId,
          suspectedTeamId: guess.suspectedTeamId,
          isCorrect
        });
        if (isCorrect) {
          correctGuessCount++;
          if (teamId !== this.imposterTeamId) {
            this.scores[teamId] += 20;
          }
        }
      }
    });

    if (this.buzzerQueue.length > 0) {
      const fastest = this.buzzerQueue[0];
      const fastestGuess = this.guesses.get(fastest.teamId);
      if (fastestGuess && fastestGuess.suspectedTeamId === this.imposterTeamId) {
        this.scores[fastest.teamId] += 10;
      }
    }

    if (correctGuessCount <= 1) {
      this.scores[this.imposterTeamId] += 30;
    }

    this.imposterHistory.push({
      round: this.currentRoundNumber,
      imposterTeamId: this.imposterTeamId,
      theme: this.theme
    });

    const imposterMeta = TEAM_METADATA[this.imposterTeamId];
    const summary = correctGuessCount >= 2
      ? `The realm unmasked ${imposterMeta.name} as the Imposter with ${correctGuessCount} correct votes!`
      : `${imposterMeta.name} successfully deceived the realm and escaped undetected!`;

    this.revealData = {
      keyword: this.keyword,
      imposterTeamId: this.imposterTeamId,
      imposterTeamName: imposterMeta.name,
      guesses: guessResults,
      scores: { ...this.scores },
      roundSummary: summary
    };

    return { success: true, revealData: this.revealData };
  }

  public prepareNextRound(preset?: { theme: string; keyword: string }): { success: boolean; roundNumber: number } {
    this.currentRoundNumber += 1;
    this.roundState = 'READY';
    this.buzzerQueue = [];
    this.buzzedTeamsSet.clear();
    this.isBuzzerOpen = false;
    this.activeBuzzTeamId = null;
    this.guesses.clear();
    this.revealData = null;

    if (preset) {
      this.theme = preset.theme;
      this.keyword = preset.keyword;
    } else {
      const presetIndex = (this.currentRoundNumber - 1) % THEME_PRESETS.length;
      const nextPreset = THEME_PRESETS[presetIndex];
      this.theme = nextPreset.theme;
      this.keyword = nextPreset.keyword;
    }

    this.imposterTeamId = this.selectNextImposter();
    this.timerRemainingSec = this.timerDurationSec;
    this.timerStartedAt = null;
    this.timerEndsAt = null;
    this.timerPausedAt = null;
    this.isTimerRunning = false;

    return { success: true, roundNumber: this.currentRoundNumber };
  }

  public resetGame(): void {
    this.currentRoundNumber = 1;
    this.scores = { prudhvi: 0, vayu: 0, jal: 0, aakash: 0, agni: 0 };
    this.imposterHistory = [];
    this.prepareInitialRound();
    this.roundState = 'READY';
    this.buzzerQueue = [];
    this.buzzedTeamsSet.clear();
    this.isBuzzerOpen = false;
    this.activeBuzzTeamId = null;
    this.guesses.clear();
    this.revealData = null;
    this.timerRemainingSec = this.timerDurationSec;
    this.timerStartedAt = null;
    this.timerEndsAt = null;
    this.timerPausedAt = null;
    this.isTimerRunning = false;
  }

  public setTeamOnline(teamId: TeamId, online: boolean): void {
    if (ALL_TEAMS.includes(teamId)) {
      this.onlineTeams[teamId] = online;
    }
  }

  public setAdminOnline(online: boolean): void {
    this.adminOnline = online;
  }

  private getCalculatedRemainingSec(): number {
    if (!this.isTimerRunning) {
      return this.timerRemainingSec;
    }
    if (!this.timerEndsAt) return this.timerDurationSec;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((this.timerEndsAt - now) / 1000));
    return remaining;
  }

  public getTimerState(): TimerState {
    const remaining = this.getCalculatedRemainingSec();
    return {
      durationSec: this.timerDurationSec,
      remainingSec: remaining,
      startedAt: this.timerStartedAt,
      endsAt: this.timerEndsAt,
      isRunning: this.isTimerRunning && remaining > 0,
      pausedAt: this.timerPausedAt
    };
  }

  public getClientTeamPayload(teamId: TeamId): ClientTeamPayload {
    const isImposter = teamId === this.imposterTeamId;
    const teamMeta = TEAM_METADATA[teamId];
    const myGuess = this.guesses.get(teamId)?.suspectedTeamId || null;
    const hasBuzzed = this.buzzedTeamsSet.has(teamId);
    const buzzIndex = this.buzzerQueue.findIndex(b => b.teamId === teamId);
    const myBuzzOrder = buzzIndex !== -1 ? this.buzzerQueue[buzzIndex].order : null;

    let keywordForClient: string | null = null;
    if (this.roundState === 'REVEALED') {
      keywordForClient = this.keyword;
    } else if (!isImposter && this.roundState !== 'READY') {
      keywordForClient = this.keyword;
    }

    return {
      teamId,
      teamName: teamMeta.name,
      currentRoundNumber: this.currentRoundNumber,
      roundState: this.roundState,
      theme: this.theme,
      role: isImposter ? 'IMPOSTER' : 'TEAM',
      keyword: keywordForClient,
      ownKeyword: keywordForClient,
      timer: this.getTimerState(),
      buzzerState: {
        mode: this.buzzerMode,
        isOpen: this.isBuzzerOpen,
        hasBuzzed,
        myBuzzOrder,
        activeBuzzTeamId: this.activeBuzzTeamId,
        queue: this.buzzerQueue.map(b => ({
          teamId: b.teamId,
          teamName: b.teamName,
          order: b.order
        }))
      },
      myGuess,
      revealData: this.roundState === 'REVEALED' ? this.revealData : null,
      onlineTeams: { ...this.onlineTeams },
      scores: { ...this.scores }
    };
  }

  public getAdminPayload(): AdminGameStatePayload {
    const guessesObj: Record<string, GuessEntry> = {};
    this.guesses.forEach((val, key) => {
      guessesObj[key] = {
        ...val,
        isCorrect: val.suspectedTeamId === this.imposterTeamId
      };
    });

    return {
      currentRoundNumber: this.currentRoundNumber,
      roundState: this.roundState,
      theme: this.theme,
      keyword: this.keyword,
      imposterTeamId: this.imposterTeamId,
      timer: this.getTimerState(),
      buzzerState: {
        mode: this.buzzerMode,
        isOpen: this.isBuzzerOpen,
        queue: [...this.buzzerQueue],
        activeBuzzTeamId: this.activeBuzzTeamId
      },
      guesses: guessesObj,
      scores: { ...this.scores },
      onlineTeams: { ...this.onlineTeams },
      adminOnline: this.adminOnline,
      imposterHistory: [...this.imposterHistory],
      buzzerMode: this.buzzerMode,
      availablePresets: THEME_PRESETS
    };
  }

  public getRoundState(): RoundState { return this.roundState; }
  public getImposterTeamId(): TeamId { return this.imposterTeamId; }
  public getSecretKeyword(): string { return this.keyword; }
  public getTheme(): string { return this.theme; }
}
