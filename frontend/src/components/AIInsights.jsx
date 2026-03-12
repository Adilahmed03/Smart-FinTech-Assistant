import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Send, 
  Loader2, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck,
  Zap, 
  Target,
  LineChart,
  MessageSquare,
  Sparkles,
  Cpu,
  Bookmark
} from 'lucide-react';
import { aiAPI } from '../api';

const STRATEGIES = [
  { 
    name: 'Mean Reversion', 
    desc: 'Statistically identifies price deviations from the historical mean to capture corrective movements.', 
    icon: LineChart,
    color: 'text-primary'
  },
  { 
    name: 'Trend Continuity', 
    desc: 'Utilizes high-frequency data to validate institutional flow and momentum sustained directionality.', 
    icon: TrendingUp,
    color: 'text-success'
  },
  { 
    name: 'Volatility Scalp', 
    desc: 'Precision-based entry and exit strategies designed for micro-fluctuations in high-liquidity intervals.', 
    icon: Zap,
    color: 'text-warning'
  },
  { 
    name: 'Statistical Arbitrage', 
    desc: 'Engineered for exploiting temporary price inefficiencies across correlated asset pairs.', 
    icon: Target,
    color: 'text-secondary'
  }
];

export default function AIInsights({ symbol }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Greetings. I am your Institutional AI Advisor. I have synthesized current market data for ${symbol}. How shall we proceed with your strategic analysis today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(input, symbol);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response || res.data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred during neural processing. Please re-validate your query." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-bg h-full">
      {/* Methodology Sidebar */}
      <div className="w-[340px] border-r border-card-border bg-card/10 flex flex-col hidden xl:flex">
        <div className="p-8 border-b border-card-border">
          <div className="flex items-center gap-2 mb-2">
             <Cpu size={16} className="text-primary" />
             <h2 className="text-[12px] font-black text-text-primary uppercase tracking-[0.2em]">
                Strategy Matrix
             </h2>
          </div>
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Synthesized Methodology Library</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {STRATEGIES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="terminal-card p-5 group cursor-pointer hover:border-primary/40 transition-all border-transparent bg-bg/40">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded bg-card border border-card-border group-hover:border-primary/30 transition-colors`}>
                    <Icon size={16} className={s.color} />
                  </div>
                  <Bookmark size={12} className="text-text-dim group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-[12px] font-black text-text-primary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                   {s.name}
                </h4>
                <p className="text-[11px] text-text-dim leading-relaxed font-medium">
                   {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-card-border bg-card/20">
           <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <div>
                 <div className="text-[10px] font-black text-primary uppercase tracking-widest">Real-time Alpha</div>
                 <div className="text-[9px] font-bold text-text-dim uppercase">Signals Active</div>
              </div>
           </div>
        </div>
      </div>

      {/* Neural Chat Interface */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Terminal Header */}
        <div className="h-16 border-b border-card-border flex items-center justify-between px-8 bg-bg/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative">
              <BrainCircuit size={20} className="text-primary" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-bg" />
            </div>
            <div>
              <span className="text-[14px] font-black text-text-primary uppercase tracking-widest leading-none block mb-1">Advisor AI-v3</span>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-success uppercase tracking-[0.2em] animate-pulse">Neural Link Active</span>
                 <div className="w-1 h-1 rounded-full bg-card-border" />
                 <span className="text-[9px] font-bold text-text-dim uppercase">98.2% Accuracy</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="terminal-btn-outline py-1.5 px-3 flex items-center gap-2">
                <ShieldAlert size={12} />
                <span className="text-[9px] font-black uppercase">Risk Audit</span>
             </button>
          </div>
        </div>

        {/* Transmission Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-black/5">
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`max-w-[75%] relative ${m.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`rounded-xl px-5 py-4 shadow-xl border ${
                  m.role === 'user' 
                  ? 'bg-primary text-white border-primary/20 font-semibold' 
                  : 'bg-card border-card-border text-text-primary font-medium'
                }`}>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
                <div className={`mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-dim ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {m.role === 'user' ? 'Terminal Operator' : 'Advisor AI'}
                   <span>•</span>
                   {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-500">
              <div className="bg-card border border-card-border rounded-xl p-5 flex items-center gap-4 shadow-terminal">
                <div className="relative">
                   <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                   <BrainCircuit size={10} className="absolute inset-0 m-auto text-primary" />
                </div>
                <span className="text-[11px] font-black text-text-dim uppercase tracking-[0.2em]">Synthesizing {symbol} analytics...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Nexus */}
        <div className="p-8 border-t border-card-border bg-bg/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl group-focus-within:bg-primary/10 transition-all opacity-0 group-focus-within:opacity-100" />
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Query the Advisor on ${symbol} market structure...`}
                className="w-full bg-card border border-card-border rounded-full py-4 pl-6 pr-16 text-[13px] text-text-primary font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-dim"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2.5 bg-primary text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-30"
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-[9px] font-bold text-text-dim uppercase tracking-widest">
             <span className="flex items-center gap-1.5"><MessageSquare size={10} /> 24/7 Support</span>
             <span className="flex items-center gap-1.5"><Zap size={10} /> Low Latency Response</span>
             <span className="flex items-center gap-1.5"><ShieldCheck size={10} /> Secured Transmission</span>
          </div>
        </div>
      </div>
    </div>
  );
}
