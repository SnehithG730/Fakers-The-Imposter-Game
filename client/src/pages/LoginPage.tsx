import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, AlertCircle, ArrowRight, Flame, Mountain, Wind, Waves, Orbit } from 'lucide-react';
import { TeamId } from '../types';

const PRESET_ACCOUNTS = [
  {
    id: 'admin',
    name: 'Supreme Arbiter (Admin)',
    subtitle: 'Controls rounds, timers, buzzer, reveal',
    username: 'admin',
    password: 'admin123',
    icon: <Shield className="w-6 h-6 text-amber-400" />,
    gradient: 'from-amber-900/60 via-amber-950/80 to-black',
    border: 'border-amber-500/40 hover:border-amber-400',
    shadow: 'hover:shadow-amber-500/20'
  },
  {
    id: 'prudhvi',
    name: 'Prudhvi',
    subtitle: 'Earth Element — Stone & Mountain',
    username: 'prudhvi',
    password: 'prudhvi123',
    icon: <Mountain className="w-6 h-6 text-emerald-400" />,
    gradient: 'from-emerald-950/80 via-green-950/80 to-black',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    shadow: 'hover:shadow-emerald-500/20'
  },
  {
    id: 'vayu',
    name: 'Vayu',
    subtitle: 'Air Element — Wind & Atmosphere',
    username: 'vayu',
    password: 'vayu123',
    icon: <Wind className="w-6 h-6 text-cyan-400" />,
    gradient: 'from-cyan-950/80 via-sky-950/80 to-black',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    shadow: 'hover:shadow-cyan-500/20'
  },
  {
    id: 'jal',
    name: 'Jal',
    subtitle: 'Water Element — Ocean & Abyss',
    username: 'jal',
    password: 'jal123',
    icon: <Waves className="w-6 h-6 text-blue-400" />,
    gradient: 'from-blue-950/80 via-indigo-950/80 to-black',
    border: 'border-blue-500/40 hover:border-blue-400',
    shadow: 'hover:shadow-blue-500/20'
  },
  {
    id: 'aakash',
    name: 'Aakash',
    subtitle: 'Space Element — Cosmos & Nebula',
    username: 'aakash',
    password: 'aakash123',
    icon: <Orbit className="w-6 h-6 text-purple-400" />,
    gradient: 'from-purple-950/80 via-violet-950/80 to-black',
    border: 'border-purple-500/40 hover:border-purple-400',
    shadow: 'hover:shadow-purple-500/20'
  },
  {
    id: 'agni',
    name: 'Agni',
    subtitle: 'Fire Element — Flame & Molten Core',
    username: 'agni',
    password: 'agni123',
    icon: <Flame className="w-6 h-6 text-rose-400" />,
    gradient: 'from-rose-950/80 via-red-950/80 to-black',
    border: 'border-rose-500/40 hover:border-rose-400',
    shadow: 'hover:shadow-rose-500/20'
  }
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(username, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (accUser: string, accPass: string) => {
    setUsername(accUser);
    setPassword(accPass);
    setLoading(true);
    setError(null);

    const res = await login(accUser, accPass);
    if (!res.success) {
      setError(res.error || 'Quick login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>REAL-TIME MULTIPLAYER DEDUCTION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 filter drop-shadow">
          THE FIVE ELEMENTS
        </h1>
        <p className="text-xl sm:text-2xl font-black font-display tracking-widest text-gray-300 mt-1">
          IMPOSTER
        </p>
        <p className="text-sm text-gray-400 mt-3">
          Four teams share the secret keyword. One team is the Imposter. Decipher clues, buzz in, and expose deception.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Quick Selection Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-sm font-bold tracking-wider text-gray-300 uppercase font-display">
              Select Your Role / Team
            </h2>
            <span className="text-xs text-gray-500">1-Click Instant Login</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                onClick={() => handleQuickLogin(acc.username, acc.password)}
                disabled={loading}
                className={`group flex items-start space-x-3.5 p-4 rounded-2xl bg-gradient-to-br ${acc.gradient} border ${acc.border} transition-all duration-200 shadow-lg ${acc.shadow} hover:scale-[1.02] text-left`}
              >
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 shrink-0">
                  {acc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white font-display truncate">
                      {acc.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                    {acc.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Login Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display mb-1">
              Custom Authentication
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Enter your credentials to access your portal
            </p>

            {error && (
              <div className="flex items-center space-x-2 p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Account Identifier
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. prudhvi, admin, vayu"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Access Key / Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-bold text-sm font-display tracking-wider shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating Realm...' : 'ENTER THE REALM'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
