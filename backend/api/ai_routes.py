from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from core.gemini_client import generate_financial_insight, analyze_portfolio, get_market_analysis
from core.redis_client import get_redis
from services.ai_insight_service import generate_portfolio_insight
from api.trading_routes import _require_user, _load_portfolio

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])


class ChatRequest(BaseModel):
    message: str
    symbol: str | None = None


class PortfolioAnalysisRequest(BaseModel):
    holdings: list[dict]


@router.post("/chat")
async def ai_chat(req: ChatRequest):
    """Chat with the AI financial advisor."""
    cache_key = f"ai:chat:{hash(req.message)}"
    redis = await get_redis()

    # Check cache
    cached = await redis.get(cache_key)
    if cached:
        return {"response": cached, "cached": True}

    context = f"User is asking about {req.symbol}. " if req.symbol else ""
    prompt = (
        "You are a professional financial advisor AI assistant. "
        "Provide clear, actionable financial guidance. "
        f"{context}User question: {req.message}"
    )
    response = await generate_financial_insight(prompt)

    # Cache for 5 minutes
    await redis.setex(cache_key, 300, response)
    return {"response": response, "cached": False}


@router.post("/analyze-portfolio")
async def portfolio_analysis(req: PortfolioAnalysisRequest):
    """(Legacy) Basic AI-powered portfolio analysis."""
    response = await analyze_portfolio(req.holdings)
    return {"analysis": response}


@router.post("/portfolio-insight")
async def portfolio_insight(request: Request):
    """Generate comprehensive AI portfolio insight using live user data."""
    user_id = _require_user(request)
    portfolio = await _load_portfolio(user_id)
    
    insight_text = await generate_portfolio_insight(portfolio)
    return {"insight_text": insight_text}


@router.get("/market-analysis/{symbol}")
async def market_analysis(symbol: str):
    """AI-powered market analysis for a symbol."""
    cache_key = f"ai:market:{symbol}"
    redis = await get_redis()

    cached = await redis.get(cache_key)
    if cached:
        return {"analysis": cached, "cached": True}

    response = await get_market_analysis(symbol)
    await redis.setex(cache_key, 600, response)
    return {"analysis": response, "cached": False}
