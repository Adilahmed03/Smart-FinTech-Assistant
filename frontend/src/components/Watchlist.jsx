import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Search, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
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
    
    // Initialize with fallback prices
    const initPrices = {};
    [...BASE_WATCHLIST, ...MOCK_WATCHLIST].forEach(item => {
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
          
          setPrices(current => {
            const oldp = current[p.symbol]?.price;
            if (oldp && p.price > oldp) newFlashes[p.symbol] = 'text-success';
            else if (oldp && p.price < oldp) newFlashes[p.symbol] = 'text-danger';
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
          setTimeout(() => { if (_mounted) setFlashes({}) }, 800);
        }
        
      } catch (err) {
        console.error('Failed to fetch market data', err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 2000);
    return () => { _mounted = false; clearInterval(interval); };
  }, []);

  const combinedList = [...BASE_WATCHLIST, ...MOCK_WATCHLIST];
  const filtered = combinedList.filter(
    (s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-bg border-r border-card-border">
      {/* Sidebar Header */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
            <Activity size={12} className="text-primary" />
            Market Watch
          </h3>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
             <span className="text-[9px] font-bold text-success uppercase">Live</span>
          </div>
        </div>

        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Symbols..."
            className="w-full bg-card border border-card-border rounded py-2 pl-9 pr-3 text-[11px] font-bold uppercase tracking-wider text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary/40 transition-all"
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 pb-4 flex flex-col gap-0.5">
          {filtered.map((item) => {
            const data = prices[item.symbol] || { price: 0, pct: 0 };
            const isPositive = data.pct >= 0;
            const isActive = item.symbol === activeSymbol;
            const flashClass = flashes[item.symbol] || '';
            
            return (
              <button
                key={item.symbol}
                onClick={() => onSelect(item.symbol)}
                className={`w-full flex items-center justify-between p-3 rounded-md transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5'
                    : 'hover:bg-card border border-transparent'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                
                <div className="flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-black tracking-tight ${isActive ? 'text-primary' : 'text-text-primary'}`}>
                      {item.symbol}
                    </span>
                    {isActive && <div className="w-1 h-1 rounded-full bg-primary animate-ping" />}
                  </div>
                  <span className="text-[10px] text-text-dim truncate max-w-[120px] font-medium uppercase tracking-tighter">
                    {item.name}
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-[12px] font-bold font-mono transition-colors duration-500 ${flashClass || (isActive ? 'text-text-primary' : 'text-text-primary')}`}>
                    {data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <div className={`flex items-center gap-1 text-[10px] font-black ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                    {isPositive ? '+' : ''}{data.pct.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-card/10 border-t border-card-border">
         <div className="flex items-center justify-between text-[10px] font-bold text-text-dim uppercase tracking-widest">
            <span>Market Hours</span>
            <span className="text-text-secondary">09:15 - 15:30</span>
         </div>
      </div>
    </div>
  );
}
