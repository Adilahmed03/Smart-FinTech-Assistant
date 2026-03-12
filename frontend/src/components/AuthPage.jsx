import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Globe, Zap } from 'lucide-react';

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
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Institutional Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-1000">
        {/* Institutional Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-card-border shadow-2xl mb-6 relative group">
             <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all opacity-50" />
             <BarChart3 size={32} className="text-primary relative z-10" />
          </div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase mb-2">
            SmartFin<span className="text-primary italic">.</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
             <div className="h-px w-8 bg-card-border" />
             <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em]">Institutional Gateway</span>
             <div className="h-px w-8 bg-card-border" />
          </div>
        </div>

        {/* Auth Card */}
        <div className="terminal-card bg-card/40 backdrop-blur-xl border-card-border/50 p-8 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Auth Switcher */}
          <div className="flex bg-bg/50 rounded-lg p-1.5 border border-card-border mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all ${
                isLogin
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text-dim hover:text-text-secondary'
              }`}
            >
              Secure Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all ${
                !isLogin
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text-dim hover:text-text-secondary'
              }`}
            >
              Account Creation
            </button>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded border border-danger/20 bg-danger/5 text-danger text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 animate-in slide-in-from-top-2">
               <ShieldCheck size={14} className="shrink-0" />
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-2.5 block ml-1">
                Access Identifier
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.com"
                  className="w-full bg-bg border border-card-border rounded-xl py-3.5 pl-12 pr-4 text-sm text-text-primary font-bold placeholder:text-text-dim focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-2.5 block ml-1">
                Security Protocol
              </label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-bg border border-card-border rounded-xl py-3.5 pl-12 pr-4 text-sm text-text-primary font-bold placeholder:text-text-dim focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-primary text-white text-[12px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 active:scale-[0.98] group"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Establish Session' : 'Register Terminal'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={async () => {
                setError('');
                setLoading(true);
                try {
                  await login('demo@example.com', 'demo_password_123');
                } catch (err) {
                  setError('Demo environment not initialized. Please restart server.');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full mt-4 h-11 flex items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-all active:scale-[0.98]"
            >
              <Zap size={14} className="fill-primary" />
              Quick Access: Demo Terminal
            </button>
          )}
        </form>

          <div className="mt-8 flex flex-col items-center gap-4">
             <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest border-t border-card-border/30 pt-6 w-full text-center">
                System Requirement: Secured Link
             </div>
             <button
               onClick={() => { setIsLogin(!isLogin); setError(''); }}
               className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline"
             >
               {isLogin ? 'Request New Instance' : 'Existing Operator Log'}
             </button>
          </div>
        </div>

        {/* Legal / Status */}
        <div className="mt-8 grid grid-cols-3 gap-4">
           <div className="flex flex-col items-center gap-1 opacity-40">
              <Globe size={14} className="text-text-dim" />
              <span className="text-[9px] font-black text-text-dim uppercase tracking-tighter">Global Data</span>
           </div>
           <div className="flex flex-col items-center gap-1 opacity-40">
              <ShieldCheck size={14} className="text-text-dim" />
              <span className="text-[9px] font-black text-text-dim uppercase tracking-tighter">AES-256 Auth</span>
           </div>
           <div className="flex flex-col items-center gap-1 opacity-40">
              <Zap size={14} className="text-text-dim" />
              <span className="text-[9px] font-black text-text-dim uppercase tracking-tighter">Zero Latency</span>
           </div>
        </div>
      </div>
    </div>
  );
}
