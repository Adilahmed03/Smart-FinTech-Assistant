import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { tradingAPI } from '../api';

export default function PortfolioPanel({ refreshTrigger }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await tradingAPI.getPortfolio();
      setPortfolio(res.data);
    } catch {
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-accent-cyan" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-terminal-text-muted text-xs p-4">
        <p>Could not load portfolio.</p>
        <button onClick={fetchPortfolio} className="mt-2 text-accent-cyan underline text-[10px]">Retry</button>
      </div>
    );
  }

  const holdings = portfolio.holdings || [];
  const cashBalance = portfolio.cash_balance ?? 100000;
  const totalInvested = holdings.reduce((s, h) => s + h.quantity * h.avg_buy_price, 0);
  const totalValue = cashBalance + totalInvested;

  // Colors for allocation bar
  const colors = ['bg-accent-cyan', 'bg-accent-purple', 'bg-accent-blue', 'bg-loss', 'bg-yellow-500', 'bg-gain', 'bg-pink-500'];
  const dotColors = ['text-accent-cyan', 'text-accent-purple', 'text-accent-blue', 'text-loss', 'text-yellow-500', 'text-gain', 'text-pink-500'];

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 rounded-lg p-4 mb-4 border border-terminal-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-terminal-text-dim">Portfolio Value</span>
          <button onClick={fetchPortfolio} className="text-terminal-text-dim hover:text-accent-cyan transition-colors">
            <RefreshCw size={12} />
          </button>
        </div>
        <div className="text-2xl font-bold font-mono">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div className="flex items-center gap-3 text-xs font-mono mt-1 text-terminal-text-muted">
          <span>Cash: ₹{cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span>Invested: ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Allocation Bar */}
      {holdings.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-terminal-text-dim mb-2">Allocation</div>
          <div className="flex rounded-full overflow-hidden h-2 bg-terminal-bg">
            {holdings.map((h, i) => {
              const pct = ((h.quantity * h.avg_buy_price) / totalInvested) * 100;
              return (
                <div
                  key={h.symbol}
                  className={`${colors[i % colors.length]} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                  title={`${h.symbol}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {holdings.map((h, i) => {
              const pct = ((h.quantity * h.avg_buy_price) / totalInvested) * 100;
              return (
                <div key={h.symbol} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`} />
                  <span className="text-[10px] text-terminal-text-muted">{h.symbol} {pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Holdings List */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-terminal-text-dim mb-1">
          Holdings ({holdings.length})
        </div>
        {holdings.length === 0 && (
          <p className="text-xs text-terminal-text-dim py-4 text-center">No holdings yet. Place a trade to get started!</p>
        )}
        {holdings.map((h) => {
          const value = h.quantity * h.avg_buy_price;
          return (
            <div
              key={h.symbol}
              className="bg-terminal-bg rounded-lg p-3 border border-terminal-border hover:border-terminal-border-hover transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-semibold">{h.symbol}</div>
                  <div className="text-[10px] text-terminal-text-dim">{h.quantity} shares @ ₹{h.avg_buy_price.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-medium">₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
