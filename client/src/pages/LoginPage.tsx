import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, AlertCircle, ArrowRight, Lock, User, Eye, EyeOff, Globe } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !password.trim()) {
      setError('Please enter both Team Name / Realm and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(
      playerName.trim() || teamName.trim(),
      teamName.trim(),
      password
    );

    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>REAL-TIME MULTIPLAYER DEDUCTION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 filter drop-shadow">
          THE FIVE ELEMENTS
        </h1>
        <p className="text-xl sm:text-2xl font-black font-display tracking-widest text-gray-300 mt-1">
          IMPOSTER
        </p>
      </div>

      {/* Centered Login Portal Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle top ambient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-amber-400 to-cyan-400 opacity-75" />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Elemental Gateway
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Authenticate to enter your assigned realm
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. User Name / Player Name Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-display">
                User Name / Player Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Alex, Player 1, Snehith"
                  autoComplete="name"
                  autoCapitalize="words"
                  spellCheck="false"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner disabled:opacity-50"
                />
              </div>
            </div>

            {/* 2. Team Name / Realm Identifier Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-display">
                Team Name / Realm Identifier <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. prudhvi, vayu, jal, aakash, agni, admin"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner disabled:opacity-50"
                />
              </div>
            </div>

            {/* 3. Password Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 font-display">
                Secret Access Key / Password <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret team key"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-600 active:scale-[0.99] text-white font-bold font-display text-sm tracking-wider shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Enter Realm</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[11px] text-gray-500 flex items-center justify-center space-x-1">
              <Shield className="w-3 h-3 text-purple-400/80 mr-1 inline" />
              <span>Role & permissions isolated upon authentication</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
