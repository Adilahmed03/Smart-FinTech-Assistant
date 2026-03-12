"""Portfolio analytics – compute metrics from holdings + live market prices."""

from __future__ import annotations
from models.portfolio import Portfolio
from models.market import get_price, SUPPORTED_SYMBOLS


def compute_analytics(portfolio: Portfolio) -> dict:
    """Return a full analytics snapshot for the given portfolio.

    Metrics
    -------
    portfolio_value        sum(qty × current_price) + cash
    invested_amount        sum(qty × avg_buy_price)
    profit_loss            portfolio_value − invested_amount − cash  (holdings-only P&L)
    return_percentage      (profit_loss / invested_amount) × 100
    asset_allocation       [{ symbol, value, weight }]
    largest_position       { symbol, value, weight }
    diversification_score  1 − HHI  (0 = concentrated, 1 = perfectly spread)
    """

    holdings = list(portfolio.holdings.values())
    cash = portfolio.cash_balance

    # ── Per-holding valuation ───────────────────────────────────────────
    allocation: list[dict] = []
    total_market_value = 0.0
    invested_amount = 0.0

    for h in holdings:
        if h.quantity <= 0:
            continue
        # Try to get a live simulated price; fall back to avg_buy_price
        market = get_price(h.symbol)
        current_price = market["price"] if market else h.avg_buy_price

        value = round(h.quantity * current_price, 2)
        cost = round(h.quantity * h.avg_buy_price, 2)
        total_market_value += value
        invested_amount += cost

        allocation.append({
            "symbol": h.symbol,
            "quantity": h.quantity,
            "avg_buy_price": h.avg_buy_price,
            "current_price": current_price,
            "value": value,
            "cost": cost,
            "pnl": round(value - cost, 2),
            "weight": 0.0,  # filled below
        })

    portfolio_value = round(total_market_value + cash, 2)
    invested_amount = round(invested_amount, 2)
    profit_loss = round(total_market_value - invested_amount, 2)
    return_pct = round((profit_loss / invested_amount) * 100, 2) if invested_amount else 0.0

    # ── Weights (as proportion of total portfolio value) ────────────────
    for item in allocation:
        item["weight"] = round((item["value"] / portfolio_value) * 100, 2) if portfolio_value else 0.0

    # Sort by value descending
    allocation.sort(key=lambda x: x["value"], reverse=True)

    # ── Largest position ────────────────────────────────────────────────
    largest_position = None
    if allocation:
        top = allocation[0]
        largest_position = {
            "symbol": top["symbol"],
            "value": top["value"],
            "weight": top["weight"],
        }

    # ── Diversification score (1 − HHI) ────────────────────────────────
    # HHI = sum of squared weights (normalised 0-1)
    if allocation and portfolio_value:
        weights = [a["value"] / portfolio_value for a in allocation]
        hhi = sum(w ** 2 for w in weights)
        diversification_score = round(1 - hhi, 4)
    else:
        diversification_score = 0.0

    return {
        "portfolio_value": portfolio_value,
        "cash_balance": cash,
        "invested_amount": invested_amount,
        "profit_loss": profit_loss,
        "return_percentage": return_pct,
        "asset_allocation": allocation,
        "largest_position": largest_position,
        "diversification_score": diversification_score,
        "holdings_count": len(allocation),
    }
