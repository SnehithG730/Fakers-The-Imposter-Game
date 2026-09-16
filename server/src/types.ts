export type TeamId = 'prudhvi' | 'vayu' | 'jal' | 'aakash' | 'agni';

export type UserRole = 'ADMIN' | 'TEAM';

export type GameRole = 'ADMIN' | 'TEAM' | 'IMPOSTER';

export type RoundState = 
  | 'READY' 
  | 'ACTIVE' 
  | 'BUZZER_READY' 
  | 'BUZZER_ACTIVE' 
  | 'LOCKED' 
  | 'REVEALED';

export type BuzzerMode = 'first-buzzer-only' | 'all-teams-can-buzz';

export interface TeamMeta {
  id: TeamId;
  name: string;
  element: string;
  color: string;
  accent: string;
  description: string;
  symbol: string;
}

export interface BuzzEntry {
  teamId: TeamId;
  teamName: string;
  buzzedAt: number;
  order: number;
}

export interface GuessEntry {
  guessingTeamId: TeamId;
  suspectedTeamId: TeamId;
  guessedAt: number;
  isCorrect?: boolean;
}

export interface TeamScore {
  teamId: TeamId;
  points: number;
  correctGuesses: number;
  imposterCatches: number;
  imposterEscapes: number;
}

export interface TimerState {
  durationSec: number;
  remainingSec: number;
  startedAt: number | null;
  endsAt: number | null;
  isRunning: boolean;
  pausedAt: number | null;
}

export interface RoundConfig {
  theme: string;
  keyword: string;
  durationSec: number;
  buzzerMode: BuzzerMode;
  imposterTeamId?: TeamId;
}

export interface ThemePreset {
  category: string;
  theme: string;
  keyword: string;
  hint: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface RevealPayload {
  keyword: string;
  imposterTeamId: TeamId;
  imposterTeamName: string;
  guesses: Array<{
    guessingTeamId: TeamId;
    suspectedTeamId: TeamId;
    isCorrect: boolean;
  }>;
  scores: Record<TeamId, number>;
  roundSummary: string;
}

export interface ClientTeamPayload {
  teamId: TeamId;
  teamName: string;
  currentRoundNumber: number;
  roundState: RoundState;
  theme: string;
  role: GameRole;
  keyword: string | null;
  ownKeyword: string | null;
  timer: TimerState;
  buzzerState: {
    mode: BuzzerMode;
    isOpen: boolean;
    hasBuzzed: boolean;
    myBuzzOrder: number | null;
    activeBuzzTeamId: TeamId | null;
    queue: Array<{ teamId: TeamId; teamName: string; order: number }>;
  };
  myGuess: TeamId | null;
  revealData: RevealPayload | null;
  onlineTeams: Record<TeamId, boolean>;
  scores: Record<TeamId, number>;
}

export interface AdminGameStatePayload {
  currentRoundNumber: number;
  roundState: RoundState;
  theme: string;
  keyword: string;
  imposterTeamId: TeamId;
  timer: TimerState;
  buzzerState: {
    mode: BuzzerMode;
    isOpen: boolean;
    queue: Array<BuzzEntry>;
    activeBuzzTeamId: TeamId | null;
  };
  guesses: Record<string, GuessEntry>;
  scores: Record<TeamId, number>;
  onlineTeams: Record<TeamId, boolean>;
  adminOnline: boolean;
  imposterHistory: Array<{ round: number; imposterTeamId: TeamId; theme: string }>;
  buzzerMode: BuzzerMode;
  availablePresets: ThemePreset[];
}

export interface AuthSession {
  username: string;
  role: UserRole;
  teamId?: TeamId;
  displayName: string;
}
