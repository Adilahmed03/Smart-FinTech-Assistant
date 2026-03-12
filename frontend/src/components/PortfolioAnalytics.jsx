import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Activity, 
  Wallet, 
  Target, 
  ArrowUpRight, 
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import { tradingAPI } from '../api';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4'];

const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, trend }) => (
  <div className="terminal-card p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 scale-150">
       <Icon size={48} className={colorClass} />
    </div>
    <div className="relative z-10 flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">{title}</span>
      <div className={`text-2xl font-black font-mono tracking-tighter ${colorClass}`}>
        {value}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
         {trend && (
           <span className={`text-[10px] font-black uppercase ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
             {trend >= 0 ? '+' : ''}{trend}%
           </span>
         )}
         <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{subtext}</span>
      </div>
    </div>
  </div>
);

export default function PortfolioAnalytics({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await tradingAPI.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error("Analytics fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary opacity-50" size={32} />
      </div>
    );
  }

  if (!data) return null;

  const { portfolio_value, profit_loss, return_percentage, asset_allocation, history } = data;
  const totalInvested = asset_allocation.reduce((s, h) => s + h.cost, 0);

  const chartData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: h.value,
    pnl: h.profit_loss
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-text-primary uppercase">Executive Dashboard</h1>
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">Portfolio Intelligence Unit</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="terminal-btn-outline flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Dataset
        </button>
      </div>
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Equity" 
          value={`₹${portfolio_value.toLocaleString('en-IN')}`}
          subtext="Net Asset Value"
          icon={Wallet}
          colorClass="text-text-primary"
        />
        <MetricCard 
          title="Session P&L" 
          value={`₹${profit_loss.toLocaleString('en-IN')}`}
          subtext="Realized/Unrealized"
          icon={Activity}
          colorClass={profit_loss >= 0 ? 'text-success' : 'text-danger'}
          trend={return_percentage}
        />
        <MetricCard 
          title="Deployed Capital" 
          value={`₹${totalInvested.toLocaleString('en-IN')}`}
          subtext="Total Cost Basis"
          icon={Target}
          colorClass="text-primary"
        />
        <MetricCard 
          title="Performance" 
          value={`${return_percentage >= 0 ? '+' : ''}${return_percentage}%`}
          subtext="Alpha Relative"
          icon={TrendingUp}
          colorClass={return_percentage >= 0 ? 'text-success' : 'text-danger'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Value Momentum */}
        <div className="terminal-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={12} className="text-primary" />
              Equity Momentum
            </h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-primary" />
               <span className="text-[9px] font-bold text-text-dim uppercase">Value (INR)</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.2)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="terminal-card p-6">
          <h3 className="text-[11px] font-black text-text-dim uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
            <PieIcon size={12} className="text-secondary" />
            Strategic Allocation
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={asset_allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  nameKey="symbol"
                  stroke="none"
                  animationDuration={1500}
                >
                  {asset_allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings Ledger */}
      <div className="terminal-card overflow-hidden">
        <div className="px-6 py-5 border-b border-card-border flex items-center justify-between bg-card/10">
          <div className="flex items-center gap-3">
             <LayoutGrid size={16} className="text-primary" />
             <h3 className="text-[12px] font-black text-text-primary uppercase tracking-widest">
                Active Asset Inventory
             </h3>
          </div>
          <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] bg-bg px-3 py-1 rounded border border-card-border">
            Audited Portfolio
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg text-text-dim text-[10px] font-black uppercase tracking-[0.2em] border-b border-card-border">
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4 text-right">Avg Cost</th>
                <th className="px-6 py-4 text-right">Price @ Close</th>
                <th className="px-6 py-4 text-right">Market Exposure</th>
                <th className="px-6 py-4 text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/30">
              {asset_allocation.map((h, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-all group">
                  <td className="px-6 py-4 flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-bg border border-card-border flex items-center justify-center text-[10px] font-black text-primary">
                        {h.symbol.slice(0, 2)}
                     </div>
                     <span className="text-[12px] font-black text-text-primary uppercase tracking-tight">{h.symbol}</span>
                  </td>
                  <td className="px-6 py-4 text-[12px] font-bold text-text-secondary uppercase">{h.quantity} Units</td>
                  <td className="px-6 py-4 text-right font-mono text-[12px] text-text-dim">₹{h.avg_buy_price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right font-mono text-[12px] text-text-primary">₹{h.current_price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right font-mono text-[12px] font-black text-text-primary">₹{h.value.toLocaleString('en-IN')}</td>
                  <td className={`px-6 py-4 text-right`}>
                    <div className={`text-[12px] font-black font-mono ${h.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">
                      {((h.pnl / h.cost) * 100).toFixed(2)}% ROI
                    </div>
                  </td>
                </tr>
              ))}
              {asset_allocation.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center flex flex-col items-center gap-4 opacity-30">
                    <Activity size={48} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">No Portfolio Data Synthesized</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
