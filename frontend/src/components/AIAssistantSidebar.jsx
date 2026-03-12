import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Send, 
  Loader2, 
  MessageSquare, 
  Zap, 
  ShieldCheck,
  HelpCircle,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { aiAPI, tradingAPI } from '../api';

export default function AIAssistantSidebar({ symbol }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Operator, I'm online. How can I assist with your portfolio or market strategy?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customMsg) => {
    const msgText = customMsg || input;
    if (!msgText.trim() || loading) return;

    const userMsg = { role: 'user', content: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // For portfolio-related queries, we might want to fetch stats first
      let context = "";
      if (msgText.toLowerCase().includes("portfolio")) {
        try {
          const portfolioRes = await tradingAPI.getPortfolio();
          const holdings = portfolioRes.data.holdings || [];
          context = ` Current Portfolio State: ${holdings.length} holdings. Symbols: ${holdings.map(h => h.symbol).join(', ')}.`;
        } catch (e) {
          console.error("Context fetch failed", e);
        }
      }

      const res = await aiAPI.chat(`${msgText}.${context}`, symbol);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response || res.data.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Transmission error. Neural link interrupted." }]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTIONS = [
    { label: "Portfolio Risk", query: "Why is my portfolio risky?", icon: TrendingDown },
    { label: "Diversification", query: "Explain diversification benefits.", icon: PieChart },
    { label: "Trade Logic", query: "Explain why a trade might lose money.", icon: HelpCircle }
  ];

  return (
    <div className="flex flex-col h-[400px] border-t border-card-border bg-bg/20">
      {/* Header */}
      <div className="px-5 py-3 border-b border-card-border bg-card/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Terminal Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
           <span className="text-[9px] font-bold text-text-dim uppercase">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[11px] leading-relaxed shadow-sm border ${
              m.role === 'user' 
              ? 'bg-primary text-white border-primary/20 font-semibold' 
              : 'bg-card border-card-border text-text-primary'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-card border border-card-border rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-primary" />
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest italic">Processing...</span>
             </div>
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-4 bg-card/60 border-t border-card-border">
        {/* Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-1">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s.query)}
              disabled={loading}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-bg border border-card-border hover:border-primary/50 transition-all group"
            >
              <s.icon size={10} className="text-text-dim group-hover:text-primary transition-colors" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-text-dim group-hover:text-text-primary">
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Intelligence..."
            className="w-full bg-bg border border-card-border rounded-lg py-2 pl-3 pr-10 text-[11px] text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-dim"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-md transition-all disabled:opacity-30"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
