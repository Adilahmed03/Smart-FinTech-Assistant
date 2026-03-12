import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Loader2 } from 'lucide-react';
import { tradingAPI } from '../api';

export default function TradeHistory({ refreshTrigger }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTrades = async () => {
    try {
      const res = await tradingAPI.getTrades();
      setTrades(res.data.trades || []);
    } catch {
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    // Refresh every 5 seconds to pick up new trades
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const filtered = filter === 'all' ? trades : trades.filter((t) => t.type?.toLowerCase() === filter);

  return (
    <div className="h-48 min-h-[192px] border-t border-terminal-border bg-terminal-surface flex flex-col shrink-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-border shrink-0">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-terminal-text-dim" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-terminal-text-muted">
            Trade History
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {['all', 'buy', 'sell'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase rounded transition-colors ${
                filter === f
                  ? 'bg-accent-cyan/15 text-accent-cyan'
                  : 'text-terminal-text-dim hover:text-terminal-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={16} className="animate-spin text-accent-cyan" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-terminal-text-dim">
            No trades yet
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-terminal-surface">
              <tr className="text-[10px] uppercase tracking-wider text-terminal-text-dim">
                <th className="text-left py-1.5 px-4 font-medium">Time</th>
                <th className="text-left py-1.5 px-2 font-medium">Symbol</th>
                <th className="text-left py-1.5 px-2 font-medium">Side</th>
                <th className="text-right py-1.5 px-2 font-medium">Qty</th>
                <th className="text-right py-1.5 px-2 font-medium">Price</th>
                <th className="text-right py-1.5 px-4 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-t border-terminal-border/50 hover:bg-terminal-card/40 transition-colors"
                >
                  <td className="py-1.5 px-4 font-mono text-terminal-text-dim">{trade.timestamp}</td>
                  <td className="py-1.5 px-2 font-semibold">{trade.symbol}</td>
                  <td className="py-1.5 px-2">
                    <span className={`inline-flex items-center gap-0.5 font-semibold ${trade.type === 'BUY' ? 'text-gain' : 'text-loss'}`}>
                      {trade.type === 'BUY' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{trade.quantity}</td>
                  <td className="py-1.5 px-2 text-right font-mono">₹{trade.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1.5 px-4 text-right font-mono">₹{trade.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
