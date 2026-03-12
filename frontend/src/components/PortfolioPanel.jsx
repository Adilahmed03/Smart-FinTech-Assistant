import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Loader2, 
  PieChart, 
  LayoutGrid, 
  Briefcase,
  AlertCircle,
  Activity,
  Info
} from 'lucide-react';
import { tradingAPI } from '../api';

export default function PortfolioPanel({ refreshTrigger }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await tradingAPI.getPortfolio();
      setPortfolio(res.data);
    } catch (err) {
      console.error('Portfolio snapshot error', err);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [refreshTrigger]);

  if (loading && !portfolio) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertCircle size={32} className="text-danger opacity-50" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-text-primary uppercase tracking-widest">Snapshot Failed</p>
          <p className="text-[10px] text-text-dim uppercase font-bold">Check connectivity</p>
        </div>
        <button 
          onClick={fetchPortfolio} 
          className="terminal-btn-outline w-full py-2 flex items-center justify-center gap-2"
        >
          <RefreshCw size={12} />
          Re-initialize
        </button>
      </div>
    );
  }

  const holdings = portfolio.holdings || [];
  const cashBalance = portfolio.cash_balance ?? 100000;
  const totalInvested = holdings.reduce((s, h) => s + h.quantity * h.avg_buy_price, 0);
  const totalValue = cashBalance + totalInvested;

  const colors = ['bg-primary', 'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-sky-600'];

  return (
    <div className="flex-1 flex flex-col gap-6 p-5">
      {/* Exposure Summary */}
      <div className="bg-card rounded-lg p-5 border border-card-border shadow-terminal relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Briefcase size={48} className="text-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim flex items-center gap-2">
               <Activity size={10} className="text-primary" />
               Current Exposure
            </span>
            <button onClick={fetchPortfolio} className="text-text-dim hover:text-primary transition-colors">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="text-2xl font-black font-mono text-text-primary tracking-tighter">
            ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-card-border/50 grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest block">Available Cash</span>
                <span className="text-xs font-black font-mono text-text-primary">
                   ₹{cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
             </div>
             <div className="space-y-1">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest block">Deployed Cap</span>
                <span className="text-xs font-black font-mono text-text-primary">
                   ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Diversity Metrics */}
      {holdings.length > 0 && (
        <div className="bg-card/30 p-4 rounded-lg border border-card-border/50">
          <div className="flex items-center justify-between mb-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-text-dim flex items-center gap-2">
                <PieChart size={12} className="text-secondary" />
                Diversity Index
             </h4>
             <span className="text-[9px] font-black font-mono text-primary uppercase">{holdings.length} Positions</span>
          </div>

          <div className="flex rounded-full overflow-hidden h-1.5 bg-bg/50 border border-card-border/30">
            {holdings.map((h, i) => {
              const weight = totalInvested > 0 ? ((h.quantity * h.avg_buy_price) / totalInvested) * 100 : 0;
              return (
                <div
                  key={h.symbol}
                  className={`${colors[i % colors.length]} transition-all duration-700`}
                  style={{ width: `${weight}%` }}
                />
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
            {holdings.slice(0, 4).map((h, i) => {
              const weight = totalInvested > 0 ? ((h.quantity * h.avg_buy_price) / totalInvested) * 100 : 0;
              return (
                <div key={h.symbol} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`} />
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">
                    {h.symbol} <span className="text-text-dim font-bold">{weight.toFixed(0)}%</span>
                  </span>
                </div>
              );
            })}
            {holdings.length > 4 && (
               <span className="text-[9px] font-bold text-text-dim uppercase italic">+{holdings.length - 4} More</span>
            )}
          </div>
        </div>
      )}

      {/* Asset Inventory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dim flex items-center gap-2">
              <LayoutGrid size={12} className="text-primary" />
              Asset Inventory
           </h3>
        </div>
        
        <div className="space-y-2">
          {holdings.length === 0 ? (
            <div className="py-12 border border-dashed border-card-border rounded-lg text-center flex flex-col items-center gap-3">
               <Info size={20} className="text-text-dim opacity-30" />
               <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">No Active Positions</p>
            </div>
          ) : (
            holdings.map((h) => {
              const entryValue = h.quantity * h.avg_buy_price;
              return (
                <div
                  key={h.symbol}
                  className="bg-card hover:bg-bg border border-card-border rounded-lg p-3 group transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-bg border border-card-border flex items-center justify-center font-black text-[10px] text-primary group-hover:border-primary/30 transition-colors">
                          {h.symbol.slice(0, 2)}
                       </div>
                       <div>
                         <div className="text-[11px] font-black text-text-primary tracking-tight leading-none mb-1 uppercase">{h.symbol}</div>
                         <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest">{h.quantity} UNITS</div>
                       </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-black font-mono text-text-primary tracking-tighter">
                        ₹{entryValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest">
                        AVG ₹{h.avg_buy_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
