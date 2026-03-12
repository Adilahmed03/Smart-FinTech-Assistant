import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

import { tradingAPI } from '../api';

// Removed random historical data generator. Using actual yfinance history data from the backend API.

function generateVolumeData(candles) {
  return candles.map((c) => ({
    time: c.time,
    value: Math.floor(Math.random() * 50000000 + 5000000),
    color: c.close >= c.open ? 'rgba(8,153,129,0.35)' : 'rgba(242,54,69,0.35)',
  }));
}

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
        background: { color: '#0a0e17' },
        textColor: '#64748b',
        fontSize: 11,
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(30,41,59,0.5)' },
        horzLines: { color: 'rgba(30,41,59,0.5)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
        horzLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#089981',
      downColor: '#f23645',
      borderDownColor: '#f23645',
      borderUpColor: '#089981',
      wickDownColor: '#f23645',
      wickUpColor: '#089981',
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
    const ro = new ResizeObserver(handleResize);
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []); // Only run once to initialize chart

  // Fetch live market data and stream updates
  useEffect(() => {
    let intervalId;
    let _mounted = true;
    
    // Map our intervals to yfinance params
    const yfMap = {
      '1m': { p: '5d', i: '1m' },
      '5m': { p: '60d', i: '5m' },
      '15m': { p: '60d', i: '15m' },
      '1H': { p: '730d', i: '1h' },
      '4H': { p: '730d', i: '1h' }, // Fallback to 1h
      '1D': { p: '2y', i: '1d' },
      '1W': { p: '5y', i: '1wk' },
    };

    const initData = async () => {
      try {
        const { p, i } = yfMap[activeInterval] || { p: '1mo', i: '1d' };
        
        // 1. Fetch real historical data
        const histRes = await tradingAPI.getMarketHistory(symbol, p, i);
        if (!_mounted) return;
        
        let history = histRes.data.data;
        if (!history || history.length === 0) return;
        
        // Lightweight charts requires time to be in ascending order
        history = history.sort((a,b) => a.time - b.time);
        
        // To prevent duplicate times confusing lightweight-charts
        // we map it out slightly and remove perfect duplicates
        const uniqueHistory = [];
        const seenTimes = new Set();
        for (let candle of history) {
            if (!seenTimes.has(candle.time)) {
                seenTimes.add(candle.time);
                uniqueHistory.push(candle);
            }
        }
        
        if (candleSeriesRef.current) candleSeriesRef.current.setData(uniqueHistory);
        if (volumeSeriesRef.current) volumeSeriesRef.current.setData(generateVolumeData(uniqueHistory));
        if (chartRef.current) chartRef.current.timeScale().fitContent();
        
        // 2. Fetch current live price and append/update the last candle
        const liveRes = await tradingAPI.getMarketPrice(symbol);
        if (!_mounted) return;
        
        let livePrice = liveRes.data?.price;
        if (livePrice) {
            let lastCandle = uniqueHistory[uniqueHistory.length - 1];
            lastCandle = { ...lastCandle, close: livePrice, high: Math.max(lastCandle.high, livePrice), low: Math.min(lastCandle.low, livePrice) };
            if (candleSeriesRef.current) candleSeriesRef.current.update(lastCandle);
            setCurrentPriceData(lastCandle);
        }

        // Stream live updates every 2 seconds
        intervalId = setInterval(async () => {
          try {
            const updateRes = await tradingAPI.getMarketPrice(symbol);
            if (!_mounted) return;
            const newPrice = updateRes.data?.price;
            if (!newPrice) return;
            
            setCurrentPriceData(prev => {
              if (!prev) return null;
              const nextCandle = {
                ...prev,
                close: newPrice,
                high: Math.max(prev.high, newPrice),
                low: Math.min(prev.low, newPrice)
              };
              if (candleSeriesRef.current) candleSeriesRef.current.update(nextCandle);
              return nextCandle;
            });
          } catch (e) {
            console.error('Failed to fetch price update', e);
          }
        }, 2000);
      } catch (err) {
        console.error('Failed to initialize market data', err);
      }
    };
    
    initData();

    return () => {
        _mounted = false;
        clearInterval(intervalId);
    };
  }, [symbol, activeInterval]);

  // Fetch trades to display markers on the chart
  useEffect(() => {
    let _mounted = true;
    const loadTradeMarkers = async () => {
      try {
        const res = await tradingAPI.getTrades();
        if (!_mounted) return;
        const allTrades = res.data.trades || [];
        const symbolTrades = allTrades.filter(t => t.symbol === symbol);
        
        const markers = symbolTrades.map(t => {
          // Parse the ISO timestamp and convert to Unix seconds
          const timeUnix = Math.floor(new Date(t.timestamp).getTime() / 1000);
          const isBuy = t.type === 'BUY';
          return {
            time: timeUnix,
            position: isBuy ? 'belowBar' : 'aboveBar',
            color: isBuy ? '#089981' : '#f23645',
            shape: isBuy ? 'arrowUp' : 'arrowDown',
            text: `${isBuy ? 'B' : 'S'} ${t.quantity}`,
            size: 1,
          };
        }).sort((a, b) => a.time - b.time); // Must be strictly ordered by time
        
        if (candleSeriesRef.current) {
          candleSeriesRef.current.setMarkers(markers);
        }
      } catch (e) {
        console.error('Failed to load trade markers', e);
      }
    };
    
    // Slight delay to ensure chart series is initialized
    const timer = setTimeout(loadTradeMarkers, 500);
    return () => {
      _mounted = false;
      clearTimeout(timer);
    };
  }, [symbol, refreshTrigger]);

  const lastCandle = currentPriceData || { open: 0, high: 0, low: 0, close: 0 };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chart Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-surface shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-accent-cyan">{symbol}</span>
          <div className="flex items-center gap-0.5">
            {intervals.map((iv) => (
              <button
                key={iv}
                onClick={() => setActiveInterval(iv)}
                className={`px-2 py-1 text-[10px] font-semibold rounded transition-colors ${
                  activeInterval === iv
                    ? 'bg-accent-cyan/15 text-accent-cyan'
                    : 'text-terminal-text-muted hover:text-terminal-text'
                }`}
              >
                {iv}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 border-l pl-3 ml-1 border-terminal-border">
            <button className="px-2 py-1 text-[10px] font-semibold text-terminal-text-muted hover:text-terminal-text rounded transition-colors flex items-center gap-1">
              <span className="text-xl leading-none -mt-1">+</span> Indicators
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-terminal-text-muted">
            O <span className="text-terminal-text">{currentPriceData?.open?.toFixed(2) || '0.00'}</span>
          </span>
          <span className="text-terminal-text-muted">
            H <span className="text-gain">{currentPriceData?.high?.toFixed(2) || '0.00'}</span>
          </span>
          <span className="text-terminal-text-muted">
            L <span className="text-loss">{currentPriceData?.low?.toFixed(2) || '0.00'}</span>
          </span>
          <span className="text-terminal-text-muted">
            C <span className={
              currentPriceData?.close >= currentPriceData?.open ? 'text-gain font-bold' : 'text-loss font-bold'
            }>{currentPriceData?.close?.toFixed(2) || '0.00'}</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  );
}
