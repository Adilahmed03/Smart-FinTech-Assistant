import time
import uuid
from models.user import create_user, get_user_by_email, hash_password
from models.portfolio import Portfolio, Holding, Trade
from core.redis_client import get_redis

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "demo_password_123"
PORTFOLIO_KEY = "portfolio:{user_id}"

async def seed_demo_data():
    """Initializes a demo user with a pre-populated portfolio."""
    # 1. Create Demo User if not exists
    user = get_user_by_email(DEMO_EMAIL)
    if not user:
        user = create_user(DEMO_EMAIL, DEMO_PASSWORD)
        print(f"DEBUG: Created demo user: {DEMO_EMAIL}")
    
    if not user:
        return # Should not happen unless email collision logic fails

    user_id = user.id
    redis = await get_redis()
    
    # 2. Check if portfolio already exists to avoid redundant seeding
    existing = await redis.get(PORTFOLIO_KEY.format(user_id=user_id))
    if existing:
        print("DEBUG: Demo portfolio already exists in Redis.")
        return

    # 3. Initialize Demo Portfolio
    # ₹100,000 Initial Cash
    portfolio = Portfolio(user_id=user_id, cash_balance=100000.0)
    
    # 4. Seed Holdings (Manual injection to avoid validation errors for demo)
    portfolio.holdings = {
        "INFY": Holding(symbol="INFY", quantity=25, avg_buy_price=1450.20),
        "AAPL": Holding(symbol="AAPL", quantity=10, avg_buy_price=175.50),
        "BTC-USD": Holding(symbol="BTC-USD", quantity=0.5, avg_buy_price=42000.00),
    }
    
    # 5. Seed Trade History
    sample_trades = [
        Trade(id=uuid.uuid4().hex[:12], symbol="BTC-USD", type="BUY", quantity=0.5, price=42000.0, timestamp=time.strftime("%Y-%m-%dT09:00:00")),
        Trade(id=uuid.uuid4().hex[:12], symbol="AAPL", type="BUY", quantity=10, price=175.5, timestamp=time.strftime("%Y-%m-%dT10:15:00")),
        Trade(id=uuid.uuid4().hex[:12], symbol="INFY", type="BUY", quantity=30, price=1440.0, timestamp=time.strftime("%Y-%m-%dT11:30:00")),
        Trade(id=uuid.uuid4().hex[:12], symbol="INFY", type="SELL", quantity=5, price=1510.0, timestamp=time.strftime("%Y-%m-%dT14:45:00")),
    ]
    portfolio.trades = sample_trades
    
    # Update cash balance after fake trades
    # Start: 100k
    # Buy BTC: -21k -> 79k
    # Buy AAPL: -1755 -> 77245
    # Buy INFY: -43.2k -> 34045
    # Sell INFY: +7.55k -> 41595
    portfolio.cash_balance = 41595.0
    
    # 6. Save to Redis
    await redis.set(PORTFOLIO_KEY.format(user_id=user_id), portfolio.to_json())
    print(f"DEBUG: Demo data seeded for {user_id}")
