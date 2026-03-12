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


import hashlib

@router.post("/chat")
async def ai_chat(req: ChatRequest):
    """Chat with the AI financial advisor."""
    # Stable cache key using MD5 instead of volatile hash()
    msg_hash = hashlib.md5(req.message.encode()).hexdigest()
    cache_key = f"ai:chat:{msg_hash}:{req.symbol or 'global'}"
    
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

    # Cache for 20 minutes (longer cache to save quota)
    await redis.setex(cache_key, 1200, response)
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


@router.get("/debug-models")
async def debug_models():
    """Diagnostic endpoint to check API key and available Gemini models."""
    import google.generativeai as genai
    from core.config import settings
    import os

    try:
        # 1. Verify API Key Load
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return {"error": "GEMINI_API_KEY not configured in environment"}

        # 2. Initialize SDK
        genai.configure(api_key=api_key)

        # 3. List and 4. Filter usable models
        available_models = []
        usable_models = []
        
        for m in genai.list_models():
            model_info = {
                "name": m.name,
                "methods": m.supported_generation_methods,
                "display_name": m.display_name
            }
            available_models.append(model_info)
            if "generateContent" in m.supported_generation_methods:
                usable_models.append(m.name)

        # 5. Test Model Call
        test_result = {
            "tested_model": None,
            "test_response": None,
            "error": None
        }

        if usable_models:
            # Try the configured model first, fallback to first usable if not in list
            model_to_test = settings.GEMINI_MODEL if settings.GEMINI_MODEL in usable_models else usable_models[0]
            test_result["tested_model"] = model_to_test
            try:
                model = genai.GenerativeModel(model_to_test)
                # Short timeout/simple probe
                response = model.generate_content("Hello. Respond with OK.")
                test_result["test_response"] = response.text
            except Exception as test_ex:
                test_result["error"] = str(test_ex)

        return {
            "api_key_status": "Loaded (masked: " + api_key[:4] + "..." + api_key[-4:] + ")" if len(api_key) > 8 else "Loaded",
            "available_models_count": len(available_models),
            "usable_models": usable_models,
            "all_models": available_models,
            "test_call": test_result
        }

    except Exception as e:
        return {
            "error": "Gemini API diagnostic failed",
            "details": str(e)
        }
