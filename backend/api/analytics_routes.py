"""Portfolio analytics API route."""

from fastapi import APIRouter, Request, HTTPException
from core.redis_client import get_redis
from models.portfolio import Portfolio, INITIAL_CASH
from models.analytics import compute_analytics

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio Analytics"])

PORTFOLIO_KEY = "portfolio:{user_id}"


def _require_user(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.id


async def _load_portfolio(user_id: str) -> Portfolio:
    redis = await get_redis()
    raw = await redis.get(PORTFOLIO_KEY.format(user_id=user_id))
    if raw:
        return Portfolio.from_json(raw)
    return Portfolio(user_id=user_id, cash_balance=INITIAL_CASH)


@router.get("/analytics")
async def portfolio_analytics(request: Request):
    """Return comprehensive portfolio analytics for the authenticated user."""
    user_id = _require_user(request)
    portfolio = await _load_portfolio(user_id)
    return await compute_analytics(portfolio)
