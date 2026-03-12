import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { tradingAPI } from '../api';

const MOCK_WATCHLIST = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD' },
];

const DEMO_SYMBOLS = ['INFY', 'TCS', 'RELIANCE', 'HDFCBANK', 'ITC'];

const BASE_WATCHLIST = [
  { symbol: 'INFY', name: 'Infosys Ltd.' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.' },
  { symbol: 'ITC', name: 'ITC Limited' }
];

export default function Watchlist({ activeSymbol, onSelect }) {
  const [search, setSearch] = useState('');
  const [prices, setPrices] = useState({});
  const [flashes, setFlashes] = useState({});

  useEffect(() => {
    let _mounted = true;
    
    // Fallback static entries for symbols not in our live market data feed (US stocks)
    const initPrices = {};
    [...MOCK_WATCHLIST, ...BASE_WATCHLIST].forEach(item => {
      initPrices[item.symbol] = { 
        price: { AAPL: 170, GOOGL: 140, MSFT: 370, TSLA: 245, AMZN: 175, NVDA: 480, META: 350, JPM: 170, V: 260, 'BTC-USD': 42000 }[item.symbol] || 100, 
        pct: 0 
      };
    });
    setPrices(initPrices);

    const fetchLivePrices = async () => {
      try {
        const res = await tradingAPI.getMarketPrices();
        if (!_mounted) return;
        
        const newPrices = { ...initPrices };
        const newFlashes = {};
        
        res.data.prices.forEach(p => {
          if (!p) return;
          
          // Trigger a color flash if price went up or down compared to local state
          setPrices(current => {
            const oldp = current[p.symbol]?.price;
            if (oldp && p.price > oldp) newFlashes[p.symbol] = 'bg-gain/20';
            else if (oldp && p.price < oldp) newFlashes[p.symbol] = 'bg-loss/20';
            return current;
          });
          
          newPrices[p.symbol] = {
            price: p.price,
            pct: p.change_percent
          };
        });
        
        setPrices(current => ({ ...current, ...newPrices }));
        
        if (Object.keys(newFlashes).length > 0) {
          setFlashes(newFlashes);
          setTimeout(() => { if (_mounted) setFlashes({}) }, 300); // Clear flash after 300ms
        }
        
      } catch (err) {
        console.error('Failed to fetch market data', err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 2000);
    return () => { _mounted = false; clearInterval(interval); };
  }, []);

  // Display India live stocks first, then US mock stocks
  const combinedList = [...BASE_WATCHLIST, ...MOCK_WATCHLIST];

  const filtered = combinedList.filter(
    (s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-terminal-border">
        <h2 className="text-sm font-bold tracking-wide text-terminal-text mb-3">
          Watchlist
        </h2>
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-terminal-text-dim pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbols..."
            className="w-full bg-terminal-bg border border-terminal-border rounded py-2 pl-9 pr-3 text-xs text-terminal-text placeholder-terminal-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((item) => {
          const data = prices[item.symbol] || { price: 0, pct: 0 };
          const isPositive = data.pct >= 0;
          const isActive = item.symbol === activeSymbol;
          const flashClass = flashes[item.symbol] || '';
          
          return (
            <button
              key={item.symbol}
              onClick={() => onSelect(item.symbol)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-300 border-l-2 ${
                isActive
                  ? 'bg-terminal-card border-accent-blue'
                  : 'border-transparent hover:bg-terminal-border/50'
              } ${flashClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Star size={14} className={`shrink-0 ${isActive ? 'text-accent-blue fill-accent-blue/20 drop-shadow-[0_0_8px_rgba(41,98,255,0.5)]' : 'text-terminal-text-dim hover:text-terminal-text-muted transition-colors'}`} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate tracking-tight">{item.symbol}</div>
                  <div className="text-xs text-terminal-text-muted truncate">{item.name}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-sm font-mono font-medium tracking-tight">
                  {data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center gap-0.5 justify-end text-[11px] font-mono mt-0.5 font-medium ${isPositive ? 'text-gain' : 'text-loss'}`}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isPositive ? '+' : ''}{data.pct.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
