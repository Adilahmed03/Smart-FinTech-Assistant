from fastapi import APIRouter

router = APIRouter(prefix="/api/learning", tags=["Learning"])

COURSES = [
    {
        "id": 1,
        "category": "Fundamentals",
        "modules": [
            {"title": "Introduction to Stock Markets", "duration": "15 min", "content": "Stock markets are centralized exchanges where buyers and sellers trade securities..."},
            {"title": "Understanding Market Orders", "duration": "12 min", "content": "Market orders execute immediately at the best available price..."},
            {"title": "Reading Financial Statements", "duration": "20 min", "content": "Financial statements consist of the balance sheet, income statement, and cash flow statement..."},
            {"title": "Valuation Methods (P/E, P/B, DCF)", "duration": "25 min", "content": "Price-to-Earnings (P/E) ratio compares a company's stock price to its earnings per share..."},
        ],
    },
    {
        "id": 2,
        "category": "Technical Analysis",
        "modules": [
            {"title": "Candlestick Patterns Explained", "duration": "18 min", "content": "Candlestick charts display the open, high, low, and close prices for each period..."},
            {"title": "Support & Resistance Levels", "duration": "14 min", "content": "Support levels are price points where buying pressure historically prevents further decline..."},
            {"title": "Moving Averages (SMA, EMA)", "duration": "16 min", "content": "Simple Moving Average (SMA) calculates the arithmetic mean of prices over a period..."},
            {"title": "RSI, MACD and Bollinger Bands", "duration": "22 min", "content": "The Relative Strength Index (RSI) measures the speed and magnitude of price changes..."},
        ],
    },
    {
        "id": 3,
        "category": "Risk Management",
        "modules": [
            {"title": "Position Sizing Strategies", "duration": "10 min", "content": "Position sizing determines how much capital to allocate to each trade..."},
            {"title": "Stop-Loss & Take-Profit", "duration": "12 min", "content": "Stop-loss orders automatically sell a security when it reaches a certain price..."},
            {"title": "Portfolio Diversification", "duration": "15 min", "content": "Diversification spreads risk across different asset classes, sectors, and geographies..."},
            {"title": "Managing Drawdowns", "duration": "14 min", "content": "A drawdown measures the peak-to-trough decline in portfolio value..."},
        ],
    },
]


@router.get("/courses")
async def get_courses():
    """Get all available learning courses."""
    return {"courses": COURSES}


@router.get("/courses/{course_id}")
async def get_course(course_id: int):
    """Get a specific course by ID."""
    for course in COURSES:
        if course["id"] == course_id:
            return {"course": course}
    return {"error": "Course not found"}
