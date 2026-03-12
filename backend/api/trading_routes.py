"""Paper trading API endpoints.

All endpoints are scoped per-user via the session middleware.
Portfolio state is persisted to Redis as a single JSON blob per user.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from core.redis_client import get_redis
from models.portfolio import Portfolio, INITIAL_CASH
from models.analytics import append_historical_snapshot

router = APIRouter(prefix="/api/trade", tags=["Paper Trading"])

PORTFOLIO_KEY = "portfolio:{user_id}"


# ── Request schemas ─────────────────────────────────────────────────────────

class TradeRequest(BaseModel):
    symbol: str
    quantity: float
    price: float


# ── Helpers ─────────────────────────────────────────────────────────────────

def _require_user(request: Request) -> str:
    """Extract authenticated user_id or raise 401."""
    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.id


async def _load_portfolio(user_id: str) -> Portfolio:
    """Load portfolio from Redis (or create a fresh one)."""
    redis = await get_redis()
    raw = await redis.get(PORTFOLIO_KEY.format(user_id=user_id))
    if raw:
        return Portfolio.from_json(raw)
    return Portfolio(user_id=user_id, cash_balance=INITIAL_CASH)


async def _save_portfolio(portfolio: Portfolio):
    """Persist portfolio to Redis."""
    redis = await get_redis()
    await redis.set(PORTFOLIO_KEY.format(user_id=portfolio.user_id), portfolio.to_json())


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/buy")
async def buy(body: TradeRequest, request: Request):
    """Place a BUY order. Validates sufficient cash before executing."""
    user_id = _require_user(request)
    portfolio = await _load_portfolio(user_id)

    try:
        trade = portfolio.buy(body.symbol.upper(), body.quantity, body.price)
        await append_historical_snapshot(portfolio)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    await _save_portfolio(portfolio)

    return {
        "trade": {
            "id": trade.id,
            "symbol": trade.symbol,
            "type": trade.type,
            "quantity": trade.quantity,
            "price": trade.price,
            "total": trade.total,
            "timestamp": trade.timestamp,
        },
        "portfolio": {
            "cash_balance": portfolio.cash_balance,
            "holdings": [
                {"symbol": h.symbol, "quantity": h.quantity, "avg_buy_price": h.avg_buy_price}
                for h in portfolio.holdings.values()
            ],
        },
    }


@router.post("/sell")
async def sell(body: TradeRequest, request: Request):
    """Place a SELL order. Validates sufficient holdings before executing."""
    user_id = _require_user(request)
    portfolio = await _load_portfolio(user_id)

    try:
        trade = portfolio.sell(body.symbol.upper(), body.quantity, body.price)
        await append_historical_snapshot(portfolio)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    await _save_portfolio(portfolio)

    return {
        "trade": {
            "id": trade.id,
            "symbol": trade.symbol,
            "type": trade.type,
            "quantity": trade.quantity,
            "price": trade.price,
            "total": trade.total,
            "timestamp": trade.timestamp,
        },
        "portfolio": {
            "cash_balance": portfolio.cash_balance,
            "holdings": [
                {"symbol": h.symbol, "quantity": h.quantity, "avg_buy_price": h.avg_buy_price}
                for h in portfolio.holdings.values()
            ],
        },
    }


@router.get("/portfolio")
async def get_portfolio(request: Request):
    """Return the user's full portfolio state."""
    user_id = _require_user(request)
    portfolio = await _load_portfolio(user_id)
    return portfolio.to_dict()


@router.get("/trades")
async def get_trades(request: Request):
    """Return the user's trade history (most recent first)."""
    user_id = _require_user(request)
    portfolio = await _load_portfolio(user_id)
    return {
        "trades": [
            {
                "id": t.id,
                "symbol": t.symbol,
                "type": t.type,
                "quantity": t.quantity,
                "price": t.price,
                "total": t.total,
                "timestamp": t.timestamp,
            }
            for t in portfolio.trades
        ]
    }
