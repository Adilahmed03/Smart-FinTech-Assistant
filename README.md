# Smart FinTech Assistant

AI-powered trading terminal with paper trading, portfolio analytics, financial learning, and Gemini-driven insights.

![TradingView-style dark terminal UI](https://img.shields.io/badge/UI-TradingView%20Style-0a0e17?style=for-the-badge&labelColor=111827)

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React 19 + Vite + TailwindCSS v4 |
| Charts    | Lightweight Charts (TradingView)  |
| Backend   | FastAPI (Python 3.11+)            |
| Cache     | Redis                             |
| AI Engine | Google Gemini API                 |

## Features

- 📊 **Professional Trading Terminal** – dark theme, candlestick charts, watchlist
- 📝 **Paper Trading Simulator** – place buy/sell orders with virtual funds
- 📈 **Portfolio Analytics** – allocation breakdown, P&L tracking
- 🤖 **AI Financial Insights** – Gemini-powered market analysis & chat
- 📚 **Financial Learning Center** – structured courses with progress tracking

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Redis** server running locally
- **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone & Configure

```bash
cd smart-fintech-assistant
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

> [!IMPORTANT]
> Never commit your `.env` file to Git. The `.gitignore` file is configured to prevent this.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**  
API docs at **http://localhost:8000/docs**

### 4. Redis

```bash
# Windows (if installed via Chocolatey / Memurai)
redis-server
```

## Project Structure

```
smart-fintech-assistant/
├── .env.example
├── README.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       └── components/
│           ├── TopNav.jsx
│           ├── Watchlist.jsx
│           ├── ChartPanel.jsx
│           ├── TradePanel.jsx
│           ├── PortfolioPanel.jsx
│           ├── TradeHistory.jsx
│           ├── LearningModule.jsx
│           └── AIInsights.jsx
└── backend/
    ├── main.py
    ├── requirements.txt
    ├── core/
    │   ├── config.py
    │   ├── redis_client.py
    │   └── gemini_client.py
    └── api/
        ├── ai_routes.py
        ├── trading_routes.py
        └── learning_routes.py
```

## API Endpoints

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/api/health`                     | Health check                   |
| POST   | `/api/ai/chat`                    | Chat with AI advisor           |
| POST   | `/api/ai/analyze-portfolio`       | AI portfolio analysis          |
| GET    | `/api/ai/market-analysis/{sym}`   | AI market analysis per symbol  |
| POST   | `/api/trading/order`              | Place paper trade              |
| GET    | `/api/trading/balance`            | Paper trading balance          |
| GET    | `/api/trading/trades`             | Trade history                  |
| GET    | `/api/trading/holdings`           | Current holdings               |
| GET    | `/api/learning/courses`           | List learning courses          |
| GET    | `/api/learning/courses/{id}`      | Get course details             |

## License

MIT
