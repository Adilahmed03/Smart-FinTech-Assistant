import yfinance as yf
import time
from typing import Dict, List, Optional
import asyncio

# Map frontend symbols to Yahoo Finance symbols
YF_SYMBOL_MAP = {
    # Indian Stocks (NSE)
    "INFY": "INFY.NS",
    "TCS": "TCS.NS",
    "RELIANCE": "RELIANCE.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ITC": "ITC.NS",
    # US Stocks & Crypto
    "AAPL": "AAPL",
    "GOOGL": "GOOGL",
    "MSFT": "MSFT",
    "TSLA": "TSLA",
    "AMZN": "AMZN",
    "NVDA": "NVDA",
    "META": "META",
    "JPM": "JPM",
    "V": "V",
    "BTC-USD": "BTC-USD",
}

SUPPORTED_SYMBOLS = list(YF_SYMBOL_MAP.keys())

# In-memory cache to prevent yfinance rate limits
# Format: { "AAPL": {"price": 170.1, "change_percent": 1.2, "timestamp": 12345678} }
_price_cache: Dict[str, dict] = {}

# Base prices for immediate fast startup
_BASE_PRICES = {
    "INFY": 1480.00, "TCS": 3650.00, "RELIANCE": 2420.00, "HDFCBANK": 1570.00, "ITC": 435.00,
    "AAPL": 178.72, "GOOGL": 141.80, "MSFT": 378.91, "TSLA": 248.42, "AMZN": 178.25,
    "NVDA": 495.22, "META": 356.18, "JPM": 172.44, "V": 264.31, "BTC-USD": 43250.00,
}

# Seed cache initially with base prices so frontend never waits
for sym in SUPPORTED_SYMBOLS:
    _price_cache[sym] = {
        "symbol": sym,
        "price": _BASE_PRICES[sym],
        "change_percent": 0.0
    }

def _fetch_yf_price_sync(symbol: str) -> Optional[dict]:
    """Synchronous helper to fetch the latest price from yfinance."""
    yf_symbol = YF_SYMBOL_MAP.get(symbol.upper())
    if not yf_symbol:
        return None
    try:
        ticker = yf.Ticker(yf_symbol)
        # Getting 'fast_info' or 'info'
        info = ticker.fast_info
        price = info['last_price']
        
        # Calculate change if possible (open might be missing in fast_info)
        open_price = info.get('open', price)
        change_pct = ((price - open_price) / open_price) * 100 if open_price else 0.0
        
        return {
            "symbol": symbol,
            "price": round(float(price), 2),
            "change_percent": round(float(change_pct), 2)
        }
    except Exception as e:
        print(f"Error fetching yfinance price for {symbol}: {e}")
        return None

async def _update_prices_loop():
    """Background loop to fetch yfinance data sequentially without exhausting threads."""
    while True:
        for symbol in SUPPORTED_SYMBOLS:
            try:
                # Fetch one by one with a tiny delay to respect rate limits
                data = await asyncio.to_thread(_fetch_yf_price_sync, symbol)
                if data:
                    _price_cache[symbol] = data
            except Exception as e:
                print(f"Error in background update for {symbol}: {e}")
            await asyncio.sleep(1) # sleep 1 second between symbols
        
        # After a full cycle, wait 30 seconds before polling again
        await asyncio.sleep(30)

def start_market_updater():
    """Start the background task. Called by FastAPI startup event."""
    asyncio.create_task(_update_prices_loop())

import random

def _apply_jitter(price: float) -> float:
    """Apply a random micro-jitter (+-0.05%) to simulate a live market tick."""
    jitter_pct = random.uniform(-0.0005, 0.0005)
    return round(price * (1 + jitter_pct), 2)

async def get_price(symbol: str) -> Optional[dict]:
    """Get real-time price instantly from cache, with simulated jitter."""
    symbol = symbol.upper()
    if symbol not in SUPPORTED_SYMBOLS:
        return None
    
    cached = _price_cache.get(symbol)
    if not cached:
        return None
        
    return {
        "symbol": cached["symbol"],
        "price": _apply_jitter(cached["price"]),
        "change_percent": cached["change_percent"]
    }

async def get_all_prices() -> List[dict]:
    """Get all prices instantly from cache, with simulated jitter."""
    result = []
    for cached in _price_cache.values():
        result.append({
            "symbol": cached["symbol"],
            "price": _apply_jitter(cached["price"]),
            "change_percent": cached["change_percent"]
        })
    return result

def get_historical_data_sync(symbol: str, period: str = "1mo", interval: str = "1d") -> List[dict]:
    """Fetch historical OHLCV data using yfinance."""
    yf_symbol = YF_SYMBOL_MAP.get(symbol.upper())
    if not yf_symbol:
        return []
    try:
        stock = yf.Ticker(yf_symbol)
        hist = stock.history(period=period, interval=interval)
        if hist.empty:
            return []
            
        data = []
        for index, row in hist.iterrows():
            data.append({
                "time": int(index.timestamp()),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume'])
            })
        return data
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        return []
