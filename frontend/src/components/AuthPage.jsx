import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple mb-4 shadow-lg shadow-accent-cyan/20">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
            SmartFinTech
          </h1>
          <p className="text-xs text-terminal-text-muted mt-1">
            AI-powered trading terminal
          </p>
        </div>

        {/* Card */}
        <div className="bg-terminal-surface border border-terminal-border rounded-2xl p-6 shadow-2xl shadow-black/40">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-terminal-bg rounded-lg p-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                isLogin
                  ? 'bg-terminal-card text-accent-cyan shadow-md'
                  : 'text-terminal-text-muted hover:text-terminal-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                !isLogin
                  ? 'bg-terminal-card text-accent-cyan shadow-md'
                  : 'text-terminal-text-muted hover:text-terminal-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-loss text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-terminal-text-dim mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-text-dim" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-terminal-text placeholder-terminal-text-dim focus:outline-none focus:border-accent-cyan/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-terminal-text-dim mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-text-dim" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-terminal-bg border border-terminal-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-terminal-text placeholder-terminal-text-dim focus:outline-none focus:border-accent-cyan/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-accent-cyan/20"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-[10px] text-terminal-text-dim mt-5">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-accent-cyan hover:underline font-medium"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Virtual balance info */}
        <p className="text-center text-[10px] text-terminal-text-dim mt-4">
          Start with ₹1,00,000 virtual balance • Zero risk paper trading
        </p>
      </div>
    </div>
  );
}
