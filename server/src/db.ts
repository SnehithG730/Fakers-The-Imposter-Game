import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { RevealPayload, TeamId } from './types.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zbfl7g6kepj3vvehvmns.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ZBfL7g6kEPj3vvEHvmns9g_Cuzw7N-V';

let supabase: SupabaseClient | null = null;
let isConnected = false;

try {
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isConnected = true;
    console.log('⚡ Supabase database client initialized with publishable key.');
  }
} catch (error) {
  console.warn('⚠️ Supabase initialization warning:', error);
  supabase = null;
  isConnected = false;
}

export interface RoundRecord {
  round_number: number;
  theme: string;
  keyword: string;
  imposter_team_id: TeamId;
  imposter_team_name: string;
  summary: string;
  scores: Record<TeamId, number>;
  guesses: any[];
  created_at?: string;
}

export class DatabaseService {
  public static isConnected(): boolean {
    return isConnected && supabase !== null;
  }

  public static getClient(): SupabaseClient | null {
    return supabase;
  }

  /**
   * Persists completed round outcomes to Supabase `game_rounds` table
   */
  public static async saveRound(roundNumber: number, theme: string, revealData: RevealPayload): Promise<boolean> {
    if (!supabase) return false;

    try {
      const record: RoundRecord = {
        round_number: roundNumber,
        theme,
        keyword: revealData.keyword,
        imposter_team_id: revealData.imposterTeamId,
        imposter_team_name: revealData.imposterTeamName,
        summary: revealData.roundSummary,
        scores: revealData.scores,
        guesses: revealData.guesses,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('game_rounds').insert([record]);
      if (error) {
        // Table may not exist yet or permissions configured; log cleanly without crashing gameplay
        console.warn('ℹ️ Supabase round persistence note:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('ℹ️ Supabase connection notice:', err.message || err);
      return false;
    }
  }

  /**
   * Persists cumulative team scores to Supabase `leaderboard` table
   */
  public static async updateScores(scores: Record<TeamId, number>): Promise<boolean> {
    if (!supabase) return false;

    try {
      const records = Object.entries(scores).map(([teamId, score]) => ({
        team_id: teamId,
        score,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('leaderboard').upsert(records, { onConflict: 'team_id' });
      if (error) {
        console.warn('ℹ️ Supabase leaderboard upsert note:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('ℹ️ Supabase leaderboard notice:', err.message || err);
      return false;
    }
  }

  /**
   * Saves a custom preset to Supabase `custom_presets` table
   */
  public static async savePreset(category: string, theme: string, keyword: string, hint: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('custom_presets').insert([{
        category,
        theme,
        keyword,
        hint,
        created_at: new Date().toISOString()
      }]);

      if (error) {
        console.warn('ℹ️ Supabase preset insert note:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn('ℹ️ Supabase preset notice:', err.message || err);
      return false;
    }
  }
}
