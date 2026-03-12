import json
import google.generativeai as genai
from core.config import settings

# Configure the model using centralized settings
genai.configure(api_key=settings.GEMINI_API_KEY)
_model = genai.GenerativeModel(settings.GEMINI_MODEL)


async def generate_financial_insight(prompt: str) -> str:
    """Send a prompt to the configured Gemini model and return the text response."""
    try:
        response = _model.generate_content(prompt)
        return response.text
    except Exception as exc:
        err_msg = str(exc)
        if "API_KEY_INVALID" in err_msg:
            return "AI Error: Invalid API Key. Please check your .env file."
        if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
            return "AI Error: Free Tier Quota Exhausted. Please wait a minute and try again."
        if "404" in err_msg:
             return f"AI Error: Model {settings.GEMINI_MODEL} not found. Please verify GEMINI_MODEL in .env."
             
        # Log the error for backend debugging
        import logging
        logging.getLogger(__name__).error(f"Gemini API failure: {err_msg}")
        return f"AI insight temporarily unavailable. Error: {err_msg}"


async def analyze_portfolio(holdings: list[dict]) -> str:
    """Generate AI-powered portfolio analysis."""
    prompt = (
        "You are a professional financial analyst AI. Analyze the following portfolio "
        "holdings and provide actionable insights including risk assessment, "
        "diversification suggestions, and market outlook.\n\n"
        f"Holdings:\n{json.dumps(holdings, indent=2)}\n\n"
        "Provide a structured analysis with sections: "
        "1) Portfolio Summary, 2) Risk Assessment, 3) Recommendations."
    )
    return await generate_financial_insight(prompt)


async def get_market_analysis(symbol: str) -> str:
    """Generate AI market analysis for a specific symbol."""
    prompt = (
        f"You are a professional financial analyst AI. Provide a comprehensive "
        f"technical and fundamental analysis of {symbol}. Include:\n"
        f"1) Current market sentiment\n"
        f"2) Key technical levels (support/resistance)\n"
        f"3) Fundamental outlook\n"
        f"4) Risk factors\n"
        f"5) Short-term and long-term price targets\n"
        f"Keep the analysis concise and actionable."
    )
    return await generate_financial_insight(prompt)
