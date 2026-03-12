import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Loader2, 
  Filter, 
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';
import { tradingAPI } from '../api';

export default function TradeHistory({ refreshTrigger }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTrades = async () => {
    try {
      const res = await tradingAPI.getTrades();
      // Ensure we have a valid array
      const rawTrades = Array.isArray(res.data.trades) ? res.data.trades : [];
      // Sort by date descending
      setTrades(rawTrades.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error('History fetch error', err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 10000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const filtered = filter === 'all' ? trades : trades.filter((t) => t.type?.toLowerCase() === filter);

  const formatTime = (ts) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg border-t border-card-border overflow-hidden">
      {/* Activity Toolbar */}
      <div className="h-10 border-b border-card-border bg-card/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
            Execution Ledger
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-bg/50 p-1 rounded border border-card-border">
            {['all', 'buy', 'sell'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${
                  filter === f
                    ? 'bg-text-secondary text-white'
                    : 'text-text-dim hover:text-text-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchTrades}
            className="p-1.5 text-text-dim hover:text-text-primary transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && trades.length === 0 ? (
          <div className="flex flex-center h-full items-center justify-center opacity-30">
             <Activity size={24} className="animate-pulse text-text-dim" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px] font-bold text-text-dim uppercase tracking-widest">
            Log Entry Empty
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-bg z-10">
              <tr className="border-b border-card-border">
                <th className="py-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-text-dim">Timestamp</th>
                <th className="py-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-text-dim">Asset</th>
                <th className="py-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-text-dim">Side</th>
                <th className="py-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-text-dim text-right">Qty</th>
                <th className="py-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-text-dim text-right">Price</th>
                <th className="py-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-text-dim text-right">Settlement</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade, idx) => {
                const isBuy = trade.type === 'BUY';
                return (
                  <tr
                    key={trade.id || idx}
                    className="group border-b border-card-border/30 hover:bg-card/20 transition-all"
                  >
                    <td className="py-2 px-4 font-mono text-[11px] text-text-dim group-hover:text-text-secondary transition-colors">
                      {formatTime(trade.timestamp)}
                    </td>
                    <td className="py-2 px-2 text-[11px] font-black tracking-tight text-text-primary">
                      {trade.symbol}
                    </td>
                    <td className="py-2 px-2">
                      <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isBuy ? 'text-success' : 'text-danger'}`}>
                        {isBuy ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                        {trade.type}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-[11px] font-bold">
                      {trade.quantity}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-[11px] text-text-secondary">
                      ₹{trade.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-[11px] font-black text-text-primary">
                      ₹{trade.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
