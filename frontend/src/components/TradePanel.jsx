import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2, 
  CheckCircle, 
  Wallet, 
  Target, 
  Zap, 
  ShieldCheck,
  Info
} from 'lucide-react';
import { tradingAPI } from '../api';

export default function TradePanel({ symbol, refreshTrigger, onTrade }) {
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [cashBalance, setCashBalance] = useState(null);
  const [positionSize, setPositionSize] = useState(0);
  const [livePrice, setLivePrice] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await tradingAPI.getPortfolio();
        setCashBalance(res.data.cash_balance);
        const holding = res.data.holdings.find(h => h.symbol === symbol);
        setPositionSize(holding ? holding.quantity : 0);
      } catch (err) {
        console.error('Portfolio fetch error', err);
      }
    };
    fetchPortfolio();
  }, [symbol, refreshTrigger]);

  useEffect(() => {
    let _mounted = true;
    const fetchPrice = async () => {
      try {
        const res = await tradingAPI.getMarketPrice(symbol);
        if (_mounted && res.data?.price) setLivePrice(res.data.price);
      } catch (err) {
        console.error('Market price error', err);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => { _mounted = false; clearInterval(interval); };
  }, [symbol]);

  const effectivePrice = orderType === 'market' ? livePrice : parseFloat(price) || 0;
  const estimatedTotal = (parseFloat(quantity) || 0) * effectivePrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setFeedback({ type: 'error', msg: 'Invalid Quantity' });
      setLoading(false);
      return;
    }

    try {
      const apiCall = side === 'buy' ? tradingAPI.buy : tradingAPI.sell;
      const res = await apiCall(symbol, qty, effectivePrice);
      setCashBalance(res.data.portfolio.cash_balance);
      setFeedback({
        type: 'success',
        msg: `${side.toUpperCase()} EXECUTED: ${qty} ${symbol} @ ₹${effectivePrice.toFixed(2)}`,
      });
      setQuantity('');
      setPrice('');
      if (onTrade) onTrade();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.detail || 'Execution Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      {/* Symbol Snapshot */}
      <div className="bg-card rounded-lg p-4 border border-card-border shadow-terminal flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1">Live Execution</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-text-primary tracking-tighter">{symbol}</span>
            <div className="flex items-center gap-1 bg-success/10 px-1.5 py-0.5 rounded">
               <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
               <span className="text-[10px] font-black text-success uppercase">₹{livePrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <Zap size={20} className="text-primary opacity-50" />
      </div>

      {/* Execution Form */}
      <div className="bg-card rounded-lg border border-card-border shadow-terminal overflow-hidden">
        <div className="flex bg-bg/50 border-b border-card-border">
          <button 
            onClick={() => setSide('buy')}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all ${
              side === 'buy' ? 'text-success bg-success/5 border-b-2 border-success' : 'text-text-dim hover:text-text-secondary'
            }`}
          >
            Buy
          </button>
          <button 
            onClick={() => setSide('sell')}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all ${
              side === 'sell' ? 'text-danger bg-danger/5 border-b-2 border-danger' : 'text-text-dim hover:text-text-secondary'
            }`}
          >
            Sell
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {feedback && (
            <div className={`p-3 rounded text-[11px] font-bold border flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              {feedback.type === 'success' ? <CheckCircle size={14} /> : <Info size={14} />}
              {feedback.msg}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2 block">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full bg-bg border border-card-border rounded p-2 text-xs text-text-primary font-bold focus:outline-none focus:border-primary transition-colors"
            >
              <option value="market">Market Execution</option>
              <option value="limit">Limit Order</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2 block">Size {symbol}</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="w-full bg-bg border border-card-border rounded p-2 text-xs font-mono text-text-primary placeholder:text-text-dim focus:outline-none focus:border-primary"
            />
          </div>

          {orderType === 'limit' && (
            <div>
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2 block">Limit Price</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim text-xs">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-bg border border-card-border rounded py-2 pl-7 pr-3 text-xs font-mono text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="bg-bg/50 rounded-lg p-3 border border-card-border/50">
             <div className="flex justify-between text-[10px] font-bold text-text-dim uppercase tracking-tighter mb-1">
                <span>Value Estimate</span>
                <span className="text-text-secondary">Fee Applied (0.00%)</span>
             </div>
             <div className="text-lg font-black font-mono text-text-primary tracking-tighter">
                ₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
             </div>
          </div>

          <button
            type="submit"
            disabled={!quantity || loading}
            className={`w-full py-3 rounded text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 ${
              side === 'buy' ? 'bg-success hover:bg-success/90 text-white shadow-success/20' : 'bg-danger hover:bg-danger/90 text-white shadow-danger/20'
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {side === 'buy' ? 'Commit Buy Order' : 'Commit Sell Order'}
          </button>
        </form>
      </div>

      {/* Account Context */}
      <div className="space-y-3 px-1">
        <h4 className="text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-2 mb-2">
           <Wallet size={12} className="text-secondary" />
           Liquidity Context
        </h4>
        
        <div className="flex justify-between items-center py-2 border-b border-card-border/30">
           <span className="text-xs text-text-secondary font-medium uppercase tracking-tight">Buying Power</span>
           <span className="text-xs font-black font-mono text-text-primary">
             ₹{cashBalance !== null ? cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '1,00,000.00'}
           </span>
        </div>

        <div className="flex justify-between items-center py-2">
           <span className="text-xs text-text-secondary font-medium uppercase tracking-tight">Asset Exposure</span>
           <div className="flex items-center gap-2 font-mono">
              <span className="text-xs font-black text-primary">{positionSize}</span>
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{symbol}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
