"""Market data API routes."""

from fastapi import APIRouter, HTTPException, Query
from models.market import get_price, get_all_prices, SUPPORTED_SYMBOLS, get_historical_data_sync
import asyncio

router = APIRouter(prefix="/api/market", tags=["Market Data"])


@router.get("/price/{symbol}")
async def market_price(symbol: str):
    """Get the current live price for a symbol via yfinance."""
    data = await get_price(symbol.upper())
    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Symbol '{symbol.upper()}' not found. Supported: {', '.join(SUPPORTED_SYMBOLS)}",
        )
    return data


@router.get("/prices")
async def all_prices():
    """Get live prices for all supported demo stocks."""
    prices = await get_all_prices()
    return {"prices": prices}


@router.get("/symbols")
async def list_symbols():
    """List all supported demo symbols."""
    return {"symbols": SUPPORTED_SYMBOLS}


@router.get("/history/{symbol}")
async def market_history(
    symbol: str,
    period: str = Query("1mo", description="yfinance period like 1d, 5d, 1mo, 3mo, 1y"),
    interval: str = Query("1d", description="yfinance interval like 1m, 5m, 1h, 1d")
):
    """Get historical OHLCV chart data for a symbol via yfinance."""
    symbol = symbol.upper()
    if symbol not in SUPPORTED_SYMBOLS:
        raise HTTPException(
            status_code=404,
            detail=f"Symbol '{symbol}' not found. Supported: {', '.join(SUPPORTED_SYMBOLS)}",
        )
        
    data = await asyncio.to_thread(get_historical_data_sync, symbol, period, interval)
    if not data:
        raise HTTPException(status_code=500, detail=f"Could not fetch historical data for {symbol}.")
        
    return {"symbol": symbol, "data": data}
