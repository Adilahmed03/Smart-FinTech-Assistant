"""Paper trading models – Portfolio, Holding, Trade.

All state is persisted to Redis keyed by user_id so each user gets
an isolated paper trading environment.
"""

from __future__ import annotations

import json
import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import Literal


INITIAL_CASH = 100_000.00  # INR


# ── Dataclasses ─────────────────────────────────────────────────────────────

@dataclass
class Holding:
    symbol: str
    quantity: float
    avg_buy_price: float

    def market_value(self, current_price: float) -> float:
        return self.quantity * current_price


@dataclass
class Trade:
    id: str
    symbol: str
    type: Literal["BUY", "SELL"]
    quantity: float
    price: float
    timestamp: str  # ISO-style or HH:MM:SS
    total: float = 0.0

    def __post_init__(self):
        self.total = round(self.quantity * self.price, 2)


@dataclass
class Portfolio:
    user_id: str
    cash_balance: float = INITIAL_CASH
    holdings: dict[str, Holding] = field(default_factory=dict)
    trades: list[Trade] = field(default_factory=list)

    # ── Serialisation helpers ───────────────────────────────────────────

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "cash_balance": round(self.cash_balance, 2),
            "holdings": [
                {"symbol": h.symbol, "quantity": h.quantity, "avg_buy_price": round(h.avg_buy_price, 2)}
                for h in self.holdings.values()
                if h.quantity > 0
            ],
            "trades": [asdict(t) for t in self.trades],
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict())

    @classmethod
    def from_dict(cls, data: dict) -> Portfolio:
        holdings = {
            h["symbol"]: Holding(symbol=h["symbol"], quantity=h["quantity"], avg_buy_price=h["avg_buy_price"])
            for h in data.get("holdings", [])
        }
        trades = [
            Trade(
                id=t["id"],
                symbol=t["symbol"],
                type=t["type"],
                quantity=t["quantity"],
                price=t["price"],
                timestamp=t["timestamp"],
                total=t.get("total", 0),
            )
            for t in data.get("trades", [])
        ]
        return cls(
            user_id=data["user_id"],
            cash_balance=data.get("cash_balance", INITIAL_CASH),
            holdings=holdings,
            trades=trades,
        )

    @classmethod
    def from_json(cls, raw: str) -> Portfolio:
        return cls.from_dict(json.loads(raw))

    # ── Trading logic ───────────────────────────────────────────────────

    def buy(self, symbol: str, quantity: float, price: float) -> Trade:
        """Execute a BUY. Raises ValueError on insufficient cash."""
        cost = round(quantity * price, 2)
        if cost > self.cash_balance:
            raise ValueError(
                f"Insufficient cash. Required ₹{cost:,.2f}, available ₹{self.cash_balance:,.2f}"
            )

        self.cash_balance = round(self.cash_balance - cost, 2)

        if symbol in self.holdings:
            h = self.holdings[symbol]
            new_qty = h.quantity + quantity
            h.avg_buy_price = round(
                ((h.avg_buy_price * h.quantity) + cost) / new_qty, 2
            )
            h.quantity = new_qty
        else:
            self.holdings[symbol] = Holding(symbol=symbol, quantity=quantity, avg_buy_price=price)

        trade = Trade(
            id=uuid.uuid4().hex[:12],
            symbol=symbol,
            type="BUY",
            quantity=quantity,
            price=price,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%S"),
        )
        self.trades.insert(0, trade)
        return trade

    def sell(self, symbol: str, quantity: float, price: float) -> Trade:
        """Execute a SELL. Raises ValueError if not enough shares."""
        h = self.holdings.get(symbol)
        if h is None or h.quantity < quantity:
            owned = h.quantity if h else 0
            raise ValueError(
                f"Insufficient holdings. Own {owned} of {symbol}, tried to sell {quantity}"
            )

        proceeds = round(quantity * price, 2)
        self.cash_balance = round(self.cash_balance + proceeds, 2)

        h.quantity -= quantity
        if h.quantity == 0:
            del self.holdings[symbol]

        trade = Trade(
            id=uuid.uuid4().hex[:12],
            symbol=symbol,
            type="SELL",
            quantity=quantity,
            price=price,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%S"),
        )
        self.trades.insert(0, trade)
        return trade
