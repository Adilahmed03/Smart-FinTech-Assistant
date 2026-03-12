"""AI insight service – builds rich prompts for Gemini from portfolio data."""

import json
from core.gemini_client import generate_financial_insight
from models.portfolio import Portfolio
from models.analytics import compute_analytics


async def generate_portfolio_insight(portfolio: Portfolio) -> str:
    """Generate beginner-friendly portfolio insight using Gemini.

    Feeds Gemini the full analytics snapshot including:
    - portfolio metrics (value, P&L, return %)
    - individual holdings with current prices
    - asset allocation weights
    - diversification score
    - recent trades (last 10)
    """
    analytics = compute_analytics(portfolio)

    # Build a context block for the prompt
    holdings_summary = "\n".join(
        f"  • {a['symbol']}: {a['quantity']} shares, "
        f"avg buy ₹{a['avg_buy_price']}, current ₹{a['current_price']}, "
        f"P&L ₹{a['pnl']} ({a['weight']}% of portfolio)"
        for a in analytics["asset_allocation"]
    ) or "  (no holdings yet)"

    recent_trades = "\n".join(
        f"  • {t.type} {t.quantity} × {t.symbol} @ ₹{t.price} on {t.timestamp}"
        for t in portfolio.trades[:10]
    ) or "  (no trades yet)"

    largest = analytics["largest_position"]
    largest_text = (
        f"{largest['symbol']} at {largest['weight']}% of portfolio"
        if largest else "N/A"
    )

    prompt = f"""You are a friendly, beginner-focused financial advisor AI.
Analyze the following portfolio and provide clear, actionable insights.
Use simple language a first-time investor would understand.

═══ PORTFOLIO METRICS ═══
Portfolio Value:        ₹{analytics['portfolio_value']:,.2f}
Cash Balance:           ₹{analytics['cash_balance']:,.2f}
Invested Amount:        ₹{analytics['invested_amount']:,.2f}
Profit / Loss:          ₹{analytics['profit_loss']:,.2f}
Return Percentage:      {analytics['return_percentage']}%
Holdings Count:         {analytics['holdings_count']}
Diversification Score:  {analytics['diversification_score']} (0=concentrated, 1=diversified)
Largest Position:       {largest_text}

═══ HOLDINGS ═══
{holdings_summary}

═══ RECENT TRADES (last 10) ═══
{recent_trades}

═══ INSTRUCTIONS ═══
Please provide a structured insight covering:

1. **Portfolio Risk Level** – Is the portfolio conservative, moderate, or aggressive?
   Explain why based on the holdings and allocation.

2. **Diversification Quality** – Rate the diversification (poor / fair / good / excellent).
   Suggest specific improvements if needed.

3. **Beginner-Friendly Advice** – 3 concrete, actionable tips the user should consider next.
   Keep language simple. Avoid jargon unless you explain it.

4. **Summary** – A one-paragraph overall assessment.

Format your response in clean markdown with headers."""

    return await generate_financial_insight(prompt)
