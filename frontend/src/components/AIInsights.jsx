import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Send, 
  Loader2, 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  Target,
  LineChart,
  MessageSquare
} from 'lucide-react';
import { aiAPI } from '../api';

const STRATEGIES = [
  { 
    name: 'Mean Reversion', 
    desc: 'Buying oversold assets expecting a return to average price.', 
    icon: LineChart,
    color: 'text-[#2962ff]'
  },
  { 
    name: 'Trend Following', 
    desc: 'Capitalizing on sustained price movements in one direction.', 
    icon: TrendingUp,
    color: 'text-[#089981]'
  },
  { 
    name: 'Scalping', 
    desc: 'Entering and exiting trades in minutes for small, quick profits.', 
    icon: Zap,
    color: 'text-[#ff9800]'
  },
  { 
    name: 'Arbitrage', 
    desc: 'Simultaneous purchase and sale to profit from price differences.', 
    icon: Target,
    color: 'text-[#9c27b0]'
  }
];

export default function AIInsights({ symbol }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm your AI Trading Advisor. How can I help you analyze ${symbol} or discuss market strategies today?` }
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
      const res = await aiAPI.getChatResponse(input, symbol);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response || res.data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#131722]">
      {/* Left Column: Strategy Library */}
      <div className="w-80 border-r border-[#2a2e39] bg-[#1e222d]/30 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-[#2a2e39]">
          <h2 className="text-[14px] font-bold text-[#d1d4dc] flex items-center gap-2">
            <Target size={16} className="text-[#2962ff]" />
            Market Strategies
          </h2>
          <p className="text-[11px] text-[#787b86] mt-1">Real-time approach methodologies</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {STRATEGIES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="p-4 rounded border border-[#2a2e39] bg-[#1e222d] hover:border-[#434651] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={14} className={s.color} />
                  <span className="text-[12px] font-bold text-[#d1d4dc] group-hover:text-[#2962ff]">{s.name}</span>
                </div>
                <p className="text-[11px] text-[#787b86] leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Column: Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-[#2a2e39] flex items-center justify-between px-6 bg-[#131722]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2962ff]/10 flex items-center justify-center">
              <BrainCircuit size={18} className="text-[#2962ff]" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#d1d4dc]">AI Advisor</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
                <span className="text-[10px] text-[#787b86] uppercase font-bold tracking-widest">Active Insight Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 text-[13px] leading-relaxed ${
                m.role === 'user' 
                ? 'bg-[#2962ff] text-white' 
                : 'bg-[#1e222d] border border-[#2a2e39] text-[#d1d4dc]'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 flex items-center gap-3 shadow-lg">
                <Loader2 className="animate-spin text-[#2962ff]" size={16} />
                <span className="text-[12px] text-[#787b86] italic">AI is analyzing {symbol}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-[#2a2e39] bg-[#1e222d]/20">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask the AI about ${symbol} or trading strategies...`}
              className="w-full bg-[#131722] border border-[#363a45] rounded-lg py-3 pl-4 pr-12 text-[13px] text-[#d1d4dc] focus:outline-none focus:border-[#2962ff] transition-colors"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1.5 p-1.5 text-[#787b86] hover:text-[#2962ff] transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
