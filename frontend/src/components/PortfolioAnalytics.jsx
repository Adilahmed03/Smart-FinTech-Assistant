import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, PieChart as PieIcon, Activity } from 'lucide-react';
import { tradingAPI } from '../api';

const COLORS = ['#2962ff', '#089981', '#f23645', '#e91e63', '#ff9800', '#9c27b0'];

export default function PortfolioAnalytics({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await tradingAPI.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#131722]">
        <Loader2 className="animate-spin text-[#2962ff]" size={32} />
      </div>
    );
  }

  if (!data) return null;

  const { portfolio_value, profit_loss, return_percentage, asset_allocation, history } = data;

  // Prepare history data for AreaChart
  const chartData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: h.value,
    pnl: h.profit_loss
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-[#131722] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-lg">
            <div className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider mb-2">Total Equity</div>
            <div className="text-3xl font-bold text-[#d1d4dc]">₹{portfolio_value.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-lg">
            <div className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider mb-2">Total P&L</div>
            <div className={`text-3xl font-bold flex items-center gap-2 ${profit_loss >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {profit_loss >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              ₹{Math.abs(profit_loss).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-lg">
            <div className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider mb-2">Return %</div>
            <div className={`text-3xl font-bold ${return_percentage >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {return_percentage >= 0 ? '+' : ''}{return_percentage}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Portfolio Value Over Time */}
          <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={16} className="text-[#2962ff]" />
              <h3 className="text-[14px] font-bold text-[#d1d4dc]">Account Value Trend</h3>
            </div>
            <div className="h-[300px] w-full">
              <div className="h-full w-full opacity-90">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2962ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2962ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                      <XAxis dataKey="time" stroke="#787b86" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#787b86" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e222d', border: '1px solid #2a2e39', borderRadius: '4px', fontSize: '12px' }}
                        itemStyle={{ color: '#d1d4dc' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#2962ff" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#787b86] text-xs">Execute trades to see trend data</div>
                )}
              </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <PieIcon size={16} className="text-[#2962ff]" />
              <h3 className="text-[14px] font-bold text-[#d1d4dc]">Asset Allocation</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={asset_allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="symbol"
                  >
                    {asset_allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e222d', border: '1px solid #2a2e39', borderRadius: '4px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#787b86' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit & Loss Trend */}
          <div className="bg-[#1e222d] border border-[#2a2e39] p-6 rounded-lg lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-[#089981]" />
              <h3 className="text-[14px] font-bold text-[#d1d4dc]">Net P&L Momentum</h3>
            </div>
            <div className="h-[250px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                    <XAxis dataKey="time" stroke="#787b86" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#787b86" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e222d', border: '1px solid #2a2e39', borderRadius: '4px', fontSize: '12px' }}
                    />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#089981' : '#f23645'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#787b86] text-xs">Execute trades to see P&L momentum</div>
              )}
            </div>
          </div>

        </div>

        {/* Holdings Report Table */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2e39] flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#d1d4dc] flex items-center gap-2">
              <Activity size={16} className="text-[#2962ff]" />
              Detailed Holdings Report
            </h3>
            <span className="text-[11px] text-[#787b86] uppercase font-bold tracking-widest">
              {asset_allocation.length} Active Positions
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-[#131722]/50 text-[#787b86] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3 font-medium">Symbol</th>
                  <th className="px-6 py-3 font-medium">Quantity</th>
                  <th className="px-6 py-3 font-medium">Avg Cost</th>
                  <th className="px-6 py-3 font-medium">Current Price</th>
                  <th className="px-6 py-3 font-medium">Market Value</th>
                  <th className="px-6 py-3 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39]">
                {asset_allocation.map((h, i) => (
                  <tr key={i} className="hover:bg-[#131722]/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#d1d4dc]">{h.symbol}</td>
                    <td className="px-6 py-4 text-[#d1d4dc]">{h.quantity}</td>
                    <td className="px-6 py-4 text-[#d1d4dc]">₹{h.avg_buy_price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-[#d1d4dc]">₹{h.current_price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-[#d1d4dc]">₹{h.value.toLocaleString('en-IN')}</td>
                    <td className={`px-6 py-4 text-right font-bold ${h.pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                      <div className="text-[10px] font-normal opacity-70">
                        {((h.pnl / h.cost) * 100).toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
                {asset_allocation.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#787b86] italic">
                      No active holdings discovered for this portfolio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
