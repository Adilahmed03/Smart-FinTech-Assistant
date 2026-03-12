import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { 
  Maximize2, 
  Settings, 
  BarChart2, 
  Clock, 
  ChevronDown, 
  Layers,
  Activity
} from 'lucide-react';
import { tradingAPI } from '../api';

const intervals = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

export default function ChartPanel({ symbol, refreshTrigger }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [activeInterval, setActiveInterval] = useState('1D');
  const [currentPriceData, setCurrentPriceData] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 10,
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.3)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.3)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
        horzLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: { top: 0.1, bottom: 0.25 },
        autoScale: true,
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: { time: true, price: true } }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      priceFormat: { precision: 2, minMove: 0.01 }
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    const ro = new ResizeObserver(handleResize);
    ro.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    let intervalId;
    let _mounted = true;
    
    const yfMap = {
      '1m': { p: '5d', i: '1m' },
      '5m': { p: '60d', i: '5m' },
      '15m': { p: '60d', i: '15m' },
      '1H': { p: '730d', i: '1h' },
      '4H': { p: '730d', i: '1h' },
      '1D': { p: '2y', i: '1d' },
      '1W': { p: '5y', i: '1wk' },
    };

    const initData = async () => {
      try {
        const { p, i } = yfMap[activeInterval] || { p: '1mo', i: '1d' };
        const histRes = await tradingAPI.getMarketHistory(symbol, p, i);
        if (!_mounted) return;
        
        let history = histRes.data.data;
        if (!history || history.length === 0) return;
        
        history = history.sort((a,b) => a.time - b.time);
        
        const uniqueHistory = [];
        const seenTimes = new Set();
        for (let candle of history) {
            if (!seenTimes.has(candle.time)) {
                seenTimes.add(candle.time);
                uniqueHistory.push(candle);
            }
        }
        
        if (candleSeriesRef.current) candleSeriesRef.current.setData(uniqueHistory);
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(uniqueHistory.map(c => ({
            time: c.time,
            value: c.volume || Math.random() * 1000,
            color: c.close >= c.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          })));
        }
        if (chartRef.current) chartRef.current.timeScale().fitContent();
        
        const liveRes = await tradingAPI.getMarketPrice(symbol);
        if (!_mounted) return;
        
        const livePrice = liveRes.data?.price;
        if (livePrice) {
            let lastCandle = uniqueHistory[uniqueHistory.length - 1];
            lastCandle = { ...lastCandle, close: livePrice, high: Math.max(lastCandle.high, livePrice), low: Math.min(lastCandle.low, livePrice) };
            if (candleSeriesRef.current) candleSeriesRef.current.update(lastCandle);
            setCurrentPriceData(lastCandle);
        }

        intervalId = setInterval(async () => {
          try {
            const updateRes = await tradingAPI.getMarketPrice(symbol);
            if (!_mounted) return;
            const newPrice = updateRes.data?.price;
            if (!newPrice) return;
            
            setCurrentPriceData(prev => {
              if (!prev) return null;
              const nextValue = {
                ...prev,
                close: newPrice,
                high: Math.max(prev.high, newPrice),
                low: Math.min(prev.low, newPrice)
              };
              if (candleSeriesRef.current) candleSeriesRef.current.update(nextValue);
              return nextValue;
            });
          } catch (e) {
            console.error('Failed price update', e);
          }
        }, 2000);
      } catch (err) {
        console.error('Failed init data', err);
      }
    };
    
    initData();
    return () => { _mounted = false; clearInterval(intervalId); };
  }, [symbol, activeInterval]);

  useEffect(() => {
    let _mounted = true;
    const loadMarkers = async () => {
      try {
        const res = await tradingAPI.getTrades();
        if (!_mounted) return;
        const symbolTrades = (res.data.trades || []).filter(t => t.symbol === symbol);
        
        const markers = symbolTrades.map(t => {
          const timeUnix = Math.floor(new Date(t.timestamp).getTime() / 1000);
          const isBuy = t.type === 'BUY';
          return {
            time: timeUnix,
            position: isBuy ? 'belowBar' : 'aboveBar',
            color: isBuy ? '#22c55e' : '#ef4444',
            shape: isBuy ? 'arrowUp' : 'arrowDown',
            text: `${isBuy ? 'B' : 'S'} ${t.quantity}`,
            size: 1,
          };
        }).sort((a, b) => a.time - b.time);
        
        if (candleSeriesRef.current) candleSeriesRef.current.setMarkers(markers);
      } catch (e) {
        console.error('Failed markers', e);
      }
    };
    setTimeout(loadMarkers, 500);
    return () => { _mounted = false; };
  }, [symbol, refreshTrigger]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Chart Control Bar */}
      <div className="h-12 border-b border-card-border bg-card/10 flex items-center justify-between px-4 shrink-0 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-text-primary tracking-tighter">{symbol}</span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded tracking-widest uppercase">Live</span>
          </div>

          <div className="h-4 w-px bg-card-border" />

          <div className="flex items-center gap-1 bg-bg/50 p-1 rounded-md border border-card-border">
            {intervals.map((iv) => (
              <button
                key={iv}
                onClick={() => setActiveInterval(iv)}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded transition-all ${
                  activeInterval === iv
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-text-dim hover:text-text-secondary'
                }`}
              >
                {iv}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-card-border" />

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-1.5 text-[10px] font-bold text-text-dim hover:text-text-primary transition-colors uppercase tracking-widest">
                <Layers size={12} className="text-primary" />
                Indicators
                <ChevronDown size={10} />
             </button>
             <button className="flex items-center gap-1.5 text-[10px] font-bold text-text-dim hover:text-text-primary transition-colors uppercase tracking-widest">
                <BarChart2 size={12} className="text-secondary" />
                Price Type
                <ChevronDown size={10} />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1">
                 <span className="text-text-dim">O:</span>
                 <span className="text-text-primary">{currentPriceData?.open?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="text-text-dim">H:</span>
                 <span className="text-success">{currentPriceData?.high?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="text-text-dim">L:</span>
                 <span className="text-danger">{currentPriceData?.low?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="text-text-dim">C:</span>
                 <span className={currentPriceData?.close >= currentPriceData?.open ? 'text-success' : 'text-danger'}>
                   {currentPriceData?.close?.toFixed(2) || '0.00'}
                 </span>
              </div>
           </div>
           
           <div className="h-4 w-px bg-card-border" />
           
           <div className="flex items-center gap-2">
              <button className="p-2 text-text-dim hover:text-text-primary hover:bg-card-border/30 rounded transition-all">
                 <Settings size={14} />
              </button>
              <button className="p-2 text-text-dim hover:text-text-primary hover:bg-card-border/30 rounded transition-all">
                 <Maximize2 size={14} />
              </button>
           </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
         <div ref={chartContainerRef} className="absolute inset-0" />
         
         {/* Live Update Heartbeat */}
         <div className="absolute top-4 right-20 flex items-center gap-2 bg-card/60 backdrop-blur px-2 py-1 rounded border border-card-border shadow-xl z-10 pointer-events-none">
            <Activity size={10} className="text-success animate-pulse" />
            <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em]">Stream Connected</span>
         </div>
      </div>
    </div>
  );
}
