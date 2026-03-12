import React, { useState } from 'react';
import { BrainCircuit, Send, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';

const PRESET_INSIGHTS = [
  {
    type: 'bullish',
    icon: TrendingUp,
    color: 'text-gain',
    bg: 'border-gain/20 bg-gain/5',
    title: 'AAPL – Bullish Momentum',
    content: 'Apple shows strong upward momentum with the 20-day EMA crossing above the 50-day SMA. RSI at 62 indicates room for further gains. Recent earnings beat estimates by 8%, driving institutional buying. Consider entering on pullbacks to the $174-$176 support zone.',
  },
  {
    type: 'caution',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'border-yellow-400/20 bg-yellow-400/5',
    title: 'TSLA – High Volatility Alert',
    content: 'Tesla is experiencing elevated implied volatility (IV rank: 78%). Bollinger Bands are widening, suggesting a potential breakout. Key support at $240, resistance at $260. Consider hedging existing positions or using options strategies like iron condors.',
  },
  {
    type: 'insight',
    icon: Lightbulb,
    color: 'text-accent-cyan',
    bg: 'border-accent-cyan/20 bg-accent-cyan/5',
    title: 'Portfolio Risk Assessment',
    content: 'Your portfolio is 65% tech-heavy. Consider diversifying into defensive sectors (utilities, healthcare) to reduce correlation risk. Current portfolio beta: 1.4 – above market average. A 10% correction would result in ~14% portfolio drawdown.',
  },
];

export default function AIInsights({ symbol }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    // Mock AI response (will be replaced with actual Gemini API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Based on my analysis of ${symbol || 'the market'}: The current technical indicators suggest a consolidation phase. Key levels to watch are the 200-day moving average and the recent swing high. Volume has been declining, which typically precedes a significant price move. I recommend monitoring the RSI divergence for early entry signals.`,
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-hidden bg-[#131722] flex">
      {/* Left – Preset Insights */}
      <div className="w-[420px] border-r border-[#2a2e39] bg-[#1e222d]/50 overflow-y-auto p-6 z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#2962ff] flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#d1d4dc] tracking-tight">Market Intelligence</h2>
            <p className="text-xs text-[#787b86]">AI-curated signals & alerts</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {PRESET_INSIGHTS.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div
                key={i}
                className={`rounded border p-5 bg-[#1e222d] transition-colors cursor-pointer group ${
                  insight.type === 'bullish' ? 'border-[#089981]/30 hover:border-[#089981]' :
                  insight.type === 'caution' ? 'border-[#f5a623]/30 hover:border-[#f5a623]' :
                  'border-[#2962ff]/30 hover:border-[#2962ff]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${insight.type === 'bullish' ? 'bg-[#089981]/10' : insight.type === 'caution' ? 'bg-[#f5a623]/10' : 'bg-[#2962ff]/10'}`}>
                      <Icon size={16} className={insight.type === 'bullish' ? 'text-[#089981]' : insight.type === 'caution' ? 'text-[#f5a623]' : 'text-[#2962ff]'} />
                    </div>
                    <span className={`text-sm font-bold ${insight.type === 'bullish' ? 'text-[#089981]' : insight.type === 'caution' ? 'text-[#f5a623]' : 'text-[#2962ff]'}`}>{insight.title}</span>
                  </div>
                </div>
                <p className="text-[13px] text-[#b2b5be] leading-relaxed">{insight.content}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right – Chat Interface */}
      <div className="flex-1 flex flex-col z-10 bg-[#131722]">
        {/* Chat Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#2a2e39] bg-[#1e222d] shrink-0">
          <div className="w-10 h-10 rounded bg-[#2962ff] flex items-center justify-center">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#d1d4dc]">Gemini Financial Analyst</div>
            <div className="flex items-center gap-2 text-[11px] text-[#787b86]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
              Online & Monitoring Markets
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-20 h-20 rounded bg-[#1e222d] border border-[#2a2e39] flex items-center justify-center mb-6">
                <BrainCircuit size={40} className="text-[#2962ff]" />
              </div>
              <h3 className="text-xl font-bold text-[#d1d4dc] mb-2">Ask your AI Co-Pilot</h3>
              <p className="text-sm text-[#787b86] leading-relaxed mb-8">
                I can analyze real-time technicals, summarize earnings calls, evaluate portfolio risk, or explain complex trading strategies.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {['Analyze AAPL technicals', 'Best defensive sectors?', 'Explain RSI divergence', 'Hedge TSLA volatility'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); }}
                    className="px-4 py-3 text-xs font-medium rounded border border-[#2a2e39] bg-[#1e222d] text-[#b2b5be] hover:text-[#d1d4dc] hover:border-[#2962ff] transition-colors text-left flex items-center justify-between group"
                  >
                    {q}
                    <TrendingUp size={14} className="opacity-0 group-hover:opacity-100 text-[#2962ff] transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                   <div className="w-8 h-8 rounded bg-[#2962ff] flex-shrink-0 flex items-center justify-center mt-1">
                     <BrainCircuit size={14} className="text-white" />
                   </div>
                )}
                <div
                  className={`rounded px-5 py-3.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#2962ff] text-white'
                      : 'bg-[#1e222d] text-[#d1d4dc] border border-[#2a2e39]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
               <div className="flex gap-3 max-w-[80%] flex-row">
                 <div className="w-8 h-8 rounded bg-[#2962ff] flex-shrink-0 flex items-center justify-center mt-1">
                   <BrainCircuit size={14} className="text-white" />
                 </div>
                 <div className="bg-[#1e222d] border border-[#2a2e39] rounded px-5 py-3.5 flex items-center gap-2">
                   <div className="flex gap-1.5">
                     <span className="w-1.5 h-1.5 bg-[#787b86] rounded-full animate-pulse" />
                     <span className="w-1.5 h-1.5 bg-[#787b86] rounded-full animate-pulse delay-75" />
                     <span className="w-1.5 h-1.5 bg-[#787b86] rounded-full animate-pulse delay-150" />
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-[#1e222d] border-t border-[#2a2e39] shrink-0">
          <div className="flex items-center gap-3 bg-[#131722] border border-[#2a2e39] rounded p-2 focus-within:border-[#2962ff] transition-colors">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask the AI co-pilot a question..."
              className="flex-1 bg-transparent py-2 px-4 text-[13px] text-[#d1d4dc] placeholder-[#787b86] focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!query.trim()}
              className="p-3 rounded bg-[#2962ff] text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-[#2962ff]"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-[#787b86]">
             AI insights are algorithmically generated and do not constitute financial advice.
          </div>
        </div>
      </div>
    </div>
  );
}
