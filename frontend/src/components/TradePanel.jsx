import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Loader2, CheckCircle } from 'lucide-react';
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

  // Fetch portfolio to get position size
  React.useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await tradingAPI.getPortfolio();
        setCashBalance(res.data.cash_balance);
        const holding = res.data.holdings.find(h => h.symbol === symbol);
        setPositionSize(holding ? holding.quantity : 0);
      } catch (err) {
        console.error('Failed to fetch portfolio', err);
      }
    };
    fetchPortfolio();
  }, [symbol, refreshTrigger]);

  // Poll live price
  React.useEffect(() => {
    let _mounted = true;
    
    // Set fallback initial
    setLivePrice({ AAPL: 170, GOOGL: 140, MSFT: 370, TSLA: 245, AMZN: 175, NVDA: 480, META: 350, JPM: 170, V: 260, 'BTC-USD': 42000 }[symbol] || 100);

    const fetchPrice = async () => {
      try {
        const res = await tradingAPI.getMarketPrice(symbol);
        if (_mounted && res.data?.price) setLivePrice(res.data.price);
      } catch (err) {
        console.error('Failed to get market price', err);
      }
    };
    
    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => { _mounted = false; clearInterval(interval); };
  }, [symbol]);

  const effectivePrice = orderType === 'market' ? livePrice : parseFloat(price) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setFeedback({ type: 'error', msg: 'Enter a valid quantity' });
      setLoading(false);
      return;
    }

    try {
      const apiCall = side === 'buy' ? tradingAPI.buy : tradingAPI.sell;
      const res = await apiCall(symbol, qty, effectivePrice);
      const data = res.data;

      setCashBalance(data.portfolio.cash_balance);
      setFeedback({
        type: 'success',
        msg: `${side.toUpperCase()} ${qty} × ${symbol} @ ₹${effectivePrice.toFixed(2)} — Total ₹${data.trade.total.toFixed(2)}`,
      });
      setQuantity('');
      setPrice('');
      if (onTrade) onTrade();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.detail || 'Trade failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-terminal-text-muted mb-3">
        Paper Trading
      </h3>

      {/* Price Display */}
      <div className="bg-terminal-bg rounded-lg p-4 mb-5 border border-terminal-border flex justify-between items-center shadow-inner">
        <div>
          <span className="text-sm font-semibold text-terminal-text-muted">{symbol}</span>
          <div className="text-2xl font-bold font-mono tracking-tight mt-1">₹{livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-gain flex items-center gap-1 bg-gain/10 px-2 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" /> Live Price
          </span>
        </div>
      </div>

      {/* Buy / Sell Tabs */}
      <div className="flex border-b border-terminal-border mb-5">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wide transition-all ${
            side === 'buy'
              ? 'text-gain border-b-2 border-gain bg-gain/5'
              : 'text-terminal-text-muted hover:text-terminal-text hover:bg-terminal-border/30'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wide transition-all ${
            side === 'sell'
              ? 'text-loss border-b-2 border-loss bg-loss/5'
              : 'text-terminal-text-muted hover:text-terminal-text hover:bg-terminal-border/30'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-3 p-2.5 rounded-lg text-xs font-medium ${
          feedback.type === 'success'
            ? 'bg-gain/10 border border-gain/20 text-gain'
            : 'bg-loss/10 border border-loss/20 text-loss'
        }`}>
          {feedback.type === 'success' && <CheckCircle size={12} className="inline mr-1" />}
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Order Type */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-terminal-text-dim mb-1 block">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full bg-terminal-bg border border-terminal-border rounded-md py-2 px-3 text-xs text-terminal-text focus:outline-none focus:border-accent-cyan/50 transition-colors"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-terminal-text-dim mb-1 block">Quantity</label>
          <input
            type="number"
            min="0.01"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="w-full bg-terminal-bg border border-terminal-border rounded-md py-2 px-3 text-xs font-mono text-terminal-text placeholder-terminal-text-dim focus:outline-none focus:border-accent-cyan/50 transition-colors"
          />
        </div>

        {/* Price (for limit orders) */}
        {orderType !== 'market' && (
          <div>
            <label className="text-[10px] uppercase tracking-wider text-terminal-text-dim mb-1 block">Price</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-terminal-text-dim text-xs">₹</span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-terminal-bg border border-terminal-border rounded-md py-2 pl-7 pr-3 text-xs font-mono text-terminal-text placeholder-terminal-text-dim focus:outline-none focus:border-accent-cyan/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Estimated Total */}
        <div className="bg-terminal-bg rounded-lg p-3 border border-terminal-border">
          <div className="flex justify-between text-[10px] text-terminal-text-dim mb-1">
            <span>Est. Total</span>
            <span>Fee: ₹0.00</span>
          </div>
          <div className="text-sm font-bold font-mono">
            ₹{quantity ? (parseFloat(quantity) * effectivePrice).toFixed(2) : '0.00'}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!quantity || loading}
          className={`w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            side === 'buy'
              ? 'bg-gain hover:bg-gain/90 text-white shadow-lg shadow-gain/20'
              : 'bg-loss hover:bg-loss/90 text-white shadow-lg shadow-loss/20'
          }`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
        </button>
      </form>

      {/* Account */}
      <div className="mt-4 space-y-2">
        <h4 className="text-[10px] uppercase tracking-wider text-terminal-text-dim">Account</h4>
        <div className="flex justify-between text-xs">
          <span className="text-terminal-text-muted">Buying Power</span>
          <span className="font-mono font-medium">
            ₹{cashBalance !== null ? cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '1,00,000.00'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-terminal-text-muted">Currently Hold</span>
          <span className="font-mono font-medium text-accent-cyan">
            {positionSize} {symbol}
          </span>
        </div>
      </div>
    </div>
  );
}
